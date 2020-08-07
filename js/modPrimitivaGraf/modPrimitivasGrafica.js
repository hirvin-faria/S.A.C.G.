// * * * 
// Shader Sources
// * * *

// 2D Shaders
const vertexShaderSource2d = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }
`;
const fragmentShaderSource2d = `
    varying lowp vec4 vColor;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
`;


// 3D Shaders
const vertexShaderSource3d = ``
const fragmentShaderSource3d = ``;


// Loads and compiles a shader of a given type from a source
function loadShader(gl, type, shaderSource){

    const shader = gl.createShader(type);

    gl.shaderSource(shader, shaderSource);

    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Shader compilation failed: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Attaches shaders and links a program from a vsSource and a fsSource
function initializeProgram(gl, vsSource, fsSource) {

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert(" Program linking error: " + gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

// Buffer info functions
// Functions that create the buffer info
// for each of the shapes
function createTriangleBuffer(gl){

    const newPosBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, newPosBuffer);

    positions = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        positionBuffer: newPosBuffer,
    }
}
function createSquareBuffer(gl){

    const newPosBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, newPosBuffer);

    positions = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        positionBuffer: newPosBuffer,
    }
}

// Drawing function
function drawScene(gl, objectsToDraw, deltaTime){

    // Initial canvas setup
    gl.clearColor(1.0, 1.0, 0.9, 1.0);
    gl.clearDepth(1.0);                 
    gl.enable(gl.DEPTH_TEST);          
    gl.depthFunc(gl.LEQUAL);            

    // Clear the canvas before drawing
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Drawing loop for each object to draw
    objectsToDraw.forEach(function (object){
        console.log("Desenhando");
        // Create the projection matrix
        // this matrix is responsible for the 
        // camera view on the object
        const projectionMatrix = glMatrix.mat4.create();
        const fieldOfView = 45 * Math.PI/180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100;
        
        glMatrix.mat4.perspective(
            projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);

        // Creates the model view matrix
        // this matrix is responsible for 
        // translation, rotations and transposition
        const modelViewMatrix = glMatrix.mat4.create();
        const translationValues = [
            object.transformations.translation.x,
            object.transformations.translation.y,
            object.transformations.translation.z-6];

        glMatrix.mat4.translate(
            modelViewMatrix,
            modelViewMatrix,
            translationValues);

        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            object.transformations.rotation,
            [0, 0, 1]);
            
        const scaleValues = [
            object.transformations.scale.x,
            object.transformations.scale.y,
            0];
        glMatrix.mat4.scale(
            modelViewMatrix,
            modelViewMatrix,
            scaleValues);

        // Tells webgl how to pull the positions from the buffer
        // data to the program 
        // Position buffer
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, object.bufferInfo.positionBuffer);
            gl.vertexAttribPointer(
                object.programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(object.programInfo.attribLocations.vertexPosition);
        }

        // Tell webgl to use our program when drawing
        gl.useProgram(object.programInfo.program);
        

        // Set the shader uniforms
        gl.uniformMatrix4fv(
            object.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            object.programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    });

}

var objectsToDraw = [];

// Main program
function main() {

    // Gets the gl context from the canvas
    const canvas = document.querySelector("#tela-desenho");
    const gl = canvas.getContext("webgl");

    // Loads the program and stores info
    const shaderProgram2d = initializeProgram(gl, vertexShaderSource2d, fragmentShaderSource2d);
    const programInfo = {
        program: shaderProgram2d,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram2d, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(shaderProgram2d, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram2d, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram2d, "uModelViewMatrix"),
        },
    };

    // DEBUG
    /*
    objectsToDraw.push({
        programInfo: programInfo,
        bufferInfo: createTriangleBuffer(gl),
    });
    */
    // DEBUG

    var then = 0.0;
    function render(now){
        now *= 0.001;
        const deltaTime = now - then;
        then = now;

        drawScene(gl, objectsToDraw, deltaTime);

        requestAnimationFrame(render);
    }   
    requestAnimationFrame(render);

    // Handles the button click
    const btnAdicionar = document.querySelector("#criar-primitiva");
    const shapeSelector = document.querySelector("#formas-seletor");
    btnAdicionar.onclick = function (){

        // Gets the data from the form
        const translationX = document.querySelector("#trans-x").value;
        const translationY = document.querySelector("#trans-y").value;
        const translationZ = document.querySelector("#trans-z").value;
        const scaleX = document.querySelector("#escala-x").value;
        const scaleY = document.querySelector("#escala-y").value;
        const rotation = document.querySelector("#rotacao").value;
        const objTransformations = {
            translation: {
                x: translationX,
                y: translationY,
                z: translationZ,
            },
            scale: {
                x: scaleX,
                y: scaleY,
            },
            rotation: rotation,
        };

        // Creates a buffer based on selected shader=pe
        const selectedShapeIndex = shapeSelector.selectedIndex;
        const selectedShape = shapeSelector.options[selectedShapeIndex].value;
        var newBufferInfo;
        switch(selectedShapeIndex){
            case 0:
                newBufferInfo = createTriangleBuffer(gl);
                break;
            case 1:
                newBufferInfo = createSquareBuffer(gl);
                break;
            case 2:
                newBufferInfo = createSquareBuffer(gl);
                break;
            default:
                newBufferInfo = createSquareBuffer(gl);
                break;
        }

        // Pushes a new shape into objecs array
        objectsToDraw.push({
            programInfo: programInfo,
            bufferInfo: newBufferInfo,
            transformations: objTransformations,
        });
    };
}

window.onload = main;