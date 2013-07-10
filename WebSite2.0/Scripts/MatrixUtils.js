
function MatrixIdentity() {
    return Matrix.I(4);
}

function MatrixMultiply(left, right) {
    return left.x(right);
}

function MatrixTranslate(mx, v) {
    return MatrixMultiply(mx, Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function MatrixRotate(mx, angle, v) {
    var inRadians = angle * Math.PI / 180.0;
    return MatrixMultiply(mx, Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4());
}

function MatrixTextureProj(depthBias) {
    var mx = Matrix.I(4);
    mx.elements[0][3] = 0.5;
    mx.elements[1][3] = 0.5;
    mx.elements[2][3] = -depthBias;
    mx.elements[0][0] = 0.5;
    mx.elements[1][1] = 0.5;
    return mx;
}