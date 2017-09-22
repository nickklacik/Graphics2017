function arrayToColor(rgb){
  return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
}

var bool = false;
function animate(){
  render(bool = !bool)
}

function init(){
  var canvas = document.getElementById("viewport-main");
  
  canvas.addEventListener('click', function(e) {
	for(var i = 0; i<=3000; i += 200){
      setTimeout(animate, i);
	}
  });
  render(false);
}

function render(clicked){
  var canvas = document.getElementById("viewport-main");
  var ctx = canvas.getContext('2d');
  canvas.addEventListener('click', function(e) {});
  
  brown = [51,25,0];
  skin = [255,204,153];
  white = [255,255,255];
  black = [0,0,0];
  blue = [0,0,255]
  //hair
  ctx.fillStyle = arrayToColor(brown);
  ctx.fillRect(80, 80, 240, 80);
  
  //head
  ctx.fillStyle = arrayToColor(skin);
  ctx.fillRect(100, 100, 200, 200);
  
  //eyes
  ctx.fillStyle = arrayToColor(white);
  ctx.fillRect(130, 140, 40, 40);
  
  ctx.fillStyle = arrayToColor(white);
  ctx.fillRect(230, 140, 40, 40);
  
  //irises
  ctx.fillStyle = arrayToColor(blue);
  ctx.fillRect(140, 150, 20, 20);
  
  ctx.fillStyle = arrayToColor(blue);
  ctx.fillRect(240, 150, 20, 20);
  
  //puplis
  ctx.fillStyle = arrayToColor(black);
  ctx.fillRect(145, 155, 10, 10);
  
  ctx.fillStyle = arrayToColor(black);
  ctx.fillRect(245, 155, 10, 10);
  
  //eyebrows
  if(clicked){
    ctx.fillStyle = arrayToColor(brown);
    ctx.fillRect(130, 110, 40, 10);
	
    ctx.fillStyle = arrayToColor(brown);
    ctx.fillRect(230, 110, 40, 10);
  }
  else{
	ctx.fillStyle = arrayToColor(brown);
    ctx.fillRect(130, 120, 40, 10);
  
    ctx.fillStyle = arrayToColor(brown);
    ctx.fillRect(230, 120, 40, 10);
  }
  
  //nose
  ctx.fillStyle = arrayToColor(black);
  ctx.fillRect(180, 200, 10, 10);
  
  ctx.fillStyle = arrayToColor(black);
  ctx.fillRect(210, 200, 10, 10);
  
  //mouth
  if(!clicked){
    ctx.fillStyle = arrayToColor(black);
    ctx.fillRect(140, 240, 120, 30);
  }

}

window.onload = init;