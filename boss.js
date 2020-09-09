
function enterBoss(room){
	var br = data.bossRoom;
	var p = br.player;
	
	br.inBossRoom = room;		//teleport to boss room
	p.x = br.start.x;
	p.y = br.start.y;
	p.dx = 0;
	p.dy = 0;
	
	if (data.bosses[room].i) for (var i=0;i<data.bosses[room].i;i++) br.gameObjects.push(new GameObject({symbol:"i",x:Math.random()>0.5?0:canvas.width-32,y:randBias(3)*canvas.height,ai:"imp",color:"e1",flight:true,maxDX:2,maxDY:2,enemy:true}))
	
	spawnBoss();
	
	br.roomCheck = function(room){
		if (!room.boss && !room.gameObjects.some(x => x.symbol === "@") && !room.gameObjects.some(x => x.symbol === "★")){
			room.gameObjects.push(new GameObject({symbol:"@",x:canvas.width/2 - 32/2,y:Math.floor(15/2)*32,color:"pt",flight:true}))
		}
	}
	
	if (diesIraeGenerated){
		stopMusic();
		playMusic("diesIrae",true);
	}
}
function leaveBoss(){
	if (data.finalBoss) switchScene("end");
	data.bossRoom.inBossRoom = false
	getCurrentMap().player.dx = data.bossRoom.player.dx;	//reset player momentum
	getCurrentMap().player.dy = data.bossRoom.player.dy;
	stopMusic();
	playMusic("mainTheme",true);
}








function Component(model){
	this.id = Math.floor(Math.random()*1000);
	this.type = model.type;
	this.dirX = model.dirX || 0;
	this.dirY = model.dirY || 0;
	this.offset = model.offset;
	this.x = model.offset.x * 32;
	this.y = model.offset.y * 32;
	this.gameObjects = [];
}

function spawnBoss(){
	var br = data.bossRoom;
	
	//spawn global boss object
	var boss = {
		x: canvas.width/2-32/2,
		y: -160,	//spawn above the player so the player has time to fall to the platform
		dx:0,
		dy:0,
		timer:Math.PI*50,
		components:[],
		ai: bossAI,
		draw: function(boss){
			boss.components.forEach((c) => {
				if (c.type === "eye"){			//animate eye
					switch (Math.floor((data.timer+c.id)/10)%16){
						case 0:
						case 3:
							c.gameObjects[0].symbol = "e"
							break;
						case 1:
						case 2:
							c.gameObjects[0].symbol = "u";
							break;
						default:
							c.gameObjects[0].symbol = "o";
					}
				}
				c.gameObjects.forEach(x => x.draw())
			});
		}
	}
	
	//generate components of boss (eyes, wings, swords, etc)
	var bData = data.bosses[br.inBossRoom];
	var tOff = 0;
	//eyes
	if (bData.e < 2){
		boss.components.push(new Component({ type: "eye", offset: {x:0, y:0} }))
	} else {
		tOff++;
		for (i=0;i<bData.e;i++){
			boss.components.push(new Component({ type: "eye", offset: {
				x:tOff*Math.cos((i/bData.e)*2*Math.PI),
				y:tOff*Math.sin((i/bData.e)*2*Math.PI)
			} }))
		}
	}
	tOff += 2;
	//wings
	for (i=(bData.w1-1)/-2;i<=(bData.w1-1)/2;i++){
		var x = tOff*Math.cos(i/(bData.w1+2)*Math.PI);
		var y = tOff*Math.sin(i/(bData.w1+2)*Math.PI);
		if (Math.sin(i/(bData.w1+2)*Math.PI) < Math.sin(Math.PI/4)){
			boss.components.push(new Component({ type: "wing1", dirX: 1, offset: { x:x, y:y } }))
			boss.components.push(new Component({ type: "wing1", dirX:-1, offset: { x:x*-1, y:y } }))
		} else {
			boss.components.push(new Component({ type: "wing2", dirX: 1, dirY:1, offset: { x:x, y:y } }))
			boss.components.push(new Component({ type: "wing2", dirX:-1, dirY:1, offset: { x:x*-1, y:y } }))
		}
	}
	tOff += 2;
	for (i=(bData.w2-1)/-2;i<=(bData.w2-1)/2;i++){
		var x = tOff*Math.cos(i/(bData.w2+2)*Math.PI);
		var y = tOff*Math.sin(i/(bData.w2+2)*Math.PI);
		if (Math.sin(i/(bData.w2+2)*Math.PI) < Math.sin(Math.PI/4)){
			boss.components.push(new Component({ type: "wing1", dirX: 1, offset: { x:x, y:y } }))
			boss.components.push(new Component({ type: "wing1", dirX:-1, offset: { x:x*-1, y:y } }))
		} else {
			boss.components.push(new Component({ type: "wing2", dirX: 1, dirY:1, offset: { x:x, y:y } }))
			boss.components.push(new Component({ type: "wing2", dirX:-1, dirY:1, offset: { x:x*-1, y:y } }))
		}
	}
	
	//swords
	
	
	//spawn child gameObjects for each component - only these objects are actually drawn to the screen
	boss.components.forEach((c) => {
		var model = {
			font:"boss",
			x: boss.x+c.offset.x*32,
			y: boss.y+c.offset.y*32,
			color:"e1",
			flight:true,
			maxDX:2,
			maxDY:2,
			enemy:true
		}
		switch (c.type){
			case "eye":
				model.symbol = "o";
				c.gameObjects.push(new GameObject(model));
				break;
			case "wing1":
				model.facing = c.dirX*-1;
				model.symbol = "-";
				c.gameObjects.push(new GameObject(model));
				model.symbol = "/";
				model.x += c.dirX*32;
				c.gameObjects.push(new GameObject(model));
				break;
			case "wing2":
				model.facing = c.dirX*-1;
				model.symbol = "r";
				c.gameObjects.push(new GameObject(model));
				model.symbol = "l";
				model.y += c.dirY*32;	//currently these wings always point downwards
				c.gameObjects.push(new GameObject(model));
		}
	})
	
	data.bossRoom.boss = boss;
}

function bossAI(boss){
	//boss AI
	boss.timer++;
	if (!boss.components.some(x => x.type === "eye")) return data.bossRoom.boss = false;
	
	//global boss movement
	var target = {
		x: canvas.width/2 + Math.sin(boss.timer/100)*400,
		y: 160 + Math.cos(boss.timer/50)*300
	}
	var gdx = (boss.x < target.x) ? 1 : -1;
	var gdy = (boss.y < target.y) ? 1 : -1;
	boss.x += gdx
	boss.y += gdy
	
	//component AI
	//	move in formation relative to boss + some jiggle
	boss.components.forEach(c => {
		//var cdx = 0		//do something here maybe?
		//var cdy = 0
		
		//child gameObjects
		c.gameObjects.forEach(o => {
			if (o.cull) c.cull = true;
			o.x += gdx //+ cdx;			//movement matches global + component movement
			o.y += gdy //+ cdy;
		})
		if (c.cull && !data.finalBoss) data.bossRoom.gameObjects.push(new GameObject({symbol:"★",x:boss.x+c.offset.x*32,y:boss.y+c.offset.y*32,color:"st"}))
	})
}





/*
function drawBossSword(x,y){
	ctx.drawFont("h", x, y,    4);
	ctx.drawFont("b", x, y+32, 4);
	ctx.drawFont("t", x, y+64, 4);
}
function drawEye(x,y,timerOffset){
	
}
*/