var canvas;
var gl;

var intervalId;
var drawSceneInterval = 10;

var boxPositionBuffer;
var boxNormalBuffer;
var boxIndexBuffer;

var planePositionBuffer;
var planeNormalBuffer;
var planeIndexBuffer;

var depthPassShaderProgram;
var depthPassVertexPositionAttribute;

var mainPassShaderProgram;
var mainPassVertexPositionAttribute;
var mainPassVertexNormalAttribute;

var rotationFactor = 0.0;
var lastRotationUpdateTime = 0;

var shadowFBO;
var shadowTexture;
var shadowTextureSize = 1024;

var fpsCounter = new FPSCounter();

function ContextLostHandler() {

    clearInterval(intervalId);
    fpsCounter.stop();

    gl.deleteFramebuffer(shadowFBO);
    gl.deleteTexture(shadowTexture);
    gl.deleteRenderbuffer(shadowDepthSurf);

    gl.deleteBuffer(boxPositionBuffer);
    gl.deleteBuffer(boxNormalBuffer);
    gl.deleteBuffer(boxIndexBuffer);

    gl.deleteBuffer(planePositionBuffer);
    gl.deleteBuffer(planeNormalBuffer);
    gl.deleteBuffer(planeIndexBuffer);

    CleanProgram(gl, shaderProgram);
}

function ContextRestoredHandler() {

    InitShaders();
    InitFBO();
    InitBuffers();

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

        if (gl.getExtension('OES_texture_float') == null) {
            OnFloatTextureExtFailed(null, elementId);
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

function OnFloatTextureExtFailed(canvasElement, elementId) {
    WebGLHelper.ShowMessage(document.getElementById('WebGLCanvasContainer'), 'Your browser does not support OES_texture_float extension.');
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
    InitFBO();
    InitBuffers();
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

function InitFBO() {

    shadowTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, shadowTextureSize, shadowTextureSize, 0, gl.RGBA, gl.FLOAT, null);

    shadowDepthSurf = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, shadowDepthSurf);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadowTextureSize, shadowTextureSize);

    shadowFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadowDepthSurf);

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
        alert("invalid shadow fbo status: " + status);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function InitBuffers() {

    boxPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildBoxPositions(2.0)), gl.STATIC_DRAW);

    boxNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildBoxNormals()), gl.STATIC_DRAW);

    boxIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(BuildBoxIndices()), gl.STATIC_DRAW);

    planePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildPlanePositions(2, 10.0, -2.0)), gl.STATIC_DRAW);

    planeNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planeNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildPlaneNormals(2)), gl.STATIC_DRAW);

    planeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(BuildPlaneIndices(2)), gl.STATIC_DRAW);
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

function InitShadersProgram(vsID, fsID ) {

    var vertexShader = GetShader(gl, vsID);
    var fragmentShader = GetShader(gl, fsID);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    return shaderProgram;
}

function InitShaders() {

    depthPassShaderProgram = InitShadersProgram("depth-pass-vs", "depth-pass-fs");
    gl.useProgram(depthPassShaderProgram);
    depthPassVertexPositionAttribute = gl.getAttribLocation(depthPassShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(depthPassVertexPositionAttribute);

    mainPassShaderProgram = InitShadersProgram("main-pass-vs", "main-pass-fs");
    gl.useProgram(mainPassShaderProgram);
    mainPassVertexPositionAttribute = gl.getAttribLocation(mainPassShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(mainPassVertexPositionAttribute);
    mainPassVertexNormalAttribute = gl.getAttribLocation(mainPassShaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(mainPassVertexNormalAttribute);
}

function SetDepthPassUniforms(worldMatrix, lightViewProjMatrix) {

    gl.useProgram(depthPassShaderProgram);
    var wlpMatrixUniform = gl.getUniformLocation(depthPassShaderProgram, "uWLPMatrix");
    var wlpMatrix = MatrixMultiply(lightViewProjMatrix, worldMatrix);
    gl.uniformMatrix4fv(wlpMatrixUniform, false, new Float32Array(wlpMatrix.flatten()));
}

function SetMainPassUniforms(worldMatrix, viewProjMatrix, lightViewProjMatrix, lightDir, texProjMatrix, texture, textureSize) {

    gl.useProgram(mainPassShaderProgram);

    var wvpMatrixUniform = gl.getUniformLocation(mainPassShaderProgram, "uWMatrix");
    gl.uniformMatrix4fv(wvpMatrixUniform, false, new Float32Array(worldMatrix.flatten()));

    var wvpMatrix = MatrixMultiply(viewProjMatrix, worldMatrix);
    var wvpMatrixUniform = gl.getUniformLocation(mainPassShaderProgram, "uWVPMatrix");
    gl.uniformMatrix4fv(wvpMatrixUniform, false, new Float32Array(wvpMatrix.flatten()));

    var wlpMatrixUniform = gl.getUniformLocation(mainPassShaderProgram, "uWLPMatrix");
    var wlpMatrix = MatrixMultiply(lightViewProjMatrix, worldMatrix);
    gl.uniformMatrix4fv(wlpMatrixUniform, false, new Float32Array(MatrixMultiply(texProjMatrix, wlpMatrix).flatten()));

    var vlUniform = gl.getUniformLocation(mainPassShaderProgram, "uLightDir");
    gl.uniform3fv(vlUniform, new Float32Array(lightDir));

    if (textureSize != null) {
        var texSizeUniform = gl.getUniformLocation(mainPassShaderProgram, "uTextureSize");
        gl.uniform2fv(texSizeUniform, new Float32Array(textureSize));
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(mainPassShaderProgram, "uSampler"), 0);
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

function DrawBox(vertexPositionAttribute, vertexNormalAttribute) {

    gl.bindBuffer(gl.ARRAY_BUFFER, boxPositionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    if (vertexNormalAttribute !== null) {
        gl.bindBuffer(gl.ARRAY_BUFFER, boxNormalBuffer);
        gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBuffer);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function DrawPlane(vertexPositionAttribute, vertexNormalAttribute) {

    gl.bindBuffer(gl.ARRAY_BUFFER, planePositionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    if (vertexNormalAttribute !== null) {
        gl.bindBuffer(gl.ARRAY_BUFFER, planeNormalBuffer);
        gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeIndexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function BindFBO(fbo, widh, height, clearMask, clearColor, clearDepth) {

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, widh, height);
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);
    gl.clearDepth(clearDepth);
    gl.clear(clearMask);
}

function DrawScene() {

    var boxWorldMatrix = MatrixRotate(MatrixIdentity(), rotationFactor, [1, 0, 1]);
    var planeWorldMatrix = MatrixIdentity();

    var viewMatrix = makeLookAt(10, 5, -10, 0, -1, 0, 0, 1, 0);
    var projMatrix = makePerspective(45, 640.0 / 480.0, 0.1, 100.0);
    var viewProjMatrix = MatrixMultiply(projMatrix, viewMatrix);

    var lightDir = [10.0, 15.0, 10.0];
    var lightViewMatrix = makeLookAt(lightDir[0], lightDir[1], lightDir[2], 0, 0, 0, 0, 1, 0);
    var lightProjMatrix = makePerspective(45, 1.0, 0.1, 100.0);
    var lightViewProjMatrix = MatrixMultiply(lightProjMatrix, lightViewMatrix);
    var texProjMatrix = MatrixTextureProj(0.001);

    BindFBO(shadowFBO, shadowTextureSize, shadowTextureSize, gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, [0.0, 0.0, 0.0], 1.0);
    SetDepthPassUniforms(boxWorldMatrix, lightViewProjMatrix);
    DrawBox(depthPassVertexPositionAttribute, null);
    SetDepthPassUniforms(planeWorldMatrix, lightViewProjMatrix);
    DrawPlane(depthPassVertexPositionAttribute, null);

    var canvasSize = GetCanvasSize(gl);
    BindFBO(null, canvasSize.width, canvasSize.height, gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, [0.914, 0.914, 0.914], 1.0);
    SetMainPassUniforms(boxWorldMatrix, viewProjMatrix, lightViewProjMatrix, lightDir, texProjMatrix, null, null);
    DrawBox(mainPassVertexPositionAttribute, mainPassVertexNormalAttribute);
    SetMainPassUniforms(planeWorldMatrix, viewProjMatrix, lightViewProjMatrix, lightDir, texProjMatrix, shadowTexture,
        [shadowTextureSize, shadowTextureSize]);
    DrawPlane(mainPassVertexPositionAttribute, mainPassVertexNormalAttribute);
}

function MakeFrame() {
    OnBeginScene();
    DrawScene();
    UpdateRotation();
    OnEndScene();
}
