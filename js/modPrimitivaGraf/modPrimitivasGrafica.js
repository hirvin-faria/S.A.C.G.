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

        // Translate the object
        glMatrix.mat4.translate(
            modelViewMatrix,
            modelViewMatrix,
            object.objectData.translationArray);

        //cubeRotation += deltaTime;
        // Rotate around the X axis
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            object.objectData.rotationArray[0] + cubeRotation,
            [1, 0, 0]);
        // Rotate around the Y axis
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            object.objectData.rotationArray[1] + cubeRotation * .7,
            [0, 1, 0]);
        // Rotate around the Z axis
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            object.objectData.rotationArray[2] + cubeRotation * .4,
            [0, 0, 1]);
            
        // Scale the object
        glMatrix.mat4.scale(
            modelViewMatrix,
            modelViewMatrix,
            object.objectData.scaleArray);

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

// Initializes variables used throughout the execution
var objectsToDraw = [];

// Initializes constants for the page elements 
const colorSelector = document.querySelector("#cor");
const sliderTransX = document.querySelector("#sliderTransX");
const sliderTransY = document.querySelector("#sliderTransY");
const sliderTransZ = document.querySelector("#sliderTransZ");
const sliderScaleX = document.querySelector("#sliderScaleX");
const sliderScaleY = document.querySelector("#sliderScaleY");
const sliderScaleZ = document.querySelector("#sliderScaleZ");
const sliderRotationX = document.querySelector("#sliderRotationX");
const sliderRotationY = document.querySelector("#sliderRotationY");
const sliderRotationZ = document.querySelector("#sliderRotationZ");

const labelTransX = document.querySelector("#labelTransX");
const labelTransY = document.querySelector("#labelTransY");
const labelTransZ = document.querySelector("#labelTransZ");
const labelScaleX = document.querySelector("#labelScaleX");
const labelScaleY = document.querySelector("#labelScaleY");
const labelScaleZ = document.querySelector("#labelScaleZ");
const labelRotationX = document.querySelector("#labelRotationX");
const labelRotationY = document.querySelector("#labelRotationY");
const labelRotationZ = document.querySelector("#labelRotationZ");


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


    // Sets the handler for the sliders
    sliderTransX.addEventListener("input", function(){
        if(objectsToDraw.length > 0) {
            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            const newValue = parseFloat(sliderTransX.value);

            labelTransX.innerHTML = `Translação X: ` + newValue;
            drawnObject.objectData.translationArray[0] = newValue;
        }
    });
    sliderTransY.addEventListener("input", function(){
        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            const newValue = parseFloat(sliderTransY.value);

            labelTransY.innerHTML = `Translação Y: ` + newValue;
            drawnObject.objectData.translationArray[1] = newValue;
        }
    });
    sliderTransZ.addEventListener("input", function(){
        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            const newValue = parseFloat(sliderTransZ.value);

            labelTransZ.innerHTML = `Translação Z: ` + newValue;
            drawnObject.objectData.translationArray[2] = newValue-6;
        }
    });
    sliderScaleX.addEventListener("input", function(){
        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            const newValue = parseFloat(sliderScaleX.value);

            labelScaleX.innerHTML = `Escala X: ` + newValue;
            drawnObject.objectData.scaleArray[0] = newValue;
        }
    });
    sliderScaleY.addEventListener("input", function(){
        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            const newValue = parseFloat(sliderScaleY.value);

            labelScaleY.innerHTML = `Escala Y: ` + newValue;
            drawnObject.objectData.scaleArray[1] = newValue;
        }
    });
    sliderScaleZ.addEventListener("input", function(){
        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            const newValue = parseFloat(sliderScaleZ.value);

            labelScaleZ.innerHTML = `Escala Z: ` + newValue;
            drawnObject.objectData.scaleArray[2] = newValue;
        }
    });
    sliderRotationX.addEventListener("input", function(){
        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            const newValue = parseFloat(sliderRotationX.value) * (Math.PI/180);

            labelRotationX.innerHTML = `Rotação X: ` + sliderRotationX.value;
            drawnObject.objectData.rotationArray[0] = newValue;
        }
    });
    sliderRotationY.addEventListener("input", function(){
        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            const newValue = parseFloat(sliderRotationY.value) * (Math.PI/180);

            labelRotationY.innerHTML = `Rotação Y: ` + sliderRotationY.value;
            drawnObject.objectData.rotationArray[1] = newValue;
        }
    });
    sliderRotationZ.addEventListener("input", function(){
        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            const newValue = parseFloat(sliderRotationZ.value) * (Math.PI/180);

            labelRotationZ.innerHTML = `Rotação Z: ` + sliderRotationZ.value;
            drawnObject.objectData.rotationArray[2] = newValue;
        }
    });


    // Handles the Add button click
    const btnAdicionar = document.querySelector("#criar-primitiva");
    const shapeSelector = document.querySelector("#formas-seletor");
    btnAdicionar.onclick = function (){

        // Gets the data from the form
        // Color
        const redHex = colorSelector.value[1] + colorSelector.value[2];
        const redInt = parseInt(redHex, 16);
        const red = redInt / 255;
        const greenHex = colorSelector.value[3] + colorSelector.value[4];
        const greenInt = parseInt(greenHex, 16);
        const green = greenInt / 255;
        const blueHex = colorSelector.value[5] + colorSelector.value[6];
        const blueInt = parseInt(blueHex, 16);
        const blue = blueInt / 255;
        const alpha = 1.0;

        // Translation
        const translationX = parseFloat(sliderTransX.value);
        const translationY = parseFloat(sliderTransY.value);
        const translationZ = parseFloat(sliderTransZ.value);

        // Scale
        const scaleX = parseFloat(sliderScaleX.value);
        const scaleY = parseFloat(sliderScaleY.value);
        const scaleZ = parseFloat(sliderScaleZ.value);

        // Rotation
        const rotationX = parseFloat(sliderRotationX.value) * (Math.PI / 180);
        console.log(rotationX);
        const rotationY = parseFloat(sliderRotationY.value) * (Math.PI / 180);
        console.log(rotationY);
        const rotationZ = parseFloat(sliderRotationZ.value) * (Math.PI / 180);
        console.log(rotationZ);

        const objData = {
            colorArray: [red, green, blue, alpha],
            // * * * * REMOVER -6 
            translationArray: [translationX, translationY, translationZ - 6],
            scaleArray: [scaleX, scaleY, scaleZ],
            rotationArray: [rotationX, rotationY, rotationZ],
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