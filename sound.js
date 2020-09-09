// ZzFX - Zuper Zmall Zound Zynth - Micro Edition
// MIT License - Copyright 2019 Frank Force
// https://github.com/KilledByAPixel/ZzFX

// This is a tiny build of zzfx with only a zzfx function to play sounds.
// You can use zzfxV to set volume.
// There is a small bit of optional code to improve compatibility.
// Feel free to minify it further for your own needs!

'use strict';let zzfx,zzfxV,zzfxX

// ZzFXMicro - Zuper Zmall Zound Zynth 
zzfxV=.3 // volume
zzfx=    // play sound
(t=1,a=.05,n=220,e=0,f=0,h=.1,M=0,r=1,z=0,o=0,i=0,s=0,u=0,x=0,c=0,d=0,X=0,b=1,m=0,l=44100,B=99+e*l,C=f*l,P=h*l,g=m*l,w=X*l,A=2*Math.PI,D=(t=>0<t?1:-1),I=B+g+C+P+w,S=(z*=500*A/l**2),V=(n*=(1+2*a*Math.random()-a)*A/l),j=D(c)*A/4,k=0,p=0,q=0,v=0,y=0,E=0,F=1,G=[],H=zzfxX.createBufferSource(),J=zzfxX.createBuffer(1,I,l))=>{for(H.connect(zzfxX.destination);q<I;G[q++]=E)++y>100*d&&(y=0,E=k*n*Math.sin(p*c*A/l-j),E=D(E=M?1<M?2<M?3<M?Math.sin((E%A)**3):Math.max(Math.min(Math.tan(E),1),-1):1-(2*E/A%2+2)%2:1-4*Math.abs(Math.round(E/A)-E/A):Math.sin(E))*Math.abs(E)**r*t*zzfxV*(q<B?q/B:q<B+g?1-(q-B)/g*(1-b):q<B+g+C?b:q<I-w?(I-q-w)/P*b:0),E=w?E/2+(w>q?0:(q<I-w?1:(q-I)/w)*G[q-w|0]/2):E),k+=1-x+1e9*(Math.sin(q)+1)%2*x,p+=1-x+1e9*(Math.sin(q)**2+1)%2*x,n+=z+=500*o*A/l**3,F&&++F>s*l&&(n+=i*A/l,V+=i*A/l,F=0),u&&++v>u*l&&(n=V,z=S,v=1,F=F||1);return J.getChannelData(0).set(G),H.buffer=J,H.start(),H},zzfxX=new(window.AudioContext||webkitAudioContext)
	
function playSFX(sfx){
	if (data.sound){
		zzfxV=data.sound/10;
		data.sfxDefs[sfx](data.sound);
	}
}

function defineSounds(){
	data.sfxDefs = {
		collect: function(v){ zzfx(...[v,0,1620,,.03,.18,,1.26,,,840,.05,,,,,,.92,.08]); },			// Pickup 301
		jump: function(v){ zzfx(...[v,,,.01,,.34,,1.56,1,,,,,,,,,.66,.02]); },						// Shoot 533				--jump sort of sound?
		dash: function(v){ zzfx(...[v,0,4e3,.04,.02,0,4,2.18,1.1,,-624,.02,,,,,.07,.37]); },		// Random 302				--wing flap?
		damage: function(v){ zzfx(...[v,,325,.2,,0,3,.82,-15,78,-50,,,,,-0.1,,.36,.01]); },			// Random 208 - Mutation 1	--squeal
		attack: function(v){ zzfx(...[v,,1,.05,.02,.05,,,45,3,,,,1.5,1]) },							// Random 214	
		kill: function(v){ zzfx(...[v,,306,,,.49,3,1.12,.9,,,,,,,.4,.1,.65]); },					// Hit 413
	}
}

		//	SFX TODOs
		//TODO - warp to boss
		//TODO - Footsteps?
		//TODO - Enemy goes into alert state?


//jump19: function(v){ zzfx(...[v,,57,.04,.08,.42,2,1.96,-2.5,,,,,,,,,.7,.03]); }, // Jump 19
//jump54: function(v){ zzfx(...[v,,831,.01,.02,.11,1,.37,1.7,,,,,,,,,.95,.04]); }, // Jump 54
//jump74: function(v){ zzfx(...[v,,653,.03,.03,.38,1,1.84,1,,,,,,,,,.55,.03]); }, // Jump 74 },
//jump309: function(v){ zzfx(...[v,,283,.04,.08,.23,2,1.09,1.1,,,,,,.1,,,.89,.03]); }, // Jump 309
//blip1214: function(v){ zzfx(...[v,,690,.03,,.09,2,.01,17,78,-961,,,,,,,,.01]); }, // Blip 1214
//random1276: function(v){ zzfx(...[v,,4,,.15,0,,1.2,,-69,,,,3,,,,.3,.14]); }, // Random 1576
//blip110: function(v){ zzfx(...[v,,104,.03,,.06,1,2.58,,59,-216,.07,,,,,,,.01]); },  // Blip 110
//hit331: function(v){ zzfx(...[v,,229,,,.14,3,2.53,-3.4,,,,,1.5,.5,,.07,.5,.08]); }, // Hit 331
//hit334: function(v){ zzfx(...[v,,173,,.02,.23,3,1.76,,,,,,.4,-0.4,.1,,.71,.06]); }, // Hit 344
//hit361: function(v){ zzfx(...[v,,425,,.01,.47,2,.94,,1,,,,1.5,,.2,.04,.83,.09]); }, // Hit 361
//random610: function(v){ zzfx(...[v,,0,,.07,.06,1,.5,15,,,,,,,,.01,.62,.06]); }, // Random 610							--dash sound maybe?
//jump155: function(v){ zzfx(...[v,,524,.02,.03,.15,1,1.08,-6,,,,,.2,,,,.97,.03]); }, // Jump 155						--boingy jump
//random550: function(v){ zzfx(...[v,1,1,.04,,.12,4,2,50,,1,,,1,,,,.5,.06]); }, // Random 550							--sword swish?

//zzfx(...[,,333,.39,.26,.35,,1.65,,.6,103,.07,.01,,,,.17,.52,.03]); // Powerup 269			//80s glam powerup
//zzfx(...[,,138,.02,.1,.04,3,1.03,,68,,,,,-1.2]); // Random 735							//AAH! (surprise)
//zzfx(...[,,1193,,.02,.23,4,.52,-0.6,10,-42,.35,,,,.8,,.98,.16]); // Random 754			//Grungy hit
//zzfx(...[,,540,.02,.15,.22,,2.38,-0.1,7.3,,,,,,,.04,.34]); // Random 783					//Cutesy jump
//zzfx(...[,,731,,.18,.21,,.42,,16,,,,,,1,,,.06]); // Random 864							//Big chonky entrance hit crashing through the door
//zzfx(...[,,679,.01,,.17,4,1.05,,-0.5,,,,,4.8,,,.09,.05]); // Random 883					//Match strike
//zzfx(...[,,356,.01,,.13,1,.29,,,198,.01,.05,,,,.15]); // Random 894						//double bloink
//zzfx(...[,,500,.01,.02,.14,1,1.6,,,262,.06]); // Random 1083								//nice pickup
//zzfx(...[,,1831,,,.17,2,2.3,-11,,,,,.6,-0.7,,.12,.5,.02]); // Random 1312					//laser
//zzfx(...[,,278,.15,.01,0,1,.72,,-93,,,.02,,,,,,.2]); // Random 1499						//deep and kinda difficult to describe
//zzfx(...[,,93,.18,.01,.12,2,1.41,,83,-853,.19,,,-0.1,,.1,.03,.03]); // Random 200			//swipe
//zzfx(...[,,325,.2,,0,3,.82,-15,78,-50,,,,,-0.1,,.36,.01]); // Random 208 - Mutation 1		//squeal
//zzfx(...[,,199,,,.38,1,.18,7.7,9.4,,,,.8,-1,.3,.01,.88,.06]); // Hit 392 					//YOOOY
//zzfx(...[,,1278,.17,.13,.01,3,2.12,,,,,,,,.1,.03,,.15]); // Random 907					//abrasive sound font
//zzfx(...[,,1178,.03,,.05,1,1.68,,,91,,,,,.2,,,.16]); // Random 158						//receptionist sound font