
function GameObject(model){
	this.symbol = model.symbol;
	this.font = model.font;
	this.color = model.color;
	this.controlled = model.controlled;
	this.x = model.x;
	this.y = model.y;
	this.dx = model.dx || 0;
	this.dy = model.dy || 0;
	this.ddx = 0;
	this.ddy = 0;
	this.maxDX = model.maxDX || data.maxDX;
	this.maxDY = model.maxDY || data.maxDY;
	this.facing = model.facing || 1;
	this.falling = 0;			//is not supported by a tile. this property is a frame counter
	this.enemy = model.enemy;
	this.flight = model.flight;
	this.ai = model.ai;
	this.id = Math.floor(Math.random() * 10000);
	this.collides = typeof model.collides != "undefined" ? model.collides : true;	//expect a function here, for hasCollision and onCollide
	//this.collisionType = model.collisionType;
	//default to falsey, but are used:
	//this.jumping = false
	//this.attacking = false;
	//this.dashing = false;		//this expects an object containing a dx and dy and a frame counter
	//this.cull = false;		//set to true to cull this object at the end of the frame
	
	this.update = function(){
		//state
		if (this.iFrames) this.iFrames--;
		if (this.y > 15*32*2) this.cull = true;
	
		//CONTROLS
		this.left = this.right = this.up = this.down = this.dash = false;
		
		if (this.controlled && !this.dashing){
			this.left = data.keys["ArrowLeft"];
			this.right = data.keys["ArrowRight"];
			this.up = data.keys["ArrowUp"];
			this.down = data.keys["ArrowDown"];
			this.dash = data.keys["KeyZ"];
			this.attack = data.keys["KeyX"];
			if (this.dashed) this.dash = false;	//can't double dash
		}
		
		// AI
		
		if (this.ai){
			data.aiDefs[this.ai](this);
		}
		
		//ACCELERATION AND MOVEMENT
		
		var wasleft = this.dx < 0;
		var wasright = this.dx > 0;
		var falling = this.falling;
		
		this.ddx = 0;				//reset accelerations, ddx is zero unless controlled
		if (!this.flight && !this.dashing){
			this.ddy = 0.9			//ddy includes gravity
		} else {
			this.ddy = 0;
		}
		
		//control handling
		
		if (this.dash && data.unlocks.dash.unlocked){
			if (!this.dashing){
				var dashDX = 0;
				if (this.left) dashDX--;
				if (this.right) dashDX++;
				var dashDY = 0;
				if (this.up) dashDY--;
				if (this.down) dashDY++;
				if (dashDX || dashDY){			//can't dash in place
					this.dashing = { dx:dashDX, dy:dashDY, frameCount:0, dashFrames:[] };
					this.dashed = true;
					playSFX("dash")
				}
			}
		}
		if (!this.dashing){				//no regular control while dashing
			if (this.left) {			//handle accelerations due to player control, and also friction
				this.ddx -= this.maxDX/20;
				this.facing = -1;
			} else if (wasleft){
				if (this.jumping || falling){
					this.ddx += this.maxDX/60;
				} else {
					this.ddx += this.maxDX/10;
				}
			}
			if (this.right) {
				this.ddx += this.maxDX/20;
				this.facing = 1;
			} else if (wasright){
				if (this.jumping || falling){
					this.ddx -= this.maxDX/60;
				} else {
					this.ddx -= this.maxDX/10;
				}
			}
			if (this.up){								//enable jump impulse
				if (!this.flight && !this.jumping && falling < 10){
					this.ddy -= 50;
					this.jumping = true;
					playSFX("jump")
				} else if (this.jumping) {	//jump control
					this.ddy -= 0.4;
					if (data.unlocks.glide.unlocked && this.dy > 0) this.ddy -= 0.4;
				} else if (this.flight) {
					this.ddy -= this.maxDY/20;
				}
			}
			if (this.down){
				//does nothing for the player
				if (this.flight) this.ddy += this.maxDY/20
			}
		} else {
			this.dashing.dashFrames.push({x:this.x+0,y:this.y+0,frameNumber:this.dashing.frameCount+0});
			this.dx = this.dashing.dx * 25;
			this.dy = this.dashing.dy * 25;
			this.dashing.frameCount++;
			if (this.dashing.frameCount >= 6){
				this.dashing = false;
				this.dx = 0;			//halt at dash end
				this.dy = 0;
			}
		}
		
		//attacking
		
		if (this.attack && !this.attacking){
			var dx = this.facing;	//must have a horizontal component
			var dy = (this.down) ? 1 : (this.up) ? -1 : 0;
			this.attacking = { dx:dx, dy:dy, frameCount:0 };
			data.keys["KeyX"] = false;
			playSFX("attack")
		} else if (this.attacking) {
			this.attacking.frameCount++;
			if (this.attacking.frameCount >= 24) this.attacking = false;
		}
		
		//MOVEMENT
		
		this.y = Math.floor(this.y + this.dy);		//move the object according to dx and dy
		this.x = Math.floor(this.x + this.dx);
		
		this.dx = this.dx + this.ddx;				//update dx/dy with accelerations according to ddx and ddy
		if (!this.dashing){
			if (this.dx > this.maxDX) this.dx = this.maxDX;					//clamp to max values, but only while not dashing
			if (this.dx < this.maxDX*-1) this.dx = this.maxDX*-1;
			this.dy = this.dy + this.ddy;
			if (this.dy > this.maxDY) this.dy = this.maxDY;
			if (this.dy < this.maxDY*-1) this.dy = this.maxDY*-1;
		}
		
		if ((wasleft && (this.dx > 0)) || (wasright && (this.dx < 0))) this.dx = 0;	//prevent friction wobble that happens when dx values are very low
		
		
		//COLLISON DETECTION AND HANDLING
		
		//map collision
		//inspired by https://codeincomplete.com/articles/tiny-platformer/
		//huge thanks to @jakesgordon for that tutorial
		
		if (this.collides){
			var ty = Math.floor(this.y/32);
			var tx = Math.floor(this.x/32);
			var ny = this.y%32;
			var nx = this.x%32;
			var m = getCurrentMap();
			var cell = m.layout[ty] ? m.layout[ty][tx] : true;
				if (tx < 0) cell = true;
			var cellright = m.layout[ty] ? m.layout[ty][tx+1] : true;
				if (tx+2 > 20) cellright = true;
			var celldown = m.layout[ty+1] ? m.layout[ty+1][tx] : true;
				if (tx < 0) celldown = true;
			var celldiag = m.layout[ty+1] ? m.layout[ty+1][tx+1] : true;
				if (tx+2 > 20) celldiag = true;
			
			if (this.dy > 0){
				if ((celldown && !cell) ||					//if the cell underneath the LHS is filled, 
					(celldiag && !cellright && nx)){		//or if the RHS overlaps a different cell and the cell underneath that is filled (nx is only falsey if the obj is only in a single tile)
					
					//floor collision
					if (ty+1 >= 15 && m.dropDeath){	//dropped off the map
						if (this.controlled){
							this.x = m.start.x;
							this.y = m.start.y;
							this.dx = 0;
							this.dy = 0;
							damage(this,1);
							this.iFrames = 30;
						} else if (!this.enemy) {
							this.cull = true;
						} else {
							this.dy = 0
						}
					} else if (this.controlled && ty+1 >= 15 && m.screenDown){	//move to screen below
						m.screenDown();
					} else {
						this.y = ty*32;
						this.dy = 0;
						this.falling = 0;		//reset falling
						this.jumping = false;
						if (!data.keys["Space"]) this.dashed = false;	//reset dashed, but only if the player isn't holding down the key
						ny = 0;
					}
				}
			} else if (this.dy < 0) {
				if ((cell && !celldown) || (cellright && !celldiag && nx)){
					if (this.controlled && ty < 0 && m.screenUp){	//headed off the map
						m.screenUp();
					} else {
						this.y = (ty+1)*32;
						this.dy = 0;
						cell = celldown;				//THIS IS THE BIT THAT MAKES THIS WORK!!! FML
						cellright = celldiag;			//basically we have to update which cells are below and diag since we're no longer touching them
						ny = 0;
					}
				}
			}
			
			if (this.dx > 0){
				if ((cellright && !cell) || (celldiag && !celldown && ny)){
					if (this.controlled && tx+1 >= 20 && m.screenRight){	//headed off the map
						if (this.x >= (20 - 0.5)*32) m.screenRight();
					} else {
						this.x = tx*32;
						this.dx = 0;
						nx = 0;
					}
				}
			} else if (this.dx < 0){
				if ((cell && !cellright) || (celldown && !celldiag && ny)){
					if (this.controlled && tx < 0 && m.screenLeft){	//headed off the map
						if (this.x < 32/-2) m.screenLeft();
					} else {
						this.x = (tx+1)*32;
						this.dx = 0;
						nx = 0;
					}
				}
			}
		}
		
		this.falling = !(celldown || (nx && celldiag)) ? this.falling + 1 : 0;	//check under us to see if there are tiles
		
		//sword collision
		if (this.attacking && this.attacking.frameCount < 12) checkAttack(this);
		
		//object collision
		if (this.controlled){
			var objArr = getObjArr();
			objArr.forEach(o => {
				if (data.collisionTypes[o.symbol]){
					//simple AABB collision
					if ((this.x <= o.x+32 && this.x+32 >= o.x) &&
						(this.y <= o.y+32 && this.y+32 >= o.y)){
						data.collisionFunctions[data.collisionTypes[o.symbol]](this,o);
					}
				}
			})
		}
	}
	
	this.draw = function(){
		if (!this.iFrames || this.iFrames%4){
			ctx.fonts.current = this.font || "gameObjects";
			ctx.fillStyle = getColor(this.color);
			//TODO include some visual indication of whether you've dashed or not ??
			ctx.save();
			if (this.controlled){
				ctx.translate(Math.round(this.x + 32/2), Math.round(this.y + 32/2));
				ctx.scale(this.facing,1);
				var wings = false;
				if (data.unlocks.dash && this.dy < 0) wings = "d";
				if (data.unlocks.dash && this.dy > 0) wings = "u";
				if (data.unlocks.dash && this.dy == 0) wings = "w";
				drawCharacter(this, wings)
				
				if (data.debug && this.attacking){		//debug attack
					if (this.attacking.frameCount < 12){
						ctx.strokeStyle = "limegreen";
						ctx.strokeRect(0,(44/-2 + 44/2*this.attacking.dy), 44, 44);
					}
				}
			} else if (this.symbol === "i" && this.ai){
				ctx.translate(this.x + 32/2, this.y + 32/2);
				ctx.scale(this.facing,1);
				drawImp();
			} else {
				ctx.translate(Math.round(this.x) + 32/2,Math.round(this.y) + 32/2);
				ctx.scale(this.facing,1);
				if (this.symbol == "@") ctx.rotate(Math.PI/2 * ((Math.floor(data.timer/10)%4) + 1));
				ctx.drawFont(this.symbol, 32/-2, 32/-2, 4);
			}
			ctx.restore();
			if (this.dashing){
				for (var dashFrame in this.dashing.dashFrames){
					var f = this.dashing.dashFrames[dashFrame];
					ctx.fillStyle = data.rainbowDash ? "hsl(" + Math.floor(60*f.frameNumber) + ",50%,50%)" : getColor("p2");
					ctx.save()
					ctx.translate(f.x + 32/2, f.y + 32/2);
					ctx.scale(this.facing,1);
					ctx.drawFont(this.symbol, 32/-2, 32/-2, 4);
					ctx.restore();
				}
			}
		}
		
		if (data.debug){
			ctx.fillStyle = "limegreen"
			ctx.strokeStyle = "limegreen";
			
			ctx.fillRect(this.x-2,this.y-2,4,4)
			ctx.beginPath();
			ctx.moveTo(this.x+32/2, this.y+32/2);
			ctx.lineTo(this.x + this.dx*32/2 + 32/2, this.y + this.dy*32/2 + 32/2)
			ctx.stroke();
		}
	}
}





function drawCharacter(instance,wings,bfs,wfs){
	if (wings){
		ctx.fillStyle = getColor("p2");
		ctx.drawFont(wings, 16 + 32/-2, -8 + 32/-2, 4);
		ctx.scale(-1,1)
		ctx.drawFont(wings, -16 - 32/-2, -8 + 32/-2, 4);
		ctx.scale(-1,1)
	}
	
	if (instance.attacking) drawPlayerSword(instance.attacking);
	
	ctx.fillStyle = getColor("bg");
	ctx.fillRect(-4,-4,12,8);
	
	ctx.fillStyle = getColor("p1");
	if (!instance.attacking){
		ctx.drawFont("a", 32/-2, 32/-2 + (Math.round(data.timer/30)%2)*4, 4);		//idle arms
	} else {
		ctx.drawFont("k", 32/-2, 32/-2, 4);										//attacking arms
	}
	ctx.drawFont("t", 32/-2, 32/-2, 4);
	ctx.drawFont("h", 32/-2, 32/-2, 4);
}

function drawPlayerSword(atk){
	if (atk.frameCount < 12){
		ctx.save();
		ctx.rotate(Math.PI/4*atk.dy)
		ctx.fillStyle = getColor("p3");
		ctx.beginPath();
		ctx.lineTo(Math.sin(Math.PI*(atk.frameCount-4)/12), Math.cos(Math.PI*(atk.frameCount-4)/12))
		ctx.arc(32/2,0,32,Math.PI*atk.frameCount/12 - Math.PI/2, Math.PI*(atk.frameCount-2)/12 - Math.PI/2, true);
		ctx.lineTo(0,0);
		ctx.fill();
		ctx.restore();
		//debugger;
	}
}

function drawImp(w){
	ctx.fillStyle = getColor("e2");
	if (!w) w = (Math.round(data.timer/30)%2) ? "d" : "w";
	ctx.drawFont(w, 16 + 32/-2, -8 + 32/-2, 4);
	ctx.scale(-1,1)
	ctx.drawFont(w, -16 - 32/-2, -8 + 32/-2, 4);
	ctx.scale(-1,1)
	ctx.fillStyle = getColor("e1");
	ctx.drawFont("i", 32/-2, 32/-2, 4);
	ctx.fillStyle = getColor("e3");
	ctx.drawFont("/", 32/-2 + (Math.round(data.timer/30)%2)*4, 32/-2, 4);
}







function checkAttack(instance){
	var objArr = getObjArr();
	for (var gameObject in objArr){
		var o = objArr[gameObject];
		if (o.enemy){
			var corners = [
				{x:o.x+32/2,y:o.y-32/2},
				{x:o.x-32/2,y:o.y-32/2},
				{x:o.x+32/2,y:o.y+32/2},
				{x:o.x-32/2,y:o.y+32/2}
			]
			for (var corner in corners){
				var c = corners[corner]
				var dx = (c.x-instance.x)*instance.attacking.dx;
				var dy = (c.y-instance.y);
				if (dx > 0 &&					//left bound
					dx <= 44){	//right bound
					if (dy > (44/-2 + 44/2*instance.attacking.dy) &&	//upper bound	(lowest y)
						dy < (44/2 + 44/2*instance.attacking.dy)){		//lower bound	(highest y)
						killEnemy(instance,o);
						data.hitstop = data.bossRoom.inBossRoom ? 2 : 4;
						return false;
					}
				}
			}
		}
	}
}
function damage(instance,d){
	if (instance.iFrames > 0) return false;
	data.screenShake = 10;
	if (!data.infiniteLives) data.life -= d;
	playSFX("damage")
	return true;
}
function killEnemy(instance,enemy){
	enemy.cull = true;
	playSFX("kill")
	
	if (enemy.symbol === "i") {
		var m = getCurrentMap();
		if (data.unlocks.reaper.unlocked && !data.finalBoss) m.gameObjects.push(new GameObject({symbol:"★", x:enemy.x, y:enemy.y, color:"st"}))
		m.gameObjects.push(new GameObject({ symbol: "!", color: "e2", x: enemy.x, y: enemy.y, dx: 50/8 * instance.attacking.dx, collides: false }))
	}
}