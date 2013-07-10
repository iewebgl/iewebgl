
//////////////////////////////////////////////////////////////////////////
function GetWebGLParentContext() {
    return document.getElementById('WebGL');
}

function GetCleanContext() {
    var webGlCtxParent = GetWebGLParentContext();
    var gl = WebGLHelper.GetGLContext(webGlCtxParent);

    var counter = 0;
    while (counter < 1000 && gl.getError() != gl.NO_ERROR) {
        counter++;
    }
    if (counter == 1000)
        return null;

    return gl;
}

function GetParameterizedCleanContext(params) {
    var webGlCtxParent = GetWebGLParentContext();
    var gl = WebGLHelper.GetGLContext(webGlCtxParent);

    var counter = 0;
    while (counter < 1000 && gl.getError() != gl.NO_ERROR) {
        counter++;
    }
    if (counter == 1000)
        return null;

    return gl;
}

function GetWebGLParentExlusiveContext() {
    return document.getElementById('WebGLExlusive');
}

function GetExlusiveContext() {
    var webGlCtxParent = GetWebGLParentExlusiveContext();
    var gl = WebGLHelper.GetGLContext(webGlCtxParent);

    var counter = 0;
    while (counter < 1000 && gl.getError() != gl.NO_ERROR) {
        counter++;
    }
    if (counter == 1000)
        return null;

    return gl;
}

function GetExlusiveParamContext(params) {
    var webGlCtxParent = GetWebGLParentExlusiveContext();
    var gl = WebGLHelper.GetGLContext(webGlCtxParent, params);
 
    var counter = 0;
    while (counter < 1000 && gl.getError() != gl.NO_ERROR) {
        counter++;
    }
    if (counter == 1000)
        return null;
    return gl;
}

function CreateExlusiveContext(params) {
    var fixture = document.getElementById('qunit-fixture');
    var contextContainer = document.createElement("div");
    contextContainer.id = "WebGLExlusiveContainer";
    fixture.appendChild(contextContainer);

    var glContext = WebGLHelper.CreateGLCanvas(contextContainer, 'WebGLExlusive', false);
    var gl = WebGLHelper.GetGLContext(glContext, params);
    return gl;
}

function RemoveExlusiveContext() {
    var fixture = document.getElementById('qunit-fixture');
    fixture.removeChild(document.getElementById('WebGLExlusiveContainer'));
}

//////////////////////////////////////////////////////////////////////////

function AddColors(val1, val2) {
    return { r: val1.r + val2.r, g: val1.g + val2.g, b: val1.b + val2.b, a: val1.a + val2.a }
}

function SubColors(val1, val2) {
    return { r: val1.r - val2.r, g: val1.g - val2.g, b: val1.b - val2.b, a: val1.a - val2.a }
}

function MultiplyColors(val1, val2) {
    return { r: val1.r * val2.r, g: val1.g * val2.g, b: val1.b * val2.b, a: val1.a * val2.a }
}

//////////////////////////////////////////////////////////////////////////

function FillTexture(gl, tex, target, format, type, width, height, color) {
    var arr = CreateDataBuffer(gl, format, type, width, height);
    var componentsPerPixel = GetBytesPerPixel(gl, format, type) / arr.BYTES_PER_ELEMENT;
    for (var i = 0; i < arr.length; i += componentsPerPixel) {
        switch (type) {
            case gl.UNSIGNED_BYTE:
                {
                    switch (format) {
                        case gl.ALPHA:
                            arr[i] = color.a;
                            break;
                        case gl.LUMINANCE:
                            arr[i] = color.r;
                            break;
                        case gl.LUMINANCE_ALPHA:
                            arr[i] = color.r;
                            arr[i + 1] = color.a;
                            break;
                        case gl.RGB:
                            arr[i + 0] = color.r;
                            arr[i + 1] = color.g;
                            arr[i + 2] = color.b;
                            break;
                        case gl.RGBA:
                            arr[i + 0] = color.r;
                            arr[i + 1] = color.g;
                            arr[i + 2] = color.b;
                            arr[i + 3] = color.a;
                            break;
                    }
                }
                break;
            case gl.UNSIGNED_SHORT_4_4_4_4: {
                if(format != gl.RGBA)
                    return;
                arr[i] = (((color.r & 0xF0) << 8) | ((color.g & 0xF0) << 4) | (color.b & 0xF0) | (color.a >> 4));
            } break;
            case gl.UNSIGNED_SHORT_5_5_5_1: {
                if (format != gl.RGBA)
                    return;
                arr[i] = (((color.r & 0xF8) << 8) | ((color.g & 0xF8) << 3) | ((color.b & 0xF8) >> 2) | (color.a >> 7));
            } break;
            case gl.UNSIGNED_SHORT_5_6_5: {
                if (format != gl.RGB)
                    return;
                arr[i] = (((color.r & 0xF8) << 8) | ((color.g & 0xFC) << 3) | ((color.b & 0xF8) >> 3));
            } break;
        }

    }
    gl.texImage2D(target, 0, format, width, height, 0, format, type, arr);
    equal(gl.getError(), gl.NO_ERROR, "texImage2D() generates no errors");
}

function InitializeTexture2D(gl, tex, format, width, height) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);
}

function CreateTexture2D(gl, format, width, height) {
    var tex = gl.createTexture();
    InitializeTexture2D(gl, tex, format, width, height);
    return tex;
}

function InitializeTextureCube(gl, tex, format, width, height) {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);
}

function CreateTextureCube(gl, format, width, height) {
    var tex = gl.createTexture();
    InitializeTextureCube(gl, tex, format, width, height);
    return tex;
}

function CreateGLTexture(gl, target, format, width, height) {
    if (target == gl.TEXTURE_2D) {
        return CreateTexture2D(gl, format, width, height);
    }
    else {
        return CreateTextureCube(gl, format, width, height);
    }
}

function CreateDataBuffer(gl, format, type, width, height) {
    var size = width * height;
    switch (type) {
        case gl.UNSIGNED_BYTE:
            {
                switch (format) {
                    case gl.ALPHA:
                    case gl.LUMINANCE:
                    case gl.LUMINANCE_ALPHA:
                    case gl.RGB:
                    case gl.RGBA:
                        return new Uint8Array(size * GetBytesPerPixel(gl, format, type) / Uint8Array.BYTES_PER_ELEMENT);
                }
            }
            break;
        case gl.UNSIGNED_SHORT_4_4_4_4:
        case gl.UNSIGNED_SHORT_5_5_5_1: if (format == gl.RGBA) return new Uint16Array(size * GetBytesPerPixel(gl, format, type) / Uint16Array.BYTES_PER_ELEMENT);
            break;
        case gl.UNSIGNED_SHORT_5_6_5: if (format == gl.RGB) return new Uint16Array(size * GetBytesPerPixel(gl, format, type) / Uint16Array.BYTES_PER_ELEMENT);
            break;
    }

    return null;
}

function GetBytesPerPixel(gl, format, type) {
    switch (type) {
        case gl.UNSIGNED_BYTE:
            {
                switch (format) {
                    case gl.ALPHA: return 1;
                    case gl.LUMINANCE: return 1;
                    case gl.LUMINANCE_ALPHA: return 2;
                    case gl.RGB: return 3;
                    case gl.RGBA: return 4;
                }
            }
            break;
        case gl.UNSIGNED_SHORT_4_4_4_4: if (format == gl.RGBA) return 2;
            break;
        case gl.UNSIGNED_SHORT_5_6_5: if (format == gl.RGB) return 2;
            break;
        case gl.UNSIGNED_SHORT_5_5_5_1: if (format == gl.RGBA) return 2;
            break;
    }

    return 0;
}

function GetSimpleVertexSrc() {
    var src =
        "attribute vec3 aVertexPosition;" +
        "void main(void) {" +
        "   gl_Position = vec4(aVertexPosition, 1.0);" +
        "}";

    return src;
}

function GetSimpleFragmentSrc() {
    var src = "void main(void) { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }";
    return src;
}

function CreateProgram(gl) {
    var prog = CreateProgramNoLinkingWithShadersSrc(gl, GetSimpleVertexSrc(), GetSimpleFragmentSrc());

    if (!LinkProgram(gl, prog)) {
        CleanProgram(gl, prog);
        return null;
    }

    return prog;
}

function CreateProgramWithVertexSrc(gl, vertexSrc) {
    var prog = CreateProgramNoLinkingWithVertexSrc(gl, vertexSrc, GetSimpleFragmentSrc());

    if (!LinkProgram(gl, prog)) {
        CleanProgram(gl, prog);
        return null;
    }

    return prog;
}

function CreateProgramWithFragmentSrc(gl, fragmentSrc) {
    var prog = CreateProgramNoLinkingWithShadersSrc(gl, GetSimpleVertexSrc(), fragmentSrc);

    if (!LinkProgram(gl, prog)) {
        CleanProgram(gl, prog);
        return null;
    }

    return prog;
}

function CreateProgramWithShadersSrc(gl, vertexSrc, fragmentSrc) {
    var prog = CreateProgramNoLinkingWithShadersSrc(gl, vertexSrc, fragmentSrc);

    if (!LinkProgram(gl, prog)) {
        CleanProgram(gl, prog);
        return null;
    }

    return prog;
}

function LinkProgram(gl, prog) {
    gl.linkProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call linkProgram()");
    var isLinked = gl.getProgramParameter(prog, gl.LINK_STATUS);
    equal(isLinked, true, "LOG: " + gl.getProgramInfoLog(prog));
    gl.getError();

    gl.useProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call useProgram()");

    return isLinked;
}

function CreateProgramNoLinking(gl) {
    return CreateProgramNoLinkingWithShadersSrc(gl, GetSimpleVertexSrc(), GetSimpleFragmentSrc());
}

function CreateProgramNoLinkingWithVertexSrc(gl, vertexSrc) {
    return CreateProgramNoLinkingWithShadersSrc(gl, vertexSrc, GetSimpleFragmentSrc());
}

function CreateProgramNoLinkingWithFragmentSrc(gl, fragmentSrc) {
    return CreateProgramNoLinkingWithShadersSrc(gl, GetSimpleVertexSrc(), fragmentSrc);
}

function CreateProgramNoLinkingWithShadersSrc(gl, vertexSrc, fragmentSrc) {
    var prog = gl.createProgram();
    var vShader = gl.createShader(gl.VERTEX_SHADER);
    var fShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vShader, vertexSrc);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call shaderSource() for vertex shader");
    gl.shaderSource(fShader, fragmentSrc);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call shaderSource() for fragment shader");

    gl.attachShader(prog, vShader);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call attachShader() for vertex shader");
    gl.attachShader(prog, fShader);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call attachShader() for fragment shader");

    gl.compileShader(vShader);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call compileShader() for vertex shader");
    gl.compileShader(fShader);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call compileShader() for fragment shader");

    return prog;
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

function IsInvalidBlendFuncParameters(gl, srcFactor, dstFactor) {
    var srcIsConstantColor = srcFactor == gl.CONSTANT_COLOR ||
        srcFactor == gl.ONE_MINUS_CONSTANT_COLOR;
    var srcIsConstantAlpha = srcFactor == gl.CONSTANT_ALPHA ||
        srcFactor == gl.ONE_MINUS_CONSTANT_ALPHA;
    var dstIsConstantColor = dstFactor == gl.CONSTANT_COLOR ||
        dstFactor == gl.ONE_MINUS_CONSTANT_COLOR;
    var dstIsConstantAlpha = dstFactor == gl.CONSTANT_ALPHA ||
        dstFactor == gl.ONE_MINUS_CONSTANT_ALPHA;

    return ((srcIsConstantColor && dstIsConstantAlpha) || (dstIsConstantColor && srcIsConstantAlpha));
}