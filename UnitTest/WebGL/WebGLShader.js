
module("WebGLShader");

test("verify createShader()", function () {
    var gl = GetCleanContext();

    var vShader = gl.createShader(gl.VERTEX_SHADER);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call createShader(VERTEX_SHADER)");
    ok((vShader !== null && vShader !== undefined), "Vertex shader can be created");
    ok(vShader instanceof WebGLShader, "createShader(VERTEX_SHADER) returned value instanceof WebGLShader");
    equal(gl.getShaderParameter(vShader, gl.SHADER_TYPE), gl.VERTEX_SHADER, "Shader type is VERTEX_SHADER after call createShader(VERTEX_SHADER)");

    var fShader = gl.createShader(gl.FRAGMENT_SHADER);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call createShader(VERTEX_SHADER)");
    ok((fShader !== null && fShader !== undefined), "Fragment shader can be created");
    ok(fShader instanceof WebGLShader, "createShader(FRAGMENT_SHADER) returned value instanceof WebGLShader");
    equal(gl.getShaderParameter(fShader, gl.SHADER_TYPE), gl.FRAGMENT_SHADER, "Shader type is FRAGMENT_SHADER after call createShader(FRAGMENT_SHADER)");

    var invalidShader = gl.createShader(-1);
    equal(gl.getError(), gl.INVALID_ENUM, "getError() == INVALID_ENUM after call createShader() with invalid value");
});

test("verify deleteShader()", function () {
    var gl = GetCleanContext();

    var shader = gl.createShader(gl.VERTEX_SHADER);
    gl.deleteShader(shader);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call deleteShader(VERTEX_SHADER)");
    equal(gl.getShaderParameter(shader, gl.DELETE_STATUS), null, "Deleted shader can't return its status");

    gl.getShaderParameter(shader, gl.SHADER_TYPE);
    equal(gl.getError(), gl.INVALID_VALUE, "getShaderParameter() for deleted shader generates INVALID_VALUE");

    gl.deleteShader(shader);
    equal(gl.getError(), gl.NO_ERROR, "Call deleteShader() for shader has already been deleted must not generate errors (5.13.9)");

    gl.deleteShader(null);
    equal(gl.getError(), gl.NO_ERROR, "Call deleteShader() for null must not generate errors");

    gl.deleteShader(undefined);
    equal(gl.getError(), gl.NO_ERROR, "Call deleteShader() for undefined must not generate errors");
});

test("verify shaderSource() && getShaderSource()", function () {
    var gl = GetCleanContext();

    var shader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(undefined, undefined);
    equal(gl.getError(), gl.INVALID_VALUE, "Call shaderSource() with invalid parameters generates INVALID_VALUE");
    gl.shaderSource(undefined, src);
    equal(gl.getError(), gl.INVALID_VALUE, "Call shaderSource() with undefined shader parameter generates INVALID_VALUE");
    gl.shaderSource(shader, undefined);
    equal(gl.getError(), gl.NO_ERROR, "Call shaderSource() with undefined source must not generate errors");

    gl.getShaderSource(undefined);
    equal(gl.getError(), gl.INVALID_VALUE, "getShaderSource() with undefined shader generates INVALID_VALUE");
    gl.getShaderSource(null);
    equal(gl.getError(), gl.INVALID_VALUE, "getShaderSource() with null shader generates INVALID_VALUE");

    var src = "some source";
    gl.shaderSource(shader, src);
    equal(gl.getError(), gl.NO_ERROR, "Call shaderSource() with any string source must not generate errors");
    equal(gl.getShaderSource(shader), src, "getShaderSource() return the same string source");

    var srcNonASCIIComments =
        "attribute vec3 aVertexPosition; // комментарий на русском €зыке/n" +
        "uniform mat4 uMVMatrix;" +
        "uniform mat4 uPMatrix;" +
        "void main(void) {" +
        "   gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
        "}";

    gl.shaderSource(shader, srcNonASCIIComments);
    equal(gl.getError(), gl.NO_ERROR, "shaderSource() generates no errors for any national symbols may be used in GLSL comments");

    var srcNonASCIISymbols =
        "attribute vec3 аѕос;" +
        "uniform mat4 uMVMatrix;" +
        "uniform mat4 uPMatrix;" +
        "void main(void) {" +
        "   gl_Position = uPMatrix * uMVMatrix * vec4(аѕос, 1.0);" +
        "}";
    gl.shaderSource(shader, srcNonASCIISymbols);
    equal(gl.getError(), gl.INVALID_VALUE, "shaderSource() generates INVALID_VALUE if there are national symbols in shader source");

    gl.deleteShader(shader);

    gl.getShaderSource(shader);
    equal(gl.getError(), gl.INVALID_VALUE, "getShaderSource() with deleted shader generates INVALID_VALUE");
    gl.shaderSource(shader, src);
    equal(gl.getError(), gl.INVALID_VALUE, "shaderSource() with deleted shader generates INVALID_VALUE");
});

test("verify compileShader()", function () {
    var gl = GetCleanContext();

    gl.compileShader(undefined);
    equal(gl.getError(), gl.INVALID_VALUE, "Call compileShader() with undefined shader parameter generates INVALID_VALUE");

    gl.compileShader(null);
    equal(gl.getError(), gl.INVALID_VALUE, "Call compileShader() with null shader parameter generates INVALID_VALUE");

    var shader = gl.createShader(gl.VERTEX_SHADER);
    strictEqual(gl.getShaderParameter(shader, gl.COMPILE_STATUS), false, "getShaderParameter(COMPILE_STATUS) must return false with not compiled shader");

    gl.compileShader(shader);
    equal(gl.getError(), gl.NO_ERROR, "compileShader() must not generate errors if no source code loaded in shader");
    strictEqual(gl.getShaderParameter(shader, gl.COMPILE_STATUS), false, "getShaderParameter(COMPILE_STATUS) must return false with no source code loaded in shader");
    ok(gl.getShaderInfoLog(shader) && gl.getShaderInfoLog(shader).length > 0, "Shader log is not empty if call compileShader() for shader with no source code loaded ");

    gl.shaderSource(shader, "source");
    gl.compileShader(shader);
    equal(gl.getError(), gl.NO_ERROR, "compileShader() must not generate errors if unacceptable source code loaded in shader");
    strictEqual(gl.getShaderParameter(shader, gl.COMPILE_STATUS), false, "getShaderParameter(COMPILE_STATUS) must return false with unacceptable source code loaded in shader");
    ok(gl.getShaderInfoLog(shader) && gl.getShaderInfoLog(shader).length > 0, "Shader log is not empty in call compileShader() for shader with unacceptable source code");

    var srcWithBuiltInNames =
        "uniform vec3 webgl_Position;"
        "void main(void) {" +
            "   gl_Position = webgl_Position;"
        "}";
    gl.shaderSource(shader, srcWithBuiltInNames);
    gl.compileShader(shader);
    equal(gl.getError(), gl.NO_ERROR, "compileShader() must not generate errors if built-in names (webgl_) in shader");
    strictEqual(gl.getShaderParameter(shader, gl.COMPILE_STATUS), false, "getShaderParameter(COMPILE_STATUS) must return false with  built-in names (webgl_) in shader");
    ok(gl.getShaderInfoLog(shader) && gl.getShaderInfoLog(shader).length > 0, "Shader log is not empty if call compileShader() with shader contained built-in names (webgl_)");

    var srcWithBuiltInNames2 =
        "uniform vec3 _webgl_Position;"
        "void main(void) {" +
            "   gl_Position = _webgl_Position;"
        "}";
        gl.shaderSource(shader, srcWithBuiltInNames2);
    gl.compileShader(shader);
    equal(gl.getError(), gl.NO_ERROR, "compileShader() must not generate errors if built-in names (_webgl_) in shader");
    strictEqual(gl.getShaderParameter(shader, gl.COMPILE_STATUS), false, "getShaderParameter(COMPILE_STATUS) must return false with  built-in names (_webgl_) in shader");
    ok(gl.getShaderInfoLog(shader) && gl.getShaderInfoLog(shader).length > 0, "Shader log is not empty if call compileShader() with shader contained built-in names (_webgl_)");

    //see https://bitbucket.org/MOD/iewebgl/issue/9/maximum-glsl-token-size
    var more256TokenSizeSrc =
    "uniform mat4 a1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789;" +
    "void main(void) {" +
    "   gl_Position = vec4(1.0);" +
    "}";

    gl.shaderSource(shader, more256TokenSizeSrc);
    gl.compileShader(shader);
    equal(gl.getError(), gl.NO_ERROR, "compileShader() must not generate errors if identifier name is more than 256 characters in shader");
    strictEqual(gl.getShaderParameter(shader, gl.COMPILE_STATUS), false, "getShaderParameter(COMPILE_STATUS) == false if identifier name is more than 256 characters in shader");
    ok(gl.getShaderInfoLog(shader) && gl.getShaderInfoLog(shader).length > 0, "Shader log is not empty if call compileShader() with shader contained identifier name more than 256 characters in length");

    var less256TokenSizeSrc =
    "uniform mat4 a12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234;" +
    "void main(void) {" +
    "   gl_Position = vec4(1.0);" +
    "}";

    gl.shaderSource(shader, less256TokenSizeSrc);
    gl.compileShader(shader);
    equal(gl.getError(), gl.NO_ERROR, "compileShader() must not generate errors if identifier name <= 256 characters in shader");
    strictEqual(gl.getShaderParameter(shader, gl.COMPILE_STATUS), false, "getShaderParameter(COMPILE_STATUS) == false if identifier name <= 256 characters in shader");

    var src =
        "attribute vec3 aVertexPosition;" +
        "uniform mat4 uMVMatrix;" +
        "uniform mat4 uPMatrix;" +
        "void main(void) {" +
        "   gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
        "}";

    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call compileShader()");
    strictEqual(gl.getShaderParameter(shader, gl.COMPILE_STATUS), true, "Shader compile status must be set after successfully call compileShader()");
    ok(gl.getShaderInfoLog(shader) == null || gl.getShaderInfoLog(shader).length == 0, "Shader log is empty after successfully call compileShader()");

    gl.deleteShader(shader);

    gl.compileShader(shader);
    equal(gl.getError(), gl.INVALID_VALUE, "compileShader() with deleted shader parameter generates INVALID_VALUE");

});

test("verify isShader()", function () {
    var gl = GetCleanContext();

    var shader = gl.createShader(gl.VERTEX_SHADER);
    strictEqual(gl.isShader(shader), true, "Call isShader() succeded for shader");
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call isShader()");

    gl.deleteShader(shader);
    strictEqual(gl.isShader(shader), false, "isShader() == false for deleted shader");
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call isShader() for deleted shader");

    notStrictEqual(gl.isShader(undefined), true, "isShader() != true for undefined shader");
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call isShader() for undefined shader");

    notStrictEqual(gl.isShader(null), true, "isShader() != true for null shader");
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call isShader() for null shader");
});

test("verify getShaderParameter()", function () {
    var gl = GetCleanContext();

    var shader = gl.createShader(gl.VERTEX_SHADER);

    var acceptableParams =
        [
            { 'name': "SHADER_TYPE", 'value': gl.SHADER_TYPE },
            { 'name': "DELETE_STATUS", 'value': gl.DELETE_STATUS },
            { 'name': "COMPILE_STATUS", 'value': gl.COMPILE_STATUS }
        ];

    for (var i = 0, l = acceptableParams.length; i < l; i++) {
        gl.getShaderParameter(shader, acceptableParams[i].value);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getShaderParameter() with parameter " + acceptableParams[i].name);
    }

    //1)
    try {
        gl.getShaderParameter(shader, -1);
        equal(gl.getError(), gl.INVALID_ENUM, "getShaderParameter() generates INVALID_ENUM with invalid shader parameter");
    }
    catch (e) {
        ok(false, "unexpected exception: " + e);
    }

    gl.getShaderParameter(null, gl.DELETE_STATUS);
    equal(gl.getError(), gl.INVALID_VALUE, "getShaderParameter() generates INVALID_VALUE with null shader");

    gl.getShaderParameter(undefined, gl.DELETE_STATUS);
    equal(gl.getError(), gl.INVALID_VALUE, "getShaderParameter() generates INVALID_VALUE with undefined shader");

    gl.deleteShader(shader);

    gl.getShaderParameter(shader, gl.DELETE_STATUS);
    equal(gl.getError(), gl.INVALID_VALUE, "getShaderParameter() generates INVALID_VALUE with deleted shader");
});

test("dynamic properties test", function () {
    var gl = GetCleanContext();

    var shader = gl.createShader(gl.VERTEX_SHADER);
    shader.dynProperty = 5;
    equal(gl.getError(), gl.NO_ERROR, "Dynamic properties must not generate errors");
    ok(shader.dynProperty === 5, "Dynamic properties test");
});

/*
 *	1) gl.getShaderParameter(shader, -1)
 mozilla generates exception
 https://bitbucket.org/MOD/iewebgl/issue/10/bug-in-getshaderparameter-mozilla-firefox
 */