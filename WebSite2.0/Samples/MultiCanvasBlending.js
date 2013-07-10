function OnCanvas1Created(canvasElement, elementId) {
    var canvas1 = new MovingCanvas(1, { r: 1, g: 0, b: 0 });
    canvas1.Init(canvasElement, elementId);
 }

function OnCanvas2Created(canvasElement, elementId) {
    var canvas2 = new MovingCanvas(-1, { r: 0, g: 0, b: 1 });
    canvas2.Init(canvasElement, elementId);
 }

function OnCanvasFailed(canvasElement, elementId) {
    WebGLHelper.ShowMessage(document.getElementById('WebGLCanvasContainer'), WebGLHelper.notSupportWebGLMsg);
}

function GreaterEqual(left, right) {
    return (left.x >= right.x && left.y >= right.y);
}

function LessEqual(left, right) {
    return (left.x <= right.x && left.y <= right.y);
}

function IsInside(testMin, testMax, refMin, refMax) {

    if (GreaterEqual(testMin, refMin) && LessEqual(testMin, refMax) && GreaterEqual(testMax, refMin) && LessEqual(testMax, refMax))
        return true;

    return false;
}

function IsBoxIntersected(testMin, testMax, refMin, refMax) {
    if (testMin.x > refMax.x) return false;
    if (testMax.x < refMin.x) return false;
    if (testMin.y > refMax.y) return false;
    if (testMax.y < refMin.y) return false;

    return true;
}

function GetRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function MovingCanvas(initRotateDir, initClearColor) {

    var glCanvasContainer;
    var gl;

    var intervalId;
    var drawSceneInterval = 13;

    var vertexPositionBuffer;
    var vertexNormalBuffer;
    var vertexTextureCoordBuffer;
    var indexBuffer;

    var shaderProgram;
    var vertexPositionAttribute;
    var vertexNormalAttribute;
    var vertexTextureCoordAttribute;

    var image;
    var texture;

    var rotationFactor = 0.0;
    var lastRotationUpdateTime = 0;

    var clearColor = initClearColor || { r: 1, g: 1, b: 1 };
    var rotateDir = initRotateDir || 1;

    var fpsCounter = new FPSCounter();

    var moveVector = { x: 0, y: 0 };

    function CalculateMoveVector( ) {
        var left = parseInt(glCanvasContainer.style.left);
        var top = parseInt(glCanvasContainer.style.top);

        moveVector.x = glCanvasContainer.parentNode.clientWidth * 0.5 - left;
        moveVector.y = glCanvasContainer.parentNode.clientHeight * 0.5 - top;

        moveVector.x += GetRandom(-5000, 5000);
        moveVector.y += GetRandom(-5000, 5000);

        //normalize
        var l = 1 / (Math.sqrt(moveVector.x * moveVector.x + moveVector.y * moveVector.y));
        moveVector.x *= l;
        moveVector.y *= l;
    }

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

    function SetupGL() {
        var curWidth = gl.drawingBufferWidth ? gl.drawingBufferWidth : gl.canvas.width;
        var curHeigth = gl.drawingBufferHeight ? gl.drawingBufferHeight : gl.canvas.height;
        gl.viewport(0, 0, curWidth, curHeigth);

        gl.clearColor(clearColor.r, clearColor.g, clearColor.b, 0.5);
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

        if (glCanvasContainer.width != glCanvasContainer.clientWidth)
            glCanvasContainer.width = glCanvasContainer.clientWidth;
        if (glCanvasContainer.height != glCanvasContainer.clientHeight)
            glCanvasContainer.height = glCanvasContainer.clientHeight;
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
            image.src = "Media/image.png";
        }
    }

    function InitTextures() {
        texture = gl.createTexture();
        LoadTexture(image, texture);
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

    function Move() {
        var glcanvasVMin =
        {
            x: parseInt(glCanvasContainer.style.left) + moveVector.x * 5,
            y: parseInt(glCanvasContainer.style.top) + moveVector.y * 5
        };
        var glcanvasVMax =
        {
            x: glcanvasVMin.x + parseInt(glCanvasContainer.width),
            y: glcanvasVMin.y + parseInt(glCanvasContainer.height)
        };

        var bodyVMin = { x: 0, y: 0 };

        var bodyVMax =
         {
             x: glCanvasContainer.parentNode.clientWidth,
             y: glCanvasContainer.parentNode.clientHeight
         }

         if (IsInside(glcanvasVMin, glcanvasVMax, bodyVMin, bodyVMax)) {
            glCanvasContainer.style.left = glcanvasVMin.x + "px";
            glCanvasContainer.style.top = glcanvasVMin.y + "px";
        }
        else {
            CalculateMoveVector();
        } 
    }

    function OnBeginScene() {
        CheckResize();
        Move();
    }

    function OnEndScene() {
        fpsCounter.increment();
    }

    function UpdateRotation() {
        var currentTime = (new Date).getTime();
        if (lastRotationUpdateTime) {
            var delta = currentTime - lastRotationUpdateTime;
            rotationFactor += rotateDir * (30 * delta) / 1000.0;
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
        DrawScene();
        UpdateRotation();
        OnEndScene();
    }

    return {
        'Init': function (canvasElement, elementId) {
            glCanvasContainer = document.getElementById(elementId + "Container"); ;
            addWebGLEvent(canvasElement, "webglcontextcreationerror", ContextCreationErrorHandler);
            addWebGLEvent(canvasElement, "webglcontextlost", ContextLostHandler);
            addWebGLEvent(canvasElement, "webglcontextrestored", ContextRestoredHandler);

            gl = WebGLHelper.GetGLContext(canvasElement, {preserveDrawingBuffer : true, premultipliedAlpha : false});

            if (gl != null) {
                CheckResize();
                SetupGL();
                var fpsCounterElement = document.getElementById(elementId + "FPSCounter");
                fpsCounter.createElement(fpsCounterElement);
                fpsCounter.run();
                intervalId = setInterval(MakeFrame, drawSceneInterval);

                CalculateMoveVector();
            }
            else {
                OnCanvasFailed(null, elementId);
            }
        },
        'SetRotateDir': function (dir) {
            rotateDir = dir;
        },
        'SetClearColor': function (color) {
            clearColor = color;
        }
    }
}

