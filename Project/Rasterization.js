var canvas;
var ctx;
var lineCheckBox, rasterCheckBox, eCheckBox;
var code;
var line = [-1, -1, -1, -1];
var isFirstPoint = true;
var naiveCode = "// Draw a line in the first octant (0 < slope < 1)<br>" +
  "// from (x1, y1) to (x2, y2):<br>" +
  "m = (y2-y1)/(x2-x1) // “rise” over “run”<br>" +
  "b = y2 - m*x2 // Use the slope just computed, and the<br>" +
  "// 2nd endpoint in the line equation to<br>" +
  "// get the y-intercept, b.<br>" +
  "// Use line equation to go from 1st endpoint to 2nd ...<br>" +
  "for( x = x1; x ≤ x2; x++ ) ← Note that we increment x by 1 each time<br>" +
  " y = m*x + b<br>" +
  " plot( x, floor(y + 0.5) ) ← Choose the pixel closest to the actual line ";

var black = [0, 0, 0];
var white = [255, 255, 255];
var red = [255, 0, 0];

function arrayToColor(rgb){
  return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
}

function init(){
  canvas = document.getElementById("viewport-main");
  canvas.addEventListener('click', function(e) {
    if (isFirstPoint){
      line[0] = Math.floor((e.clientX - canvas.offsetLeft)/40);
	  line[1] = Math.floor((e.clientY - canvas.offsetTop)/40);
	  isFirstPoint = false;
    } else {
      line[2] = Math.floor((e.clientX - canvas.offsetLeft)/40);
	  line[3] = Math.floor((e.clientY - canvas.offsetTop)/40);
	  isFirstPoint = true;
	}
    render();
  });
  ctx = canvas.getContext('2d');
  lineCheckBox = document.getElementById("line");
  rasterCheckBox = document.getElementById("raster");
  eCheckBox = document.getElementById("e");
  code = document.getElementById("code");
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
  
  if(lineCheckBox.checked)
    drawLine(line[0],line[1],line[2],line[3]);
  if(rasterCheckBox.checked)
    Bresenham(line[0],line[1],line[2],line[3]);

  code.innerHTML = naiveCode;
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

function createNewLine(){
  line[0] = Math.floor(Math.random()*15)
  line[1] = Math.floor(Math.random()*10)
  do {
      line[2] = Math.floor(Math.random()*15)
      line[3] = Math.floor(Math.random()*10)
  } while(line[0] == line[2] && line[1] == line[3]);
  render();
}

function Bresenham(x1, y1, x2, y2){
  var x, y, dx, dy, e, de, steep, tmp;
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
  
  if(y1 < y2){
    ystep = 1;
  }	else {
	ystep = -1;
  }
  
  for(x = x1; x <= x2; x++){
    if(steep){ 
	  drawPixel(y,x); 
	} else {
	  drawPixel(x,y);
	}
	
    e = e + de;
	if(eCheckBox.checked && !(x+1 >= x2)){
	  if(steep){
		  drawError(y, x+1, y+ystep, x+1, y+e*ystep/dx, x+1);
	  } else {
		  drawError(x+1, y, x+1, y+ystep, x+1, y+e*ystep/dx);
	  }
	}
	
    if(2 * e >= dx){
      y += ystep;
      e -= dx;
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

window.onload = init;