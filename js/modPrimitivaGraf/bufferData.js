// This file contains a js object 
// with all information needed to 
// create buffers for each shape

const shapes = {
    triangle: {
        positions: [
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
        ],
        indices: [
            0, 1, 2,
        ],
        vertexDimension: 2,
        vertexCount: 3,
    },
    square: {
        positions: [
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0,
        ],
        indices: [
            0, 1, 2,
            1, 2, 3,
        ],
        vertexDimension: 2,
        vertexCount: 6,
    },
    circle: {
        vertexDimension: 1,
        vertexCount: 108,
    },
    cube: {
        positions: [
            // Front
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
             1.0, -1.0,  -1.0,
             1.0,  1.0,  1.0,
        
            // Back
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
            
            // Top
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
        
            // Bottom
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            
            // Right
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
        
            // Left
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
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
    pyramid: {
        positions: [
            // Top vertex
             0.0,  1.0,  0.0,

            // Base vertices
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,

        ],
        indices: [
            // Left side
            0, 1, 2,

            // Front side
            0, 2, 3,

            // Right side
            0, 3, 4,

            // Back side
            0, 4, 1,

            // Base
            1, 2, 3,
            2, 3, 4,
        ],
        vertexDimension: 3,
        vertexCount: 18,
    },
}
