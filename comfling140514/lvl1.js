
(function(){
//console.log(iio);
//Definition

function lvl1(io){

	//CANVAS VARS
	this.io = io;
	this._io = io;
	this.cHeight = io.canvas.height;
	this.cWidth = io.canvas.width;
	this.imgPath = 'img/';
	this.loadResources = 0;
	this.totalResources = 5
		
	//KILL VARS
	this.killList = [];
	this.killCount = -1;
	this.killText = io.addToGroup('GUI', new iio.Text('',pxConv(300),this.cHeight-pxConv(30))
	     .setFont(pxConv(30)+'px OpenSans')
	     .setShadow('#b81519',4,4,0)
	     .setFillStyle('#dc4337'),20);
	     
	//SCORE VARS
	this.score = -1;
	this.scoreText = io.addToGroup('GUI', new iio.Text('',pxConv(40),pxConv(130))
	     .setFont(pxConv(30)+'px OpenSans')
	     .setShadow('grey',4,4,0)
	     .setFillStyle('white'),20);
	
	//TIME VARS
	this.timerText = io.addToGroup('GUI', new iio.Text('Time 0 / 30',this.cWidth-pxConv(200),this.cHeight-pxConv(30))
	     .setFont(pxConv(30)+'px OpenSans')
	     .setShadow('#f0ca38',4,4,0)
	     .setFillStyle('#f6eb3c'),20);
	     
	this.timerOn = true;
	this.time = 0;
	this.startTime = new Date().getTime();
	this.elapsed = 0.0;
	
	//GAME VARS
	this.spawnSpeed = 5;
	this.carCount = 0;
	
	
	this.carColors = ['red','blue','yellow'];
	this.carTypes = ['mini','sedan','van']
	
	this.winAmmount = 4; 
	this.MAX_CARS = 20;
	this.timeOut = 30;
	this.movers = [];
	this.gameOver = false;
	this.gameWin = false;
	
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
	/*goal.prototype.body,
	goal.prototype.fix,
	goal.prototype.color = '';*/
//this.io.playSound('music/Admiration.mp3');
	//SET IMAGE PATH
	this.io.setBGImage(this.imgPath+'background1.png',false);
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
		pxConv(100,true)
		,
		pxConv(100,true)
	); 
				
				
	//console.log(this.cHeight); //MAKE INTO FUNTION
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(255,255,255,.6)');
	
	for(var i = 0 ; i < fixDef.shape.m_vertexCount ; i++){
	
		this.io.addToGroup('coordsVerts',new iio.Rect(0,0,pxConv(5),pxConv(5))
		.setPos((fixDef.shape.m_vertices[i].x + bodyDef.position.x) *PTM,(fixDef.shape.m_vertices[i].y + bodyDef.position.y)*PTM)
		.setFillStyle('rgba(0,0,255,.7)'),90);
		
		this.io.addToGroup('coordsText',new iio.Text('x = ' + (fixDef.shape.m_vertices[i].x) * PTM + ' y = ' + (fixDef.shape.m_vertices[i].y) *PTM,(fixDef.shape.m_vertices[i].x + bodyDef.position.x) *PTM,(fixDef.shape.m_vertices[i].y + bodyDef.position.y) *PTM)
		   .setFont(pxConv(10)+'px Consolas')
		   .setTextAlign('center')
		   .setFillStyle('black'),100);
	}
	
		
	//GROUND LEFT
	fixDef.shape.SetAsBox(pxConv(455,true),fixDef.shape.height);
	bodyDef.position.Set(pxConv(50,true),this.cHeight/PTM - fixDef.shape.height);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(255,255,255,.5)');
	
	
	//KILLZONE(s)
	fixDef.userData = 'killzone';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(this.cWidth/PTM,pxConv(10,true));
	bodyDef.position.Set(pxConv(200,true),this.cHeight/PTM+fixDef.shape.height);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(255,255,255,.8)');
	
	fixDef.userData = 'killzonecollect';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(pxConv(10,true),this.cHeight/PTM);
	bodyDef.position.Set((this.cWidth/PTM+10),this.cHeight/PTM);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(0,0,0,.8)');
	
	//COLLECTOR
	fixDef.userData = 'collect';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(1,this.cHeight/PTM);
	bodyDef.position.Set((this.cWidth/PTM+8),this.cHeight/PTM);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(255,255,255,.8)');
	
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
	fixDef.shape.SetAsBox( pxConv(1,true),(this.cHeight - 240)/PTM);
	bodyDef.position.Set(0 , 0);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,255,255,.8)');
	
	//HOPPER //LEFT
	fixDef.shape.SetAsBox(pxConv(10,true),this.cHeight/2/PTM);
	bodyDef.position.Set(pxConv(-280,true),this.cHeight/2/PTM);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,0,255,.8)');
	
	//HOPPER DOOR //LEFT
	fixDef.shape.SetAsBox(pxConv(1,true),pxConv(60,true));
	fixDef.userData = 'door';
	bodyDef.position.Set(0, (this.cHeight-pxConv(60))/PTM);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(255,0,255,.8)');
	
	//HOPPER DOOR STOP //LEFT
	fixDef.shape.SetAsBox(pxConv(1,true),pxConv(60,true));
	fixDef.userData = 'doorstop';
	bodyDef.position.Set(pxConv(1,true), (this.cHeight-pxConv(60))/PTM);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,255,255,1)');
	
	//this.doorStop = this.io.addObj(world.CreateBody(bodyDef)).CreateFixture(fixDef);
	//this.doorStop.GetShape().prepGraphics(this.io.b2Scale)
	  //   .setFillStyle('rgba(255,255,255,.8)');
	
	fixDef.userData = undefined;
	
	//BLUE GOAL - BOTTOM
	fixDef.userData = 'blue';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(pxConv(20,true),pxConv(80,true));
	
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,(this.cHeight - pxConv(100))/PTM);
	
	var blueGoal = new goal(bodyDef,fixDef);
	
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,186,255,.8)');
	

		
	//YELLOW GOAL
	fixDef.userData = 'yellow';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(pxConv(20,true),pxConv(80,true));
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,pxConv(350,true));
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
	fixDef.shape.SetAsBox(pxConv(20,true),pxConv(70,true));
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,pxConv(500	,true));
	this.prepShape(bodyDef, fixDef).addImage(this.imgPath + 'block.png',function() {this.loadResources++;});

	//FLOOR 2
	fixDef.isSensor = false;
	fixDef.userData = undefined;
	fixDef.shape.SetAsBox(pxConv(20,true),pxConv(40,true));
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,pxConv(230,true));
	this.prepShape(bodyDef, fixDef).addImage(this.imgPath+'block.png',function() {this.loadResources++});
	
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
    this.blocker.GetShape().prepGraphics(this.io.b2Scale)
         .setFillStyle('rgba(0,186,255,.4)')
         .setStrokeStyle('white').addImage(this.imgPath + 'block.png',function() {this.loadResources++});
         
    //this.blocker.m_shape.fadeOut(1,1);
		
	fixDef.isSensor = false;
	fixDef.userData = undefined;
			
	//CREATE INITAL CAR
	this.createCar(-500/PTM,(this.cHeight - 200)/PTM,'yellow','mini');
		this.createCar(100/PTM,(this.cHeight - 100)/PTM,'red','sedan');
	//this.createCar(this.cHeight/PTM/2,this.cWidth/PTM/2,'red','sedan');
	
	//INIT GUI
	this.updateKills();
	this.updateScore();
	
	this.loadResources++;
	console.log(this.loadResources);
	
	}

//CREATE CAR
lvl1.prototype.createCar = function(x,y,color,type){
			
	//Define a fixture - used for cars
	var fixDef = new b2FixtureDef;
	fixDef.density = 5.0;
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
	
	for(var i = 0 ; i < fixDef.shape.m_vertexCount ; i++){
		this.io.addToGroup('coordsVerts',new iio.Rect(0,0,10,10)
		.setPos((fixDef.shape.m_vertices[i].x + bodyDef.position.x) *PTM,(fixDef.shape.m_vertices[i].y + bodyDef.position.y)*PTM)
		.setFillStyle('rgba(0,0,255,.7)'),90);
		
		this.io.addToGroup('coordsText',new iio.Text('x = ' + (fixDef.shape.m_vertices[i].x) * PTM + ' y = ' + (fixDef.shape.m_vertices[i].y) *PTM,(fixDef.shape.m_vertices[i].x + bodyDef.position.x) *PTM,(fixDef.shape.m_vertices[i].y + bodyDef.position.y) *PTM)
		.setFont(pxConv(10)+'px Consolas')
		.setTextAlign('center')
		.setFillStyle('white'),100);
	}
  
 	this.prepShape(bodyDef, fixDef,'carObj',10).addImage(this.imgPath+'/'+color+'/'+ type + '.png').setFillStyle('rgba(0,186,255,.0)')
 	   //.setStrokeStyle('white');
};

lvl1.prototype.randomColor = function(){
	return this.carColors[Math.floor(Math.random()*this.carColors.length)];
};
lvl1.prototype.randomType = function(){
	return this.carTypes[Math.floor(Math.random()*this.carTypes.length)];
};

//HELPER TO ADD BOX2D/IO OBJECTS
lvl1.prototype.prepShape = function(bodyDef, fixDef,group,zIndex){
	//io.addToGroup('GUI', new iio.Text('',300,this.cHeight-30)
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
	this.scoreText.setText('Commuters '+this.score+'/'+this.winAmmount);
};

lvl1.prototype.updateKills = function(){
	this.killCount++;
	this.killText.setText('Murders '+this.killCount);
};

lvl1.prototype.timer = function(){
	
	if(this.timerOn){
		this.time = new Date().getTime() - this.startTime;
	
	    this.elapsed = Math.floor(this.time / 100) / 10;
	    if(Math.round(this.elapsed) == this.elapsed) { 
	    	this.elapsed += '.0'; 
	    }
	    
	  	//var minutes = Math.floor(this.elapsed / 60);
	    //var seconds = this.elapsed - minutes * 60;
	    
	    this.timerText.setText('Time '+ Math.round(this.elapsed) + ' / ' + this.timeOut) 
	    
	      
    }else{
    	 this.timerText.setText('Time Disabled')   
    }
};
lvl1.prototype.kill = function(){
	if(this.killList.length){
		for (var i = 0, l = this.killList.length; i < l; ++i) {
		    this.io.rmvFromGroup('carObj',this.killList[i]);
		    if(i != -1) {
		    	this.killList.splice(i, 1);
		    }
		}
	}
}
lvl1.prototype.step = function(){

	this.timer();
	this.kill();
	var lio = this;

	//MOVE CARS
	if(lio.movers.length){
		for (var i = 0, l = this.movers.length; i < l; ++i) {
			this.movers[i].SetLinearVelocity(new b2Vec2(lio.spawnSpeed,1));
		}
	}

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
		if(contact.GetFixtureB().GetUserData() == 'door'){
			setTimeout(function() {
				lio.createCar(-500/PTM,(lio.cHeight - 200)/PTM);
			}, 100);
		}
	}
}

iio.AppManager.prototype.activateLevel1 = function(io){
	this.level = new iio.lvl1(io);
	return this.level;
}

})();


	
