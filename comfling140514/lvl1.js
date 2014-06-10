
(function(){
//Definition

function lvl1(io){

	//CANVAS VARS
	this.io = io;
	this._io = io;
	this.cHeight = io.canvas.height;
	this.cWidth = io.canvas.width;
	this.imgPath = 'img/';
	this.loadResources = 0;
	this.totalResources = 5;
	this.waveFront,
	this.waveBack,
	this.waveAnimation1,
	this.waveAnimation2,
	this.clouds = undefined;
		
	//KILL VARS
	this.killList = [];
	this.killCount = -1;
	/*this.killText = io.addToGroup('GUI', new iio.Text('',pxConv(300),this.cHeight-pxConv(30))
	     .setFont(pxConv(30)+'px OpenSans')
	     .setShadow('#b81519',pxConv(2),pxConv(2),0)
	     .setFillStyle('#dc4337'),20);*/
	
		//TIME VARS
		this.lcd == this.io.addToGroup('GUI',new iio.Rect(pxConv(140),pxConv(50),254,71).addImage(this.imgPath+'lcd.png'),0);
		this.timerText = io.addToGroup('GUI', new iio.Text('0',pxConv(40),pxConv(70))
		     .setFont(pxConv(60)+'px digital-7')
		     .setFillStyle('#333'),20);
	     
	 //SCORE VARS
	 this.score = -1;
	 
	 io.addToGroup('GUI', new iio.Text('commuters',pxConv(120),pxConv(70))
	      .setFont(pxConv(16)+'px OpenSans')
	      .setFillStyle('#333'),20);
	      
	 this.scoreText = io.addToGroup('GUI', new iio.Text('',pxConv(150),pxConv(50))
	      .setFont(pxConv(20)+'px OpenSans')
	      .setFillStyle('#333'),20);
	     
	this.timerOn = true;
	this.time = 0;
	this.startTime = new Date().getTime();
	this.elapsed = 0.0;
	
	//GAME VARS
	this.spawnSpeed = 5*PIXEL_RATIO;
	this.carCount = 0;
	
	
	this.carColors = ['red','blue','yellow'];
	this.carTypes = ['mini','sedan','van']
	
	this.winAmmount = 4; 
	this.MAX_CARS = 20;
	this.timeOut = 30;
	
	this.water = [];
	this.movers = [];
	this.gameOver = false;
	this.gameWin = false;
	this.pause = false;
	
	this.blocker = undefined;
	this.blockerDirection = 'down';
	this.blockerBodyDef = new b2BodyDef;
	this.blockerFixDef = new b2FixtureDef;

	this.doorStop = undefined;
	
	
	this.loadResources++;  
	   
}; iio.lvl1 = lvl1;

//Setup world
lvl1.prototype.setup = function(){
	//DEFINE THE LEVEL USING BOX2D STATIC BODIES
	//world.GetGravity().y = 0;
	
	function goal(body,fix){
		this.x = body.position.x;
		this.y = body.position.y;
		this.height = fix.shape.height;
		this.width = fix.shape.width;
		this.color = fix.userData;
	}

	//this.io.playSound('music/Admiration.mp3');
	
	//var audio = new Audio('music/Admiration.mp3');
	//audio.play();
	
	//SET IMAGE PATH
	
	//this.io.setBGImage(this.imgPath+'background1.png',false);
	this.io.addToGroup('BACKGROUND',new iio.Rect(this.cWidth/2,this.cHeight/2,this.cWidth,this.cHeight).addImage(this.imgPath+'background1-skybox.png'),-30);
			
	this.clouds = this.io.addToGroup('BACKGROUND',new iio.Rect(this.cWidth,pxConv(90),pxConv(1557),pxConv(166)).addImage(this.imgPath+'clouds.png'),-20);
		
	this.io.addToGroup('BACKGROUND',new iio.Rect(this.cWidth/2,this.cHeight/2,this.cWidth,this.cHeight).addImage(this.imgPath+'background1-buildings.png'),-10);

	
	this.loadResources++;  
	//DEFINE WORLD FIXTURE
	var fixDef = new b2FixtureDef;
	fixDef.friction = 0.3;
	fixDef.restitution = 0.5;
	
	//DEFINE WORLD BODY DEF
	var bodyDef = new b2BodyDef;
	
	//ROOF
	bodyDef.type = b2Body.b2_staticBody;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(this.cWidth/2/PTM,1/PTM);
	bodyDef.position.Set(this.cWidth/2/PTM,0);
	this.prepShape(bodyDef, fixDef);
		  
	//GROUND
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.width = pxConv(100,true);
	fixDef.shape.height = pxConv(10,true);
	
	//GROUND RAMP
	fixDef.isSensor = false;
	fixDef.userData = undefined;
	fixDef.shape.SetAsArray([
		new b2Vec2(pxConv(-10,true), 0),
		new b2Vec2(pxConv(35,true), pxConv(-20,true)),
		new b2Vec2(pxConv(100,true), pxConv(-20,true)),
		new b2Vec2(pxConv(100,true), 0)
	]);
	
	bodyDef.position.Set(
		pxConv(this.cWidth - 100,true)
		,
		pxConv(this.cHeight,true)
	); 
	this.prepShape(bodyDef, fixDef).setFillStyle('#999');
		
	//GROUND LEFT
	fixDef.shape.SetAsBox(pxConv(455,true),fixDef.shape.height);
	bodyDef.position.Set(pxConv(50,true),this.cHeight/PTM - fixDef.shape.height);
	this.prepShape(bodyDef, fixDef).setFillStyle('#999');
	
	
	var waveBack = this.io.addToGroup('BACKGROUND',new iio.Rect(750,this.cHeight,380,44).addImage(this.imgPath+'wave-back.png'),0);
	var waveFront = this.io.addToGroup('WAVES',new iio.Rect(750,this.cHeight+5,504,59).addImage(this.imgPath+'wave-front.png'),11);
	this.io.addToGroup('WAVES',new iio.Rect(pxConv(260),this.cHeight,pxConv(500),40).setFillStyle('#999'),12);//COVER
	this.io.addToGroup('WAVES',new iio.Poly(this.cWidth - 100,this.cHeight, [
										pxConv(-10), 0,
										pxConv(35), pxConv(-20),
										pxConv(100), pxConv(-20),
										pxConv(100), 0
											                                  
	                                  ]).setFillStyle('#999'),12);//COVER
	                                  
	                     
	              
	this.waveAnimation1 = new TWEEN.Tween( {y: this.cHeight+10 } )
		.to( { y:this.cHeight}, 700 )
		.easing( TWEEN.Easing.Quadratic.InOut)
		.onUpdate( function () {
			waveFront.pos.y = this.y;
		} )
		.yoyo( true )
		.repeat( Infinity )
		.start();
		
	this.waveAnimation2 = new TWEEN.Tween( {y: this.cHeight - 5 } )
		.to( { y:this.cHeight - 15}, 800 )
		.easing( TWEEN.Easing.Quadratic.InOut)
		.onUpdate( function () {
			waveBack.pos.y = this.y;
		} )
		.yoyo( true )
		.repeat( Infinity )
		.start();
		
	//WATER(phyics)
	
	/*fixDef.userData = 'water';
	bodyDef.position.Set(this.cWidth/PTM/2,this.cHeight/PTM/2);
	fixDef.shape.SetAsBox(200/PTM,200/PTM);
	fixDef.isSensor = true;
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(0,0,0,1)');*/
	
	//KILLZONE(s)
	fixDef.userData = 'killzone';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(this.cWidth/PTM,10/PTM);
	bodyDef.position.Set(200/PTM,this.cHeight/PTM+fixDef.shape.height+3);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(0,0,0,1)');
	
	fixDef.userData = 'killzonecollect';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(pxConv(10,true),this.cHeight/PTM);
	bodyDef.position.Set(this.cWidth/PTM + pxConv(7),this.cHeight/PTM);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(0,0,0,1)');
	
	//COLLECTOR
	fixDef.userData = 'collect';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(pxConv(10,true),this.cHeight/PTM);
	bodyDef.position.Set(this.cWidth/PTM + pxConv(3),this.cHeight/PTM);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(100,255,155,.8)');
	
	//CONSTANT MOVER
	fixDef.userData = 'constvel';
	fixDef.isSensor = true;
	fixDef.shape.SetAsArray([
		new b2Vec2(0, 0),
		new b2Vec2(pxConv(-250,true), 0),
		new b2Vec2(0, pxConv(-20,true)),
	]);
	bodyDef.position.Set(0,(this.cHeight - pxConv(20))/PTM);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(255,255,255,.8)');

		
	//RAMP
	/*bodyDef.angle=-Math.PI/4;
	fixDef.shape.SetAsBox(20/PTM,20/PTM);
	bodyDef.position.Set(300/PTM,(this.cHeight-30)/PTM);
	this.prepShape(bodyDef, fixDef).addImage(this.imgPath+'crate.png',function() {this.loadResources++});*/
	
	fixDef.isSensor = false;
	bodyDef.angle=0;
	fixDef.userData = undefined;
	
	
	//CREATE WALL //LEFT
	fixDef.shape.SetAsBox( pxConv(1,true),(this.cHeight - pxConv(120))/PTM);
	bodyDef.position.Set(0 , 0);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,255,255,.0)');
	
	//HOPPER //LEFT
	fixDef.shape.SetAsBox(pxConv(10,true),this.cHeight/2/PTM);
	bodyDef.position.Set(pxConv(-280,true),this.cHeight/2/PTM);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,0,255,.8)');
	
	//HOPPER DOOR 
	fixDef.shape.SetAsBox(pxConv(1,true),pxConv(50,true));
	fixDef.userData = 'door';
	bodyDef.position.Set(0, (this.cHeight-pxConv(70))/PTM);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(255,0,255,1)');
	
	//HOPPER DOOR STOP 
	fixDef.shape.SetAsBox(pxConv(1,true),pxConv(50,true));
	fixDef.userData = 'doorstop';
	bodyDef.position.Set(pxConv(1,true), (this.cHeight-pxConv(70))/PTM);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,100,100,0.5)');
	
	
	fixDef.userData = undefined;
	
	//BLUE GOAL - BOTTOM
	fixDef.userData = 'blue';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(pxConv(20,true),pxConv(105,true));
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,(this.cHeight - pxConv(125))/PTM);
	var blueGoal = new goal(bodyDef,fixDef);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,186,255,.8)');
	
		
	//YELLOW GOAL
	fixDef.userData = 'yellow';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(pxConv(20,true),pxConv(97,true));
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,pxConv(365,true));
	var yellowGoal = new goal(bodyDef,fixDef);	
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(255,255,0,.8)');
	

	//RED GOAL
	fixDef.userData = 'red';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(pxConv(20,true),pxConv(100,true));
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,90/PTM);

	
	var redGoal = new goal(bodyDef,fixDef);

	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(255,0,0,.8)');
							
	var floorPos = (yellowGoal.y + blueGoal.y)*PTM/2;
	
	var floorHeight = (yellowGoal.y + blueGoal.y) + (yellowGoal.height + blueGoal.height)*PTM/2;

	
	//FLOOR1
	fixDef.isSensor = false;
	fixDef.userData = undefined;
	fixDef.shape.SetAsBox(pxConv(20,true),pxConv(40,true));
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,pxConv(500	,true));
	this.prepShape(bodyDef, fixDef);

	//FLOOR 2
	fixDef.isSensor = false;
	fixDef.userData = undefined;
	fixDef.shape.SetAsBox(pxConv(20,true),pxConv(39,true));
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,pxConv(229,true));
	this.prepShape(bodyDef, fixDef);
	
	//MOVING WALL
	this.blockerBodyDef.type = b2Body.b2_kinematicBody;
	this.blockerFixDef.shape =  new b2PolygonShape;
	this.blockerFixDef.isSensor = false;
	this.blockerFixDef.userData = 'blocker';
	this.blockerFixDef.shape.SetAsBox(pxConv(20,true),pxConv(40,true));
	this.blockerBodyDef.position.Set(this.cWidth/PTM-fixDef.shape.width,pxConv(230,true));
	
	//this.blocker = this.prepShape(this.blockerBodyDef, this.blockerFixDef).addImage('img/block.png',function() {this.loadResources++});
	this.blocker = this.io.addObj(world.CreateBody(this.blockerBodyDef)).CreateFixture(this.blockerFixDef);
    
   	this.blocker.GetBody().SetLinearVelocity(new b2Vec2(0,3));
    this.blocker.GetShape().prepGraphics(this.io.b2Scale).addImage(this.imgPath + 'block.png',function() {this.loadResources++});
         
    //this.blocker.m_shape.fadeOut(1,1);
		
	fixDef.isSensor = false;
	fixDef.userData = undefined;
			
	//CREATE INITAL CAR
	this.createCar(-250/PTM,(this.cHeight - 200)/PTM,'yellow','mini');
		this.createCar(100/PTM,(this.cHeight - 100)/PTM,'red','sedan');
	//this.createCar(this.cHeight/PTM/2,this.cWidth/PTM/2,'red','sedan');
	
	//INIT GUI
	//this.updateKills();
	this.updateScore();
	
	this.loadResources++;
	console.log(this.loadResources);
	
	}

//CREATE CAR
lvl1.prototype.createCar = function(x,y,color,type){
			
	//Define a fixture - used for all cars
	var fixDef = new b2FixtureDef;
	fixDef.friction = 0.3;
	fixDef.restitution = 0.5;
	
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	
	this.through = false;
	this.correct = false
	if(color == undefined){
		color = this.randomColor();
	}
	if(type == undefined){
		type = this.randomType();
	}
	
	fixDef.userData = color; 
	fixDef.shape = new b2PolygonShape;	
	
	bodyDef.position.x = x;
	bodyDef.position.y = y;

	if(type == 'mini'){
		fixDef.density = 5.0;
		fixDef.shape.SetAsArray([
			new b2Vec2(pxConv(-210,true)/4, pxConv(-146,true)/4), 
			new b2Vec2(pxConv(51,true)/4, pxConv(-146,true)/4), 
			new b2Vec2(pxConv(241,true)/4, pxConv(6,true)/4), 
			new b2Vec2(pxConv(241,true)/4, pxConv(106,true)/4), 
			new b2Vec2(pxConv(201,true)/4, pxConv(146,true)/4), 
			new b2Vec2(pxConv(-205,true)/4, pxConv(146,true)/4),	
			new b2Vec2(pxConv(-241,true)/4, pxConv(110,true)/4),
			new b2Vec2(pxConv(-241,true)/4, pxConv(-46,true)/4)
		]);
		
		//fixDef.shape.SetAsBox(pxConv(241,true)/4,pxConv(146,true)/4);
	} else if (type=='sedan') {
		fixDef.density = 7.5;
		fixDef.shape.SetAsBox(pxConv(403,true)/4,pxConv(129,true)/4);
	} else if (type=='van') {
		fixDef.density = 10;
		fixDef.shape.SetAsArray([
			new b2Vec2(pxConv(-390,true)/4, pxConv(-174,true)/4), 
			new b2Vec2(pxConv(210,true)/4, pxConv(-174,true)/4),
			new b2Vec2(pxConv(428,true)/4, pxConv(20,true)/4),  
			new b2Vec2(pxConv(428,true)/4, pxConv(120,true)/4), 
			new b2Vec2(pxConv(300,true)/4, pxConv(174,true)/4), 
			new b2Vec2(pxConv(-320,true)/4, pxConv(174,true)/4),
			new b2Vec2(pxConv(-428,true)/4, pxConv(130,true)/4),
			new b2Vec2(pxConv(-428,true)/4, pxConv(-0,true)/4), 
		]);
		//fixDef.shape.SetAsBox(pxConv(428,true)/4,pxConv(174,true)/4);
		
	}
	/*
	for(var i = 0 ; i < fixDef.shape.m_vertexCount ; i++){
		this.io.addToGroup('coordsVerts',new iio.Rect(0,0,10,10)
		.setPos((fixDef.shape.m_vertices[i].x + bodyDef.position.x) *PTM,(fixDef.shape.m_vertices[i].y + bodyDef.position.y)*PTM)
		.setFillStyle('rgba(0,0,255,.7)'),90);
		
		this.io.addToGroup('coordsText',new iio.Text('x = ' + (fixDef.shape.m_vertices[i].x) * PTM + ' y = ' + (fixDef.shape.m_vertices[i].y) *PTM,(fixDef.shape.m_vertices[i].x + bodyDef.position.x) *PTM,(fixDef.shape.m_vertices[i].y + bodyDef.position.y) *PTM)
		.setFont(pxConv(10)+'px Consolas')
		.setTextAlign('center')
		.setFillStyle('white'),100);
	}*/
  
 	this.prepShape(bodyDef, fixDef,'CARS',10).addImage(this.imgPath+'/'+color+'/'+ type + '.png');
};

lvl1.prototype.randomColor = function(){
	return this.carColors[Math.floor(Math.random()*this.carColors.length)];
};
lvl1.prototype.randomType = function(){
	return this.carTypes[Math.floor(Math.random()*this.carTypes.length)];
};

//HELPER TO ADD BOX2D/IO OBJECTS
lvl1.prototype.prepShape = function(bodyDef, fixDef,group,zIndex){
	if(!group){
		group = 'worldObj';
	}
	if(!zIndex){
		zIndex = 0;
	}

	return  this.io.addToGroup(group,world.CreateBody(bodyDef),zIndex)
	        .CreateFixture(fixDef)
	        .GetShape()
	        .prepGraphics(this.io.b2Scale); 
};

lvl1.prototype.updateScore = function(){
	this.score++;
	this.scoreText.setText(this.score+'/'+this.winAmmount);
};

lvl1.prototype.updateKills = function(){
	this.killCount++;
	//this.killText.setText('Murders '+this.killCount);
};

lvl1.prototype.timer = function(){
	
	if(this.timerOn && this.pause == false){
		var lockTime = new Date().getTime()
		this.time = lockTime - this.startTime;
	
	    this.elapsed = Math.floor(this.time / 100) / 10;
	    if(Math.round(this.elapsed) == this.elapsed) { 
	    	this.elapsed += '.0'; 
	    }
	    
	  	//var minutes = Math.floor(this.elapsed / 60);
	    //var seconds = this.elapsed - minutes * 60;
	    
	    this.timerText.setText(Math.round(this.elapsed)) 
	    
	      
    }else{
    	 this.timerText.setText('Time Disabled')   
    }
};
lvl1.prototype.kill = function(){
	if(this.killList.length){
		for (var i = 0, l = this.killList.length; i < l; ++i) {
		    this.io.rmvFromGroup('CARS',this.killList[i]);
		    if(i != -1) {
		    	this.killList.splice(i, 1);
		    }
		}
	}
}
lvl1.prototype.step = function(){

	if(this.pause == true){
		this.timerOn = false;
	
	}	
	//console.log('tick');
	this.timer();
	
	this.kill();
	var lio = this;

	//MOVE CARS
	if(lio.movers.length){
		for (var i = 0, l = lio.movers.length; i < l; ++i) {
			lio.movers[i].SetLinearVelocity(new b2Vec2(lio.spawnSpeed,1));
		}
	}
	
	//WATER
	if(lio.water.length){
		for (var i = 0, l = lio.movers.length; i < l; ++i) {
			//Density
			//console.log(lio.water[i].GetWorldCenter());
			var setCenter = b2Vec2(0,0);
			if(lio.water[i] > 0){
				setCenter = lio.water[i].GetWorldCenter();
			}
			lio.water[i].ApplyForce(new b2Vec2(0,1000),setCenter);
			//return false;
			//lio.water[i].SetLinearVelocity(new b2Vec2(1,3));
		}
	}
	//MOVE CLOUDS
	this.clouds.pos.x += pxConv(-0.5);
	
	//MOVE BLOCKER
	if(lio.blocker.GetBody().m_xf.position.y*PTM > lio.cHeight){
		lio.blocker.GetBody().SetLinearVelocity(new b2Vec2(0,-3));
	}else if(lio.blocker.GetBody().m_xf.position.y*PTM < 0){
		lio.blocker.GetBody().SetLinearVelocity(new b2Vec2(0,3));	
	}
	
	if(this.elapsed > this.timeOut){
		lio.gameOver = true;
	}
	
	if(lio.score >= this.winAmmount){
		this.gameWin = true;
	}

	listener.PreSolve = function(contact){
		//GET COLLIONS
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();

		var moverX = 0;
		var doorX = 0;
		
		if (fixtureB.GetUserData()=="doorstop") {
			moverX = fixtureA.GetBody().GetPosition().x*PTM;
			doorX = fixtureB.GetBody().GetPosition().x*PTM;

			if (moverX < fixtureA.GetShape().width/2-10) {
				contact.SetEnabled(false);
			}
		}

		
		if (fixtureB.GetUserData()=="door") {
			moverX = fixtureA.GetBody().GetPosition().x*PTM;
			doorX = fixtureB.GetBody().GetPosition().x*PTM;

			//fixtureB.m_isSensor = true;
	
			//console.log(contact);
			if (moverX < fixtureA.GetShape().width/2) {
				contact.SetEnabled(false);
			}
		}	
	}
	
	
	listener.BeginContact = function(contact) {
		if(contact.GetFixtureB().GetUserData() == 'collect'){
			contact.GetFixtureA().through = true;
		}
		
		if(contact.GetFixtureB().GetUserData() == 'constvel'){
			lio.movers.push(contact.GetFixtureA().GetBody());
		}
		
		if(contact.GetFixtureB().GetUserData() == 'water'){
			lio.water.push(contact.GetFixtureA().GetBody());
		}

	}
	
	listener.EndContact = function(contact) {

		if(contact.GetFixtureB().GetUserData() == 'killzone'){
			lio.killList.push(contact.GetFixtureA().GetBody()); 
			lio.updateKills();
		}
		if(contact.GetFixtureB().GetUserData() == 'killzonecollect'){
			lio.killList.push(contact.GetFixtureA().GetBody());
		}
			
		if(contact.GetFixtureA().GetUserData() == contact.GetFixtureB().GetUserData()){
			contact.GetFixtureA().correct = true;
			if(contact.GetFixtureA().correct == true && contact.GetFixtureA().through == true){
				lio.updateScore();
			}
		}else{
			contact.GetFixtureA().correct = false; 
		}
		if(contact.GetFixtureB().GetUserData() == 'constvel'){
			//Remove a given mover
			var i = lio.movers.indexOf(contact.GetFixtureA().GetBody());
			if(i != -1) {
				lio.movers.splice(i, 1);
			}
		}
		
		if(contact.GetFixtureB().GetUserData() == 'water'){
		
			var i = lio.water.indexOf(contact.GetFixtureA().GetBody());
			if(i != -1) {
				lio.water.splice(i, 1);
			}
		}
		
		if(contact.GetFixtureB().GetUserData() == 'door'){
			setTimeout(function() {
				lio.createCar(-250/PTM,(lio.cHeight - 200)/PTM);
			}, 100);
		}
	}
}

iio.AppManager.prototype.activateLevel1 = function(io){
	this.level = new iio.lvl1(io);
	return this.level;
}

})();


	
