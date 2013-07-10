
function CheckTexImage2DData(gl, width, height, checkParam, target) {
    var tex = gl.createTexture();
    gl.bindTexture(target.texTarget, tex);

    var arr = CreateDataBuffer(gl, checkParam.format, checkParam.type, width, height);

    gl.texImage2D(target.value, 0, checkParam.format, width, height, 0, checkParam.format, checkParam.type, arr);
    equal(gl.getError(), gl.NO_ERROR, "texImage2D(targetName : " + target.name + ", " + checkParam.desc + ") must not generate error");

    gl.deleteTexture(tex);
}

function CheckTexSubImage2DData(gl, width, height, checkParam, target) {
    var tex = gl.createTexture();
    gl.bindTexture(target.texTarget, tex);
    gl.texImage2D(target.value, 0, checkParam.format, width, height, 0, checkParam.format, checkParam.type, null);

    var arr = CreateDataBuffer(gl, checkParam.format, checkParam.type, width / 2, height / 2);
    gl.texSubImage2D(target.value, 0, 0, 0, width / 2, height / 2, checkParam.format, checkParam.type, arr);
    equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(targetName : " + target.name + ", " + checkParam.desc + ") must not generate error");

    gl.deleteTexture(tex);
}

//////////////////////////////////////////////////////////////////////////
module("WebGLTexture");

test("verify createTexture()", function () {
    var gl = GetCleanContext();

    var tex1 = gl.createTexture();
    ok(tex1 != null || tex1 != undefined, "WebGLTexture can be created");
    ok(tex1 instanceof WebGLTexture, "createTexture() returned value instanceof WebGLTexture");
    equal(gl.getError(), gl.NO_ERROR, "createTexture() must not generate errors");

    var tex2 = gl.createTexture();
    ok(tex1 !== tex2, "recall createTexture() returns different textures");
    equal(gl.getError(), gl.NO_ERROR, "recall createTexture() must not generate errors");
});

test("verify deleteTexture()", function () {
    var gl = GetCleanContext();

    var tex = gl.createTexture();
    gl.deleteTexture(tex);
    equal(gl.getError(), gl.NO_ERROR, "deleteTexture() must not generate errors");

    gl.deleteTexture(tex);
    equal(gl.getError(), gl.NO_ERROR, "deleteTexture() with deleted texture must not generate errors");

    gl.deleteTexture(null);
    equal(gl.getError(), gl.NO_ERROR, "deleteTexture() with null texture must not generate errors");

    gl.deleteTexture(undefined);
    equal(gl.getError(), gl.NO_ERROR, "deleteTexture() with undefined texture must not generate errors");
});

test("verify bindTexture() && getParameter() with TEXTURE_BINDING_2D and TEXTURE_BINDING_CUBE_MAP", function () {
    var gl = GetCleanContext();

    gl.bindTexture(-1, null);
    equal(gl.getError(), gl.INVALID_ENUM, "bindTexture() must generate INVALID_ENUM with invalid target");

    var bindTex2d = gl.getParameter(gl.TEXTURE_BINDING_2D);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(TEXTURE_BINDING_2D) must not generate errors");
    ok(bindTex2d == null || bindTex2d == undefined, "getParameter(TEXTURE_BINDING_2D) returns null(undefined) if no WebGLTexture bound");

    var tex2d = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex2d);
    equal(gl.getError(), gl.NO_ERROR, "bindTexture([TEXTURE_2D]) must not generate errors");
    ok(gl.getParameter(gl.TEXTURE_BINDING_2D) === tex2d, "getParameter(TEXTURE_BINDING_2D) returns just bounded texture");

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex2d);
    equal(gl.getError(), gl.INVALID_OPERATION, "bindTexture([TEXTURE_CUBE_MAP]) must generate INVALID_OPERATION if texture was previously bounded with [TEXTURE_2D] target");

    var bindTexCube = gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(TEXTURE_BINDING_CUBE_MAP) must not generate errors");
    ok(bindTexCube == null || bindTexCube == undefined, "getParameter(TEXTURE_BINDING_CUBE_MAP) returns null(undefined) if no WebGLTexture bound");

    var texCube = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texCube);
    equal(gl.getError(), gl.NO_ERROR, "bindTexture([TEXTURE_CUBE_MAP]) must not generate errors");
    ok(gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP) === texCube, "getParameter(TEXTURE_BINDING_CUBE_MAP) returns just bounded texture");

    gl.bindTexture(gl.TEXTURE_2D, texCube);
    equal(gl.getError(), gl.INVALID_OPERATION, "bindTexture([TEXTURE_2D]) must generate INVALID_OPERATION if texture was previously bounded with [TEXTURE_CUBE_MAP] target");

    gl.deleteTexture(tex2d);
    bindTex2d = gl.getParameter(gl.TEXTURE_BINDING_2D);
    ok(bindTex2d == null || bindTex2d == undefined, "getParameter(TEXTURE_BINDING_2D) must return null(undefened) after call deleteTexture()");
    gl.deleteTexture(texCube);
    bindTexCube = gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP);
    ok(bindTexCube == null || bindTexCube == undefined, "getParameter(TEXTURE_BINDING_CUBE_MAP) must return null(undefened) after call deleteTexture()");

    gl.bindTexture(gl.TEXTURE_2D, null);
    equal(gl.getError(), gl.NO_ERROR, "bindTexture([TEXTURE_2D]) with null texture must not generate errors");
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    equal(gl.getError(), gl.NO_ERROR, "bindTexture([TEXTURE_CUBE_MAP]) with null texture must not generate errors");

    // 1)
    //     gl.bindTexture(gl.TEXTURE_2D, 0);
    //     equal(gl.getError(), gl.NO_ERROR, "bindTexture([TEXTURE_2D]) with 0 texture param must not generate errors");
    //     gl.bindTexture(gl.TEXTURE_CUBE_MAP, 0);
    //     equal(gl.getError(), gl.NO_ERROR, "bindTexture([TEXTURE_CUBE_MAP]) with o texture param must not generate errors");
});

test("verify isTexture()", function () {
    var gl = GetCleanContext();

    var result = gl.isTexture(null);
    equal(gl.getError(), gl.NO_ERROR, "isTexture() with null texture must not generate errors");
    strictEqual(result, false, "isTexture() == false with null texture");

    result = gl.isTexture(undefined);
    equal(gl.getError(), gl.NO_ERROR, "isTexture() with undefined texture must not generate errors");
    strictEqual(result, false, "isTexture() == false with undefined texture");

    var tex2d = gl.createTexture();
    result = gl.isTexture(tex2d);
    equal(gl.getError(), gl.NO_ERROR, "isTexture() with not bounded texture2d must not generate errors");
    strictEqual(result, false, "isTexture() == false with not bounded texture2d");

    gl.bindTexture(gl.TEXTURE_2D, tex2d);
    result = gl.isTexture(tex2d);
    equal(gl.getError(), gl.NO_ERROR, "isTexture() with bounded texture2d must not generate errors");
    strictEqual(result, true, "isTexture() == true with bounded texture2d");

    gl.deleteTexture(tex2d);
    result = gl.isTexture(tex2d);
    equal(gl.getError(), gl.NO_ERROR, "isTexture() with deleted texture2d must not generate errors");
    strictEqual(result, false, "isTexture() == false with deleted texture2d");
});

test("verify getTexParameter()", function () {
    var gl = GetCleanContext();

    gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER);
    equal(gl.getError(), gl.INVALID_OPERATION, "If no WebGLTexture is bound, getTexParameter() generates INVALID_OPERATION");

    var targets =
    [
        { 'name': "TEXTURE_2D", 'value': gl.TEXTURE_2D },
        { 'name': "TEXTURE_CUBE_MAP", 'value': gl.TEXTURE_CUBE_MAP }
    ];

    var params =
    [
        { 'name': "TEXTURE_MAG_FILTER", 'value': gl.TEXTURE_MAG_FILTER, 'initVal': gl.LINEAR },
        { 'name': "TEXTURE_MIN_FILTER", 'value': gl.TEXTURE_MIN_FILTER, 'initVal': gl.NEAREST_MIPMAP_LINEAR },
        { 'name': "TEXTURE_WRAP_S", 'value': gl.TEXTURE_WRAP_S, 'initVal': gl.REPEAT },
        { 'name': "TEXTURE_WRAP_T", 'value': gl.TEXTURE_WRAP_T, 'initVal': gl.REPEAT }
    ];

    for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
        var tex = gl.createTexture();
        gl.bindTexture(targets[tIt].value, tex);

        for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {
            var val = gl.getTexParameter(targets[tIt].value, params[pIt].value);
            equal(gl.getError(), gl.NO_ERROR, "getTexParameter([" + targets[tIt].name + "," + params[pIt].name + "]) must not generate errors");
            strictEqual(val, params[pIt].initVal, "Check init val returned by getTexParameter([" + targets[tIt].name + "," + params[pIt].name + "])");
        }
        gl.deleteTexture(tex);
    }

    var tex2d = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex2d);

    gl.getTexParameter(-1, gl.TEXTURE_MAG_FILTER);
    equal(gl.getError(), gl.INVALID_ENUM, "getTexParameter() must generate INVALID_ENUM with invalid target parameter");
    gl.getTexParameter(gl.TEXTURE_2D, -1);
    equal(gl.getError(), gl.INVALID_ENUM, "getTexParameter() must generate INVALID_ENUM with invalid pname parameter");

    gl.deleteTexture(tex2d);
});

test("verify activeTexture()", function () {
    var gl = GetCleanContext();

    var initVal = gl.getParameter(gl.ACTIVE_TEXTURE);
    equal(gl.getError(), gl.NO_ERROR, "getParameter([ACTIVE_TEXTURE]) must not generate errors");

    gl.activeTexture(-1);
    equal(gl.getError(), gl.INVALID_ENUM, "activeTexture() must generate INVALID_ENUM with invalid parameter");

    var maxTexUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
    equal(gl.getError(), gl.NO_ERROR, "getParameter([MAX_COMBINED_TEXTURE_IMAGE_UNITS]) must not generate errors");

    gl.activeTexture(maxTexUnits);
    equal(gl.getError(), gl.INVALID_ENUM, "activeTexture() must generate INVALID_ENUM if texture >= MAX_COMBINED_TEXTURE_IMAGE_UNITS");

    for (var texIt = gl.TEXTURE0, i = 0; texIt <= gl.TEXTURE31 && i < maxTexUnits; ++texIt, ++i) {
        gl.activeTexture(texIt);
        equal(gl.getError(), gl.NO_ERROR, "activeTexture(TEXTURE" + i + ") must not generate errors");
        strictEqual(gl.getParameter(gl.ACTIVE_TEXTURE), texIt, "getParameter([ACTIVE_TEXTURE]) returns [TEXTURE" + i + "] after call activeTexture(TEXTURE" + i + ")");
    }

    gl.activeTexture(initVal);
});

test("verify texImage2D() target parameter", function () {
    var gl = GetCleanContext();

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    equal(gl.getError(), gl.INVALID_OPERATION, "texImage2D() must generate INVALID_OPERATION if no WebGLTexture is bound");

    var testTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, testTex);
    gl.texImage2D(-1, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    equal(gl.getError(), gl.INVALID_ENUM, "texImage2D() must generate INVALID_ENUM with invaid target param");
    gl.deleteTexture(testTex);

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

    for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
        var tex = gl.createTexture();
        gl.bindTexture(targets[tIt].texTarget, tex);

        gl.texImage2D(targets[tIt].value, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.NO_ERROR, "texImage2D(" + targets[tIt].name + ") must not generate errors");

        gl.deleteTexture(tex);
    }
});

test("verify texImage2D() level parameter", function () {
    var gl = GetCleanContext();

    var maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    equal(gl.getError(), gl.NO_ERROR, "getParameter([MAX_TEXTURE_SIZE]) must not generate errors");

    var maxTexCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    equal(gl.getError(), gl.NO_ERROR, "getParameter([MAX_CUBE_MAP_TEXTURE_SIZE]) must not generate errors");

    var maxLevel2dValue = Math.log(maxTexSize) / Math.LN2;
    var maxLevelCubeValue = Math.log(maxTexCubeSize) / Math.LN2;
    var params =
    [
        { 'targetName': "TEXTURE_2D", 'target': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D, 'maxLevelValue': maxLevel2dValue },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_X", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP, 'maxLevelValue': maxLevelCubeValue },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP, 'maxLevelValue': maxLevelCubeValue },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP, 'maxLevelValue': maxLevelCubeValue },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP, 'maxLevelValue': maxLevelCubeValue },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP, 'maxLevelValue': maxLevelCubeValue },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP, 'maxLevelValue': maxLevelCubeValue }
    ];

    for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {
        var tex = gl.createTexture();
        gl.bindTexture(params[pIt].texTarget, tex);

        gl.texImage2D(params[pIt].target, -1, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE with level < 0");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.NO_ERROR, "texImage2D(" + params[pIt].targetName + ") must not generate errors if level  = 0");

        gl.texImage2D(params[pIt].target, 1, gl.RGB, 60, 60, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if level > 0 and width/height is not a power of 2");

        gl.texImage2D(params[pIt].target, params[pIt].maxLevelValue + 1, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if level > log2(max), where max = [MAX_TEXTURE_SIZE] with [TEXTURE_2D] or [MAX_CUBE_MAP_TEXTURE_SIZE] with [TEXTURE_CUBE_MAP]");

        gl.texImage2D(params[pIt].target, params[pIt].maxLevelValue, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.NO_ERROR, "texImage2D(" + params[pIt].targetName + ") must not generate errors if level = log2(max), where max = [MAX_TEXTURE_SIZE] with [TEXTURE_2D] or [MAX_CUBE_MAP_TEXTURE_SIZE] with [TEXTURE_CUBE_MAP]");

        gl.deleteTexture(tex);
    }
});

test("verify texImage2D() width && height parameters", function () {
    var gl = GetCleanContext();

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, -1, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(TEXTURE_2D) must generate INVALID_VALUE if width < 0");
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 64, -1, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(TEXTURE_2D) must generate INVALID_VALUE if height < 0");

    var maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    equal(gl.getError(), gl.NO_ERROR, "getParameter([MAX_TEXTURE_SIZE]) must not generate errors");

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, maxTexSize + 1, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(TEXTURE_2D) must generate INVALID_VALUE if width > MAX_TEXTURE_SIZE");
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 64, maxTexSize + 1, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(TEXTURE_2D) must generate INVALID_VALUE if height > MAX_TEXTURE_SIZE");

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 32, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    equal(gl.getError(), gl.NO_ERROR, "texImage2D(TEXTURE_2D) must not generate errors if width < 64");
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 64, 32, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    equal(gl.getError(), gl.NO_ERROR, "texImage2D(TEXTURE_2D) must not errors if height < 64");

    gl.deleteTexture(tex);

    var params =
    [
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_X", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_X },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_X },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Y },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Z },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z }
    ];

    var maxTexCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    equal(gl.getError(), gl.NO_ERROR, "getParameter([MAX_CUBE_MAP_TEXTURE_SIZE]) must not generate errors");

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

    for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {

        gl.texImage2D(params[pIt].target, 0, gl.RGB, 32, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if width != height");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, -1, -1, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if width or height < 0");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, maxTexCubeSize + 1, maxTexCubeSize + 1, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if width > MAX_TEXTURE_SIZE");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, 8, 8, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.NO_ERROR, "texImage2D(" + params[pIt].targetName + ") must not generate errors if width or height < 16");
    }

    gl.deleteTexture(tex);
});

test("verify texImage2D() format, internalformat parameters", function () {
    var gl = GetCleanContext();

    var params =
    [
        { 'targetName': "TEXTURE_2D", 'target': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_X", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP }
    ];
    var formats =
    [
        { 'name': "ALPHA", 'value': gl.ALPHA },
        { 'name': "LUMINANCE", 'value': gl.LUMINANCE },
        { 'name': "LUMINANCE_ALPHA", 'value': gl.LUMINANCE_ALPHA },
        { 'name': "RGB", 'value': gl.RGB },
        { 'name': "RGBA", 'value': gl.RGBA }
    ];
    for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {
        var tex = gl.createTexture();
        gl.bindTexture(params[pIt].texTarget, tex);

        for (var fIt = 0, fLength = formats.length; fIt < fLength; ++fIt) {

            gl.texImage2D(params[pIt].target, 0, formats[fIt].value, 64, 64, 0, formats[fIt].value, gl.UNSIGNED_BYTE, null);
            equal(gl.getError(), gl.NO_ERROR, "texImage2D(" + params[pIt].targetName + ") must not generate errors with format param [" + formats[fIt].name + "]");

            gl.texImage2D(params[pIt].target, 0, gl.RGBA, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
            equal(gl.getError(), gl.INVALID_OPERATION, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_OPERATION if format does not match internalformat");

            // проверять оба параметра по отдельности (format и internalformat) не представляется возможным, т.к. непонятно, что сработает раньше:
            // INVALID_OPERATION из-за разных значений format и internalformat или INVALID_ENUM из-за невалидного значения одного из параметров
            gl.texImage2D(params[pIt].target, 0, -1, 64, 64, 0, -1, gl.UNSIGNED_BYTE, null);
            equal(gl.getError(), gl.INVALID_ENUM, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_ENUM with invalid format or internalformat");
        }

        gl.deleteTexture(tex);
    }
});

test("verify texImage2D() border, type parameters", function () {
    var gl = GetCleanContext();

    var params =
    [
        { 'targetName': "TEXTURE_2D", 'target': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_X", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP }
    ];

    for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {
        var tex = gl.createTexture();
        gl.bindTexture(params[pIt].texTarget, tex);

        gl.texImage2D(params[pIt].target, 0, gl.RGB, 64, 64, 100, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.INVALID_VALUE, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if border != 0");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, 64, 64, 0, gl.RGB, -1, null);
        equal(gl.getError(), gl.INVALID_ENUM, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_ENUM with invalid type param");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, 64, 64, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_6_5, null);
        equal(gl.getError(), gl.INVALID_OPERATION, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_OPERATION if type is UNSIGNED_SHORT_5_6_5 and format is not RGB");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_SHORT_4_4_4_4, null);
        equal(gl.getError(), gl.INVALID_OPERATION, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_OPERATION if type is UNSIGNED_SHORT_4_4_4_4 and format is not RGBA");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_SHORT_5_5_5_1, null);
        equal(gl.getError(), gl.INVALID_OPERATION, "texImage2D(" + params[pIt].targetName + ") must generate INVALID_OPERATION if type is UNSIGNED_SHORT_5_5_5_1 and format is not RGBA");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        equal(gl.getError(), gl.NO_ERROR, "texImage2D(" + params[pIt].targetName + ") must not generate INVALID_ENUM with type = [UNSIGNED_BYTE]");

        gl.deleteTexture(tex);
    }
});

test("verify texImage2D() pixels parameter", function () {
    var gl = GetCleanContext();

    var width = 64, height = 64;
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    var uint8Arr = new Uint8Array(width * height * 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, uint8Arr);
    equal(gl.getError(), gl.INVALID_OPERATION, "texImage2D() must generate INVALID_OPERATION if type is UNSIGNED_SHORT_5_5_5_1 and data is not Uint16Array");
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, uint8Arr);
    equal(gl.getError(), gl.INVALID_OPERATION, "texImage2D() must generate INVALID_OPERATION if type is UNSIGNED_SHORT_5_6_5 and data is not Uint16Array");
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4, uint8Arr);
    equal(gl.getError(), gl.INVALID_OPERATION, "texImage2D() must generate INVALID_OPERATION if type is UNSIGNED_SHORT_4_4_4_4 and data is not Uint16Array");

    var uint16Arr = new Uint16Array(width * height * 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, uint16Arr);
    equal(gl.getError(), gl.INVALID_OPERATION, "texImage2D() must generate INVALID_OPERATION if type is UNSIGNED_BYTE and data is not Uint8Array");

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, uint16Arr);
    equal(gl.getError(), gl.NO_ERROR, "texImage2D(UNSIGNED_SHORT_5_5_5_1) must not generate error");

    gl.deleteTexture(tex);

    var params =
    [
        { 'desc': "type: UNSIGNED_BYTE, format: RGB", 'type': gl.UNSIGNED_BYTE, 'format': gl.RGB },
        { 'desc': "type: UNSIGNED_BYTE, format: RGBA", 'type': gl.UNSIGNED_BYTE, 'format': gl.RGBA },
        { 'desc': "type: UNSIGNED_BYTE, format: ALPHA", 'type': gl.UNSIGNED_BYTE, 'format': gl.ALPHA },
        { 'desc': "type: UNSIGNED_BYTE, format: LUMINANCE", 'type': gl.UNSIGNED_BYTE, 'format': gl.LUMINANCE },
    // 3)
    // { 'desc': "type: UNSIGNED_BYTE, format: LUMINANCE_ALPHA", 'type': gl.UNSIGNED_BYTE, 'format': gl.LUMINANCE_ALPHA },
        {'desc': "type: UNSIGNED_SHORT_4_4_4_4, format: RGB", 'type': gl.UNSIGNED_SHORT_4_4_4_4, 'format': gl.RGBA },
        { 'desc': "type: UNSIGNED_SHORT_5_6_5, format: RGB", 'type': gl.UNSIGNED_SHORT_5_6_5, 'format': gl.RGB },
        { 'desc': "type: UNSIGNED_SHORT_5_5_5_1, format: RGBA", 'type': gl.UNSIGNED_SHORT_5_5_5_1, 'format': gl.RGBA }
    ];

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

    for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {
        for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
            CheckTexImage2DData(gl, width, height, params[pIt], targets[tIt]);
        }
    }
});

test("verify generateMipmap()", function () {
    var gl = GetCleanContext();


    gl.generateMipmap(-1);
    equal(gl.getError(), gl.INVALID_ENUM, "generateMipmap() must generate INVALID_ENUM with invaid param");

    gl.generateMipmap(gl.TEXTURE_2D);
    equal(gl.getError(), gl.INVALID_OPERATION, "generateMipmap() must generate INVALID_OPERATION if no WebGLTexture bound");

    var tex2d = CreateTexture2D(gl, gl.RGB, 33, 33);

    gl.generateMipmap(gl.TEXTURE_2D);
    equal(gl.getError(), gl.INVALID_OPERATION, "generateMipmap(TEXTURE_2D) must generate INVALID_OPERATION if width or height is not a power of 2");

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);
    equal(gl.getError(), gl.NO_ERROR, "generateMipmap(TEXTURE_2D) must not generate errors");

    gl.deleteTexture(tex2d);

    var cubeTargets =
    [
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_X", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_X },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_X },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Y },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y },
        { 'name': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_POSITIVE_Z },
        { 'name': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'value': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z }
    ];

    for (var tIt = 0, tLength = cubeTargets.length; tIt < tLength; ++tIt) {
        var texCube = CreateTextureCube(gl, gl.RGB, 64, 64);
        gl.texImage2D(cubeTargets[tIt].value, 0, gl.RGB, 128, 128, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        equal(gl.getError(), gl.INVALID_OPERATION, "generateMipmap(" + cubeTargets[tIt].name + ") must generate INVALID_OPERATION if target is a cube map, but its six faces do not share indentical widths and heights");

        gl.texImage2D(cubeTargets[tIt].value, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, null);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        equal(gl.getError(), gl.INVALID_OPERATION, "generateMipmap(" + cubeTargets[tIt].name + ") must generate INVALID_OPERATION if target is a cube map, but its six faces do not share indentical types");

        gl.texImage2D(cubeTargets[tIt].value, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        equal(gl.getError(), gl.INVALID_OPERATION, "generateMipmap(" + cubeTargets[tIt].name + ") must generate INVALID_OPERATION if target is a cube map, but its six faces do not share indentical formats");

        gl.texImage2D(cubeTargets[tIt].value, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        equal(gl.getError(), gl.NO_ERROR, "generateMipmap(" + cubeTargets[tIt].name + ") must not generate errors");

        gl.deleteTexture(texCube);
    }

    var texCube = CreateTextureCube(gl, gl.RGB, 65, 65);
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    equal(gl.getError(), gl.INVALID_OPERATION, "generateMipmap(TEXTURE_CUBE_MAP) must generate INVALID_OPERATION if width or height is not a power of 2");
    gl.deleteTexture(texCube);
});

test("verify texSubImage2D()", function () {
    var gl = GetCleanContext();

    var buff = CreateDataBuffer(gl, gl.RGB, gl.UNSIGNED_BYTE, 64, 64);

    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 32, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
    equal(gl.getError(), gl.INVALID_OPERATION, "texSubImage2D() must generate INVALID_OPERATION if no WebGLTexture is bound");

    var testTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, testTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 32, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
    equal(gl.getError(), gl.INVALID_OPERATION, "texSubImage2D() must generate INVALID_OPERATION if texture has not been defined by a previous texImage2D()");

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texSubImage2D(-1, 0, 0, 0, 32, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
    equal(gl.getError(), gl.INVALID_ENUM, "texSubImage2D() must generate INVALID_ENUM with invaid target param");

    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 32, 32, gl.RGBA, gl.UNSIGNED_BYTE, buff);
    equal(gl.getError(), gl.INVALID_OPERATION, "texSubImage2D() must generate INVALID_OPERATION if texImage2D() internalformat does not match format texSubImage2D()");

    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, buff);
    equal(gl.getError(), gl.NO_ERROR, "texSubImage2D() must not generte errors if subtexture width & height is zero");

    //2)
//     try
//     {
//         gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 32, 32, gl.RGB, gl.UNSIGNED_BYTE, null);
//         equal(gl.getError(), gl.NO_ERROR, "texSubImage2D() must not generte errors if pixels param is null");
//     }
//     catch (e) {
//         ok(false, "texSubImage2D() throws exception if pixels param is null")
//     }
    
    gl.deleteTexture(testTex);
});

test("verify texSubImage2D() target parameter", function () {
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

    var buff = CreateDataBuffer(gl, gl.RGB, gl.UNSIGNED_BYTE, 64, 64);

    for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
        var tex = gl.createTexture();
        gl.bindTexture(targets[tIt].texTarget, tex);

        gl.texImage2D(targets[tIt].value, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texSubImage2D(targets[tIt].value, 0, 32, 32, 30, 30, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + targets[tIt].name + ") must not generate errors");

        gl.deleteTexture(tex);
    }
});

test("verify texSubImage2D() level parameter", function () {
    var gl = GetCleanContext();

    var maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var maxTexCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    var maxLevelValue = Math.log(maxTexSize) / Math.LN2;
    var params =
    [
        { 'targetName': "TEXTURE_2D", 'target': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_X", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP }
    ];

    var buff = CreateDataBuffer(gl, gl.RGB, gl.UNSIGNED_BYTE, 64, 64);

    for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {
        var tex = gl.createTexture();
        gl.bindTexture(params[pIt].texTarget, tex);
        gl.texImage2D(params[pIt].target, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

        gl.texSubImage2D(params[pIt].target, -1, 0, 0, 64, 64, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.INVALID_VALUE, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE with level < 0");

        gl.texSubImage2D(params[pIt].target, 0, 0, 0, 64, 64, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + params[pIt].targetName + ") must not generate errors if level  = 0");

        gl.texSubImage2D(params[pIt].target, maxLevelValue + 1, 0, 0, 1, 1, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.INVALID_VALUE, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if level > log2(max), where max = [MAX_TEXTURE_SIZE]");

        gl.texImage2D(params[pIt].target, maxLevelValue, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texSubImage2D(params[pIt].target, maxLevelValue, 0, 0, 1, 1, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + params[pIt].targetName + ") must not generate errors if level = log2(max), where max = [MAX_TEXTURE_SIZE]");

        gl.deleteTexture(tex);
    }
});

test("verify texSubImage2D() size parameters", function () {
    var gl = GetCleanContext();

    var params =
    [
        { 'targetName': "TEXTURE_2D", 'target': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_X", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP }
    ];

    var width = 64, height = 64;
    var buff = CreateDataBuffer(gl, gl.RGB, gl.UNSIGNED_BYTE, width, height);

    for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {
        var tex = gl.createTexture();
        gl.bindTexture(params[pIt].texTarget, tex);

        gl.texImage2D(params[pIt].target, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

        gl.texSubImage2D(params[pIt].target, 0, -1, 0, 32, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.INVALID_VALUE, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if xoffset < 0");
        gl.texSubImage2D(params[pIt].target, 0, 0, -1, 32, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.INVALID_VALUE, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if yoffset < 0");

        gl.texSubImage2D(params[pIt].target, 0, 0, 0, -1, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.INVALID_VALUE, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if width < 0");
        gl.texSubImage2D(params[pIt].target, 0, 0, 0, 32, -1, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.INVALID_VALUE, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if height < 0");

        gl.texSubImage2D(params[pIt].target, 0, 100, 0, 32, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.INVALID_VALUE, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if xoffset + width > w");
        gl.texSubImage2D(params[pIt].target, 0, 0, 100, 32, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.INVALID_VALUE, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_VALUE if yoffset + height > h");

        gl.texSubImage2D(params[pIt].target, 0, 0, 0, width, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + params[pIt].targetName + ") must not generate errors if width = w");
        gl.texSubImage2D(params[pIt].target, 0, 0, 0, 32, height, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + params[pIt].targetName + ") must not generate errors if height = h");
        gl.texSubImage2D(params[pIt].target, 0, 0, 0, width, height, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + params[pIt].targetName + ") must not generate errors if width = w && height = h");

        gl.texSubImage2D(params[pIt].target, 0, width / 2, 0, width / 2, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + params[pIt].targetName + ") must not generate errors if xoffset + width = w");
        gl.texSubImage2D(params[pIt].target, 0, 0, height / 2, 32, height / 2, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + params[pIt].targetName + ") must not generate errors if yoffset + height = h");
        gl.texSubImage2D(params[pIt].target, 0, width / 2, height / 2, width / 2, height / 2, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + params[pIt].targetName + ") must not generate errors if xoffset + width = w && yoffset + height = h");

        gl.deleteTexture(tex);
    }
});

test("verify texSubImage2D() format parameter", function () {
    var gl = GetCleanContext();

    var width = 64, height = 64;
    var buff = CreateDataBuffer(gl, gl.RGB, gl.UNSIGNED_BYTE, width, height);

    var params =
    [
        { 'targetName': "TEXTURE_2D", 'target': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_X", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP }
    ];

    var formats =
    [
        { 'name': "ALPHA", 'value': gl.ALPHA },
        { 'name': "LUMINANCE", 'value': gl.LUMINANCE },
        { 'name': "LUMINANCE_ALPHA", 'value': gl.LUMINANCE_ALPHA },
        { 'name': "RGB", 'value': gl.RGB },
        { 'name': "RGBA", 'value': gl.RGBA }
    ];
    for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {
        var tex = gl.createTexture();
        gl.bindTexture(params[pIt].texTarget, tex);
        gl.texImage2D(params[pIt].target, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

        gl.texSubImage2D(params[pIt].target, 0, 0, 0, 32, 32, -1, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.INVALID_ENUM, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_ENUM with invalid format or internalformat");

        for (var fIt = 0, fLength = formats.length; fIt < fLength; ++fIt) {
            gl.texImage2D(params[pIt].target, 0, formats[fIt].value, width, height, 0, formats[fIt].value, gl.UNSIGNED_BYTE, null);

            gl.texSubImage2D(params[pIt].target, 0, 0, 0, 32, 32, formats[fIt].value, gl.UNSIGNED_BYTE, buff);
            equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + params[pIt].targetName + ") must not generate errors with format param [" + formats[fIt].name + "]");
        }

        gl.deleteTexture(tex);
    }
});

test("verify texSubImage2D() type parameter", function () {
    var gl = GetCleanContext();

    var width = 64, height = 64;
    var buff = CreateDataBuffer(gl, gl.RGB, gl.UNSIGNED_BYTE, width, height);

    var params =
    [
        { 'targetName': "TEXTURE_2D", 'target': gl.TEXTURE_2D, 'texTarget': gl.TEXTURE_2D },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_X", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_X", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Y", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_POSITIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP },
        { 'targetName': "TEXTURE_CUBE_MAP_NEGATIVE_Z", 'target': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'texTarget': gl.TEXTURE_CUBE_MAP }
    ];

    for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {
        var tex = gl.createTexture();
        gl.bindTexture(params[pIt].texTarget, tex);
        gl.texImage2D(params[pIt].target, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

        gl.texSubImage2D(params[pIt].target, 0, 0, 0, 32, 32, gl.RGB, -1, buff);
        equal(gl.getError(), gl.INVALID_ENUM, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_ENUM with invalid type param");

        gl.texSubImage2D(params[pIt].target, 0, 0, 0, 32, 32, gl.RGB, gl.UNSIGNED_BYTE, buff);
        equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(" + params[pIt].targetName + ") must not generate INVALID_ENUM with type = [UNSIGNED_BYTE]");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, null);
        gl.texSubImage2D(params[pIt].target, 0, 0, 0, 32, 32, gl.RGBA, gl.UNSIGNED_SHORT_5_6_5, buff);
        equal(gl.getError(), gl.INVALID_OPERATION, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_OPERATION if type is UNSIGNED_SHORT_5_6_5 and format is not RGB");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_SHORT_4_4_4_4, null);
        gl.texSubImage2D(params[pIt].target, 0, 0, 0, 32, 32, gl.RGB, gl.UNSIGNED_SHORT_4_4_4_4, buff);
        equal(gl.getError(), gl.INVALID_OPERATION, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_OPERATION if type is UNSIGNED_SHORT_4_4_4_4 and format is not RGBA");

        gl.texImage2D(params[pIt].target, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_SHORT_5_5_5_1, null);
        gl.texSubImage2D(params[pIt].target, 0, 0, 0, 32, 32, gl.RGB, gl.UNSIGNED_SHORT_5_5_5_1, buff);
        equal(gl.getError(), gl.INVALID_OPERATION, "texSubImage2D(" + params[pIt].targetName + ") must generate INVALID_OPERATION if type is UNSIGNED_SHORT_5_5_5_1 and format is not RGBA");

        gl.deleteTexture(tex);
    }
});

test("verify texSubImage2D() pixels parameter", function () {
    var gl = GetCleanContext();

    var width = 64, height = 64;
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    var uint8Arr = new Uint8Array(width * height * 4);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, null);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 32, 32, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, uint8Arr);
    equal(gl.getError(), gl.INVALID_OPERATION, "texSubImage2D() must generate INVALID_OPERATION if type is UNSIGNED_SHORT_5_5_5_1 and data is not Uint16Array");

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, null);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 32, 32, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, uint8Arr);
    equal(gl.getError(), gl.INVALID_OPERATION, "texSubImage2D() must generate INVALID_OPERATION if type is UNSIGNED_SHORT_5_6_5 and data is not Uint16Array");

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4, null);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 32, 32, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4, uint8Arr);
    equal(gl.getError(), gl.INVALID_OPERATION, "texSubImage2D() must generate INVALID_OPERATION if type is UNSIGNED_SHORT_4_4_4_4 and data is not Uint16Array");

    var uint16Arr = new Uint16Array(width * height * 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 32, 32, gl.RGB, gl.UNSIGNED_BYTE, uint16Arr);
    equal(gl.getError(), gl.INVALID_OPERATION, "texSubImage2D() must generate INVALID_OPERATION if type is UNSIGNED_BYTE and data is not Uint8Array");

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, null);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 32, 32, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, uint16Arr);
    equal(gl.getError(), gl.NO_ERROR, "texSubImage2D(UNSIGNED_SHORT_5_5_5_1) must not generate error");

    gl.deleteTexture(tex);

    var params =
    [
        { 'desc': "type: UNSIGNED_BYTE, format: RGB", 'type': gl.UNSIGNED_BYTE, 'format': gl.RGB },
        { 'desc': "type: UNSIGNED_BYTE, format: RGBA", 'type': gl.UNSIGNED_BYTE, 'format': gl.RGBA },
        { 'desc': "type: UNSIGNED_BYTE, format: ALPHA", 'type': gl.UNSIGNED_BYTE, 'format': gl.ALPHA },
        { 'desc': "type: UNSIGNED_BYTE, format: LUMINANCE", 'type': gl.UNSIGNED_BYTE, 'format': gl.LUMINANCE },
    // 3)
    // { 'desc': "type: UNSIGNED_BYTE, format: LUMINANCE_ALPHA", 'type': gl.UNSIGNED_BYTE, 'format': gl.LUMINANCE_ALPHA },
        {'desc': "type: UNSIGNED_SHORT_4_4_4_4, format: RGB", 'type': gl.UNSIGNED_SHORT_4_4_4_4, 'format': gl.RGBA },
        { 'desc': "type: UNSIGNED_SHORT_5_6_5, format: RGB", 'type': gl.UNSIGNED_SHORT_5_6_5, 'format': gl.RGB },
        { 'desc': "type: UNSIGNED_SHORT_5_5_5_1, format: RGBA", 'type': gl.UNSIGNED_SHORT_5_5_5_1, 'format': gl.RGBA }
    ];

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

    for (var pIt = 0, pLength = params.length; pIt < pLength; ++pIt) {
        for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
            CheckTexSubImage2DData(gl, width, height, params[pIt], targets[tIt]);
        }
    }
});


/*
1) bindTexture() with 0 texture param - no error must be generated
5.13.8 Texture objects
...  If no WebGLTexture is bound (e.g., passing null or !!! 0 !!! to bindTexture)...
2) bug in mozila, crash in chrome - exception generated if pixels parameter is null
5.13.8
texSubImage2D() 
See texImage2D for restrictions on the format and pixels arguments
texImage2D()
If pixels is null, a buffer of sufficient size initialized to 0 is passed. 
3) bug in chrome
вызов texImage2D() с форматом LUMINANCE_ALPHA роняет браузер, если прокинуть массив Uint8Array с размером [width * height * 2 (BytesPerPixel)] 
*/