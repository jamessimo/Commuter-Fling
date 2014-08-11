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
	   
}; iio.lvlSelect = lvlSelect;

lvlSelect.prototype.setup = function(){
}
lvlSelect.prototype.step = function(){
}
iio.AppManager.prototype.activateLevelSelect = function(io){
	this.level = new iio.lvlSelect(io);
	return this.level;
}

})();