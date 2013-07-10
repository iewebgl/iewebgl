
function GetCanvasSize(gl) {
    var size = { width: 0, height: 0 };
    size.width = gl.drawingBufferWidth ? gl.drawingBufferWidth : gl.canvas.width;
    size.height = gl.drawingBufferHeight ? gl.drawingBufferHeight : gl.canvas.height;
    return size;
}

function CleanProgram(gl, prog) {
    gl.useProgram(null);

    if (prog === null || prog === undefined) {
        return;
    }

    var attachShaders = gl.getAttachedShaders(prog);
    if (attachShaders !== null && attachShaders !== undefined) {
        for (var i = 0, l = attachShaders.length; i < l; i++) {
            var curShader = attachShaders[i];
            gl.detachShader(prog, curShader)
            gl.deleteShader(curShader);
        }
    }

    gl.deleteProgram(prog);
}