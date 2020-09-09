/* WORLD LAYOUT
        
    7       b
	|       |
  8-3       5-c
     \     /
      1-0-2			7+8+9+a+b+c+d+e - 0 becomes f
	 /     \
  9-4       6-d
	|       |
    a       e
*/

function setupWorld(){
	data.world = [
		["8","<","3",">","7"," ","b","<","5",">","c"],
		[" "," ","^"," "," "," "," "," ","^"," "," "],
		[" "," ","1","<","<","0",">",">","2"," "," "],
		[" "," ","v"," "," "," "," "," ","v"," "," "],
		["9","<","4",">","a"," ","e","<","6",">","d"]
	];
	data.bosses = {
		//tier1
		"1": { e:1,w1:5,w2:0,i:0 },
		"2": { e:3,w1:3,w2:0,i:0 },
		
		//tier2
		"3": { e:2,w1:5,w2:2,i:2 },	//1
		"4": { e:2,w1:7,w2:0,i:2 },	//1
		"5": { e:4,w1:3,w2:2,i:2 },	//2
		"6": { e:4,w1:6,w2:0,i:2 },	//2
		
		//tier3
		"7": { e:3,w1:6,w2:4,i:6 },	//3
		"8": { e:3,w1:5,w2:5,i:6 },	//3
		
		"9": { e:4,w1:8,w2:3,i:4 },	//4
		"a": { e:4,w1:7,w2:4,i:4 },	//4
		
		"b": { e:6,w1:6,w2:3,i:4 },	//5
		"c": { e:6,w1:5,w2:4,i:4 },	//5
		
		"d": { e:6,w1:7,w2:2,i:4 },	//6
		"e": { e:6,w1:6,w2:3,i:4 },	//6
		
		"0": { e:6,w1:8,w2:7,i:8 },		//final boss?
	}
	if (data.randBoss){
		for (var boss in data.bosses){
			data.bosses[boss].e = Math.ceil(Math.random()*4);
			data.bosses[boss].w1 = Math.ceil(Math.random()*8);
			data.bosses[boss].w2 = Math.ceil(Math.random()*7);
			data.bosses[boss].i = Math.floor(Math.random()*5);
		};
	}
	
	//we share one single room for all boss encounters, and just set a flag for which boss we're fighting / repopulate when necessary
	data.bossRoom = {
		layout: generateLayout({bossRoom:true}),
		start:{ x:20/2*32 - 32/2, y:32 },
		dropDeath: true,
		inBossRoom: false,
		gameObjects:[]
	}
	data.bossRoom.player = new GameObject({symbol:"b",x:data.bossRoom.start.x,y:data.bossRoom.start.y,controlled:true,color:"p1"});
	
	data.maps = [];
	for (var y in data.world){
		data.maps[y] = [];
		for (var x in data.world[y]){
			data.maps[y][x] = generateMap(y,x);
		}
	}
	data.currentMap = {y:2,x:5} //{y:3,x:6};
}


function Map(model){
	this.start = model.start;
	this.dropDeath = model.dropDeath;
	this.screenDown = model.screenDown;
	this.screenUp = model.screenUp;
	this.screenLeft = model.screenLeft;
	this.screenRight = model.screenRight;
	this.layout = model.layout;
	this.gameObjects = model.gameObjects || [];
	this.player = model.player;
}


function generateMap(wY,wX){
	var mapType = data.world[wY][wX];
	
	//	BUILD MAP MODEL
	var start = { x:20/2*32 - 32/2, y:32 };
	var model = {
		mapType: mapType,
		dropDeath: "^v1235".indexOf(mapType) < 0,
		start: start,
		gameObjects: [],
		player: new GameObject({symbol:"b",x:start.x,y:start.y,controlled:true,color:"p1"})
	}
	//set screenleft etc. based on mapType
	if ("<>0234567acd".indexOf(mapType) >= 0) model.screenLeft = function(){ switchMap(parseInt(wY), parseInt(wX)-1, "right") }
	if ("<>01345689be".indexOf(mapType) >= 0) model.screenRight = function(){ switchMap(parseInt(wY), parseInt(wX)+1, "left") }
	if ("^v1246".indexOf(mapType) >= 0) model.screenUp = function(){ switchMap(parseInt(wY)-1, parseInt(wX), "bottom") }
	if ("^v1235".indexOf(mapType) >= 0) model.screenDown = function(){ switchMap(parseInt(wY)+1, parseInt(wX), "top") }
	
	//	GENERATE LAYOUT FOR MAP
	model.layout = generateLayout(model);
	
	//	POPULATE GAME OBJECTS
	//stars
	var starSpawn = [];
	for (var x=1;x<20-1;x++){
		for (var y=1;y<15;y++){
			if (model.layout[y] && model.layout[y][x]) starSpawn.push({x:x,y:y});
		}
	}
	for (var i=0;i<5;i++){
		var spawn = starSpawn[Math.floor(Math.random()*starSpawn.length)];
		model.gameObjects.push(new GameObject({symbol:"★", x:spawn.x*32, y:(spawn.y-2)*32, color:"st"}))
	}
	//add enemies to every screen that's not the starting screen
	//add portals to portal rooms, plus an extra enemy
	if (mapType != "0"){
		model.gameObjects.push(new GameObject({symbol:"i",x:randBias(4)*canvas.width,y:canvas.height/2,ai:"imp",color:"e1",flight:true,maxDX:2,maxDY:2,enemy:true}))
	}
	if ("<>^v0".indexOf(mapType) < 0){
		model.gameObjects.push(new GameObject({symbol:"@",x:canvas.width/2-32/2,y:Math.floor(15/2)*32,color:"pt",flight:true}))
		model.gameObjects.push(new GameObject({symbol:"i",x:randBias(4)*canvas.width,y:canvas.height/2,ai:"imp",color:"e1",flight:true,maxDX:2,maxDY:2,enemy:true}))
	}
	
	return new Map(model);
}
function generateLayout(m){
	var s = [];	
	for (var y=0; y<15; y++) s.push([]);
	
	if (!m.bossRoom){
		switch (m.mapType){
			case "<":
				s = linear(s,true);
				break;
			case ">":
				s = linear(s);
				break;
			case "^":
			case "v":
				s = vertical(s);
				break;
			case "0":
				s[15-7]  = [ , , , , , , , ,1,1,1,1, , , , , , , , ]
				s[15-4]  = [ , , ,1,1,1,1, , , , , , ,1,1,1,1, , , ]
				s[15-1]  = [1,1, , , , , , , , , , , , , , , , ,1,1]
				break;
			default:
				s = vertical(s);
		}	
		//draw boundaries (not down)
		for (var y=0; y<15; y++){
			for (var x=0; x<20; x++){
				if ((!m.screenUp && y==0) ||
					(!m.screenLeft && x==0) ||
					(!m.screenRight && x==20-1)){
					s[y][x] = 1;
				}
			}
		}		
	} else {	//bossRoom
		s[15-4]  = [ , , , , , , ,1,1,1,1,1,1, , , , , , , ]
	}
	return s;
}
function linear(s,r){
	var f = 15 - 1;
	var t = 0;
	s[f][0] = 1
	s[f][20-1] = 1;
	if (!r){
		for (var x=1; x<20-1; x++){
			floorTiles(x);
		}
	} else {
		for (var x=20-2; x>0; x--){
			floorTiles(x);
		}
	}
	return s;
	
	function floorTiles(x){
		var diff = Math.ceil(Math.random()*3);
		var dir = Math.random() > 0.5 ? 1 : -1;
		if (t*Math.random() > 1){
			if (f + diff*dir < 15 && f + diff*dir > 2){
				f += diff*dir;
				t = 0;
			} else if (f - diff*dir < 15 && f - diff*dir > 2){
				f -= diff*dir;
				t = 0;
			}
		}
		s[f][x] = 1;
		t++;
	}
}
function vertical(s){
	s[15-1]  = [1,1,,,,,,,,,,,,,,,,,1,1]
	for (var i=1;i<=4;i++){
		var f = 15-1 - i*3;
		var platforms = Math.ceil(Math.random()*2);
		for (var j=0;j<platforms;j++){							//1			2
			var width = 20/platforms;					//20		10
			var startpoint = width*j;							//0			0, 10
			var calced = Math.floor(width*randBias(3+platforms) + startpoint);
			var platformWidth = Math.round(Math.random()*3+4-platforms);
			for (var k=Math.floor(platformWidth/-2);k<platformWidth/2;k++){
				s[f][calced+k] = 1;	//20/2+0	10/2+0, 10/2+10
			}
		}
	}
	return s;
}
//function generateVerticalPath(){
	
	//start at the bottom
	//generate jumpable platforms going upwards
	//stop at top, check pathable
	
//}
/*function generateRandomFloor(screen){
	screen[15-1][0] = 1
	screen[15-1][1] = 1
	screen[15-1][20-1] = 1;
	screen[15-1][20-2] = 1;
	for (var i=0;i<6;i++){
		var l = Math.floor(Math.random()*3) + 2;
		var y = Math.ceil(Math.random() * (15-3) + 2)
		var x = Math.ceil(Math.random() * (20-(5+l)) + 2)
		for (var j=0;j<l;j++){
			screen[y][x+j] = 1;
		}
	}
	return screen;
}*/


function switchMap(wY, wX, fromDir){
	var nm = data.maps[wY][wX];
	var p = getCurrentMap().player;
	var np = nm.player;
	
	if (fromDir == "left"){
		nm.start.x = 0-32/2;
	} else if (fromDir == "right"){
		nm.start.x = (20-0.5)*32;
	} else {
		nm.start.x = p.x;
	}
	if (fromDir == "top"){
		nm.start.y = 0;
	} else if (fromDir == "bottom"){
		nm.start.y = (15-1)*32;
	} else {
		nm.start.y = p.y;
	}
	
	np = p;
	np.x = nm.start.x;
	np.y = nm.start.y;
	if (np.dashing) np.dashing.dashFrames = [];
	
	nm.player = np;
	data.currentMap = {y:wY,x:wX};
	resetParticles();
}