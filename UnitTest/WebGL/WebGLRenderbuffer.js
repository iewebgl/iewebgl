
function GetRedSize(gl, format) {
    switch (format) {
        case gl.RGBA4: return 4;
        case gl.RGB5_A1: return 5;
        case gl.RGB565: return 5;
    }
    return 0;
}

function GetGreenSize(gl, format) {
    switch (format) {
        case gl.RGBA4: return 4;
        case gl.RGB5_A1: return 5;
        case gl.RGB565: return 6;
    }
    return 0;
}

function GetBlueSize(gl, format) {
    switch (format) {
        case gl.RGBA4: return 4;
        case gl.RGB5_A1: return 5;
        case gl.RGB565: return 5;
    }
    return 0;
}

function GetAlphaSize(gl, format) {
    switch (format) {
        case gl.RGBA4: return 4;
        case gl.RGB5_A1: return 1;
    }
    return 0;
}

function GetDepthSize(gl, format) {
    switch (format) {
        case gl.DEPTH_COMPONENT16: return 16;
        case gl.DEPTH_STENCIL: return 24;
    }
    return 0;
}

function GetStencilSize(gl, format) {
    switch (format) {
        case gl.STENCIL_INDEX8: return 8;
        case gl.DEPTH_STENCIL: return 8;
    }
    return 0;

}

function FormatToStr(gl, format) {
    switch (format) {
        case gl.RGBA4: return "RGBA4";
        case gl.RGB5_A1: return "RGB5_A1";
        case gl.RGB565: return "RGB565";
        case gl.STENCIL_INDEX8: return "STENCIL_INDEX8";
        case gl.DEPTH_COMPONENT16: return "DEPTH_COMPONENT16";
        case gl.DEPTH_STENCIL: return "DEPTH_STENCIL";
    }
    return "unknown format";
}

function CheckRenderbuffer(gl, format, width, height) {
    var rb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);

    var formatStr = FormatToStr(gl, format);

    strictEqual(gl.isRenderbuffer(rb), true, "isRenderbuffer returned true for valid render buffer [" + formatStr + "]");
    equal(gl.getError(), gl.NO_ERROR, "glGetError() == NO_ERROR after call isRenderbuffer() [" + formatStr + "]");

    equal(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_WIDTH), width,
        "getRenderbufferParameter(RENDERBUFFER_WIDTH) is equal to bound renderbuffer's width [" + formatStr + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getRenderbufferParameter(RENDERBUFFER_WIDTH) must not generate error");

    equal(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_HEIGHT), height,
        "getRenderbufferParameter(RENDERBUFFER_HEIGHT) is equal to bound renderbuffer's height [" + formatStr + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getRenderbufferParameter(RENDERBUFFER_HEIGHT) must not generate error [" + formatStr + "]");

    strictEqual(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_INTERNAL_FORMAT), format,
        "getRenderbufferParameter(RENDERBUFFER_INTERNAL_FORMAT) is equal to bound renderbuffer's format [" + formatStr + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getRenderbufferParameter(RENDERBUFFER_INTERNAL_FORMAT) must not generate error [" + formatStr + "]");

    strictEqual(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_RED_SIZE), GetRedSize(gl, format),
        "getRenderbufferParameter(RENDERBUFFER_RED_SIZE) is equal to bound renderbuffer's red component size [" + formatStr + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getRenderbufferParameter(RENDERBUFFER_RED_SIZE) must not generate error [" + formatStr + "]");

    strictEqual(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_GREEN_SIZE), GetGreenSize(gl, format),
        "getRenderbufferParameter(RENDERBUFFER_GREEN_SIZE) is equal to bound renderbuffer's green component size [" + formatStr + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getRenderbufferParameter(RENDERBUFFER_GREEN_SIZE) must not generate error [" + formatStr + "]");

    strictEqual(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_BLUE_SIZE), GetBlueSize(gl, format),
        "getRenderbufferParameter(RENDERBUFFER_BLUE_SIZE) is equal to bound renderbuffer's blue component size [" + formatStr + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getRenderbufferParameter(RENDERBUFFER_BLUE_SIZE) must not generate error [" + formatStr + "]");

    strictEqual(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_ALPHA_SIZE), GetAlphaSize(gl, format),
        "getRenderbufferParameter(RENDERBUFFER_ALPHA_SIZE) is equal to bound renderbuffer's alpha component size [" + formatStr + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getRenderbufferParameter(RENDERBUFFER_ALPHA_SIZE) must not generate error [" + formatStr + "]");

    strictEqual(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_DEPTH_SIZE), GetDepthSize(gl, format),
        "getRenderbufferParameter(RENDERBUFFER_DEPTH_SIZE) is equal to bound renderbuffer's depth size [" + formatStr + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getRenderbufferParameter(RENDERBUFFER_DEPTH_SIZE) must not generate error [" + formatStr + "]");

    strictEqual(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_STENCIL_SIZE), GetStencilSize(gl, format),
        "getRenderbufferParameter(RENDERBUFFER_STENCIL_SIZE) is equal to bound renderbuffer's stencil size [" + formatStr + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getRenderbufferParameter(RENDERBUFFER_STENCIL_SIZE) must not generate error [" + formatStr + "]");

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    equal(gl.getError(), gl.NO_ERROR, "bind null-renderbuffer must not generate error [" + formatStr + "]");

    gl.deleteRenderbuffer(rb);
    equal(gl.getError(), gl.NO_ERROR, "deleteRenderbuffer() must not generate error [" + formatStr + "]");

    return true;
}

//////////////////////////////////////////////////////////////////////////
module("WebGLRenderbuffer");

test("verify createRenderbuffer() and deleteRenderbuffer()", function () {
    var gl = GetCleanContext();

    var rb = gl.createRenderbuffer();
    equal(gl.getError(), gl.NO_ERROR, "createRenderbuffer() must not generate error");
    ok(rb != null, "createRenderbuffer() returned not null object");
    ok(rb != undefined, "createRenderbuffer() returned not undefined object");
    ok(rb instanceof WebGLRenderbuffer, "createRenderbuffer() returned value instanceof WebGLRenderbuffer");

    gl.deleteRenderbuffer(rb);
    equal(gl.getError(), gl.NO_ERROR, "deleteRenderbuffer() must not generate error");

    // 5.13.7 Renderbuffer objects https://www.khronos.org/registry/webgl/specs/latest/
    // If the renderbuffer has already been deleted the call has no effect.
    gl.deleteRenderbuffer(rb);
    equal(gl.getError(), gl.NO_ERROR, "deleteRenderbuffer(already deleted) must not generate error");

    gl.deleteRenderbuffer(null);
    equal(gl.getError(), gl.NO_ERROR, "deleteRenderbuffer(null) must not generate error");

    gl.deleteRenderbuffer(undefined);
    equal(gl.getError(), gl.NO_ERROR, "deleteRenderbuffer(undefined) must not generate error");

    raises(function () { gl.deleteRenderbuffer(0); }, "deleteRenderbuffer(0) throws exception with wrong type");
});

test("verify bindRenderbuffer()", function () {
    var gl = GetCleanContext();

    var rb = gl.createRenderbuffer();

    gl.bindRenderbuffer(0, undefined);
    equal(gl.getError(), gl.INVALID_ENUM, "bindRenderbuffer(invalid target) must generate error INVALID_ENUM error");

    gl.bindRenderbuffer(0, rb);
    equal(gl.getError(), gl.INVALID_ENUM, "bindRenderbuffer(invalid target) must generate INVALID_ENUM error");

    gl.bindRenderbuffer(0, null);
    equal(gl.getError(), gl.INVALID_ENUM, "bindRenderbuffer(invalid target) must generate INVALID_ENUM error");

    gl.bindRenderbuffer(gl.RENDERBUFFER, undefined);
    equal(gl.getError(), gl.NO_ERROR, "bindRenderbuffer(undefined) must not generate error");

    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    equal(gl.getError(), gl.NO_ERROR, "bindRenderbuffer() must not generate error");

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    equal(gl.getError(), gl.NO_ERROR, "bindRenderbuffer(null) must not generate error");

    raises(function () { gl.bindRenderbuffer(gl.RENDERBUFFER, 0); }, "bindRenderbuffer(0) throws exception with wrong type");

    gl.deleteRenderbuffer(rb);
});

test("getting bounded renderbuffer", function () {
    var gl = GetCleanContext();

    var rb = gl.getParameter(gl.RENDERBUFFER_BINDING);
    ok(rb == null, "getParameter(RENDERBUFFER_BINDING) returned null for zero-bound");
    equal(gl.getError(), gl.NO_ERROR, "getParameter(RENDERBUFFER_BINDING) must not generate error for zero-bound");

    rb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    var rbBound = gl.getParameter(gl.RENDERBUFFER_BINDING);
    ok(rb == rbBound, "getParameter(RENDERBUFFER_BINDING) returned right renderbuffer");
    equal(gl.getError(), gl.NO_ERROR, "getParameter(RENDERBUFFER_BINDING) must not generate error");
});

test("verify deleting bounded renderbuffer", function () {
    var gl = GetCleanContext();

    var rb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);

    gl.deleteRenderbuffer(rb);

    var rbBound = gl.getParameter(gl.RENDERBUFFER_BINDING);
    ok(rbBound == null, "deleteRenderbuffer(currently bound) restored zero-renderbuffer");
    equal(gl.getError(), gl.NO_ERROR, "deleteRenderbuffer(currently bound) must not generate error");
});

test("verify isRenderbuffer()", function () {
    var gl = GetCleanContext();

    /* waiting mozila firefox fix
    * see https://bitbucket.org/MOD/iewebgl/issue/5/bug-in-isxxx-functions-mozila-firefox-only
    */
    strictEqual(gl.isRenderbuffer(undefined), false, "isRenderbuffer(undefined) returns false");
    equal(gl.getError(), gl.NO_ERROR, "isRenderbuffer(undefined) must not generate error");

    strictEqual(gl.isRenderbuffer(null), false, "isRenderbuffer(null) returns false");
    equal(gl.getError(), gl.NO_ERROR, "isRenderbuffer(null) must not generate error");
    /* --------------------------------------------------------------------------------------- */

    var rb = gl.createRenderbuffer();
    strictEqual(gl.isRenderbuffer(rb), false, "isRenderbuffer(not bound) returns false");
    equal(gl.getError(), gl.NO_ERROR, "isRenderbuffer(not bound) must not generate error");

    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    strictEqual(gl.isRenderbuffer(rb), true, "isRenderbuffer() returns true");
    equal(gl.getError(), gl.NO_ERROR, "isRenderbuffer() must not generate error");

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.deleteRenderbuffer(rb);
    strictEqual(gl.isRenderbuffer(rb), false, "isRenderbuffer(deleted) returns false");
    equal(gl.getError(), gl.NO_ERROR, "isRenderbuffer(deleted) must not generate error");

    raises(function () { gl.isRenderbuffer(0); }, "isRenderbuffer(0) throws exception with wrong type");
});

test("verify renderbufferStorage()", function () {
    var gl = GetCleanContext();

    var format = gl.RGBA4;
    var width = 256;
    var height = 128;

    // GL_INVALID_OPERATION is generated if the reserved renderbuffer object name 0 is bound.
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
    equal(gl.getError(), gl.INVALID_OPERATION, "renderbufferStorage() must generate INVALID_OPERATION error for zero-bound");

    // GL_INVALID_ENUM is generated if target is not GL_RENDERBUFFER.
    var rb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    gl.renderbufferStorage(0, format, width, height);
    equal(gl.getError(), gl.INVALID_ENUM, "renderbufferStorage(invalid target) must generate INVALID_ENUM error");

    // GL_INVALID_ENUM is generated if internalformat is not an accepted format.
    gl.renderbufferStorage(gl.RENDERBUFFER, 0, width, height);
    equal(gl.getError(), gl.INVALID_ENUM, "renderbufferStorage(invalid format) must generate INVALID_ENUM error");

    // GL_INVALID_VALUE is generated if width or height is less than zero or greater than GL_MAX_RENDERBUFFER_SIZE.
    var maxSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(MAX_RENDERBUFFER_SIZE) generates no errors");
    
    var negativSize = -1;

    var sizes = [
            { w: negativSize, h: height }, { w: width, h: negativSize }, { w: negativSize, h: negativSize },
            { w: maxSize + 1, h: height }, { w: width, h: maxSize + 1 }, { w: maxSize + 1, h: maxSize + 1 }
        ];

    for (var i = 0, l = sizes.length; i < l; i++) {
        gl.renderbufferStorage(gl.RENDERBUFFER, format, sizes[i].w, sizes[i].h);
        equal(gl.getError(), gl.INVALID_VALUE, "renderbufferStorage(w:" + sizes[i].w + ", h:" + sizes[i].h + ") must generate INVALID_VALUE error with invalid width/height");
    }

    gl.deleteRenderbuffer(rb);
});

test("verify getRenderbufferParameter()", function () {
    var gl = GetCleanContext();

    var rb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);

    var paramNames =
        [
            { 'name': "RENDERBUFFER_WIDTH", 'value': gl.RENDERBUFFER_WIDTH },
            { 'name': "RENDERBUFFER_HEIGHT", 'value': gl.RENDERBUFFER_HEIGHT },
            { 'name': "RENDERBUFFER_INTERNAL_FORMAT", 'value': gl.RENDERBUFFER_INTERNAL_FORMAT },
            { 'name': "RENDERBUFFER_RED_SIZE", 'value': gl.RENDERBUFFER_RED_SIZE },
            { 'name': "RENDERBUFFER_GREEN_SIZE", 'value': gl.RENDERBUFFER_GREEN_SIZE },
            { 'name': "RENDERBUFFER_BLUE_SIZE", 'value': gl.RENDERBUFFER_BLUE_SIZE },
            { 'name': "RENDERBUFFER_ALPHA_SIZE", 'value': gl.RENDERBUFFER_ALPHA_SIZE },
            { 'name': "RENDERBUFFER_DEPTH_SIZE", 'value': gl.RENDERBUFFER_DEPTH_SIZE },
            { 'name': "RENDERBUFFER_STENCIL_SIZE", 'value': gl.RENDERBUFFER_STENCIL_SIZE }
        ];

    // GL_INVALID_ENUM is generated if target is not GL_RENDERBUFFER.
    for (var i = 0, l = paramNames.length; i < l; i++) {
        gl.getRenderbufferParameter(0, paramNames[i].value);
        equal(gl.getError(), gl.INVALID_ENUM, "getRenderbufferParameter(" + paramNames[i].name + ") must generate INVALID_ENUM error with invalid target");
    }

    // GL_INVALID_ENUM is generated if pname is not GL_RENDERBUFFER_WIDTH, GL_RENDERBUFFER_HEIGHT, 
    // GL_RENDERBUFFER_INTERNAL_FORMAT, GL_RENDERBUFFER_RED_SIZE, GL_RENDERBUFFER_GREEN_SIZE, 
    // GL_RENDERBUFFER_BLUE_SIZE, GL_RENDERBUFFER_ALPHA_SIZE, GL_RENDERBUFFER_DEPTH_SIZE, or GL_RENDERBUFFER_STENCIL_SIZE.
    gl.getRenderbufferParameter(gl.RENDERBUFFER, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "getRenderbufferParameter(invalid pname) must generate INVALID_ENUM error");

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.deleteRenderbuffer(rb);

    // GL_INVALID_OPERATION is generated if the reserved renderbuffer object name 0 is bound.
    for (var i = 0, l = paramNames.length; i < l; i++) {
        gl.getRenderbufferParameter(gl.RENDERBUFFER, paramNames[i].value);
        equal(gl.getError(), gl.INVALID_OPERATION, "getRenderbufferParameter(" + paramNames[i].name + ") must generate INVALID_OPERATION error with zero bound");
    }
});

test("verify supported formats", function () {
    var gl = GetCleanContext();

    var widths = [128, 128, 256];
    var heights = [128, 256, 128];
    var formats = [gl.RGBA4, gl.RGB5_A1, gl.RGB565, gl.DEPTH_COMPONENT16, gl.STENCIL_INDEX8, gl.DEPTH_STENCIL];

    for (var iW = 0, lW = widths.length; iW < lW; iW++) {
        for (var iH = 0, lH = heights.length; iH < lH; iH++) {
            for (var iF = 0, lF = formats.length; iF < lF; iF++) {
                if (!CheckRenderbuffer(gl, formats[iF], widths[iW], heights[iH])) return false;
            }
        }
    }
});