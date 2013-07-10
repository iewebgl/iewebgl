
function EnableExtension(gl, extName) {
    var ext = gl.getExtension(extName);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getExtension() with supported extension [" + extName + "]");
    ok(ext !== null && ext !== undefined, "getExtension() return valid (not null or undefined) object for supported extension [" + extName + "]");
    return ext;
}

function CheckOESTextureFloatExtension(gl, extName) {
    var width = 64, height = 64;
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    var floatArr = new Float32Array(width * height * 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.FLOAT, floatArr);
    notEqual(gl.getError(), gl.NO_ERROR, "texImage2D() must generate error if [" + extName + "] is off");

    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width * 0.5, height * 0.5, gl.RGB, gl.FLOAT, floatArr);
    notEqual(gl.getError(), gl.NO_ERROR, "texSubImage2D() must generate error if [" + extName + "] is off");

    gl.deleteTexture(tex);

    //////////////////////////////////////////////////////////////////////////
    EnableExtension(gl, extName);

    var formats =
    [
        { 'name': "ALPHA", 'value': gl.ALPHA },
        { 'name': "LUMINANCE", 'value': gl.LUMINANCE },
        { 'name': "LUMINANCE_ALPHA", 'value': gl.LUMINANCE_ALPHA },
        { 'name': "RGB", 'value': gl.RGB },
        { 'name': "RGBA", 'value': gl.RGBA }
    ];

    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    var rbDepth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbDepth);

    // TEXTURE_2D

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    for (var fIt = 0, fLength = formats.length; fIt < fLength; ++fIt) {
        gl.texImage2D(gl.TEXTURE_2D, 0, formats[fIt].value, width, height, 0, formats[fIt].value, gl.FLOAT, floatArr);
        equal(gl.getError(), gl.NO_ERROR, "texImage2D(TEXTURE_2D) must not generate errors with format param [" + formats[fIt].name + "]  if [" + extName + "] is on");

        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width * 0.5, height * 0.5, formats[fIt].value, gl.FLOAT, floatArr);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(TEXTURE_2D) must not generate errors with format param [" + formats[fIt].name + "]  if [" + extName + "] is on");

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() == FRAMEBUFFER_COMPLETE with float texture  with format param [" + formats[fIt].name + "] ");
    }

    gl.deleteTexture(tex);

    // TEXTURE_CUBE_MAP

    var cubeFaces =
    [
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_X", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_X },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_X },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Y },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Z },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z }
    ];

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

    for (var fIt = 0, fLength = formats.length; fIt < fLength; ++fIt) {

        for (var cfIt = 0, cfLength = cubeFaces.length; cfIt < cfLength; ++cfIt) {
            gl.texImage2D(cubeFaces[cfIt].value, 0, formats[fIt].value, width, height, 0, formats[fIt].value, gl.FLOAT, floatArr);
            equal(gl.getError(), gl.NO_ERROR, "texImage2D(" + cubeFaces[cfIt].name + ") must not generate errors with format param [" + formats[fIt].name + "]  if [" + extName + "] is on");

            gl.texSubImage2D(cubeFaces[cfIt].value, 0, 0, 0, width * 0.5, height * 0.5, formats[fIt].value, gl.FLOAT, floatArr);
            equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + cubeFaces[cfIt].name + ") must not generate errors with format param [" + formats[fIt].name + "]  if [" + extName + "] is on");
        }

        for (var cfIt = 0, cfLength = cubeFaces.length; cfIt < cfLength; ++cfIt) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, cubeFaces[cfIt].value, tex, 0);
            equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE, "checkFramebufferStatus() == FRAMEBUFFER_COMPLETE with float texture  with format param [" + formats[fIt].name + "] ");
        }
    }
         
    gl.deleteTexture(tex);

    gl.deleteRenderbuffer(rbDepth);
    gl.deleteFramebuffer(fbo);
}

var ShaderForTest = {
    'vertexSrc' : 
        " precision highp float;\n" +
        " attribute vec3 aVertexPosition;\n"+
        " varying vec2 texCoord;\n" +
        " void main() {\n" +
            " gl_Position = vec4(aVertexPosition, 1.0);\n" +
            " texCoord = vec2(aVertexPosition.x, aVertexPosition.z);\n" +
        "}",
    'validFragmentSrc': 
        "#extension GL_OES_standard_derivatives : enable\n" +
        " precision highp float;\n" +
        " varying vec2 texCoord;\n" +
        " void main() {\n" +
            " float dx = dFdx(texCoord.x);\n" +
            " float dy = dFdy(texCoord.y);\n" +
            " float w = fwidth(texCoord.x);\n" +
            " gl_FragColor = vec4(dx, dy, w, 1.0);\n" +
        "}",
    'missingDirectiveFragmentSrc': 
        " precision highp float;\n" +
        " varying vec2 texCoord;\n" +
        " void main() {\n" +
            " float dx = dFdx(texCoord.x);\n" +
            " float dy = dFdy(texCoord.y);\n" +
            " float w = fwidth(texCoord.x);\n" +
            " gl_FragColor = vec4(dx, dy, w, 1.0);\n" +
        "}",
    'macroFragmentSrc':
        "precision highp float;\n" +
        "void main() {\n" +
        "#ifdef GL_OES_standard_derivatives\n" +
            "gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n" +
        "#else\n" +
        "    #error no GL_OES_standard_derivatives;\n" +
        "#endif\n" +
        "}"
};

function CheckShaders(gl, vShaderSrc, fShaderSrc, isLinkSucceded, desc){
    var prog = CreateProgramNoLinkingWithShadersSrc(gl, vShaderSrc, fShaderSrc);
    gl.linkProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after linking. Log: [" + gl.getProgramInfoLog(prog) + "]");
    equal(gl.getProgramParameter(prog, gl.LINK_STATUS), isLinkSucceded, "getProgramParameter(LINK_STATUS)=="+isLinkSucceded+". " + desc);
    CleanProgram(gl, prog);
}

function CheckOESStandardDerivativesExtension(gl, extName) {
    var FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 0x8B8B;

    gl.getParameter(FRAGMENT_SHADER_DERIVATIVE_HINT_OES);
    equal(gl.getError(), gl.INVALID_ENUM, "getParameter([FRAGMENT_SHADER_DERIVATIVE_HINT_OES]) must generate [INVALID_ENUM] if [" + extName + "] is off");
 
    gl.hint(FRAGMENT_SHADER_DERIVATIVE_HINT_OES, gl.DONT_CARE);
    equal(gl.getError(), gl.INVALID_ENUM, "hint() must generate error if [" + extName + "] is off");

    CheckShaders(gl, ShaderForTest.vertexSrc, ShaderForTest.validFragmentSrc, false, "Functions dFdx(), dFdy(), and fwidth() are not available in fragment shaders if [" + extName + "] is off");
    CheckShaders(gl, ShaderForTest.vertexSrc, ShaderForTest.macroFragmentSrc, false, "Macro [GL_OES_standard_derivatives ] is off if [" + extName + "] is off");

    //////////////////////////////////////////////////////////////////////////
    var ext = EnableExtension(gl, extName);

    CheckShaders(gl, ShaderForTest.vertexSrc, ShaderForTest.macroFragmentSrc, true, "Macro [GL_OES_standard_derivatives ] is available if [" + extName + "] is on");
    CheckShaders(gl, ShaderForTest.vertexSrc, ShaderForTest.missingDirectiveFragmentSrc, false, "Functions dFdx(), dFdy(), and fwidth() are not available: [" + extName + "] is on, but directive [#extension GL_OES_standard_derivatives : enable] is missing");
    CheckShaders(gl, ShaderForTest.vertexSrc, ShaderForTest.validFragmentSrc, true, "Functions dFdx(), dFdy(), and fwidth() are available in fragment shaders if [" + extName + "] is on");

    ok(ext.FRAGMENT_SHADER_DERIVATIVE_HINT_OES, "[FRAGMENT_SHADER_DERIVATIVE_HINT_OES] is enabled for [" + extName + "]");

    var initVal = gl.getParameter(ext.FRAGMENT_SHADER_DERIVATIVE_HINT_OES);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter() with [FRAGMENT_SHADER_DERIVATIVE_HINT_OES] as target  if [" + extName + "] is on");
    equal(initVal, gl.DONT_CARE, "getParameter([FRAGMENT_SHADER_DERIVATIVE_HINT_OES]) init val is [DONT_CARE]  if [" + extName + "] is on");

    var parameters =
    [
        { 'name': "FASTEST", 'type': gl.FASTEST },
        { 'name': "NICEST", 'type': gl.NICEST },
        { 'name': "DONT_CARE", 'type': gl.DONT_CARE }
     ];

    for (var i = 0, l = parameters.length; i < l; ++i) {
        gl.hint(ext.FRAGMENT_SHADER_DERIVATIVE_HINT_OES, parameters[i].type);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call hint([FRAGMENT_SHADER_DERIVATIVE_HINT_OES]) with mode parameter [" + parameters[i].name + "]");
        equal(gl.getParameter(ext.FRAGMENT_SHADER_DERIVATIVE_HINT_OES), parameters[i].type, "getParameter([FRAGMENT_SHADER_DERIVATIVE_HINT_OES]) must return [" + parameters[i].name + "]");

    }
    gl.hint(ext.FRAGMENT_SHADER_DERIVATIVE_HINT_OES, gl.DONT_CARE);
}

function CalcCompressedDataLength(ext, format, width, height)
{
    switch(format){
        case ext.COMPRESSED_RGB_S3TC_DXT1_EXT:
        case ext.COMPRESSED_RGBA_S3TC_DXT1_EXT:
            return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
        case ext.COMPRESSED_RGBA_S3TC_DXT3_EXT:
        case ext.COMPRESSED_RGBA_S3TC_DXT5_EXT:
            return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
    }
    return 0;
}

function CompressedTexFormatToStr(ext, format){
       switch(format){
        case ext.COMPRESSED_RGB_S3TC_DXT1_EXT:  return "COMPRESSED_RGB_S3TC_DXT1_EXT";
        case ext.COMPRESSED_RGBA_S3TC_DXT1_EXT: return "COMPRESSED_RGBA_S3TC_DXT1_EXT";
        case ext.COMPRESSED_RGBA_S3TC_DXT3_EXT: return "COMPRESSED_RGBA_S3TC_DXT3_EXT";
        case ext.COMPRESSED_RGBA_S3TC_DXT5_EXT: return "COMPRESSED_RGBA_S3TC_DXT5_EXT";
    }
    return "";
}

function CheckAvailableCompressedTexFromats(ext, extName, textureFormats){

    var compressedTextureFormats = [
        { name: "COMPRESSED_RGB_S3TC_DXT1_EXT", value: 0x83F0 },
        { name: "COMPRESSED_RGBA_S3TC_DXT1_EXT", value: 0x83F1 },
        { name: "COMPRESSED_RGBA_S3TC_DXT3_EXT", value: 0x83F2 },
        { name: "COMPRESSED_RGBA_S3TC_DXT5_EXT", value: 0x83F3 }
    ];

    equal(textureFormats.length, 4, "getParameter([COMPRESSED_TEXTURE_FORMATS]) returns 4 formats (COMPRESSED_RGB_S3TC_DXT1_EXT, COMPRESSED_RGBA_S3TC_DXT1_EXT, COMPRESSED_RGBA_S3TC_DXT3_EXT, and COMPRESSED_RGBA_S3TC_DXT5_EXT) if [" + extName + "] is on");

    for (var fIt = 0, fLength = compressedTextureFormats.length; fIt < fLength; ++fIt) {
        var formatName = compressedTextureFormats[fIt].name;
        var formatValue = compressedTextureFormats[fIt].value;

        ok(ext[formatName] !== undefined && ext[formatName] !== null, formatName + " is available  if [" + extName + "] is on");
        if(ext[formatName])
            equal(ext[formatName], formatValue, formatName+" = 0x" + formatValue);
    }
}

function CheckCompressedTextureExtension(gl, extName) {

    var arr = gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS);
    ok(arr instanceof Uint32Array, "getParameter([COMPRESSED_TEXTURE_FORMATS]) returns zero-length array of type Uint32Array if [" + extName + "] is off");
    ok(arr && arr.length === 0, "getParameter([COMPRESSED_TEXTURE_FORMATS]) returns zero-length array if [" + extName + "] is off");

    var ext = EnableExtension(gl, extName);

    var textureFormats = gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS);
    CheckAvailableCompressedTexFromats(ext, extName, textureFormats);

    ok(gl.compressedTexImage2D, "Function compressedTexImage2D is available");
    ok(gl.compressedTexSubImage2D, "Function compressedTexImage2D is available");

    if (!gl.compressedTexImage2D || !gl.compressedTexSubImage2D) {
        return;
    }


    var width = 8, height = 8;
    var wrongWidth = 3, wrongHeight = 3;
    var xOffset = 4, yOffset = 4;
    var wrongXOffset = 3, wrongYOffset = 3;
    for (var i = 0; i < textureFormats.length; ++i) {

        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);

        gl.compressedTexImage2D(gl.TEXTURE_2D, 0, textureFormats[i], wrongWidth, wrongHeight, 0,
            new Uint8Array(CalcCompressedDataLength(ext, textureFormats[i], wrongWidth, wrongHeight)));
        equal(gl.getError(), gl.INVALID_OPERATION, "getError() generates INVALID_OPERATION after call compressedTexImage2D([" + CompressedTexFormatToStr(textureFormats[i]) + "] when  level=0 but width and height is not a multiple of 4");

         var length = CalcCompressedDataLength(ext, textureFormats[i], width, height);

        gl.compressedTexImage2D(gl.TEXTURE_2D, 0, textureFormats[i], width, height, 0, new Uint8Array(length - 1));
        equal(gl.getError(), gl.INVALID_VALUE, "getError()generates INVALID_VALUE after compressedTexImage2D([" + CompressedTexFormatToStr(textureFormats[i]) + "] if pixels length is wrong");

        var uint8Arr = new Uint8Array(length);
        gl.compressedTexImage2D(gl.TEXTURE_2D, 0, textureFormats[i], width, height, 0, uint8Arr);
        equal(gl.getError(), gl.NO_ERROR, "getError()== NO_ERROR after compressedTexImage2D([" + CompressedTexFormatToStr(textureFormats[i]) + "] ");

        var wrongSubArr = new Uint8Array(CalcCompressedDataLength(ext, textureFormats[i], wrongWidth, wrongHeight));
        gl.compressedTexSubImage2D(gl.TEXTURE_2D, 0, xOffset, yOffset, wrongWidth, wrongHeight, textureFormats[i], wrongSubArr);
        equal(gl.getError(), gl.INVALID_OPERATION , "getError() generates INVALID_OPERATION  after compressedTexSubImage2D([" + CompressedTexFormatToStr(textureFormats[i]) + "] if width or height is not a multiple of 4");

        var wrongSubArr = new Uint8Array(CalcCompressedDataLength(ext, textureFormats[i], width - wrongXOffset, height - wrongYOffset));
        gl.compressedTexSubImage2D(gl.TEXTURE_2D, 0, wrongXOffset, wrongYOffset, width - wrongXOffset, height - wrongYOffset, textureFormats[i], wrongSubArr);
        equal(gl.getError(), gl.INVALID_OPERATION , "getError() generates INVALID_OPERATION  after compressedTexSubImage2D([" + CompressedTexFormatToStr(textureFormats[i]) + "] if xOffset or yOffset is not a multiple of 4");

        var uint8SubArr = new Uint8Array(CalcCompressedDataLength(ext, textureFormats[i], width - xOffset - 1, height - yOffset - 1));
        gl.compressedTexSubImage2D(gl.TEXTURE_2D, 0, xOffset, yOffset, width - xOffset, height - yOffset, textureFormats[i], uint8SubArr);
        equal(gl.getError(), gl.INVALID_VALUE, "getError()generates INVALID_VALUE  after compressedTexSubImage2D([" + CompressedTexFormatToStr(textureFormats[i]) + "] if pixels length is wrong");

        var uint8SubArr = new Uint8Array(CalcCompressedDataLength(ext, textureFormats[i], width - xOffset, height - yOffset));
        gl.compressedTexSubImage2D(gl.TEXTURE_2D, 0, xOffset, yOffset, width - xOffset, height - yOffset, textureFormats[i], uint8SubArr);
        equal(gl.getError(), gl.NO_ERROR, "getError()== NO_ERROR after compressedTexSubImage2D([" + CompressedTexFormatToStr(textureFormats[i]) + "] ");

        //gl.deleteTexture(tex);
    }
}

module("WebGLExtensions");

test("verify getSupportedExtensions() && getExtension()", function () {
    var gl = GetCleanContext();

    var val = gl.getExtension("invalid_string");
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getExtension() with invalid extension");
    strictEqual(val, null, "getExtension() must return null with invalid extension");

    var extNames = gl.getSupportedExtensions();
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getSupportedExtensions()");

    for (var i = 0, l = extNames.length; i < l; ++i) {
        var extName = extNames[i];
        if (extName == "OES_texture_float") {
            CheckOESTextureFloatExtension(gl, extName);
        }
        else if (extName == "OES_standard_derivatives") {
            CheckOESStandardDerivativesExtension(gl, extName);
        }
        else if(extName == "WEBGL_compressed_texture_s3tc" || extName == "WEBKIT_WEBGL_compressed_textures"){
            CheckCompressedTextureExtension(gl, extName);
        }
        else {
            EnableExtension(gl, extName);
        }

        var ext = gl.getExtension(extName.toUpperCase());
        ok(ext !== null && ext !== undefined, "Check that extension strings are case-insensitive with [" + extName.toUpperCase() + "]");
    }

    if (extNames.length > 0) {
        var ext1 = gl.getExtension(extNames[0]);
        var ext2 = gl.getExtension(extNames[0]);
        strictEqual(ext1, ext2, "getExtension() with the same extension string shall return the same object")
    }

});