/*
Multi-touch Demo
Code created by Travis Crumley. Based on code by Brian Tombari

Some things to note about this program:
There is an odd bug in Windows 7 that when the touches go offscreen, it decides to lock 
up the windows functions (such as closing the window, minimizing etc) and doesn't allow the 
mouse to do anything in the window, just touch inputs. The code however works fine in 
Windows 8.

To replace the image, simply name new images Demo1.png etc, and delete or rename the current ones.
This does unfortunately mean that .jpg and the like are not as easily supported. 
 
If you want to use a different file name or extension, edit the demoImage variable below.
You'll need to edit the .css file as well, just look at the bottom under #img1 etc and change the URLs
*/
var demoImage = ["Demo1.png","Demo2.png","Demo3.png"];
var imageNumber = 3;
$('#coordsDiv').hide(); //Hides the coordinates field
canvas = document.getElementById('mycanvas');
offset = $('#content').offset();
verticalOffset = offset.top;
// Set the canvas to fill the screen, except for the buttons.
canvas.width = window.innerWidth - offset.left*3;
canvas.height = window.innerHeight - $('#menu').height()*1.4;

var imageHeight = [0,0,0];
var imageWidth = [0,0,0];

function dist(pointA, pointB) {
		return Math.sqrt(
			Math.pow((pointA[0] - pointB[0]),2) + 
			Math.pow((pointA[1] - pointB[1]),2)
		);
	}
	
//Menu class declaration
var Menu = function(drawingBoard) {
	var swipe = true;
	var showCoords = false;
	var imageMode = false;
	
	this.updateSlider = function(sliderValue) {
		drawingBoard.setPointSize(sliderValue);
	}
	
	this.showCoordinates = function(){
		if(showCoords  == false) {
			showCoords = true;
			$('#coordsDiv').show();
			$('#coordinates').addClass('pressedButton');
			resizeWindow();
		} else {
			showCoords = false;
			$('#coordsDiv').hide();
			$('#coordinates').removeClass('pressedButton');
			resizeWindow();
		}
	}
	
	this.checkRadios = function() {
		var radio = document.getElementById("permanent");
		if(radio.checked) {
			swipe = false;
		} else	{
			swipe = true;
		}
		if(swipe) {
			var ctxt = canvas.getContext("2d");
			ctxt.clearRect(0, 0, canvas.width, canvas.height);
		}
	}
	
	this.showTouchLocations = function() {
		if(!$('#touches').hasClass('pressedButton')) {
			$('#touches').addClass('pressedButton');
		} else {
			$('#touches').removeClass('pressedButton');
		}
		drawingBoard.toggleShowTouchLocation();
	}
	
	//These two need to be outside this context, in drawingboard? Not sure
	this.printCoords = function() {
		var stringToAppend = "";		
		var points = drawingBoard.getPoints();
		for(var i = 0; points[i] != undefined; i++) {
			var touch = points[i];
			if(showCoords == true) {
				stringToAppend += '<span style="color:'+drawingBoard.getColour(i)+'">\tTouch ' + i + " [" + touch.x +
													", " + touch.y + /*" Color: " + touch.color.name + "*/"]\t</span>";
			}
		}
		$('#coordDisplay').html(stringToAppend);
	}
	
	this.clearCanvas = function() {
		var ctxt = canvas.getContext("2d");
		ctxt.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	this.toggleImages = function() {
		if(!$('#imageManip').hasClass('pressedButton')) {
			$('#imageManip').addClass('pressedButton');
		} else {
			$('#imageManip').removeClass('pressedButton');
		}
		if(imageMode) {
			$('#images').hide();
			$('#drawing').show();
			if(showCoords) {
				$('#coordsDiv').show();
			}
			imageMode = false;
		} else {
			$('#images').show();
			$('#drawing').hide();
			if(showCoords) {
				$('#coordsDiv').hide();
			}		
			imageMode = true;
		}
	}
	
	this.getImageMode = function() {
		return imageMode;
	}
}

//Drawing class declaration
var DrawingBoard = function(){
	colours = ['orangered', 'lawngreen', 'skyblue', 'yellow', 'fuchsia', 'coral', 'deepskyblue', 'aquamarine', 'gold', 'seashell'];
	var pointSize = 20;
	var lastPt = new Object();
	var ctx = canvas.getContext("2d");
	ctx.lineCap = "round";
	ctx.pY = undefined;
	ctx.pX = undefined;
	var showTouchLocation = false;
	
	this.draw = function(e) {
		if(menu.getImageMode()) return;
		e.preventDefault();

		//Iterate over all touches
		for(var i = 0; i < e.touches.length; i++) {
			var id = e.touches[i].identifier;   
			if(lastPt[id]) {
				ctx.lineWidth = pointSize;
				ctx.strokeStyle = colours[id];
				ctx.beginPath();
				ctx.moveTo(lastPt[id].x, lastPt[id].y);
				ctx.lineTo(e.touches[i].pageX, e.touches[i].pageY - verticalOffset);
				ctx.stroke();
				ctx.closePath();
				if(showTouchLocation == true) {
					ctx.arc(e.touches[i].pageX, e.touches[i].pageY - verticalOffset, pointSize * 0.52, Math.PI*2, false);
					ctx.fillStyle = '#000000';
					ctx.fill();
				}
			}
			// Store last point
			lastPt[id] = {x:e.touches[i].pageX, y:e.touches[i].pageY - verticalOffset};
		}
	}

	this.end = function(e) {
		if(menu.getImageMode()) return;
		e.preventDefault();
		for(var i=0;i<e.changedTouches.length;i++) {
			var id = e.changedTouches[i].identifier;
			// Terminate this touch
			delete lastPt[id];
		}
	}
	
	this.resetContext = function() {
		ctx.lineCap = "round";
	}
	
	this.setPointSize = function(value) {
		pointSize = value;
	}
	
	this.toggleShowTouchLocation = function() {
		showTouchLocation = !showTouchLocation;
	}
	
	this.getShowTouchLocation = function() {
		return showTouchLocation;
	}
	
	this.getPoints = function() {
		return lastPt;
	}
	
	this.getColour = function(i) {
		return colours[i];
	}
};

//Image Manipulation class declaration
var ImageManip = function(imageSource, imgNum) {
	//Variables that touch handling needs
	this.touches = [];
	this.startLen = 0, lastScale = 1,	curScale = 1, curAngle = 0, baseAngle = 0.0, translating = false;
	this.number = imgNum;
	$("#images").append('<div id="carrier' + imgNum + '"></div>');
	$("#carrier" + imgNum).append('<div id="img' + imgNum + '"></div>');
	this.currentDims = [];
	this.image = document.querySelector('#img' + imgNum);
	this.carrier = document.querySelector("#carrier" + imgNum);
	this.center = [0,0]; //Going to be set later
	this.imagePos = [$('#content').width()/2,$('#content').height()/2];
	
	this.setScaleAndRot = function(scale, angle) { //Angle in radians
		//this.image.style.webkitTransition = '-webkit-transform 0.01s linear';
		if (scale > 1) {
			scale = 1;
		} else if (scale < 0.01) {
			scale = 0.01;
		}
		this.curScale = scale;
		this.curAngle = angle;
		//Doing a matrix multiplication here, but simplified to one matrix, rotation * scale
		this.image.style.webkitTransform = 'matrix('+Math.cos(angle)*scale+','+Math.sin(angle)*scale+','
													+(-1*Math.sin(angle)*scale)+','+Math.cos(angle)*scale+',0,0)';
		this.lastScale = scale; //Only useful for very beginning, might be a better way to do this.
	}

	this.translate2D = function(tx, ty) {
		//this.image.style.webkitTransition = '-webkit-transform linear';
		if(!tx) tx = 0;
		if(!ty) ty = 0;
		this.imagePos[0] = this.center[0] + tx;
		this.imagePos[1] = this.center[1] + ty;
		//console.log(this.number + " imagePosX: " + this.imagePos[0] + " imagePosY: " +this.imagePos[1]);
		this.carrier.style.webkitTransform = 'translate('+tx+'px, '+ty+'px)';
	}

	this.fitToBox = function(dimsArray, imgIndex) {
		var imgw, imgh, scaleFactor;
		var w = dimsArray[0], h = dimsArray[1];
		if(w > h) {
			if(imageWidth[imgIndex] > imageHeight[imgIndex]) {
				imgw = w;
				scaleFactor = w/imageWidth[imgIndex];
				imgh = Math.round(imageHeight[imgIndex] * scaleFactor); 
			} else {
				imgh = h;
				scaleFactor = h/imageHeight[imgIndex];
				imgw = Math.round(imageWidth[imgIndex] * scaleFactor);
			}
		} else {
			if(imageWidth[imgIndex] > imageHeight[imgIndex]) {
				imgh = h;
				scaleFactor = h/imageHeight[imgIndex];
				imgw = Math.round(imageWidth[imgIndex] * scaleFactor);
			} else {
				imgw = w;
				scaleFactor = w/imageWidth[imgIndex];
				imgh = Math.round(imageHeight[imgIndex] * scaleFactor);
			}
		}
		this.image.style.width = imgw + 'px';
		this.image.style.height = imgh + 'px';
		this.currentDims = [imgw, imgh];
		this.image.style.top = 0;
		this.center = [imgw/2, imgh/2];
	}
}

//Class for image touch handling
var ImageTouchHandler = function(imageArr, menu) {
	this.handleTouch = function(e) {
		if(!menu.getImageMode()) return;
		e.preventDefault();
		if($(e.target).is('#imageManip')) {
			imageToggle();
		}
		updateTouches(e.touches);
		if(e.type == 'touchstart') {
			//Should be able to optimize by only doing for changedTouches
			for (var i = 0; i < e.changedTouches.length; i++) {
				var touchPoint = [e.changedTouches[i].pageX, e.changedTouches[i].pageY - verticalOffset];
				var dist1 = dist(touchPoint, imageArr[0].imagePos);
				var dist2 = dist(touchPoint, imageArr[1].imagePos);
				var dist3 = dist(touchPoint, imageArr[2].imagePos);
				//console.log("dist1: " + dist1 + "dist2: " + dist2 + "dist3: " + dist3);
				if(dist1 <= dist2 && dist1 <= dist3) {
					imageArr[0].touches.push(e.changedTouches[i]); //1 closest
				} else if(dist2 <= dist1 && dist2 <= dist3) {
					imageArr[1].touches.push(e.changedTouches[i]); //2 closest
				} else {
					imageArr[2].touches.push(e.changedTouches[i]); //3 closest				
				}
			}
			for(var i = 0; i < imageNumber; i++) {
				touchStart(imageArr[i]); //Run our touchStart methods
			}
		} else if(e.type == 'touchmove') {
			for(var i = 0; i < imageNumber; i++) {
				touchMoved(imageArr[i]); //Run our touchMoved methods
			} 
		} else if(e.type == 'touchend' || e.type == 'touchcancel') {
			for(var i = 0; i < e.changedTouches.length; i++) {
				for(var j = 0; j < imageNumber; j++) {
					touchEnded(imageArr[j], e.changedTouches[i].identifier);
				}
			}
		}
	}
	
	this.clearTouches = function() {
		for(var i = 0; i < imageNumber; i++) {
			imageArr[i].touches.length = 0; //Clear our arrays
		}
	}
	
	var touchStart = function(curImage) {
		if(curImage.touches.length > 1) {
			var pointA = curImage.touches[0];
			var pointB = curImage.touches[1];
			curImage.startLen = dist([pointA.pageX, pointA.pageY - verticalOffset],
									 [pointB.pageX, pointB.pageY - verticalOffset]);
			curImage.baseAngle = Math.atan2((pointA.pageY - pointB.pageY),(pointA.pageX - pointB.pageX));
			curImage.baseAngle = curImage.baseAngle - curImage.curAngle;
			curImage.startLen /= curImage.lastScale;
		} else if(curImage.touches.length == 1) {
			curImage.translating = true;
		}
	}
	
	var touchMoved = function(curImage) {
		if(curImage.touches.length > 1) { 
			var x = (curImage.touches[0].pageX + curImage.touches[1].pageX)/2;
			var y = (curImage.touches[0].pageY - verticalOffset + curImage.touches[1].pageY - verticalOffset)/2;
			var pointC = curImage.touches[0];
			var pointD = curImage.touches[1];
			var len = dist([pointC.pageX,pointC.pageY - verticalOffset], [pointD.pageX, pointD.pageY - verticalOffset]);
			var newAngle = Math.atan2(pointC.pageY - pointD.pageY, pointC.pageX - pointD.pageX);
			curImage.lastScale = len/curImage.startLen;
			curImage.setScaleAndRot(curImage.lastScale,(newAngle - curImage.baseAngle), true);
		} else if(curImage.touches.length == 1) {
			if(curImage.translating) {
				var curCenter = curImage.center;
				var x = (curImage.touches[0].pageX - curCenter[0]);
				var y = (curImage.touches[0].pageY - verticalOffset - curCenter[1]);
				curImage.translate2D(Math.round(x),Math.round(y),true);
			}
		}
	}
	
	var touchEnded = function(curImage, touchID) {
		for(var i = 0; i < curImage.touches.length; i++) {
			if(touchID == curImage.touches[i].identifier) {
				curImage.translating = false;
				curImage.touches.splice(i,1);//Take out the elementFromPoint
				break;
			}
		}
	}
	
	var updateTouches = function(newTouches) {
		for(var i = 0; i < imageNumber; i++) {
			for(var j = 0; j < images[i].touches.length; j++) {
				for(var k = 0; k < newTouches.length; k++) {
					if(newTouches[k].identifier == images[i].touches[j].identifier) {
						images[i].touches[j] = newTouches[k];
					}
				}
			}
		}
	}
}
//Create instances of everything, link them up
var drawBoard = new DrawingBoard("mycanvas");
var menu = new Menu(drawBoard);
var images = [new ImageManip(demoImage[0], 1), new ImageManip(demoImage[1],2), new ImageManip(demoImage[2],3)];
var imageHandler = new ImageTouchHandler(images, menu);

window.setTimeout(function() {
		
		images[0].setScaleAndRot(0.3,0);
		images[0].translate2D(-window.innerWidth/7, -window.innerHeight/7);
		
		images[1].setScaleAndRot(0.3,0);
		images[1].translate2D(window.innerWidth/7, -window.innerHeight/7);
		
		images[2].setScaleAndRot(0.3,0);
		images[2].translate2D(0,window.innerHeight/7);
}, 600);

function imageToggle(){
	menu.toggleImages();
	imageHandler.clearTouches();
}

//Setting up variables
window.setTimeout(function() {
	for(var i = 0; i < imageNumber; i++) {
		var t = new Image();
		t.src = (demoImage[i]);
		imageHeight[i] = t.height;
		imageWidth[i] = t.width;
	}
	rebuild();
}, 50);	

//Could put this in imagehandler or imageManip 
function rebuild(){

		setTimeout(function(){
			var box = [window.innerWidth, window.innerHeight - verticalOffset];

			document.querySelector('#images').style.height = box[1] + 'px';
			document.querySelector('#images').style.width = box[0] + 'px';
			$('#images').hide();
			for(var i = 0; i < imageNumber; i++) {
				images[i].fitToBox(box, i);
			}
		}, 50);
	}


function resizeWindow() {
	offset = $('#content').offset();
	verticalOffset = offset.top;
	canvas.width = window.innerWidth - offset.left*3;
	canvas.height = window.innerHeight - $('#menu').height()*1.4;
	drawBoard.resetContext();
}

//Event listeners
canvas.addEventListener("touchmove", drawBoard.draw, false);
canvas.addEventListener("touchstart", drawBoard.draw, false);
canvas.addEventListener("touchmove", menu.printCoords, false); //Not ideal way to update
canvas.addEventListener("touchstart", menu.checkRadios, false);
canvas.addEventListener("touchend", drawBoard.end, false);  
canvas.addEventListener('touchcancel', drawBoard.end, false);

//Image listeners:
document.addEventListener('touchstart', imageHandler.handleTouch);
document.addEventListener('touchmove', imageHandler.handleTouch);
document.addEventListener('touchend', imageHandler.handleTouch);
document.addEventListener('touchcancel', imageHandler.handleTouch);
document.addEventListener('orientationchange', rebuild);
//Event listeners for resizing
window.addEventListener('resize', resizeWindow, false);
window.addEventListener('orientationchange', resizeWindow, false);

