/*
 * Computer Graphics - Lab #1
 * Part A - Alpha Compositing
 *
 * Modify this example so that...
 *   - the alpha slider value indicates the opacity of the third rectangle
 *   - the intersections of the initial three rectangles have colors computed
 *     using the standard linear interpolation method for alpha compisiting
 *   - you can achieve this by drawing two new rectangles directly on top of
 *     the intersections of the original three rectangles
 */

function arrayToColor(rgb){
  return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
}

function render(alpha){
  var canvas = document.getElementById("viewport-main");
  var ctx = canvas.getContext('2d');

  color1 = [255,0,255];
  color2 = [255,255,0];
  color3 = [0,216,255];

  ctx.fillStyle = arrayToColor(color1);
  ctx.fillRect(200, 100, 200, 160);

  ctx.fillStyle = arrayToColor(color2);
  ctx.fillRect(640, 150, 100, 480);

  ctx.fillStyle = arrayToColor(color3);
  ctx.fillRect(320, 200, 640, 240);
}

window.onload = render;

