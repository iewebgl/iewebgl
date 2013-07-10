
function ClearContext(gl) {
    gl.colorMask(true, true, true, true);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function ConvertToRGB(floatVal) {
    var val = Math.round(floatVal * 255);
    return Math.min(Math.max(val, 0), 255);
}

function FilledShapeShaders(color) {
    var quadColor = color || { r: 0, g: 0, b: 0, a: 0 };
    return {
        'vShader':
            "attribute vec3 aPos;" +
            "void main()" +
            "{" +
            "  gl_Position = vec4(aPos, 1.0);" +
            "}",
        'fShader':
            "precision mediump float;" +
            "void main()" +
            "{" +
            "  gl_FragColor = vec4(" + quadColor.r + "," + quadColor.g + "," + quadColor.b + "," + quadColor.a + ");" +
            "}"
    };
}

function ColoredShapeShaders() {
    return {
        'vShader':
            "precision mediump float;" +
            "attribute vec3 aPos;" +
            "attribute vec4 aColor;" +
            "varying vec4 vColor;" +
            "void main()" +
            "{" +
            "  gl_Position = vec4(aPos, 1.0);" +
            "  vColor = aColor;" +
            "}",
        'fShader':
            "precision mediump float;" +
            "varying vec4 vColor;" +
            "void main()" +
            "{" +
            "  gl_FragColor = vColor;" +
            "}"
    };
}

function SimpleTexturedShapeShaders() {
    return {
        'vShader':
            "attribute vec3 aPos;" +
            "void main()" +
            "{" +
            "  gl_Position = vec4(aPos, 1.0);" +
            "}",
        'fShader':
            "precision mediump float;" +
            "uniform sampler2D uSampler;" +
            "void main()" +
            "{" +
            "  gl_FragColor = texture2D(uSampler, vec2(0.5, 0.5));" +
            "}"
    };
}

function TexturedShapeShaders() {
    return {
        'vShader':
            "attribute vec3 aPos;" +
            "attribute vec2 aTexCoord;" +
            "varying vec2 vTexCoord;" +
            "void main()" +
            "{" +
            "  gl_Position = vec4(aPos, 1.0);" +
            "  vTexCoord = aTexCoord;" +
            "}",
        'fShader':
            "precision mediump float;" +
            "uniform sampler2D uSampler;" +
            "varying vec2 vTexCoord;" +
            "void main()" +
            "{" +
            "  gl_FragColor = texture2D(uSampler, vTexCoord);" +
            "}"
    };
}

function TrianglePosDesc(gl) {
    return {
        'attrName': "aPos",
        'data': new Float32Array([
                1.0, 1.0, 0.0,
                -1.0, 1.0, 0.0,
                -1.0, -1.0, 0.0]),
        'size': 3,
        'dataType': gl.FLOAT,
        'normalize': false
    };
}

function QuadPosDesc(gl)
{
    return {
        'attrName': "aPos",
        'data': new Float32Array([
            -1, -1, 0,
            1, -1, 0,
            1, 1, 0,
            -1, -1, 0,
            1, 1, 0,
            -1, 1, 0]),
        'size': 3,
        'dataType': gl.FLOAT,
        'normalize': false
    };
}

function QuadTexCoordDesc(gl)
{
    return {
        'attrName': "aTexCoord",
        'data': new Float32Array([
                0, 0,
                1, 0,
                1, 1,
                0, 0,
                1, 1,
                0, 1]),
        'size': 2,
        'dataType': gl.FLOAT,
        'normalize': false
    };
}

function GetBytesPerElement(gl, type) {
    switch(type) {
        case gl.BYTE: return 1;
        case gl.UNSIGNED_BYTE: return 1;
        case gl.SHORT: return 2;
        case gl.UNSIGNED_SHORT: return 2;
        case gl.FLOAT: return 4;
    }
    return 0;
}

function CreateBuffer(gl, prog, buffDesc) {
    var buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    equal(gl.getError(), gl.NO_ERROR, "bindBuffer() generates no errors");

    if(buffDesc.data) {        
        gl.bufferData(gl.ARRAY_BUFFER, buffDesc.data, gl.STATIC_DRAW);
        equal(gl.getError(), gl.NO_ERROR, "bufferData() generates no errors");
    }
    else if(buffDesc.dataLength) {
        gl.bufferData(gl.ARRAY_BUFFER, buffDesc.dataLength * GetBytesPerElement(gl, buffDesc.dataType), gl.STATIC_DRAW);
        equal(gl.getError(), gl.NO_ERROR, "bufferData() generates no errors");
    }

    var loc = gl.getAttribLocation(prog, buffDesc.attrName);
    equal(gl.getError(), gl.NO_ERROR, "getAttribLocation() generates no errors");
    gl.vertexAttribPointer(loc, buffDesc.size, buffDesc.dataType, buffDesc.normalize, 0, 0);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttribPointer() generates no errors");
    gl.enableVertexAttribArray(loc);
    equal(gl.getError(), gl.NO_ERROR, "enableVertexAttribArray() generates no errors");

    return { 'buff': buff, 'attrLocation': loc, 'vertexCount': (buffDesc.data ? buffDesc.data.length : buffDesc.dataLength) / buffDesc.size };
}

function CreateElementBuffer(gl, buffDesc) {
    var eBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eBuff);
    equal(gl.getError(), gl.NO_ERROR, "bindBuffer([ELEMENT_ARRAY_BUFFER]) generates no errors ");
    if(buffDesc.data) {        
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffDesc.data, gl.STATIC_DRAW);
        equal(gl.getError(), gl.NO_ERROR, "bufferData([ELEMENT_ARRAY_BUFFER]) generates no errors");
    }
    else if(buffDesc.dataLength) {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffDesc.dataLength * GetBytesPerElement(gl, buffDesc.dataType), gl.STATIC_DRAW);
        equal(gl.getError(), gl.NO_ERROR, "bufferData([ELEMENT_ARRAY_BUFFER]) generates no errors");
    }

    return { 'buff': eBuff };
}

function CreateQuadPosBuffer(gl, prog) {
    var posDesc = QuadPosDesc(gl);
    return CreateBuffer(gl, prog, posDesc);
}

function DeleteBuffers(gl, prog, buffDescs) {
    for (var i = 0; i < buffDescs.length; ++i) {
        if (buffDescs[i].attrLocation != undefined)
            gl.disableVertexAttribArray(buffDescs[i].attrLocation);

        gl.deleteBuffer(buffDescs[i].buff);
    }
}

function DrawAndRead(gl, vShader, fShader, buffDescs, area, desc) {
    var prog = CreateProgramWithShadersSrc(gl, vShader, fShader);
    if (!prog)
        return null;

    var buffs = [];
    for (var i = 0; i < buffDescs.length; ++i) {
        buffs.push(CreateBuffer(gl, prog, buffDescs[i]));
    }

    var vertexCount = buffs[0].vertexCount;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    equal(gl.getError(), gl.NO_ERROR, "clear() generates no errors " + desc);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors " + desc);

    var resultBuf = CreateDataBuffer(gl, gl.RGBA, gl.UNSIGNED_BYTE, area.width, area.height);
    gl.readPixels(area.x, area.y, area.width, area.height, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors " + desc);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);

    return resultBuf;
}

function DoDrawTest(gl, vShader, fShader, buffDescs, expectedColor, desc) {
    var result = DrawAndRead(gl, vShader, fShader, buffDescs, { x: 0, y: 0, width: 1, height: 1 }, desc);
    equal(result[0], expectedColor.r, "Check r-value " + desc);
    equal(result[1], expectedColor.g, "Check g-value " + desc);
    equal(result[2], expectedColor.b, "Check b-value " + desc);
    equal(result[3], expectedColor.a, "Check a-value " + desc);
}

function CheckPixelsInArea(pixels, width, height, area, inColor, outColor) {
  for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            var index = (y * width + x) * 4;
            var refColor = outColor;

            if ((x >= area.x) && (x < area.x + area.width) &&
                (y >= area.y) && (y < area.y + area.height)) {
                refColor = inColor;
            }

            if (pixels[index] != refColor.r || pixels[index + 1] != refColor.g ||
                pixels[index + 2] != refColor.b || pixels[index + 3] != refColor.a)
                return false;
        }
    }

    return true;
}

function CheckPixelsInTexture(gl, tex, texWidth, texHeight, area, color) {

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    equal(gl.getError(), gl.NO_ERROR, "bindFramebuffer() generates no errors");
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    equal(gl.getError(), gl.NO_ERROR, "framebufferTexture2D() generates no errors");
    equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() == FRAMEBUFFER_COMPLETE");

    var data = CreateDataBuffer(gl, gl.RGBA, gl.UNSIGNED_BYTE, texWidth, texHeight);
    gl.readPixels(0, 0, texWidth, texHeight, gl.RGBA, gl.UNSIGNED_BYTE, data);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
    gl.deleteFramebuffer(fb);

    return CheckPixelsInArea(data, texWidth, texHeight, area, color, { r: 0, g: 0, b: 0, a: 0 });
}

function CheckCanvasPixels(gl, color) {
    var pxls = CreateDataBuffer(gl, gl.RGBA, gl.UNSIGNED_BYTE, gl.canvas.width, gl.canvas.height);
    gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pxls);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");

    for (var i = 0; i < pxls.length - 4; i += 4) {
        if (pxls[i] != color.r || pxls[i + 1] != color.g || pxls[i + 2] != color.b || pxls[i + 3] != color.a)
            return false;
    }

    return true;
}

function DoTexParameterTest(gl, prog, vertexCount, texDesc, texParamDesc, expectedColor) {

    gl.activeTexture(gl.TEXTURE0);
    var tex = CreateTexture2D(gl, gl.RGBA, texDesc.width, texDesc.height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    FillTexture(gl, tex, gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texDesc.color);

    var loc = gl.getUniformLocation(prog, "uSampler");
    gl.uniform1i(loc, 0);

    gl.texParameteri(gl.TEXTURE_2D, texParamDesc.type, texParamDesc.value);
    equal(gl.getError(), gl.NO_ERROR, "texParameteri() generates no errors " + texParamDesc.desc);

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors " + texParamDesc.desc);

    var resultBuf = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
    equal(resultBuf[0], expectedColor.r, "Check r-value " + texParamDesc.desc);
    equal(resultBuf[1], expectedColor.g, "Check g-value " + texParamDesc.desc);
    equal(resultBuf[2], expectedColor.b, "Check b-value " + texParamDesc.desc);
    equal(resultBuf[3], expectedColor.a, "Check a-value " + texParamDesc.desc);

    gl.deleteTexture(tex);
}

function CalcBlendFactor(gl, func, scrColor, dstColor, constColor) {
    switch (func) {
        case gl.ZERO:
            return { r: 0, g: 0, b: 0, a: 0 };
        case gl.ONE:
            return { r: 1, g: 1, b: 1, a: 1 };
        case gl.SRC_COLOR:
            return scrColor;
        case gl.ONE_MINUS_SRC_COLOR:
            return { r: 1 - scrColor.r, g: 1 - scrColor.g, b: 1 - scrColor.b, a: 1 - scrColor.a };
        case gl.DST_COLOR:
            return dstColor;
        case gl.ONE_MINUS_DST_COLOR:
            return { r: 1 - dstColor.r, g: 1 - dstColor.g, b: 1 - dstColor.b, a: 1 - dstColor.a };
        case gl.SRC_ALPHA:
            return { r: scrColor.a, g: scrColor.a, b: scrColor.a, a: scrColor.a };
        case gl.ONE_MINUS_SRC_ALPHA:
            return { r: 1 - scrColor.a, g: 1 - scrColor.a, b: 1 - scrColor.a, a: 1 - scrColor.a };
        case gl.DST_ALPHA:
            return { r: dstColor.a, g: dstColor.a, b: dstColor.a, a: dstColor.a };
        case gl.ONE_MINUS_DST_ALPHA:
            return { r: 1 - dstColor.a, g: 1 - dstColor.a, b: 1 - dstColor.a, a: 1 - dstColor.a };
        case gl.CONSTANT_COLOR:
            return constColor;
        case gl.ONE_MINUS_CONSTANT_COLOR:
            return { r: 1 - constColor.r, g: 1 - constColor.g, b: 1 - constColor.b, a: 1 - constColor.a };
        case gl.CONSTANT_ALPHA:
            return { r: constColor.a, g: constColor.a, b: constColor.a, a: constColor.a };
        case gl.ONE_MINUS_CONSTANT_ALPHA:
            return { r: 1 - constColor.a, g: 1 - constColor.a, b: 1 - constColor.a, a: 1 - constColor.a };
        case gl.SRC_ALPHA_SATURATE:
            {
                var rgbVal = Math.min(scrColor.a, 1 - dstColor.a);
                return { r: rgbVal, g: rgbVal, b: rgbVal, a: 1 };
            }
    }
    return null;
}

function BlendAddFunc(scrColor, dstColor, srcBlendFactor, dstBlendFactor) {
    var val1 = MultiplyColors(scrColor, srcBlendFactor);
    var val2 = MultiplyColors(dstColor, dstBlendFactor);

    return AddColors(val1, val2);
}

function BlendSubFunc(scrColor, dstColor, srcBlendFactor, dstBlendFactor) {
    var val1 = MultiplyColors(scrColor, srcBlendFactor);
    var val2 = MultiplyColors(dstColor, dstBlendFactor);

    return SubColors(val1, val2);
}

function BlendReverseSubFunc(scrColor, dstColor, srcBlendFactor, dstBlendFactor) {
    var val1 = MultiplyColors(scrColor, srcBlendFactor);
    var val2 = MultiplyColors(dstColor, dstBlendFactor);

    return SubColors(val2, val1);
}

function CalcBlendColor(gl, scrColor, dstColor, equalMode, srcFunc, dstFunc, blendColor) {
    var srcBlendFactor = CalcBlendFactor(gl, srcFunc, scrColor, dstColor, blendColor);
    var dstBlendFactor = CalcBlendFactor(gl, dstFunc, scrColor, dstColor, blendColor);

    switch (equalMode) {
        case gl.FUNC_ADD:
            return BlendAddFunc(scrColor, dstColor, srcBlendFactor, dstBlendFactor);
        case gl.FUNC_SUBTRACT:
            return BlendSubFunc(scrColor, dstColor, srcBlendFactor, dstBlendFactor);
        case gl.FUNC_REVERSE_SUBTRACT:
            return BlendReverseSubFunc(scrColor, dstColor, srcBlendFactor, dstBlendFactor);
    }

    return null;
}

//////////////////////////////////////////////////////////////////////////

module("WebGLFunctional")

test("verify clear work", function () {
    var gl = GetCleanContext();

    gl.clearColor(0, 1, 1, 0);
    equal(gl.getError(), gl.NO_ERROR, "clearColor(0, 1, 1, 0) generates no errors");
    gl.clear(gl.COLOR_BUFFER_BIT);
    equal(gl.getError(), gl.NO_ERROR, "clear() generates no errors");
    ok(CheckCanvasPixels(gl, { r: 0, g: 255, b: 255, a: 0 }), "Check pixels");

    gl.clearColor(1, 0, 0, 1);
    equal(gl.getError(), gl.NO_ERROR, "clearColor(1, 0, 0, 1) generates no errors");
    gl.clear(gl.COLOR_BUFFER_BIT);
    equal(gl.getError(), gl.NO_ERROR, "clear(1, 0, 0, 1) generates no errors");
    ok(CheckCanvasPixels(gl, { r: 255, g: 0, b: 0, a: 255 }), "Check pixels");

    gl.colorMask(false, false, false, false);
    equal(gl.getError(), gl.NO_ERROR, "colorMask(false, false, false, false) generates no errors");
    gl.clearColor(1, 1, 1, 1);
    equal(gl.getError(), gl.NO_ERROR, "clearColor(1, 1, 1, 1) generates no errors");
    gl.clear(gl.COLOR_BUFFER_BIT);
    equal(gl.getError(), gl.NO_ERROR, "clear(1, 1, 1, 1) generates no errors");
    ok(CheckCanvasPixels(gl, { r: 255, g: 0, b: 0, a: 255 }), "Check pixels");

    gl.colorMask(true, true, true, true);

    ClearContext(gl);
});

test("verify scissor work", function () {
    var gl = GetCleanContext();

    var inScissorColor = { r: 255, g: 0, b: 0, a: 255 };
    var outScissorColor = { r: 255, g: 255, b: 255, a: 255 };
    var scissorBox = { x: 0, y: 0, width: 4, height: 4 };

    gl.clearColor(outScissorColor.r / 255, outScissorColor.g / 255, outScissorColor.b / 255, outScissorColor.a / 255);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.SCISSOR_TEST);
    equal(gl.getError(), gl.NO_ERROR, "enable(gl.SCISSOR_TEST) generates no errors");
    gl.scissor(scissorBox.x, scissorBox.y, scissorBox.width, scissorBox.height);
    equal(gl.getError(), gl.NO_ERROR, "scissor() generates no errors");
    gl.clearColor(inScissorColor.r / 255, inScissorColor.g / 255, inScissorColor.b / 255, inScissorColor.a / 255);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var pxls = CreateDataBuffer(gl, gl.RGBA, gl.UNSIGNED_BYTE, gl.canvas.width, gl.canvas.height);
    gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pxls);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");

    ok(CheckPixelsInArea(pxls, gl.canvas.width, gl.canvas.height, scissorBox, inScissorColor, outScissorColor), "Check pixels [enabled scissor]");

    gl.disable(gl.SCISSOR_TEST);
    equal(gl.getError(), gl.NO_ERROR, "disable(gl.SCISSOR_TEST) generates no errors");
    gl.scissor(scissorBox.x, scissorBox.y, scissorBox.width, scissorBox.height);
    equal(gl.getError(), gl.NO_ERROR, "scissor() generates no errors");
    gl.clearColor(outScissorColor.r / 255, outScissorColor.g / 255, outScissorColor.b / 255, outScissorColor.a / 255);
    gl.clear(gl.COLOR_BUFFER_BIT);

    ok(CheckCanvasPixels(gl, outScissorColor), "Check pixels [disabled scissor]");

    ClearContext(gl);
});

test("verify alpha attribute", function () {
    var testValues =
    [
        {
            alpha: true,
            clearColor: { r: 0, g: 255, b: 0, a: 0 },
            expectedColor: { r: 0, g: 255, b: 0, a: 0 }
        },
        {
            alpha: false,
            clearColor: { r: 0, g: 255, b: 0, a: 0 },
            expectedColor: { r: 0, g: 255, b: 0, a: 255 }
        }
    ];

    for (var i = 0; i < testValues.length; ++i) {
        var desc = "alpha = " + testValues[i].alpha;

        CreateExlusiveContext({ depth: false, stencil: false, alpha: testValues[i].alpha });
        var gl = GetExlusiveParamContext();

        var attrs = gl.getContextAttributes();
        equal(attrs.alpha, testValues[i].alpha, "getContextAttributes().alpha == " + testValues[i].alpha);

        gl.clearColor(testValues[i].clearColor.r, testValues[i].clearColor.g, testValues[i].clearColor.b, testValues[i].clearColor.a);
        gl.clear(gl.COLOR_BUFFER_BIT);

        var resultBuf = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
        equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");

        equal(resultBuf[0], testValues[i].expectedColor.r, "Check r-value [" + desc + "]");
        equal(resultBuf[1], testValues[i].expectedColor.g, "Check g-value [" + desc + "]");
        equal(resultBuf[2], testValues[i].expectedColor.b, "Check b-value [" + desc + "]");
        equal(resultBuf[3], testValues[i].expectedColor.a, "Check a-value [" + desc + "]");

        RemoveExlusiveContext();
    }
});

test("verify depth attribute", function () {
    var shaders = FilledShapeShaders({ r: 1, g: 0, b: 0, a: 1 });

    var testValues =
    [
        {
            depth: true,
            depthTest: true,
            clearColor: { r: 0, g: 255, b: 0, a: 255 },
            expectedColor: { r: 0, g: 255, b: 0, a: 255 }
        },
        {
            depth: false,
            depthTest: true,
            clearColor: { r: 0, g: 255, b: 0, a: 0 },
            expectedColor: { r: 255, g: 0, b: 0, a: 255 }
        },
        {
            depth: true,
            depthTest: false,
            clearColor: { r: 0, g: 255, b: 0, a: 0 },
            expectedColor: { r: 255, g: 0, b: 0, a: 255 }
        }
    ];

    for (var i = 0; i < testValues.length; ++i) {
        var desc = "[depth == " + testValues[i].depth + ", depth test is " + (testValues[i].depthTest ? "enable" : "disable") + "]";

        CreateExlusiveContext({ depth: testValues[i].depth, stencil: false, alpha: false });
        var gl = GetExlusiveParamContext();

        var attrs = gl.getContextAttributes();
        equal(attrs.depth, testValues[i].depth, "getContextAttributes().depth == " + testValues[i].depth);

        gl.depthFunc(gl.NEVER);
        testValues[i].depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);

        gl.clearColor(testValues[i].clearColor.r, testValues[i].clearColor.g, testValues[i].clearColor.b, testValues[i].clearColor.a);
        gl.clearDepth(1);
        DoDrawTest(gl, shaders.vShader, shaders.fShader, [ QuadPosDesc(gl) ], testValues[i].expectedColor, desc);

        RemoveExlusiveContext();
    }
});

test("verify stencil attribute", function () {
    var shaders = FilledShapeShaders({ r: 1, g: 0, b: 0, a: 1 });

    var testValues =
    [
        {
            stencil: true,
            stencilTest: true,
            clearColor: { r: 0, g: 255, b: 0, a: 255 },
            expectedColor: { r: 0, g: 255, b: 0, a: 255 }
        },
        {
            stencil: false,
            stencilTest: true,
            clearColor: { r: 0, g: 255, b: 0, a: 0 },
            expectedColor: { r: 255, g: 0, b: 0, a: 255 }
        },
        {
            stencil: true,
            stencilTest: false,
            clearColor: { r: 0, g: 255, b: 0, a: 0 },
            expectedColor: { r: 255, g: 0, b: 0, a: 255 }
        }
    ];

    for (var i = 0; i < testValues.length; ++i) {
        var desc = "[stencil == " + testValues[i].stencil + ", stencil test is " + (testValues[i].stencilTest ? "enable" : "disable") + "]";

        CreateExlusiveContext({ stencil: testValues[i].stencil, depth: false, alpha: false });
        var gl = GetExlusiveParamContext();

        var attrs = gl.getContextAttributes();
        equal(attrs.stencil, testValues[i].stencil, "getContextAttributes().stencil == " + testValues[i].stencil);

        gl.depthFunc(gl.ALWAYS);
        gl.stencilFunc(gl.NEVER, 1, 1);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

        testValues[i].stencilTest ? gl.enable(gl.STENCIL_TEST) : gl.disable(gl.STENCIL_TEST);

        gl.clearColor(testValues[i].clearColor.r, testValues[i].clearColor.g, testValues[i].clearColor.b, testValues[i].clearColor.a);
        gl.clearDepth(1);
        gl.clearStencil(0);
        DoDrawTest(gl, shaders.vShader, shaders.fShader, [QuadPosDesc(gl)], testValues[i].expectedColor, desc);

        RemoveExlusiveContext();
    }
});

function RunAntialiasTest(antialiasEnable) {
    var canvasWidth = 2, canvasHeight = 2;

    CreateExlusiveContext({ stencil: false, depth: false, alpha: false, antialias: antialiasEnable });
    var gl = GetExlusiveParamContext();
    gl.viewport(0, 0, canvasWidth, canvasHeight);

    var attrs = gl.getContextAttributes();
    equal(attrs.antialias, antialiasEnable, "getContextAttributes().antialias == " + antialiasEnable);

    gl.clearColor(0, 0, 0, 1);

    var desc = "[antialias == " + antialiasEnable + "]";
    var shaders = FilledShapeShaders({ r: 1, g: 0, b: 0, a: 1 });
    var result = DrawAndRead(gl, shaders.vShader, shaders.fShader, [TrianglePosDesc(gl)],
        { x: 0, y: 0, width: 1, height: 1 }, desc);
    ok((result[0] != 255 && result[0] != 0) == antialiasEnable, "Check r-value " + desc);

    RemoveExlusiveContext();
}

test("verify antialiasing attribute", function () {
    RunAntialiasTest(true);
    RunAntialiasTest(false);
});

function RunPremultipliedAlphaTest(isPremultipliedAlpha, unpackPremultiplyAlpha, texColor, expectedColor) {
    var desc = "[premultipliedAlpha is " + isPremultipliedAlpha + ", UNPACK_PREMULTIPLY_ALPHA_WEBGL is " + unpackPremultiplyAlpha + "]";

    CreateExlusiveContext({ premultipliedAlpha: isPremultipliedAlpha });
    var gl = GetExlusiveParamContext();

    var attrs = gl.getContextAttributes();
    equal(attrs.premultipliedAlpha, isPremultipliedAlpha, "getContextAttributes().premultipliedAlpha == " + isPremultipliedAlpha);

    var shaders = SimpleTexturedShapeShaders();
    var prog = CreateProgramWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    var vertexCount = buffs[0].vertexCount;

    var texDesc =
    {
        format: gl.RGBA,
        type: gl.UNSIGNED_BYTE,
        width: 2,
        height: 2
    };

    gl.activeTexture(gl.TEXTURE0);
    var tex = CreateTexture2D(gl, texDesc.format, texDesc.width, texDesc.height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    FillTexture(gl, tex, gl.TEXTURE_2D, texDesc.format, texDesc.type, texDesc.width, texDesc.height, texColor);

    var loc = gl.getUniformLocation(prog, "uSampler");
    gl.uniform1i(loc, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors");

    var canvasTex = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, unpackPremultiplyAlpha);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, false);
    gl.bindTexture(gl.TEXTURE_2D, canvasTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, GetWebGLParentExlusiveContext());

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors");

    var resultBuf = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
    equal(resultBuf[0], expectedColor.r, "Check r-value " + desc);
    equal(resultBuf[1], expectedColor.g, "Check g-value " + desc);
    equal(resultBuf[2], expectedColor.b, "Check b-value " + desc);
    equal(resultBuf[3], expectedColor.a, "Check a-value " + desc);

    gl.deleteTexture(tex);
    gl.deleteTexture(canvasTex);

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);

    RemoveExlusiveContext();
}

test("verify premultiplied alpha", function () {
    var testValues =
    [
        {
            premultipliedAlpha: true,
            unpackPremultiplyAlpha: false,
            texColor: { r: 128, g: 64, b: 32, a: 128 },
            expectedColor: { r: 255, g: 127, b: 64, a: 128 }
        },
        {
            premultipliedAlpha: false,
            unpackPremultiplyAlpha: false,
            texColor: { r: 128, g: 64, b: 32, a: 128 },
            expectedColor: { r: 128, g: 64, b: 32, a: 128 }
        },
        {
            premultipliedAlpha: true,
            unpackPremultiplyAlpha: true,
            texColor: { r: 128, g: 64, b: 32, a: 128 },
            expectedColor: { r: 128, g: 64, b: 32, a: 128 }
        },
        {
            premultipliedAlpha: false,
            unpackPremultiplyAlpha: true,
            texColor: { r: 128, g: 64, b: 32, a: 128 },
            expectedColor: { r: 64, g: 32, b: 16, a: 128 }
        }
    ];

    for (var i = 0; i < testValues.length; ++i) {
        RunPremultipliedAlphaTest(
            testValues[i].premultipliedAlpha,
            testValues[i].unpackPremultiplyAlpha,
            testValues[i].texColor, 
            testValues[i].expectedColor);
    }

});

test("verify readPixels() & uniform() work [draw triangle, antialias is disabled]", function () {
    var canvasWidth = 2, canvasHeight = 2;

    CreateExlusiveContext({ antialias: false });
    var gl = GetExlusiveParamContext();
    gl.viewport(0, 0, canvasWidth, canvasHeight);

    gl.clearColor(1, 0, 0, 1);
    gl.disable(gl.BLEND);

    var shaders = FilledShapeShaders({ r: 0, g: 1, b: 1, a: 0 });
    var result = DrawAndRead(gl, shaders.vShader, shaders.fShader, [TrianglePosDesc(gl)], 
        { x: 0, y: 0, width: canvasWidth, height: canvasHeight }, "[triangle test]");

    var offset = 4;
    equal(result[1 * offset], 255, "Check r-value [right-top]");
    equal(result[1 * offset + 1], 0, "Check g-value [right-top]");
    equal(result[1 * offset + 2], 0, "Check b-value [right-top]");
    equal(result[1 * offset + 3], 255, "Check a-value [right-top]");

    equal(result[2 * offset], 0, "Check r-value [left-bottom]");
    equal(result[2 * offset + 1], 255, "Check g-value [left-bottom]");
    equal(result[2 * offset + 2], 255, "Check b-value [left-bottom]");
    equal(result[2 * offset + 3], 0, "Check a-value [left-bottom]");

    RemoveExlusiveContext();
});

test("verify texImage2D [type conversions]", function () {

    var gl = GetCleanContext();

    var shaders = SimpleTexturedShapeShaders();
    var prog = CreateProgramWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    var vertexCount = buffs[0].vertexCount;

    var texColor = { r: 255, g: 0, b: 0, a: 255 };
    var texDesc =
    {
        width: 2,
        height: 2
    };

    var testValues = 
    [
         { 'desc': "[UNSIGNED_SHORT_5_6_5]", 'type': gl.UNSIGNED_SHORT_5_6_5, 'format': gl.RGB, expectedColor: { r: texColor.r, g: texColor.g, b: texColor.b, a: 255} },
         { 'desc': "[UNSIGNED_SHORT_4_4_4_4]", 'type': gl.UNSIGNED_SHORT_4_4_4_4, 'format': gl.RGBA, expectedColor: texColor },
         { 'desc': "[UNSIGNED_SHORT_5_5_5_1]", 'type': gl.UNSIGNED_SHORT_5_5_5_1, 'format': gl.RGBA, expectedColor: texColor },
         { 'desc': "[UNSIGNED_BYTE]", 'type': gl.UNSIGNED_BYTE, 'format': gl.RGBA, expectedColor: texColor }
    ];

    for(var i = 0; i < testValues.length; ++i)
    {
        gl.activeTexture(gl.TEXTURE0);
        var tex = CreateTexture2D(gl, testValues[i].format, texDesc.width, texDesc.height);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        FillTexture(gl, tex, gl.TEXTURE_2D, testValues[i].format, testValues[i].type, texDesc.width, texDesc.height, texColor);

        var loc = gl.getUniformLocation(prog, "uSampler");
        gl.uniform1i(loc, 0);

        gl.clearColor(1,1,1,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
        equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors "+ testValues[i].desc);

        var resultBuf = CreateDataBuffer(gl, gl.RGBA, gl.UNSIGNED_BYTE, 1, 1);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
        equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors " + testValues[i].desc);
        equal(resultBuf[0], testValues[i].expectedColor.r, "Check r-value " + testValues[i].desc);
        equal(resultBuf[1], testValues[i].expectedColor.g, "Check g-value " + testValues[i].desc);
        equal(resultBuf[2], testValues[i].expectedColor.b, "Check b-value " + testValues[i].desc);
        equal(resultBuf[3], testValues[i].expectedColor.a, "Check a-value " + testValues[i].desc);

        gl.deleteTexture(tex);
    }

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);
    ClearContext(gl);
});

function GenerateTexData(gl, sMode, tMode, texColors) {
    var pxls = [];
    switch(sMode) {
    case gl.CLAMP_TO_EDGE:
        switch(tMode) {
        case gl.CLAMP_TO_EDGE:
            pxls =  
            [
              texColors[0], texColors[1], texColors[1], texColors[1],
              texColors[2], texColors[3], texColors[3], texColors[3],
              texColors[2], texColors[3], texColors[3], texColors[3],
              texColors[2], texColors[3], texColors[3], texColors[3]
            ]; break;
        case gl.MIRRORED_REPEAT:
            pxls =  
            [
              texColors[0], texColors[1], texColors[1], texColors[1],
              texColors[2], texColors[3], texColors[3], texColors[3],
              texColors[2], texColors[3], texColors[3], texColors[3],
              texColors[0], texColors[1], texColors[1], texColors[1]
            ]; break;
        case gl.REPEAT:
            pxls =  
            [
              texColors[0], texColors[1], texColors[1], texColors[1],
              texColors[2], texColors[3], texColors[3], texColors[3],
              texColors[0], texColors[1], texColors[1], texColors[1],
              texColors[2], texColors[3], texColors[3], texColors[3]
            ]; break;
        }
    case gl.MIRRORED_REPEAT:
        switch(tMode) {
        case gl.CLAMP_TO_EDGE:
            pxls =  
            [
              texColors[0], texColors[1], texColors[1], texColors[0],
              texColors[2], texColors[3], texColors[3], texColors[2],
              texColors[2], texColors[3], texColors[3], texColors[2],
              texColors[2], texColors[3], texColors[3], texColors[2]
            ]; break;
        case gl.MIRRORED_REPEAT:
            pxls =  
            [
              texColors[0], texColors[1], texColors[1], texColors[0],
              texColors[2], texColors[3], texColors[3], texColors[2],
              texColors[2], texColors[3], texColors[3], texColors[2],
              texColors[0], texColors[1], texColors[1], texColors[0]
            ]; break;
        case gl.REPEAT:
            pxls =  
            [
              texColors[0], texColors[1], texColors[1], texColors[0],
              texColors[2], texColors[3], texColors[3], texColors[2],
              texColors[0], texColors[1], texColors[1], texColors[0],
              texColors[2], texColors[3], texColors[3], texColors[2]
            ]; break;
        }
    case gl.REPEAT:
        switch(tMode) {
        case gl.CLAMP_TO_EDGE:
            pxls =  
            [
              texColors[0], texColors[1], texColors[0], texColors[1],
              texColors[2], texColors[3], texColors[2], texColors[3],
              texColors[2], texColors[3], texColors[2], texColors[3],
              texColors[2], texColors[3], texColors[2], texColors[3]
            ]; break;
        case gl.MIRRORED_REPEAT:
            pxls =  
            [
              texColors[0], texColors[1], texColors[0], texColors[1],
              texColors[2], texColors[3], texColors[2], texColors[3],
              texColors[2], texColors[3], texColors[2], texColors[3],
              texColors[0], texColors[1], texColors[0], texColors[1]
            ]; break;
        case gl.REPEAT:
            pxls =  
            [
              texColors[0], texColors[1], texColors[0], texColors[1],
              texColors[2], texColors[3], texColors[2], texColors[3],
              texColors[0], texColors[1], texColors[0], texColors[1],
              texColors[2], texColors[3], texColors[2], texColors[3]
            ]; break;
        }
    }

    return pxls;
}

test("verify texParameteri [texture wraps]", function () {
    var canvasWidth = 4, canvasHeight = 4;
    CreateExlusiveContext({});
    var gl = GetExlusiveContext();
    gl.viewport(0, 0, canvasWidth, canvasHeight);

    var shaders = TexturedShapeShaders();
    var prog = CreateProgramWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var quadTexCoordDesc = {
        'attrName': "aTexCoord",
        'data': new Float32Array([
                0, 0,
                2, 0,
                2, 2,
                0, 0,
                2, 2,
                0, 2]),
        'size': 2,
        'dataType': gl.FLOAT,
        'normalize': false
    };

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    buffs.push(CreateBuffer(gl, prog, quadTexCoordDesc));
    var vertexCount = buffs[0].vertexCount;

    var texDesc =
    {
        format: gl.RGBA,
        type: gl.UNSIGNED_BYTE,
        width: 2,
        height: 2
    };

    var texColors = 
    [
      { r: 255, g: 0,   b: 0,   a: 255},
      { r: 0,   g: 255, b: 0,   a: 255 },
      { r: 0,   g: 0,   b: 255, a: 255 },
      { r: 255, g: 0,   b: 255, a: 255 }  
    ];

    var testValues = 
    [
        { 'name': "CLAMP_TO_EDGE", 'value': gl.CLAMP_TO_EDGE},
        { 'name': "MIRRORED_REPEAT", 'value': gl.MIRRORED_REPEAT },
        { 'name': "REPEAT", 'value': gl.REPEAT }
    ];

    for(var sIt = 0; sIt < testValues.length; ++sIt)
    {
        for(var tIt = 0; tIt < testValues.length; ++tIt)
        {
            var desc = "[TEXTURE_WRAP_S = " + testValues[sIt].name + ", TEXTURE_WRAP_T = " + testValues[tIt].name + "]";
            gl.activeTexture(gl.TEXTURE0);
            var tex = CreateTexture2D(gl, texDesc.format, texDesc.width, texDesc.height);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, testValues[sIt].value);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, testValues[tIt].value);
            var pxls = CreateDataBuffer(gl, texDesc.format, texDesc.type, texDesc.width, texDesc.height);
            for (var i = 0; i < texColors.length; ++i) {
                pxls[i * 4 + 0] = texColors[i].r;
                pxls[i * 4 + 1] = texColors[i].g;
                pxls[i * 4 + 2] = texColors[i].b;
                pxls[i * 4 + 3] = texColors[i].a;
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, texDesc.format, texDesc.width, texDesc.height, 0, texDesc.format, texDesc.type, pxls);
            equal(gl.getError(), gl.NO_ERROR, "texImage2D() generates no errors " + desc);

            var loc = gl.getUniformLocation(prog, "uSampler");
            gl.uniform1i(loc, 0);

            gl.clearColor(1,1,1,1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
            equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors " + desc);

            var resultBuf = CreateDataBuffer(gl, gl.RGBA, gl.UNSIGNED_BYTE, canvasWidth, canvasHeight);
            gl.readPixels(0, 0, canvasWidth, canvasHeight, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
            equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors " + desc);
            var isOk = true;
            var expected = GenerateTexData(gl, testValues[sIt].value, testValues[tIt].value, texColors);
            for(var p = 0; p < expected.length; ++p)
            {
                var curColor = expected[p];
                var isOk =  resultBuf[p*4 + 0] == curColor.r &&
                            resultBuf[p*4 + 1] == curColor.g && 
                            resultBuf[p*4 + 2] == curColor.b && 
                            resultBuf[p*4 + 3] == curColor.a;
                if(!isOk){
                    break;
                }
            }
            ok(isOk, "Check pixel " + desc);

            gl.deleteTexture(tex);
        }
    }

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);
    
    RemoveExlusiveContext();
});

test("verify texParameteri() [TEXTURE_MIN_FILTER requires mipmap]", function () {
    var gl = GetCleanContext();

    var shaders = SimpleTexturedShapeShaders();
    var prog = CreateProgramWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    var vertexCount = buffs[0].vertexCount;

    var defColor = { a: 255, r: 0, g: 0, b: 0 };
    var texColor = { a: 255, r: 64, g: 0, b: 125 };
    var texDesc =
    {
        width: 64,
        height: 64,
        color: texColor
    };

    var testValues =
    [
        {
            'expectedColor': texColor,
            'texDesc': texDesc,
            'texParamDesc': 
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.NEAREST,
                'desc': "[TEXTURE_MIN_FILTER == NEAREST]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': texDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.NEAREST_MIPMAP_NEAREST,
                'desc': "[TEXTURE_MIN_FILTER == NEAREST_MIPMAP_NEAREST]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': texDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.LINEAR_MIPMAP_NEAREST,
                'desc': "[TEXTURE_MIN_FILTER == LINEAR_MIPMAP_NEAREST]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': texDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.NEAREST_MIPMAP_LINEAR,
                'desc': "[TEXTURE_MIN_FILTER == NEAREST_MIPMAP_LINEAR]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': texDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.LINEAR_MIPMAP_LINEAR,
                'desc': "[TEXTURE_MIN_FILTER == LINEAR_MIPMAP_LINEAR]"
            }
        },
        {
            'expectedColor': texColor,
            'texDesc': texDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.LINEAR,
                'desc': "[TEXTURE_MIN_FILTER == LINEAR]"
            }
        }
    ];

    for (var i = 0; i < testValues.length; ++i) {
        DoTexParameterTest(gl, prog, vertexCount, testValues[i].texDesc, testValues[i].texParamDesc, testValues[i].expectedColor);
    }

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);
    ClearContext(gl);
});

test("verify texParameteri() [texture is not a power of 2]", function () {
    var gl = GetCleanContext();

    var shaders = SimpleTexturedShapeShaders();
    var prog = CreateProgramWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    var vertexCount = buffs[0].vertexCount;

    var defColor = { a: 255, r: 0, g: 0, b: 0 };
    var texColor = { a: 255, r: 64, g: 0, b: 125 };
    var npotTexDesc =
    {
        width: 60,
        height: 60,
        color: texColor
    };

    var testValues =
    [
        {
            'expectedColor': texColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
                {
                    'type': gl.TEXTURE_MIN_FILTER,
                    'value': gl.NEAREST,
                    'desc': "[TEXTURE_MIN_FILTER == NEAREST]"
                }
        },
        {
            'expectedColor': defColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.NEAREST_MIPMAP_NEAREST,
                'desc': "[TEXTURE_MIN_FILTER == NEAREST_MIPMAP_NEAREST]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.LINEAR_MIPMAP_NEAREST,
                'desc': "[TEXTURE_MIN_FILTER == LINEAR_MIPMAP_NEAREST]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.NEAREST_MIPMAP_LINEAR,
                'desc': "[TEXTURE_MIN_FILTER == NEAREST_MIPMAP_LINEAR]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.LINEAR_MIPMAP_LINEAR,
                'desc': "[TEXTURE_MIN_FILTER == LINEAR_MIPMAP_LINEAR]"
            }
        },
        {
            'expectedColor': texColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_MIN_FILTER,
                'value': gl.LINEAR,
                'desc': "[TEXTURE_MIN_FILTER == LINEAR]"
            }
        },

//////////////////////////////////////////////////////////////////////////
        {
            'expectedColor': texColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_WRAP_S,
                'value': gl.CLAMP_TO_EDGE,
                'desc': "[TEXTURE_WRAP_S == CLAMP_TO_EDGE]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_WRAP_S,
                'value': gl.MIRRORED_REPEAT,
                'desc': "[TEXTURE_WRAP_S == MIRRORED_REPEAT]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_WRAP_S,
                'value': gl.REPEAT,
                'desc': "[TEXTURE_WRAP_S == REPEAT]"
            }
        },
        {
            'expectedColor': texColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_WRAP_T,
                'value': gl.CLAMP_TO_EDGE,
                'desc': "[TEXTURE_WRAP_T == CLAMP_TO_EDGE]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_WRAP_T,
                'value': gl.MIRRORED_REPEAT,
                'desc': "[TEXTURE_WRAP_T == MIRRORED_REPEAT]"
            }
        },
        {
            'expectedColor': defColor,
            'texDesc': npotTexDesc,
            'texParamDesc':
            {
                'type': gl.TEXTURE_WRAP_T,
                'value': gl.REPEAT,
                'desc': "[TEXTURE_WRAP_T == REPEAT]"
            }
        }
    ];

    for (var i = 0; i < testValues.length; ++i) {
        DoTexParameterTest(gl, prog, vertexCount, testValues[i].texDesc, testValues[i].texParamDesc, testValues[i].expectedColor);
    }

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);
    ClearContext(gl);
});

test("verify texImage2D() [format conversions to RGBA]", function () {
    var gl = GetCleanContext();

    var shaders = SimpleTexturedShapeShaders();
    var prog = CreateProgramWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    var vertexCount = buffs[0].vertexCount;

    var texColor = { a: 32, r: 255, g: 64, b: 125 };
    var texDesc =
    {
        width: 64,
        height: 64,
        color: texColor
    };

    var testValules =
    [
        {
            'format': gl.RGBA,
            'expectedColor': texColor,
            'desc': "[RGBA]"
        },
        {
            'format': gl.RGB,
            'expectedColor': { a: 255, r: texColor.r, g: texColor.g, b: texColor.b },
            'desc': "[RGB]"
        },
        {
            'format': gl.ALPHA,
            'expectedColor': { a: texColor.a, r: 0, g: 0, b: 0 },
            'desc': "[ALPHA]"
        },
        {
            'format': gl.LUMINANCE,
            'expectedColor': { a: 255, r: texColor.r, g: texColor.r, b: texColor.r },
            'desc': "[LUMINANCE]"
        },
        {
            'format': gl.LUMINANCE_ALPHA,
            'expectedColor': { a: texColor.a, r: texColor.r, g: texColor.r, b: texColor.r },
            'desc': "[LUMINANCE_ALPHA]"
        }
    ];

    for (var i = 0; i < testValules.length; ++i) {
        gl.activeTexture(gl.TEXTURE0);
        var tex = CreateTexture2D(gl, testValules[i].format, texDesc.width, texDesc.height);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        FillTexture(gl, tex, gl.TEXTURE_2D, testValules[i].format, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texDesc.color);

        var loc = gl.getUniformLocation(prog, "uSampler");
        gl.uniform1i(loc, 0);

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
        equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors " + testValules[i].desc);

        var resultBuf = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
        equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
        equal(resultBuf[0], testValules[i].expectedColor.r, "Check r-value " + testValules[i].desc);
        equal(resultBuf[1], testValules[i].expectedColor.g, "Check g-value " + testValules[i].desc);
        equal(resultBuf[2], testValules[i].expectedColor.b, "Check b-value " + testValules[i].desc);
        equal(resultBuf[3], testValules[i].expectedColor.a, "Check a-value " + testValules[i].desc);

        gl.deleteTexture(tex);
    }

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);
    ClearContext(gl);
});

test("verify binding different type of texture to the same sampler unit in different programs causes error", function () {
    var gl = GetCleanContext();
    var vShader = 
            "attribute vec3 aPos;" +
            "void main()" +
            "{" +
            "  gl_Position = vec4(aPos, 1.0);" +
            "}";
    var fShader = 
            "precision mediump float;" +
            "uniform sampler2D uSampler2D;" +
            "uniform samplerCube uSamplerCube;" +
            "void main()" +
            "{" +
            "  gl_FragColor = texture2D(uSampler2D, vec2(0.5, 0.5)) + textureCube(uSamplerCube, vec3(0.5, 0.5, 0));" +
            "}";

    var prog = CreateProgramWithShadersSrc(gl, vShader, fShader);
    if (!prog)
        return;

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    var vertexCount = buffs[0].vertexCount;

    var tex2DColor = { r: 255, g: 0, b: 255, a: 120 };
    var texCubeColor = { r: 0, g: 80, b: 255, a: 255 };
    var texDesc =
    {
        width: 64,
        height: 64
    };

    gl.activeTexture(gl.TEXTURE1);

    var tex2D = CreateTexture2D(gl, gl.RGBA, texDesc.width, texDesc.height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    FillTexture(gl, tex2D, gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, tex2DColor);
    var loc = gl.getUniformLocation(prog, "uSampler2D");
    gl.uniform1i(loc, 1);

    var texCube = CreateTextureCube(gl, gl.RGBA, texDesc.width, texDesc.height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    var loc = gl.getUniformLocation(prog, "uSamplerCube");
    gl.uniform1i(loc, 1);

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() generates no errors");

    var resultBuf = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
    equal(resultBuf[0], 255, "Check r-value ");
    equal(resultBuf[1], 255, "Check g-value ");
    equal(resultBuf[2], 255, "Check b-value ");
    equal(resultBuf[3], 255, "Check a-value ");

    gl.deleteTexture(texCube);
    gl.deleteTexture(tex2D);

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);
    ClearContext(gl);
});

test("verify binding different type of texture to the same sampler unit in different programs does not cause error", function () {
    var gl = GetCleanContext();
    var vShader = 
            "attribute vec3 aPos;" +
            "uniform float uOffset;" +
            "void main()" +
            "{" +
            "  gl_Position = vec4(aPos.x + uOffset, aPos.y, aPos.z, 1.0);" +
            "}";
    var fShader2D = 
            "precision mediump float;" +
            "uniform sampler2D uSampler2D;" +
            "void main()" +
            "{" +
            "  gl_FragColor = texture2D(uSampler2D, vec2(0.5, 0.5));" +
            "}";

    var fShaderCube = 
            "precision mediump float;" +
            "uniform samplerCube uSamplerCube;" +
            "void main()" +
            "{" +
            "  gl_FragColor = textureCube(uSamplerCube, vec3(0.5, 0.5, 0));" +
            "}";

    var prog2D = CreateProgramWithShadersSrc(gl, vShader, fShader2D);
    var progCube = CreateProgramWithShadersSrc(gl, vShader, fShaderCube);
    if (!prog2D || !progCube)
        return;

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog2D));
    var vertexCount = buffs[0].vertexCount;

    var tex2DColor = { r: 225, g: 120, b: 190,  a: 62 };
    var texCubeColor = { r: 62, g: 0, b: 120,  a: 250 };
    var texDesc =
    {
        width: 64,
        height: 64
    };

    gl.activeTexture(gl.TEXTURE1);

    var tex2D = CreateTexture2D(gl, gl.RGBA, texDesc.width, texDesc.height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    FillTexture(gl, tex2D, gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, tex2DColor);
    var loc2d = gl.getUniformLocation(prog2D, "uSampler2D");
    var loc2dOffset = gl.getUniformLocation(prog2D, "uOffset");

    var texCube = CreateTextureCube(gl, gl.RGBA, texDesc.width, texDesc.height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    FillTexture(gl, texCube, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, gl.RGBA, gl.UNSIGNED_BYTE, texDesc.width, texDesc.height, texCubeColor);
    var locCube = gl.getUniformLocation(progCube, "uSamplerCube");
    var locCubeOffset = gl.getUniformLocation(progCube, "uOffset");

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(prog2D);
    gl.uniform1f(loc2dOffset, 0);
    gl.uniform1i(loc2d, 1);
    equal(gl.getError(), gl.NO_ERROR, "useProgram() generates no errors [2d]");
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors [2d]");

    gl.useProgram(progCube);
    gl.uniform1f(locCubeOffset, 1);
    gl.uniform1i(locCube, 1);
    equal(gl.getError(), gl.NO_ERROR, "useProgram() generates no errors [cube]");
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors [cube]");

    var resultBuf = CreateDataBuffer(gl, gl.RGBA, gl.UNSIGNED_BYTE, gl.canvas.width, gl.canvas.height);
    gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
    ok(CheckPixelsInArea(resultBuf, 
                        gl.canvas.width, 
                        gl.canvas.height,
                        {x: 0, y: 0, width: gl.canvas.width / 2, height: gl.canvas.height},
                        tex2DColor, 
                        texCubeColor),
       "Check pixels");

    gl.deleteTexture(texCube);
    gl.deleteTexture(tex2D);

    DeleteBuffers(gl, prog2D, buffs);
    CleanProgram(gl, prog2D);
    CleanProgram(gl, progCube);
    ClearContext(gl);
});

test("verify bindAttribLocation() [attribute not defined in shade]", function () {
    var gl = GetCleanContext();

    var shaders = FilledShapeShaders({ a: 1, r: 1, g: 1, b: 1 });
    var prog = CreateProgramNoLinkingWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var buffDesc = {
        'attrName': 'undefined',
        'dataLength': 18,
        'size': 3,
        'dataType': gl.FLOAT,
        'normalize': false
    };
    var vertexCount = buffDesc.dataLength / buffDesc.size;

    var undefinedBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, undefinedBuff);
    equal(gl.getError(), gl.NO_ERROR, "bindBuffer() generates no errors");
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffDesc.dataLength), gl.STATIC_DRAW);
    equal(gl.getError(), gl.NO_ERROR, "bufferData() generates no errors");

    var attrLoc = 1;
    gl.bindAttribLocation(prog, attrLoc, buffDesc.attrName);
    equal(gl.getError(), gl.NO_ERROR, "bindAttribLocation() generates no errors with attribute name not defined in shader");
    gl.vertexAttribPointer(attrLoc, buffDesc.size, buffDesc.dataType, buffDesc.normalize, 0, 0);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttribPointer() generates no errors");
    gl.enableVertexAttribArray(attrLoc);
    equal(gl.getError(), gl.NO_ERROR, "enableVertexAttribArray() generates no errors");

    LinkProgram(gl, prog);

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    buffs.push({ 'buff': undefinedBuff, 'attrLocation': attrLoc });

    gl.clearColor(0, 0, 0, 0);
    equal(gl.getError(), gl.NO_ERROR, "clearColor() generates no errors");
    gl.clear(gl.COLOR_BUFFER_BIT);
    equal(gl.getError(), gl.NO_ERROR, "clear() generates no errors");
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors if a vertex attribute is enabled as an array, a buffer is bound to that attribute, but the attribute is not consumed by the current program");

    var resultBuf = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
    equal(resultBuf[0], 255, "Check r-value");
    equal(resultBuf[1], 255, "Check g-value");
    equal(resultBuf[2], 255, "Check b-value");
    equal(resultBuf[3], 255, "Check a-value");

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);
    ClearContext(gl);
});

test("verify bindAttribLocation() [valid attribute]", function () {
    var gl = GetCleanContext();

    var shaders = ColoredShapeShaders();
    var prog = CreateProgramNoLinkingWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var colorBuffDesc = {
        attrName: 'aColor',
        data: new Float32Array(
        [0.5, 0.5, 0.5, 0.5,
         0.5, 0.5, 0.5, 0.5,
         0.5, 0.5, 0.5, 0.5,
         0.5, 0.5, 0.5, 0.5,
         0.5, 0.5, 0.5, 0.5,
         0.5, 0.5, 0.5, 0.5]),
        size: 4,
        dataType: gl.FLOAT,
        normalize: false
    };

    var colorBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
    equal(gl.getError(), gl.NO_ERROR, "bindBuffer() generates no errors");
    gl.bufferData(gl.ARRAY_BUFFER, colorBuffDesc.data, gl.STATIC_DRAW);
    equal(gl.getError(), gl.NO_ERROR, "bufferData() generates no errors");

    var attrLoc = 2;
    gl.bindAttribLocation(prog, attrLoc, colorBuffDesc.attrName);
    equal(gl.getError(), gl.NO_ERROR, "bindAttribLocation() generates no errors");
    gl.vertexAttribPointer(attrLoc, colorBuffDesc.size, colorBuffDesc.dataType, colorBuffDesc.normalize, 0, 0);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttribPointer() generates no errors");
    gl.enableVertexAttribArray(attrLoc);
    equal(gl.getError(), gl.NO_ERROR, "enableVertexAttribArray() generates no errors");

    LinkProgram(gl, prog);

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    buffs.push({'buff': colorBuff, 'attrLocation': attrLoc });
    var vertexCount = buffs[0].vertexCount;

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors");

    var resultBuf = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
    equal(resultBuf[0], 127, "Check r-value");
    equal(resultBuf[1], 127, "Check g-value");
    equal(resultBuf[2], 127, "Check b-value");
    equal(resultBuf[3], 127, "Check a-value");

    DeleteBuffers(gl, prog, buffs);

    CleanProgram(gl, prog);
    ClearContext(gl);
});

test("verify texImage2D() [normalize]", function () {
    var gl = GetCleanContext();

    var shaders = ColoredShapeShaders();
    var buffDescs = [ QuadPosDesc(gl) ];

    var testValues =
    [
        {
            buff: {
                attrName: 'aColor',
                data: new Uint8Array(
                    [127, 127, 127, 127,
                    127, 127, 127, 127,
                    127, 127, 127, 127,
                    127, 127, 127, 127,
                    127, 127, 127, 127,
                    127, 127, 127, 127]),
                size: 4,
                dataType: gl.UNSIGNED_BYTE,
                normalize: true
            },
            expectedColor: { a: 127, r: 127, g: 127, b: 127 },
            desc: "[Uint8Array && normalize=true]"
        },
        {
            buff: {
                attrName: 'aColor',
                data: new Uint8Array(
                        [127, 127, 127, 127,
                        127, 127, 127, 127,
                        127, 127, 127, 127,
                        127, 127, 127, 127,
                        127, 127, 127, 127,
                        127, 127, 127, 127]),
                size: 4,
                dataType: gl.UNSIGNED_BYTE,
                normalize: false
            },
            expectedColor: { a: 255, r: 255, g: 255, b: 255 },
            desc: "[Uint8Array && normalize=false]"
        },
        {
            buff: {
                attrName: 'aColor',
                data: new Uint16Array(
                    [32767, 32767, 32767, 32767,
                    32767, 32767, 32767, 32767,
                    32767, 32767, 32767, 32767,
                    32767, 32767, 32767, 32767,
                    32767, 32767, 32767, 32767,
                    32767, 32767, 32767, 32767]),
                size: 4,
                dataType: gl.UNSIGNED_SHORT,
                normalize: true
            },
            expectedColor: { a: 127, r: 127, g: 127, b: 127 },
            desc: "[Uint16Array && normalize=true]"
        },
        {
            buff: {
                attrName: 'aColor',
                data: new Uint16Array(
                    [32767, 32767, 32767, 32767,
                    32767, 32767, 32767, 32767,
                    32767, 32767, 32767, 32767,
                    32767, 32767, 32767, 32767,
                    32767, 32767, 32767, 32767,
                    32767, 32767, 32767, 32767]),
                size: 4,
                dataType: gl.UNSIGNED_SHORT,
                normalize: false
            },
            expectedColor: { a: 255, r: 255, g: 255, b: 255 },
            desc: "[Uint16Array && normalize=false]"
        }
    ];

    for (var i = 0; i < testValues.length; ++i) {
        gl.clearColor(1, 1, 1, 1);
        DoDrawTest(gl, shaders.vShader, shaders.fShader, buffDescs.concat(testValues[i].buff), 
            testValues[i].expectedColor, testValues[i].desc);
    }

    ClearContext(gl);
});


test("verify bufferData() [data is always copied]", function () {
    var gl = GetCleanContext();

    var shaders = FilledShapeShaders({ r: 1, g: 1, b: 1, a: 1 });
    var prog = CreateProgramWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var posBuff = {
        'attrName': "aPos",
        'data': new Float32Array([
            -1, -1, 0,
            1, -1, 0,
            1, 1, 0,
            -1, 1, 0]),
        'size': 3,
        'dataType': gl.FLOAT,
        'normalize': false
    };
    var buffs = [];
    buffs.push(CreateBuffer(gl, prog, posBuff));

    var indexBuff = new Uint8Array([0, 1, 200, 0, 2, 3]);
    var indicesCount = indexBuff.length;

    var ebuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebuff);
    equal(gl.getError(), gl.NO_ERROR, "bindBuffer(ELEMENT_ARRAY_BUFFER) generates no errors");
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuff, gl.STATIC_DRAW);
    equal(gl.getError(), gl.NO_ERROR, "bufferData(ELEMENT_ARRAY_BUFFER) generates no error with invalid indices");

    gl.drawElements(gl.TRIANGLES, indicesCount, gl.UNSIGNED_BYTE, 0);
    notEqual(gl.getError(), gl.NO_ERROR, "drawElements() generates error with invalid indices");

    indexBuff[2] = 2;

    gl.drawElements(gl.TRIANGLES, indicesCount, gl.UNSIGNED_BYTE, 0);
    notEqual(gl.getError(), gl.NO_ERROR, "drawElements() generates error with invalid indices [no copy without call bufferData()]");

    gl.deleteBuffer(ebuff);
    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);
    ClearContext(gl);
});

test("verify uninitialized texure [should be cleared to 0]", function () {
    var gl = GetCleanContext();

    var texWidth = 64, texHeight = 64;
    var tex = CreateTexture2D(gl, gl.RGBA, texWidth, texHeight);

    ok(CheckPixelsInTexture( gl,
                    tex,
                    texWidth,
                    texHeight,
                    { x: 0, y: 0, width: texWidth, height: texHeight },
                    { r: 0, g: 0, b: 0, a: 0 }),
       "Check pixels in unitiilazed texture");

    gl.deleteTexture(tex);

    ClearContext(gl);
});

test("verify copyTexImage2D() from internal fbo to uninitialized texure", function () {
    var gl = GetCleanContext();

    var texWidth = 64, texHeight = 64;
    var tex = CreateTexture2D(gl, gl.RGBA, texWidth, texHeight);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, texWidth, texHeight, 0);
    equal(gl.getError(), gl.NO_ERROR, "copyTexImage2D() generates no erros with uninitialized texture");
    ok(CheckPixelsInTexture(gl,
                    tex,
                    texWidth,
                    texHeight,
                    { x: 0, y: 0, width: texWidth, height: texHeight },
                    { r: 0, g: 255, b: 0, a: 255 }),
        "Check pixels in unitiilazed texture after call copyTexImage2D() from internal fbo");

    gl.deleteTexture(tex);

    ClearContext(gl);
});

test("verify copyTexImage2D() from custom fbo to uninitialized texure", function () {
    var gl = GetCleanContext();

    var texWidth = 64, texHeight = 64;
    var fboWidth = 16, fboHeight = 16;

    var tex = CreateTexture2D(gl, gl.RGBA, texWidth, texHeight);

    var rbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, fboWidth, fboHeight);
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbo);
    equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
    
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, texWidth, texHeight, 0);
    equal(gl.getError(), gl.NO_ERROR, "copyTexImage2D() generates no erros with uninitialized texture");
    ok(CheckPixelsInTexture(gl,
                    tex,
                    texWidth,
                    texHeight,
                    { x: 0, y: 0, width: fboWidth, height: fboHeight },
                    { r: 255, g: 0, b: 0, a: 255 }),
        "Check pixels in unitiilazed texture after call copyTexImage2D()");
  
    gl.deleteRenderbuffer(rbo);
    gl.deleteFramebuffer(fbo);

    gl.deleteTexture(tex);

    ClearContext(gl);
});

test("verify copyTexImage2D() from custom fbo to uninitialized texure [negative x and y]", function () {
    var gl = GetCleanContext();

    var texWidth = 64, texHeight = 64;
    var fboWidth = 16, fboHeight = 16;
    var offsetX = -8, offsetY = -8;

    var tex = CreateTexture2D(gl, gl.RGBA, texWidth, texHeight);

    var rbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, fboWidth, fboHeight);
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbo);
    equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);

    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, offsetX, offsetY, texWidth, texHeight, 0);
    equal(gl.getError(), gl.NO_ERROR, "copyTexImage2D() generates no erros with uninitialized texture and negative x and y");
    ok(CheckPixelsInTexture(gl,
                    tex,
                    texWidth,
                    texHeight,
                    { x: -offsetX, y: -offsetY, width: fboWidth, height: fboHeight },
                    { r: 255, g: 0, b: 0, a: 255 }),
        "Check pixels in unitiilazed texture after call copyTexImage2D() with negative x and y");
  
    gl.deleteRenderbuffer(rbo);
    gl.deleteFramebuffer(fbo);

    gl.deleteTexture(tex);

    ClearContext(gl);
});

test("verify uninitialized vertex array buffer [should be cleared to 0]", function () {
    var gl = GetCleanContext();

    var shaders = ColoredShapeShaders();
    var prog = CreateProgramWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var uninitBuffDesc = {
        'attrName': "aColor",
        'dataLength': 24,
        'size': 4,
        'dataType': gl.FLOAT,
        'normalize': false
    };
       
    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    buffs.push(CreateBuffer(gl, prog, uninitBuffDesc));
    var vertexCount = buffs[0].vertexCount;

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors");

    var resultBuf = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
    equal(resultBuf[0], 0, "Check r-value");
    equal(resultBuf[1], 0, "Check g-value");
    equal(resultBuf[2], 0, "Check b-value");
    equal(resultBuf[3], 0, "Check a-value");

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);
    ClearContext(gl);
});

test("verify uninitialized vertex element buffer [should be cleared to 0]", function () {
    var gl = GetCleanContext();

    var shaders = FilledShapeShaders({ r: 1, g: 1, b: 1, a: 1 });
    var prog = CreateProgramWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var indexCount = 6;

    var posBuff = {
        'attrName': 'aPos',
        'data': new Float32Array([
            -1, -1, 0,
            1, -1, 0,
            1, 1, 0,
            -1, 1, 0]),
        'size': 3,
        'dataType': gl.FLOAT,
        'normalize': false
    };

    var buffs = [];
    buffs.push(CreateBuffer(gl, prog, posBuff));
    buffs.push(CreateElementBuffer(gl, { 'dataLength': indexCount, 'dataType': gl.UNSIGNED_BYTE }));

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.NO_ERROR, "drawElements() generates no errors");

    var resultBuf = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
    equal(resultBuf[0], 0, "Check r-value");
    equal(resultBuf[1], 0, "Check g-value");
    equal(resultBuf[2], 0, "Check b-value");
    equal(resultBuf[3], 0, "Check a-value");

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);
    ClearContext(gl);
});

test("verify uninitialized framebuffer [should be cleared to 0]", function () {
    var canvasWidth = 1, canvasHeight = 1;
    CreateExlusiveContext({});
    var gl = GetExlusiveParamContext();
    gl.viewport(0, 0, canvasWidth, canvasHeight);

    var resultBuf = new Uint8Array(4);
    gl.readPixels(0, 0, canvasWidth, canvasHeight, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors [initial fbo]");
    equal(resultBuf[0], 0, "Check r-value [initial fbo]");
    equal(resultBuf[1], 0, "Check g-value [initial fbo]");
    equal(resultBuf[2], 0, "Check b-value [initial fbo]");
    equal(resultBuf[3], 0, "Check a-value [initial fbo]");

    var rbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
    equal(gl.getError(), gl.NO_ERROR, "bindRenderbuffer() generates no errors [custom fbo]");
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, 1, 1);
    equal(gl.getError(), gl.NO_ERROR, "renderbufferStorage() generates no errors [custom fbo]");
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    equal(gl.getError(), gl.NO_ERROR, "bindFramebuffer() generates no errors [custom fbo]");
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbo);
    equal(gl.getError(), gl.NO_ERROR, "framebufferRenderbuffer() generates no errors [custom fbo]");
    equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() == FRAMEBUFFER_COMPLETE [custom fbo]");

    var resultBuf = CreateDataBuffer(gl, gl.RGBA, gl.UNSIGNED_BYTE, canvasWidth, canvasHeight);
    gl.readPixels(0, 0, canvasWidth, canvasHeight, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
    equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors [custom fbo]");
    equal(resultBuf[0], 0, "Check r-value [custom fbo]");
    equal(resultBuf[1], 0, "Check g-value [custom fbo]");
    equal(resultBuf[2], 0, "Check b-value [custom fbo]");
    equal(resultBuf[3], 0, "Check a-value [custom fbo]");

    RemoveExlusiveContext();
});


test("verify uninitialized depth buffer [should be cleared to 1]", function () {

    var vShader =
        "precision mediump float;" +
        "attribute vec3 aPos;" +
        "void main()" +
        "{" +
        "  gl_Position = vec4(aPos.x, aPos.y, 1.0, 1.0);" +

        "}";

    var fShader =
        "precision mediump float;" +
        "void main()" +
        "{" +
        "  gl_FragColor = vec4(1,0,1,1);" +
        "}";

    var width = 4, height = 4;

    CreateExlusiveContext({ depth: true });
    var gl = GetExlusiveParamContext();
    gl.viewport(0, 0, width, height);
    var attrs = gl.getContextAttributes();
    equal(attrs.depth, true, "getContextAttributes().depth == true");

    var prog = CreateProgramWithShadersSrc(gl, vShader, fShader);
    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    var vertexCount = buffs[0].vertexCount;

    gl.depthFunc(gl.EQUAL);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors");
    ok(CheckCanvasPixels(gl, { r: 255, g: 0, b: 255, a: 255 }), "uninitialized depth buffer cleared to 1");

    gl.disable(gl.DEPTH_TEST);

    DeleteBuffers(gl, prog, buffs);
    CleanProgram(gl, prog);

    RemoveExlusiveContext();
});

test("verify blending", function () {
    var gl = GetCleanContext();

    var dstColor = { r: 1, g: 1, b: 1, a: 1 };
    var scrColor = { r: 0.25, g: 0.5, b: 1, a: 0.75 };
    var blendColor = { r: 0.5, g: 0.5, b: 0.5, a: 0.5 };

    var shaders = FilledShapeShaders(scrColor);
    var prog = CreateProgramWithShadersSrc(gl, shaders.vShader, shaders.fShader);
    if (!prog)
        return;

    var buffs = [];
    buffs.push(CreateQuadPosBuffer(gl, prog));
    var vertexCount = buffs[0].vertexCount;
    
    var equalModes =
    [
        { 'name': "FUNC_ADD", 'value': gl.FUNC_ADD },
        { 'name': "FUNC_SUBTRACT", 'value': gl.FUNC_SUBTRACT },
        { 'name': "FUNC_REVERSE_SUBTRACT", 'value': gl.FUNC_REVERSE_SUBTRACT }
    ];

    var srcFactorParams =
    [
        { 'name': "ZERO", 'value': gl.ZERO },
        { 'name': "ONE", 'value': gl.ONE },
        { 'name': "SRC_COLOR", 'value': gl.SRC_COLOR },
        { 'name': "ONE_MINUS_SRC_COLOR", 'value': gl.ONE_MINUS_SRC_COLOR },
        { 'name': "DST_COLOR", 'value': gl.DST_COLOR },
        { 'name': "ONE_MINUS_DST_COLOR", 'value': gl.ONE_MINUS_DST_COLOR },
        { 'name': "SRC_ALPHA", 'value': gl.SRC_ALPHA },
        { 'name': "ONE_MINUS_SRC_ALPHA", 'value': gl.ONE_MINUS_SRC_ALPHA },
        { 'name': "DST_ALPHA", 'value': gl.DST_ALPHA },
        { 'name': "ONE_MINUS_DST_ALPHA", 'value': gl.ONE_MINUS_DST_ALPHA },
        { 'name': "CONSTANT_COLOR", 'value': gl.CONSTANT_COLOR },
        { 'name': "ONE_MINUS_CONSTANT_COLOR", 'value': gl.ONE_MINUS_CONSTANT_COLOR },
        { 'name': "CONSTANT_ALPHA", 'value': gl.CONSTANT_ALPHA },
        { 'name': "ONE_MINUS_CONSTANT_ALPHA", 'value': gl.ONE_MINUS_CONSTANT_ALPHA },
        { 'name': "SRC_ALPHA_SATURATE", 'value': gl.SRC_ALPHA_SATURATE }
    ];

    var dstFactorParams =
    [
        { 'name': "ZERO", 'value': gl.ZERO },
        { 'name': "ONE", 'value': gl.ONE },
        { 'name': "SRC_COLOR", 'value': gl.SRC_COLOR },
        { 'name': "ONE_MINUS_SRC_COLOR", 'value': gl.ONE_MINUS_SRC_COLOR },
        { 'name': "DST_COLOR", 'value': gl.DST_COLOR },
        { 'name': "ONE_MINUS_DST_COLOR", 'value': gl.ONE_MINUS_DST_COLOR },
        { 'name': "SRC_ALPHA", 'value': gl.SRC_ALPHA },
        { 'name': "ONE_MINUS_SRC_ALPHA", 'value': gl.ONE_MINUS_SRC_ALPHA },
        { 'name': "DST_ALPHA", 'value': gl.DST_ALPHA },
        { 'name': "ONE_MINUS_DST_ALPHA", 'value': gl.ONE_MINUS_DST_ALPHA },
        { 'name': "CONSTANT_COLOR", 'value': gl.CONSTANT_COLOR },
        { 'name': "ONE_MINUS_CONSTANT_COLOR", 'value': gl.ONE_MINUS_CONSTANT_COLOR },
        { 'name': "CONSTANT_ALPHA", 'value': gl.CONSTANT_ALPHA },
        { 'name': "ONE_MINUS_CONSTANT_ALPHA", 'value': gl.ONE_MINUS_CONSTANT_ALPHA }
    ];

    function isEquals(val, refVal) {
        return (refVal >= val - 1) && (refVal <= val + 1);
    }

    gl.enable(gl.BLEND);
    equal(gl.getError(), gl.NO_ERROR, "enable(gl.BLEND generates no errors");
    gl.blendColor(blendColor.r, blendColor.g, blendColor.b, blendColor.a);
    equal(gl.getError(), gl.NO_ERROR, "blendColor(" + blendColor.r + "," + blendColor.g +  "," + blendColor.b + "," + blendColor.a +") generates no errors");

    for (var m = 0, ml = equalModes.length; m < ml; m++) {
        gl.blendEquation(equalModes[m].value);
        equal(gl.getError(), gl.NO_ERROR, "blendEquation([" + equalModes[m].name + "]) generates no errors");

        for (var i = 0, sl = srcFactorParams.length; i < sl; i++) {
            for (var j = 0, dl = dstFactorParams.length; j < dl; j++) {
                if (IsInvalidBlendFuncParameters(gl, srcFactorParams[i].value, dstFactorParams[j].value))
                    continue;

                gl.blendFunc(srcFactorParams[i].value, dstFactorParams[j].value);
                equal(gl.getError(), gl.NO_ERROR, "blendFunc([" + srcFactorParams[i].name + "," + dstFactorParams[j].name + "]) generates no errors");

                gl.clearColor(dstColor.r, dstColor.g, dstColor.b, dstColor.a);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
                equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors");

                var expectedColor = CalcBlendColor(gl, scrColor, dstColor, equalModes[m].value,
                    srcFactorParams[i].value, dstFactorParams[j].value, blendColor);

                var resultBuf = new Uint8Array(4);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, resultBuf);
                equal(gl.getError(), gl.NO_ERROR, "readPixels() generates no errors");
                ok(isEquals(ConvertToRGB(expectedColor.r), resultBuf[0]), "Check r-value [" + equalModes[m].name + "][" + srcFactorParams[i].name + "," + dstFactorParams[j].name + "]");
                ok(isEquals(ConvertToRGB(expectedColor.g), resultBuf[1]), "Check g-value [" + equalModes[m].name + "][" + srcFactorParams[i].name + "," + dstFactorParams[j].name + "]");
                ok(isEquals(ConvertToRGB(expectedColor.b), resultBuf[2]), "Check b-value [" + equalModes[m].name + "][" + srcFactorParams[i].name + "," + dstFactorParams[j].name + "]");
                ok(isEquals(ConvertToRGB(expectedColor.a), resultBuf[3]), "Check a-value [" + equalModes[m].name + "][" + srcFactorParams[i].name + "," + dstFactorParams[j].name + "]");
            }
        }
    }
    gl.disable(gl.BLEND);

    DeleteBuffers(gl, prog, buffs);

    CleanProgram(gl, prog);
    ClearContext(gl);
});
