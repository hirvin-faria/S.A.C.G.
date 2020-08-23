// * * * 
// Shader Sources
// * * *

// Vertex shaders
// * * * * * * * * *
const vertexShaderSourceGeneric = `
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

const vertexShaderSourceCircle = `

    precision mediump float;

    attribute float aVertexId;
    attribute vec4 aVertexColor;

    uniform float uNumVerts;
    uniform vec2 uResolution;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;

    varying lowp vec4 vColor;

    #define PI radians(180.0)

    void main() {
        float numSlices = uNumVerts / 3.0;
        float sliceId = floor(aVertexId / 3.0);
        float triVertexId = mod(aVertexId, 3.0);
        float edge = triVertexId + sliceId;
        float angleU = edge / numSlices;
        float angle = angleU * PI * 2.0;
        float radius = step(triVertexId, 1.5);
        vec2 pos = vec2(cos(angle), sin(angle)) * radius;

        float aspect = uResolution.y / uResolution.x;
        vec2 scale = vec2(aspect, 1);

        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos * scale, 0, 1);
        vColor = aVertexColor;
    }
`;


// Fragment shaders
// * * * * * * * * *
const fragmentShaderSourceGeneric = `
    varying lowp vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
`;
