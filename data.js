
var data = {
	//INTERVAL:1000/60,
	lastTime:(new Date()).getTime(),
	lskey: "heavenascent",
	
	//gravity: 0.9,				//ddy/frame (downward acceleration while not contacting the ground)
	
	//jumpImpulse: 50,			//subtracted from object ddy when jumping
	//jumpBoost: 0.4,			//subtracted from object ddy when moving upwards so the player can control jump height
	//coyoteFrames: 10,			//grace period while not contacting the ground before losing the ability to jump
	
	maxDX: 8,					//dx/frame
	maxDY: 10,					//dy/frame
	
	//accelFrames: 20,			//time from 0 to max dX while accelerating
	//groundFrictionFrames: 10,	//time from max dx to 0 while contacting the ground with no input
	//airFrictionFrames: 60,	//time from max dx to 0 while not contacting the ground and no input
	//attackFrames: 12,			//time to animate (and test hit on) attack
	//attackCDFrames: 12,		//cooldown between attacks
	//swordLength: 44,
	//dashFrames: 6,			//time a dash lasts, in frames
	//dashImpulse: 25,			//added to object ddy/ddx depending on direction
	
	//maxLife: 5,
	//iFrames: 30,
	
	//tilesX: 20,
	//tilesY: 15,
	//tileSize: 32,
	
	//options
	sound: 3,
	music: 10,
	screenshake: true,			// true/false
	
	//Coil/Patreon options
	secret: false,
	infiniteLives: false,
	rainbowDash: false,
	randBoss: false,
	debug: false,
	palette: 0,
	
	palettes: [
		{
			bg: "#000",			//background
			bgt: "rgba(0,0,0,0.5)",
			fg: "#fff",			//foreground
			sg: "#222",			//selection background in menu
			un: "#666",			//unselectable option in menu
			p1: "#7da8d6",		//player body
			p2: "#fff",			//player wings
			p3: "yellow",		//player sword
			e1: "red",			//enemy body
			e2: "#666",			//enemy wings
			e3: "#fff",			//enemy spear
			st: "yellow",		//star
			ht:	"red",			//heart
			pt: "limegreen",	//portal
		},
		{
			bg: "#fff",			//background
			bgt: "rbga(255,255,255,0.5)",
			fg: "#000",			//foreground
			sg: "#eee",			//selection background in menu
			un: "#666",			//unselectable option in menu
			p1: "#7da8d6",		//player body
			p2: "#ccc",			//player wings
			p3: "yellow",		//player sword
			e1: "red",			//enemy body
			e2: "#999",			//enemy wings
			e3: "#000",			//enemy spear
			st: "yellow",		//star
			ht:	"red",			//heart
			pt: "limegreen",	//portal
		}
	],
	
	collisionTypes: {
		"★": "collect",
		"♥": "lifeUp",
		"i": "hurt",
		"-": "hurt",	//wing1
		"/": "hurt",	//wing1
		"r": "hurt",	//wing2
		"l": "hurt",	//wing2
		//"=": "hurt",	//wing3
		//"_": "hurt",	//wing3
		"@": "portal"
	},
	collisionFunctions: {
		"collect": function(collider, collidee){
			data.score++;
			playSFX("collect")
			collidee.cull = true;
		},
		"lifeUp": function(collider, collidee){
			data.life++;
			collidee.cull = true;
		},
		"hurt": function(collider, collidee){
			var d = damage(collider,1);
			if (d){
				collider.iFrames = 30;
				collider.dx -= collidee.x - collider.x;
				collider.dy -= 50;
				if (!data.hitstop) data.hitstop = 4;
			}
		},
		"portal": function(collider, collidee){
			if (Math.abs(collider.x - collidee.x) < 32/1.5 && Math.abs(collider.y - collidee.y) < 32/1.5){	//hitbox slightly smaller than regular item to make sure the player intended to hit it
				if (data.bossRoom.inBossRoom){
					leaveBoss();
				} else {
					enterBoss(data.world[data.currentMap.y][data.currentMap.x]);
				}
				resetParticles();
				collidee.cull = true;	//removes portal
			}
		}
	},
	
	aiDefs:{
		wander: function(i){
			var t = data.timer+i.id;
			var x = Math.sin(t/100)-Math.sin(t/50)-Math.sin(t/20);
			var y = Math.sin(t/90)+Math.sin(t/40)+Math.sin(t/30);
			if (x > 0) i.right = true;
			if (x < 0) i.left = true;
			if (y > 0) i.down = true;
			if (y < 0) i.up = true;
		},
		seek: function(i){
			var m = getCurrentMap();
			var v = { x: m.player.x-i.x, y: m.player.y-i.y }
			if (v.x > 0) i.right = true;
			if (v.x < 0) i.left = true;
			if (v.y > 0) i.down = true;
			if (v.y < 0) i.up = true;
		},
		imp: function(i){
			var m = getCurrentMap();
			var v = { x: m.player.x-i.x, y: m.player.y-i.y }
			if (Math.abs(v.x)<32*5 && Math.abs(v.y)<32*5){
				data.aiDefs.seek(i)
			} else {
				data.aiDefs.wander(i)
			}
		}
	},
	
	//trophies:{
		//localStorage['OS13kTrophy,Icon,Game Name,Trophy Name'] = Message
	//}
};
initialiseGameData();

function initialiseGameData(){
	data.unlocks = {
		life: { text: "Increase Life", cost: function(){ return (this.unlocked+1)*10 }, unlocked: 0/*, alt: "Max Life Up!"*/ },
		dash: { text: "Wing Dash", cost: 25, unlocked: false, alt: "Press Z while moving to Dash" },
		glide: { text: "Wing Glide", cost: 25, unlocked: false, alt: "Hold Up to fall slower" },
		reaper: { text: "Reaper", cost: 50, unlocked: false, alt: "Gain stars from your enemies" },
		//cling: { text: "Wall Cling", cost: 25, unlocked: true },
	}
}
function setupData(){
	data.keys = {};
	data.timer = 0;
	data.screenShake = 0;
	
	data.scene = "title";
	data.previousScene = false;
	
	data.life = 5 + data.unlocks.life.unlocked*5;
	data.score = 0;
	
	setupWorld();
}