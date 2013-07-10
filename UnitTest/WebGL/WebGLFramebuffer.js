
function TexFromatToStr(gl, format) {
    switch (format) {
        case gl.ALPHA: return "ALPHA";
        case gl.LUMINANCE: return "LUMINANCE";
        case gl.LUMINANCE_ALPHA: return "LUMINANCE_ALPHA";
        case gl.RGB: return "RGB";
        case gl.RGBA: return "RGBA";
    }

    return "unknown texture format";
}

function FramebufferAttachmentToStr(gl, attachment) {
    switch (attachment) {
        case gl.COLOR_ATTACHMENT0: return "COLOR_ATTACHMENT0";
        case gl.DEPTH_ATTACHMENT: return "DEPTH_ATTACHMENT";
        case gl.STENCIL_ATTACHMENT: return "STENCIL_ATTACHMENT";
        case gl.DEPTH_STENCIL_ATTACHMENT: return "DEPTH_STENCIL_ATTACHMENT";
    }

    return "unknown framebuffer attachment";
}

function TexTargetToStr(gl, target) {
    switch (target) {
        case gl.TEXTURE_2D: return "TEXTURE_2D";
        case gl.TEXTURE_CUBE_MAP_POSITIVE_X: return "TEXTURE_CUBE_MAP_POSITIVE_X";
        case gl.TEXTURE_CUBE_MAP_NEGATIVE_X: return "TEXTURE_CUBE_MAP_NEGATIVE_X";
        case gl.TEXTURE_CUBE_MAP_POSITIVE_Y: return "TEXTURE_CUBE_MAP_POSITIVE_Y";
        case gl.TEXTURE_CUBE_MAP_NEGATIVE_Y: return "TEXTURE_CUBE_MAP_NEGATIVE_Y";
        case gl.TEXTURE_CUBE_MAP_POSITIVE_Z: return "TEXTURE_CUBE_MAP_POSITIVE_Z";
        case gl.TEXTURE_CUBE_MAP_NEGATIVE_Z: return "TEXTURE_CUBE_MAP_NEGATIVE_Z";
    }
    return "unknown texure target";
}

function CreateRenderbuffer(gl, format, width, height) {

    var rb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
    return rb;
}

function CheckRenderbufferAttachment(gl, attachment, renderbuffer) {

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachment, gl.RENDERBUFFER, renderbuffer);
    equal(gl.getError(), gl.NO_ERROR, "framebufferRenderbuffer() must not generate error [" + FramebufferAttachmentToStr(gl, attachment) + "]");

    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE,
        "checkFramebufferStatus() == FRAMEBUFFER_COMPLETE [" + FramebufferAttachmentToStr(gl, attachment) + "]");

    strictEqual(gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE), 
        gl.RENDERBUFFER, "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE) returned RENDERBUFFER [" + FramebufferAttachmentToStr(gl, attachment) + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE) must not generate error [" + FramebufferAttachmentToStr(gl, attachment) + "]");

    ok(gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME) == renderbuffer,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_OBJECT_NAME) returned renderbuffer object [" + FramebufferAttachmentToStr(gl, attachment) + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_OBJECT_NAME) must not generate error [" + FramebufferAttachmentToStr(gl, attachment) + "]");

    // GL_INVALID_ENUM is generated if the attached object at the named attachment point is GL_RENDERBUFFER and pname 
    // is not GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE or GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME.
    gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment, gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL);
    equal(gl.getError(), gl.INVALID_ENUM,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL) must generate INVALID_ENUM error [" + FramebufferAttachmentToStr(gl, attachment) + "]");

    gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment, gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE);
    equal(gl.getError(), gl.INVALID_ENUM,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE) must generate INVALID_ENUM error [" + FramebufferAttachmentToStr(gl, attachment) + "]");

    gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment, 0);
    equal(gl.getError(), gl.INVALID_ENUM,
        "getFramebufferAttachmentParameter(invalid pname) must generate INVALID_ENUM error [" + FramebufferAttachmentToStr(gl, attachment) + "]");

    return true;
}

function fillTexture(gl, target, width, height, format, color) {
    var pixels = new Uint8Array(width * height * 3);
    for (var i = 0; i < pixels.length; i += 3) {
        pixels[i] = color.r;
        pixels[i + 1] = color.g;
        pixels[i + 2] = color.b;
    }

    if (target == gl.TEXTURE_2D) {
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, pixels);
    }
    else {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, pixels);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, pixels);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, pixels);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, pixels);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, pixels);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, pixels);
    }
}


function CheckTextureAttachment(gl, texture, texTarget, desc) {

    var attachment = gl.COLOR_ATTACHMENT0;
    var level = 0;

    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, texTarget, texture, level);
    equal(gl.getError(), gl.NO_ERROR, "framebufferTexture2D() must not generate error [" + desc + "]");

    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE,
        "checkFramebufferStatus() == FRAMEBUFFER_COMPLETE [" + desc + "]");

    strictEqual(gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment,
        gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE), gl.TEXTURE,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE) returned TEXTURE [" + desc + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE) must not generate error [" + desc + "]");

    ok(gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment,
        gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME) == texture,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_OBJECT_NAME) returned texture object [" + desc + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_OBJECT_NAME) must not generate error [" + desc + "]");

    strictEqual(gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment,
        gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL), level,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL) returned valid level [" + desc + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL) must not generate error [" + desc + "]");

    strictEqual(gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment,
        gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE), texTarget == gl.TEXTURE_2D ? 0 : texTarget,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE) returned invalid value [" + desc + "]");
    equal(gl.getError(), gl.NO_ERROR,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE) must not generate error [" + desc + "]");

    // GL_INVALID_ENUM is generated if the attached object at the named attachment point is GL_TEXTURE and pname 
    // is not GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE, GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME, 
    // GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL, or GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE.
    gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment, 0);
    equal(gl.getError(), gl.INVALID_ENUM,
        "getFramebufferAttachmentParameter(invalid pname) must generate INVALID_ENUM error [" + desc + "]");

    return true;
}

//////////////////////////////////////////////////////////////////////////

function CheckUnsupportedAttachmentCombination(gl, format1, attachmentFormat1, format2, attachmentFormat2, desc) {

    var rb1 = CreateRenderbuffer(gl, format1, 64, 64);
    var rb2 = CreateRenderbuffer(gl, format2, 64, 64);

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachmentFormat1, gl.RENDERBUFFER, rb1);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachmentFormat2, gl.RENDERBUFFER, rb2);

    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_UNSUPPORTED,
        "checkFramebufferStatus() must return FRAMEBUFFER_UNSUPPORTED for attachment combinaton: " + desc);

    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT || gl.STENCIL_BUFFER_BIT);
    equal(gl.getError(), gl.INVALID_FRAMEBUFFER_OPERATION, "clear() must generate INVALID_FRAMEBUFFER_OPERATION");

    gl.deleteFramebuffer(fb);

    gl.deleteRenderbuffer(rb2);
    gl.deleteRenderbuffer(rb1);
}

function CheckZeroSizeAttachment(gl) {

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    var tex = CreateTexture2D(gl, gl.RGB, 0, 64);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    state = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");
    strictEqual(state, gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT if width = 0");
    gl.deleteTexture(tex);

    var tex = CreateTexture2D(gl, gl.RGB, 64, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    state = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");
    strictEqual(state, gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT if height = 0");
    gl.deleteTexture(tex);

    gl.deleteFramebuffer(fb);
}

function CheckIncomplitableColorAttachmentFormats(gl) {

    var rbColor = CreateRenderbuffer(gl, gl.RGBA4, 64, 64);
    var rbDEPTH_COMPONENT16 = CreateRenderbuffer(gl, gl.DEPTH_COMPONENT16, 64, 64);
    var rbSTENCIL_INDEX8 = CreateRenderbuffer(gl, gl.STENCIL_INDEX8, 64, 64);
    var rbDEPTH_STENCIL = CreateRenderbuffer(gl, gl.DEPTH_STENCIL, 64, 64);

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbColor);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbDEPTH_COMPONENT16);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbSTENCIL_INDEX8);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbDEPTH_STENCIL);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.deleteFramebuffer(fb);

    gl.deleteRenderbuffer(rbColor);
    gl.deleteRenderbuffer(rbDEPTH_COMPONENT16);
    gl.deleteRenderbuffer(rbSTENCIL_INDEX8);
    gl.deleteRenderbuffer(rbDEPTH_STENCIL);
}

function CheckIncomplitableDepthAttachmentFormats(gl) {

    var rbColor = CreateRenderbuffer(gl, gl.RGBA4, 64, 64);
    var rbDepth = CreateRenderbuffer(gl, gl.DEPTH_COMPONENT16, 64, 64);
    var rbRGBA4 = CreateRenderbuffer(gl, gl.RGBA4, 64, 64);
    var rbRGB5_A1 = CreateRenderbuffer(gl, gl.RGB5_A1, 64, 64);
    var rbRGB565 = CreateRenderbuffer(gl, gl.RGB565, 64, 64);

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbColor);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbDepth);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbRGBA4);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbRGB5_A1);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbRGB565);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.deleteFramebuffer(fb);

    gl.deleteRenderbuffer(rbColor);
    gl.deleteRenderbuffer(rbDepth);
    gl.deleteRenderbuffer(rbRGBA4);
    gl.deleteRenderbuffer(rbRGB5_A1);
    gl.deleteRenderbuffer(rbRGB565);
}

function CheckIncomplitableDepthStencilAttachmentFormats(gl) {

    var rbColor = CreateRenderbuffer(gl, gl.RGBA4, 64, 64);
    var rbDepthStencil = CreateRenderbuffer(gl, gl.DEPTH_STENCIL, 64, 64);
    var rbRGBA4 = CreateRenderbuffer(gl, gl.RGBA4, 64, 64);
    var rbRGB5_A1 = CreateRenderbuffer(gl, gl.RGB5_A1, 64, 64);
    var rbRGB565 = CreateRenderbuffer(gl, gl.RGB565, 64, 64);

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbColor);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rbDepthStencil);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbRGBA4);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, rbRGBA4);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbRGB5_A1);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, rbRGB5_A1);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbRGB565);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, rbRGB565);
    strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");

    gl.deleteFramebuffer(fb);

    gl.deleteRenderbuffer(rbColor);
    gl.deleteRenderbuffer(rbDepthStencil);
    gl.deleteRenderbuffer(rbRGBA4);
    gl.deleteRenderbuffer(rbRGB5_A1);
    gl.deleteRenderbuffer(rbRGB565);
}

function CheckReadPixelsParams(gl, targetName, width, height, pixels) {

    gl.readPixels(0, 0, -1, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.INVALID_VALUE, "readPixels([" + targetName + "]) must generate INVALID_VALUE if width < 0");
    gl.readPixels(0, 0, width, -1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.INVALID_VALUE, "readPixels([" + targetName + "]) must generate INVALID_VALUE if height < 0");
    gl.readPixels(0, 0, -1, -1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.INVALID_VALUE, "readPixels([" + targetName + "]) must generate INVALID_VALUE if width < 0 && height < 0");

    try
    {
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.INVALID_VALUE, "readPixels([" + targetName + "]) must generate INVALID_VALUE if pixels is null");
     }
    catch (e) {
        ok(false, "readPixels([" + targetName + "]) throws exception if pixels is null"); 
    }

    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, new Uint16Array(width * height * 4));
    equal(gl.getError(), gl.INVALID_OPERATION, "readPixels([" + targetName + "]) must generate INVALID_OPERATION if type==UNSIGNED_BYTE and pixels is not type of Uint8Array");

    gl.readPixels(0, 0, width * 2, height * 2, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.INVALID_OPERATION, "readPixels([" + targetName + "]) must generate INVALID_OPERATION if pixels is not large enough to retrieve all of the pixels in the specified rectangle");

    gl.readPixels(-1, -1, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.NO_ERROR, "readPixels([" + targetName + "]) generates no errors if x < 0 or y < 0");

    gl.readPixels(0, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.NO_ERROR, "readPixels([" + targetName + "]) generates no errors if width = 0 and height = 0");
}

function CheckReadPixelsFormatTypeCombination(gl, targetName, width, height, pixels) {

    // непонятно, что сработает раньше - INVALID_OPERATION из-за несоответвия формата и типа или INVALID_ENUM из-за невалидного значения
    gl.readPixels(0, 0, width, height, -1, -1, pixels);
    er = gl.getError();
    ok(er == gl.INVALID_ENUM || er == gl.INVALID_OPERATION, "readPixels([" + targetName + "]) must generate (INVALID_OPERATION or INVALID_ENUM) if format and type is invalid values. Returned: " + GLErrorToStr(gl, er));

    gl.readPixels(0, 0, width, height, gl.RGBA, -1, pixels);
    er = gl.getError();
    ok(er == gl.INVALID_ENUM || er == gl.INVALID_OPERATION, "readPixels([" + targetName + "]) must generate (INVALID_OPERATION or INVALID_ENUM) with invalid type. Returned: " + GLErrorToStr(gl, er));

    gl.readPixels(0, 0, width, height, -1, gl.UNSIGNED_BYTE, pixels);
    er = gl.getError();
    ok(er == gl.INVALID_ENUM || er == gl.INVALID_OPERATION, "readPixels([" + targetName + "]) must generate (INVALID_OPERATION or INVALID_ENUM) with invalid format. Returned: " + GLErrorToStr(gl, er));

    // Check OpenGL supported formats and types
    gl.readPixels(0, 0, width, height, gl.RGB, gl.UNSIGNED_BYTE, pixels);
    var er = gl.getError();
    ok(er == gl.INVALID_ENUM || er == gl.INVALID_OPERATION, "readPixels([" + targetName + "]) must generate error (INVALID_OPERATION or INVALID_ENUM) if format==RGB and type==UNSIGNED_BYTE. Returned: " + GLErrorToStr(gl, er));

    gl.readPixels(0, 0, width, height, gl.ALPHA, gl.UNSIGNED_BYTE, pixels);
    var er = gl.getError();
    ok(er == gl.INVALID_ENUM || er == gl.INVALID_OPERATION, "readPixels([" + targetName + "]) must generate error (INVALID_OPERATION or INVALID_ENUM) if format==ALPHA and type==UNSIGNED_BYTE. Returned: " + GLErrorToStr(gl, er));

    gl.readPixels(0, 0, width, height, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, pixels);
    var er = gl.getError();
    ok(er == gl.INVALID_ENUM || er == gl.INVALID_OPERATION, "readPixels([" + targetName + "]) must generate error (INVALID_OPERATION or INVALID_ENUM) if format==RGB and type==UNSIGNED_SHORT_5_6_5. Returned: " + GLErrorToStr(gl, er));

    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4, pixels);
    var er = gl.getError();
    ok(er == gl.INVALID_ENUM || er == gl.INVALID_OPERATION, "readPixels([" + targetName + "]) must generate error (INVALID_OPERATION or INVALID_ENUM) if format==RGBA and type==UNSIGNED_SHORT_4_4_4_4. Returned: " + GLErrorToStr(gl, er));

    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, pixels);
    var er = gl.getError();
    ok(er == gl.INVALID_ENUM || er == gl.INVALID_OPERATION, "readPixels([" + targetName + "]) must generate error (INVALID_OPERATION or INVALID_ENUM) if format==RGBA and type==UNSIGNED_SHORT_5_5_5_1. Returned: " + GLErrorToStr(gl, er));
}

function clearArray(ar, value) {
    for (var i = 0; i < ar.length; ++i) {
        ar[i] = value;
    }
}

function CheckAllPixelsOutsideFB(gl, size, pixels, targetName) {
    clearArray(pixels, 111);

    gl.readPixels(size, size, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.NO_ERROR, "readPixels([" + targetName + "]) must not generate errors if pixels is outside the framebuffer");

    var isZeroArray = true;
    for (var i = 0; i < pixels.length; ++i) {
        if (pixels[i] !== 0) {
            isZeroArray = false;
            break;
        }
    }

    ok(isZeroArray, "readPixels([" + targetName + "]) for all pixel lying outside the frame buffer, value must be 0");
}

function CheckAllPixelsInsideFB(gl, size, pixels, color, targetName) {
    clearArray(pixels, 111);

    gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.NO_ERROR, "readPixels([" + targetName + "]) must not generate errors if pixels is inside the framebuffer");

    var isEqualColors = true;
    for (var i = 0; i < pixels.length; i += 4) {
        var isSameColor = pixels[i] == color.r && pixels[i + 1] == color.g && pixels[i + 2] == color.b && pixels[i + 3] == 255;
        if (!isSameColor) {
            isEqualColors = false;
            break;
        }
    }

    ok(isEqualColors, "readPixels([" + targetName + "]) for all pixel lying inside the frame buffer, must return the same color");
}

function CheckHeightOutisedeFB(gl, size, pixels, color, targetName) {
    clearArray(pixels, 111);

    gl.readPixels(0, size / 2, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.NO_ERROR, "readPixels([" + targetName + "]) must not generate errors if pixels is not full inside the framebuffer [x: 0, y: size/2]");

    var isSameColor = true;
    for (var i = 0; i < pixels.length / 2; i += 4) {
        if (pixels[i] !== color.r && pixels[i + 1] !== color.g && pixels[i + 2] !== color.b && pixels[i + 3] !== 255) {
            isSameColor = false;
            break;
        }
    }
    ok(isSameColor, "pixels returned by readPixels([" + targetName + "], x: 0, y: size/2) in 0 to size/2 rows must be the same color as frame buffer");

    var isZeroArray = true;
    for (var i = pixels.length / 2; i < pixels.length; ++i) {
        if (pixels[i] !== 0) {
            isZeroArray = false;
            break;
        }
    }
    ok(isZeroArray, "pixels returned by readPixels([" + targetName + "], x: 0, y: size/2) up to size/2 rows must be 0");

    clearArray(pixels, 111);

    gl.readPixels(0, -size / 2, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.NO_ERROR, "readPixels([" + targetName + "]) must not generate errors if pixels is not full inside the framebuffer [x: 0, y: -size/2]");

    isZeroArray = true;
    for (var i = 0; i < pixels.length / 2; ++i) {
        if (pixels[i] !== 0) {
            isZeroArray = false;
            break;
        }
    }
    ok(isZeroArray, "pixels returned by readPixels([" + targetName + "], x: 0, y: -size/2) in 0 to size/2 rows must be 0");

    var isSameColor = true;
    for (var i = pixels.length / 2; i < pixels.length; i += 4) {
        if (pixels[i] !== color.r && pixels[i + 1] !== color.g && pixels[i + 2] !== color.b && pixels[i + 3] !== 255) {
            isSameColor = false;
            break;
        }
    }
    ok(isSameColor, "pixels returned by readPixels([" + targetName + "], x: 0, y: -size/2) up to size/2 must be the same color as frame buffer");
}

function CheckWidthOutsideFB(gl, size, pixels, color, targetName) {
    clearArray(pixels, 111);

    gl.readPixels(-size / 2, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.NO_ERROR, "readPixels([" + targetName + "]) must not generate errors if pixels is not full inside the framebuffer [x: -size/2, y: 0]");

    var isZeroArray = true;
    for (var i = 0; i < size / 2; ++i) {
        for (var j = 0; j < size; ++j) {
            var index = (i + j * size) * 4;
            if (pixels[index] !== 0 && pixels[index + 1] !== 0 && pixels[index + 2] !== 0 && pixels[index + 3] !== 0) {
                isZeroArray = false;
                break;
            }
        }
    }
    ok(isZeroArray, "pixels returned by readPixels([" + targetName + "], x: -size/2, y: 0) in 0 to size/2 cols must be 0");

    var isSameColor = true;
    for (var i = size / 2; i < size; ++i) {
        for (var j = 0; j < size; ++j) {
            var index = (i + j * size) * 4;
            if (pixels[index] !== color.r && pixels[index + 1] !== color.g && pixels[index + 2] !== color.b && pixels[index + 3] !== 255) {
                isSameColor = false;
                break;
            }
        }
    }
    ok(isSameColor, "pixels returned by readPixels([" + targetName + "],  x: -size/2, y: 0) up to size/2 cols must be the same color as frame buffer");

    clearArray(pixels, 111);

    gl.readPixels(size / 2, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    equal(gl.getError(), gl.NO_ERROR, "readPixels([" + targetName + "]) must not generate errors if pixels is not full inside the framebuffer [x: size/2, y: 0]");

    isSameColor = true;
    for (var i = 0; i < size / 2; ++i) {
        for (var j = 0; j < size; ++j) {
            var index = (i + j * size) * 4;
            if (pixels[index] !== color.r && pixels[index + 1] !== color.g && pixels[index + 2] !== color.b && pixels[index + 3] !== 255) {
                isSameColor = false;
                break;
            }
        }
    }
    ok(isSameColor, "pixels returned by readPixels([" + targetName + "],  x: size/2, y: 0) in 0 to size/2 cols must be the same color as frame buffer");

    isZeroArray = true;
    for (var i = size / 2; i < size; ++i) {
        for (var j = 0; j < size; ++j) {
            var index = (i + j * size) * 4;
            if (pixels[index] !== 0 && pixels[index + 1] !== 0 && pixels[index + 2] !== 0 && pixels[index + 3] !== 0) {
                isZeroArray = true;
                break;
            }
        }
    }
    ok(isZeroArray, "pixels returned by readPixels([" + targetName + "], x: 0, y: -size/2) up to size/2 cols must be 0");
}

//////////////////////////////////////////////////////////////////////////
module("WebGLFramebuffer");

test("verify createFramebuffer() and deleteFramebuffer()", function () {
    var gl = GetCleanContext();

    var fb = gl.createFramebuffer();
    equal(gl.getError(), gl.NO_ERROR, "createFramebuffer() must not generate error");
    ok(fb != null, "createFramebuffer() returned not null");
    ok(fb != undefined, "createFramebuffer() returned not undefined");
    ok(fb instanceof WebGLFramebuffer, "createFramebuffer() returned value instanceof WebGLFramebuffer");

    gl.deleteFramebuffer(fb);
    equal(gl.getError(), gl.NO_ERROR, "deleteRenderbuffer() must not generate error");

    // 5.13.6 Framebuffer objects https://www.khronos.org/registry/webgl/specs/latest/
    // If the framebuffer has already been deleted the call has no effect.
    gl.deleteFramebuffer(fb);
    equal(gl.getError(), gl.NO_ERROR, "deleteFramebuffer(already deleted) must not generate error");

    gl.deleteFramebuffer(null);
    equal(gl.getError(), gl.NO_ERROR, "deleteFramebuffer(null) must not generate error");

    gl.deleteFramebuffer(undefined);
    equal(gl.getError(), gl.NO_ERROR, "deleteFramebuffer(undefined) must not generate error");
});

test("deleteFramebuffer() wrong type test", function () {
    var gl = GetCleanContext();

    raises(function () { gl.deleteFramebuffer(0); });
});

test("verify bindFramebuffer()", function () {
    var gl = GetCleanContext();

    var fb = gl.createFramebuffer();

    gl.bindFramebuffer(0, undefined);
    equal(gl.getError(), gl.INVALID_ENUM, "bindFramebuffer(invalid target[undefined] ) must generate INVALID_ENUM error");

    gl.bindFramebuffer(0, fb);
    equal(gl.getError(), gl.INVALID_ENUM, "bindFramebuffer(invalid target [not bounded]) must generate INVALID_ENUM error");

    gl.bindFramebuffer(0, null);
    equal(gl.getError(), gl.INVALID_ENUM, "bindFramebuffer(invalid target [null]) must generate INVALID_ENUM error");

    gl.bindFramebuffer(gl.FRAMEBUFFER, undefined);
    equal(gl.getError(), gl.NO_ERROR, "bindFramebuffer(undefined) must not generate error");

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    equal(gl.getError(), gl.NO_ERROR, "bindFramebuffer() must not generate error");

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    equal(gl.getError(), gl.NO_ERROR, "bindFramebuffer(null) must not generate error");

    gl.deleteFramebuffer(fb);
});

test("bindFramebuffer() wrong type test", function () {
    var gl = GetCleanContext();

    raises(function () { gl.bindFramebuffer(gl.FRAMEBUFFER, 0); });
});

test("getting bounded Framebuffer", function () {
    var gl = GetCleanContext();

    var fb = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    ok(fb == null, "getParameter(FRAMEBUFFER_BINDING) returned null for zero-bound");
    equal(gl.getError(), gl.NO_ERROR, "getParameter(FRAMEBUFFER_BINDING) must not generate error");

    fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    var fbBound = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    ok(fb == fbBound, "getParameter(FRAMEBUFFER_BINDING) returned right framebuffer");
    equal(gl.getError(), gl.NO_ERROR, "getParameter(FRAMEBUFFER_BINDING) must not generate error");
});

test("deleting bounded Framebuffer", function () {
    var gl = GetCleanContext();

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.deleteFramebuffer(fb);

    var fbBound = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    ok(fbBound == null, "deleteFramebuffer(currently bound) restored zero-framebuffer");
    equal(gl.getError(), gl.NO_ERROR, "deleteFramebuffer(currently bound) must not generate error");
});

test("verify isFramebuffer()", function () {
    var gl = GetCleanContext();

    var fb = gl.createFramebuffer();
    strictEqual(gl.isFramebuffer(fb), false, "isFramebuffer(not bound) returned false");
    equal(gl.getError(), gl.NO_ERROR, "isFramebuffer(not bound) must not generate error");

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    strictEqual(gl.isFramebuffer(fb), true, "isFramebuffer() returned true");
    equal(gl.getError(), gl.NO_ERROR, "isFramebuffer() must not generate error");

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);
    strictEqual(gl.isFramebuffer(fb), false, "isFramebuffer(deleted) returned false");
    equal(gl.getError(), gl.NO_ERROR, "isFramebuffer(deleted) must not generate error");
});

test("deleting attached renderbuffer", function () {
    var gl = GetCleanContext();

    var rb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, 128, 128);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rb);
    equal(gl.getError(), gl.INVALID_OPERATION, "framebufferRenderbuffer() must generate INVALID_OPERATION if the default framebuffer object name 0 is bound");

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rb);

    strictEqual(gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE), gl.RENDERBUFFER,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE) return renderbuffer type");

    gl.deleteRenderbuffer(rb);
    strictEqual(gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE), gl.NONE,
        "getFramebufferAttachmentParameter(FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE) returned none after deleting");
});

test("verify getFramebufferAttachmentParameter()", function () {
    var gl = GetCleanContext();

    // GL_INVALID_OPERATION is generated if the default framebuffer object name 0 is bound.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE);
    equal(gl.getError(), gl.INVALID_OPERATION, 
        "getFramebufferAttachmentParameter() must generate INVALID_OPERATION for zero-bound");

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // GL_INVALID_ENUM is generated if target is not GL_FRAMEBUFFER.
    gl.getFramebufferAttachmentParameter(0, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE);
    equal(gl.getError(), gl.INVALID_ENUM,
        "getFramebufferAttachmentParameter(invalid target) must generate INVALID_ENUM error");

    // GL_INVALID_ENUM is generated if attachment is not GL_COLOR_ATTACHMENT0, GL_DEPTH_ATTACHMENT, or GL_STENCIL_ATTACHMENT.
    gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, 0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE);
    equal(gl.getError(), gl.INVALID_ENUM,
        "getFramebufferAttachmentParameter(invalid attachment) must generate INVALID_ENUM error");

    var attachments = [
        { 'name': "COLOR_ATTACHMENT0", 'value': gl.COLOR_ATTACHMENT0 },
        { 'name': "DEPTH_ATTACHMENT", 'value': gl.DEPTH_ATTACHMENT },
        { 'name': "STENCIL_ATTACHMENT", 'value': gl.STENCIL_ATTACHMENT },
        { 'name': "DEPTH_STENCIL_ATTACHMENT", 'value': gl.DEPTH_STENCIL_ATTACHMENT }
    ];

    var paramNames = [
        { 'name': "FRAMEBUFFER_ATTACHMENT_OBJECT_NAME", 'value': gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME }, // firefox & chrome generate no INVALID_ENUM for this name
        {'name': "FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL", 'value': gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL },
        { 'name': "FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE", 'value': gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE }
    ];

    for (var a = 0; a < attachments.length; ++a) {

        strictEqual(gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachments[a].value,
            gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE), gl.NONE,
            "getFramebufferAttachmentParameter(" + attachments[a].name + ", FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE) returned NONE-value with no attachments");

        for (var p = 0; p < paramNames.length; ++p) {
            // GL_INVALID_ENUM is generated if there is no attached object at the named 
            // attachment point and pname is not GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE.
            gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachments[a].value, paramNames[p].value);
            equal(gl.getError(), gl.INVALID_ENUM,
                "getFramebufferAttachmentParameter(" + attachments[a].name + "," + paramNames[p].name + ") must generate INVALID_ENUM error with no attachments");
        }
    }

    gl.deleteFramebuffer(fb);
});

test("verify framebufferRenderbuffer()", function () {
    var gl = GetCleanContext();

    // GL_INVALID_ENUM is generated if attachment is not an accepted attachment point.
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, 0, gl.RENDERBUFFER, null);
    equal(gl.getError(), gl.INVALID_ENUM, "framebufferRenderbuffer(invalid attachment) must generate INVALID_ENUM error");

    var attachments =
    [
        { 'name': "COLOR_ATTACHMENT0", 'value': gl.COLOR_ATTACHMENT0 },
        { 'name': "DEPTH_ATTACHMENT", 'value': gl.DEPTH_ATTACHMENT },
        { 'name': "STENCIL_ATTACHMENT", 'value': gl.STENCIL_ATTACHMENT },
        { 'name': "DEPTH_STENCIL_ATTACHMENT", 'value': gl.DEPTH_STENCIL_ATTACHMENT }
    ];

    for (var i = 0; i < attachments.length; ++i) {

        // GL_INVALID_OPERATION is generated if the default framebuffer object name 0 is bound.
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachments[i].value, gl.RENDERBUFFER, null);
        equal(gl.getError(), gl.INVALID_OPERATION,
        "framebufferRenderbuffer(" + attachments[i].name + ") must generate INVALID_OPERATION error for zero-bound framebuffer");

        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        // GL_INVALID_ENUM is generated if target is not GL_FRAMEBUFFER.
        gl.framebufferRenderbuffer(0, attachments[i].value, gl.RENDERBUFFER, null);
        equal(gl.getError(), gl.INVALID_ENUM, "framebufferRenderbuffer(" + attachments[i].name + ") must generate GL_INVALID_ENUM error with invalid target");

        // GL_INVALID_ENUM is generated if renderbuffertarget is not GL_RENDERBUFFER and renderbuffer is not 0.
        var rb = gl.createRenderbuffer();
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachments[i].value, 0, rb);
        equal(gl.getError(), gl.INVALID_ENUM,
        "framebufferRenderbuffer(" + attachments[i].name + ") must generate INVALID_ENUM error invalid renderbuffertarget");
        gl.deleteRenderbuffer(rb);

        // Right way
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachments[i].value, gl.RENDERBUFFER, null);
        equal(gl.getError(), gl.NO_ERROR, "framebufferRenderbuffer(" + attachments[i].name + ") must not generate error");

        gl.deleteFramebuffer(fb);
    } 
});

test("framebufferRenderbuffer() wrong type test", function () {
    var gl = GetCleanContext();

    raises(function () { gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, 0); });
});

test("verify renderbuffer attachments", function () {
    var gl = GetCleanContext();

    var width = 256;
    var height = 256;
    var formats = [gl.RGBA4, gl.RGB5_A1, gl.RGB565];

    var rbDepth = CreateRenderbuffer(gl, gl.DEPTH_COMPONENT16, width, height);
    var rbDepthStencil = CreateRenderbuffer(gl, gl.DEPTH_STENCIL, width, height);

    for (var i = 0; i < formats.length; ++i) {

        var rbColor = CreateRenderbuffer(gl, formats[i], width, height);

        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        CheckRenderbufferAttachment(gl, gl.COLOR_ATTACHMENT0, rbColor);
        gl.deleteFramebuffer(fb);

        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        CheckRenderbufferAttachment(gl, gl.COLOR_ATTACHMENT0, rbColor);
        CheckRenderbufferAttachment(gl, gl.DEPTH_ATTACHMENT, rbDepth);
        gl.deleteFramebuffer(fb);

        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        CheckRenderbufferAttachment(gl, gl.COLOR_ATTACHMENT0, rbColor);
        CheckRenderbufferAttachment(gl, gl.DEPTH_STENCIL_ATTACHMENT, rbDepthStencil);
        gl.deleteFramebuffer(fb);

        gl.deleteRenderbuffer(rbColor);
    }

    gl.deleteRenderbuffer(rbDepth);
    gl.deleteRenderbuffer(rbDepthStencil);
});

test("verify framebufferTexture2D()", function () {
    var gl = GetCleanContext();

    // GL_INVALID_OPERATION is generated if the default framebuffer object name 0 is bound.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
    equal(gl.getError(), gl.INVALID_OPERATION,
        "framebufferTexture2D() must generate INVALID_OPERATION error for zero-bound framebuffer");

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // GL_INVALID_ENUM is generated if target is not GL_FRAMEBUFFER.
    gl.framebufferTexture2D(-1, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "framebufferTexture2D(invalid target) must generate INVALID_ENUM error");

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // GL_INVALID_ENUM is generated if textarget is not an accepted texture target and texture is not 0.
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, -1, tex, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "framebufferTexture2D(invalid textarget) must generate INVALID_ENUM error");

    // GL_INVALID_ENUM is generated if attachment is not an accepted attachment point.
    gl.framebufferTexture2D(gl.FRAMEBUFFER, -1, gl.TEXTURE_2D, tex, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "framebufferTexture2D(invalid attachment) must generate INVALID_ENUM error");

    // GL_INVALID_VALUE is generated if level is not 0 and texture is not 0.
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, -1);
    equal(gl.getError(), gl.INVALID_VALUE, "framebufferTexture2D(invalid level [-1]) must generate INVALID_VALUE error");

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 1);
    equal(gl.getError(), gl.INVALID_VALUE, "framebufferTexture2D(invalid level [1]) must generate INVALID_VALUE error");

    // GL_INVALID_OPERATION is generated if texture is the name of an existing two-dimensional 
    // texture object but textarget is not GL_TEXTURE_2D or if texture is the name of an existing cube 
    // map texture object but textarget is GL_TEXTURE_2D.
    var targets =
    [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    for (var i = 0; i < targets.length; ++i) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, targets[i], tex, 0);
        equal(gl.getError(), gl.INVALID_OPERATION, "framebufferTexture2D() must generate INVALID_OPERATION if texture is 2d but textarget is " + TexTargetToStr(gl, targets[i]));
    }
    gl.deleteTexture(tex);

    var texCube = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texCube);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texCube, 0);
    equal(gl.getError(), gl.INVALID_OPERATION, "framebufferTexture2D() must generate INVALID_OPERATION if texture is cube map but textarget is TEXTURE_2D");
    gl.deleteTexture(texCube);

    // Right way
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
    equal(gl.getError(), gl.NO_ERROR, "framebufferTexture2D() must not generate error");

    gl.deleteFramebuffer(fb);
});

test("framebufferTexture2D() wrong type test", function () {
    var gl = GetCleanContext();

    raises(function () { gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, 0, 0); });
});

test("verify texture attachments", function () {
    var gl = GetCleanContext();

    var width = 256;
    var height = 256;
    var formats =
    [
        gl.ALPHA,
        gl.LUMINANCE,
        gl.LUMINANCE_ALPHA,
        gl.RGB,
        gl.RGBA
    ];

    var targets =
    [
        gl.TEXTURE_2D,
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    var rbDepth = CreateRenderbuffer(gl, gl.DEPTH_COMPONENT16, width, height);
    var rbDepthStencil = CreateRenderbuffer(gl, gl.DEPTH_STENCIL, width, height);

    for (var i = 0; i < formats.length; ++i) {
        for (var j = 0; j < targets.length; ++j) {

            var texture = CreateGLTexture(gl, targets[j], formats[i], width, height);

            var fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            CheckTextureAttachment(gl, texture, targets[j],
                "texTarget: " + TexTargetToStr(gl, targets[j]) + ", texFormat: " + TexFromatToStr(gl, formats[i]));
            gl.deleteFramebuffer(fb);

            var fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            CheckTextureAttachment(gl, texture, targets[j],
                "texTarget: " + TexTargetToStr(gl, targets[j]) + ", texFormat: " + TexFromatToStr(gl, formats[i]) + ", renderbuffer attachment: DEPTH_ATTACHMENT");
            CheckRenderbufferAttachment(gl, gl.DEPTH_ATTACHMENT, rbDepth);
            gl.deleteFramebuffer(fb);

            var fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            CheckTextureAttachment(gl, texture, targets[j],
                "texTarget: " + TexTargetToStr(gl, targets[j]) + ", texFormat: " + TexFromatToStr(gl, formats[i]) + ", renderbuffer attachment: DEPTH_STENCIL_ATTACHMENT");
            CheckRenderbufferAttachment(gl, gl.DEPTH_STENCIL_ATTACHMENT, rbDepthStencil);
            gl.deleteFramebuffer(fb);

            gl.deleteTexture(texture);
        }
    }

    gl.deleteRenderbuffer(rbDepth);
    gl.deleteRenderbuffer(rbDepthStencil);

    //restore default value
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
});

test("verify copyTexImage2D()", function () {
    var gl = GetCleanContext();

    var targets =
    [
        { 'name': "TEXTURE_2D", 'value': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_X", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP }
    ];
    var formats =
    [
        { 'name': "ALPHA", 'value': gl.ALPHA },
        { 'name': "LUMINANCE", 'value': gl.LUMINANCE },
        { 'name': "LUMINANCE_ALPHA", 'value': gl.LUMINANCE_ALPHA },
        { 'name': "RGB", 'value': gl.RGB },
        { 'name': "RGBA", 'value': gl.RGBA }
    ];

    var width = 256;
    var height = 256;

    var maxTex2DSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var maxTex2DLevel = Math.log(maxTex2DSize) / Math.LN2;
    equal(gl.getError(), gl.NO_ERROR, "getParameter([MAX_TEXTURE_SIZE]) must not generate errors");

    var maxTexCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    var maxTexCubeLevel = Math.log(maxTexCubeSize) / Math.LN2;
    equal(gl.getError(), gl.NO_ERROR, "getParameter([MAX_CUBE_MAP_TEXTURE_SIZE]) must not generate errors");

    for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
        for (var fIt = 0, fLength = formats.length; fIt < fLength; ++fIt) {

            var isTexCube = targets[tIt].value == gl.TEXTURE_2D ? false : true;
            var resultTex = CreateGLTexture(gl, targets[tIt].value, formats[fIt].value, width, height);

            var fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

            gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, 0, 0, width, height, 0);
            equal(gl.getError(), gl.INVALID_FRAMEBUFFER_OPERATION, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_FRAMEBUFFER_OPERATION if currently bound framebuffer is not framebuffer complete");

            if (formats[fIt].value != gl.RGB && formats[fIt].value != gl.LUMINANCE) {
                var fbColorTex = CreateTexture2D(gl, gl.RGB, width, height);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbColorTex, 0);
                strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE after attach texture");

                gl.bindTexture(targets[tIt].texTarget, resultTex);
                gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, 0, 0, width, height, 0);
                equal(gl.getError(), gl.INVALID_OPERATION, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_OPERATION with internalformat param [" + formats[fIt].name + "]. Framebuffer format: RGB");

                gl.deleteTexture(fbColorTex);
            }

            var fbColorTex = CreateTexture2D(gl, gl.RGBA, width, height);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbColorTex, 0);
            strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE after attach texture");

            gl.bindTexture(targets[tIt].texTarget, resultTex);
            gl.copyTexImage2D(-1, 0, formats[fIt].value, 0, 0, width, height, 0);
            equal(gl.getError(), gl.INVALID_ENUM, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_ENUM with invaid target param");

            gl.copyTexImage2D(targets[tIt].value, 0, -1, 0, 0, width, height, 0);
            equal(gl.getError(), gl.INVALID_ENUM, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_ENUM with invaid internalformat param");

            if (isTexCube) {
                gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, 0, 0, width / 2, height, 0);
                equal(gl.getError(), gl.INVALID_VALUE, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if target is cube map and the width and height are not equal");
            }

            var maxLevel = isTexCube ? maxTexCubeLevel : maxTex2DLevel;
            gl.copyTexImage2D(targets[tIt].value, maxLevel + 1, formats[fIt].value, 0, 0, 1, 1, 0);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if level > log2(max), where max = [MAX_TEXTURE_SIZE] with [TEXTURE_2D] or [MAX_CUBE_MAP_TEXTURE_SIZE] with [TEXTURE_CUBE_MAP]");
            gl.copyTexImage2D(targets[tIt].value, maxLevel, formats[fIt].value, 0, 0, 1, 1, 0);
            equal(gl.getError(), gl.NO_ERROR, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must not generate errors if level = log2(max), where max = [MAX_TEXTURE_SIZE] with [TEXTURE_2D] or [MAX_CUBE_MAP_TEXTURE_SIZE] with [TEXTURE_CUBE_MAP]");

            gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, 0, 0, -1, height, 0);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if width < 0");
            gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, 0, 0, height, -1, 0);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if height < 0");

            var maxTexSize = isTexCube ? maxTexCubeSize : maxTex2DSize;
            gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, 0, 0, maxTexSize + 1, height, 0);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if width > max texture size");
            gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, 0, 0, height, maxTexSize + 1, 0);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if height > max texture size");

            gl.copyTexImage2D(targets[tIt].value, -1, formats[fIt].value, 0, 0, width, height, 0);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if level is less than 0");

            gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, 0, 0, width, height, -1);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if border != 0");

            gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, 0, 0, width, height, 0);
            equal(gl.getError(), gl.NO_ERROR, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must not generate errors");

            gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, 0, 0, 0, 0, 0);
            equal(gl.getError(), gl.NO_ERROR, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must not generate errors for zero-size texture");

            gl.copyTexImage2D(targets[tIt].value, 0, formats[fIt].value, width / 2, height / 2, width, height, 0);
            equal(gl.getError(), gl.NO_ERROR, "copyTexImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must not generate errors, if rect is out of framebuffer");

            gl.deleteTexture(resultTex);
            gl.deleteFramebuffer(fb);
            gl.deleteTexture(fbColorTex);
        }
    } 
});

test("verify copyTexSubImage2D()", function () {
    var gl = GetCleanContext();

    var targets =
    [
        { 'name': "TEXTURE_2D", 'value': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_X", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP }
    ];
    var formats =
    [
        { 'name': "ALPHA", 'value': gl.ALPHA },
        { 'name': "LUMINANCE", 'value': gl.LUMINANCE },
        { 'name': "LUMINANCE_ALPHA", 'value': gl.LUMINANCE_ALPHA },
        { 'name': "RGB", 'value': gl.RGB },
        { 'name': "RGBA", 'value': gl.RGBA }
    ];

    var width = 256;
    var height = 256;

    var maxTex2DSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var maxTex2DLevel = Math.log(maxTex2DSize) / Math.LN2;
    equal(gl.getError(), gl.NO_ERROR, "getParameter([MAX_TEXTURE_SIZE]) must not generate errors");

    var maxTexCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    var maxTexCubeLevel = Math.log(maxTexCubeSize) / Math.LN2;
    equal(gl.getError(), gl.NO_ERROR, "getParameter([MAX_CUBE_MAP_TEXTURE_SIZE]) must not generate errors");

    for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
        for (var fIt = 0, fLength = formats.length; fIt < fLength; ++fIt) {

            var isTexCube = targets[tIt].value == gl.TEXTURE_2D ? false : true;
            var resultTex = gl.createTexture();
            gl.bindTexture(targets[tIt].texTarget, resultTex);

            var fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, 0, 0, 0, width, height);
            equal(gl.getError(), gl.INVALID_OPERATION, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_OPERATION if the texture has not been defined by  texImage2D or copyTexSubImage2D");

            isTexCube ? InitializeTextureCube(gl, resultTex, formats[fIt].value, width, height) : InitializeTexture2D(gl, resultTex, formats[fIt].value, width, height);

            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, 0, 0, 0, width, height);
            equal(gl.getError(), gl.INVALID_FRAMEBUFFER_OPERATION, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_FRAMEBUFFER_OPERATION if currently bound framebuffer is not framebuffer complete");

            if (formats[fIt].value != gl.RGB && formats[fIt].value != gl.LUMINANCE) {
                var fbColorTex = CreateTexture2D(gl, gl.RGB, width, height);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbColorTex, 0);
                strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE after attach texture");

                gl.bindTexture(targets[tIt].texTarget, resultTex);
                gl.copyTexSubImage2D(targets[tIt].value, 0, 0, 0, 0, 0, width, height);
                equal(gl.getError(), gl.INVALID_OPERATION, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_OPERATION with internalformat param [" + formats[fIt].name + "]. Framebuffer format: RGB");

                gl.deleteTexture(fbColorTex);
            }

            var fbColorTex = CreateTexture2D(gl, gl.RGBA, width, height);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbColorTex, 0);
            strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE after attach texture");

            gl.bindTexture(targets[tIt].texTarget, resultTex);
            gl.copyTexSubImage2D(-1, 0, 0, 0, 0, 0, width, height);
            equal(gl.getError(), gl.INVALID_ENUM, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_ENUM with invaid target param");

            var maxLevel = isTexCube ? maxTexCubeLevel : maxTex2DLevel;
            gl.copyTexSubImage2D(targets[tIt].value, maxLevel + 1, 0, 0, 0, 0, 1, 1);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if level > log2(max), where max = [MAX_TEXTURE_SIZE] with [TEXTURE_2D] or [MAX_CUBE_MAP_TEXTURE_SIZE] with [TEXTURE_CUBE_MAP]");

            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, 0, 0, 0, -1, height);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if width < 0");
            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, 0, 0, 0, width, -1);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if height < 0");

            gl.copyTexSubImage2D(targets[tIt].value, 0, -1, 0, 0, 0, width, height);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if xoffset < 0");
            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, -1, 0, 0, width, height);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if yoffset < 0");

            gl.copyTexSubImage2D(targets[tIt].value, -1, 0, 0, 0, 0, width, height);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if level is less than 0");

            gl.copyTexSubImage2D(targets[tIt].value, 0, width / 2, 0, 0, 0, width, height);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if xoffset + width > w");
            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, height / 2, 0, 0, width, height);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if yoffset + height > h");

            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, 0, 0, 0, width * 2, height);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if width > width of texture");
            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, 0, 0, 0, width, height * 2);
            equal(gl.getError(), gl.INVALID_VALUE, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must generate INVALID_VALUE if height > height of texture");

            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, 0, 0, 0, width, height);
            equal(gl.getError(), gl.NO_ERROR, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must not generate errors");

            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, 0, 0, 0, 0, 0);
            equal(gl.getError(), gl.NO_ERROR, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must not generate errors for zero-size texture");

            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, 0, width / 2, height / 2, width, height);
            equal(gl.getError(), gl.NO_ERROR, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must not generate errors, if rect is out of framebuffer");

            gl.copyTexSubImage2D(targets[tIt].value, 0, width / 2, 0, 0, 0, width / 2, height);
            equal(gl.getError(), gl.NO_ERROR, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must not generate errors if xoffset + width = w");

            gl.copyTexSubImage2D(targets[tIt].value, 0, 0, height / 2, 0, 0, width, height / 2);
            equal(gl.getError(), gl.NO_ERROR, "copyTexSubImage2D([" + targets[tIt].name + "], [" + formats[fIt].name + "]) must not generate errors if yoffset + height = h");

            gl.deleteTexture(resultTex);
            gl.deleteFramebuffer(fb);
            gl.deleteTexture(fbColorTex);
        }
    } 
});

test("verify checkFramebufferStatus()", function () {
    var gl = GetCleanContext();

    //////////////////////////////////////////////////////////////////////////
    // GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT
    // 
    // 	1) framebuffer has already deleted attachment
    // 	2) framebuffer attachment has zero width or zero height
    // 	3) format is incompatible
    // 
    // GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS
    // 
    // 	1) attachments has different width or height
    // 
    // GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT
    // 
    // 	1) framebuffer has no attachments
    // 
    // GL_FRAMEBUFFER_UNSUPPORTED
    // 
    // 	1) webglcontextlost event occured
    // 	2) invalid attachment combination *
    // 
    // *
    // DEPTH_ATTACHMENT + DEPTH_STENCIL_ATTACHMENT
    // STENCIL_ATTACHMENT + DEPTH_STENCIL_ATTACHMENT
    // DEPTH_ATTACHMENT + STENCIL_ATTACHMENT
    //////////////////////////////////////////////////////////////////////////

    // GL_INVALID_ENUM is generated if target is not GL_FRAMEBUFFER.
    gl.checkFramebufferStatus(-1);
    equal(gl.getError(), gl.INVALID_ENUM, "checkFramebufferStatus(invalid target) must generate INVALID_ENUM error");

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    var state = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");
    strictEqual(state, gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE for null-fbo");

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    state = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");
    strictEqual(state, gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT if no images are attached to the framebuffer");

    var tex = CreateTexture2D(gl, gl.RGB, 64, 64);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    state = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");
    strictEqual(state, gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE after attach texture");

    var rbDepth = CreateRenderbuffer(gl, gl.DEPTH_COMPONENT16, 32, 32);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbDepth);
    state = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");
    strictEqual(state, gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_DIMENSIONS if not all attached images have the same width and height");

    gl.deleteRenderbuffer(rbDepth);
    gl.deleteTexture(tex);
    state = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    equal(gl.getError(), gl.NO_ERROR, "checkFramebufferStatus() must not generate error");
    strictEqual(state, gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT, "checkFramebufferStatus() must return FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT after delete attachment");

    gl.deleteFramebuffer(fb);

    CheckUnsupportedAttachmentCombination(gl, gl.DEPTH_COMPONENT16, gl.DEPTH_ATTACHMENT, gl.DEPTH_STENCIL, gl.DEPTH_STENCIL_ATTACHMENT, "DEPTH_ATTACHMENT + DEPTH_STENCIL_ATTACHMENT");
    CheckUnsupportedAttachmentCombination(gl, gl.STENCIL_INDEX8, gl.STENCIL_ATTACHMENT, gl.DEPTH_STENCIL, gl.DEPTH_STENCIL_ATTACHMENT, "STENCIL_ATTACHMENT + DEPTH_STENCIL_ATTACHMENT");
    CheckUnsupportedAttachmentCombination(gl, gl.DEPTH_COMPONENT16, gl.DEPTH_ATTACHMENT, gl.STENCIL_INDEX8, gl.STENCIL_ATTACHMENT, "DEPTH_ATTACHMENT + STENCIL_ATTACHMENT");

    CheckZeroSizeAttachment(gl);

    CheckIncomplitableColorAttachmentFormats(gl);
    CheckIncomplitableDepthAttachmentFormats(gl);
    CheckIncomplitableDepthStencilAttachmentFormats(gl);
});

test("verify readPixels()", function () {
    var gl = GetCleanContext();

    var targets =
    [
        { 'name': "TEXTURE_2D", 'value': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_X", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP }
    ];

    var width = 256;
    var height = 256;

    var unit8Array = new Uint8Array(width * height * 4);

    for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
        var tex = CreateGLTexture(gl, targets[tIt].value, gl.RGB, width, height);

        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, unit8Array);
        equal(gl.getError(), gl.INVALID_FRAMEBUFFER_OPERATION, "readPixels([" + targets[tIt].name + "]) must generate INVALID_FRAMEBUFFER_OPERATION  if the currently bound framebuffer is not framebuffer complete");

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, targets[tIt].value, tex, 0);
        strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE after attach texture");

        CheckReadPixelsParams(gl, targets[tIt].name, width, height, unit8Array);
        CheckReadPixelsFormatTypeCombination(gl, targets[tIt].name, width, height, unit8Array);

        gl.deleteFramebuffer(fb);
        gl.deleteTexture(tex);
    } 
});

test("verify readPixels() [reading pixels outside the framebuffer]", function () {
    var gl = GetCleanContext();

    var targets =
    [
        { 'name': "TEXTURE_2D", 'value': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_X", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP }
    ];

    var size = 2;
    var ar = new Uint8Array(size * size * 4);
    var color = { 'r': 188, 'g': 0, 'b': 0 };

    for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
        var tex = CreateGLTexture(gl, targets[tIt].value, gl.RGB, size, size);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        fillTexture(gl, targets[tIt].value, size, size, gl.RGB, color);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after fill texture");

        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, targets[tIt].value, tex, 0);
        strictEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() must return FRAMEBUFFER_COMPLETE after attach texture");

        CheckAllPixelsInsideFB(gl, size, ar, color, targets[tIt].name);
        CheckAllPixelsOutsideFB(gl, size, ar, targets[tIt].name);
        CheckHeightOutisedeFB(gl, size, ar, color, targets[tIt].name);
        CheckWidthOutsideFB(gl, size, ar, color, targets[tIt].name);

        gl.deleteFramebuffer(fb);
        gl.deleteTexture(tex);
    } 
});
