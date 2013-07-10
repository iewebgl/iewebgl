
function BuildPlanePositions( gridSize, cellSize, height ) {
    var halfGridSize = (gridSize - 1) * cellSize * 0.5;

    var positions = new Array();
    for (var y = 0; y < gridSize; ++y) {
        for (var x = 0; x < gridSize; ++x) {
            positions.push(x * cellSize - halfGridSize);
            positions.push(height);
            positions.push(y * cellSize - halfGridSize);
        }
    }
    return positions;
}

function BuildPlaneNormals(gridSize) {
    var normals = new Array();
    for (var i = 0; i < gridSize * gridSize; ++i) {
        normals.push(0.0);
        normals.push(1.0);
        normals.push(0.0);
    }
    return normals;
}

function BuildPlaneIndices( gridSize ) {
    var indices = new Array();
    var CellsPerSize = gridSize - 1;
    for (var y = 0; y < CellsPerSize; ++y) {
        for (var x = 0; x < CellsPerSize; ++x) {
            
            indices.push(y * gridSize + x);
            indices.push(y * gridSize + x + 1);
            indices.push((y + 1) * gridSize + x);

            indices.push(y * gridSize + x + 1);
            indices.push((y + 1) * gridSize + x + 1);
            indices.push((y + 1) * gridSize + x);
        }
    }
    return indices;
}

function BuildBoxPositions( size ) {
    var halfSize = size * 0.5;
    var positions = [
        // Front face
        -halfSize, -halfSize,  halfSize,
         halfSize, -halfSize,  halfSize,
         halfSize,  halfSize,  halfSize,
        -halfSize,  halfSize,  halfSize,

        // Back face
        -halfSize, -halfSize, -halfSize,
        -halfSize,  halfSize, -halfSize,
         halfSize,  halfSize, -halfSize,
         halfSize, -halfSize, -halfSize,

        // Top face
        -halfSize,  halfSize, -halfSize,
        -halfSize,  halfSize,  halfSize,
         halfSize,  halfSize,  halfSize,
         halfSize,  halfSize, -halfSize,

        // Bottom face
        -halfSize, -halfSize, -halfSize,
         halfSize, -halfSize, -halfSize,
         halfSize, -halfSize,  halfSize,
        -halfSize, -halfSize,  halfSize,

        // Right face
         halfSize, -halfSize, -halfSize,
         halfSize,  halfSize, -halfSize,
         halfSize,  halfSize,  halfSize,
         halfSize, -halfSize,  halfSize,

        // Left face
        -halfSize, -halfSize, -halfSize,
        -halfSize, -halfSize,  halfSize,
        -halfSize,  halfSize,  halfSize,
        -halfSize,  halfSize, -halfSize
    ];
    return positions;
}

function BuildBoxNormals() {
    var normals = [
        // Front face
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back face
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top face
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom face
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right face
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left face
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0
    ];
    return normals;
}

function BuildBoxTextureCoords() {
    var textureCoords = [
        // Front
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        
        // Back
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        
        // Top
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        
        // Bottom
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        
        // Right
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        
        // Left
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];
    return textureCoords;
}

function BuildBoxColors() {
    var colors = [
        // Front face
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Back face
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Top face
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Bottom face
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Right face
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Left face
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];
    return colors;
}

function BuildBoxIndices() {
    var indices = [
        0,  1,  2,   0,  2,  3, // front
        4,  5,  6,   4,  6,  7, // back
        8,  9,  10,  8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23  // left
    ]
    return indices;
}
