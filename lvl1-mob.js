
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
	this.killText = io.addToGroup('GUI', new iio.Text('',300,this.cHeight-30)
	     .setFont('30px Consolas')
	     .setFillStyle('red'),20);
	     
	//SCORE VARS
	this.score = -1;
	this.scoreText = io.addToGroup('GUI', new iio.Text('',40,this.cHeight-30)
	     .setFont('30px Ubuntu')
	     .setFillStyle('white'),20);
	     
	
	//TIME VARS
	this.timerText = io.addToGroup('GUI', new iio.Text('',this.cWidth-200,this.cHeight-30)
	     .setFont('30px Consolas')
	     .setFillStyle('yellow'),20);
	this.time = 0;
	this.startTime = new Date().getTime();
	this.elapsed = 0.0;
	
	//GAME VARS
	this.spawnSpeed = 3;
	this.carCount = 0;
	this.carColors = ['red','blue','yellow'];
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

	//SET IMAGE PATH
	this.io.setBGImage(this.imgPath+'bg.gif',true);
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
	fixDef.shape.width = 100/PTM;
	fixDef.shape.height = 20/PTM;
	
	//KILLZONE(s)
	fixDef.userData = 'killzone';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(this.cWidth/PTM,10/PTM);
	bodyDef.position.Set(200/PTM,this.cHeight/PTM+fixDef.shape.height);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(255,255,255,.8)');
	
	fixDef.userData = 'killzonecollect';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(10/PTM,this.cHeight/PTM);
	bodyDef.position.Set((this.cWidth/PTM+4),this.cHeight/PTM);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(255,255,255,.8)');
	
	//COLLECTOR
	fixDef.userData = 'collect';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(1,this.cHeight/PTM);
	bodyDef.position.Set((this.cWidth/PTM+2),this.cHeight/PTM);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(255,255,255,.8)');
	
	//CONSTANT MOVER
	fixDef.userData = 'constvel';
	fixDef.isSensor = true;
	fixDef.shape.SetAsArray([
		new b2Vec2(0/PTM, 0/PTM),
		new b2Vec2(-140/PTM, 0/PTM),
		new b2Vec2(0/PTM, -20/PTM),
	]);
	bodyDef.position.Set(0,(this.cHeight - 40)/PTM);
	this.prepShape(bodyDef, fixDef)
	.setFillStyle('rgba(255,255,255,.8)');
	
	//GROUNDBOTTOM
	fixDef.isSensor = false;
	fixDef.userData = undefined;
	fixDef.shape.SetAsArray([
		new b2Vec2(0/PTM, -0/PTM), //Top-Left
		new b2Vec2(-90/PTM, 0/PTM),
		new b2Vec2(55/PTM, -40/PTM),
		new b2Vec2(100/PTM, -40/PTM),
		new b2Vec2(100/PTM, 0/PTM),
	]);
	bodyDef.position.Set((this.cWidth/PTM)-fixDef.shape.width,(this.cHeight+fixDef.shape.height)/PTM); 
	this.prepShape(bodyDef, fixDef).addImage(this.imgPath+'crate.png',function() {this.loadResources++});
	
	//GROUND LEFT
	fixDef.shape.SetAsBox(250/PTM,fixDef.shape.height);
	bodyDef.position.Set(50/PTM,this.cHeight/PTM-fixDef.shape.height);
	this.prepShape(bodyDef, fixDef).addImage(this.imgPath+'crate.png',function() {this.loadResources++});
		
	//RAMP
	bodyDef.angle=-Math.PI/4;
	fixDef.shape.SetAsBox(20/PTM,20/PTM);
	bodyDef.position.Set(300/PTM,(this.cHeight-30)/PTM);
	this.prepShape(bodyDef, fixDef).addImage(this.imgPath+'crate.png',function() {this.loadResources++});
	
	bodyDef.angle=0;
	fixDef.userData = undefined;
	
	
	//CREATE WALL //LEFT
	fixDef.shape.SetAsBox(1/PTM,(this.cHeight - 120)/PTM);
	bodyDef.position.Set(0 , 0);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,255,255,.8)');
	
	//HOPPER //LEFT
	fixDef.shape.SetAsBox(10/PTM,this.cHeight/2/PTM);
	bodyDef.position.Set(-150/PTM,this.cHeight/2/PTM);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,0,255,.8)');
	
	//HOPPER DOOR //LEFT
	fixDef.shape.SetAsBox(1/PTM,40/PTM);
	fixDef.userData = 'door';
	bodyDef.position.Set(0/PTM, (this.cHeight-80)/PTM);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(255,0,255,.8)');
	
	//HOPPER DOOR STOP //LEFT
	fixDef.shape.SetAsBox(1/PTM,40/PTM);
	fixDef.userData = 'doorstop';
	bodyDef.position.Set(1/PTM, (this.cHeight-80)/PTM);
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(255,255,255,.8)');
	//this.doorStop = this.io.addObj(world.CreateBody(bodyDef)).CreateFixture(fixDef);
	//this.doorStop.GetShape().prepGraphics(this.io.b2Scale)
	  //   .setFillStyle('rgba(255,255,255,.8)');
	
		
		
	fixDef.userData = undefined;
	
	//BLUE GOAL - BOTTOM
	fixDef.userData = 'blue';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(20/PTM,80/PTM);
	
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,(this.cHeight - 120)/PTM);
	
	var blueGoal = new goal(bodyDef,fixDef);
	
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(0,186,255,.8)');
	

		
	//YELLOW GOAL
	fixDef.userData = 'yellow';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(20/PTM,80/PTM);
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,350/PTM);
	var yellowGoal = new goal(bodyDef,fixDef);	
	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(255,255,0,.8)');
	

	//RED GOAL
	fixDef.userData = 'red';
	fixDef.isSensor = true;
	fixDef.shape.SetAsBox(20/PTM,100/PTM);
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,90/PTM);

	
	var redGoal = new goal(bodyDef,fixDef);

	this.prepShape(bodyDef, fixDef).setFillStyle('rgba(255,0,0,.8)');
							
	var floorPos = (yellowGoal.y + blueGoal.y)*PTM/2;
	
	var floorHeight = (yellowGoal.y + blueGoal.y) + (yellowGoal.height + blueGoal.height)*PTM/2;

	
	//FLOOR1
	fixDef.isSensor = false;
	fixDef.userData = undefined;
	fixDef.shape.SetAsBox(20/PTM,70/PTM);
	
	/*fixDef.shape.SetAsArray([
		new b2Vec2(-20/PTM, -70/PTM), //Top-Left
		new b2Vec2(20/PTM, 70/PTM),
		new b2Vec2(20/PTM, 20/PTM),
		new b2Vec2(70/PTM, 20/PTM)
	]);*/
	
	//console.log(fixDef.shape);
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,499/PTM);
	
	this.prepShape(bodyDef, fixDef).addImage('img/block.png',function() {this.loadResources++;});
	
	//console.log('current pos = ' + bodyDef.position.y*PTM);
	//	console.log('current height = ' + fixDef.shape.height*PTM);
	
	//FLOOR 2
	fixDef.isSensor = false;
	fixDef.userData = undefined;
	fixDef.shape.SetAsBox(20/PTM,40/PTM);
	bodyDef.position.Set(this.cWidth/PTM-fixDef.shape.height,230/PTM);
	this.prepShape(bodyDef, fixDef).addImage('img/block.png',function() {this.loadResources++});
	
	
	//MOVING WALL
	this.blockerBodyDef.type = b2Body.b2_kinematicBody;
	this.blockerFixDef.shape =  new b2PolygonShape;
	this.blockerFixDef.isSensor = false;
	this.blockerFixDef.userData = 'blocker';
	this.blockerFixDef.shape.SetAsBox(20/PTM,40/PTM);
	this.blockerBodyDef.position.Set(this.cWidth/PTM-fixDef.shape.width,230/PTM);
	
	//this.blocker = this.prepShape(this.blockerBodyDef, this.blockerFixDef).addImage('img/block.png',function() {this.loadResources++});
	this.blocker = this.io.addObj(world.CreateBody(this.blockerBodyDef)).CreateFixture(this.blockerFixDef);
    
   	this.blocker.GetBody().SetLinearVelocity(new b2Vec2(0,3));
    this.blocker.GetShape().prepGraphics(this.io.b2Scale)
         .setFillStyle('rgba(0,186,255,.4)')
         .setStrokeStyle('white').addImage('img/block.png',function() {this.loadResources++});
         
    
    	    	     
	// console.log(this.blocker);
	//	console.log(this.blockerFixDef);
	//	console.log(this.blockerBodyDef);
		
	fixDef.isSensor = false;
	fixDef.userData = undefined;
			
	//CREATE INITAL CAR
	this.createCar(-100/PTM,(this.cHeight - 200)/PTM,this.carColors[1]);
	
	//INIT GUI
	this.updateKills();
	this.updateScore();
	
	this.loadResources++;
		console.log(this.loadResources);
}

//CREATE A CAR
lvl1.prototype.createCar = function(x,y,color){
			
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
	
	fixDef.userData = color;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsArray([
		new b2Vec2(-50/PTM, -5/PTM), //Top-Left
		new b2Vec2(-35/PTM, -30/PTM), //Top-Left	
		new b2Vec2(16/PTM, -30/PTM),
		new b2Vec2(50/PTM, -9/PTM), //Top-Right
		new b2Vec2(50/PTM, 20/PTM), //bottom-right
		new b2Vec2(25/PTM, 30/PTM), //bottom-right		
		new b2Vec2(-40/PTM,30/PTM), //botto,-left
		new b2Vec2(-50/PTM,20/PTM), //botto,-left
	]);
	
	
	bodyDef.position.x = x;
	bodyDef.position.y = y;

  
 	this.prepShape(bodyDef, fixDef,'carObj',10).addImage(this.imgPath+'car-'+color+'.png');//.setFillStyle('rgba(0,186,255,.4)')
   //.setStrokeStyle('white');
};
lvl1.prototype.randomColor = function(){
	return this.carColors[Math.floor(Math.random()*this.carColors.length)];
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
	
	this.time = new Date().getTime() - this.startTime;

    this.elapsed = Math.floor(this.time / 100) / 10;
    if(Math.round(this.elapsed) == this.elapsed) { 
    	this.elapsed += '.0'; 
    }
    
  	//var minutes = Math.floor(this.elapsed / 60);
    //var seconds = this.elapsed - minutes * 60;
    
    this.timerText.setText('Time '+ Math.round(this.elapsed) + ' / ' + this.timeOut)   
};
lvl1.prototype.kill = function(){
	if(this.killList.length){
		for (var i = 0, l = this.killList.length; i < l; ++i) {
			//lio.rmvObj(this.killList[i]);
			//console.log(this.killList[i]);
		   	//world.DestroyBody(this.killList[i]);
		    //this.io.rmvObj('carObj',this.killList[i]);
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
	
	
	//console.log(this.blocker.GetBody().m_fx.position.x);
		
	//var moveB = this.blocker.GetBody();
	
	//console.log(moveB.m_xf.position.x);

		//MOVE BLOCKER
	/*this.blocker.m_vertices[0].y += 0.1;
	this.blocker.m_vertices[1].y += 0.1;
	this.blocker.m_vertices[2].y += 0.1;
	this.blocker.m_vertices[3].y += 0.1;*/
	//CREATE RANDOM CARS
	if (this.carCount < this.MAX_CARS && Math.random()<.03){
		if (Math.random()<.2){
			var carColor = this.carColors[Math.floor(Math.random()*this.carColors.length)];
			//lio.createCar(-100/PTM,(lio.cHeight - 100)/PTM,carColor);
		}
	}
	//MOVE CARS
	if(lio.movers.length){
		for (var i = 0, l = this.movers.length; i < l; ++i) {
			this.movers[i].SetLinearVelocity(new b2Vec2(lio.spawnSpeed,0));
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
		
					if (moverX < fixtureA.GetShape().width/2-5) {
						contact.SetEnabled(false);
					}
				}	
		
		
		if (fixtureB.GetUserData()=="door") {
			moverX = fixtureA.GetBody().GetPosition().x*PTM;
			doorX = fixtureB.GetBody().GetPosition().x*PTM;

			if (moverX < fixtureA.GetShape().width/2-5) {
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
			//lio._this.createCar(-100/PTM,(lio.cHeight - 100)/PTM,'red');
			//console.log(lio)
			//var boundGetX = getX.bind(module);
			
			//lio.createCar.call(-100/PTM,(lio.cHeight - 100)/PTM,'red');
			//if(lio.movers && lio.movers.length){
				setTimeout(function() {
					lio.createCar(-100/PTM,(lio.cHeight - 200)/PTM);
				}, 100);
			//}
		}
	}
}

iio.AppManager.prototype.activateLevel1 = function(io){
	this.level = new iio.lvl1(io);
	return this.level;
}

})();


	
