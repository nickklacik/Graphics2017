var projection;	// NEW! global variable for projection matrix
var modelview; 	// NEW! global variable for the modeling/view tranformations
var isOrtho = true; // NEW! global boolean variable to assist togglePerspective()

// NEW! set up a simple orthographic projection matrix
projection = ortho(-10, 10, -10, 10, -10, 10);

// NEW! change the camera angle to yield an axonometric view
modelview = rotate(-75, vec3(1,0,0));
modelview = mult(modelview, rotate(30, vec3(0,0,1)));

/* Initialize global WebGL stuff - not object specific */
function initGL(){
    // local variable to hold a reference to an HTML5 canvas
    var canvas = document.getElementById( "gl-canvas" );

    // obtain a WebGL context bound to our canvas
    var gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height ); // use the whole canvas
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 ); // background color
	gl.enable(gl.DEPTH_TEST); // NEW! make sure the GPU draws back to front

    return gl; // send this back so that other parts of the program can use it
}

/* Load shaders and initialize attribute pointers. */
function loadShaderProgram(gl){
    // use the existing program if given, otherwise use our own defaults
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    // get the position attribute and save it to our program object
    //   then enable the vertex attribute array
    program.vposLoc = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( program.vposLoc );
    // get the address of the uniform variable and save it to our program object
    program.colorLoc = gl.getUniformLocation( program, "color" );

	// NEW! send the global projection and view matrices to the shader program
	program.projLoc = gl.getUniformLocation(program, "proj");
	program.mvLoc = gl.getUniformLocation(program, "mv");
	
    return program; // send this back so that other parts of the program can use it
}

/* Global render callback to draw all objects */
function renderToContext(drawables, gl){
    // inner-scoped function for closure trickery
    function renderScene(){
        renderToContext(drawables, gl);
    }

    // start from a clean frame buffer for this frame
    gl.clear( gl.COLOR_BUFFER_BIT);

    drawables.forEach(function(obj){ // loop over all objects and draw each
        obj.draw(gl);
    });

    // queue up this same callback for the next frame
    requestAnimFrame(renderScene);
}

/* Constructor for a grid object (initializes the data). */
function Grid(gl, program, color){
    this.program = program; // save my shader program
    this.color = color; // the color of this grid surface
    this.vertices = mkstrip(); // this array will hold raw vertex positions
    this.vBufferId = gl.createBuffer(); // reserve a buffer object and store a reference to it

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferId ); // set active array buffer
    // pass data to the graphics hardware (convert JS Array to a typed array)
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW );

}

/* Method allows an object to render itself */
Grid.prototype.draw = function(gl){
    gl.useProgram( this.program ); // set the current shader programs

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferId ); // set pos buffer active
    // map position buffer data to the corresponding vertex shader attribute
    gl.vertexAttribPointer( this.program.vposLoc, 3, gl.FLOAT, false, 0, 0 );

    // send this object's color down to the GPU as a uniform variable
    gl.uniform4fv(this.program.colorLoc, flatten(this.color));

	// NEW! send the global projection and view matirces to the shader program
	gl.uniformMatrix4fv(this.program.projLoc, gl.FALSE, flatten(projection));
	gl.uniformMatrix4fv(this.program.mvLoc, gl.FALSE, flatten(modelview));
	
    // render the primitives!
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertices.length);
}

/* Build a grid with random heights using triangle strips. */
function mkstrip(){
    var N = 11, h, i, j; // best practice in JS is to declare our variables up front
    var points = []; // to hold the individual coordinate triples
    var vertices = []; // to hold the vertices to be drawn as tri-strips

    // generate a thin 10x10 grid (really 11x11 points) with random heights
    for (j = 0; j < N; j++) {
        for (i = 0; i < N; i++) {
            h = Math.random();
            points.push( vec3(-10+i*2, -10+j*2, h) ); // NEW! scale grid by 10 in X and Y
        }
    }

    // fill up the vertices array with the necessary points
    for (i = 0; i < N; i++) {
        vertices.push(points[i], points[i+N]);
    }
    for (j = 1; j < (N-1); j++) {
        vertices.push(points[(j+1)*N-1], points[j*N]);
        for (i = 0; i < N; i++) {
            vertices.push(points[i+j*N], points[i+(j+1)*N]);
        }
    }
    console.log(points.length);
    console.log(vertices.length);
    return vertices;
}

/* NEW! toggles orthographic and perspective views*/
function togglePerspective(){
	var dx = 10, dy = 20, dz = -5;
	if(isOrtho){
		projection = perspective(60, 1, 0.01 , 20);
		modelview = mult(modelview, translate(dx, dy, dz)); 
	}
	else {
		projection = ortho(-10, 10, -10, 10, -10, 10);
		modelview = mult(modelview, translate(-dx, -dy, -dz));
	}
	
	isOrtho = !isOrtho;
}

/* Set up event callback to start the application */
window.onload = function(){
    
    // local variable to hold reference to our WebGL context
    var gl = initGL(); // basic WebGL setup for the scene
    var prog = loadShaderProgram(gl);

    // event listener on the button will set the color of each drawable object
    document.getElementById("colorBtn").addEventListener("click",function(){
        var color = vec4( document.getElementById("redIn").value,
                          document.getElementById("greenIn").value,
                          document.getElementById("blueIn").value,
                          1.0);
        drawables.forEach(function(obj){
            obj.color = color;
        });
    });

    var drawables = []; // used to store a list of objects that need to be drawn

    // create a grid object and add it to the list
    drawables.push( new Grid(gl, prog, vec4(1,0,0,1)) );

    renderToContext(drawables, gl); // start drawing the scene
}

