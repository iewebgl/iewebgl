
function CheckParamType(gl, paramType, paramValue, paramName) {
    var isOk = false;
    switch (paramType) {
        case gl.ACTIVE_TEXTURE:
        case gl.BLEND_DST_ALPHA:
        case gl.BLEND_DST_RGB:
        case gl.BLEND_EQUATION_ALPHA:
        case gl.BLEND_EQUATION_RGB:
        case gl.BLEND_SRC_ALPHA:
        case gl.BLEND_SRC_RGB:
        case gl.CULL_FACE_MODE:
        case gl.DEPTH_FUNC:
        case gl.FRONT_FACE:
        case gl.GENERATE_MIPMAP_HINT:
        case gl.STENCIL_BACK_FAIL:
        case gl.STENCIL_BACK_FUNC:
        case gl.STENCIL_BACK_PASS_DEPTH_FAIL:
        case gl.STENCIL_BACK_PASS_DEPTH_PASS:
        case gl.STENCIL_BACK_VALUE_MASK:
        case gl.STENCIL_BACK_WRITEMASK:
        case gl.STENCIL_FAIL:
        case gl.STENCIL_FUNC:
        case gl.STENCIL_PASS_DEPTH_FAIL:
        case gl.STENCIL_PASS_DEPTH_PASS:
        case gl.STENCIL_VALUE_MASK:
        case gl.STENCIL_WRITEMASK:
        case gl.UNPACK_COLORSPACE_CONVERSION_WEBGL:
            {
                //unsigned long
                isOk = isTypeOf("Number", paramValue);
            } break;

        case gl.ALPHA_BITS:
        case gl.BLUE_BITS:
        case gl.DEPTH_BITS:
        case gl.GREEN_BITS:
        case gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS:
        case gl.MAX_CUBE_MAP_TEXTURE_SIZE:
        case gl.MAX_FRAGMENT_UNIFORM_VECTORS:
        case gl.MAX_RENDERBUFFER_SIZE:
        case gl.MAX_TEXTURE_IMAGE_UNITS:
        case gl.MAX_TEXTURE_SIZE:
        case gl.MAX_VARYING_VECTORS:
        case gl.MAX_VERTEX_ATTRIBS:
        case gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS:
        case gl.MAX_VERTEX_UNIFORM_VECTORS:
        case gl.PACK_ALIGNMENT:
        case gl.RED_BITS:
        case gl.SAMPLE_BUFFERS:
        case gl.SAMPLES:
        case gl.STENCIL_BACK_REF:
        case gl.STENCIL_BITS:
        case gl.STENCIL_CLEAR_VALUE:
        case gl.STENCIL_REF:
        case gl.SUBPIXEL_BITS:
            {
                //long
                isOk = isTypeOf("Number", paramValue);
            } break;
        case gl.DEPTH_CLEAR_VALUE:
        case gl.LINE_WIDTH:
        case gl.POLYGON_OFFSET_FACTOR:
        case gl.POLYGON_OFFSET_UNITS:
        case gl.SAMPLE_COVERAGE_VALUE:
            {
                //float
                isOk = isTypeOf("Number", paramValue);
            } break;
        case gl.UNPACK_ALIGNMENT:
            {
                //int
                isOk = isTypeOf("Number", paramValue);
            } break;
        case gl.BLEND:
        case gl.CULL_FACE:
        case gl.DEPTH_TEST:
        case gl.DEPTH_WRITEMASK:
        case gl.DITHER:
        case gl.POLYGON_OFFSET_FILL:
        case gl.SAMPLE_COVERAGE_INVERT:
        case gl.SCISSOR_TEST:
        case gl.STENCIL_TEST:
        case gl.UNPACK_FLIP_Y_WEBGL:
        case gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL:
            {
                //boolean
                isOk = isTypeOf("Boolean", paramValue);
            } break;
        case gl.COLOR_WRITEMASK:
            {
                //boolean[] (with 4 values)
                isOk = (isTypeOf("Array", paramValue) && (paramValue.length == 4) && isTypeOf("Boolean", paramValue[0]));
            } break;

        case gl.RENDERER:
        case gl.VENDOR:
        case gl.SHADING_LANGUAGE_VERSION:
        case gl.VERSION:
            {
                //DOMString
                isOk = isTypeOf("String", paramValue);
            } break;
        case gl.MAX_VIEWPORT_DIMS:
            {
                //Int32Array (with 2 elements)
                isOk = ((paramValue instanceof Int32Array) && (paramValue.length == 2) && isTypeOf("Number", paramValue[0]));
            } break;
        case gl.SCISSOR_BOX:
        case gl.VIEWPORT:
            {
                //Int32Array (with 4 elements)
                isOk = ((paramValue instanceof Int32Array) && (paramValue.length == 4) && isTypeOf("Number", paramValue[0]));
            } break;
        case gl.ALIASED_LINE_WIDTH_RANGE:
        case gl.ALIASED_POINT_SIZE_RANGE:
        case gl.DEPTH_RANGE:
            {
                //Float32Array (with 2 elements)
                isOk = ((paramValue instanceof Float32Array) && (paramValue.length == 2) && isTypeOf("Number", paramValue[0]));
            } break;
        case gl.BLEND_COLOR:
        case gl.COLOR_CLEAR_VALUE:
            {
                //Float32Array (with 4 elements)
                isOk = ((paramValue instanceof Float32Array) && (paramValue.length == 4) && isTypeOf("Number", paramValue[0]));
            } break;
        case gl.CURRENT_PROGRAM:
            {
                //WebGLProgram
                isOk = paramValue === null || gl.isProgram(paramValue);
            } break;
        case gl.TEXTURE_BINDING_2D:
        case gl.TEXTURE_BINDING_CUBE_MAP:
            {
                //WebGLTexture
                isOk = paramValue === null || gl.isTexture(paramValue);
            } break;
        case gl.ARRAY_BUFFER_BINDING:
        case gl.ELEMENT_ARRAY_BUFFER_BINDING:
            {
                //WebGLBuffer
                isOk = paramValue === null || gl.isBuffer(paramValue);
            } break;
        case gl.RENDERBUFFER_BINDING:
            {
                //WebGLRenderbuffer
                isOk = paramValue === null || gl.isRenderbuffer(paramValue);
            } break;
        case gl.FRAMEBUFFER_BINDING:
            {
                //WebGLFramebuffer
                isOk = paramValue === null || gl.isFramebuffer(paramValue);
            } break;
        case gl.COMPRESSED_TEXTURE_FORMATS:
            {
                //not supported
                //null
                isOk = paramValue instanceof Uint32Array;
            } break;
    }

    ok(isOk, "Check type for parameter [" + paramName + "]. Expected: [" + GetParamTypeStr(gl, paramType) + "]");
}

function CheckParamInitValue(gl, param, paramName, val, refVal) {
    switch (param) {
        case gl.ACTIVE_TEXTURE:
        case gl.BLEND:
        case gl.BLEND_DST_ALPHA:
        case gl.BLEND_DST_RGB:
        case gl.BLEND_EQUATION_ALPHA:
        case gl.BLEND_EQUATION_RGB:
        case gl.BLEND_SRC_ALPHA:
        case gl.BLEND_SRC_RGB:
        case gl.CULL_FACE:
        case gl.CULL_FACE_MODE:
        case gl.DEPTH_CLEAR_VALUE:
        case gl.DEPTH_FUNC:
        case gl.DEPTH_TEST:
        case gl.DEPTH_WRITEMASK:
        case gl.DITHER:
        case gl.FRONT_FACE:
        case gl.GENERATE_MIPMAP_HINT:
        case gl.LINE_WIDTH:
        case gl.PACK_ALIGNMENT:
        case gl.POLYGON_OFFSET_FACTOR:
        case gl.POLYGON_OFFSET_FILL:
        case gl.POLYGON_OFFSET_UNITS:
        case gl.SAMPLE_ALPHA_TO_COVERAGE:
        case gl.SAMPLE_COVERAGE:
        case gl.SAMPLE_COVERAGE_INVERT:
        case gl.SAMPLE_COVERAGE_VALUE:
        case gl.SCISSOR_TEST:
        case gl.STENCIL_BACK_FAIL:
        case gl.STENCIL_BACK_FUNC:
        case gl.STENCIL_BACK_PASS_DEPTH_FAIL:
        case gl.STENCIL_BACK_PASS_DEPTH_PASS:
        case gl.STENCIL_BACK_REF:
        case gl.STENCIL_BACK_VALUE_MASK:
        case gl.STENCIL_BACK_WRITEMASK:
        case gl.STENCIL_CLEAR_VALUE:
        case gl.STENCIL_FAIL:
        case gl.STENCIL_FUNC:
        case gl.STENCIL_PASS_DEPTH_FAIL:
        case gl.STENCIL_PASS_DEPTH_PASS:
        case gl.STENCIL_REF:
        case gl.STENCIL_TEST:
        case gl.STENCIL_VALUE_MASK:
        case gl.STENCIL_WRITEMASK:
        case gl.UNPACK_ALIGNMENT:
        case gl.UNPACK_COLORSPACE_CONVERSION_WEBGL:
        case gl.UNPACK_FLIP_Y_WEBGL:
        case gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL:
            {
                strictEqual(val, refVal, "Init value returned by getParameter(" + paramName + ") must be " + refVal);
            } break;
        case gl.BLEND_COLOR:
        case gl.COLOR_CLEAR_VALUE:
        case gl.COLOR_WRITEMASK:
        case gl.DEPTH_RANGE:
        case gl.VIEWPORT:
        case gl.SCISSOR_BOX: 
            {
                ok(isArraysEqual(val, refVal), "Init value returned by getParameter(" + paramName + ") must be " + ArrayToStr(refVal) + ". Returned: " + ArrayToStr(val));
            } break;
        case gl.SHADING_LANGUAGE_VERSION:
        case gl.VERSION:
            {
                var regexp = new RegExp(refVal);
                ok(regexp.test(val), "Check form string for parameter [" + paramName + "] : " + regexp.toString() + ". Returned string: [" + val + "]");
            } break;
        case gl.RENDERER:
        case gl.VENDOR:
            {
                ok(val.length > 0, "Init string returned by getParameter(" + paramName + ") is not empty. Returned string: [" + val + "]");
            } break;
        case gl.ALIASED_LINE_WIDTH_RANGE:
        case gl.ALIASED_POINT_SIZE_RANGE:
            {
                ok(val[0] <= refVal && val[1] >= refVal, "Init value returned by getParameter(" + paramName + ") must be include " + refVal + ". Returned: " + ArrayToStr(val));
            } break;
        case gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS:
        case gl.MAX_CUBE_MAP_TEXTURE_SIZE:
        case gl.MAX_FRAGMENT_UNIFORM_VECTORS:
        case gl.MAX_RENDERBUFFER_SIZE:
        case gl.MAX_TEXTURE_IMAGE_UNITS:
        case gl.MAX_TEXTURE_SIZE:
        case gl.MAX_VARYING_VECTORS:
        case gl.MAX_VERTEX_ATTRIBS:
        case gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS:
        case gl.MAX_VERTEX_UNIFORM_VECTORS:
        case gl.SUBPIXEL_BITS:
            {
                ok(val >= refVal, "Init value returned by getParameter(" + paramName + ") must be at least " + refVal + ". Returned: " + val);
            } break;
        case gl.MAX_VIEWPORT_DIMS:
            {
                ok(val[0] >= refVal[0] && val[1] >= refVal[1], "Init value returned by getParameter(" + paramName + ") must be at least as the visible dimensions [" + refVal[0] + "," + refVal[1] + "]. Returned: " + ArrayToStr(val));
            } break;
        case gl.COMPRESSED_TEXTURE_FORMATS:
            {
                ok(val.length == 0, "Init value returned by getParameter(" + paramName + ") must be zero-length UInt32Array");
            } break;
    }
}

function GetParamTypeStr(gl, param) {
    switch (param) {
        case gl.ACTIVE_TEXTURE:
        case gl.BLEND_DST_ALPHA:
        case gl.BLEND_DST_RGB:
        case gl.BLEND_EQUATION_ALPHA:
        case gl.BLEND_EQUATION_RGB:
        case gl.BLEND_SRC_ALPHA:
        case gl.BLEND_SRC_RGB:
        case gl.CULL_FACE_MODE:
        case gl.DEPTH_FUNC:
        case gl.FRONT_FACE:
        case gl.GENERATE_MIPMAP_HINT:
        case gl.STENCIL_BACK_FAIL:
        case gl.STENCIL_BACK_FUNC:
        case gl.STENCIL_BACK_PASS_DEPTH_FAIL:
        case gl.STENCIL_BACK_PASS_DEPTH_PASS:
        case gl.STENCIL_BACK_VALUE_MASK:
        case gl.STENCIL_BACK_WRITEMASK:
        case gl.STENCIL_FAIL:
        case gl.STENCIL_FUNC:
        case gl.STENCIL_PASS_DEPTH_FAIL:
        case gl.STENCIL_PASS_DEPTH_PASS:
        case gl.STENCIL_VALUE_MASK:
        case gl.STENCIL_WRITEMASK:
        case gl.UNPACK_COLORSPACE_CONVERSION_WEBGL:
            {
                return "unsigned long";
            } break;

        case gl.ALPHA_BITS:
        case gl.BLUE_BITS:
        case gl.DEPTH_BITS:
        case gl.GREEN_BITS:
        case gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS:
        case gl.MAX_CUBE_MAP_TEXTURE_SIZE:
        case gl.MAX_FRAGMENT_UNIFORM_VECTORS:
        case gl.MAX_RENDERBUFFER_SIZE:
        case gl.MAX_TEXTURE_IMAGE_UNITS:
        case gl.MAX_TEXTURE_SIZE:
        case gl.MAX_VARYING_VECTORS:
        case gl.MAX_VERTEX_ATTRIBS:
        case gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS:
        case gl.MAX_VERTEX_UNIFORM_VECTORS:
        case gl.PACK_ALIGNMENT:
        case gl.RED_BITS:
        case gl.SAMPLE_BUFFERS:
        case gl.SAMPLES:
        case gl.STENCIL_BACK_REF:
        case gl.STENCIL_BITS:
        case gl.STENCIL_CLEAR_VALUE:
        case gl.STENCIL_REF:
        case gl.SUBPIXEL_BITS:
            {
                return "long";
            } break;
        case gl.DEPTH_CLEAR_VALUE:
        case gl.LINE_WIDTH:
        case gl.POLYGON_OFFSET_FACTOR:
        case gl.POLYGON_OFFSET_UNITS:
        case gl.SAMPLE_COVERAGE_VALUE:
            {
                return "float";
            } break;
        case gl.UNPACK_ALIGNMENT:
            {
                return "int";
            } break;
        case gl.BLEND:
        case gl.CULL_FACE:
        case gl.DEPTH_TEST:
        case gl.DEPTH_WRITEMASK:
        case gl.DITHER:
        case gl.POLYGON_OFFSET_FILL:
        case gl.SAMPLE_COVERAGE_INVERT:
        case gl.SCISSOR_TEST:
        case gl.STENCIL_TEST:
        case gl.UNPACK_FLIP_Y_WEBGL:
        case gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL:
            {
                return "boolean";
            } break;
        case gl.COLOR_WRITEMASK:
            {
                return "boolean[] (with 4 values)";
            } break;

        case gl.RENDERER:
        case gl.VENDOR:
        case gl.SHADING_LANGUAGE_VERSION:
        case gl.VERSION:
            {
                return "DOMString";
            } break;
        case gl.MAX_VIEWPORT_DIMS:
            {
                return "Int32Array (with 2 elements)";
            } break;
        case gl.SCISSOR_BOX:
        case gl.VIEWPORT:
            {
                return "Int32Array (with 4 elements)";
            } break;
        case gl.ALIASED_LINE_WIDTH_RANGE:
        case gl.ALIASED_POINT_SIZE_RANGE:
        case gl.DEPTH_RANGE:
            {
                return "Float32Array (with 2 elements)";
            } break;
        case gl.BLEND_COLOR:
        case gl.COLOR_CLEAR_VALUE:
            {
                return "Float32Array (with 4 elements)";
            } break;
        case gl.CURRENT_PROGRAM:
            {
                return "WebGLProgram or null";
            } break;
        case gl.TEXTURE_BINDING_2D:
        case gl.TEXTURE_BINDING_CUBE_MAP:
            {
                return "WebGLTexture or null";
            } break;
        case gl.ARRAY_BUFFER_BINDING:
        case gl.ELEMENT_ARRAY_BUFFER_BINDING:
            {
                return "WebGLBuffer or null";
            } break;
        case gl.RENDERBUFFER_BINDING:
            {
                return "WebGLRenderbuffer or null";
            } break;
        case gl.FRAMEBUFFER_BINDING:
            {
                return "WebGLFramebuffer or null";
            } break;
        case gl.COMPRESSED_TEXTURE_FORMATS:
            {
                return "null or 0 (not supported)";
            } break;
    }
    return "unknown";
}

function CheckParameterFunc(gl, paramFunc, paramDesc, compFunc) {
    var initVal = gl.getParameter(paramDesc.param.value);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(" + paramDesc.param.name + ")");

    for (var i = 0, l = paramDesc.acceptableParams.length; i < l; i++) {
        paramFunc.run(gl, paramDesc.acceptableParams[i].value);

        equal(gl.getError(), paramDesc.acceptableParams[i].expectedError, "getError() == " + GLErrorToStr(paramDesc.acceptableParams[i].expectedError) + " after call " + paramFunc.desc + " with parameter [" + paramDesc.acceptableParams[i].name + "]");
        if (paramDesc.acceptableParams[i].hasOwnProperty('acceptValue')) {
            var message = "getParameter(" + paramDesc.param.name + ") == ["
                + paramDesc.acceptableParams[i].acceptValue + "] after call " + paramFunc.desc + " with parameter " 
                + paramDesc.acceptableParams[i].name;
            if (paramDesc.acceptableParams[i].hasOwnProperty("desc")) {
                message = message + ". Reason: " + paramDesc.acceptableParams[i].desc;
            }

            var compResult = paramDesc.valueCompFunc(gl.getParameter(paramDesc.param.value), 
                paramDesc.acceptableParams[i].acceptValue);
            
            ok(compResult, message);
        }
    }

    paramFunc.run(gl, initVal);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call " + paramFunc.desc + " with init value");
};

function CheckStencilRefRange(gl, stencilFunc, stencilFuncDesc) {
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    var rbColor = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbColor);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, 64, 64);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbColor);

    var rbDepthStencil = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbDepthStencil);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, 64, 64);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rbDepthStencil);

    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE");

    var stencilBits = gl.getParameter(gl.STENCIL_BITS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BITS)");
    strictEqual(stencilBits, 8, "getParameter(gl.STENCIL_BITS) must return 8 for STENCIL_INDEX8");
    stencilFunc(gl, Math.pow(2, stencilBits));
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call " + stencilFuncDesc + "() with ref parameter [2 ^ stencilBits]");
    strictEqual(gl.getParameter(gl.STENCIL_BACK_REF), Math.pow(2, stencilBits) - 1, "getParameter(STENCIL_BACK_REF) == 2 ^ stencilBits - 1, ref value [2 ^ stencilBits] must be clambed [0, 2 ^ stencilBits-1]");
    strictEqual(gl.getParameter(gl.STENCIL_REF), Math.pow(2, stencilBits) - 1, "getParameter(STENCIL_REF) == 2 ^ stencilBits - 1, ref value [2 ^ stencilBits] must be clambed [0, 2 ^ stencilBits-1]");

    gl.deleteRenderbuffer(rbDepthStencil);
    gl.deleteRenderbuffer(rbColor);
    gl.deleteFramebuffer(fb);
}


module("WebGLRenderingContext");

test("WebGLRenderingContext can be created", function () {
    var gl = GetCleanContext();

    equal(gl.getError(), gl.NO_ERROR, "WebGLRenderingContext generates no error during creation");
    ok(gl !== null, "WebGLRenderingContext not equal null");
    ok(gl !== undefined, "WebGLRenderingContext not equal undefined");
    ok(gl instanceof WebGLRenderingContext, "gl context instanceof WebGLRenderingContext");

    var gl2 = GetCleanContext();
    ok(gl === gl2, "getContext() with the shall return the same object");
});

test("verify getError()", function () {
    var gl = GetCleanContext();
    equal(gl.getError(), gl.NO_ERROR, "getError() == gl.NO_ERROR");
});

test("verify WebGLContextAttributes", function() {
    CreateExlusiveContext();
    var gl = GetExlusiveContext();

    var ctxAttributes =
    [
        { 'name': "alpha", 'initVal': true },
        { 'name': "depth", 'initVal': true },
        { 'name': "stencil", 'initVal': false },
        { 'name': "antialias", 'initVal': true },
        { 'name': "premultipliedAlpha", 'initVal': true },
        { 'name': "preserveDrawingBuffer", 'initVal': false }
    ];

    var ctxAttrs = gl.getContextAttributes();
    equal(gl.getError(), gl.NO_ERROR, "getError() == gl.NO_ERROR after call getContextAttributes()");
    ok(ctxAttrs instanceof WebGLContextAttributes, "getContextAttributes() returned value instanceof WebGLContextAttributes");

    for (var i = 0, l = ctxAttributes.length; i < l; i++) {
        strictEqual(ctxAttrs[ctxAttributes[i].name], ctxAttributes[i].initVal, "Check default value for attribute [" + ctxAttributes[i].name + "]");
    }

    gl = GetExlusiveParamContext({ antialias: false, stencil: true });

    var ctxAttrs = gl.getContextAttributes();
    equal(gl.getError(), gl.NO_ERROR, "getError() == gl.NO_ERROR after call getContextAttributes() recall getContext()");
    for (var i = 0, l = ctxAttributes.length; i < l; i++) {
        strictEqual(ctxAttrs[ctxAttributes[i].name], ctxAttributes[i].initVal, "Attribute [" + ctxAttributes[i].name + "] must not be changed after recall getContext() without reset");
    }

    RemoveExlusiveContext();
    CreateExlusiveContext({ antialias: false, stencil: true });
    gl = GetExlusiveParamContext({ antialias: false, stencil: true });

    var ctxAttrs = gl.getContextAttributes();
    equal(gl.getError(), gl.NO_ERROR, "getError() == gl.NO_ERROR after call getContextAttributes() recall getContext()");

    strictEqual(ctxAttrs['antialias'], false, "Attribute [antialias] must be changed with getContext({antialias: false, stencil: true}) after reset");
    strictEqual(ctxAttrs['stencil'], true, "Attribute [stencil] must be changed with getContext({antialias: false, stencil: true}) after reset");

    RemoveExlusiveContext();
});

test("verify canvas attributes", function () {
    var gl = GetCleanContext();

    ok(gl.canvas !== null && gl.canvas !== undefined, "[canvas] attribute is available");
    var tmp = gl.canvas.width;
    raises(function () {
        gl.canvas.width = gl.canvas.width * 2;
    }, "[canvas] attribute is readonly");
    equal(gl.canvas.width, tmp, "Check that [canvas] attribute is not changed");

    ok(gl.drawingBufferWidth !== null && gl.drawingBufferWidth !== undefined, "[drawingBufferWidth] attribute is available");
    tmp = gl.drawingBufferWidth;
    raises(function () {
        gl.drawingBufferWidth = gl.drawingBufferWidth * 2;
    }, "[drawingBufferWidth] attribute is readonly");
    equal(gl.canvas.width, tmp, "Check that [drawingBufferWidth] attribute is not changed");

    ok(gl.drawingBufferHeight !== null && gl.drawingBufferHeight !== undefined, "[drawingBufferHeight] is available");
    tmp = gl.drawingBufferHeight;
    raises(function () {
        gl.drawingBufferHeight = gl.drawingBufferHeight * 2;
    }, "[drawingBufferHeight] attribute is readonly");
    equal(gl.canvas.width, tmp, "Check that [drawingBufferHeight] attribute is not changed");
});

test("verify drawingBufferWidth/drawingBufferHeight", function () {
    var gl = CreateExlusiveContext();

    if ((gl.drawingBufferWidth === null || gl.drawingBufferWidth === undefined) ||
    (gl.drawingBufferHeight === null || gl.drawingBufferHeight === undefined)) {
        ok(false, "drawingBufferWidth/drawingBufferHeight is unavailable");
        RemoveExlusiveContext();
        return;
    }

    equal(gl.drawingBufferWidth, gl.canvas.width, "drawingBufferWidth == canvas.width");
    equal(gl.drawingBufferHeight, gl.canvas.height, "drawingBufferHeight == canvas.height")

    var maxDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter([MAX_VIEWPORT_DIMS])");

    var canvas = GetWebGLParentExlusiveContext();

    canvas.width = maxDims[0] * 2;
    canvas.height = maxDims[1] * 2;
    ok(gl.drawingBufferWidth <= maxDims[0], "drawingBufferWidth <= max supported width [MAX_VIEWPORT_DIMS] after set too big canvas.width");
    ok(gl.drawingBufferHeight <= maxDims[1], "drawingBufferHeight <= max supported height [MAX_VIEWPORT_DIMS] after set too big canvas.height");

    RemoveExlusiveContext();
});

test("verify addEventListener()", function () {
    var handler = function (event) {
        ok(false, "handled error event");
    }

    expect(0);
    GetWebGLParentContext().addEventListener("webglcontextcreationerror", handler, false);
    var gl = GetCleanContext();
});

test("verify isContextLost()", function () {
    var gl = GetCleanContext();

    var isLost = gl.isContextLost();
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call isContextLost()");
    strictEqual(isLost, false, "isContextLost() == false");
});

test("verify getParameter()", function () {
    CreateExlusiveContext();
    var gl = GetExlusiveContext();

    var paramNames =
    [
        { 'name': "ACTIVE_TEXTURE", 'type': gl.ACTIVE_TEXTURE, 'refVal': gl.TEXTURE0 },
        { 'name': "ALIASED_LINE_WIDTH_RANGE", 'type': gl.ALIASED_LINE_WIDTH_RANGE, 'refVal': 1 },
        { 'name': "ALIASED_POINT_SIZE_RANGE", 'type': gl.ALIASED_POINT_SIZE_RANGE, 'refVal': 1 },
        { 'name': "ALPHA_BITS", 'type': gl.ALPHA_BITS },
        { 'name': "ARRAY_BUFFER_BINDING", 'type': gl.ARRAY_BUFFER_BINDING },
        { 'name': "BLEND", 'type': gl.BLEND, 'refVal': false },
        { 'name': "BLEND_COLOR", 'type': gl.BLEND_COLOR, 'refVal': [0, 0, 0, 0] },
        { 'name': "BLEND_DST_ALPHA", 'type': gl.BLEND_DST_ALPHA, 'refVal': gl.ZERO },
        { 'name': "BLEND_DST_RGB", 'type': gl.BLEND_DST_RGB, 'refVal': gl.ZERO },
        { 'name': "BLEND_EQUATION_ALPHA", 'type': gl.BLEND_EQUATION_ALPHA, 'refVal': gl.FUNC_ADD },
        { 'name': "BLEND_EQUATION_RGB", 'type': gl.BLEND_EQUATION_RGB, 'refVal': gl.FUNC_ADD },
        { 'name': "BLEND_SRC_ALPHA", 'type': gl.BLEND_SRC_ALPHA, 'refVal': gl.ONE },
        { 'name': "BLEND_SRC_RGB", 'type': gl.BLEND_SRC_RGB, 'refVal': gl.ONE },
        { 'name': "BLUE_BITS", 'type': gl.BLUE_BITS },
        { 'name': "COLOR_CLEAR_VALUE", 'type': gl.COLOR_CLEAR_VALUE, 'refVal': [0, 0, 0, 0] },
        { 'name': "COLOR_WRITEMASK", 'type': gl.COLOR_WRITEMASK, 'refVal': [true, true, true, true] },
        { 'name': "COMPRESSED_TEXTURE_FORMATS", 'type': gl.COMPRESSED_TEXTURE_FORMATS },
        { 'name': "CULL_FACE", 'type': gl.CULL_FACE, 'refVal': false },
        { 'name': "CULL_FACE_MODE", 'type': gl.CULL_FACE_MODE, 'refVal': gl.BACK },
        { 'name': "CURRENT_PROGRAM", 'type': gl.CURRENT_PROGRAM },
        { 'name': "DEPTH_BITS", 'type': gl.DEPTH_BITS },
        { 'name': "DEPTH_CLEAR_VALUE", 'type': gl.DEPTH_CLEAR_VALUE, 'refVal': 1 },
        { 'name': "DEPTH_FUNC", 'type': gl.DEPTH_FUNC, 'refVal': gl.LESS },
        { 'name': "DEPTH_RANGE", 'type': gl.DEPTH_RANGE, 'refVal': [0, 1] },
        { 'name': "DEPTH_TEST", 'type': gl.DEPTH_TEST, 'refVal': false },
        { 'name': "DEPTH_WRITEMASK", 'type': gl.DEPTH_WRITEMASK, 'refVal': true },
        { 'name': "ELEMENT_ARRAY_BUFFER_BINDING", 'type': gl.ELEMENT_ARRAY_BUFFER_BINDING },
        { 'name': "FRAMEBUFFER_BINDING", 'type': gl.FRAMEBUFFER_BINDING },
        { 'name': "FRONT_FACE", 'type': gl.FRONT_FACE, 'refVal': gl.CCW },
        { 'name': "GENERATE_MIPMAP_HINT", 'type': gl.GENERATE_MIPMAP_HINT, 'refVal': gl.DONT_CARE },
        { 'name': "GREEN_BITS", 'type': gl.GREEN_BITS },
        { 'name': "LINE_WIDTH", 'type': gl.LINE_WIDTH, 'refVal': 1 },
        { 'name': "MAX_COMBINED_TEXTURE_IMAGE_UNITS", 'type': gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 'refVal': 8 },
        { 'name': "MAX_CUBE_MAP_TEXTURE_SIZE", 'type': gl.MAX_CUBE_MAP_TEXTURE_SIZE, 'refVal': 16 },
        { 'name': "MAX_FRAGMENT_UNIFORM_VECTORS", 'type': gl.MAX_FRAGMENT_UNIFORM_VECTORS, 'refVal': 16 },
        { 'name': "MAX_RENDERBUFFER_SIZE", 'type': gl.MAX_RENDERBUFFER_SIZE, 'refVal': 1 },
        { 'name': "MAX_TEXTURE_IMAGE_UNITS", 'type': gl.MAX_TEXTURE_IMAGE_UNITS, 'refVal': 8 },
        { 'name': "MAX_TEXTURE_SIZE", 'type': gl.MAX_TEXTURE_SIZE, 'refVal': 64 },
        { 'name': "MAX_VARYING_VECTORS", 'type': gl.MAX_VARYING_VECTORS, 'refVal': 8 },
        { 'name': "MAX_VERTEX_ATTRIBS", 'type': gl.MAX_VERTEX_ATTRIBS, 'refVal': 8 },
        { 'name': "MAX_VERTEX_TEXTURE_IMAGE_UNITS", 'type': gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS, 'refVal': 0 },
        { 'name': "MAX_VERTEX_UNIFORM_VECTORS", 'type': gl.MAX_VERTEX_UNIFORM_VECTORS, 'refVal': 128 },
        { 'name': "MAX_VIEWPORT_DIMS", 'type': gl.MAX_VIEWPORT_DIMS, 'refVal': [gl.canvas.width, gl.canvas.height] },
        { 'name': "PACK_ALIGNMENT", 'type': gl.PACK_ALIGNMENT, 'refVal': 4 },
        { 'name': "POLYGON_OFFSET_FACTOR", 'type': gl.POLYGON_OFFSET_FACTOR, 'refVal': 0 },
        { 'name': "POLYGON_OFFSET_FILL", 'type': gl.POLYGON_OFFSET_FILL, 'refVal': false },
        { 'name': "POLYGON_OFFSET_UNITS", 'type': gl.POLYGON_OFFSET_UNITS, 'refVal': 0 },
        { 'name': "RED_BITS", 'type': gl.RED_BITS },
        { 'name': "RENDERBUFFER_BINDING", 'type': gl.RENDERBUFFER_BINDING },
        { 'name': "RENDERER", 'type': gl.RENDERER },
        { 'name': "SAMPLE_BUFFERS", 'type': gl.SAMPLE_BUFFERS, 'refVal': 0 },
        { 'name': "SAMPLE_COVERAGE_INVERT", 'type': gl.SAMPLE_COVERAGE_INVERT, 'refVal': false },
        { 'name': "SAMPLE_COVERAGE_VALUE", 'type': gl.SAMPLE_COVERAGE_VALUE, 'refVal': 1 },
        { 'name': "SAMPLES", 'type': gl.SAMPLES },
        { 'name': "SCISSOR_BOX", 'type': gl.SCISSOR_BOX, 'refVal': [0, 0, gl.canvas.width, gl.canvas.height] },
        { 'name': "SCISSOR_TEST", 'type': gl.SCISSOR_TEST, 'refVal': false },
        { 'name': "SHADING_LANGUAGE_VERSION", 'type': gl.SHADING_LANGUAGE_VERSION, refVal: "WebGL\\sGLSL\\sES\\s1.0\\s?\\w*" },
        { 'name': "STENCIL_BACK_FAIL", 'type': gl.STENCIL_BACK_FAIL, 'refVal': gl.KEEP },
        { 'name': "STENCIL_BACK_FUNC", 'type': gl.STENCIL_BACK_FUNC, 'refVal': gl.ALWAYS },
        { 'name': "STENCIL_BACK_PASS_DEPTH_FAIL", 'type': gl.STENCIL_BACK_PASS_DEPTH_FAIL, 'refVal': gl.KEEP },
        { 'name': "STENCIL_BACK_PASS_DEPTH_PASS", 'type': gl.STENCIL_BACK_PASS_DEPTH_PASS, 'refVal': gl.KEEP },
        { 'name': "STENCIL_BACK_REF", 'type': gl.STENCIL_BACK_REF, 'refVal': 0 },
        { 'name': "STENCIL_BACK_VALUE_MASK", 'type': gl.STENCIL_BACK_VALUE_MASK, 'refVal': 0xFFFFFFFF },
        { 'name': "STENCIL_BACK_WRITEMASK", 'type': gl.STENCIL_BACK_WRITEMASK, 'refVal': 0xFFFFFFFF },
        { 'name': "STENCIL_BITS", 'type': gl.STENCIL_BITS },
        { 'name': "STENCIL_CLEAR_VALUE", 'type': gl.STENCIL_CLEAR_VALUE, 'refVal': 0 },
        { 'name': "STENCIL_FAIL", 'type': gl.STENCIL_FAIL, 'refVal': gl.KEEP },
        { 'name': "STENCIL_FUNC", 'type': gl.STENCIL_FUNC, 'refVal': gl.ALWAYS },
        { 'name': "STENCIL_PASS_DEPTH_FAIL", 'type': gl.STENCIL_PASS_DEPTH_FAIL, 'refVal': gl.KEEP },
        { 'name': "STENCIL_PASS_DEPTH_PASS", 'type': gl.STENCIL_PASS_DEPTH_PASS, 'refVal': gl.KEEP },
        { 'name': "STENCIL_REF", 'type': gl.STENCIL_REF, 'refVal': 0 },
        { 'name': "STENCIL_TEST", 'type': gl.STENCIL_TEST, 'refVal': false },
        { 'name': "STENCIL_VALUE_MASK", 'type': gl.STENCIL_VALUE_MASK, 'refVal': 0xFFFFFFFF },
        { 'name': "STENCIL_WRITEMASK", 'type': gl.STENCIL_WRITEMASK, 'refVal': 0xFFFFFFFF },
        { 'name': "SUBPIXEL_BITS", 'type': gl.SUBPIXEL_BITS, 'refVal': 4 },
        { 'name': "TEXTURE_BINDING_2D", 'type': gl.TEXTURE_BINDING_2D },
        { 'name': "TEXTURE_BINDING_CUBE_MAP", 'type': gl.TEXTURE_BINDING_CUBE_MAP },
        { 'name': "UNPACK_ALIGNMENT", 'type': gl.UNPACK_ALIGNMENT, 'refVal': 4 },
        { 'name': "UNPACK_COLORSPACE_CONVERSION_WEBGL", 'type': gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, 'refVal': gl.BROWSER_DEFAULT_WEBGL },
        { 'name': "UNPACK_FLIP_Y_WEBGL", 'type': gl.UNPACK_FLIP_Y_WEBGL, 'refVal': false },
        { 'name': "UNPACK_PREMULTIPLY_ALPHA_WEBGL", 'type': gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 'refVal': false },
        { 'name': "VENDOR", 'type': gl.VENDOR },
        { 'name': "VERSION", 'type': gl.VERSION, refVal: "WebGL\\s1.0\\s?\\w*" },
        { 'name': "VIEWPORT", 'type': gl.VIEWPORT, 'refVal': [0, 0, gl.canvas.width, gl.canvas.height] }
    ];

    for (var i = 0, l = paramNames.length; i < l; ++i) {
        var val = gl.getParameter(paramNames[i].type);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter([" + paramNames[i].name + "])");

        CheckParamType(gl, paramNames[i].type, val, paramNames[i].name);
        CheckParamInitValue(gl, paramNames[i].type, paramNames[i].name, val, paramNames[i].refVal);
    }

    gl.getParameter(-1);
    equal(gl.getError(), gl.INVALID_ENUM, "getParameter() must generate INVALID_ENUM with invalid parameter");

    RemoveExlusiveContext();
});

test("verify clear()", function () {
    var gl = GetCleanContext();

    gl.clear(-1);
    equal(gl.getError(), gl.INVALID_VALUE, "clear() must generate INVALID_VALUE with invalid parameter");

    var parameters =
    [
        { 'name': "COLOR_BUFFER_BIT", 'type': gl.COLOR_BUFFER_BIT },
        { 'name': "DEPTH_BUFFER_BIT", 'type': gl.DEPTH_BUFFER_BIT },
        { 'name': "STENCIL_BUFFER_BIT", 'type': gl.STENCIL_BUFFER_BIT }
     ];

    for (var i = 0, l = parameters.length; i < l; ++i) {
        gl.clear(parameters[i].type);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call clear() with parameter [" + parameters[i].name + "]");
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call clear() with parameter [COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT]");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call clear() with parameter [COLOR_BUFFER_BIT | STENCIL_BUFFER_BIT]");
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call clear() with parameter [DEPTH_BUFFER_BIT | STENCIL_BUFFER_BIT]");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call clear() with parameter [COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT | STENCIL_BUFFER_BIT]");
});

test("verify clearColor()", function () {
    var gl = GetCleanContext();

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.clearColor(val[0], val[1], val[2], val[3]); },
            'desc': "clearColor()"
        },
        {
            'param': { 'name': "COLOR_CLEAR_VALUE", 'value': gl.COLOR_CLEAR_VALUE },
            'acceptableParams':
            [
                { 'name': "[0, 0, 1, 1]", 'value': [0, 0, 1, 1], 'acceptValue': [0, 0, 1, 1], 'expectedError': gl.NO_ERROR },
                { 'name': "[99, -10, 0, 1.6]", 'value': [99, -10, 0, 1.6], 'acceptValue': [1, 0, 0, 1], 'expectedError': gl.NO_ERROR, 'desc': "value must be clamped to [0,1]" }
            ],
            'valueCompFunc': function (val1, val2) { return isEqual(val1[0], val2[0]) && isEqual(val1[1], val2[1]) && isEqual(val1[2], val2[2]) && isEqual(val1[3], val2[3]); }
        }
    );
});

test("verify colorMask()", function () {
    var gl = GetCleanContext();

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.colorMask(val[0], val[1], val[2], val[3]); },
            'desc': "colorMask()"
        },
        {
            'param': { 'name': "COLOR_WRITEMASK", 'value': gl.COLOR_WRITEMASK },
            'acceptableParams':
            [
                { 'name': "[true, false, false, true]", 'value': [true, false, false, true], 'acceptValue': [true, false, false, true], 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1[0] == val2[0] && val1[1] == val2[1] && val1[2] == val2[2] && val1[3] == val2[3]; }
        }
    );
});

test("verify lineWidth()", function () {
    var gl = GetCleanContext();

    var range = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(ALIASED_LINE_WIDTH_RANGE)");

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.lineWidth(val); },
            'desc': "lineWidth()"
        },
        {
            'param': { 'name': "LINE_WIDTH", 'value': gl.LINE_WIDTH },
            'acceptableParams':
            [
                { 'name': "[5.9]", 'value': 5.9, 'acceptValue': 5.9, 'expectedError': gl.NO_ERROR },
                { 'name': "[0.0]", 'value': 0.0, 'expectedError': gl.INVALID_VALUE, 'desc': "width == 0" },
                { 'name': "[-10]", 'value': -10, 'expectedError': gl.INVALID_VALUE, 'desc': "width < 0" },
                { 'name': "[0.5]", 'value': 0.5, 'acceptValue': 0.5, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return isEqual(val1, val2); }
        }
    );
});

test("verify pixelStorei() opengl default parameters", function () {
    var gl = GetCleanContext();

    gl.pixelStorei(-1, 1);
    equal(gl.getError(), gl.INVALID_ENUM, "pixelStorei() must generate INVALID_ENUM with invalid parameter");

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.pixelStorei(gl.PACK_ALIGNMENT, val); },
            'desc': "pixelStorei([PACK_ALIGNMENT])"
        },
        {
            'param': { 'name': "PACK_ALIGNMENT", 'value': gl.PACK_ALIGNMENT },
            'acceptableParams':
            [
                { 'name': "[1]", 'value': 1, 'acceptValue': 1, 'expectedError': gl.NO_ERROR },
                { 'name': "[2]", 'value': 2, 'acceptValue': 2, 'expectedError': gl.NO_ERROR },
                { 'name': "[4]", 'value': 4, 'acceptValue': 4, 'expectedError': gl.NO_ERROR },
                { 'name': "[8]", 'value': 8, 'acceptValue': 8, 'expectedError': gl.NO_ERROR },
                { 'name': "[4.5]", 'value': 4.5, 'acceptValue': 4, 'expectedError': gl.NO_ERROR },
                { 'name': "[32]", 'value': 32, 'expectedError': gl.INVALID_VALUE, 'desc': "value not in range [1,2,4,8]" },
                { 'name': "[-1]", 'value': -1, 'expectedError': gl.INVALID_VALUE, 'desc': "value not in range [1,2,4,8]" }
            ],
            'valueCompFunc': function (val1, val2) { return val1 === val2; }
        }
    );

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.pixelStorei(gl.UNPACK_ALIGNMENT, val); },
            'desc': "pixelStorei([UNPACK_ALIGNMENT])"
        },
        {
            'param': { 'name': "UNPACK_ALIGNMENT", 'value': gl.UNPACK_ALIGNMENT },
            'acceptableParams':
            [
                { 'name': "[1]", 'value': 1, 'acceptValue': 1, 'expectedError': gl.NO_ERROR },
                { 'name': "[2]", 'value': 2, 'acceptValue': 2, 'expectedError': gl.NO_ERROR },
                { 'name': "[4]", 'value': 4, 'acceptValue': 4, 'expectedError': gl.NO_ERROR },
                { 'name': "[8]", 'value': 8, 'acceptValue': 8, 'expectedError': gl.NO_ERROR },
                { 'name': "[4.5]", 'value': 4.5, 'acceptValue': 4, 'expectedError': gl.NO_ERROR },
                { 'name': "[32]", 'value': 32, 'expectedError': gl.INVALID_VALUE, 'desc': "value not in range [1,2,4,8]" },
                { 'name': "[-1]", 'value': -1, 'expectedError': gl.INVALID_VALUE, 'desc': "value not in range [1,2,4,8]" }
            ],
            'valueCompFunc': function (val1, val2) { return val1 === val2; }
        }
    );
});

test("verify pixelStorei() webgl additional parameters", function () {
    var gl = GetCleanContext();

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, val); },
            'desc': "pixelStorei([UNPACK_FLIP_Y_WEBGL])"
        },
        {
            'param': { 'name': "UNPACK_FLIP_Y_WEBGL", 'value': gl.UNPACK_FLIP_Y_WEBGL },
            'acceptableParams':
            [
                { 'name': "[true]", 'value': true, 'acceptValue': true, 'expectedError': gl.NO_ERROR },
                { 'name': "[1]", 'value': 1, 'acceptValue': true, 'expectedError': gl.NO_ERROR },
                { 'name': "[-1]", 'value': -1, 'acceptValue': true, 'expectedError': gl.NO_ERROR },
                { 'name': "[0]", 'value': 0, 'acceptValue': false, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1 === val2; }
        }
    );

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, val); },
            'desc': "pixelStorei([UNPACK_PREMULTIPLY_ALPHA_WEBGL])"
        },
        {
            'param': { 'name': "UNPACK_PREMULTIPLY_ALPHA_WEBGL", 'value': gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL },
            'acceptableParams':
            [
                { 'name': "[true]", 'value': true, 'acceptValue': true, 'expectedError': gl.NO_ERROR },
                { 'name': "[1]", 'value': 1, 'acceptValue': true, 'expectedError': gl.NO_ERROR },
                { 'name': "[-1]", 'value': -1, 'acceptValue': true, 'expectedError': gl.NO_ERROR },
                { 'name': "[0]", 'value': 0, 'acceptValue': false, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1 === val2; }
        }
    );

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, val); },
            'desc': "pixelStorei([UNPACK_COLORSPACE_CONVERSION_WEBGL])"
        },
        {
            'param': { 'name': "UNPACK_COLORSPACE_CONVERSION_WEBGL", 'value': gl.UNPACK_COLORSPACE_CONVERSION_WEBGL },
            'acceptableParams':
            [
                { 'name': "[BROWSER_DEFAULT_WEBGL]", 'value': gl.BROWSER_DEFAULT_WEBGL, 'acceptValue': gl.BROWSER_DEFAULT_WEBGL, 'expectedError': gl.NO_ERROR },
                { 'name': "[NONE]", 'value': gl.NONE, 'acceptValue': gl.NONE, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1 === val2; }
        }
    );
});

test("verify hint()", function () {
    var gl = GetCleanContext();
  
    gl.hint(-1, gl.DONT_CARE);
    equal(gl.getError(), gl.INVALID_ENUM, "hint() must generate INVALID_ENUM with invalid target parameter");
 
    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.hint(gl.GENERATE_MIPMAP_HINT, val); },
            'desc': "hint()"
        },
        {
            'param': { 'name': "GENERATE_MIPMAP_HINT", 'value': gl.GENERATE_MIPMAP_HINT },
            'acceptableParams':
            [
                { 'name': "-1", 'value': -1, 'expectedError': gl.INVALID_ENUM, 'desc': "invalid mode parameter" },
                { 'name': "FASTEST", 'value': gl.FASTEST, 'acceptValue': gl.FASTEST, 'expectedError': gl.NO_ERROR },
                { 'name': "NICEST", 'value': gl.NICEST, 'acceptValue': gl.NICEST, 'expectedError': gl.NO_ERROR },
                { 'name': "DONT_CARE", 'value': gl.DONT_CARE, 'acceptValue': gl.DONT_CARE, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1 === val2; }
        }
    );
});

test("verify sampleCoverage()", function () {
    var gl = GetCleanContext();

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.sampleCoverage(val, false); },
            'desc': "sampleCoverage([SAMPLE_COVERAGE_VALUE])"
        },
        {
            'param': { 'name': "SAMPLE_COVERAGE_VALUE", 'value': gl.SAMPLE_COVERAGE_VALUE },
            'acceptableParams':
            [
                { 'name': "[0.5]", 'value': 0.5, 'acceptValue': 0.5, 'expectedError': gl.NO_ERROR },
                { 'name': "[-1]", 'value': -1, 'acceptValue': 0.0, 'expectedError': gl.NO_ERROR, 'desc': "value must be clamped to [0,1]" },
                { 'name': "[100]", 'value': 100, 'acceptValue': 1.0, 'expectedError': gl.NO_ERROR, 'desc': "value must be clamped to [0,1]" }
            ],
            'valueCompFunc': function (val1, val2) { return isEqual(val1, val2); }
        }
    );

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.sampleCoverage(1.0, val); },
            'desc': "sampleCoverage([SAMPLE_COVERAGE_INVERT])"
        },
        {
            'param': { 'name': "SAMPLE_COVERAGE_INVERT", 'value': gl.SAMPLE_COVERAGE_INVERT },
            'acceptableParams':
            [
                { 'name': "[true]", 'value': true, 'acceptValue': true, 'expectedError': gl.NO_ERROR },
                { 'name': "[false]", 'value': false, 'acceptValue': false, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1 === val2; }
        }
    );
});

test("verify isEnabled()", function () {
    var gl = GetCleanContext();

    var invalidVal = gl.isEnabled(-1);
    equal(gl.getError(), gl.INVALID_ENUM, "isEnabled() must generate INVALID_ENUM with invalid parameter");
    equal(invalidVal, false, "isEnabled() must return false if error occurs");

    var parameters =
    [
        { 'name': "BLEND", 'type': gl.BLEND, 'initVal': false },
        { 'name': "CULL_FACE", 'type': gl.CULL_FACE, 'initVal': false },
        { 'name': "DEPTH_TEST", 'type': gl.DEPTH_TEST, 'initVal': false },
        { 'name': "DITHER", 'type': gl.DITHER, 'initVal': true },
        { 'name': "POLYGON_OFFSET_FILL", 'type': gl.POLYGON_OFFSET_FILL, 'initVal': false },
        { 'name': "SAMPLE_ALPHA_TO_COVERAGE", 'type': gl.SAMPLE_ALPHA_TO_COVERAGE, 'initVal': false },
        { 'name': "SAMPLE_COVERAGE", 'type': gl.SAMPLE_COVERAGE, 'initVal': false },
        { 'name': "SCISSOR_TEST", 'type': gl.SCISSOR_TEST, 'initVal': false },
        { 'name': "STENCIL_TEST", 'type': gl.STENCIL_TEST, 'initVal': false }
    ];

    for (var i = 0, l = parameters.length; i < l; ++i) {
        var val = gl.isEnabled(parameters[i].type);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call isEnabled() with parameter [" + parameters[i].name + "]");
        strictEqual(val, parameters[i].initVal, "Check init value for parameter [" + parameters[i].name + "] returned by isEnabled()");
    }
});

test("verify enabled() && disable()", function () {
    var gl = GetCleanContext();

    gl.enable(-1);
    equal(gl.getError(), gl.INVALID_ENUM, "enable() must generate INVALID_ENUM with invalid parameter");
    gl.disable(-1);
    equal(gl.getError(), gl.INVALID_ENUM, "disable() must generate INVALID_ENUM with invalid parameter");

    var parameters =
    [
        { 'name': "BLEND", 'type': gl.BLEND, 'initVal': false },
        { 'name': "CULL_FACE", 'type': gl.CULL_FACE, 'initVal': false },
        { 'name': "DEPTH_TEST", 'type': gl.DEPTH_TEST, 'initVal': false },
        { 'name': "DITHER", 'type': gl.DITHER, 'initVal': true },
        { 'name': "POLYGON_OFFSET_FILL", 'type': gl.POLYGON_OFFSET_FILL, 'initVal': false },
        { 'name': "SAMPLE_ALPHA_TO_COVERAGE", 'type': gl.SAMPLE_ALPHA_TO_COVERAGE, 'initVal': false },
        { 'name': "SAMPLE_COVERAGE", 'type': gl.SAMPLE_COVERAGE, 'initVal': false },
        { 'name': "SCISSOR_TEST", 'type': gl.SCISSOR_TEST, 'initVal': false },
        { 'name': "STENCIL_TEST", 'type': gl.STENCIL_TEST, 'initVal': false }
    ];

    for (var i = 0, l = parameters.length; i < l; ++i) {
        gl.enable(parameters[i].type);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call enable() with parameter [" + parameters[i].name + "]");
        strictEqual(gl.isEnabled(parameters[i].type), true, "isEnabled() must return true after call enable() with parameter [" + parameters[i].name + "]");

        gl.disable(parameters[i].type);
        equal(gl.getError(), gl.NO_ERROR, "disable() generates errors with parameter [" + parameters[i].name + "]");
        strictEqual(!gl.isEnabled(parameters[i].type), true, "isEnabled() must return false after call disable() with parameter [" + parameters[i].name + "]");

        if (parameters[i].initVal) {
            gl.enable(parameters[i].type);
        }
        else {
            gl.disable(parameters[i].type);
        }
    }
});

test("verify cullFace()", function () {
    var gl = GetCleanContext();

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.cullFace(val); },
            'desc': "cullFace()"
        },
        {
            'param': { 'name': "CULL_FACE_MODE", 'value': gl.CULL_FACE_MODE },
            'acceptableParams':
            [
                { 'name': "-1", 'value': -1, 'expectedError': gl.INVALID_ENUM, 'desc': "invalid enum" },
                { 'name': "FRONT", 'value': gl.FRONT, 'acceptValue': gl.FRONT, 'expectedError': gl.NO_ERROR },
                { 'name': "BACK", 'value': gl.BACK, 'acceptValue': gl.BACK, 'expectedError': gl.NO_ERROR },
                { 'name': "FRONT_AND_BACK", 'value': gl.FRONT_AND_BACK, 'acceptValue': gl.FRONT_AND_BACK, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1 === val2; }
        }
    );
});

test("verify frontFace()", function () {
    var gl = GetCleanContext();

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.frontFace(val); },
            'desc': "frontFace()"
        },
        {
            'param': { 'name': "FRONT_FACE", 'value': gl.FRONT_FACE },
            'acceptableParams':
            [
                { 'name': "-1", 'value': -1, 'expectedError': gl.INVALID_ENUM, 'desc': "invalid enum" },
                { 'name': "CW", 'value': gl.CW, 'acceptValue': gl.CW, 'expectedError': gl.NO_ERROR },
                { 'name': "CCW", 'value': gl.CCW, 'acceptValue': gl.CCW, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1 === val2; }
        }
    );
});

test("verify blendEquation()", function () {
    var gl = GetCleanContext();

    var initValRGB = gl.getParameter(gl.BLEND_EQUATION_RGB);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_EQUATION_RGB)");

    var initValAlpha = gl.getParameter(gl.BLEND_EQUATION_ALPHA);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_EQUATION_ALPHA)");

    gl.blendEquation(-1);
    equal(gl.getError(), gl.INVALID_ENUM, "blendEquation() must generate INVALID_ENUM with invalid parameter");

    var params =
    [
        { 'name': "FUNC_ADD", 'type': gl.FUNC_ADD },
        { 'name': "FUNC_SUBTRACT", 'type': gl.FUNC_SUBTRACT },
        { 'name': "FUNC_REVERSE_SUBTRACT", 'type': gl.FUNC_REVERSE_SUBTRACT }
    ];

    for (var i = 0, l = params.length; i < l; i++) {
        gl.blendEquation(params[i].type);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call blendEquation() with parameter [" + params[i].name + "]");
        strictEqual(gl.getParameter(gl.BLEND_EQUATION_RGB), params[i].type, "getParameter(BLEND_EQUATION_RGB) == " + params[i].name + " after call blendEquation()");
        strictEqual(gl.getParameter(gl.BLEND_EQUATION_ALPHA), params[i].type, "getParameter(BLEND_EQUATION_ALPHA) == " + params[i].name + " after call blendEquation()");
    }

    gl.blendEquation(initValRGB);
});

test("verify blendEquationSeparate()", function () {
    var gl = GetCleanContext();

    var initValRGB = gl.getParameter(gl.BLEND_EQUATION_RGB);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_EQUATION_RGB)");
    var initValAlpha = gl.getParameter(gl.BLEND_EQUATION_ALPHA);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_EQUATION_ALPHA)");

    gl.blendEquationSeparate(-1, initValAlpha);
    equal(gl.getError(), gl.INVALID_ENUM, "blendEquationSeparate() must generate INVALID_ENUM with invalid modeRGB parameter");

    gl.blendEquationSeparate(initValRGB, -1);
    equal(gl.getError(), gl.INVALID_ENUM, "blendEquationSeparate() must generate INVALID_ENUM with invalid modeAlpha parameter");

    var params =
    [
        { 'name': "FUNC_ADD", 'type': gl.FUNC_ADD },
        { 'name': "FUNC_SUBTRACT", 'type': gl.FUNC_SUBTRACT },
        { 'name': "FUNC_REVERSE_SUBTRACT", 'type': gl.FUNC_REVERSE_SUBTRACT }
    ];

    for (var i = 0, l = params.length; i < l; i++) {
        for (var j = 0, c = params.length; j < c; j++) {
            gl.blendEquationSeparate(params[i].type, params[j].type);
            equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call blendEquationSeparate() with parameters [" + params[i].name + "][" + params[j].name + "]");
            strictEqual(gl.getParameter(gl.BLEND_EQUATION_RGB), params[i].type, "getParameter(BLEND_EQUATION_RGB) == " + params[i].name + " after call blendEquationSeparate()");
            strictEqual(gl.getParameter(gl.BLEND_EQUATION_ALPHA), params[j].type, "getParameter(BLEND_EQUATION_ALPHA) == " + params[j].name + " after call blendEquationSeparate()");
        }
    }

    gl.blendEquationSeparate(initValRGB, initValAlpha);
});

test("verify blendFunc()", function () {
    var gl = GetCleanContext();

    var initSrcRGB = gl.getParameter(gl.BLEND_SRC_RGB);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_SRC_RGB)");
    var initSrcAlpha = gl.getParameter(gl.BLEND_SRC_ALPHA);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_SRC_ALPHA)");

    var initDstRGB = gl.getParameter(gl.BLEND_DST_RGB);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_DST_RGB)");
    var initDstAlpha = gl.getParameter(gl.BLEND_DST_ALPHA);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_DST_ALPHA)");

    gl.blendFunc(-1, -1);
    equal(gl.getError(), gl.INVALID_ENUM, "blendFunc() must generate INVALID_ENUM with invalid parameter");
    gl.blendFunc(-1, initDstRGB);
    equal(gl.getError(), gl.INVALID_ENUM, "blendFunc() must generate INVALID_ENUM with invalid sfactor parameter");
    gl.blendFunc(initSrcRGB, -1);
    equal(gl.getError(), gl.INVALID_ENUM, "blendFunc() must generate INVALID_ENUM with invalid dfactor parameter");

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

    for (var i = 0, sl = srcFactorParams.length; i < sl; i++) {
        for (var j = 0, dl = dstFactorParams.length; j < dl; j++) {
            gl.blendFunc(srcFactorParams[i].value, dstFactorParams[j].value);
            if (IsInvalidBlendFuncParameters(gl, srcFactorParams[i].value, dstFactorParams[j].value)) {
                equal(gl.getError(), gl.INVALID_OPERATION, "blendFunc() must generate INVALID_OPERATION with parameters [" + srcFactorParams[i].name + "][" + dstFactorParams[j].name + "] (6.11)");
            }
            else {
                equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call blendFunc() with parameters [" + srcFactorParams[i].name + "][" + dstFactorParams[j].name + "]");

                strictEqual(gl.getParameter(gl.BLEND_SRC_RGB), srcFactorParams[i].value, "getParameter(BLEND_SRC_RGB) == " + srcFactorParams[i].name + " after call blendFunc(" + srcFactorParams[i].name + "," + dstFactorParams[j].name + ")");
                strictEqual(gl.getParameter(gl.BLEND_SRC_ALPHA), srcFactorParams[i].value, "getParameter(BLEND_SRC_ALPHA) == " + srcFactorParams[i].name + " after call blendFunc(" + srcFactorParams[i].name + "," + dstFactorParams[j].name + ")");
                strictEqual(gl.getParameter(gl.BLEND_DST_RGB), dstFactorParams[j].value, "getParameter(BLEND_DST_RGB) == " + dstFactorParams[j].name + " after call blendFunc(" + srcFactorParams[i].name + "," + dstFactorParams[j].name + ")");
                strictEqual(gl.getParameter(gl.BLEND_DST_ALPHA), dstFactorParams[j].value, "getParameter(BLEND_DST_ALPHA) == " + dstFactorParams[j].name + " after call blendFunc(" + srcFactorParams[i].name + "," + dstFactorParams[j].name + ")");
            }
        }
    }

    gl.blendFunc(initSrcRGB, initDstRGB);
});


test("verify blendFuncSeparate()", function () {
    var gl = GetCleanContext();

    var initSrcRGB = gl.getParameter(gl.BLEND_SRC_RGB);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_SRC_RGB)");
    var initSrcAlpha = gl.getParameter(gl.BLEND_SRC_ALPHA);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_SRC_ALPHA)");

    var initDstRGB = gl.getParameter(gl.BLEND_DST_RGB);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_DST_RGB)");
    var initDstAlpha = gl.getParameter(gl.BLEND_DST_ALPHA);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(BLEND_DST_ALPHA)");

    gl.blendFuncSeparate(-1, initDstRGB, initSrcAlpha, initDstAlpha);
    equal(gl.getError(), gl.INVALID_ENUM, "blendFuncSeparate() must generate INVALID_ENUM with invalid srcRGB parameter");
    gl.blendFuncSeparate(initSrcRGB, -1, initSrcAlpha, initDstAlpha);
    equal(gl.getError(), gl.INVALID_ENUM, "blendFuncSeparate() must generate INVALID_ENUM with invalid dstRGB parameter");
    gl.blendFuncSeparate(initSrcRGB, initDstRGB, -1, initDstAlpha);
    equal(gl.getError(), gl.INVALID_ENUM, "blendFuncSeparate() must generate INVALID_ENUM with invalid srcAlpha parameter");
    gl.blendFuncSeparate(initSrcRGB, initDstRGB, initSrcAlpha, -1);
    equal(gl.getError(), gl.INVALID_ENUM, "blendFuncSeparate() must generate INVALID_ENUM with invalid dstAlpha parameter");

    gl.blendFuncSeparate(gl.SRC_COLOR, gl.DST_COLOR, gl.SRC_ALPHA_SATURATE, gl.ONE_MINUS_DST_ALPHA);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call blendFuncSeparate() with parameters [SRC_COLOR, DST_COLOR, SRC_ALPHA_SATURATE, ONE_MINUS_DST_ALPHA]");
    strictEqual(gl.getParameter(gl.BLEND_SRC_RGB), gl.SRC_COLOR, "getParameter(BLEND_SRC_RGB) == SRC_COLOR after call blendFuncSeparate(SRC_COLOR, DST_COLOR, SRC_ALPHA_SATURATE, ONE_MINUS_DST_ALPHA)");
    strictEqual(gl.getParameter(gl.BLEND_SRC_ALPHA), gl.SRC_ALPHA_SATURATE, "getParameter(BLEND_SRC_ALPHA) == SRC_ALPHA_SATURATE after call blendFuncSeparate(SRC_COLOR, DST_COLOR, SRC_ALPHA_SATURATE, ONE_MINUS_DST_ALPHA)");
    strictEqual(gl.getParameter(gl.BLEND_DST_RGB), gl.DST_COLOR, "getParameter(BLEND_DST_RGB) == DST_COLOR after call blendFuncSeparate(SRC_COLOR, DST_COLOR, SRC_ALPHA_SATURATE, ONE_MINUS_DST_ALPHA)");
    strictEqual(gl.getParameter(gl.BLEND_DST_ALPHA), gl.ONE_MINUS_DST_ALPHA, "getParameter(BLEND_DST_ALPHA) == ONE_MINUS_DST_ALPHA after call blendFuncSeparate(SRC_COLOR, DST_COLOR, SRC_ALPHA_SATURATE, ONE_MINUS_DST_ALPHA)");

    gl.blendFuncSeparate(gl.SRC_COLOR, gl.DST_COLOR, gl.ONE_MINUS_CONSTANT_COLOR, gl.CONSTANT_ALPHA);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call blendFuncSeparate() with parameters [SRC_COLOR, DST_COLOR, ONE_MINUS_CONSTANT_COLOR, CONSTANT_ALPHA]");
    strictEqual(gl.getParameter(gl.BLEND_SRC_RGB), gl.SRC_COLOR, "getParameter(BLEND_SRC_RGB) == SRC_COLOR after call blendFuncSeparate(SRC_COLOR, DST_COLOR, SRC_ALPHA_SATURATE, ONE_MINUS_DST_ALPHA)");
    strictEqual(gl.getParameter(gl.BLEND_SRC_ALPHA), gl.ONE_MINUS_CONSTANT_COLOR, "getParameter(BLEND_SRC_ALPHA) == SRC_ALPHA_SATURATE after call blendFuncSeparate(SRC_COLOR, DST_COLOR, SRC_ALPHA_SATURATE, ONE_MINUS_DST_ALPHA)");
    strictEqual(gl.getParameter(gl.BLEND_DST_RGB), gl.DST_COLOR, "getParameter(BLEND_DST_RGB) == DST_COLOR after call blendFuncSeparate(SRC_COLOR, DST_COLOR, SRC_ALPHA_SATURATE, ONE_MINUS_DST_ALPHA)");
    strictEqual(gl.getParameter(gl.BLEND_DST_ALPHA), gl.CONSTANT_ALPHA, "getParameter(BLEND_DST_ALPHA) == ONE_MINUS_DST_ALPHA after call blendFuncSeparate(SRC_COLOR, DST_COLOR, SRC_ALPHA_SATURATE, ONE_MINUS_DST_ALPHA)");

    gl.blendFuncSeparate(gl.ONE_MINUS_CONSTANT_COLOR, gl.CONSTANT_ALPHA, gl.SRC_COLOR, gl.DST_COLOR);
    equal(gl.getError(), gl.INVALID_OPERATION, "blendFuncSeparate() must generate INVALID_OPERATION with parameters [ONE_MINUS_CONSTANT_COLOR, CONSTANT_ALPHA, SRC_COLOR, DST_COLOR] (6.11)");

    gl.blendFuncSeparate(initSrcRGB, initDstRGB, initSrcAlpha, initSrcAlpha);
});

test("verify blendColor()", function () {
    var gl = GetCleanContext();

    var initColor = gl.getParameter(gl.BLEND_COLOR);
    equal(gl.getError(), gl.NO_ERROR, "getParameter([BLEND_COLOR]) generates no errors");

    var testColor = { r: 0, g: 1, b: 0.5, a: 0.2 };
    gl.blendColor(testColor.r, testColor.g, testColor.b, testColor.a);
    equal(gl.getError(), gl.NO_ERROR, "blendColor() generates no errors");

    var color = gl.getParameter(gl.BLEND_COLOR);
    ok(isEqual(color[0], testColor.r) && isEqual(color[1], testColor.g) && 
        isEqual(color[2], testColor.b) && isEqual(color[3], testColor.a), "Check blend color. " +
        "Expected: [" + testColor.r + "," + testColor.g + "," + testColor.b + "," + testColor.a + "], " +
        "returned: [" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + "]");

    gl.blendColor(initColor.r, initColor.g, initColor.b, initColor.a);
});

test("verify polygonOffset()", function () {
    var gl = GetCleanContext();

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.polygonOffset(val, 0); },
            'desc': "polygonOffset([POLYGON_OFFSET_FACTOR])"
        },
        {
            'param': { 'name': "POLYGON_OFFSET_FACTOR", 'value': gl.POLYGON_OFFSET_FACTOR },
            'acceptableParams':
            [
                { 'name': "[-1]", 'value': -1, 'acceptValue': -1, 'expectedError': gl.NO_ERROR },
                { 'name': "[1000]", 'value': 1000, 'acceptValue': 1000, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return isEqual(val1, val2); }
        }
    );

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.polygonOffset(0, val); },
            'desc': "polygonOffset([POLYGON_OFFSET_UNITS])"
        },
        {
            'param': { 'name': "POLYGON_OFFSET_UNITS", 'value': gl.POLYGON_OFFSET_UNITS },
            'acceptableParams':
            [
                { 'name': "[-1]", 'value': -1, 'acceptValue': -1, 'expectedError': gl.NO_ERROR },
                { 'name': "[1000]", 'value': 1000, 'acceptValue': 1000, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return isEqual(val1, val2); }
        }
    );
});

test("verify depthFunc()", function () {
    var gl = GetCleanContext();
    
    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.depthFunc(val); },
            'desc': "depthFunc()"
        },
        {
            'param': { 'name': "DEPTH_FUNC", 'value': gl.DEPTH_FUNC },
            'acceptableParams':
            [
                { 'name': "-1", 'value': -1, 'expectedError': gl.INVALID_ENUM, 'desc': "invalid enum" },
                { 'name': "NEVER", 'value': gl.NEVER, 'acceptValue': gl.NEVER, 'expectedError': gl.NO_ERROR },
                { 'name': "LESS", 'value': gl.LESS, 'acceptValue': gl.LESS, 'expectedError': gl.NO_ERROR },
                { 'name': "EQUAL", 'value': gl.EQUAL, 'acceptValue': gl.EQUAL, 'expectedError': gl.NO_ERROR },
                { 'name': "LEQUAL", 'value': gl.LEQUAL, 'acceptValue': gl.LEQUAL, 'expectedError': gl.NO_ERROR },
                { 'name': "GREATER", 'value': gl.GREATER, 'acceptValue': gl.GREATER, 'expectedError': gl.NO_ERROR },
                { 'name': "NOTEQUAL", 'value': gl.NOTEQUAL, 'acceptValue': gl.NOTEQUAL, 'expectedError': gl.NO_ERROR },
                { 'name': "GEQUAL", 'value': gl.GEQUAL, 'acceptValue': gl.GEQUAL, 'expectedError': gl.NO_ERROR },
                { 'name': "ALWAYS", 'value': gl.ALWAYS, 'acceptValue': gl.ALWAYS, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1 === val2; }
        }
    );
});


test("verify depthRange()", function () {
    var gl = GetCleanContext();

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.depthRange(val[0], val[1]); },
            'desc': "depthRange()"
        },
        {
            'param': { 'name': "DEPTH_RANGE", 'value': gl.DEPTH_RANGE },
            'acceptableParams':
            [
                { 'name': "[0.0, 0.9]", 'value': [0.0, 0.9], 'acceptValue': [0.0, 0.9], 'expectedError': gl.NO_ERROR },
                { 'name': "[-100, 5555]", 'value': [-100, 5555], 'acceptValue': [0.0, 1.0], 'expectedError': gl.NO_ERROR, 'desc': "value must be clamped to [0,1]" },
                { 'name': "[1.0, 0.0]", 'value': [1.0, 0.0], 'expectedError': gl.INVALID_OPERATION }
            ],
            'valueCompFunc': function (val1, val2) { return isEqual(val1[0], val2[0]) && isEqual(val1[1], val2[1]); }
        }
    );
});


test("verify clearDepth()", function () {
    var gl = GetCleanContext();

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.clearDepth(val); },
            'desc': "clearDepth()"
        },
        {
            'param': { 'name': "DEPTH_CLEAR_VALUE", 'value': gl.DEPTH_CLEAR_VALUE },
            'acceptableParams':
            [
                { 'name': "[0.0]", 'value': 0.0, 'acceptValue': 0.0, 'expectedError': gl.NO_ERROR },
                { 'name': "[-100]", 'value': -100, 'acceptValue': 0.0, 'expectedError': gl.NO_ERROR, 'desc': "value must be clamped to the range [0,1] (5.13.3)" },
                { 'name': "[1.5]", 'value': 1.5, 'acceptValue': 1.0, 'expectedError': gl.NO_ERROR, 'desc': "value must be clamped to the range [0,1] (5.13.3)" }
            ],
            'valueCompFunc': function (val1, val2) { return isEqual(val1, val2); }
        }
    );
});

test("verify depthMask()", function () {
    var gl = GetCleanContext();
       
    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.depthMask(val); },
            'desc': "depthMask()"
        },
        {
            'param': { 'name': "DEPTH_WRITEMASK", 'value': gl.DEPTH_WRITEMASK },
            'acceptableParams':
            [
                { 'name': "[true]", 'value': true, 'acceptValue': true, 'expectedError': gl.NO_ERROR },
                { 'name': "[false]", 'value': false, 'acceptValue': false, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1 == val2; }
        }
    );
});

test("verify clearStencil()", function () {
    var gl = GetCleanContext();

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.clearStencil(val); },
            'desc': "clearStencil()"
        },
        {
            'param': { 'name': "STENCIL_CLEAR_VALUE", 'value': gl.STENCIL_CLEAR_VALUE },
            'acceptableParams':
            [
                { 'name': "[455]", 'value': 455, 'acceptValue': 455, 'expectedError': gl.NO_ERROR }
            ],
            'valueCompFunc': function (val1, val2) { return val1 == val2; }
        }
    );
});


test("verify stencilFunc()", function () {
    var gl = CreateExlusiveContext({ stencil: true });

    var initFuncVal = gl.getParameter(gl.STENCIL_FUNC);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_FUNC)");
    var initRefVal = gl.getParameter(gl.STENCIL_REF);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_REF)");
    var initMaskVal = gl.getParameter(gl.STENCIL_VALUE_MASK);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_VALUE_MASK)");

    gl.stencilFunc(-1, initRefVal, initMaskVal);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilFunc() must generate INVALID_ENUM with func invalid parameter");

    var params =
    [
        { 'name': "NEVER", 'type': gl.NEVER },
        { 'name': "LESS", 'type': gl.LESS },
        { 'name': "LEQUAL", 'type': gl.LEQUAL },
        { 'name': "GREATER", 'type': gl.GREATER },
        { 'name': "GEQUAL", 'type': gl.GEQUAL },
        { 'name': "EQUAL", 'type': gl.EQUAL },
        { 'name': "NOTEQUAL", 'type': gl.NOTEQUAL },
        { 'name': "ALWAYS", 'type': gl.ALWAYS }
    ];

    for (var i = 0, l = params.length; i < l; i++) {
        gl.stencilFunc(params[i].type, initRefVal, initMaskVal);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilFunc() with func parameter [" + params[i].name + "]");
        strictEqual(gl.getParameter(gl.STENCIL_FUNC), params[i].type, "Check value returned by getParameter(STENCIL_FUNC) after call stencilFunc()");
    }

    gl.stencilFunc(initFuncVal, 1, initMaskVal);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilFunc() with ref parameter [1]");
    strictEqual(gl.getParameter(gl.STENCIL_REF), 1, "getParameter(STENCIL_REF) == 1 after call stencilFunc() with ref=1");

    gl.stencilFunc(initFuncVal, -100, initMaskVal);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilFunc() with ref parameter [1]");
    strictEqual(gl.getParameter(gl.STENCIL_REF), 0, "getParameter(STENCIL_REF) == 0, ref value [-100] must be clambed [0, 2*stencilBits-1]");

    gl.stencilFunc(initFuncVal, initRefVal, 0xF0F0F0F0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilFunc() with mask parameter [0xF0F0F0F0]");
    strictEqual(gl.getParameter(gl.STENCIL_VALUE_MASK), 0xF0F0F0F0, "getParameter(STENCIL_VALUE_MASK) == 0xF0F0F0F0 after call  stencilFunc() with mask=0xF0F0F0F0");

    CheckStencilRefRange(
        gl,
        function (gl, refValue) { gl.stencilFunc(initFuncVal, refValue, initMaskVal); },
        "stencilFunc");

    gl.stencilFunc(initFuncVal, initRefVal, initMaskVal);
    RemoveExlusiveContext();
});


test("verify func & face params in stencilFuncSeparate()", function () {
    var gl = CreateExlusiveContext({ stencil: true });

    var initFuncVal = gl.getParameter(gl.STENCIL_BACK_FUNC);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_FUNC)");
    var initRefVal = gl.getParameter(gl.STENCIL_BACK_REF);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_REF)");
    var initMaskVal = gl.getParameter(gl.STENCIL_BACK_VALUE_MASK);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_VALUE_MASK)");

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, -1, initRefVal, initMaskVal);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilFuncSeparate() must generate INVALID_ENUM with func invalid parameter");

    var params =
    [
        { 'name': "NEVER", 'type': gl.NEVER },
        { 'name': "LESS", 'type': gl.LESS },
        { 'name': "LEQUAL", 'type': gl.LEQUAL },
        { 'name': "GREATER", 'type': gl.GREATER },
        { 'name': "GEQUAL", 'type': gl.GEQUAL },
        { 'name': "EQUAL", 'type': gl.EQUAL },
        { 'name': "NOTEQUAL", 'type': gl.NOTEQUAL },
        { 'name': "ALWAYS", 'type': gl.ALWAYS }
    ];

    for (var i = 0, l = params.length; i < l; i++) {
        gl.stencilFuncSeparate(gl.FRONT_AND_BACK, params[i].type, initRefVal, initMaskVal);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilFuncSeparate() with func parameter [" + params[i].name + "]");
        strictEqual(gl.getParameter(gl.STENCIL_BACK_FUNC), params[i].type, "Check value returned by getParameter(STENCIL_BACK_FUNC) after call stencilFuncSeparate()");
        strictEqual(gl.getParameter(gl.STENCIL_FUNC), params[i].type, "Check value returned by getParameter(STENCIL_FUNC) after call stencilFuncSeparate()");
    }

    gl.stencilFuncSeparate(-1, gl.ALWAYS, initRefVal, initMaskVal);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilFuncSeparate() must generate INVALID_ENUM with face invalid parameter");

    var faceParams =
    [
        { 'name': "FRONT", 'type': gl.FRONT },
        { 'name': "BACK", 'type': gl.BACK },
        { 'name': "FRONT_AND_BACK", 'type': gl.FRONT_AND_BACK }
    ];

    for (var i = 0, l = faceParams.length; i < l; i++) {
        gl.stencilFuncSeparate(faceParams[i].type, initFuncVal, initRefVal, initMaskVal);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilFuncSeparate() with func parameter [" + faceParams[i].name + "]");
    }

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initFuncVal, initRefVal, initMaskVal);
    RemoveExlusiveContext();
});


test("verify ref param in stencilFuncSeparate()", function () {
    var gl = CreateExlusiveContext({ stencil: true });

    var initRefVal = gl.getParameter(gl.STENCIL_BACK_REF);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_REF)");
    var initFuncVal = gl.getParameter(gl.STENCIL_BACK_FUNC);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_FUNC)");
    var initMaskVal = gl.getParameter(gl.STENCIL_BACK_VALUE_MASK);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_VALUE_MASK)");

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initFuncVal, 1, initMaskVal);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilFuncSeparate() with ref parameter [1]");
    strictEqual(gl.getParameter(gl.STENCIL_BACK_REF), 1, "Check value returned by getParameter(STENCIL_BACK_REF) after call stencilFuncSeparate(FRONT_AND_BACK) with ref=1");
    strictEqual(gl.getParameter(gl.STENCIL_REF), 1, "Check value returned by getParameter(STENCIL_REF) after call stencilFuncSeparate(FRONT_AND_BACK) with ref=1");

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initFuncVal, -100, initMaskVal);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilFuncSeparate() with ref parameter [-100]");
    strictEqual(gl.getParameter(gl.STENCIL_BACK_REF), 0, "Check value returned by getParameter(STENCIL_BACK_REF), ref value [-100] must be clambed [0, 2*stencilBits-1]");
    strictEqual(gl.getParameter(gl.STENCIL_REF), 0, "Check value returned by getParameter(STENCIL_REF), ref value [-100] must be clambed [0, 2*stencilBits-1]");

    CheckStencilRefRange(
        gl,
        function (gl, refValue) { gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initFuncVal, refValue, initMaskVal); },
        "stencilFuncSeparate");

    gl.stencilFuncSeparate(gl.FRONT, initFuncVal, 10, initMaskVal);
    equal(gl.getError(), gl.INVALID_OPERATION, "stencilFuncSeparate() must generate INVALID_OPERATION if specify different ref value for front and back facing");

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initFuncVal, initRefVal, initMaskVal);

    RemoveExlusiveContext();
});

test("verify mask param in stencilFuncSeparate()", function () {
    var gl = GetCleanContext();
   
    var initMaskVal = gl.getParameter(gl.STENCIL_BACK_VALUE_MASK);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_VALUE_MASK)");
    var initFuncVal = gl.getParameter(gl.STENCIL_BACK_FUNC);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_FUNC)");
    var initRefVal = gl.getParameter(gl.STENCIL_BACK_REF);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_REF)");

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initFuncVal, initRefVal, 0xF0F0F0F0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilFuncSeparate() with mask parameter [0xF0F0F0F0]");
    strictEqual(gl.getParameter(gl.STENCIL_BACK_VALUE_MASK), 0xF0F0F0F0, "Check value returned by getParameter(STENCIL_BACK_VALUE_MASK) after call  stencilFuncSeparate(FRONT_AND_BACK) with mask=0xF0F0F0F0");
    strictEqual(gl.getParameter(gl.STENCIL_VALUE_MASK), 0xF0F0F0F0, "Check value returned by getParameter(STENCIL_VALUE_MASK) after call  stencilFuncSeparate(FRONT_AND_BACK) with mask=0xF0F0F0F0");

    gl.stencilFuncSeparate(gl.FRONT, initFuncVal, initRefVal, 0x00000000);
    equal(gl.getError(), gl.INVALID_OPERATION, "stencilFuncSeparate() must generate INVALID_OPERATION if specify different mask for front and back facing");

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initFuncVal, initRefVal, initMaskVal);
});

test("verify stencilMask()", function () {
    var gl = GetCleanContext();

    var initFrontMask = gl.getParameter(gl.STENCIL_WRITEMASK);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_WRITEMASK)");
    var initBackMask = gl.getParameter(gl.STENCIL_BACK_WRITEMASK);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_WRITEMASK)");

    gl.stencilMask(0xC0C0C0C0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilMask() with mask value [0xC0C0C0C0]");
    strictEqual(gl.getParameter(gl.STENCIL_WRITEMASK), 0xC0C0C0C0, "Check value returned by getParameter(STENCIL_BACK_VALUE_MASK) after call stencilFuncSeparate() with mask=0xC0C0C0C0");
    strictEqual(gl.getParameter(gl.STENCIL_BACK_WRITEMASK), 0xC0C0C0C0, "Check value returned by getParameter(STENCIL_BACK_VALUE_MASK) after call stencilFuncSeparate() with mask=0xC0C0C0C0");

    gl.stencilMask(initFrontMask);
});

test("verify stencilMaskSeparate()", function () {
    var gl = GetCleanContext();

    var initFrontMask = gl.getParameter(gl.STENCIL_WRITEMASK);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_WRITEMASK)");

    gl.stencilMaskSeparate(-1, initFrontMask);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilMaskSeparate() must generate INVALID_ENUM with func invalid parameter");

    var faceParams =
    [
        { 'name': "FRONT", 'type': gl.FRONT },
        { 'name': "BACK", 'type': gl.BACK },
        { 'name': "FRONT_AND_BACK", 'type': gl.FRONT_AND_BACK }
    ];

    for (var i = 0, l = faceParams.length; i < l; i++) {
        gl.stencilMaskSeparate(faceParams[i].type, initFrontMask);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilMaskSeparate() with face parameter [" + faceParams[i].name + "]");
    }

    gl.stencilMaskSeparate(gl.FRONT, 0x00000000);
    equal(gl.getError(), gl.INVALID_OPERATION, "stencilMaskSeparate() must generate INVALID_OPERATION if specify different mask value for front and back facing");
    strictEqual(gl.getParameter(gl.STENCIL_WRITEMASK), initFrontMask, "Check that stencilMaskSeparate() did not change value after INVALID_OPERATION");

    gl.stencilMaskSeparate(gl.FRONT_AND_BACK, initFrontMask);
});


test("verify sfail param in stencilOp()", function () {
    var gl = GetCleanContext();

    var initDPPassVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_PASS)");
    var initDPFailVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_FAIL)");

    var initSFailVal = gl.getParameter(gl.STENCIL_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_FAIL)");
    var initBackSFailVal = gl.getParameter(gl.STENCIL_BACK_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_FAIL)");

    gl.stencilOp(-1, initDPFailVal, initDPPassVal);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilOp() must generate INVALID_ENUM with sfail invalid parameter");

    var params =
    [
        { 'name': "KEEP", 'type': gl.KEEP },
        { 'name': "ZERO", 'type': gl.ZERO },
        { 'name': "REPLACE", 'type': gl.REPLACE },
        { 'name': "INCR", 'type': gl.INCR },
        { 'name': "INCR_WRAP", 'type': gl.INCR_WRAP },
        { 'name': "DECR", 'type': gl.DECR },
        { 'name': "DECR_WRAP", 'type': gl.DECR_WRAP },
        { 'name': "INVERT", 'type': gl.INVERT }
    ];

    for (var i = 0, l = params.length; i < l; i++) {
        gl.stencilOp(params[i].type, initDPFailVal, initDPPassVal);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilOp() with sfail parameter [" + params[i].name + "]");
        strictEqual(gl.getParameter(gl.STENCIL_FAIL), params[i].type, "Check value returned by getParameter(STENCIL_FAIL) after call stencilOp()");
        strictEqual(gl.getParameter(gl.STENCIL_BACK_FAIL), params[i].type, "Check value returned by getParameter(STENCIL_BACK_FAIL)  after call stencilOp()");
    }

    gl.stencilOp(initSFailVal, initDPFailVal, initDPPassVal);
});

test("verify dpfail param in stencilOp()", function () {
    var gl = GetCleanContext();

    var initSFailVal = gl.getParameter(gl.STENCIL_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_FAIL)");
    var initDPFailVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_FAIL)");

    var initDPPassVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_PASS)");
    var initBackDPPassVal = gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_PASS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_PASS_DEPTH_PASS)");

    gl.stencilOp(initSFailVal, -1, initDPPassVal);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilOp() must generate INVALID_ENUM with dpfail invalid parameter");

    var params =
    [
        { 'name': "KEEP", 'type': gl.KEEP },
        { 'name': "ZERO", 'type': gl.ZERO },
        { 'name': "REPLACE", 'type': gl.REPLACE },
        { 'name': "INCR", 'type': gl.INCR },
        { 'name': "INCR_WRAP", 'type': gl.INCR_WRAP },
        { 'name': "DECR", 'type': gl.DECR },
        { 'name': "DECR_WRAP", 'type': gl.DECR_WRAP },
        { 'name': "INVERT", 'type': gl.INVERT }
    ];

    for (var i = 0, l = params.length; i < l; i++) {
        gl.stencilOp(initSFailVal, params[i].type, initDPPassVal);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilOp() with dpfail parameter [" + params[i].name + "]");
        strictEqual(gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL), params[i].type, "Check value returned by getParameter(STENCIL_PASS_DEPTH_FAIL) after call stencilOp()");
        strictEqual(gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_FAIL), params[i].type, "Check value returned by getParameter(STENCIL_BACK_PASS_DEPTH_FAIL) after call stencilOp()");
    }

    gl.stencilOp(initSFailVal, initDPFailVal, initDPPassVal);
});

test("verify dppass param in stencilOp()", function () {
    var gl = GetCleanContext();

    var initSFailVal = gl.getParameter(gl.STENCIL_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_FAIL)");
    var initDPPassVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_PASS)");

    var initDPFailVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_FAIL)");
    var initBackDPFailVal = gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_BACK_PASS_DEPTH_FAIL)");

    gl.stencilOp(initSFailVal, initDPFailVal, -1);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilOp() must generate INVALID_ENUM with dppass invalid parameter");

    var params =
    [
        { 'name': "KEEP", 'type': gl.KEEP },
        { 'name': "ZERO", 'type': gl.ZERO },
        { 'name': "REPLACE", 'type': gl.REPLACE },
        { 'name': "INCR", 'type': gl.INCR },
        { 'name': "INCR_WRAP", 'type': gl.INCR_WRAP },
        { 'name': "DECR", 'type': gl.DECR },
        { 'name': "DECR_WRAP", 'type': gl.DECR_WRAP },
        { 'name': "INVERT", 'type': gl.INVERT }
    ];

    for (var i = 0, l = params.length; i < l; i++) {
        gl.stencilOp(initSFailVal, initDPFailVal, params[i].type);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilOp() with dppass parameter [" + params[i].name + "]");
        strictEqual(gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS), params[i].type, "Check value returned by getParameter(STENCIL_PASS_DEPTH_PASS) after call stencilOp()");
        strictEqual(gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_PASS), params[i].type, "Check value returned by getParameter(STENCIL_BACK_PASS_DEPTH_PASS) after call stencilOp()");
    }

    gl.stencilOp(initSFailVal, initDPFailVal, initDPPassVal);
});

test("verify stencilOpSeparate()", function () {
    var gl = GetCleanContext();

    var initSFailVal = gl.getParameter(gl.STENCIL_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_FAIL)");
    var initDPPassVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_PASS)");
    var initDPFailVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_FAIL)");

    gl.stencilOpSeparate(-1, initSFailVal, initDPFailVal, initDPPassVal);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilOpSeparate() must generate INVALID_ENUM with invalid face parameter");

    gl.stencilOpSeparate(gl.FRONT, gl.REPLACE, gl.REPLACE, gl.REPLACE);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilOpSeparate([FRONT, REPLACE, REPLACE, REPLACE])");

    var faceParams =
    [
        { 'name': "FRONT", 'type': gl.FRONT },
        { 'name': "BACK", 'type': gl.BACK },
        { 'name': "FRONT_AND_BACK", 'type': gl.FRONT_AND_BACK }
    ];

    for (var i = 0, l = faceParams.length; i < l; i++) {
        gl.stencilOpSeparate(faceParams[i].type, initSFailVal, initDPFailVal, initDPPassVal);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilOpSeparate() with face parameter [" + faceParams[i].name + "]");
    }
});


test("verify sfail param in stencilOpSeparate()", function () {
    var gl = GetCleanContext();

    var initSFailVal = gl.getParameter(gl.STENCIL_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_FAIL)");
    var initDPPassVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_PASS)");
    var initDPFailVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_FAIL)");

    gl.stencilOpSeparate(gl.FRONT_AND_BACK, -1, initDPFailVal, initDPPassVal);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilOpSeparate() must generate INVALID_ENUM with invalid sfail parameter");

    var params =
    [
        { 'name': "KEEP", 'type': gl.KEEP },
        { 'name': "ZERO", 'type': gl.ZERO },
        { 'name': "REPLACE", 'type': gl.REPLACE },
        { 'name': "INCR", 'type': gl.INCR },
        { 'name': "INCR_WRAP", 'type': gl.INCR_WRAP },
        { 'name': "DECR", 'type': gl.DECR },
        { 'name': "DECR_WRAP", 'type': gl.DECR_WRAP },
        { 'name': "INVERT", 'type': gl.INVERT }
    ];

    for (var i = 0, l = params.length; i < l; i++) {
        gl.stencilOpSeparate(gl.FRONT_AND_BACK, params[i].type, initDPFailVal, initDPPassVal);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilOpSeparate() with sfail parameter [" + params[i].name + "]");
        strictEqual(gl.getParameter(gl.STENCIL_BACK_FAIL), params[i].type, "Check value returned by getParameter(STENCIL_BACK_FAIL) after call stencilOpSeparate()");
        strictEqual(gl.getParameter(gl.STENCIL_FAIL), params[i].type, "Check value returned by getParameter(STENCIL_FAIL) after call stencilOpSeparate()");
    }

    gl.stencilOpSeparate(gl.FRONT_AND_BACK, initSFailVal, initDPFailVal, initDPPassVal);
});

test("verify dpfail param in stencilOpSeparate()", function () {
    var gl = GetCleanContext();

    var initSFailVal = gl.getParameter(gl.STENCIL_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_FAIL)");
    var initDPPassVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_PASS)");
    var initDPFailVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_FAIL)");

    gl.stencilOpSeparate(gl.FRONT_AND_BACK, initSFailVal, -1, initDPPassVal);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilOpSeparate() must generate INVALID_ENUM with invalid dpfail parameter");

    var params =
    [
        { 'name': "KEEP", 'type': gl.KEEP },
        { 'name': "ZERO", 'type': gl.ZERO },
        { 'name': "REPLACE", 'type': gl.REPLACE },
        { 'name': "INCR", 'type': gl.INCR },
        { 'name': "INCR_WRAP", 'type': gl.INCR_WRAP },
        { 'name': "DECR", 'type': gl.DECR },
        { 'name': "DECR_WRAP", 'type': gl.DECR_WRAP },
        { 'name': "INVERT", 'type': gl.INVERT }
    ];

    for (var i = 0, l = params.length; i < l; i++) {
        gl.stencilOpSeparate(gl.FRONT_AND_BACK, initSFailVal, params[i].type, initDPPassVal);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilOpSeparate() with dpfail parameter [" + params[i].name + "]");
        strictEqual(gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_FAIL), params[i].type, "Check value returned by getParameter(STENCIL_BACK_PASS_DEPTH_FAIL) after call stencilOpSeparate()");
        strictEqual(gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL), params[i].type, "Check value returned by getParameter(STENCIL_PASS_DEPTH_FAIL) after call stencilOpSeparate()");
    }
});

test("verify dppass param in stencilOpSeparate()", function () {
    var gl = GetCleanContext();

    var initSFailVal = gl.getParameter(gl.STENCIL_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_FAIL)");
    var initDPPassVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_PASS)");
    var initDPFailVal = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(STENCIL_PASS_DEPTH_FAIL)");

    gl.stencilOpSeparate(gl.FRONT_AND_BACK, initSFailVal, initDPFailVal, -1);
    equal(gl.getError(), gl.INVALID_ENUM, "stencilOpSeparate() must generate INVALID_ENUM with invalid dppass parameter");

    var params =
    [
        { 'name': "KEEP", 'type': gl.KEEP },
        { 'name': "ZERO", 'type': gl.ZERO },
        { 'name': "REPLACE", 'type': gl.REPLACE },
        { 'name': "INCR", 'type': gl.INCR },
        { 'name': "INCR_WRAP", 'type': gl.INCR_WRAP },
        { 'name': "DECR", 'type': gl.DECR },
        { 'name': "DECR_WRAP", 'type': gl.DECR_WRAP },
        { 'name': "INVERT", 'type': gl.INVERT }
    ];

    for (var i = 0, l = params.length; i < l; i++) {
        gl.stencilOpSeparate(gl.FRONT_AND_BACK, initSFailVal, initDPFailVal, params[i].type);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call stencilOpSeparate() with dppass parameter [" + params[i].name + "]");
        strictEqual(gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_PASS), params[i].type, "Check value returned by getParameter(STENCIL_BACK_PASS_DEPTH_PASS) after call stencilOpSeparate()");
        strictEqual(gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS), params[i].type, "Check value returned by getParameter(STENCIL_PASS_DEPTH_PASS) after call stencilOpSeparate()");
    }
});

test("verify scissor()", function () {
    CreateExlusiveContext();
    var gl = GetExlusiveContext();

    var isEnabled = gl.getParameter(gl.SCISSOR_TEST);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(SCISSOR_TEST)");
    strictEqual(isEnabled, false, "Check init value for parameter [SCISSOR_TEST]");

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.scissor(val[0], val[1], val[2], val[3]); },
            'desc': "scissor()"
        },
        {
            'param': { 'name': "SCISSOR_BOX", 'value': gl.SCISSOR_BOX },
            'acceptableParams':
            [
                { 'name': "[0, 0, 0, 0]", 'value': [0, 0, 0, 0], 'acceptValue': [0, 0, 0, 0], 'expectedError': gl.NO_ERROR },
                { 'name': "[0, 0, -100, 100]", 'value': [0, 0, -100, 100], 'expectedError': gl.INVALID_VALUE, 'desc': "width is negative" },
                { 'name': "[0, 0, 100, -100]", 'value': [0, 0, 100, -100], 'expectedError': gl.INVALID_VALUE, 'desc': "height is negative" }
            ],
            'valueCompFunc': function (val1, val2) { return val1[0] == val2[0] && val1[1] == val2[1] && val1[2] == val2[2] && val1[3] == val2[3]; }
        }
    );

    RemoveExlusiveContext();
});

test("verify viewport()", function () {

    var gl = CreateExlusiveContext();

    var maxDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(MAX_VIEWPORT_DIMS)");

    CheckParameterFunc(
        gl,
        {
            'run': function (gl, val) { gl.viewport(val[0], val[1], val[2], val[3]); },
            'desc': "viewport()"
        },
        {
            'param': { 'name': "VIEWPORT", 'value': gl.VIEWPORT },
            'acceptableParams':
            [
                { 'name': "[0, 0, 0, 0]", 'value': [0, 0, 0, 0], 'acceptValue': [0, 0, 0, 0], 'expectedError': gl.NO_ERROR },
                { 'name': "[0, 0, -100, 100]", 'value': [0, 0, -100, 100], 'expectedError': gl.INVALID_VALUE, 'desc': "width is negative" },
                { 'name': "[0, 0, 100, -100]", 'value': [0, 0, 100, -100], 'expectedError': gl.INVALID_VALUE, 'desc': "height is negative" },
                { 'name': "[0, 0, 100, -100]", 'value': [0, 0, maxDims[0] * 2, 100], 'acceptValue': [0, 0, maxDims[0], 100], 'expectedError': gl.NO_ERROR, 'desc': "width is clamped to maximum supported width [MAX_VIEWPORT_DIMS]" },
                { 'name': "[0, 0, 100, -100]", 'value': [0, 0, 100, maxDims[1] * 2], 'acceptValue': [0, 0, 100, maxDims[1]], 'expectedError': gl.NO_ERROR, 'desc': "height is clamped to maximum supported height [MAX_VIEWPORT_DIMS]" }
            ],
            'valueCompFunc': function (val1, val2) { return val1[0] == val2[0] && val1[1] == val2[1] && val1[2] == val2[2] && val1[3] == val2[3]; }
        }
    );

    var canvas = GetWebGLParentExlusiveContext();

    canvas.width = gl.canvas.width * 10;
    canvas.height = gl.canvas.height * 10;
    var curViewport = gl.getParameter(gl.VIEWPORT);
    equal(curViewport[2], gl.canvas.width, "Viewport width shall not changed after resizing canvas width");
    equal(curViewport[3], gl.canvas.height, "Viewport height shall not changed after resizing canvas height");

    RemoveExlusiveContext();
});


test("verify function as property", function () {
    var gl = GetCleanContext();
    var func = gl.viewport;
    //func.call(gl, 0, 0, 100, 100);

    ok(true, "function as property");
});

test("verify function redefinition", function () {
    var gl = GetCleanContext();
    gl.viewport = function () { return -1; }

    ok(gl.viewport(1, 1, 1, 1) === -1, "function redefinition")
});