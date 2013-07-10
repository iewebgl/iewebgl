var canvas;
var gl;

var intervalId;
var drawSceneInterval = 10;

var vertexPositionBuffer;
var vertexNormalBuffer;
var vertexTextureCoordBuffer;
var indexBuffer;

var shaderProgram;
var vertexPositionAttribute;
var vertexNormalAttribute;
var vertexTextureCoordAttribute;

var isCanvas2DReady = false;
var canvas2D;
var texture;

var rotationFactor = 0.0;
var lastRotationUpdateTime = 0;

var fpsCounter = new FPSCounter();

function ContextLostHandler() {
    clearInterval(intervalId);
    fpsCounter.stop();

    gl.deleteBuffer(vertexPositionBuffer);
    gl.deleteBuffer(vertexNormalBuffer);
    gl.deleteBuffer(vertexTextureCoordBuffer);
    gl.deleteBuffer(indexBuffer);

    gl.deleteTexture(texture);

    CleanProgram(gl, shaderProgram);
}

function ContextRestoredHandler() {
    InitShaders();
    InitBuffers();
    InitTextures();

    intervalId = setInterval(MakeFrame, drawSceneInterval);
    fpsCounter.run();
}

function ContextCreationErrorHandler(event) {
    alert("Error occurs during WebGL context creation: [" + event.statusMessage + "]");
    return false;
}

function GetCanvas2D() {
    var canvas2D = document.getElementById('Canvas2D');
    if (!canvas2D || !canvas2D.getContext || !canvas2D.getContext('2d')) {
        return null;
    }
    return canvas2D;
}

function DrawToCanvas2D() {
    //from https://developer.mozilla.org/

    var now = new Date();
    var context = canvas2D.getContext('2d');
    context.save();
    context.clearRect(0, 0, canvas2D.width, canvas2D.height);

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas2D.width, canvas2D.height);

    context.translate(canvas2D.width / 2, canvas2D.height / 2);
    context.scale(0.4, 0.4);
    context.rotate(-Math.PI / 2);
    context.strokeStyle = "black";
    context.fillStyle = "white";
    context.lineWidth = 8;
    context.lineCap = "round";

    // Hour marks
    context.save();
    for (var i = 0; i < 12; i++) {
        context.beginPath();
        context.rotate(Math.PI / 6);
        context.moveTo(100, 0);
        context.lineTo(120, 0);
        context.stroke();
    }
    context.restore();

    // Minute marks
    context.save();
    context.lineWidth = 5;
    for (i = 0; i < 60; i++) {
        if (i % 5 != 0) {
            context.beginPath();
            context.moveTo(117, 0);
            context.lineTo(120, 0);
            context.stroke();
        }
        context.rotate(Math.PI / 30);
    }
    context.restore();

    var sec = now.getSeconds();
    var min = now.getMinutes();
    var hr = now.getHours();
    hr = hr >= 12 ? hr - 12 : hr;

    context.fillStyle = "black";

    // write Hours
    context.save();
    context.rotate(hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI / 21600) * sec)
    context.lineWidth = 14;
    context.beginPath();
    context.moveTo(-20, 0);
    context.lineTo(80, 0);
    context.stroke();
    context.restore();

    // write Minutes
    context.save();
    context.rotate((Math.PI / 30) * min + (Math.PI / 1800) * sec)
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(-28, 0);
    context.lineTo(112, 0);
    context.stroke();
    context.restore();

    // Write seconds
    context.save();
    context.rotate(sec * Math.PI / 30);
    context.strokeStyle = "#D40000";
    context.fillStyle = "#D40000";
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(-30, 0);
    context.lineTo(83, 0);
    context.stroke();
    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.arc(95, 0, 10, 0, Math.PI * 2, true);
    context.stroke();
    context.fillStyle = "#555";
    context.arc(0, 0, 3, 0, Math.PI * 2, true);
    context.fill();
    context.restore();

    context.beginPath();
    context.lineWidth = 14;
    context.strokeStyle = '#91a5b8';
    context.arc(0, 0, 142, 0, Math.PI * 2, true);
    context.stroke();

    context.restore();
}

function OnCanvasCreated(canvasElement, elementId) {
    addWebGLEvent(canvasElement, "webglcontextcreationerror", ContextCreationErrorHandler);
    addWebGLEvent(canvasElement, "webglcontextlost", ContextLostHandler);
    addWebGLEvent(canvasElement, "webglcontextrestored", ContextRestoredHandler);

    canvasElement.style.width = "100%";
    canvasElement.style.height = "100%";

    gl = WebGLHelper.GetGLContext(canvasElement);
    if (gl == null) {
        OnCanvasFailed(null, elementId);
    }

    canvas2D = GetCanvas2D();
    if (canvas2D == null) {
        OnCanvas2DFailed();
    }

    CheckResize();
    SetupGL();

    fpsCounter.createElement(document.getElementById("FPSCounter"));
    fpsCounter.run();
    intervalId = setInterval(MakeFrame, drawSceneInterval);
}

function OnCanvasFailed(canvasElement, elementId) {
    WebGLHelper.ShowMessage(document.getElementById('WebGLCanvasContainer'), WebGLHelper.notSupportWebGLMsg);
}

function OnCanvas2DFailed() {
    WebGLHelper.ShowMessage(document.getElementById('WebGLCanvasContainer'), 'Sorry, your browser does not support HTML5 canvas.');
}

function SetupGL() {
    var curWidth = gl.drawingBufferWidth ? gl.drawingBufferWidth : gl.canvas.width;
    var curHeigth = gl.drawingBufferHeight ? gl.drawingBufferHeight : gl.canvas.height;
    gl.viewport(0, 0, curWidth, curHeigth);

    gl.clearColor(0.914, 0.914, 0.914, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    InitShaders();
    InitBuffers();
    InitTextures();
}

function CheckResize() {
    var curSize = GetCanvasSize(gl);
    gl.viewport(0, 0, curSize.width, curSize.height);
    gl.scissor(0, 0, curSize.width, curSize.height);

    var glContext = document.getElementById('WebGLCanvas');
    if (glContext.width != glContext.clientWidth)
        glContext.width = glContext.clientWidth;
    if (glContext.height != glContext.clientHeight)
        glContext.height = glContext.clientHeight;
}

function InitBuffers() {
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildBoxPositions(2.0)), gl.STATIC_DRAW);

    vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildBoxNormals()), gl.STATIC_DRAW);

    vertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildBoxTextureCoords()), gl.STATIC_DRAW);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(BuildBoxIndices()), gl.STATIC_DRAW);
}

function GetShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var theSource = "";
    var currentChild = shaderScript.firstChild;
    if (!currentChild) { // IE8 workaround
        theSource = shaderScript.text;
    }

    while (currentChild) {
        if (currentChild.nodeType == 3) {
            theSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, theSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function InitShaders() {
    var fragmentShader = GetShader(gl, "shader-fs");
    var vertexShader = GetShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(vertexNormalAttribute);

    vertexTextureCoordAttribute = gl.getAttribLocation(shaderProgram, "aVertexTextureCoord");
    gl.enableVertexAttribArray(vertexTextureCoordAttribute);
}

function UpdateTexture() {
    DrawToCanvas2D();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function InitTextures() {
    texture = gl.createTexture();
}

function SetUniforms(worldMatrix, viewMatrix, projMatrix, lightDir) {

    var wvpMatrixUniform = gl.getUniformLocation(shaderProgram, "uWMatrix");
    gl.uniformMatrix4fv(wvpMatrixUniform, false, new Float32Array(worldMatrix.flatten()));

    var wvpMatrix = MatrixMultiply(MatrixMultiply(projMatrix, viewMatrix), worldMatrix);
    var wvpMatrixUniform = gl.getUniformLocation(shaderProgram, "uWVPMatrix");
    gl.uniformMatrix4fv(wvpMatrixUniform, false, new Float32Array(wvpMatrix.flatten()));

    var vlUniform = gl.getUniformLocation(shaderProgram, "uLightDir");
    gl.uniform3fv(vlUniform, new Float32Array(lightDir));
}

function OnBeginScene() {
    CheckResize();
}

function OnEndScene() {
    fpsCounter.increment();
}

function UpdateRotation() {
    var currentTime = (new Date).getTime();
    if (lastRotationUpdateTime) {
        var delta = currentTime - lastRotationUpdateTime;
        rotationFactor += (30 * delta) / 1000.0;
    }

    lastRotationUpdateTime = currentTime;
}

function DrawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
    gl.vertexAttribPointer(vertexTextureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var worldMatrix = MatrixRotate(MatrixIdentity(), rotationFactor, [1, 0, 1]);
    var viewMatrix = makeLookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
    var projMatrix = makePerspective(45, 640.0 / 480.0, 0.1, 100.0);
    SetUniforms(worldMatrix, viewMatrix, projMatrix, [0.0, 1.0, 1.0]);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function MakeFrame() {
    OnBeginScene();
    UpdateTexture();
    DrawScene();
    UpdateRotation();
    OnEndScene();
}
