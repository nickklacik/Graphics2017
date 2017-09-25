var canvas; // global to hold reference to an HTML5 canvas
var gl; // global to hold reference to out WebGL contextual

var vetices; // used to store any objects that need to be drawn

var program; // global to hold compiled shader programs
var vposLoc; // global to hold reference to vertex attributes
var vBufferId; // global to hold refernce to vertex buffer objects

/* Initialize global WebGL stuff - not object specific */
function initGL() {
	// look up out canvas element
	canvas = document.getElementById("gl-canvas");
	
	// obtain a WebGL context bound to our canvas
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available"); }
	
	initShaderProgram();
	initData();
	
	gl.viewport(0, 0, canvas.width, canvas.height); // use the whole canvas
	gl.clearColor( 0.0, 0.0, 0.0, 1.0); // background color
}

/* Initialize the data for a triangle strip. */
function initData(){
	vertices = mkstrip(); // this array will hold raw vertex positions
	
	vBufferId = gl.createBuffer(); //reserve a buffer object
	gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId); // set active array buffer
	
	// pass data to the graphics hardware (convert JS Array to a typed array)
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
}

/* Build a triangle strip with random heights. */
function mkstrip(){
	var x, h, n, i; // best practice in JS to declare our variables up front
	var points = []; // to hold the individual coordinate triples
	var vertices = []; // to hold the vertices to be drawn as tri-strips
	
	// generate a thin 2x10 grid of points with random heights
	x = -1.0;
	for(i = 0; i < 11; i++) {
		h = Math.random();
		points.push( vec3(-1.0+i*0.2, 0.2, h));
	}
	for(i = 0; i < 11; i++) {
		h = Math.random();
		points.push( vec3(-1.0+i*0.2, -0.2, h));
	}
	// fill up the vertices array with the necessary points
	for(i = 0; i < 11; i++) {
		vertices.push(points[i], points[i+11]);
	}
	return vertices;
}

/* Load shaders and initialize attribute pointers */
function initShaderProgram(){
	// use existing program if given, otherwise use our own defaultStatus
	program = initShaders( gl, "vertex-shader", "fragment-shader");
	
	// get the position attribute and save it to our program
	// 		then enable the vertex attribute array
	vposLoc = gl.getAttribLocation( program, "vPosition" );
	gl.enableVertexAttribArray(vposLoc);
}

/* Global render callback to draw all objects */
function renderScene(){
	// start from a clean frame buffer for this frame
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.useProgram(program); // set the shader programs
	
	gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId); // set pos buffer active
	// map position buffer data to the corresponding vertex shader attribute
	gl.vertexAttribPointer( program.vposLoc, 3, gl.FLOAT, false, 0, 0);
	
	// render the primitives!
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);
	
	// queue up this same callback for the next frame
	requestAnimFrame(renderScene);
}

/* Set up event callback to start the application */
window.onload = function() {
	initGL(); // basic WebGL setup for the scene
	renderScene(); // start drawing the scene
}