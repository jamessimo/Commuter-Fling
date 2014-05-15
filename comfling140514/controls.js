
var currentLvl = null;
var canvasOffset = {
    x: 0,
    y: 0
}; 
var btn = null;
var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
    
//load BOX2D classes
var   b2Vec2 = Box2D.Common.Math.b2Vec2
,  	b2BodyDef = Box2D.Dynamics.b2BodyDef
,  	b2Body = Box2D.Dynamics.b2Body
,  	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,  	b2World = Box2D.Dynamics.b2World
,  	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,  	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,	b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
,   b2RopeJointDef = Box2D.Dynamics.Joints.b2RopeJointDef
,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
,   b2DebugDraw = Box2D.Dynamics.b2DebugDraw
,   b2Fixture = Box2D.Dynamics.b2Fixture
,	b2Listener = Box2D.Dynamics.b2ContactListener
,	b2WorldManifold = Box2D.Collision.b2WorldManifold
,   b2AABB = Box2D.Collision.b2AABB;

var PTM = 30;
var FPS = 60;
var world = new b2World(new b2Vec2(0, 0),true);
var listener = new b2Listener;
var level = undefined;

var gameOn = false;
var PIXEL_RATIO = 1;
function GameControl(io) {

	var scaleX = io.canvas.width / window.innerWidth;
	var scaleY = io.canvas.height / window.innerHeight;
	var scaleToFit = Math.min(scaleX, scaleY);
	
	this.onResize = function(event){
		scaleX = io.canvas.width / window.innerWidth;
		scaleY = io.canvas.height / window.innerHeight;
		scaleToFit = Math.min(scaleX, scaleY);
	};

	PIXEL_RATIO = (function () {
	    var ctx = io.context,
	        dpr = window.devicePixelRatio || 1,
	        bsr = ctx.webkitBackingStorePixelRatio ||
	              ctx.mozBackingStorePixelRatio ||
	              ctx.msBackingStorePixelRatio ||
	              ctx.oBackingStorePixelRatio ||
	              ctx.backingStorePixelRatio || 1;
	
	    return dpr / bsr;
	})();
	
	
	createHiDPICanvas = function(w, h, ratio) {
	    if (!ratio) { ratio = PIXEL_RATIO; }
	    var can = io.canvas;
	    can.width = w * ratio;
	    can.height = h * ratio;
	    can.style.width = w + "px";
	    can.style.height = h + "px";
	    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
	    return can;
	}
	
	 //Debugging 
	scaleX = scaleY = 1;
	PIXEL_RATIO = 1;

	//createHiDPICanvas(1024, 768);
	//io.canvas.width = 1024*PIXEL_RATIO;
	//io.canvas.height = 768*PIXEL_RATIO;	
	
	io.canvas.width = window.innerWidth;
	io.canvas.height = window.innerHeight;
	
	 
	io.addB2World(world);
	//io.playSound('music/FirstClassLounging.mp3');
	//intro(io);
	createWorld(io);
	//level.gameOver = true;
	canvasOffset.x = 0;
	canvasOffset.y = 0;
	
	io.context.translate(canvasOffset.x, canvasOffset.y);
	//io.context.scale(0.9,0.9);
	//io.activateDebugger();
	//level = io.activateLevel1();
	//level.setup(io);		

	io.setB2Framerate(FPS, function(){
		if(gameOn){
			if(level.gameOver==true){
				gameOver(io);
			}
			else if(level.gameWin==true){
				winGame(io);
			}else{
				level.step();
			}
		}
	
		
		if(mouseX > io.canvas.width/2/PTM){
		//KILL BOX2D CLICK IF MORE THAN HALF THE SCREEN
			isMouseDown = false;
		}
		
		if(isMouseDown && (!mouseJoint) && world) {
		  var body = getB2BodyAt(mouseX,mouseY);
		  if(body) {
		     var md = new b2MouseJointDef();
		     md.bodyA = world.GetGroundBody();
		     md.bodyB = body;
		     md.target.Set(mouseX, mouseY);
		     md.collideConnected = true;
		     md.maxForce = 600.0 * body.GetMass();
		     mouseJoint = io.addToGroup('MOUSEJOINT',world.CreateJoint(md).prepGraphics().setStrokeStyle('white').setLineWidth(1));
		     body.SetAwake(true);
		  }
		}
		if(mouseJoint) {
		  if(isMouseDown) {
		     mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
		  } else {
		     world.DestroyJoint(mouseJoint);
		     io.rmvObj(mouseJoint);
		     mouseJoint = null;
		  }
		}
		TWEEN.update();
    });

	
    function getB2BodyAt(callback,v,y) {
    	if(world){
			if (typeof v.x =='undefined')
			  v=new Box2D.Common.Math.b2Vec2(v,y);
			mousePVec = new b2Vec2(mouseX, mouseY);
			var aabb = new b2AABB();
			aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
			aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
			selectedBody = null;
			world.QueryAABB(getBodyCB, aabb);
			return selectedBody;
       }
    }
    function getBodyCB(fixture) {
       if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
          if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
             selectedBody = fixture.GetBody();
             return false;
          }
       }
       return true;
    }
 
    function mouseDown(e){
       e.preventDefault();
       isMouseDown = true;
       mouseMove(e);
    }
    function touchStart(e){
       e.preventDefault();
       isMouseDown = true;
       touchMove(e);
    }
    function mouseUp(e){
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
    }
    
    function touchEnd(e){
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
    }
    
    
    function mouseMove(e){
      	mouseX = ((io.getEventPosition(e).x) / PTM*scaleX)*PIXEL_RATIO;
       	mouseY = ((io.getEventPosition(e).y) / PTM*scaleY)*PIXEL_RATIO; 
    }
    
    function touchMove(e){
    	mouseX = (e.touches[0].pageX) / PTM*scaleX*PIXEL_RATIO;
    	mouseY = (e.touches[0].pageY) / PTM*scaleY*PIXEL_RATIO;
    }
    
    function pause(){
    	io.pauseB2World();
    	io.pauseFramerate();
    	console.log('pause button called');
    }
    
	//TOUCH EVENTS
	io.canvas.addEventListener('touchstart', function(e){
		touchStart(e);
		var newPos = io.getEventPosition(e);
		newPos.x = e.touches[0].pageX*scaleX;
		newPos.y = e.touches[0].pageY*scaleY;
		if (btn && btn.contains(newPos)){
			createWorld(io);
		}
	});
	io.canvas.addEventListener('touchmove', touchMove);
	io.canvas.addEventListener('touchend', touchEnd);
	
	//CLICK EVENTS
	io.canvas.addEventListener('mousemove', mouseMove);         
	io.canvas.addEventListener('mouseup', mouseUp);
	io.canvas.addEventListener('mousedown', function(e){
		mouseDown(e);
		var newPos = io.getEventPosition(e);
		newPos.x = io.getEventPosition(e).x*scaleX*PIXEL_RATIO;
		newPos.y = io.getEventPosition(e).y*scaleY*PIXEL_RATIO;
        if (btn && btn.contains(newPos)){
        	createWorld(io);
        }
    });

    this.focusOff = function(e){
       mouseUp(e);
 	}
    
};

function winGame(io){
	gameOn = false;
	io.addToGroup('MENU',(new iio.Text('WINNAR :)',iio.Vec.add(io.canvas.width/2,io.canvas.height/2,0,0)))
		.setFont('60px Courier New')
		.setTextAlign('center')
		.setFillStyle('yellow'),20);
		
	io.pauseB2World(true);
	io.pauseFramerate(true);

}
function gameOver(io){
	gameOn = false;
	
	
	//SHOW GAME OVER TEXT
	var gameoverText = io.addToGroup('MENU',(new iio.Text('Game Over!',iio.Vec.add(io.canvas.width/2,-100,0,0)))
		.setFont(pxConv(60)+'px OpenSans')
		.setTextAlign('center')
		.setShadow('rgb(150,150,150)',5,5,0)
		.setFillStyle('white'),20);
	  
	//SHOW GAMEOVER BUTTON      		      
	btn = io.addToGroup('MENU',new iio.Rect(io.canvas.width/2, -100, pxConv(160), pxConv(60))
		.setRoundingRadius(20)
		.setStrokeStyle('#4385f6').setLineWidth(2)
		.setShadow('#386ad5',5,5,0)
		.setFillStyle('#4385f6'),20);
	btn.text = io.addToGroup('MENU', new iio.Text('Restart',btn.pos)
		.setFont(pxConv(30)+'px OpenSans')
		.translate(0,20)
		.setTextAlign('center')
		.setFillStyle('white'),20);
		
		
	var topCurtain = io.addToGroup('UIEFFECTS',(new iio.Rect(io.canvas.width/2,0,io.canvas.width,1))
		.setFillStyle('rgba(0,0,0,0.5)'),20);
		
	var bottomCurtain = io.addToGroup('UIEFFECTS',(new iio.Rect(io.canvas.width/2,io.canvas.height,io.canvas.width,1))
		.setFillStyle('rgba(0,0,0,0.5)'),20);
			
			
	new TWEEN.Tween( {y: 0 } )
		.to( { y:io.canvas.height}, 1000 )
		.easing( TWEEN.Easing.Bounce.Out)
		.onUpdate( function () {
			topCurtain.height = this.y;
			bottomCurtain.height = this.y;
			gameoverText.pos.y = this.y/2 - 50;
		} )
		.delay(1000)
		.start();
		
	new TWEEN.Tween( {y: io.canvas.height } )
		.to( { y:io.canvas.height/2}, 1000 )
		.easing( TWEEN.Easing.Bounce.Out)
		.onUpdate( function () {
			if(btn){
				btn.pos.y = this.y+100;
				btn.text.pos.y = this.y+100;
				btn.text.translate(0,18);
			}
		} )
		.delay(1000)
		.start();
		
	
	
	io.pauseB2World(true);
	io.pauseFramerate(true);
}

function intro(io){
	
	io.setBGColor('#ccc');

	//SHOW LOGO
	var logo = io.addToGroup('MENU',(new iio.Text('Commuter Fling!',iio.Vec.add(io.canvas.width,0,0,0)))
		.setFont(60*PIXEL_RATIO+'px OpenSans')
		.setTextAlign('center')
		.setAlpha(0)
		.setFillStyle('white'),20);

	//SHOW START BUTTON      		      
	btn = io.addObj(new iio.Rect(io.canvas.width/2,io.canvas.height+pxConv(100), pxConv(160), pxConv(60))
	    .setRoundingRadius(40)
		.setFillStyle('#4385f6'));
	
	btn.text = io.addToGroup('MENU',new iio.Text('Start',btn.pos)
		.setFont(30*PIXEL_RATIO+'px OpenSans')
		.translate(0,16)
		.setTextAlign('center')
		.setLineHeight('3em')
		.setFillStyle('white'),20);


	new TWEEN.Tween( { x: 0, y: io.canvas.height } )
		.to( { x: io.canvas.width/2,y: io.canvas.height/2}, 1000 )
		.easing( TWEEN.Easing.Elastic.Out)
		.onUpdate( function () {
			logo.pos.y = this.y;
			logo.pos.x = this.x;
			logo.styles.alpha = 1;
		} )
		.delay(1000)
		.start();
		
	//			console.log(btn);			
	new TWEEN.Tween( { x: 0, y: io.canvas.height,rotation:-360})
		.to( { x: io.canvas.width/2,y: io.canvas.height/2 + 150,rotation:25}, 1000 )
		.easing( TWEEN.Easing.Bounce.Out)
		.onUpdate( function () {
			if(btn){
				btn.pos.y = this.y;
				btn.text.pos.y = this.y;
				btn.text.translate(0,18);
				//btn.rotate(this.rotation);
				//btn.text.rotate(this.rotation);
				
			}
		} )
		//.repeat( Infinity )
		.delay(2000)
		.start();
		
		/*new TWEEN.Tween( {rotation:0})
			.to( {rotation:25}, 1000 )
			.onUpdate( function () {
				if(btn){
					btn.rotate(this.rotation);
				}
			} )
			.repeat( 6 )
			.start();*/
	        	        
	//  gameOn = false;
      
}
function createWorld(io){
	gameOn = true;
	if ( world != null )
		world = null;
		
	io.rmvAll();
	btn = undefined;    
    //create the box2d world
	world = io.addB2World(new b2World(
    new b2Vec2(0, 30)    //gravity
   ,true                 //allow sleep
	));
	level = io.activateLevel1(io);
	
	world.SetContactListener(listener);
	
	level.setup();
	
	io.pauseB2World(false);
	io.pauseFramerate(false);
	
}

function pxConv(x,box2dconv){
	x = x * PIXEL_RATIO;
	if(box2dconv == true){
		x = x / PTM;
	}
	return x;
}
