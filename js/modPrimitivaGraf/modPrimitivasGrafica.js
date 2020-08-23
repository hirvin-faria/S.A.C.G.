// Main code
function main() {

    // Gets the gl context from the canvas
    const gl = document.querySelector("#tela-desenho").getContext("webgl");


    // Grabs All page elements
    pageElementsInfo.forEach(function(element){

        // If id is not empty, create new 
        // object with element data
        if(element.id != "") {

            var elementLabel = "";
            var elementValueDisplay = "";

            if(element.label != "")
                elementLabel = document.querySelector("#" + element.label);
            if(element.valueDisplay != "")
                elementValueDisplay = document.querySelector("#" + element.valueDisplay);
            

            pageElements[element.id] = {
                element: document.querySelector("#" + element.id),
                label: elementLabel,
                valueDisplay: elementValueDisplay,
                type: getFirstWord(element.id),
            };
        }
    });
    // pageElements.sliderTransX.element...

    // Grabs camera angle values
    cameraInfo = {
        angleRadiansX: sliderCameraX.value,
        angleRadiansY: sliderCameraY.value,
        angleRadiansZ: sliderCameraZ.value,
    }

    // Creates the program list
    programList = createProgramList(gl);

    // Main rendering loop
    var then = 0.0;
    function render(now){
        now *= 0.001;
        const deltaTime = now - then;
        then = now;

        drawScene(gl, shapesToDraw, deltaTime);

        requestAnimationFrame(render);
    }   
    requestAnimationFrame(render);


    // Sets up all page elements listeners
    pageElementsInfo.forEach(function(element){
        
        // Grabs the individual element information
        var element = pageElements[element.id].element;
        var valueDisplay = pageElements[element.id].valueDisplay;
        var type = pageElements[element.id].type;
        var dataType = removeFirstWord(element.id);
        var newValue = 0;

        // Sets up according to the type of element
        switch(type){
            case "slider":
             
                element.addEventListener("input", function() {

                    // Updates the slider's display
                    // If the value has more than 3 digits, round it 
                    if(element.value >= 100 || element.value <= -100)
                        newValue = Math.round(element.value * 10) / 10;
                    else 
                        newValue = element.value;

                    valueDisplay.innerHTML = newValue;

                    // Updates camera 
                    if (getFirstWord(dataType) == "camera") {
                        switch(dataType) {
                            case "cameraX":
                                cameraInfo.angleRadiansX = degreeToRadians(element.value);
                                break;
                            case "cameraY":
                                cameraInfo.angleRadiansY = degreeToRadians(element.value);
                                break;
                            case "cameraZ":
                                cameraInfo.angleRadiansZ = degreeToRadians(element.value);
                                break;
                        }
                    }

                    // Updates shape data, if any
                    if(shapesToDraw.length > 0) {
                        if (getFirstWord(dataType) == "rotation")
                            shapesToDraw[selectedShapeIndex].objectData[dataType] = degreeToRadians(element.value);
                        else 
                            shapesToDraw[selectedShapeIndex].objectData[dataType] = element.value;
            
                    }


                });
                break;
        }
    });
    

    // Handles the Add button click
    pageElements.buttonCreate.element.onclick = function (){

        // Puts the initial shape data into an object
        const shapeData = getShapeData(pageElementsInfo, pageElements);
        console.log(shapeData);
        

        // Creates a buffer based on selected shader=pe
        const selector = pageElements["selectorShape"].element;
        const shapeTypeSelectorIndex = selector.selectedIndex;
        //var selectedShape = selector.options[selectedShapeIndex].value;
        var programInfo;
        var newShape;
        switch(shapeTypeSelectorIndex){
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

        // Creates a new buffer with the given information
        console.log(shapeData.hueSelector);
        const newBuffer = createBuffer(gl, newShape, shapeData.hueSelector);

        // Pushes a new shape into objecs array
        shapesToDraw.push({
            programInfo: programInfo,
            bufferInfo: newBuffer,
            objectData: shapeData,
            shapeId: numShapes,
        });

        // Selects the newest added shape. Its ID is the number of shapes
        selectedShapeIndex = numShapes;

        // Increments the number of shapes
        numShapes += 1;
    };

    // Handles the delete button click 
    pageElements.buttonRemove.element.onclick = function (){
        shapesToDraw.pop();
    };
}


// Loads and compiles a shader of 
// a given type from a source
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

// Attaches shaders and links a program 
// from a vsSource and a fsSource
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


// Returns the first word of a camel case string
function getFirstWord(camelCaseString){

    var firstWord = "";

    for (var i = 0; i < camelCaseString.length; i++) {

        if(camelCaseString[i] != camelCaseString[i].toUpperCase())
            firstWord += camelCaseString[i];
        else
            break;
    }

    return firstWord;
}

// Returns the same string with the first word removed
function removeFirstWord(camelCaseString){

    var result = "";

    var i = 0;
    for(i = 0; i < camelCaseString.length; i++) {

        if(camelCaseString[i] == camelCaseString[i].toUpperCase()){
            result += camelCaseString[i].toLowerCase();
            i++;
            break;
        }
    }

    result += camelCaseString.substring(i, camelCaseString.length);
    return result;
}

// Converts a degree value to radians
function degreeToRadians(degrees){
    return degrees * (Math.PI/180);
}

// Takes a hexadecimal RGBA string and turn into an 
// array with values from 0.0 to 1.0
// Example: "#ffffff" -> [1.0, 1.0, 1.0, 1.0]
function hexRgbaToArray(rgbaString){

    const redHex = rgbaString[1] + rgbaString[2];
    const redInt = parseInt(redHex, 16);
    const red = redInt / 255;
    const greenHex = rgbaString[3] + rgbaString[4];
    const greenInt = parseInt(greenHex, 16);
    const green = greenInt / 255;
    const blueHex = rgbaString[5] + rgbaString[6];
    const blueInt = parseInt(blueHex, 16);
    const blue = blueInt / 255;
    const alpha = 1.0;

    return [red, green, blue, alpha];
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
function drawScene(gl, shapesToDraw, deltaTime){

    // Initial canvas setup for the canvas
    // this gives the scene a clear color
    gl.clearColor(0.9, 0.9, 1.0, 1.0);
    gl.clearDepth(1.0);                 
    gl.enable(gl.DEPTH_TEST);          
    gl.depthFunc(gl.LEQUAL);            
    // Clears the canvas before drawing
    // using the parameters above
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // Create the projection matrix
    // This matrix is the same for all objects in the scene
    const projectionMatrix = glMatrix.mat4.create();
    const fieldOfView = degreeToRadians(45);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100;
    glMatrix.mat4.perspective(
        projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Creates the camera matrix
    // and rotates with the camera info 
    // we have
    const cameraMatrix = glMatrix.mat4.create();
    glMatrix.mat4.rotateX(
        cameraMatrix,
        cameraMatrix,
        cameraInfo.angleRadiansX);
    glMatrix.mat4.rotateY(
        cameraMatrix,
        cameraMatrix,
        cameraInfo.angleRadiansY);
    glMatrix.mat4.rotateZ(
        cameraMatrix,
        cameraMatrix,
        cameraInfo.angleRadiansZ);

    // Creates the view matrix, which is
    // the inverse of the camera matrix
    const modelViewMatrix = cameraMatrix;
    glMatrix.mat4.invert(modelViewMatrix, cameraMatrix);

    // Create the view projection matrix, which is 
    // a combination (multiplication) of the
    // projection and view matricies
    //const viewProjectionMatrix = glMatrix.mat4.create();
    //glMatrix.mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);



    // Drawing loop for each object to draw
    shapesToDraw.forEach(function (object){
        
        // Tell webgl to use the program designated
        // for the object when drawing
        gl.useProgram(object.programInfo.program);

        // Puts the object data in convenient variables
        const translationX = object.objectData.transX;
        const translationY = object.objectData.transY;
        const translationZ = object.objectData.transZ-9;
        const translationArray = [translationX, translationY, translationZ];

        const rotationX = object.objectData.rotationX;
        const rotationY = object.objectData.rotationY;
        const rotationZ = object.objectData.rotationZ;

        const scaleX = object.objectData.scaleX;
        const scaleY = object.objectData.scaleY;
        const scaleZ = object.objectData.scaleZ;
        const scaleArray = [scaleX, scaleY, scaleZ];

        // Creates the view matrix for the object

        // Creates the model view matrix
        // this matrix is responsible for 
        // translation, rotations and transposition
        //const modelViewMatrix = glMatrix.mat4.create();
        //
        // Translate the object
        glMatrix.mat4.translate(
            modelViewMatrix,
            modelViewMatrix,
            translationArray);
        //
        // Rotate around the X axis
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            rotationX,
            [1, 0, 0]);
        // Rotate around the Y axis
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            rotationY,
            [0, 1, 0]);
        // Rotate around the Z axis
        glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            rotationZ,
            [0, 0, 1]);
        //
        // Scale the object
        glMatrix.mat4.scale(
            modelViewMatrix,
            modelViewMatrix,
            scaleArray);

        
        // * * * Begin setting up attributes below * * * 
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

var cubeRotation = 0.0;
// Initializes variables used throughout the execution
// This variable stores an array of objects with all shapes to be drawn
var shapesToDraw = [];
// This object will store camera information. Initialized in main
var cameraInfo = {
    angleRadiansX: undefined,
    angleRadiansY: undefined,
    angleRadiansZ: undefined,
};
// This object will store all page elements
var pageElements = {};
// This variable holds the id of the current selected shape
var selectedShapeIndex = -1;
//
var numShapes = 0;
// Loads the program and stores info
var programList;
// Array with all page element info
// This is used to associate the id of 
// a page element, a label and its data
var pageElementsInfo = [
    {
        id: "colorHueSelector",
        label: "labelColorHueSelector",
        valueDisplay: "",
    },
    {
        id: "sliderTransX",
        label: "labelTransX",
        valueDisplay: "valueTransX",
    },
    {
        id: "sliderTransY",
        label: "labelTransY",
        valueDisplay: "valueTransY",
    },
    {
        id: "sliderTransZ",
        label: "labelTransZ",
        valueDisplay: "valueTransZ",
    },
    {
        id: "sliderScaleX",
        label: "labelScaleX",
        valueDisplay: "valueScaleX",
    },
    {
        id: "sliderScaleY",
        label: "labelScaleY",
        valueDisplay: "valueScaleY",
    },
    {
        id: "sliderScaleZ",
        label: "labelScaleZ",
        valueDisplay: "valueScaleZ",
    },
    {
        id: "sliderRotationX",
        label: "labelRotationX",
        valueDisplay: "valueRotationX",
    },
    {
        id: "sliderRotationY",
        label: "labelRotationY",
        valueDisplay: "valueRotationY",
    },
    {
        id: "sliderRotationZ",
        label: "labelRotationZ",
        valueDisplay: "valueRotationZ",
    },
    {
        id: "sliderCameraX",
        label: "labelCameraX",
        valueDisplay: "valueCameraX",
    },
    {
        id: "sliderCameraY",
        label: "labelCameraY",
        valueDisplay: "valueCameraY",
    },
    {
        id: "sliderCameraZ",
        label: "labelCameraZ",
        valueDisplay: "valueCameraZ",
    },
    {
        id: "buttonCreate",
        label: "",
        valueDisplay: "",
    },
    {
        id: "buttonRemove",
        label: "",
        valueDisplay: "",
    },
    {
        id: "selectorShape",
        label: "",
        valueDisplay: "",
    },
];


// 
function getShapeData(pageElementsInfo, pageElements) {

    var shapeData = {};

    pageElementsInfo.forEach(function(element){

        var type = pageElements[element.id].type;
        var dataType = removeFirstWord(element.id);
        var data;

        switch(type) {
            case "slider":
                data = pageElements[element.id].element.value;
                break;
            case "color":
                data = hexRgbaToArray(pageElements[element.id].element.value);
                break;
            default:
                break;
        }
        
        if(data != undefined)
            shapeData[dataType] = data;
    });

    return shapeData;
}

// This functions takes the data from a slider and updates 
// its label and data destination
function updateSlider(sliderElement, sliderLabel, dataDestination) {

    // Takes the new data from the slider 
    const newData = sliderElement.value;

    // Updates the slider's label
    if(newValue > -100 || newValue < 100) 
        sliderLabel.innerHTML = Number((newValue).toFixed(1));
    else 
        sliderLabel.innerHTML = Number((newValue).toFixed(0));

    // Checks it there is a shape to be updated
    if (numShapes > 0) {
        dataDestination = newData;
    }
    
}



window.onload = main;