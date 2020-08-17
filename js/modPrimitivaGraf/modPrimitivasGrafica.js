var cubeRotation = 0.0;

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

// This function returns a list of shader programs that 
// will be used throughout the application
function createProgramList(gl) {

    const shaderProgramGeneric = initializeProgram(gl, vertexShaderSourceGeneric, fragmentShaderSourceGeneric);
    const shaderProgramGenericInfo = {
        program: shaderProgramGeneric,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgramGeneric, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(shaderProgramGeneric, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgramGeneric, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgramGeneric, "uModelViewMatrix"),
        },
    };

    const shaderProgramCircle = initializeProgram(gl, vertexShaderSourceCircle, fragmentShaderSourceGeneric);
    const shaderProgramCircleInfo = {
        program: shaderProgramCircle,
        attribLocations: {
            vertexId: gl.getAttribLocation(shaderProgramCircle, "aVertexId"),
            vertexColor: gl.getAttribLocation(shaderProgramCircle, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgramCircle, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgramCircle, "uModelViewMatrix"),
            numVerts: gl.getUniformLocation(shaderProgramCircle, "uNumVerts"),
            resolution: gl.getUniformLocation(shaderProgramCircle, "uResolution"),
        },
    };


    return {
        shaderProgramGeneric: shaderProgramGenericInfo,
        shaderProgramCircle: shaderProgramCircleInfo,
    }
}

function createBuffer(gl, shape, colorArray) {

    const vertexDimension = shape.vertexDimension;
    const vertexCount = shape.vertexCount;
    
    // Makes a color array for the buffer
    // with the same color for all vertices
    var colors = [];
    for(var i = 0; i < vertexCount; i++) {
        colorArray.forEach(function(object) {
            colors.push(object);
        });
    }
    // Creates the color buffer
    const newColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, newColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // The buffer data is different if the shape is a circle
    if (shape == shapes.circle) {

        // Creates positions buffer
        const numVerts = vertexCount * 3;
        const vertexIds = new Float32Array(numVerts);
        vertexIds.forEach((v, i) => {
            vertexIds[i] = i;
        });
        const newPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, newPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexIds, gl.STATIC_DRAW);

        return {
            positionBuffer: newPosBuffer,
            colorBuffer: newColorBuffer,
            vertexDimension: vertexDimension,
            vertexCount: vertexCount,
        }

    } else {

        // Creates the position buffer
        const newPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, newPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.positions), gl.STATIC_DRAW);

        // Creates a index buffer for to create the shapes
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

        return {
            positionBuffer: newPosBuffer,
            colorBuffer: newColorBuffer,
            indexBuffer: indexBuffer,
            vertexDimension: vertexDimension,
            vertexCount: vertexCount,
        }
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
        
        // Tell webgl to use our program when drawing
        gl.useProgram(object.programInfo.program);

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

        // Rotate around the X axis
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            object.objectData.rotationArray[0],
            [1, 0, 0]);
        // Rotate around the Y axis
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            object.objectData.rotationArray[1],
            [0, 1, 0]);
        // Rotate around the Z axis
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            object.objectData.rotationArray[2],
            [0, 0, 1]);
            
        // Scale the object
        glMatrix.mat4.scale(
            modelViewMatrix,
            modelViewMatrix,
            object.objectData.scaleArray);

        
        // Tells webgl how to pull the positions from the
        // buffer data to the program 
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
        
        // Attributes and uniforms that are set in case the program wants to draw a circle
        if(object.programInfo == programList.shaderProgramCircle){
            
            // Vertex id buffer 
            {
                const numComponents = object.bufferInfo.vertexDimension;
                const type = gl.FLOAT;
                const normalize = false;
                const offset = 0;
                const stride = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, object.bufferInfo.positionBuffer);
                gl.vertexAttribPointer(
                    object.programInfo.attribLocations.vertexId,
                    numComponents,
                    type,
                    normalize,
                    offset,
                    stride);
                gl.enableVertexAttribArray(object.programInfo.attribLocations.vertexId);
            }

            // Tell the shader the number of vertices
            gl.uniform1f(object.programInfo.uniformLocations.numVerts, object.bufferInfo.vertexCount);
            // Tell the shader the resolution
            gl.uniform2f(object.programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);

        // Attributes and uniforms for the generic shapes
        } else {

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
            

            // Tell webgl which buffer to get to index for the element's indices
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.bufferInfo.indexBuffer);
        }


        // Set the shader uniforms
        gl.uniformMatrix4fv(
            object.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            object.programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

        if(object.programInfo == programList.shaderProgramCircle){
            const vertexCount = object.bufferInfo.vertexCount;
            const offset = 0;
            gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
        }
        else {

            const vertexCount = object.bufferInfo.vertexCount;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
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

// Loads the program and stores info
var programList;

// Main program
function main() {

    // Gets the gl context from the canvas
    const gl = document.querySelector("#tela-desenho").getContext("webgl");

    programList = createProgramList(gl)

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
    colorSelector.addEventListener("input", function(){

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

        const newValue = [red, green, blue, alpha];

        if(objectsToDraw.length > 0) {
            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            drawnObject.objectData.colorArray = newValue;
        }
    });
    sliderTransX.addEventListener("input", function(){

        const newValue = parseFloat(sliderTransX.value);
        labelTransX.innerHTML = Number((newValue).toFixed(1));

        if(objectsToDraw.length > 0) {
            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            drawnObject.objectData.translationArray[0] = newValue;
        }
    });
    sliderTransY.addEventListener("input", function(){
        
        const newValue = parseFloat(sliderTransY.value);
        labelTransY.innerHTML = Number((newValue).toFixed(1));

        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            drawnObject.objectData.translationArray[1] = newValue;
        }
    });
    sliderTransZ.addEventListener("input", function(){

        const newValue = parseFloat(sliderTransZ.value);
        labelTransZ.innerHTML = Number((newValue).toFixed(1));

        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            drawnObject.objectData.translationArray[2] = newValue-9;
        }
    });
    sliderScaleX.addEventListener("input", function(){
        
        const newValue = parseFloat(sliderScaleX.value);
        labelScaleX.innerHTML = Number((newValue).toFixed(1));

        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            drawnObject.objectData.scaleArray[0] = newValue;
        }
    });
    sliderScaleY.addEventListener("input", function(){

        const newValue = parseFloat(sliderScaleY.value);
        labelScaleY.innerHTML = Number((newValue).toFixed(1));

        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            drawnObject.objectData.scaleArray[1] = newValue;
        }
    });
    sliderScaleZ.addEventListener("input", function(){

        const newValue = parseFloat(sliderScaleZ.value);
        labelScaleZ.innerHTML = Number((newValue).toFixed(1));

        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            drawnObject.objectData.scaleArray[2] = newValue;
        }
    });
    sliderRotationX.addEventListener("input", function(){

        const newValue = parseFloat(sliderRotationX.value) * (Math.PI/180);
        labelRotationX.innerHTML = Math.round(sliderRotationX.value);

        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            drawnObject.objectData.rotationArray[0] = newValue;
        }
    });
    sliderRotationY.addEventListener("input", function(){

        const newValue = parseFloat(sliderRotationY.value) * (Math.PI/180);
        labelRotationY.innerHTML = Math.round(sliderRotationY.value);

        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
            drawnObject.objectData.rotationArray[1] = newValue;
        }
    });
    sliderRotationZ.addEventListener("input", function(){

        const newValue = parseFloat(sliderRotationZ.value) * (Math.PI/180);
        labelRotationZ.innerHTML = Math.round(sliderRotationZ.value);

        if(objectsToDraw.length > 0) {

            const drawnObject = objectsToDraw[objectsToDraw.length-1];
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
            translationArray: [translationX, translationY, translationZ - 9],
            scaleArray: [scaleX, scaleY, scaleZ],
            rotationArray: [rotationX, rotationY, rotationZ],
        };

        // Creates a buffer based on selected shader=pe
        const selectedShapeIndex = shapeSelector.selectedIndex;
        const selectedShape = shapeSelector.options[selectedShapeIndex].value;
        var programInfo;
        var newShape;
        switch(selectedShapeIndex){
            case 0:
                newShape = shapes.triangle;
                programInfo = programList.shaderProgramGeneric;
                break;
            case 1:
                newShape = shapes.square;
                programInfo = programList.shaderProgramGeneric;
                break;
            case 2:
                newShape = shapes.circle;
                programInfo = programList.shaderProgramCircle;
                break;
            case 3:
                newShape = shapes.cube;
                programInfo = programList.shaderProgramGeneric;
                break;
            case 4:
                newShape = shapes.pyramid;
                programInfo = programList.shaderProgramGeneric;
                break;
            default:
                newShape = shapes.square;
                programInfo = programList.shaderProgramGeneric;
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