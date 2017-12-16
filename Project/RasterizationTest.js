var canvas;
var ctx;
var pixels, incorrectPixelList, correctPixelList;
var correctPixel, incorrectPixel;
var incorrectCheckbox, eCheckbox;
var typeSelect;
var black = [0, 0, 0];
var white = [255, 255, 255];
var red = [255, 0, 0];
var blue = [0, 0, 255];
var x, y, dx, dy, e, de, steep, tmp, x1, y1, x2, y2, ey, x0, y0;
var points = 0;
var totalPoints = 0;
var pointsHTML;
var finished = false;

function arrayToColor(rgb){
  return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
}

function init(){
  canvas = document.getElementById("viewport-main");
  canvas.addEventListener('click', function(e) {
	if(typeSelect.value == "line"){
	  if(!finished){
	    if(Math.floor((e.clientX - canvas.offsetLeft)/40) == correctPixel[0] && Math.floor((e.clientY - canvas.offsetTop)/40) == correctPixel[1]){
	      pixels.push([correctPixel[0], correctPixel[1]]);
	      points++;
	      totalPoints++;
	      if(x+1 >= x2){
		    finished = true;
	      } else {
	        findNextPixels();
		  }
	    } else if(Math.floor((e.clientX - canvas.offsetLeft)/40) == incorrectPixel[0] && Math.floor((e.clientY - canvas.offsetTop)/40) == incorrectPixel[1]){
	      incorrectPixelList.push([incorrectPixel[0], incorrectPixel[1]]);
          pixels.push([correctPixel[0], correctPixel[1]]);
          totalPoints++;
          if(x+1 >= x2){
	        finished = true;
	      } else {
	        findNextPixels();
		  }
        }
	  }
	} else {
	  if(checkPixel(Math.floor((e.clientX - canvas.offsetLeft)/40), Math.floor((e.clientY - canvas.offsetTop)/40))){
		pixels.push([Math.floor((e.clientX - canvas.offsetLeft)/40), Math.floor((e.clientY - canvas.offsetTop)/40)]);
		points++;
	    totalPoints++;
	  } else {
		incorrectPixelList.push([Math.floor((e.clientX - canvas.offsetLeft)/40), Math.floor((e.clientY - canvas.offsetTop)/40)]);
	    totalPoints++;
	  }
	}
    render();
  });
  ctx = canvas.getContext('2d');
  pointsHTML = document.getElementById("points");
  incorrectCheckbox = document.getElementById("incorrect");
  eCheckbox = document.getElementById("e");
  typeSelect = document.getElementById("type");
  pixels = [];
  incorrectPixelList = [];
  correctPixelList = [];
  finished = false;
  points = 0;
  totalPoints = 0;
  initBresenham();
  findNextPixels();
  render();
}

function render(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = arrayToColor(black);
  ctx.fillStyle = arrayToColor(black);
  for (var i = 0; i <= canvas.width; i += 40){
	ctx.beginPath();
	ctx.moveTo(i, 0);
	ctx.lineTo(i, canvas.height);
	ctx.stroke()
  }
  for (var i = 0; i <= canvas.height; i += 40){
	ctx.beginPath();
	ctx.moveTo(0, i);
	ctx.lineTo(canvas.width, i);
	ctx.stroke()
  }
  for (var i = 20; i < canvas.width; i += 40){
	for (var j = 20; j < canvas.height; j += 40){
	  ctx.beginPath();
      ctx.arc(i,j,2,0,2*Math.PI);
      ctx.fill();
	}
  }
  
  if(typeSelect.value == "line"){
    if(steep){
	  drawLine(y1,x1,y2,x2);
      drawPixel(y1, x1);
      drawPixel(y2, x2);
	  if(!finished && eCheckbox.checked)
        drawError(oldY, x, oldY+ystep, x, oldY+oldE*ystep/dx, x);
    } else {
      drawLine(x1,y1,x2,y2);
      drawPixel(x1, y1);
      drawPixel(x2, y2);
	  if(!finished && eCheckbox.checked)
        drawError(x, oldY, x, oldY+ystep, x, oldY+oldE*ystep/dx);
   }
  
    if(!finished){
      drawPixel(correctPixel[0], correctPixel[1], blue);
      drawPixel(incorrectPixel[0], incorrectPixel[1], blue);
    }
  } else {
	drawTriangle();
  }
  
  for(var i = 0; i < pixels.length; i++){
    drawPixel(pixels[i][0], pixels[i][1]);
  }
  
  if(incorrectCheckbox.checked){
    for(var i = 0; i < incorrectPixelList.length; i++){
      drawPixel(incorrectPixelList[i][0], incorrectPixelList[i][1], red);
    }
  }
  
  pointsHTML.innerHTML = points + " out of " + totalPoints + " correct.";
}

function drawPixel(x, y, color = black){
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = arrayToColor(color);
  ctx.fillRect(x*40, y*40, 40, 40);
  ctx.globalAlpha = 1;
}

function drawLine(x1, y1, x2, y2, color = black){
  ctx.strokeStyle = arrayToColor(color);
  ctx.beginPath();
  ctx.moveTo(x1*40+20, y1*40+20);
  ctx.lineTo(x2*40+20, y2*40+20);
  ctx.stroke();
}

function drawTriangle(){
  drawLine(x0,y0,x1,y1);
  drawLine(x1,y1,x2,y2);
  drawLine(x2,y2,x0,y0);
}

function initBresenham(){
  x1 = Math.floor(Math.random()*15);
  y1 = Math.floor(Math.random()*10);
  do {
      x2 = Math.floor(Math.random()*15);
      y2 = Math.floor(Math.random()*10);
  } while(Math.abs(x1 - x2) < 4 && Math.abs(y1 - y2) < 4);
  
  steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  if(steep){
    tmp = x1;
    x1 = y1;
	y1 = tmp;
	
    tmp = x2;
    x2 = y2;
    y2 = tmp;
  }
  if(x1 > x2){
    tmp = x1;
    x1 = x2;
	x2 = tmp;
	
    tmp = y1;
	y1 = y2;
	y2 = tmp;
  }
  
  dx = x2 - x1;
  dy = Math.abs(y2 - y1);
  e = 0;
  de = dy;
  y = y1;
  x = x1;
  
  if(y1 < y2){
    ystep = 1;
  }	else {
	ystep = -1;
  }
}

function initTriangle(){
  do {
      x0 = Math.floor(Math.random()*15);
      y0 = Math.floor(Math.random()*10);
	  x1 = Math.floor(Math.random()*15);
      y1 = Math.floor(Math.random()*10);
	  x2 = Math.floor(Math.random()*15);
      y2 = Math.floor(Math.random()*10);
  } while(checkAngles());
  
  var xMin = Math.min(x0, x1, x2);
  var xMax = Math.max(x0, x1, x2);
  var yMin = Math.min(y0, y1, y2);
  var yMax = Math.max(y0, y1, y2);
  var fAlpha = f(x0, y0, x1, y1, x2, y2);
  var fBeta = f(x1, y1, x2, y2, x0, y0);
  var fGamma = f(x2, y2, x0, y0, x1, y1);
  var alpha, beta, gamma;
  for(var y = yMin; y <= yMax; y++){
    for(var x = xMin; x <= xMax; x++){
	  alpha = f(x, y, x1, y1, x2, y2) / fAlpha
	  beta = f(x, y, x2, y2, x0, y0) / fBeta
	  gamma = f(x, y, x0, y0, x1, y1) / fGamma
	  if(alpha >= 0 && beta >= 0 && gamma >= 0){
	    correctPixelList.push([x,y]);
	  }
	}
  }
}

function f(x, y, xA, yA, xB, yB){
  return (yA - yB) * x + (xB- xA) * y + xA * yB - xB * yA
}

function checkAngles(){
  var a = Math.sqrt((x0-x1)*(x0-x1) + (y0-y1)*(y0-y1)); // side 01
  var b = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)); // side 12
  var c = Math.sqrt((x2-x0)*(x2-x0) + (y2-y0)*(y2-y0)); // side 20
  var A = Math.acos((-a*a + b*b + c*c) / (2*b*c)); // angle 2
  var B = Math.acos((a*a - b*b + c*c) / (2*a*c)); // angle 0
  var C = Math.acos((a*a + b*b - c*c) / (2*a*b)); // angle 1
  if(A > 0.6 && B > 0.6 && C > 0.6)
	return false;
  else
	return true;
}

function findNextPixels(){
  var pixel1, pixel2;
  x++;
  e = e + de;
  oldY = y;  //save current y and e values to draw error correctly later
  oldE = e;
  if(steep){
	pixel1 = [y, x];
	pixel2 = [y+ystep, x];
  } else {
	pixel1 = [x, y];
	pixel2 = [x, y+ystep];
  }

  if(2 * e >= dx){
    y += ystep;
    e -= dx;
  }
  if(steep){
    if(y == pixel1[0]){
      correctPixel = pixel1;
      incorrectPixel = pixel2;
    } else {
      correctPixel = pixel2;
      incorrectPixel = pixel1;
    }
  } else {
    if(y == pixel1[1]) {
      correctPixel = pixel1;
      incorrectPixel = pixel2;
    } else {
      correctPixel = pixel2;
      incorrectPixel = pixel1;
    }
  }
}

function drawError(x1, y1, x2, y2, ex, ey){
  drawLine(x1, y1, x2, y2, red);
  
  ctx.fillStyle = arrayToColor(red);
  ctx.beginPath();
  ctx.arc(ex*40+20,ey*40+20,4,0,2*Math.PI);
  ctx.fill();
}

function checkType(){
  pixels = [];
  incorrectPixelList = [];
  correctPixelList = [];
  finished = false;
  points = 0;
  totalPoints = 0;
  if(typeSelect.value == "line"){
	initBresenham();
	findNextPixels();
  } else {
	initTriangle();
  }
  render();
}

function checkPixel(pixelX, pixelY){
  for(var i = 0; i < correctPixelList.length; i++)
	if(pixelX == correctPixelList[i][0] && pixelY == correctPixelList[i][1])
	  return true;
  return false;
}

window.onload = init;