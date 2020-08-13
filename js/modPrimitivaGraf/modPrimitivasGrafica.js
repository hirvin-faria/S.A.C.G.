// * * * 
// Shader Sources
// * * *
var cubeRotation = 0.0;
// 2D Shaders
const vertexShaderSource2d = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }
`;
const fragmentShaderSource2d = `
    varying lowp vec4 vColor;

    void main() {
        gl_FragColor = vColor;
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

// Shape vertex positions
// Triangle
const shapes = {
    triangle: {
        positions: [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
        ],
        indices: [
            0, 1, 2,
        ],
        vertexDimension: 2,
        vertexCount: 3,
    },
    square: {
        positions: [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
        ],
        indices: [
            0, 1, 2,
            1, 2, 3,
        ],
        vertexDimension: 2,
        vertexCount: 4,
    },
    cube: {
        positions: [
            // Front
            0.0, 0.0, 1.0,
            0.0, 1.0, 1.0,
            1.0, 0.0, 1.0,
            1.0, 1.0, 1.0,
        
            // Back
            0.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 1.0, 0.0,
            
            // Top
            0.0, 1.0, 0.0,
            0.0, 1.0, 1.0,
            1.0, 1.0, 0.0,
            1.0, 1.0, 1.0,
        
            // Bottom
            0.0, 0.0, 0.0,
            0.0, 0.0, 1.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 1.0,
            
            // Right
            1.0, 0.0, 0.0,
            1.0, 0.0, 1.0,
            1.0, 1.0, 0.0,
            1.0, 1.0, 1.0,
        
            // Left
            0.0, 0.0, 0.0,
            0.0, 0.0, 1.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 1.0,
        ],
        indices: [
            0,  1,  2,    1,  2,  3,    // Front
            4,  5,  6,    5,  6,  7,    // Back
            8,  9,  10,   9,  10, 11,   // Top
            12, 13, 14,   13, 14, 15,   // Bottom
            16, 17, 18,   17, 18, 19,   // Left
            20, 21, 22,   21, 22, 23,   // Right
        ],
        vertexDimension: 3,
        vertexCount: 36,
    },
}

function createBuffer(gl, shape, colorArray) {

    const vertexDimension = shape.vertexDimension;
    const vertexCount = shape.vertexCount;
    // Creates the position buffer
    const newPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, newPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.positions), gl.STATIC_DRAW);

    // Creates a index buffer for to create the shapes
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

    // Makes a color array for the buffer
    // with the same color for all vertices
    var colors = [];
    for(var i = 0; i < vertexCount; i++) {
        colorArray.forEach(function(object) {
            colors.push(object);
        });
    }
    console.log(colors.length);
    console.log(colors);
    // Creates the color buffer
    const newColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, newColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


    return {
        positionBuffer: newPosBuffer,
        colorBuffer: newColorBuffer,
        indexBuffer: indexBuffer,
        vertexDimension: vertexDimension,
        vertexCount: vertexCount,
    }
}

// Drawing function
function drawScene(gl, objectsToDraw, deltaTime){

    // Initial canvas setup
    gl.clearColor(0.9, 0.9, 1.0, 1.0);
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

        glMatrix.mat4.translate(
            modelViewMatrix,
            modelViewMatrix,
            object.objectData.translationArray);

        //cubeRotation += deltaTime;
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            cubeRotation,
            [0, 0, 1]);
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            cubeRotation * .7,
            [0, 1, 0]);
            
        const scaleValues = [
            object.objectData.scale.x,
            object.objectData.scale.y,
            0];
        glMatrix.mat4.scale(
            modelViewMatrix,
            modelViewMatrix,
            scaleValues);

        // Tells webgl how to pull the positions from the
        // buffer data to the program 
        // Position buffer
        {
            const numComponents = object.bufferInfo.vertexDimension;
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
        
        // Color buffer
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, object.bufferInfo.colorBuffer);
            gl.vertexAttribPointer(
                object.programInfo.attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(object.programInfo.attribLocations.vertexColor);
        }

        // Tell webgl which buffer to get to index for the element's indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.bufferInfo.indexBuffer);

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
            const vertexCount = object.bufferInfo.vertexCount;
            const type = gl.FLOAT;
            const offset = 0;
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

    var then = 0.0;
    function render(now){
        now *= 0.001;
        const deltaTime = now - then;
        then = now;

        drawScene(gl, objectsToDraw, deltaTime);

        requestAnimationFrame(render);
    }   
    requestAnimationFrame(render);

    // Handles the Add button click
    const btnAdicionar = document.querySelector("#criar-primitiva");
    const shapeSelector = document.querySelector("#formas-seletor");
    btnAdicionar.onclick = function (){

        // Gets the data from the form
        const translationX = parseFloat(document.querySelector("#trans-x").value);
        const translationY = parseFloat(document.querySelector("#trans-y").value);
        const translationZ = parseFloat(document.querySelector("#trans-z").value);
        const colorR = parseFloat(document.querySelector("#cor-r").value);
        const colorG = parseFloat(document.querySelector("#cor-g").value);
        const colorB = parseFloat(document.querySelector("#cor-b").value);
        const alpha = 1.0;
        const scaleX = parseFloat(document.querySelector("#escala-x").value);
        const scaleY = parseFloat(document.querySelector("#escala-y").value);
        const rotation = parseFloat(document.querySelector("#rotacao").value) * (Math.PI / 180);

        const objData = {
            colorArray: [colorR, colorG, colorB, alpha],
            // * * * * REMOVER -6 
            translationArray: [translationX, translationY, translationZ-6],
            scale: {
                x: scaleX,
                y: scaleY,
            },
            rotation: rotation,
        };

        // Creates a buffer based on selected shader=pe
        const selectedShapeIndex = shapeSelector.selectedIndex;
        const selectedShape = shapeSelector.options[selectedShapeIndex].value;
        var newShape;
        switch(selectedShapeIndex){
            case 0:
                newShape = shapes.triangle;
                break;
            case 1:
                newShape = shapes.square;
                break;
            case 2:
                newShape = shapes.square;
                break;
            case 3:
                newShape = shapes.cube;
                break;
            case 4:
                newShape = shapes.square;
                break;
            default:
                newShape = shapes.square;
                break;
        }

        const newBuffer = createBuffer(gl, newShape, objData.colorArray);

        // Pushes a new shape into objecs array
        objectsToDraw.push({
            programInfo: programInfo,
            bufferInfo: newBuffer,
            objectData: objData,
        });
    };

    // Handles the delete button click 
    const btnRemover = document.querySelector("#apagar-primitiva");
    btnRemover.onclick = function (){
        objectsToDraw.pop();
    };
}

window.onload = main;