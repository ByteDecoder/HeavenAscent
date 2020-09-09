function Menu(model){
	this.selected = model.selected || 0;
	this.charSelect = model.charSelect;
	this.y = model.y;
	this.margin = model.margin;
	this.space = model.space;
	this.optionSize = model.optionSize;
	this.options = model.options;
	
	this.update = function(delta){
		this.selected += delta;
		if (!this.options[this.selected]) this.selected += delta;
		if (this.selected >= this.options.length) this.selected = 0;
		if (this.selected < 0) this.selected = this.options.length-1;
		if (!this.options[this.selected].selectable(this.options[this.selected])) this.update(delta < 0 ? -1 : 1);
	}
	
	this.draw = function(){
		ctx.save();
		ctx.translate(0, this.y);
		for (var o=0; o<this.options.length; o++){
			if (this.options[o]) this.options[o].draw(this, o, this.selected === o);
		}
		ctx.restore();
	}
}
function MenuOption(model){
	this.text = model.text;
	this.text2 = model.text2;
	this.altCheck = model.altCheck;
	this.altText = model.altText;
	this.optionData = model.optionData;
	this.selectable = model.selectable || function(){ return true };
	this.onSelect = model.onSelect || function(){ return false };
	this.left = model.left;
	this.onLeft = model.onLeft;
	this.right = model.right;
	this.onRight = model.onRight;
	
	this.draw = function(menu,optionNumber,isSelected){
		if (isSelected){
			var margin = menu.margin-32*1.5 || 32*6;
			ctx.strokeStyle = getColor("fg");
			ctx.fillStyle = getColor("sg");
			ctx.strokeRect(margin, optionNumber*menu.space - 8, canvas.width-margin*2, menu.optionSize*7 + 16);
			ctx.fillRect(margin, optionNumber*menu.space - 8, canvas.width-margin*2, menu.optionSize*7 + 16);
			if (menu.charSelect){
				ctx.fonts.current = "gameObjects";
				ctx.save();
				ctx.translate(margin-32*1.5, optionNumber*menu.space+8);
				drawCharacter(false,"u");
				ctx.restore();
				ctx.save();
				ctx.translate(canvas.width - (margin-32*1.5), optionNumber*menu.space+8);
				ctx.scale(-1,1)
				drawImp("d")
				ctx.restore();
				ctx.fonts.current = "alphanumeric";
			}
		}
		
		ctx.fillStyle = this.selectable(this) ? getColor("fg") : getColor("un");
		if (this.altCheck && this.altCheck(this)){
			ctx.drawFontCenter(this.altText(this), canvas.width/2, optionNumber*menu.space, menu.optionSize);
		} else {
			if (this.text2){
				ctx.drawFont(this.text(this), menu.margin, optionNumber*menu.space, menu.optionSize);
				ctx.drawFontRight(this.text2(this), canvas.width - menu.margin, optionNumber*menu.space, menu.optionSize);
				
				if (this.right){
					ctx.fillStyle = !this.right || this.right(this) ? getColor("fg") : getColor("un");
					ctx.drawFont("→", canvas.width - menu.margin + menu.optionSize*5, optionNumber*menu.space, menu.optionSize)
				}
				if (this.left){
					ctx.fillStyle = !this.left || this.left(this) ? getColor("fg") : getColor("un");
					ctx.drawFontRight("←", canvas.width - menu.margin - this.text2(this).length*6*menu.optionSize - menu.optionSize*5, optionNumber*menu.space, menu.optionSize)
				}
				
			} else {
				ctx.drawFontCenter(this.text(this), canvas.width/2, optionNumber*menu.space, menu.optionSize);
			}
		}
	}
}
function ToggleMenuOption(text,option){
	MenuOption.call(this,{
		optionData: { text:text, option:option },
		text: function(u){ return u.optionData.text },
		text2: function(u){ return data[u.optionData.option] ? " on " : " off" },
		left: function(u){ return data[u.optionData.option] },
		onLeft: function(u){ data[u.optionData.option] = false; save(); },
		right: function(u){ return !data[u.optionData.option] },
		onRight: function(u){ data[u.optionData.option] = true; save(); }
	})
}

function setupMenus(){
	data.menus = {
		title: new Menu({
			charSelect: true,
			y: 320,
			space: 32,
			optionSize: 2,
			options: [
				new MenuOption({
					text: function(){ return "Continue" },
					selectable: function(){ return saveExists() },
					onSelect: function(){ startGame() }
				}),
				new MenuOption({
					text: function(){ return "New Game" },
					onSelect: function(){
						if (resetGame()){
							initialiseGameData()
							save()
							startGame()
						}
					}
				}),
				new MenuOption({
					text: function(){ return "Options" },
					onSelect: function(){ switchScene("mainmenu") }
				}),
			],
		}),
		main: new Menu({
			y: 64,
			margin: 160,
			space: 32,
			optionSize: 2,
			options: [
				new MenuOption({
					text: function(){ return "Resume" },
					onSelect: function(){ switchScene(data.previousScene) }
				}),
				new MenuOption({
					text: function(){ return "Restart" },
					onSelect: function(){ startGame() },
				}),
				new MenuOption({
					text: function(){ return "Clear Save Data" },
					selectable: function(){ return saveExists() },
					onSelect: function(){ clearSave() }
				}),
				false,
				new MenuOption({
					text: function(){ return "Sound" },
					text2: function(){ return " ".repeat(4-((data.sound*10)+"%").length) + data.sound*10 + "%" },
					left: function(){ return data.sound > 0 },
					onLeft: function(){ data.sound--; save(); },
					right: function(){ return data.sound < 10 },
					onRight: function(){ data.sound++; save(); }
				}),
				new MenuOption({
					text: function(){ return "Music" },
					text2: function(){ return " ".repeat(4-((data.music*10)+"%").length) + data.music*10 + "%" },
					left: function(){ return data.music > 0 },
					onLeft: function(){
						data.music--;
						setVolume(data.music/10);
						save();
					},
					right: function(){ return data.music < 10 },
					onRight: function(){
						data.music++;
						setVolume(data.music/10);
						save();
					}
				}),
				new ToggleMenuOption("Screenshake", "screenshake"),
				false,							//spacer
				new MenuOption({
					text: function(){ return "¢oil not detected. Enter code?" },
					altText: function(){ return data.menus.main.altText = (data.secret === "¢oil") ? "¢oil account detected" : "Patron code entered" },
					altCheck: function(){ return data.secret },
					selectable: function(){ return !data.secret },
					onSelect: function(){
						//if you're looking here to figure out how to unlock the cheat codes, why not
						//consider becoming a patron? Game dev is my full time job, and you can support
						//me for as little as $1 a month over at https://www.patreon.com/dhmstark
						if (prompt("Enter Patron code") === "alpaca"){
							data.secret = "patron";
							data.menus.main.update(0);
						}
						return false;
					}
				}),
				new MenuOption({
					text: function(){ return "Supporter Options" },
					selectable: function(){ return data.secret },
					onSelect: function(){ switchScene("secretmenu", true) }
				}),
			]
		}),
		secret: new Menu({
			y: 128,
			margin: 64,
			space: 32,
			optionSize: 2,
			options: [
				new ToggleMenuOption("Infinite Lives", "infiniteLives"),
				new ToggleMenuOption("Rainbow Dash", "rainbowDash"),
				new ToggleMenuOption("Random Bosses", "randBoss"),
				new ToggleMenuOption("Debug View", "debug"),
				new MenuOption({
					text: function(){ return "Palette" },
					text2: function(){ return " ".repeat(4-(data.palette+"").length) + data.palette },
					left: function(){ return data.palette > 0 },
					onLeft: function(){ data.palette--; ctx.fonts.palette = data.palette },
					right: function(){ return data.palette < data.palettes.length-1 },
					onRight: function(){ data.palette++; ctx.fonts.palette = data.palette }
				}),
			]
		}),
		prestige: new Menu({
			y: 260,
			margin: 64,
			space: 32,
			optionSize: 2,
			options: []
		})
	};
	for (var unlock in data.unlocks){
		data.menus.prestige.options.push(new MenuOption({
			text: function(u){ return data.unlocks[u.optionData.id].text },
			text2: function(u){ return typeof data.unlocks[u.optionData.id].cost == "number" ? data.unlocks[u.optionData.id].cost+"pts" : data.unlocks[u.optionData.id].cost()+"pts" },
			altCheck: function(u){ return (data.unlocks[u.optionData.id].unlocked === true) },
			altText: function(u){ return data.unlocks[u.optionData.id].alt },
			optionData: { id: unlock },
			selectable: function(u){
				if (typeof data.unlocks[u.optionData.id].unlocked == "number") return data.score >= data.unlocks[u.optionData.id].cost()
				return !data.unlocks[u.optionData.id].unlocked && data.score >= data.unlocks[u.optionData.id].cost
			},
			onSelect: function(u){
				if (typeof u.cost == "number"){
					data.score -= u.cost;
					u.unlocked = true;
				} else {
					data.score -= u.cost();
					u.unlocked++;
				}
				save();
			}
		}))
	}
	data.menus.prestige.options.push(new MenuOption({
		text: function(){ return "Reincarnate" },
		onSelect: function(){ startGame() }
	}))
	
	data.menus.title.update(0);
	data.menus.main.update(0);
}

function drawMenu(scene){
	//here we detect monetisation because the monetisation state could get set at any point
	if (document.monetization && document.monetization.state === 'started') { data.secret = "¢oil"; }

	ctx.fillStyle = getColor("fg");
	ctx.fonts.current = "alphanumeric";
	switch (scene){
		case "title":
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.fillStyle = getColor("bg");
			ctx.fillRect(32,32,canvas.width-32*2,canvas.height-32*2)
			ctx.fillStyle = getColor("fg");
			ctx.drawFontCenter("Heaven Ascent", canvas.width/2, 100, 6);
			ctx.drawFontCenter("@dhmstark", canvas.width/2, 235, 2);
			ctx.drawFontCenter("js13k 2020", canvas.width/2, 260, 2);
			
			data.menus.title.draw();
			
			ctx.fonts.current = "alphanumeric";
			ctx.fillStyle = getColor("e1")
			ctx.drawFontCenter("And there I saw a throne, and surrounding", canvas.width/2, 170, 2);
			ctx.drawFontCenter("it, four hundred and four golden stars", canvas.width/2, 190, 2);
			break;
		case "mainmenu":
			data.menus.main.draw();
			break;
		case "secretmenu":
			ctx.drawFontCenter("Secret " + data.secret + " exclusive options", canvas.width/2, 80, 2);
			data.menus.secret.draw();
			break;
		case "death":
			ctx.drawFontCenter("YOU DIED", canvas.width/2, 80, 8);
			ctx.drawFontCenter("Score: " + data.score + "/404", canvas.width/2, 180, 4);
			data.menus.prestige.draw();
			break;
		case "credits":
			break;
	}
}