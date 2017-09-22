function arrayToColor(rgb){
  return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
}

function render(){
  var canvas = document.getElementById("viewport-main");
  var ctx = canvas.getContext('2d');
  canvas.addEventListener('click', function(e) {});

}

window.onload = render;