//TODO add Triangle Rasterization,  gray out error checkbox text when disabled
var canvas;
var ctx;
var algorithmSelect;
var lineCheckBox, rasterCheckBox, eCheckBox, eText, colorCheckBox, colorText, drawButton;
var code;
var line = [-1, -1, -1, -1];
var tri = [-1, -1, -1, -1, -1, -1];
var typeText;
var isFirstPoint = true;
var isSecondPoint = false;
var naiveCode = "<code><h3>Naive</h3><h4>//Draw a line in the first octant (0 < slope < 1) from (x1, y1) to (x2, y2):</h3>" +
  "<p><b>m = (y2-y1)/(x2-x1)</b> // “rise” over “run”<br>" +
  "<b>b = y2 - m*x2</b> // Use the slope just computed, and the 2nd endpoint in the line equation to get the y-intercept, b.</p>" +
  "// Use line equation to go from 1st endpoint to 2nd ...<br>" +
  "<b>for( x = x1; x ≤ x2; x++ )</b> ← Note that we increment x by 1 each time<br>" +
  " <b>&nbsp;&nbsp;y = m*x + b<br></b>" +
  " <b>&nbsp;&nbsp;plot( x, floor(y + 0.5) )</b> ← Choose the pixel closest to the actual line </code>";

var DDACode = "<code><h3>DDA(x1, y1, x2, y2), all octants:</h3>"+
  "<p><b>compute dy</b> <br>" +
  "<b>compute dx</b> <br>" +
  "<b>plot(x1, y1)</b> </p>" +
  "<p><b>if -1 < slope < +1 </b>// Shallow slope case. <br>" +
  " <b>&nbsp;&nbsp;compute m</b> // Calculate in the usual way: dy/dx. </p>" +
  " <p>// 1st endpoint could be on the left or the right ... <br>" +
  " // should we increment x (+1) or decrement x (-1)? <br>" +
  " <b>dx < 0 ⇒ dx = -1, otherwise dx = +1 </b></p>" +
  " <p><b>m *= dx </b>// Same m used for pos and neg slopes. </p>" +
  " <p><b>y = y1 </b>// Start at 1st endpoint’s scanline. </p>" +
  " <p>// Go from the 1st endpoint to the 2nd. <br>" +
  " <b>while( x1 != x2 ) </b><br>" +
  " <b>&nbsp;&nbsp;increment x1 by dx </b><br>" +
  " <b>&nbsp;&nbsp;increment y by m </b><br>" +
  " <b>&nbsp;&nbsp;plot( x1, floor(y + 0.5) )</b> </p>" +
  "<b>else</b> // Steep slope case. <br>" +
  " &nbsp;&nbsp;// same algorithm as above, except <br>" +
  " &nbsp;&nbsp;// switch x's and y's, dx's and dy's <br>" +
  " &nbsp;&nbsp;<b>plot(floor(x + 0.5), y1 )</b> </code>";

var BresenhamCode = "<code><h3>Bresenham(x1, y1, x2, y2) // All octants</h3>" +
  "<b>steep = |y2 - y1| > |x2 - x1| </b><br>" +
  "<p><b>if( steep ) </b>// Reflecting about y = x switches <br>" +
  "<b>&nbsp;&nbsp;swap(x1, y1) </b>// x’s and y’s to convert steep <br>" +
  "<b>&nbsp;&nbsp;swap(x2, y2) </b>// slope to shallow slope case. </p>" +
  "<p><b>if( x1 > x2 ) </b>// Swap endpoints so algorithm only <br>" +
  "<b>&nbsp;&nbsp;swap(x1, x2) </b>// has to deal with going from left <br>" +
  "<b>&nbsp;&nbsp;swap(y1, y2) </b>// to right in x </p>" +
  "<b>dx = x2 - x1 </b><br>" +
  "<b>dy = |y2 - y1| </b><br>" +
  "<b>e = 0 </b>// Initialize error term<br>" +
  "<b>de = dy </b>// Initialize error term increment <br>" +
  "<b>y = y1 </b><br>" +
  "<p>// ystep accounts for + or – slopes <br>" +
  "<b>if( y1 < y2 ) ystep = +1 else ystep = -1 </b></p>" +
  "<p><b>for( x from x1 to x2 ) </b><br>" +
  "<b>&nbsp;&nbsp;if( steep ) plot(y,x) else plot(x,y) </b><br>" +
  "<b>&nbsp;&nbsp;e = e + de </b><br>" +
  "<b>&nbsp;&nbsp;if( 2e ≥ dx ) </b><br>" +
  "<b>&nbsp;&nbsp;&nbsp;&nbsp;y += ystep </b><br>" +
  "<b>&nbsp;&nbsp;&nbsp;&nbsp;e = e - dx </b></p></code>";

var triCode = "<code><h3>TriangleRasterization(x0, y0, x1, y1, x2, y2)</h3>" +
  "<b>x<sub>min</sub> = floor(x<sub>i</sub>)</b><br>" +
  "<b>x<sub>max</sub> = ceiling(x<sub>i</sub>)</b><br>" +
  "<b>y<sub>min</sub> = floor(y<sub>i</sub>)</b><br>" +
  "<b>y<sub>max</sub> = ceiling(y<sub>i</sub>)</b><br>" +
  "<b>for y = y<sub>min</sub> to y<sub>max</sub></b><br>" +
  "<b>&nbsp;&nbsp;for x = x<sub>min</sub> to x<sub>max</sub></b><br>" +
  "<b>&nbsp;&nbsp;&nbsp;&nbsp;alpha = f<sub>12</sub>(x,y)/f<sub>12</sub>(x0, y0)</b> //function f<sub>ij</sub> defined below<br>" +
  "<b>&nbsp;&nbsp;&nbsp;&nbsp;beta = f<sub>20</sub>(x,y)/f<sub>20</sub>(x1, y1)</b><br>" +
  "<b>&nbsp;&nbsp;&nbsp;&nbsp;gamma = f<sub>01</sub>(x,y)/f<sub>01</sub>(x2, y2)</b><br>" +
  "<b>&nbsp;&nbsp;&nbsp;&nbsp;if(alpha > 0 and beta > 0 and gamma > 0)</b><br>" +
  "<b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;c = alpha*c<sub>0</sub> + beta*c<sub>1</sub> + gamma*c<sub>2</sub></b><br>" +
  "<b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;drawpixel (x,y) with color c</b><br>" +
  "<br><br><b>f<sub>ij</sub>(x,y) = (y<sub>i</sub> - y<sub>j</sub>)x + (x<sub>j</sub> - x<sub>i</sub>)y + x<sub>i</sub>y<sub>j</sub> - x<sub>j</sub>y<sub>i</sub></b></code>"

var displayCode = naiveCode;
var black = [0, 0, 0];
var white = [255, 255, 255];
var red = [255, 0, 0];
var green = [0, 255, 0];
var blue = [0, 0, 255];

function arrayToColor(rgb){
  return "rgb(" + Math.floor(rgb[0]) + "," + Math.floor(rgb[1]) + "," + Math.floor(rgb[2]) + ")";
}

function init(){
  canvas = document.getElementById("viewport-main");
  canvas.addEventListener('click', function(e) {
	if(algorithmSelect.value != "tri"){
      if (isFirstPoint){
        line[0] = Math.floor((e.clientX - canvas.offsetLeft)/40);
	    line[1] = Math.floor((e.clientY - canvas.offsetTop)/40);
	    isFirstPoint = false;
      } else {
        line[2] = Math.floor((e.clientX - canvas.offsetLeft)/40);
	    line[3] = Math.floor((e.clientY - canvas.offsetTop)/40);
	    isFirstPoint = true;
	  }
	} else {
	  if (isFirstPoint){
        tri[0] = Math.floor((e.clientX - canvas.offsetLeft)/40);
	    tri[1] = Math.floor((e.clientY - canvas.offsetTop)/40);
	    isFirstPoint = false;
		isSecondPoint = true;
      } else if (isSecondPoint){
        tri[2] = Math.floor((e.clientX - canvas.offsetLeft)/40);
	    tri[3] = Math.floor((e.clientY - canvas.offsetTop)/40);
	    isSecondPoint = false;
	  } else {
		tri[4] = Math.floor((e.clientX - canvas.offsetLeft)/40);
	    tri[5] = Math.floor((e.clientY - canvas.offsetTop)/40);
	    isFirstPoint = true;
	  }
	}
    render();
  });
  ctx = canvas.getContext('2d');
  algorithmSelect = document.getElementById("alogorithm");
  lineCheckBox = document.getElementById("line");
  rasterCheckBox = document.getElementById("raster");
  eCheckBox = document.getElementById("e");
  eText = document.getElementById("eText");
  colorCheckBox = document.getElementById("color");
  colorText = document.getElementById("colorText");
  typeText = document.getElementById("type");
  drawButton = document.getElementById("drawButton");
  code = document.getElementById("code");
  createNewLine();
  createNewTri();
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
  
  if(algorithmSelect.value == "tri"){
	drawTriangle(tri[0], tri[1], tri[2], tri[3], tri[4], tri[5]);
  } else {
	if(lineCheckBox.checked)
      drawLine(line[0],line[1],line[2],line[3]);
    Bresenham(line[0],line[1],line[2],line[3]);
  }

  code.innerHTML = displayCode;
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
  line[0] = Math.floor(Math.random()*15);
  line[1] = Math.floor(Math.random()*10);
  do {
      line[2] = Math.floor(Math.random()*15);
      line[3] = Math.floor(Math.random()*10);
  } while(line[0] == line[2] && line[1] == line[3]);
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
	if(rasterCheckBox.checked){
      if(steep){ 
	    drawPixel(y,x); 
	  } else {
	    drawPixel(x,y);
	  }
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

function createNewTri(){
  do {
      tri[0] = Math.floor(Math.random()*15);
      tri[1] = Math.floor(Math.random()*10);
	  tri[2] = Math.floor(Math.random()*15);
      tri[3] = Math.floor(Math.random()*10);
	  tri[4] = Math.floor(Math.random()*15);
      tri[5] = Math.floor(Math.random()*10);
  } while(checkAngles());
}

function checkAngles(){
  var a = Math.sqrt((tri[0]-tri[2])*(tri[0]-tri[2]) + (tri[1]-tri[3])*(tri[1]-tri[3])); // side 01
  var b = Math.sqrt((tri[2]-tri[4])*(tri[2]-tri[4]) + (tri[3]-tri[5])*(tri[3]-tri[5])); // side 12
  var c = Math.sqrt((tri[4]-tri[0])*(tri[4]-tri[0]) + (tri[5]-tri[1])*(tri[5]-tri[1])); // side 20
  var A = Math.acos((-a*a + b*b + c*c) / (2*b*c)); // angle 2
  var B = Math.acos((a*a - b*b + c*c) / (2*a*c)); // angle 0
  var C = Math.acos((a*a + b*b - c*c) / (2*a*b)); // angle 1
  if(A > 0.6 && B > 0.6 && C > 0.6)
	return false;
  else
	return true;
}

function drawTriangle(x0, y0, x1, y1, x2, y2){
  if(lineCheckBox.checked){
    drawLine(x1, y1, x2, y2);
    drawLine(x0, y0, x2, y2);
    drawLine(x1, y1, x0, y0);
  }
  var xMin = Math.min(x0, x1, x2);
  var xMax = Math.max(x0, x1, x2);
  var yMin = Math.min(y0, y1, y2);
  var yMax = Math.max(y0, y1, y2);
  var fAlpha = f(x0, y0, x1, y1, x2, y2);
  var fBeta = f(x1, y1, x2, y2, x0, y0);
  var fGamma = f(x2, y2, x0, y0, x1, y1);
  var alpha, beta, gamma;
  var color = [0,0,0];
  for(var y = yMin; y <= yMax; y++){
    for(var x = xMin; x <= xMax; x++){
	  alpha = f(x, y, x1, y1, x2, y2) / fAlpha
	  beta = f(x, y, x2, y2, x0, y0) / fBeta
	  gamma = f(x, y, x0, y0, x1, y1) / fGamma
	  if(alpha >= 0 && beta >= 0 && gamma >= 0){
		if(colorCheckBox.checked)
		  for(var i = 0; i < 3; i++)
		    color[i] = alpha*red[i] + beta*green[i] + gamma*blue[i];
	    
		if(rasterCheckBox.checked)
		  drawPixel(x,y,color);
	  }
	}
  }
}

function f(x, y, xA, yA, xB, yB){
  return (yA - yB) * x + (xB- xA) * y + xA * yB - xB * yA
}

function checkAlgorithm(){
  if(algorithmSelect.value == "Bresenham"){
    eCheckBox.disabled = false;
	displayCode = BresenhamCode;
	eText.style = "color:Black;";
	colorCheckBox.disabled = true;
	colorCheckBox.checked = false;
	colorText.style = "color:LightGray;";
	typeText.innerHTML = "Line Drawing";
	drawButton.innerHTML = "Draw New Line";
  } else if(algorithmSelect.value == "DDA"){
    eCheckBox.disabled = true;
	eCheckBox.checked = false;
	displayCode = DDACode;
	eText.style = "color:LightGray;";
	colorCheckBox.disabled = true;
	colorCheckBox.checked = false;
	colorText.style = "color:LightGray;";
	typeText.innerHTML = "Line Drawing";
	drawButton.innerHTML = "Draw New Line";
  } else if(algorithmSelect.value == "Naive"){
    eCheckBox.disabled = true;
	eCheckBox.checked = false;
	displayCode = naiveCode;
	eText.style = "color:LightGray;";
	colorCheckBox.disabled = true;
	colorCheckBox.checked = false;
	colorText.style = "color:LightGray;";
	typeText.innerHTML = "Line Drawing";
	drawButton.innerHTML = "Draw New Line";
  } else if(algorithmSelect.value == "tri"){
    eCheckBox.disabled = true;
	eCheckBox.checked = false;
	displayCode = triCode;
	eText.style = "color:LightGray;";
	colorCheckBox.disabled = false;
	colorText.style = "color:Black";
	typeText.innerHTML = "Triangle Drawing";
	drawButton.innerHTML = "Draw New Triangle";
  }
  render();
}

function createNew(){
  if(algorithmSelect.value == "tri")
	createNewTri();
  else
	createNewLine();
  render();
}

window.onload = init;