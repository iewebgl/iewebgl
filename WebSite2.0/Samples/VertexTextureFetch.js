var canvas;
var gl;

var intervalId;
var drawSceneInterval = 10;

var planeGridSize = 80;
var planeCellSize = 0.25;

var vertexPositionBuffer;
var indexBuffer;

var shaderProgram;
var vertexPositionAttribute;

var image;
var texture;

var rotationFactor = 0.0;
var lastRotationUpdateTime = 0;

var fpsCounter = new FPSCounter();

function ContextLostHandler() {
    clearInterval(intervalId);
    fpsCounter.stop();

    gl.deleteBuffer(vertexPositionBuffer);
    gl.deleteBuffer(vertexColorBuffer);
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

function OnCanvasCreated(canvasElement, elementId) {
    addWebGLEvent(canvasElement, "webglcontextcreationerror", ContextCreationErrorHandler);
    addWebGLEvent(canvasElement, "webglcontextlost", ContextLostHandler);
    addWebGLEvent(canvasElement, "webglcontextrestored", ContextRestoredHandler);

    canvasElement.style.width = "100%";
    canvasElement.style.height = "100%";

    gl = WebGLHelper.GetGLContext(canvasElement);
    if (gl != null) {

        var vertexTexUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        if (vertexTexUnits < 1) {
            OnVTFFailed(null, elementId);
        }

        CheckResize();
        SetupGL();
        fpsCounter.createElement(document.getElementById("FPSCounter"));
        fpsCounter.run();
        intervalId = setInterval(MakeFrame, drawSceneInterval);
    }
    else {
        OnCanvasFailed(null, elementId);
    }
}

function OnCanvasFailed(canvasElement, elementId) {
    WebGLHelper.ShowMessage(document.getElementById('WebGLCanvasContainer'), WebGLHelper.notSupportWebGLMsg);
}

function OnVTFFailed(canvasElement, elementId) {
    WebGLHelper.ShowMessage(document.getElementById('WebGLCanvasContainer'), 'Your browser does not support vertex texture fetching.');
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildPlanePositions(planeGridSize, planeCellSize, 0.0)), gl.STATIC_DRAW);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(BuildPlaneIndices(planeGridSize)), gl.STATIC_DRAW);
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
}

function UpdateTexture(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function LoadTexture(image, texture) {
    if (image) {
        UpdateTexture(image, texture);
    }
    else {
        image = new Image();
        image.onload = function () { UpdateTexture(image, texture); }
        image.src = "Media/heightmap.png";
    }
}

function InitTextures() {
    texture = gl.createTexture();
    LoadTexture(image, texture);
}

function SetMatrixUniforms(worldMatrix, viewMatrix, projMatrix) {

    var wvpUniform = gl.getUniformLocation(shaderProgram, "uWVPMatrix");
    var wvpMatrix = MatrixMultiply(MatrixMultiply(projMatrix, viewMatrix), worldMatrix);
    gl.uniformMatrix4fv(wvpUniform, false, new Float32Array(wvpMatrix.flatten()));

    var planeSize = (planeGridSize - 1) * planeCellSize;
    var halfPlaneSize = planeSize * 0.5;

    var hpsUniform = gl.getUniformLocation(shaderProgram, "halfPlaneSize");
    var hpsValue = [halfPlaneSize, halfPlaneSize];
    gl.uniform2fv(hpsUniform, new Float32Array(hpsValue));

    var psUniform = gl.getUniformLocation(shaderProgram, "planeSize");
    var psValue = [planeSize, planeSize];
    gl.uniform2fv(psUniform, new Float32Array(psValue));

    var timeUniform = gl.getUniformLocation(shaderProgram, "time");
    gl.uniform1fv(timeUniform, new Float32Array([rotationFactor * 0.1]));
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
        rotationFactor += (10 * delta) / 1000.0;
    }

    lastRotationUpdateTime = currentTime;
}

function DrawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var worldMatrix = MatrixRotate(MatrixIdentity(), rotationFactor, [0, 1, 0]);
    var viewMatrix = makeLookAt(0, 20, -20, 0, 0, 0, 0, 1, 0);
    var projMatrix = makePerspective(45, 640.0 / 480.0, 0.1, 100.0);
    SetMatrixUniforms(worldMatrix, viewMatrix, projMatrix)

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

    gl.drawElements(gl.TRIANGLES, (planeGridSize - 1) * (planeGridSize - 1) * 6, gl.UNSIGNED_SHORT, 0);
}

function MakeFrame() {
    OnBeginScene();
    DrawScene();
    UpdateRotation();
    OnEndScene();
}
