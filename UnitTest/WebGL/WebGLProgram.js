
var UniformForTest = {
    'vertexShaderSrc':
        "struct Light{ vec3 position; };" +
        "struct LightProp { Light light; float intensive; };" +
        "attribute vec3 aVertexPosition;" +
        "uniform bool uBoolean;" +
        "uniform int uInt;" +
        "uniform float uFloat;" +
        "uniform vec2 uVec2;" +
        "uniform ivec2 uIVec2;" +
        "uniform bvec2 uBVec2;" +
        "uniform vec3 uVec3;" +
        "uniform ivec3 uIVec3;" +
        "uniform bvec3 uBVec3;" +
        "uniform vec4 uVec4;" +
        "uniform ivec4 uIVec4;" +
        "uniform bvec4 uBVec4;" +
        "uniform mat2 uMat2;" +
        "uniform mat3 uMat3;" +
        "uniform mat4 uMat4;" +
        "uniform Light light;" +
        "uniform LightProp lightProp;" +
        "void main(void) {" +
        "   gl_Position = uMat4 * (uBoolean ? uVec4 : vec4(uIVec4)) * vec4(aVertexPosition, float(uInt)) + vec4(vec3(uMat3* uVec3), float(uIVec2.x));" +
        "   gl_Position = gl_Position + vec4(vec2(uVec2*uMat2), float(uBVec3.y), float(uBVec4.z)) + vec4(light.position, lightProp.intensive);" +
        "   gl_Position.z += uFloat + (uBVec2.x ? 1.0 : -1.0) * float(uIVec3.x) + float(uBVec3.z) + lightProp.light.position.y;" +
        "}",
    'fragmentShaderSrc':
        "uniform sampler2D uSampler2D;" +
        "uniform samplerCube uSamplerCube;" +
        "void main(void) { gl_FragColor = texture2D(uSampler2D, vec2(0, 0)) * textureCube(uSamplerCube, vec3(0, 1, 0)); }",
    'GetAcceptableUniforms': function (gl) {
        var arr =
        [
            { name: "uBoolean", type: gl.BOOL, size: 1, 'Check': CheckUniformBoolFunc },
            { name: "uInt", type: gl.INT, size: 1, 'Check': CheckUniformIntFunc },
            { name: "uFloat", type: gl.FLOAT, size: 1, 'Check': CheckUniformFloatFunc },
            { name: "uVec2", type: gl.FLOAT_VEC2, size: 1, 'Check': CheckUniformFloat2Func },
            { name: "uIVec2", type: gl.INT_VEC2, size: 1, 'Check': CheckUniformInt2Func },
            { name: "uBVec2", type: gl.BOOL_VEC2, size: 1, 'Check': CheckUniformBool2Func },
            { name: "uVec3", type: gl.FLOAT_VEC3, size: 1, 'Check': CheckUniformFloat3Func },
            { name: "uIVec3", type: gl.INT_VEC3, size: 1, 'Check': CheckUniformInt3Func },
            { name: "uBVec3", type: gl.BOOL_VEC3, size: 1, 'Check': CheckUniformBool3Func },
            { name: "uVec4", type: gl.FLOAT_VEC4, size: 1, 'Check': CheckUniformFloat4Func },
            { name: "uIVec4", type: gl.INT_VEC4, size: 1, 'Check': CheckUniformInt4Func },
            { name: "uBVec4", type: gl.BOOL_VEC4, size: 1, 'Check': CheckUniformBool4Func },
            { name: "uMat2", type: gl.FLOAT_MAT2, size: 1, 'Check': CheckUniformMtx2Func },
            { name: "uMat3", type: gl.FLOAT_MAT3, size: 1, 'Check': CheckUniformMtx3Func },
            { name: "uMat4", type: gl.FLOAT_MAT4, size: 1, 'Check': CheckUniformMtx4Func },
            { name: "light.position", type: gl.FLOAT_VEC3, size: 1, 'Check': CheckUniformFloat3Func },
            { name: "lightProp.intensive", type: gl.FLOAT, size: 1, 'Check': CheckUniformFloatFunc },
            { name: "lightProp.light.position", type: gl.FLOAT_VEC3, size: 1, 'Check': CheckUniformFloat3Func },
            { name: "uSampler2D", type: gl.SAMPLER_2D, size: 1, 'Check': CheckUniformSampler2DFunc },
            { name: "uSamplerCube", type: gl.SAMPLER_CUBE, size: 1, 'Check': CheckUniformSamplerCubeFunc }
        ];
        return arr;
    }
};


function GetSpecialBoolRandomArray(length) {
    var arr = [];
    for (var i = 0; i < length; i++) {
        arr.push(GetRandom(-5000, 5000) > 0 ? 1 : 0);
    }
    return arr;
}

var UniformArraysForTest = {
    'vertexShaderSrc':
        "uniform ##type ##varName[##length];" +
        "void main(void) {" +
        "   gl_Position = vec4(##varName[0]##elemAccess, ##varName[##length - 1]##elemAccess, 0.0, 1.0);" +
        "}",
    'GetCheckTypes': function (gl) {
        var arr = [
            {
                varName: "uFloatArray4",
                typeName: "float",
                type: gl.FLOAT,
                typeSize: 1,
                arrayLength: 4,
                elemAccess: "",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                        { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return isEqual(val1, val2); } },
                        this.arrayLength,
                        {
                            setFunc: { run: function (gl, loc, val) { gl.uniform1fv(loc, val); }, desc: "uniform1fv()" },
                            oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform1f(loc, val[0]); }, desc: "uniform1f()" },
                            invalidSetFunc: { run: function (gl, loc, val) { gl.uniform4fv(loc, val); }, desc: "uniform4fv()" }
                        },
                        GetRandomArray);
                }
            },
            {
                varName: "uIntArray4",
                typeName: "int",
                type: gl.INT,
                typeSize: 1,
                arrayLength: 4,
                elemAccess: "",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                    { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                    this.arrayLength,
                    {
                        setFunc: { run: function (gl, loc, val) { gl.uniform1iv(loc, val); }, desc: "uniform1iv()" },
                        oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform1i(loc, val[0]); }, desc: "uniform1i()" },
                        invalidSetFunc: { run: function (gl, loc, val) { gl.uniform4iv(loc, val); }, desc: "uniform4iv()" }
                    },
                    GetIntRandomArray);
                }
            },
            {
                varName: "uBoolArray4",
                typeName: "bool",
                type: gl.BOOL,
                typeSize: 1,
                arrayLength: 4,
                elemAccess: "",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                            { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                            this.arrayLength,
                            {
                                setFunc: { run: function (gl, loc, val) { gl.uniform1fv(loc, val); }, desc: "uniform1fv()" },
                                oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform1f(loc, val[0]); }, desc: "uniform1f()" },
                                invalidSetFunc: { run: function (gl, loc, val) { gl.uniform2fv(loc, val); }, desc: "uniform2fv()" }
                            },
                            GetSpecialBoolRandomArray);
                    CheckUniformArray(gl, prog,
                            { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                            this.arrayLength,
                            {
                                setFunc: { run: function (gl, loc, val) { gl.uniform1iv(loc, val); }, desc: "uniform1iv()" },
                                oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform1i(loc, val[0]); }, desc: "uniform1i()" },
                                invalidSetFunc: { run: function (gl, loc, val) { gl.uniform2iv(loc, val); }, desc: "uniform2iv()" }
                            },
                            GetSpecialBoolRandomArray);
                }
            },
            {
                varName: "uFloat2Array3",
                typeName: "vec2",
                type: gl.FLOAT_VEC2,
                typeSize: 2,
                arrayLength: 3,
                elemAccess: "[1]",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                        { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return isEqual(val1, val2); } },
                        this.arrayLength,
                        {
                            setFunc: { run: function (gl, loc, val) { gl.uniform2fv(loc, val); }, desc: "uniform2fv()" },
                            oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform2f(loc, val[0], val[1]); }, desc: "uniform2f()" },
                            invalidSetFunc: { run: function (gl, loc, val) { gl.uniform4fv(loc, val); }, desc: "uniform4fv()" }
                        },
                        GetRandomArray);
                }
            },
            {
                varName: "uInt2Array3",
                typeName: "ivec2",
                type: gl.INT_VEC2,
                typeSize: 2,
                arrayLength: 3,
                elemAccess: "[1]",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                        { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                        this.arrayLength,
                        {
                            setFunc: { run: function (gl, loc, val) { gl.uniform2iv(loc, val); }, desc: "uniform2iv()" },
                            oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform2i(loc, val[0], val[1]); }, desc: "uniform2i()" },
                            invalidSetFunc: { run: function (gl, loc, val) { gl.uniform4iv(loc, val); }, desc: "uniform4iv()" }
                        },
                        GetIntRandomArray);
                }
            },
            {
                varName: "uBool2Array3",
                typeName: "bvec2",
                type: gl.BOOL_VEC2,
                typeSize: 2,
                arrayLength: 3,
                elemAccess: "[1]",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                        { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                        this.arrayLength,
                        {
                            setFunc: { run: function (gl, loc, val) { gl.uniform2fv(loc, val); }, desc: "uniform2fv()" },
                            oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform2f(loc, val[0], val[1]); }, desc: "uniform2f()" },
                            invalidSetFunc: { run: function (gl, loc, val) { gl.uniform4fv(loc, val); }, desc: "uniform4fv()" }
                        },
                        GetSpecialBoolRandomArray);
                    CheckUniformArray(gl, prog,
                        { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                        this.arrayLength,
                        {
                            setFunc: { run: function (gl, loc, val) { gl.uniform2iv(loc, val); }, desc: "uniform2iv()" },
                            oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform2i(loc, val[0], val[1]); }, desc: "uniform2i()" },
                            invalidSetFunc: { run: function (gl, loc, val) { gl.uniform4iv(loc, val); }, desc: "uniform4iv()" }
                        },
                        GetSpecialBoolRandomArray);
                }
            },
            {
                varName: "uFloat3Array2",
                typeName: "vec3",
                type: gl.FLOAT_VEC3,
                typeSize: 3,
                arrayLength: 2,
                elemAccess: "[2]",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                        { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return isEqual(val1, val2); } },
                        this.arrayLength,
                        {
                            setFunc: { run: function (gl, loc, val) { gl.uniform3fv(loc, val); }, desc: "uniform3fv()" },
                            oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform3f(loc, val[0], val[1], val[2]); }, desc: "uniform3f()" },
                            invalidSetFunc: { run: function (gl, loc, val) { gl.uniform1fv(loc, val); }, desc: "uniform1fv()" }
                        },
                        GetRandomArray);
                }
            },
            {
                varName: "uInt3Array2",
                typeName: "ivec3",
                type: gl.INT_VEC3,
                typeSize: 3,
                arrayLength: 2,
                elemAccess: "[2]",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                        { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                        this.arrayLength,
                        {
                            setFunc: { run: function (gl, loc, val) { gl.uniform3iv(loc, val); }, desc: "uniform3iv()" },
                            oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform3i(loc, val[0], val[1], val[2]); }, desc: "uniform3i()" },
                            invalidSetFunc: { run: function (gl, loc, val) { gl.uniform1iv(loc, val); }, desc: "uniform1iv()" }
                        },
                        GetIntRandomArray);
                }
            },
            {
                varName: "uBool3Array2",
                typeName: "bvec3",
                type: gl.BOOL_VEC3,
                typeSize: 3,
                arrayLength: 2,
                elemAccess: "[2]",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                        { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                        this.arrayLength,
                        {
                            setFunc: { run: function (gl, loc, val) { gl.uniform3fv(loc, val); }, desc: "uniform3fv()" },
                            oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform3f(loc, val[0], val[1], val[2]); }, desc: "uniform3f()" },
                            invalidSetFunc: { run: function (gl, loc, val) { gl.uniform1fv(loc, val); }, desc: "uniform1fv()" }
                        },
                        GetSpecialBoolRandomArray);

                    CheckUniformArray(gl, prog,
                        { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                        this.arrayLength,
                        {
                            setFunc: { run: function (gl, loc, val) { gl.uniform3iv(loc, val); }, desc: "uniform3iv()" },
                            oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform3i(loc, val[0], val[1], val[2]); }, desc: "uniform3i()" },
                            invalidSetFunc: { run: function (gl, loc, val) { gl.uniform1iv(loc, val); }, desc: "uniform1iv()" }
                        },
                        GetSpecialBoolRandomArray);
                }
            },
            {
                varName: "uFloat4Array1",
                typeName: "vec4",
                type: gl.FLOAT_VEC4,
                typeSize: 4,
                arrayLength: 1,
                elemAccess: "[3]",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                            { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return isEqual(val1, val2); } },
                            this.arrayLength,
                            {
                                setFunc: { run: function (gl, loc, val) { gl.uniform4fv(loc, val); }, desc: "uniform4fv()" },
                                oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform4f(loc, val[0], val[1], val[2], val[3]); }, desc: "uniform4f()" },
                                invalidSetFunc: { run: function (gl, loc, val) { gl.uniform1fv(loc, val); }, desc: "uniform1fv()" }
                            },
                            GetRandomArray);
                }
            },
            {
                varName: "uInt4Array1",
                typeName: "ivec4",
                type: gl.INT_VEC4,
                typeSize: 4,
                arrayLength: 1,
                elemAccess: "[3]",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                            { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                            this.arrayLength,
                            {
                                setFunc: { run: function (gl, loc, val) { gl.uniform4iv(loc, val); }, desc: "uniform4iv()" },
                                oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform4i(loc, val[0], val[1], val[2], val[3]); }, desc: "uniform4i()" },
                                invalidSetFunc: { run: function (gl, loc, val) { gl.uniform1iv(loc, val); }, desc: "uniform1iv()" }
                            },
                            GetIntRandomArray);
                }
            },
            {
                varName: "uBool4Array1",
                typeName: "bvec4",
                type: gl.BOOL_VEC4,
                typeSize: 4,
                arrayLength: 1,
                elemAccess: "[3]",
                checkFunc: function (gl, prog) {
                    CheckUniformArray(gl, prog,
                            { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                            this.arrayLength,
                            {
                                setFunc: { run: function (gl, loc, val) { gl.uniform4fv(loc, val); }, desc: "uniform4fv()" },
                                oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform4f(loc, val[0], val[1], val[2], val[3]); }, desc: "uniform4f()" },
                                invalidSetFunc: { run: function (gl, loc, val) { gl.uniform1fv(loc, val); }, desc: "uniform1fv()" }
                            },
                            GetSpecialBoolRandomArray);
                    CheckUniformArray(gl, prog,
                            { name: this.varName, size: this.typeSize, type: this.typeName, isEqual: function (val1, val2) { return val1 == val2; } },
                            this.arrayLength,
                            {
                                setFunc: { run: function (gl, loc, val) { gl.uniform4iv(loc, val); }, desc: "uniform4iv()" },
                                oneElemSetFunc: { run: function (gl, loc, val) { gl.uniform4i(loc, val[0], val[1], val[2], val[3]); }, desc: "uniform4i()" },
                                invalidSetFunc: { run: function (gl, loc, val) { gl.uniform1iv(loc, val); }, desc: "uniform1iv()" }
                            },
                            GetSpecialBoolRandomArray);
                }
            }

        ];
        return arr;
    }
};


function CheckValidArray(gl, prog, varDesc, arrayLength, setters, generateArrayFunc) {
    var loc = gl.getUniformLocation(prog, varDesc.name);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getUniformLocation() with " + varDesc.name);
    notStrictEqual(loc, null, "getUniformLocation() != null with " + varDesc.name);

    var arr = generateArrayFunc(arrayLength * varDesc.size);
    setters.setFunc.run(gl, loc, arr);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call " + setters.setFunc.desc + " with " + varDesc.name);
    for (var i = 0; i < arrayLength; ++i) {
        var unifromVarName = varDesc.name + "[" + i + "]";
        var uloc = gl.getUniformLocation(prog, unifromVarName);
        var val = gl.getUniform(prog, uloc);
        if (varDesc.size == 1) {
            ok(varDesc.isEqual(arr[i], val), "Check " + i + " element of array after call " + setters.setFunc.desc + " with " + unifromVarName + ". Expected: " + arr[i] + ", returned: " + val[j]);
        }
        else {
            for (var j = 0; j < varDesc.size; ++j) {
                ok(varDesc.isEqual(arr[i * varDesc.size + j], val[j]), "Check " + i + " element of array and " + j + " element of type after call " + setters.setFunc.desc + " with " + unifromVarName + ". Expected: " + arr[i * varDesc.size + j] + ", returned: " + val[j]);
            }
        }
    }
}

function CheckTooBigArray(gl, prog, varDesc, arrayLength, setters, generateArrayFunc){
    var bigArr = generateArrayFunc(arrayLength * varDesc.size * 10);
    loc = gl.getUniformLocation(prog, varDesc.name);
    setters.setFunc.run(gl, loc, bigArr);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call " + setters.setFunc.desc + " with " + varDesc.name + ". Array is too big, values beyond the end of the array must be ignored");
    for (var i = 0; i < arrayLength; ++i) {
        var unifromVarName = varDesc.name + "[" + i + "]";
        var uloc = gl.getUniformLocation(prog, unifromVarName);
        var val = gl.getUniform(prog, uloc);
        if (varDesc.size == 1) {
            ok(varDesc.isEqual(bigArr[i], val), "Check " + i + " element of array after call " + setters.setFunc.desc + " with with too big array. Expected: " + bigArr[i] + ", returned: " + val);
        }
        else {
            for (var j = 0; j < varDesc.size; ++j) {
                ok(varDesc.isEqual(bigArr[i * varDesc.size + j], val[j]), "Check " + i + " element of array and " + j + " element of type after call " + setters.setFunc.desc + " with with too big array. Expected: " + bigArr[i * varDesc.size + j] + ", returned: " + val[j]);
            }
        }

    }
}

function CheckNoMultiplyArray(gl, prog, varDesc, arrayLength, setters, generateArrayFunc) {
    var notMultiplyArr = generateArrayFunc(arrayLength * varDesc.size - 1);
    loc = gl.getUniformLocation(prog, varDesc.name);
    setters.setFunc.run(gl, loc, notMultiplyArr);
    equal(gl.getError(), gl.INVALID_VALUE, "getError() == INVALID_VALUE after call " + setters.setFunc.desc + " with " + varDesc.name + ". Array length is not multiple of the assigned type.");
}

function CheckUniformArray(gl, prog, varDesc, arrayLength, setters, generateArrayFunc) {
    CheckValidArray(gl, prog, varDesc, arrayLength, setters, generateArrayFunc);
    CheckTooBigArray(gl, prog, varDesc, arrayLength, setters, generateArrayFunc);

    if (varDesc.size > 1) {
        CheckNoMultiplyArray(gl, prog, varDesc, arrayLength, setters, generateArrayFunc);
    }

    for (var i = 0; i < arrayLength; ++i) {
        var unifromVarName = varDesc.name + "[" + i + "]";
        var uloc = gl.getUniformLocation(prog, unifromVarName);

        var validArr = generateArrayFunc(varDesc.size);
        setters.setFunc.run(gl, uloc, validArr);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call " + setters.setFunc.desc + " with " + unifromVarName);
        var val = gl.getUniform(prog, uloc);
        if (varDesc.size == 1) {
            ok(varDesc.isEqual(validArr[0], val), "Check " + i + " element of array after call " + setters.setFunc.desc + " with " + unifromVarName + ". Expected: " + validArr[0] + ", returned: " + val);
        }
        else {
            for (var j = 0; j < varDesc.size; ++j) {
                ok(varDesc.isEqual(validArr[j], val[j]), "Check " + i + " element of array and " + j + " element of type after call " + setters.setFunc.desc + " with " + unifromVarName + ". Expected: " + validArr[j] + ", returned: " + val[j]);
            } 
        }

        var validArr = generateArrayFunc(varDesc.size);
        setters.oneElemSetFunc.run(gl, uloc, validArr);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call " + setters.oneElemSetFunc.desc + " for uniform array varible [" + unifromVarName + "]");
        var val = gl.getUniform(prog, uloc);
        if (varDesc.size == 1) {
            ok(varDesc.isEqual(validArr[0], val), "Check " + i + " element of array after call " + setters.oneElemSetFunc.desc + " with " + unifromVarName + ". Expected: " + validArr[0] + ", returned: " + val);
        }
        else {
            for (var j = 0; j < varDesc.size; ++j) {
                ok(varDesc.isEqual(validArr[j], val[j]), "Check " + i + " element of array and " + j + " element of type after call " + setters.oneElemSetFunc.desc + " with " + unifromVarName + ". Expected: " + validArr[j] + ", returned: " + val[j]);
            }
        }

        setters.invalidSetFunc.run(gl, uloc, generateArrayFunc(100));
        equal(gl.getError(), gl.INVALID_OPERATION, "getError() == INVALID_OPERATION after call " + setters.invalidSetFunc.desc + " for uniform array varible of "+ varDesc.type +" type");
    }
}


var AttribsForTest = {
    'shaderSrc':
        "attribute float aFloat;" +
        "attribute vec2 aVec2;" +
        "attribute vec3 aVec3;" +
        "attribute vec4 aVec4;" +
        "attribute mat2 aMat2;" +
        "attribute mat3 aMat3;" +
        "attribute mat4 aMat4;" +
        "void main(void) {" +
        "   gl_Position = vec4(aMat3 * aVec3, aFloat) - vec4(aMat2 * aVec2, 1.0, 1.0) + aMat4 * aVec4;" +
        "}",
    'GetAcceptableAttirbs': function (gl) {
        var arr =
        [
            { name: "aFloat", type: gl.FLOAT, size: 1, 'Check': CheckAttribFloatFunc },
            { name: "aVec2", type: gl.FLOAT_VEC2, size: 1, 'Check': CheckAttribFloat2Func },
            { name: "aVec3", type: gl.FLOAT_VEC3, size: 1, 'Check': CheckAttribFloat3Func },
            { name: "aVec4", type: gl.FLOAT_VEC4, size: 1, 'Check': CheckAttribFloat4Func },
            { name: "aMat2", type: gl.FLOAT_MAT2, size: 1, 'Check': CheckAttribMtx2Func },
            { name: "aMat3", type: gl.FLOAT_MAT3, size: 1, 'Check': CheckAttribMtx3Func },
            { name: "aMat4", type: gl.FLOAT_MAT4, size: 1, 'Check': CheckAttribMtx4Func }
        ];
        return arr;
    }

};

var ForDrawTests =
{
    'vShader':
        "attribute vec3 aPos;" +
        "attribute vec3 aNormal;" +
        "attribute vec2 aTexCoord;" +
        "varying vec4 vTexCoord;" +
        "void main()" +
        "{" +
        "  gl_Position = vec4(aPos * aNormal, 1.0);" +
        "  vTexCoord = vec4(aTexCoord, 1.0, 1.0);" +
        "}",

    'fShader':
        "precision mediump float;" +
        "varying vec4 vTexCoord;" +
        "void main()" +
        "{" +
        "  gl_FragColor = vTexCoord;" +
        "}"
};

var ForDrawArraysTest =
{
    'buffDescs':
    [
        {
            desc: 'vertices',
            attrName: 'aPos',
            data: [
                -1, -1, 0,
                 1, -1, 0,
                 1,  1, 0,
                -1, -1, 0,
                 1,  1, 0,
                -1,  1, 0],
            size: 3
        },
        {
            desc: 'normals',
            attrName: 'aNormal',
            data: [
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1, 
                0, 0, 1],
            size: 3
        },
        {
            desc: 'texCoord',
            attrName: 'aTexCoord',
            data: [
                0, 0,
                1, 0,
                1, 1,
                0, 0,
                1, 1,
                0, 1],
            size: 2
        }
    ]
};

var ForDrawElementsTest =
{
    'buffDescs':
    [
        {
            desc: 'vertices',
            attrName: 'aPos',
            data: [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0],
            size: 3
        },
        {
            desc: 'normals',
            attrName: 'aNormal',
            data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
            size: 3
        },

        {
            desc: 'texCoord',
            attrName: 'aTexCoord',
            data: [0, 0, 1, 0, 1, 1, 0, 1],
            size: 2
        }
    ],
    'indices': [0, 1, 2, 0, 2, 3],
    'invalidIndices': [0, 1, 200, 200, 3, 0]
};


function CheckAttribFloatFunc(gl, index) {
    var initVal = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for float attribute");
    ok(isEqual(initVal[0], 0.0) && isEqual(initVal[1], 0.0) && isEqual(initVal[2], 0.0) && isEqual(initVal[3], 1.0),
       "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal));

    gl.vertexAttrib1f(index, 35.777);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib1f() must not generate errors for float attribute");
    var val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 35.777) && isEqual(val[1], 0.0) && isEqual(val[2], 0.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib1fv(35.777). Expected: [35.777, 0.0, 0.0, 1.0], returned : " + ArrayToStr(val));

    var fArr = new Float32Array(1);
    fArr[0] = 435.72;
    gl.vertexAttrib1fv(index, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib1fv() must not generate errors for float attribute [Float32Array]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], 0.0) && isEqual(val[2], 0.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib1fv(435.72). Expected: [435.72, 0.0, 0.0, 1.0], returned : " + ArrayToStr(val) + " [Float32Array]");

    gl.vertexAttrib1fv(index, [-9.409]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib1fv() must not generate errors for float attribute [float[]]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 0.0) && isEqual(val[2], 0.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib1fv(-9.409). Expected: [-9.409, 0.0, 0.0, 1.0], returned :  " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib1f(index, 0);
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    strictEqual(val[0], 0,
        "Restore initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0], returned : [" + val[0] + "]");
}

function CheckAttribFloat2Func(gl, index) {
    var initVal = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for float2 attribute");
    ok(isEqual(initVal[0], 0.0) && isEqual(initVal[1], 0.0) && isEqual(initVal[2], 0.0) && isEqual(initVal[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal));

    gl.vertexAttrib2f(index, 123.11, 425.22);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib2f() must not generate errors for float2 attribute");
    var val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 123.11) && isEqual(val[1], 425.22) && isEqual(val[2], 0.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib2f(123.11, 425.22). Expected: [123.11, 425.22, 0.0, 1.0], returned : " + ArrayToStr(val));

    var fArr = new Float32Array(2);
    fArr[0] = 435.72;
    fArr[1] = -4555.01;
    gl.vertexAttrib2fv(index, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib2fv() must not generate errors for float2 attribute [Float32Array]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 0.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib2fv(435.72, -4555.01). Expected: [435.72, -4555.01, 0.0, 1.0], returned : " + ArrayToStr(val) + " [Float32Array]");

    gl.vertexAttrib2fv(index, [-9.409, 1]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib2fv() must not generate errors for float2 attribute [float[]]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 0.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib2fv(-9.409, 1). Expected: [-9.409, 1.0, 0.0, 1.0], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib2f(index, 0, 0);
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0,
        "Restore initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0], returned : " + ArrayToStr(val));
}

function CheckAttribFloat3Func(gl, index) {
    var initVal = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for float3 attribute");
    ok(isEqual(initVal[0], 0.0) && isEqual(initVal[1], 0.0) && isEqual(initVal[2], 0.0) && isEqual(initVal[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal));

    gl.vertexAttrib3f(index, 123.11, 425.22, -1);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib3f() must not generate errors for float3 attribute");
    var val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 123.11) && isEqual(val[1], 425.22) && isEqual(val[2], -1.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib1fv(123.11, 425.22, -1). Expected: [123.11, 425.22, -1.0, 1.0], returned : " + ArrayToStr(val));

    var fArr = new Float32Array(3);
    fArr[0] = 435.72;
    fArr[1] = -4555.01;
    fArr[2] = 2;
    gl.vertexAttrib3fv(index, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib3fv() must not generate errors for float2 attribute [Float32Array]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 2.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib2fv(435.72, -4555.01, 2). Expected: [435.72, -4555.01, 2.0, 1.0], returned : " + ArrayToStr(val) + " [Float32Array]");

    gl.vertexAttrib3fv(index, [-9.409, 1, 777.777]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib3fv() must not generate errors for float3 attribute [float[]]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 777.777) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib3fv(-9.409, 1, 777.777). Expected: [-9.409, 1.0, 777.777, 1.0], " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib3f(index, 0, 0, 0);
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0 && val[2] == 0,
        "Restore initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0, 0], returned : " + ArrayToStr(val));
}

function CheckAttribFloat4Func(gl, index) {
    var initVal = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for float4 attribute");
    ok(isEqual(initVal[0], 0.0) && isEqual(initVal[1], 0.0) && isEqual(initVal[2], 0.0) && isEqual(initVal[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal));

    gl.vertexAttrib4f(index, 123.11, 425.22, -1, 0);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4f() must not generate errors for float4 attribute");
    var val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 123.11) && isEqual(val[1], 425.22) && isEqual(val[2], -1.0) && isEqual(val[3], 0.0),
        "Check returned value after call vertexAttrib1fv(123.11, 425.22, -1, 0). Expected: [123.11, 425.22, -1.0, 0.0], returned : " + ArrayToStr(val));

    var fArr = new Float32Array(4);
    fArr[0] = 435.72;
    fArr[1] = -4555.01;
    fArr[2] = 2;
    fArr[3] = 51;
    gl.vertexAttrib4fv(index, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4fv() must not generate errors for float4 attribute [Float32Array]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 2.0) && isEqual(val[3], 51.0),
        "Check returned value after call vertexAttrib4fv(435.72, -4555.01, 2, 51). Expected: [435.72, -4555.01, 2.0, 51.0], returned : " + ArrayToStr(val) + " [Float32Array]");

    gl.vertexAttrib4fv(index, [-9.409, 1, 777.777, 0.2]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4fv() must not generate errors for float4 attribute [float[]]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 777.777) && isEqual(val[3], 0.2),
        "Check returned value after call vertexAttrib4fv(-9.409, 1, 777.777,0.2). Expected: [-9.409, 1.0, 777.777, 0.2], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib4f(index, 0, 0, 0, 1);
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0 && val[2] == 0 && val[3] == 1,
        "Restore initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0, 0, 1], returned : " + ArrayToStr(val));
}

function CheckAttribMtx2Func(gl, index) {
    var initVal0 = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for mat2 (0 col) attribute");
    ok(isEqual(initVal0[0], 0.0) && isEqual(initVal0[1], 0.0) && isEqual(initVal0[2], 0.0) && isEqual(initVal0[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal0));

    var initVal1 = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for mat2 (1 col) attribute");
    ok(isEqual(initVal1[0], 0.0) && isEqual(initVal1[1], 0.0) && isEqual(initVal1[2], 0.0) && isEqual(initVal1[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal1));

    var fArr = new Float32Array(2);
    fArr[0] = 435.72;
    fArr[1] = -4555.01;
    gl.vertexAttrib2fv(index, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib2fv() must not generate errors for mat2 (0 col) attribute [Float32Array]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 0.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib2fv(435.72, -4555.01). Expected: [435.72, -4555.01, 0.0, 1.0], returned : " + ArrayToStr(val) + " [Float32Array]");
    gl.vertexAttrib2fv(index + 1, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib2fv() must not generate errors for mat2 (1 col) attribute [Float32Array]");
    val = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 0.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib2fv(435.72, -4555.01). Expected: [435.72, -4555.01, 0.0, 1.0], returned : " + ArrayToStr(val) + " [Float32Array]");

    gl.vertexAttrib2fv(index, [-9.409, 1]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib2fv() must not generate errors for mat2 (0 col) attribute [float[]]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 0.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib2fv(-9.409, 1). Expected: [-9.409, 1.0], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib2fv(index + 1, [-9.409, 1]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib2fv() must not generate errors for mat2 (1 col) attribute [float[]]");
    val = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 0.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib2fv(-9.409, 1). Expected: [-9.409, 1.0], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib2f(index, 0, 0);
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0,
        "Restore initial value for mat2 (0 col) returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0], returned : " + ArrayToStr(val));
    gl.vertexAttrib2f(index + 1, 0, 0);
    val = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0,
        "Restore initial value for mat2 (1 col) returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0], returned : " + ArrayToStr(val));
}

function CheckAttribMtx3Func(gl, index) {
    var initVal0 = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for mat3 (0 col) attribute");
    ok(isEqual(initVal0[0], 0.0) && isEqual(initVal0[1], 0.0) && isEqual(initVal0[2], 0.0) && isEqual(initVal0[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal0));

    var initVal1 = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for mat3 (1 col) attribute");
    ok(isEqual(initVal1[0], 0.0) && isEqual(initVal1[1], 0.0) && isEqual(initVal1[2], 0.0) && isEqual(initVal1[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal1));

    var initVal2 = gl.getVertexAttrib(index + 2, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for mat3 (2 col) attribute");
    ok(isEqual(initVal2[0], 0.0) && isEqual(initVal2[1], 0.0) && isEqual(initVal2[2], 0.0) && isEqual(initVal2[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal2));

    var fArr = new Float32Array(3);
    fArr[0] = 435.72;
    fArr[1] = -4555.01;
    fArr[2] = 2;
    gl.vertexAttrib3fv(index, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib3fv() must not generate errors for mat3 (0 col) attribute [Float32Array]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 2.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib3fv(435.72, -4555.01, 2). Expected: [435.72, -4555.01, 2.0, 1.0], returned : " + ArrayToStr(val) + " [Float32Array]");
    gl.vertexAttrib3fv(index + 1, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib3fv() must not generate errors for mat3 (1 col) attribute [Float32Array]");
    val = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 2.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib3fv(435.72, -4555.01, 2). Expected: [435.72, -4555.01, 2.0, 1.0], returned : " + ArrayToStr(val) + " [Float32Array]");
    gl.vertexAttrib3fv(index + 2, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib3fv() must not generate errors for mat3 (2 col) attribute [Float32Array]");
    val = gl.getVertexAttrib(index + 2, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 2.0) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib3fv(435.72, -4555.01, 2). Expected: [435.72, -4555.01, 2.0, 1.0], returned : " + ArrayToStr(val) + " [Float32Array]");

    gl.vertexAttrib3fv(index, [-9.409, 1, 777.777]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib3fv() must not generate errors for mat3 (0 col) attribute [float[]]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 777.777) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib3fv(-9.409, 1, 777.777). Expected: [-9.409, 1.0, 777.777], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib3fv(index + 1, [-9.409, 1, 777.777]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib3fv() must not generate errors for mat3 (1 col) attribute [float[]]");
    val = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 777.777) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib3fv(-9.409, 1, 777.777). Expected: [-9.409, 1.0, 777.777], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib3fv(index + 2, [-9.409, 1, 777.777]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib3fv() must not generate errors for mat3 (2 col) attribute [float[]]");
    val = gl.getVertexAttrib(index + 2, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 777.777) && isEqual(val[3], 1.0),
        "Check returned value after call vertexAttrib3fv(-9.409, 1, 777.777). Expected: [-9.409, 1.0, 777.777], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib3f(index, 0, 0, 0);
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0 && val[2] == 0,
        "Restore initial value for mat3 (0 col) returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0, 0], returned : " + ArrayToStr(val));
    gl.vertexAttrib3f(index + 1, 0, 0, 0);
    val = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0 && val[2] == 0,
        "Restore initial value for mat3 (1 col) returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0, 0], returned : " + ArrayToStr(val));

    gl.vertexAttrib3f(index + 2, 0, 0, 0);
    val = gl.getVertexAttrib(index + 2, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0 && val[2] == 0,
        "Restore initial value for mat3 (2 col) returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0, 0], returned : " + ArrayToStr(val));
}

function CheckAttribMtx4Func(gl, index) {
    var initVal0 = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for mat4 (0 col) attribute");
    ok(isEqual(initVal0[0], 0.0) && isEqual(initVal0[1], 0.0) && isEqual(initVal0[2], 0.0) && isEqual(initVal0[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal0));

    var initVal1 = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for mat4 (1 col) attribute");
    ok(isEqual(initVal1[0], 0.0) && isEqual(initVal1[1], 0.0) && isEqual(initVal1[2], 0.0) && isEqual(initVal1[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal1));

    var initVal2 = gl.getVertexAttrib(index + 2, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for mat4 (2 col) attribute");
    ok(isEqual(initVal2[0], 0.0) && isEqual(initVal2[1], 0.0) && isEqual(initVal2[2], 0.0) && isEqual(initVal2[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal2));

    var initVal3 = gl.getVertexAttrib(index + 3, gl.CURRENT_VERTEX_ATTRIB);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib(CURRENT_VERTEX_ATTRIB) must not generate errors for mat4 (3 col) attribute");
    ok(isEqual(initVal3[0], 0.0) && isEqual(initVal3[1], 0.0) && isEqual(initVal3[2], 0.0) && isEqual(initVal3[3], 1.0),
        "Check initial value returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: (0,0,0,1), returned : " + ArrayToStr(initVal3));

    var fArr = new Float32Array(4);
    fArr[0] = 435.72;
    fArr[1] = -4555.01;
    fArr[2] = 2;
    fArr[3] = 51;
    gl.vertexAttrib4fv(index, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4fv() must not generate errors for mat4 (0 col) attribute [Float32Array]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 2.0) && isEqual(val[3], 51.0),
        "Check returned value after call vertexAttrib2fv(435.72, -4555.01, 2, 51). Expected: [435.72, -4555.01, 2.0, 51.0], returned : " + ArrayToStr(val)+ " [Float32Array]");
    gl.vertexAttrib4fv(index + 1, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4fv() must not generate errors for mat4 (1 col) attribute [Float32Array]");
    val = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 2.0) && isEqual(val[3], 51.0),
        "Check returned value after call vertexAttrib2fv(435.72, -4555.01, 2, 51). Expected: [435.72, -4555.01, 2.0, 51.0], returned : " + ArrayToStr(val) + " [Float32Array]");
    gl.vertexAttrib4fv(index + 2, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4fv() must not generate errors for mat4 (2 col) attribute [Float32Array]");
    val = gl.getVertexAttrib(index + 2, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 2.0) && isEqual(val[3], 51.0),
        "Check returned value after call vertexAttrib4fv(435.72, -4555.01, 2, 51). Expected: [435.72, -4555.01, 2.0, 51.0], returned : " + ArrayToStr(val) + " [Float32Array]");
    gl.vertexAttrib4fv(index + 3, fArr);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4fv() must not generate errors for mat4 (3 col) attribute [Float32Array]");
    val = gl.getVertexAttrib(index + 3, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], 435.72) && isEqual(val[1], -4555.01) && isEqual(val[2], 2.0) && isEqual(val[3], 51.0),
        "Check returned value after call vertexAttrib4fv(435.72, -4555.01, 2, 51). Expected: [435.72, -4555.01, 2.0, 51.0], returned : " + ArrayToStr(val) + " [Float32Array]");

    gl.vertexAttrib4fv(index, [-9.409, 1, 777.777, 0.2]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4fv() must not generate errors for mat3 (0 col) attribute [float[]]");
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 777.777) && isEqual(val[3], 0.2),
        "Check returned value after call vertexAttrib4fv(-9.409, 1, 777.777, 0.2). Expected: [-9.409, 1.0, 777.777, 0.2], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib4fv(index + 1, [-9.409, 1, 777.777, 0.2]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4fv() must not generate errors for mat3 (1 col) attribute [float[]]");
    val = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 777.777) && isEqual(val[3], 0.2),
        "Check returned value after call vertexAttrib4fv(-9.409, 1, 777.777, 0.2). Expected: [-9.409, 1.0, 777.777, 0.2], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib4fv(index + 2, [-9.409, 1, 777.777, 0.2]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4fv() must not generate errors for mat3 (2 col) attribute [float[]]");
    val = gl.getVertexAttrib(index + 2, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 777.777) && isEqual(val[3], 0.2),
        "Check returned value after call vertexAttrib4fv(-9.409, 1, 777.777, 0.2). Expected: [-9.409, 1.0, 777.777, 0.2], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib4fv(index + 3, [-9.409, 1, 777.777, 0.2]);
    equal(gl.getError(), gl.NO_ERROR, "vertexAttrib4fv() must not generate errors for mat3 (2 col) attribute [float[]]");
    val = gl.getVertexAttrib(index + 3, gl.CURRENT_VERTEX_ATTRIB);
    ok(isEqual(val[0], -9.409) && isEqual(val[1], 1.0) && isEqual(val[2], 777.777) && isEqual(val[3], 0.2),
        "Check returned value after call vertexAttrib4fv(-9.409, 1, 777.777, 0.2). Expected: [-9.409, 1.0, 777.777, 0.2], returned : " + ArrayToStr(val) + " [float[]]");

    gl.vertexAttrib4f(index, 0, 0, 0, 1);
    val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0 && val[2] == 0 && val[3] == 1,
        "Restore initial value for mat3 (0 col) returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0, 0, 1], returned : " + ArrayToStr(val));
    gl.vertexAttrib4f(index + 1, 0, 0, 0, 1);
    val = gl.getVertexAttrib(index + 1, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0 && val[2] == 0 && val[3] == 1,
        "Restore initial value for mat3 (1 col) returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0, 0, 1], returned : " + ArrayToStr(val));
    gl.vertexAttrib4f(index + 2, 0, 0, 0, 1);
    val = gl.getVertexAttrib(index + 2, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0 && val[2] == 0 && val[3] == 1,
        "Restore initial value for mat3 (2 col) returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0, 0, 1], returned : " + ArrayToStr(val));
    gl.vertexAttrib4f(index + 3, 0, 0, 0, 1);
    val = gl.getVertexAttrib(index + 3, gl.CURRENT_VERTEX_ATTRIB);
    ok(val[0] == 0 && val[1] == 0 && val[2] == 0 && val[3] == 1,
        "Restore initial value for mat3 (3 col) returned by getVertexAttrib(CURRENT_VERTEX_ATTRIB). Expected: [0, 0, 0, 1], returned : " + ArrayToStr(val));
}

function CheckUniformMtxFunc(gl, prog, uniformSetter, uLoc, length) {
    uniformSetter.Set(gl, uLoc, true, GetRandomArray(length));
    equal(gl.getError(), gl.INVALID_VALUE, uniformSetter.name + " must generate INVALID_VALUE if transpose == true");

    var randArr = GetRandomArray(length);
    uniformSetter.Set(gl, uLoc, false, randArr);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call " + uniformSetter.name + " with float[]");
    var val = gl.getUniform(prog, uLoc);
    ok(isArraysEqual(val, randArr), "Check value after call " + uniformSetter.name + " with float[]");

    // (6)см.ниже
    //     uniformSetter.Set(gl, uLoc, false, GetRandomArray(length + 1));
    //     equal(gl.getError(), gl.INVALID_VALUE, uniformSetter.name + " must generate INVALID_VALUE if array count > " + length);
    //     var checkVal = gl.getUniform(prog, uLoc);
    //     CHECK(isArraysEqual(val, checkVal), uniformSetter.name + " does not change value after INVALID_VALUE");

    uniformSetter.Set(gl, uLoc, false, GetRandomArray(length - 1));
    equal(gl.getError(), gl.INVALID_VALUE, uniformSetter.name + " must generate INVALID_VALUE if array count < " + length);
    checkVal = gl.getUniform(prog, uLoc);
    ok(isArraysEqual(val, checkVal), "Check that " + uniformSetter.name + " did not change value after INVALID_VALUE");

    var arr = new Float32Array(GetRandomArray(length));
    uniformSetter.Set(gl, uLoc, false, arr);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call " + uniformSetter.name + " with Float32Array");
    val = gl.getUniform(prog, uLoc);
    ok(isArraysEqual(val, arr), "Check value after call " + uniformSetter.name + " with Float32Array");

    // (6)см.ниже
    //     var invalidArr = new Float32Array(GetRandomArray(length + 1));
    //     uniformSetter.Set(gl, uLoc, false, invalidArr);
    //     equal(gl.getError(), gl.INVALID_VALUE, uniformSetter.name + " must generate INVALID_VALUE if Float32Array length > " + length);
    //     val = gl.getUniform(prog, uLoc);
    //     CHECK(isArraysEqual(val, arr),  "Check value after call " + uniformSetter.name + " with Float32Array");

    var invalidArr2 = new Float32Array(GetRandomArray(length - 1));
    uniformSetter.Set(gl, uLoc, false, invalidArr2);
    equal(gl.getError(), gl.INVALID_VALUE, uniformSetter.name + " must generate INVALID_VALUE if Float32Array length < " + length);
    val = gl.getUniform(prog, uLoc);
    ok(isArraysEqual(val, arr), "Check value after call " + uniformSetter.name + " with Float32Array");
}

function CheckUniformBoolFunc(gl, prog, uLoc) {
    gl.uniform1f(uLoc, 0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1f() with bool var");
    var val = gl.getUniform(prog, uLoc);
    strictEqual(val, false, "Check value after call uniform1f(0) for bool var. Returned: " + val);

    gl.uniform1f(uLoc, 1);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1f() with bool var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, true, "Check value after call uniform1f(1) for bool var. Returned: " + val);

    gl.uniform1i(uLoc, 0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1i() with bool var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, false, "Check value after call uniform1i(0) for bool var. Returned: " + val);

    gl.uniform1i(uLoc, 100500);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1i() with bool var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, true, "Check value after call uniform1i(100500) for bool var. Returned: " + val);

    gl.uniform1fv(uLoc, [0]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1fv() with bool var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, false, "Check value after call uniform1fv([0]) for bool var. Returned: " + val);

    gl.uniform1fv(uLoc, [1]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1fv() with bool var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, true, "Check value after call uniform1fv() for bool var");

    gl.uniform1iv(uLoc, [0]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1iv() with bool var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, false, "Check value after call uniform1iv([0]) for bool var. Returned: " + val);

    gl.uniform1iv(uLoc, [100500]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1iv() with bool var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, true, "Check value after call uniform1iv([100500]) for bool var");

    gl.uniform1fv(uLoc, [1, 1]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1fv() must generate INVALID_OPERATION with bool value passed as array");
}

function CheckUniformIntFunc(gl, prog, uLoc) {
    gl.uniform1i(uLoc, 0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1i() with int var (0)");
    var val = gl.getUniform(prog, uLoc);
    strictEqual(val, 0, "Check value after call uniform1i(0)for int var. Returned: " + val);

    gl.uniform1i(uLoc, -500);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1i() with signed int var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, -500, "Check value after call uniform1i(-500) for signed int var. Returned: " + val);

    gl.uniform1iv(uLoc, [0]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1iv() with int var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, 0, "Check value after call uniform1iv([0]) for int var. Returned: " + val);

    gl.uniform1f(uLoc, 11.2);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1f() must generate INVALID_OPERATION with int var");
    var checkVal = gl.getUniform(prog, uLoc);
    strictEqual(val, checkVal, "Check that uniform1f() did not change value for int var");

    gl.uniform1fv(uLoc, [15.1]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1fv() must generate INVALID_OPERATION with int var");
    checkVal = gl.getUniform(prog, uLoc);
    strictEqual(val, val, "Check that uniform1fv() did not change value for int var");

    gl.uniform1iv(uLoc, [18, 3453]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1iv() must generate INVALID_OPERATION with int value passed as array");
    checkVal = gl.getUniform(prog, uLoc);
    strictEqual(val, checkVal, "Check that uniform1iv() did not change value for int var passed as array");
}

function CheckUniformFloatFunc(gl, prog, uLoc) {
    gl.uniform1f(uLoc, 0.0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1f() with float var (0.0)");
    var val = gl.getUniform(prog, uLoc);
    strictEqual(val, 0.0, "Check value after call uniform1f() for float var (0.0). Returned: " + val);

    gl.uniform1f(uLoc, -10.565);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1f() with float var");
    val = gl.getUniform(prog, uLoc);
    ok(isEqual(val, -10.565), "Check value after call uniform1f(-10.565) for float var. Returned: " + val);

    gl.uniform1fv(uLoc, [123.45]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1fv() with float var");
    val = gl.getUniform(prog, uLoc);
    ok(isEqual(val, 123.45), "Check value after call uniform1fv([123.45) for float var. Returned: " + val);

    gl.uniform1i(uLoc, 35);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1i() must generate INVALID_OPERATION with float var");
    var checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val, checkVal), "Check that uniform1i(35) did not change value for float var. Returned: " + val);

    gl.uniform1iv(uLoc, [15]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1iv() must generate INVALID_OPERATION with float var");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val, checkVal), "Check that uniform1iv([15]) did not change value for float var. Returned: " + val);

    gl.uniform1fv(uLoc, [18.34, 9.00]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1fv() must generate INVALID_OPERATION with float value passed as array");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val, checkVal), "Check that uniform1fv() did not change value for float var passed as array");
}

function CheckUniformFloat2Func(gl, prog, uLoc) {
    gl.uniform2f(uLoc, 0.0, -23.45);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform2f() with vec2 var (0.0, -23.45)");
    var val = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], 0.0) && isEqual(val[1], -23.45), 
        "Check value after call uniform2f(0.0, -23.45) for vec2 var. Returned: " + ArrayToStr(val));

    gl.uniform2fv(uLoc, [123.45, 232.3]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform2fv() with vec2 var");
    val = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], 123.45) && isEqual(val[1], 232.3), 
        "Check value after call uniform2fv([123.45, 232.3]) for vec2 var. Returned: " + ArrayToStr(val));

    gl.uniform2i(uLoc, 35, 33);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform2i() must generate INVALID_OPERATION with vec2 var");
    var checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]), "Check that uniform2i() did not change value for vec2 var");

    gl.uniform2iv(uLoc, [15, 232]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform2iv() must generate INVALID_OPERATION with vec2 var");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]), "Check that uniform2iv() did not change value for vec2 var");

    gl.uniform2fv(uLoc, [18.34]);
    equal(gl.getError(), gl.INVALID_VALUE, "uniform2fv() must generate INVALID_VALUE with array count < 2");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]), "Check that uniform2fv() did not change value for vec2 var passed with array count < 2");

    // (6)см.ниже
    //                 gl.uniform2fv(uLoc, [18.7, 26.333, 45.0]);
    //                 equal(gl.getError(), gl.INVALID_VALUE, "uniform2fv() must generate INVALID_VALUE with count > 2");
    //                 checkVal = gl.getUniform(prog, uLoc);
    //                 ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]), "Check that uniform2fv() did not change value for vec2 var passed with count > 2");

    gl.uniform1fv(uLoc, [18.34]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1fv() must generate INVALID_VALUE with vec2 param");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]), "Check that uniform1fv() did not change value for vec2 param");
}

function CheckUniformInt2Func(gl, prog, uLoc) {
    gl.uniform2i(uLoc, 0, -23);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform2i() with ivec2 var (0.0, -23)");
    var val = gl.getUniform(prog, uLoc);
    ok(val[0] == 0 && val[1] == -23, "Check value after call uniform2i(0.0, -23) for ivec2 var. Returned: " + ArrayToStr(val));

    gl.uniform2iv(uLoc, [123, 232]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform2iv() with ivec2 var");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == 123 && val[1] == 232, "Check value after call uniform2iv([123, 232]) for ivec2 var. Returned: " + ArrayToStr(val));

    gl.uniform2f(uLoc, 35, 33);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform2f() must generate INVALID_OPERATION with ivec2 var");
    var checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1], "Check that uniform2f() did not change value for ivec2 var");

    gl.uniform2fv(uLoc, [15.1, 232.555]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform2fv() must generate INVALID_OPERATION with ivec2 var");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1], "Check that uniform2fv() did not change value for ivec2 var");

    gl.uniform2iv(uLoc, [18]);
    equal(gl.getError(), gl.INVALID_VALUE, "uniform2iv() must generate INVALID_VALUE with array count < 2");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1], "Check that uniform2iv() did not change value for ivec2 var passed with array count < 2");

    // (6)см.ниже
    //                 gl.uniform2iv(uLoc, [18, 26, 45]);
    //                 equal(gl.getError(), gl.INVALID_VALUE, "uniform2iv() must generate INVALID_OPERATION with array count > 2");
    //                 checkVal = gl.getUniform(prog, uLoc);
    //                 ok(val[0] == checkVal[0] && val[1] == checkVal[1], "Check that uniform2iv() did not change value for ivec2 var passed with array count > 2");

    gl.uniform1iv(uLoc, [18.34]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1iv() must generate INVALID_VALUE with ivec2 param");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1], "Check that uniform1iv() did not change value for ivec2 param");
}

function CheckUniformBool2Func(gl, prog, uLoc) {
    gl.uniform2f(uLoc, 0, 1000);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform2f() with bvec2 var (0, 1000)");
    var val = gl.getUniform(prog, uLoc);
    ok(val[0] == false && val[1] == true, "Check value after call uniform2f(0, 1000) for bvec2 var. Returned: " + ArrayToStr(val));

    gl.uniform2i(uLoc, -1, 0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform2i() with bvec2 var (-1, 0)");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == true && val[1] == false, "Check value after call uniform2i(-1, 0) for bvec2 var. Returned: " + ArrayToStr(val));

    gl.uniform2fv(uLoc, [0.0, 0.0]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform2fv() with bvec2 var ([0.0, 0.0])");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == false && val[1] == false, 
        "Check value after call uniform2fv([0.0, 0.0]) for bvec2 var. Returned: " + ArrayToStr(val));

    gl.uniform2iv(uLoc, [1, 999999]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform2iv() with bvec2 var ([1, 999999])");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == true && val[1] == true, "Check value after call uniform2iv([1, 999999]) for bvec2 var. Returned: " + ArrayToStr(val));

    // (6)см.ниже
    //                 gl.uniform2iv(uLoc, [1, 0, 0]);
    //                 equal(gl.getError(), gl.INVALID_VALUE, "uniform2iv() must generate INVALID_OPERATION with array count > 2");
    //                 var checkVal = gl.getUniform(prog, uLoc);
    //                 ok(val[0] == checkVal[0] && val[1] == checkVal[1], "Check that uniform2iv() did not change value for bvec2 var with array count > 2");

    gl.uniform2fv(uLoc, [0.0]);
    equal(gl.getError(), gl.INVALID_VALUE, "uniform2fv() must generate INVALID_OPERATION with array count < 2");
    var checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1], "Check that uniform2fv() did not change value for bvec2 var with array count < 2");

    gl.uniform1fv(uLoc, [1]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1fv() must generate INVALID_OPERATION with bvec2 var");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1], "Check that uniform1fv([1]) did not change value for bvec2 var");
}

function CheckUniformFloat3Func(gl, prog, uLoc) {
    gl.uniform3f(uLoc, 0.0, -23.45, 999.9999);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform3f() with vec3 var (0.0, -23.45, 999.9999)");
    var val = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], 0.0) && isEqual(val[1], -23.45) && isEqual(val[2], 999.9999), 
        "Check value after call uniform3f(0.0, -23.45, 999.9999) for vec3 var. Returned: " + ArrayToStr(val));

    gl.uniform3fv(uLoc, [123.45, 232.3, 9.0]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform3fv() with vec3 var");
    val = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], 123.45) && isEqual(val[1], 232.3) && isEqual(val[2], 9.0), 
        "Check value after call uniform3fv([123.45, 232.3, 9.0]) for vec3 var. Returned: " + ArrayToStr(val));

    gl.uniform3i(uLoc, 35, 33, -78);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform3i() must generate INVALID_OPERATION with vec3 value");
    var checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]) && isEqual(val[2], checkVal[2]),
        "Check that uniform3i() did not change value for vec3 var");

    gl.uniform3iv(uLoc, [15, 232, 56]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform3iv() must generate INVALID_OPERATION with vec3 value");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]) && isEqual(val[2], checkVal[2]),
        "Check that uniform3iv() did not change value for vec3 var");

    gl.uniform3fv(uLoc, [18.34, 8.8]);
    equal(gl.getError(), gl.INVALID_VALUE, "uniform3fv() must generate INVALID_VALUE with array count < 3");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]) && isEqual(val[2], checkVal[2]),
        "Check that uniform3fv() did not change value for vec3 var passed with array count < 3");

    // (6)см.ниже
    //                 gl.uniform3fv(uLoc, [18.7, 26.333, 45.0, 88]);
    //                 equal(gl.getError(), gl.INVALID_VALUE, "uniform3fv() must generate INVALID_VALUE with array count > 3");
    //                 checkVal = gl.getUniform(prog, uLoc);
    //                 ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]) && isEqual(val[2], checkVal[2]),
    //                  "Check that uniform3fv() did not change value for vec3 var passed with array count > 3");

    gl.uniform2f(uLoc, 18.34, 9.999);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform2f() must generate INVALID_VALUE with vec3 param");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]) && isEqual(val[2], checkVal[2]),
        "Check that uniform2f() did not change value for vec3 param");
}

function CheckUniformInt3Func(gl, prog, uLoc) {
    gl.uniform3i(uLoc, 0, -23, 4444);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform3i() with ivec3 var (0.0, -23, 4444)");
    var val = gl.getUniform(prog, uLoc);
    ok(val[0] == 0 && val[1] == -23 && val[2] == 4444, 
        "Check value after call uniform3i(0.0, -23, 4444) for ivec3 var. Returned: " + ArrayToStr(val));

    gl.uniform3iv(uLoc, [123, 232, 454]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform3iv() with ivec3 var");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == 123 && val[1] == 232 && val[2] == 454, 
        "Check value after call uniform3iv([123, 232, 454]) for ivec3 var. Returned: " + ArrayToStr(val));

    gl.uniform3f(uLoc, 35.8, 33.333, 0.0);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform3f() must generate INVALID_OPERATION with ivec3 value");
    var checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2], "Check that uniform3f() did not change value for ivec3 var");

    gl.uniform3fv(uLoc, [15.1, 232.555, 88.888]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform3fv() must generate INVALID_OPERATION with ivec3 value");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2], "Check that uniform3fv() did not change value for ivec3 var");

    gl.uniform3iv(uLoc, [18, 111]);
    equal(gl.getError(), gl.INVALID_VALUE, "uniform3iv() must generate INVALID_VALUE with array count < 3");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2],
        "Check that uniform3iv() did not change value for ivec3 var passed with array count < 3");

    // (6)см.ниже
    //                 gl.uniform3iv(uLoc, [18, 26, 45, 8888]);
    //                 equal(gl.getError(), gl.INVALID_VALUE, "uniform3iv() must generate INVALID_OPERATION with array count > 3");
    //                 checkVal = gl.getUniform(prog, uLoc);
    //                 ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2], 
    //                      "Check that uniform3iv() did not change value for ivec3 var passed with array count > 3");

    gl.uniform2iv(uLoc, [18, 34]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform2iv() must generate INVALID_VALUE with ivec3 param");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2], "Check that unifor2iv() did not change value for ivec3 param");
}

function CheckUniformBool3Func(gl, prog, uLoc) {

    gl.uniform3f(uLoc, 0, 500, -999);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform3f() with bvec3 var (0, 500, -999)");
    var val = gl.getUniform(prog, uLoc);
    ok(val[0] == false && val[1] == true && val[2] == true, 
        "Check value after call uniform3f(0, 500, -999) for bvec3 var. Returned: " + ArrayToStr(val));

    gl.uniform3i(uLoc, -1, 0, 0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform3i() with bvec3 value (-1, 0, 0)");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == true && val[1] == false && val[2] == false, 
        "Check value after call uniform3i() for bvec3 var (-1, 0, 0). Returned: " + ArrayToStr(val));

    gl.uniform3fv(uLoc, [0.0, -0.0, 666]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform3fv() with bvec3 var ([0.0, -0.0, 666])");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == false && val[1] == false && val[2] == true, 
        "Check value after call uniform3fv([0.0, -0.0, 666]) for bvec3 var. Returned: " + ArrayToStr(val));

    gl.uniform3iv(uLoc, [1, 999999, -2]);
    equal(gl.getError(), gl.NO_ERROR, "uniform3iv() generates errors with bvec3 var ([1, 999999, -2])");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == true && val[1] == true && val[2] == true, 
        "Check that uniform3iv([1, 999999, -2]) did not change value for bvec3 var. Returned: " + ArrayToStr(val));

     // (6)см.ниже
    //     gl.uniform3iv(uLoc, [1, 0, 0, -1]);
    //     equal(gl.getError(), gl.INVALID_VALUE, "uniform3iv() must generate INVALID_OPERATION with array count > 3");
    //     var checkVal = gl.getUniform(prog, uLoc);
    //     ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2], "Check that uniform3iv() did not change value for bvec3 var with array count > 3");

    gl.uniform3fv(uLoc, [0.0, 9.99]);
    equal(gl.getError(), gl.INVALID_VALUE, "uniform3fv() must generate INVALID_OPERATION with count < 3");
    var checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2], "Check that uniform3fv() did not change value for bvec3 var with array count < 3");

    gl.uniform2i(uLoc, 9, -2222);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform2i() must generate INVALID_OPERATION with bvec3 var");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2], "Check that uniform2i() did not change value for bvec3 var");
}

function CheckUniformFloat4Func(gl, prog, uLoc) {
    gl.uniform4f(uLoc, 0.0, -23.45, 999.9999, 3.09);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform4f() with vec4 var (0.0, -23.45, 999.9999, 3.09)");
    var val = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], 0.0) && isEqual(val[1], -23.45) && isEqual(val[2], 999.9999) && isEqual(val[3], 3.09),
        "Check value after call uniform4f(0.0, -23.45, 999.9999, 3.09) for vec4 var. Returned: " + ArrayToStr(val));

    gl.uniform4fv(uLoc, [123.45, 232.3, 9.0, -0.0001]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform4fv() with vec4 value");
    val = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], 123.45) && isEqual(val[1], 232.3) && isEqual(val[2], 9.0) && isEqual(val[3], -0.0001),
        "Check value after call uniform4fv([123.45, 232.3, 9.0, -0.0001]) for vec4 var. Returned: " + ArrayToStr(val));

    gl.uniform4i(uLoc, 35, 33, -78, 179);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform4i() must generate INVALID_OPERATION with vec4 value");
    var checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]) && isEqual(val[2], checkVal[2]) && isEqual(val[3], checkVal[3]),
        "Check that uniform4i() did not change value for vec4 var");

    gl.uniform4iv(uLoc, [15, 232, 56, -11111]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform4iv() must generate INVALID_OPERATION with vec4 value");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]) && isEqual(val[2], checkVal[2]) && isEqual(val[3], checkVal[3]),
        "Check that uniform4iv() did not change value for vec4 var");

    gl.uniform4fv(uLoc, [18.34, 8.8, -111.22]);
    equal(gl.getError(), gl.INVALID_VALUE, "uniform4fv() must generate INVALID_VALUE with array count < 4");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]) && isEqual(val[2], checkVal[2]) && isEqual(val[3], checkVal[3]),
        "Check that uniform4fv() did not change value for vec4 var passed with array count < 4");

    // (6)см.ниже
    //                 gl.uniform4fv(uLoc, [18.7, 26.333, 45.0, 88, -131.33]);
    //                 equal(gl.getError(), gl.INVALID_VALUE, "uniform3fv() must generate INVALID_VALUE with array count > 4");
    //                 checkVal = gl.getUniform(prog, uLoc);
    //                 ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]) && isEqual(val[2], checkVal[2]) && isEqual(val[3], checkVal[3]), 
    //                    "Check that uniform4fv() did not change value for vec4 var passed with array count > 4");

    gl.uniform2f(uLoc, 18.34, 9.999);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform2f() must generate INVALID_VALUE with vec4 param");
    checkVal = gl.getUniform(prog, uLoc);
    ok(isEqual(val[0], checkVal[0]) && isEqual(val[1], checkVal[1]) && isEqual(val[2], checkVal[2]) && isEqual(val[3], checkVal[3]),
        "Check that uniform2f() did not change value for vec4 param");
}

function CheckUniformInt4Func(gl, prog, uLoc) {
    gl.uniform4i(uLoc, 0, -23, 4444, 873);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform4i() with ivec4 var (0.0, -23, 4444, 873)");
    var val = gl.getUniform(prog, uLoc);
    ok(val[0] == 0 && val[1] == -23 && val[2] == 4444 && val[3] == 873,
        "Check value after call uniform4i(0.0, -23, 4444, 873) for ivec4 var. Returned: " + ArrayToStr(val));

    gl.uniform4iv(uLoc, [123, 232, 454, -309]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform4iv() with ivec4 vaк");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == 123 && val[1] == 232 && val[2] == 454 && val[3] == -309,
        "Check value after call uniform4iv([123, 232, 454, -309]) for ivec4 var. Returned: " + ArrayToStr(val));

    gl.uniform4f(uLoc, 35.8, 33.333, 0.0, 8.8);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform4f() must generate INVALID_OPERATION with ivec4 value");
    var checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2] && val[3] == checkVal[3],
        "Check that uniform4f() did not change value for ivec4 var");

    gl.uniform4fv(uLoc, [15.1, 232.555, 88.888, -378.8]);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform4fv() must generate INVALID_OPERATION with ivec4 value");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2] && val[3] == checkVal[3],
        "Check that uniform4fv() did not change value for ivec4 var");

    gl.uniform4iv(uLoc, [18, 111, 6678]);
    equal(gl.getError(), gl.INVALID_VALUE, "uniform4iv() must generate INVALID_VALUE with array count < 4");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2] && val[3] == checkVal[3],
        "Check that uniform4iv() did not change value for ivec4 var passed with array count < 4");

    // (6)см.ниже
    //                 gl.uniform4iv(uLoc, [18, 26, 45, 8888, 641]);
    //                 equal(gl.getError(), gl.INVALID_VALUE, "uniform4iv() must generate INVALID_OPERATION with array count > 4");
    //                 checkVal = gl.getUniform(prog, uLoc);
    //                 ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2] && val[3] == checkVal[3], 
    //                      "Check that uniform4iv() did not change value for ivec4 var passed with array count > 4");

    gl.uniform1i(uLoc, 18);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform1i() must generate INVALID_VALUE with ivec4 param");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2] && val[3] == checkVal[3],
        "Check that uniform1i() did not change value for ivec4 param");
}

function CheckUniformBool4Func(gl, prog, uLoc) {
    gl.uniform4f(uLoc, 0, 100500, -999, -0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform4f() with bvec4 var (0, 100500, -999, -0)");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == false && val[1] == true && val[2] == true && val[3] == false,
        "Check value after call uniform3f(0, 100500, -999, -0) for bvec4 var. Returned: " + ArrayToStr(val));

    gl.uniform4i(uLoc, -1, 0, 0, 100501);
    equal(gl.getError(), gl.NO_ERROR, "uniform4i() generates errors with bvec4 var (-1, 0, 0, 100501)");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == true && val[1] == false && val[2] == false && val[3] == true, 
        "Check value after call uniform4i(-1, 0, 0, 100501) for bvec4 var. Returned: " + ArrayToStr(val));

    gl.uniform4fv(uLoc, [0.0, -0.0, 666, 0]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform3fv() with bvec4 var ([0.0, -0.0, 666, 0])");
    var val = gl.getUniform(prog, uLoc);
    ok(val[0] == false && val[1] == false && val[2] == true && val[3] == false,
        "Check value after call uniform4fv([0.0, -0.0, 666, 0]) for bvec4 var. Returned: " + ArrayToStr(val));

    gl.uniform4iv(uLoc, [1, 999999, -2, -1]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform4iv() with bvec4 var ([1, 999999, -2, -1])");
    val = gl.getUniform(prog, uLoc);
    ok(val[0] == true && val[1] == true && val[2] == true && val[3] == true,
        "Check value after call uniform3iv([1, 999999, -2, -1]) for bvec4 var. Returned: " + ArrayToStr(val));

    // (6)см.ниже
    //                 gl.uniform4iv(uLoc, [1, 0, 0, -1, 7]);
    //                 equal(gl.getError(), gl.INVALID_VALUE, "uniform4iv() must generate INVALID_OPERATION with array count > 4");
    //                 var checkVal = gl.getUniform(prog, uLoc);
    //                 ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2] && val[3] == checkVal[3], 
    //                  "Check that uniform4iv() did not change value for bvec4 var with array count > 4");

    gl.uniform4fv(uLoc, [0.0, 9.99, -1]);
    equal(gl.getError(), gl.INVALID_VALUE, "uniform3fv() must generate INVALID_OPERATION with array count < 4");
    var checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2] && val[3] == checkVal[3],
        "Check that uniform3fv() did not change value for bvec4 var with array count < 4");

    gl.uniform2i(uLoc, 9, -2222);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform2i() must generate INVALID_OPERATION with bvec4 var");
    checkVal = gl.getUniform(prog, uLoc);
    ok(val[0] == checkVal[0] && val[1] == checkVal[1] && val[2] == checkVal[2] && val[3] == checkVal[3],
        "Check that uniform2i() did not change value for bvec4 var");
}

function CheckUniformSampler2DFunc(gl, prog, uLoc) {
    var tex = CreateTexture2D(gl, gl.RGB, 32, 32);
    gl.activeTexture(gl.TEXTURE0);

    gl.uniform1i(uLoc, 0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1i() with sampler2D var (0)");
    var val = gl.getUniform(prog, uLoc);
    strictEqual(val, 0, "Check value after call uniform1i(0) for sampler2D var");

    gl.uniform1f(uLoc, 0.0);
    equal(gl.getError(), gl.INVALID_OPERATION, "getError() == INVALID_OPERATION if sampler2D is loaded using a command other than uniform1i and uniform1iv");

    gl.uniform1iv(uLoc, [0]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1iv() with sampler2D var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, 0, "Check value after call uniform1iv([0]) for sampler2D var");

    gl.uniform1fv(uLoc, [0.0]);
    equal(gl.getError(), gl.INVALID_OPERATION, "getError() == INVALID_OPERATION if sampler2D is loaded using a command other than uniform1i and uniform1iv");

    gl.deleteTexture(tex);
}

function CheckUniformSamplerCubeFunc(gl, prog, uLoc) {
    var tex = CreateTextureCube(gl, gl.RGB, 32, 32);
    gl.activeTexture(gl.TEXTURE0);

    gl.uniform1i(uLoc, 0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1i() with samplerCube var (0)");
    var val = gl.getUniform(prog, uLoc);
    strictEqual(val, 0, "Check value after call uniform1i(0) for sampler2D var");

    gl.uniform1f(uLoc, 0.0);
    equal(gl.getError(), gl.INVALID_OPERATION, "getError() == INVALID_OPERATION if samplerCube is loaded using a command other than uniform1i and uniform1iv");

    gl.uniform1iv(uLoc, [0]);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform1iv() with samplerCube var");
    val = gl.getUniform(prog, uLoc);
    strictEqual(val, 0, "Check value after call uniform1iv([0]) for samplerCube var");

    gl.uniform1fv(uLoc, [0.0]);
    equal(gl.getError(), gl.INVALID_OPERATION, "getError() == INVALID_OPERATION if samplerCube is loaded using a command other than uniform1i and uniform1iv");

    gl.deleteTexture(tex);
}

function CheckUniformMtx2Func(gl, prog, uLoc) {
    CheckUniformMtxFunc(
        gl,
        prog,
        {
            'name': "uniformMatrix2fv",
            'Set': function (gl, uLoc, transpose, arr) {
                gl.uniformMatrix2fv(uLoc, transpose, arr);
            }
        },
        uLoc,
        4);
}

function CheckUniformMtx3Func(gl, prog, uLoc) {
    CheckUniformMtxFunc(
        gl,
        prog,
        {
            'name': "uniformMatrix3fv",
            'Set': function (gl, uLoc, transpose, arr) {
                gl.uniformMatrix3fv(uLoc, transpose, arr);
            }
        },
        uLoc,
        9);
}

function CheckUniformMtx4Func(gl, prog, uLoc) {
    CheckUniformMtxFunc(
        gl,
        prog,
        {
            'name': "uniformMatrix4fv",
            'Set': function (gl, uLoc, transpose, arr) {
                gl.uniformMatrix4fv(uLoc, transpose, arr);
            }
        },
        uLoc,
        16);
}

// (5) см.ниже
function CheckType(gl, type, uVar) {
    switch (type) {
        case gl.BOOL: return isTypeOf("Boolean", uVar);
        case gl.INT: return isTypeOf("Number", uVar);
        case gl.FLOAT: return isTypeOf("Number", uVar);
        case gl.FLOAT_VEC2: return ((uVar instanceof Float32Array) && (uVar.length == 2) && isTypeOf("Number", uVar[0]));
        case gl.INT_VEC2: return ((uVar instanceof Int32Array) && (uVar.length == 2) && isTypeOf("Number", uVar[0]));
        case gl.BOOL_VEC2: return (isTypeOf("Array", uVar) && (uVar.length == 2) && isTypeOf("Boolean", uVar[0]));
        case gl.FLOAT_VEC3: return ((uVar instanceof Float32Array) && (uVar.length == 3) && isTypeOf("Number", uVar[0]));
        case gl.INT_VEC3: return ((uVar instanceof Int32Array) && (uVar.length == 3) && isTypeOf("Number", uVar[0]));
        case gl.BOOL_VEC3: return (isTypeOf("Array", uVar) && (uVar.length == 3) && isTypeOf("Boolean", uVar[0]));
        case gl.FLOAT_VEC4: return ((uVar instanceof Float32Array) && (uVar.length == 4) && isTypeOf("Number", uVar[0]));
        case gl.INT_VEC4: return ((uVar instanceof Int32Array) && (uVar.length == 4) && isTypeOf("Number", uVar[0]));
        case gl.BOOL_VEC4: return (isTypeOf("Array", uVar) && uVar.length == 4 && isTypeOf("Boolean", uVar[0]));
        case gl.FLOAT_MAT2: return ((uVar instanceof Float32Array) && (uVar.length == 4) && isTypeOf("Number", uVar[0]));
        case gl.FLOAT_MAT3: return ((uVar instanceof Float32Array) && (uVar.length == 9) && isTypeOf("Number", uVar[0]));
        case gl.FLOAT_MAT4: return ((uVar instanceof Float32Array) && (uVar.length == 16) && isTypeOf("Number", uVar[0]));
        case gl.SAMPLER_2D: return isTypeOf("Number", uVar);
        case gl.SAMPLER_CUBE: return isTypeOf("Number", uVar);
    }
    return false;
}

function GLTypeToReadableStr(gl, type) {
    switch (type) {
        case gl.BOOL: return "boolean";
        case gl.INT: return "long";
        case gl.FLOAT: return "float";
        case gl.FLOAT_VEC2: return "Float32Array with 2 elements";
        case gl.INT_VEC2: return "Int32Array with 2 elements";
        case gl.BOOL_VEC2: return "boolean[] with 2 elements";
        case gl.FLOAT_VEC3: return "Float32Array with 3 elements";
        case gl.INT_VEC3: return "Int32Array with 3 elements";
        case gl.BOOL_VEC3: return "boolean[] with 3 elements";
        case gl.FLOAT_VEC4: return "Float32Array with 4 elements";
        case gl.INT_VEC4: return "Int32Array with 4 elements";
        case gl.BOOL_VEC4: return "boolean[] with 4 elements";
        case gl.FLOAT_MAT2: return "Float32Array with 4 elements";
        case gl.FLOAT_MAT3: return "Float32Array with 9 elements";
        case gl.FLOAT_MAT4: return "Float32Array with 16 elements";
        case gl.SAMPLER_2D: return "Sampler2D";
        case gl.SAMPLER_CUBE: return "SamplerCube";
    }
    return "unknown";
}

function GLTypeToStr(gl, type) {
    switch (type) {
        case gl.BOOL: return "BOOL";
        case gl.INT: return "INT";
        case gl.FLOAT: return "FLOAT";
        case gl.FLOAT_VEC2: return "FLOAT_VEC2";
        case gl.INT_VEC2: return "INT_VEC2";
        case gl.BOOL_VEC2: return "BOOL_VEC2";
        case gl.FLOAT_VEC3: return "FLOAT_VEC3";
        case gl.INT_VEC3: return "INT_VEC3";
        case gl.BOOL_VEC3: return "BOOL_VEC3";
        case gl.FLOAT_VEC4: return "FLOAT_VEC4";
        case gl.INT_VEC4: return "INT_VEC4";
        case gl.BOOL_VEC4: return "BOOL_VEC4";
        case gl.FLOAT_MAT2: return "FLOAT_MAT2";
        case gl.FLOAT_MAT3: return "FLOAT_MAT3";
        case gl.FLOAT_MAT4: return "FLOAT_MAT4";
        case gl.SAMPLER_2D: return "SAMPLER_2D";
        case gl.SAMPLER_CUBE: return "SAMPLER_CUBE";
    }
    return "unknown";
}

function CheckDrawArraysParams(gl) {

    gl.drawArrays(gl.TRIANGLES, -1, 1);
    equal(gl.getError(), gl.INVALID_VALUE, "drawArrays() must generate INVALID_VALUE if first < 0");

    gl.drawArrays(gl.TRIANGLES, 0, 10000);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() must generate INVALID_OPERATION if range specified in drawArrays lies outside the storage of the bound buffer");

    gl.drawArrays(gl.TRIANGLES, 0, -1);
    equal(gl.getError(), gl.INVALID_VALUE, "drawArrays() must generate INVALID_VALUE if count < 0");

    gl.drawArrays(-1, 0, 1);
    equal(gl.getError(), gl.INVALID_ENUM, "drawArrays() must generate INVALID_ENUM with invalid mode");

    var modeParams =
    [
        { 'name': "POINTS", 'value': gl.POINTS },
        { 'name': "LINE_STRIP", 'value': gl.LINE_STRIP },
        { 'name': "LINE_LOOP", 'value': gl.LINE_LOOP },
        { 'name': "LINES", 'value': gl.LINES },
        { 'name': "TRIANGLE_STRIP", 'value': gl.TRIANGLE_STRIP },
        { 'name': "TRIANGLE_FAN", 'value': gl.TRIANGLE_FAN },
        { 'name': "TRIANGLES", 'value': gl.TRIANGLES }
    ];

    for (var i = 0, l = modeParams.length; i < l; ++i) {
        gl.drawArrays(modeParams[i].value, 0, 1);
        equal(gl.getError(), gl.NO_ERROR, "drawArrays([" + modeParams[i].name + "]) must not generate errors");
    }
}
function CheckDrawArraysStencilOp(gl) {
    var initFrontMask = gl.getParameter(gl.STENCIL_WRITEMASK);
    gl.stencilMaskSeparate(gl.FRONT, 0);
    gl.stencilMaskSeparate(gl.BACK, 1);

    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() must generate INVALID_OPERATION if STENCIL_WRITEMASK != STENCIL_BACK_WRITEMASK");

    gl.stencilMaskSeparate(gl.FRONT_AND_BACK, initFrontMask);

    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() must not generate errors after set STENCIL_WRITEMASK == STENCIL_BACK_WRITEMASK");

    var initStencilMask = gl.getParameter(gl.STENCIL_VALUE_MASK);
    var initStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
    var initStencilRef = gl.getParameter(gl.STENCIL_REF);

    gl.stencilFuncSeparate(gl.FRONT, initStencilFunc, initStencilRef, 0xF0F0F0F0);
    gl.stencilFuncSeparate(gl.BACK, initStencilFunc, initStencilRef, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() must generate INVALID_OPERATION if STENCIL_VALUE_MASK != STENCIL_BACK_VALUE_MASK");

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initStencilFunc, initStencilRef, initStencilMask);
    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() must not generate errors after set STENCIL_VALUE_MASK == STENCIL_BACK_VALUE_MASK");

    gl.stencilFuncSeparate(gl.FRONT, initStencilFunc, 1, initStencilMask);
    gl.stencilFuncSeparate(gl.BACK, initStencilFunc, 0, initStencilMask);

    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() must generate INVALID_OPERATION if STENCIL_REF != STENCIL_BACK_REF");

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initStencilFunc, initStencilRef, initStencilMask);
    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() must not generate errors after set STENCIL_REF == STENCIL_BACK_REF");
}

function CheckDrawElementsParams(gl) {
    gl.drawElements(gl.TRIANGLES, 10000, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawElements() must generate INVALID_OPERATION if range specified in drawElements lies outside the storage of the bound buffer");

    gl.drawElements(gl.TRIANGLES, -1, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "drawElements() must generate INVALID_VALUE if count < 0");

    gl.drawElements(gl.TRIANGLES, 32, gl.UNSIGNED_SHORT, 3);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawElements() must generate INVALID_OPERATION if offset is not multiple of the size of the given type");

    gl.drawElements(gl.TRIANGLES, 1, -1, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "drawElements() must generate INVALID_ENUM with invalid type");

    gl.drawElements(gl.TRIANGLES, 32, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.NO_ERROR, "drawElements([UNSIGNED_BYTE]) must not generate errors");

    gl.drawElements(gl.TRIANGLES, 32, gl.UNSIGNED_SHORT, 0);
    equal(gl.getError(), gl.NO_ERROR, "drawElements([UNSIGNED_SHORT]) must not generate errors");

    gl.drawElements(gl.TRIANGLES, 1, gl.FLOAT, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "drawElements() must generate INVALID_ENUM if type == FLOAT");

    gl.drawElements(-1, 1, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "drawElements() must generate INVALID_ENUM with invalid mode");

    var modeParams =
    [
        { 'name': "POINTS", 'value': gl.POINTS },
        { 'name': "LINE_STRIP", 'value': gl.LINE_STRIP },
        { 'name': "LINE_LOOP", 'value': gl.LINE_LOOP },
        { 'name': "LINES", 'value': gl.LINES },
        { 'name': "TRIANGLE_STRIP", 'value': gl.TRIANGLE_STRIP },
        { 'name': "TRIANGLE_FAN", 'value': gl.TRIANGLE_FAN },
        { 'name': "TRIANGLES", 'value': gl.TRIANGLES }
    ];

    for (var i = 0, l = modeParams.length; i < l; ++i) {
        gl.drawElements(modeParams[i].value, 1, gl.UNSIGNED_BYTE, 0);
        equal(gl.getError(), gl.NO_ERROR, "drawElements([" + modeParams[i].name + "]) must not generate errors");
    }
}

function CheckDrawElementsStencilOp(gl) {
    var initFrontMask = gl.getParameter(gl.STENCIL_WRITEMASK);
    gl.stencilMaskSeparate(gl.FRONT, 0);
    gl.stencilMaskSeparate(gl.BACK, 1);

    gl.drawElements(gl.TRIANGLES, 32, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() must generate INVALID_OPERATION if STENCIL_WRITEMASK != STENCIL_BACK_WRITEMASK");

    gl.stencilMaskSeparate(gl.FRONT_AND_BACK, initFrontMask);

    gl.drawElements(gl.TRIANGLES, 32, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.NO_ERROR, "drawElements() must not generate errors after set STENCIL_WRITEMASK == STENCIL_BACK_WRITEMASK");

    var initStencilMask = gl.getParameter(gl.STENCIL_VALUE_MASK);
    var initStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
    var initStencilRef = gl.getParameter(gl.STENCIL_REF);

    gl.stencilFuncSeparate(gl.FRONT, initStencilFunc, initStencilRef, 0xF0F0F0F0);
    gl.stencilFuncSeparate(gl.BACK, initStencilFunc, initStencilRef, 0);

    gl.drawElements(gl.TRIANGLES, 32, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawElements() must generate INVALID_OPERATION if STENCIL_VALUE_MASK != STENCIL_BACK_VALUE_MASK");

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initStencilFunc, initStencilRef, initStencilMask);
    gl.drawElements(gl.TRIANGLES, 32, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.NO_ERROR, "drawElements() must not generate errors after set STENCIL_VALUE_MASK == STENCIL_BACK_VALUE_MASK");

    gl.stencilFuncSeparate(gl.FRONT, initStencilFunc, 1, initStencilMask);
    gl.stencilFuncSeparate(gl.BACK, initStencilFunc, 0, initStencilMask);

    gl.drawElements(gl.TRIANGLES, 32, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() must generate INVALID_OPERATION if STENCIL_REF != STENCIL_BACK_REF");

    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, initStencilFunc, initStencilRef, initStencilMask);
    gl.drawElements(gl.TRIANGLES, 32, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() must not generate errors after set STENCIL_REF == STENCIL_BACK_REF");
}

function isOneOf(arr, elem) {
    for(var i = 0; i < arr.length; ++i) {
        if(arr[i] == elem)
            return true;
    }

    return false;
}

function VerifyWebGLActiveInfo(gl, info, funcDesc) {
    ok(info instanceof WebGLActiveInfo, funcDesc + " returned value instanceof WebGLActiveInfo");
    ok(info !== null || info !== undefined, funcDesc + " return valid info");

    if (info === null || info === undefined) {
        return;
    }

    ok(info.name && info.name.length > 0, funcDesc + " return valid name");
    raises(function () {
        info.name = "invalid_name";
    }, "[name] attribute of WebGLActiveInfo is readonly");

    ok(info.size >= 1, funcDesc + " return valid size");
    raises(function () {
        info.size = -1;
    }, "[size] attribute of WebGLActiveInfo is readonly");

    var types = [
        gl.FLOAT, gl.FLOAT_VEC2, gl.FLOAT_VEC3, gl.FLOAT_VEC4, 
        gl.INT, gl.INT_VEC2, gl.INT_VEC3, gl.INT_VEC4, 
        gl.BOOL, gl.BOOL_VEC2, gl.BOOL_VEC3, gl.BOOL_VEC4, 
        gl.FLOAT_MAT2, gl.FLOAT_MAT3, gl.FLOAT_MAT4,
        gl.SAMPLER_2D, gl.SAMPLER_CUBE
    ];

    ok(isOneOf(types, info.type), funcDesc + " return valid type [" + GLTypeToStr(gl, info.type) + "]");
    raises(function () {
        info.type = -1;
    }, "[type] attribute of WebGLActiveInfo is readonly");
}

//////////////////////////////////////////////////////////////////////////
module("WebGLProgram");

test("WebGLProgram can be created", function () {
    var gl = GetCleanContext();

    var prog = gl.createProgram();
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call createProgram()");
    ok((prog != null && prog != undefined), "WebGLProgram can be created");
    ok(prog instanceof WebGLProgram, "createProgram() returned value instanceof WebGLProgram");

    CleanProgram(gl, prog);
});

test("verify deleteProgram()", function () {
    var gl = GetCleanContext();

    var prog = gl.createProgram();
    notStrictEqual(gl.getProgramParameter(prog, gl.DELETE_STATUS), true, "getProgramParameter() != DELETE_STATUS with no deleted program")

    gl.deleteProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call deleteProgram()");
    var retVal = gl.getProgramParameter(prog, gl.DELETE_STATUS);
    ok((retVal == false || retVal == undefined), "getProgramParameter() == DELETE_STATUS with deleted program")
    gl.getError();

    gl.deleteProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "Call deleteProgram() for program that has already been deleted must not generate errors (5.13.9)")

    gl.deleteProgram(null);
    equal(gl.getError(),gl.NO_ERROR, "Call deleteProgram() for null program must not generate errors");

    gl.deleteProgram(undefined);
    equal(gl.getError(), gl.NO_ERROR, "Call deleteProgram() for undefined program must not generate errors");

    CleanProgram(gl, prog);
});

test("verify isProgram()", function () {
    var gl = GetCleanContext();

    strictEqual(gl.isProgram(undefined), false, "isProgram() == false for undefined program");
    equal(gl.getError(), gl.NO_ERROR, "Call isProgram() for undefined program must not generate errors");

    strictEqual(gl.isProgram(null),false, "isProgram() == false for null program");
    equal(gl.getError(), gl.NO_ERROR, "Call isProgram() for null program must not generate errors");

    var prog = gl.createProgram();
    strictEqual(gl.isProgram(prog), true, "isProgram() == true for valid program");
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call isProgram()");

    gl.deleteProgram(prog);
    strictEqual(gl.isProgram(prog), false, "isProgram() == false for deleted program")
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call isProgram() for deleted program");
});

test("verify getProgramParameter()", function () {
    var gl = GetCleanContext();

    var prog = gl.createProgram();

    var acceptableParams =
        [
            { 'name': "DELETE_STATUS", 'value': gl.DELETE_STATUS },
            { 'name': "LINK_STATUS", 'value': gl.LINK_STATUS },
            { 'name': "VALIDATE_STATUS", 'value': gl.VALIDATE_STATUS },
            { 'name': "ATTACHED_SHADERS", 'value': gl.ATTACHED_SHADERS },
            { 'name': "ACTIVE_ATTRIBUTES", 'value': gl.ACTIVE_ATTRIBUTES },
            { 'name': "ACTIVE_UNIFORMS", 'value': gl.ACTIVE_UNIFORMS }
        ];

    for (var i = 0, l = acceptableParams.length; i < l; i++) {
        gl.getProgramParameter(prog, acceptableParams[i].value);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getProgramParameter() with parameter " + acceptableParams[i].name);
    }

    var removedParams =
    [
        { 'name': "INFO_LOG_LENGTH", 'value': gl.INFO_LOG_LENGTH },
        { 'name': "ACTIVE_ATTRIBUTE_MAX_LENGTH", 'value': gl.ACTIVE_ATTRIBUTE_MAX_LENGTH },
        { 'name': "ACTIVE_UNIFORM_MAX_LENGTH", 'value': gl.ACTIVE_UNIFORM_MAX_LENGTH }
    ];

    for (var i = 0, l = removedParams.length; i < l; i++) {
        gl.getProgramParameter(prog, removedParams[i].value);
        equal(gl.getError(), gl.INVALID_ENUM, "getProgramParameter() must generate INVALID_ENUM for removed parameter " + removedParams[i].name);
    }

    gl.getProgramParameter(prog, -1);
    equal(gl.getError(), gl.INVALID_ENUM, "getProgramParameter() must be generate INVALID_ENUM with invalid program parameter");

    gl.getProgramParameter(null, gl.DELETE_STATUS);
    equal(gl.getError(), gl.INVALID_VALUE, "getProgramParameter() must generate INVALID_VALUE for null program");

    gl.getProgramParameter(undefined, gl.DELETE_STATUS);
    equal(gl.getError(), gl.INVALID_VALUE, "getProgramParameter() must generate INVALID_VALUE for undefined program");

    CleanProgram(gl, prog);
});

test("verify useProgram()", function () {
    var gl = GetCleanContext();

    gl.useProgram(null);
    equal(gl.getError(), gl.NO_ERROR, "Call useProgram() for null must not generate errors");
    var curProg = gl.getParameter(gl.CURRENT_PROGRAM);
    ok((curProg === undefined || curProg === null), "getParameter(gl.CURRENT_PROGRAM) == undefined(null) after useProgram(null)");
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(CURRENT_PROGRAM)");

    gl.useProgram(undefined);
    equal(gl.getError(), gl.NO_ERROR, "Call useProgram() for undefined  must not generate errors");
    curProg = gl.getParameter(gl.CURRENT_PROGRAM);
    ok((curProg === undefined || curProg === null), "getParameter(gl.CURRENT_PROGRAM) == undefined(null) after useProgram(null)");
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getParameter(gl.CURRENT_PROGRAM)");

    var prog = CreateProgramNoLinking(gl);
    gl.useProgram(prog);
    equal(gl.getError(), gl.INVALID_OPERATION, "useProgram() generates INVALID_OPERATION with not linking program");

    gl.linkProgram(prog);
    gl.useProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call useProgram()");

    strictEqual(gl.getParameter(gl.CURRENT_PROGRAM), prog, "getParameter(gl.CURRENT_PROGRAM) == prog after useProgram()");
    notStrictEqual(gl.getParameter(gl.CURRENT_PROGRAM), null, "getParameter(gl.CURRENT_PROGRAM) != null after useProgram()");
    notStrictEqual(gl.getParameter(gl.CURRENT_PROGRAM), undefined, "getParameter(gl.CURRENT_PROGRAM) != undefined after useProgram()");

    CleanProgram(gl, prog);
});


test("verify validateProgram()", function () {
    var gl = GetCleanContext();

    gl.validateProgram(null);
    equal(gl.getError(), gl.INVALID_VALUE, "validateProgram() generates INVALID_VALUE with null program");

    gl.validateProgram(undefined);
    equal(gl.getError(), gl.INVALID_VALUE, "validateProgram() generates INVALID_VALUE with undefined program");

    var prog = CreateProgramNoLinking(gl);
    strictEqual(gl.getProgramParameter(prog, gl.VALIDATE_STATUS), false, "getProgramParameter() != VALIDATE_STATUS without call validateProgram()");

    gl.validateProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call validateProgram() with not linking program");
    //strictEqual(gl.getProgramParameter(prog, gl.VALIDATE_STATUS), false, "getProgramParameter() != VALIDATE_STATUS with not linking program"); // driver dependent behaviour

    gl.linkProgram(prog);
    gl.validateProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call validateProgram()");
    strictEqual(gl.getProgramParameter(prog, gl.VALIDATE_STATUS), true, "getProgramParameter() == VALIDATE_STATUS after validateProgram()");
    notStrictEqual(gl.getParameter(gl.CURRENT_PROGRAM), prog, "getParameter(gl.CURRENT_PROGRAM) != prog after validateProgram()");
    var curProg = gl.getParameter(gl.CURRENT_PROGRAM);
    ok((curProg === undefined || curProg === null), "getParameter(gl.CURRENT_PROGRAM) == undefined(null) after validateProgram()");

    CleanProgram(gl, prog);
});

test("verify attachShader()", function () {
    var gl = GetCleanContext();

    var prog = gl.createProgram();
    var vShader = gl.createShader(gl.VERTEX_SHADER);

    gl.attachShader(undefined, undefined);
    equal(gl.getError(), gl.INVALID_VALUE, "attachShader() with undefined parameters must generate INVALID_VALUE");

    gl.attachShader(undefined, vShader);
    equal(gl.getError(), gl.INVALID_VALUE, "attachShader() with undefined program must generate INVALID_VALUE");

    gl.attachShader(prog, undefined);
    equal(gl.getError(), gl.INVALID_VALUE, "attachShader() with undefined shader must generate INVALID_VALUE");

    gl.attachShader(prog, vShader);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call attachShader()");

    gl.attachShader(prog, vShader);
    equal(gl.getError(), gl.INVALID_OPERATION, "Double shader attach must generate INVALID_OPERATION");

    gl.attachShader(prog, gl.createShader(gl.VERTEX_SHADER));
    notEqual(gl.getError(), gl.NO_ERROR, "Multiple shader objects of the same type may not be attached to a single program object");

    var prog2 = gl.createProgram();
    gl.attachShader(prog2, vShader);
    equal(gl.getError(), gl.NO_ERROR, "Shader attachment to more than one program will not generate errors");

    CleanProgram(gl, prog);
    CleanProgram(gl, prog2);
});

test("verify detachShader()", function () {
    var gl = GetCleanContext();

    var prog = gl.createProgram();
    var vShader = gl.createShader(gl.VERTEX_SHADER);

    gl.detachShader(undefined, undefined);
    equal(gl.getError(), gl.INVALID_VALUE, "detachShader() with undefined parameters must generate INVALID_VALUE");

    gl.detachShader(undefined, vShader);
    equal(gl.getError(), gl.INVALID_VALUE, "detachShader() with undefined program must generate INVALID_VALUE");

    gl.detachShader(prog, undefined);
    equal(gl.getError(), gl.INVALID_VALUE, "detachShader() with undefined shader must generate INVALID_VALUE");

    gl.detachShader(prog, vShader);
    equal(gl.getError(), gl.INVALID_OPERATION, "detachShader() must generate INVALID_OPERATION if shader is not attached to program");

    gl.attachShader(prog, vShader);
    gl.detachShader(prog, vShader);
    equal(gl.getError(), gl.NO_ERROR, "detachShader() generates errors");

    gl.attachShader(prog, vShader);
    var fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.attachShader(prog, fShader);

    gl.deleteShader(vShader);
    gl.detachShader(prog, vShader);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call detachShader() with deleted shader");

    gl.detachShader(prog, fShader);
    gl.deleteShader(fShader);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call deleteShader() after detach shader");

    CleanProgram(gl, prog);
});

test("verify getAttachedShaders() && getProgramParameter(ATTACHED_SHADERS)", function () {
    var gl = GetCleanContext();

    var prog = gl.createProgram();
    strictEqual(gl.getAttachedShaders(prog).length, 0, "getAttachedShaders().length == 0");
    strictEqual(gl.getProgramParameter(prog, gl.ATTACHED_SHADERS), 0, "getProgramParameter(ATTACHED_SHADERS) == 0");

    var vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.attachShader(prog, vShader);
    strictEqual(gl.getAttachedShaders(prog).length, 1, "getAttachedShaders().length == 1 after attach vertex shader");
    strictEqual(gl.getAttachedShaders(prog)[0], vShader, "getAttachedShaders()[0] == vShader after attach vertex shader");
    strictEqual(gl.getProgramParameter(prog, gl.ATTACHED_SHADERS), 1, "getProgramParameter(ATTACHED_SHADERS) == 1 after attach vertex shader");

    var fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.attachShader(prog, fShader);
    strictEqual(gl.getAttachedShaders(prog).length, 2, "getAttachedShaders().length == 2 after attach fragment shader");
    strictEqual(gl.getAttachedShaders(prog)[1], fShader, "getAttachedShaders()[1] == fShader after attach vertex shader");
    strictEqual(gl.getProgramParameter(prog, gl.ATTACHED_SHADERS), 2, "getProgramParameter(ATTACHED_SHADERS)== 2 after attach fragment shader");

    gl.attachShader(prog, fShader);
    strictEqual(gl.getAttachedShaders(prog).length, 2, "getAttachedShaders().length == 2 after double attach fragment shader");
    strictEqual(gl.getAttachedShaders(prog)[2], undefined, "getAttachedShaders()[2] == undefined after attach vertex shader");
    strictEqual(gl.getProgramParameter(prog, gl.ATTACHED_SHADERS), 2, "getProgramParameter(ATTACHED_SHADERS) == 2 after double attach fragment shader");

    gl.detachShader(prog, vShader);
    gl.detachShader(prog, vShader);
    strictEqual(gl.getAttachedShaders(prog).length, 1, "getAttachedShaders().length == 1  after double detach vertex shader");
    strictEqual(gl.getAttachedShaders(prog)[0], fShader, "getAttachedShaders()[0] == fShader double detach vertex shader");
    strictEqual(gl.getProgramParameter(prog, gl.ATTACHED_SHADERS), 1, "getProgramParameter(ATTACHED_SHADERS) == 1  after double detach vertex shader");

    gl.detachShader(prog, fShader);
    strictEqual(gl.getAttachedShaders(prog).length, 0, "getAttachedShaders().length == 0 after detach fragment shader");
    strictEqual(gl.getAttachedShaders(prog)[0], undefined, "getAttachedShaders()[0] == undefined after detach fragment shader");
    strictEqual(gl.getProgramParameter(prog, gl.ATTACHED_SHADERS), 0, "getProgramParameter(ATTACHED_SHADERS) == 0 after detach fragment shader");

    for (var i = 0; i < 10; i++) {
        gl.attachShader(prog, gl.createShader(gl.VERTEX_SHADER));
    }

    strictEqual(gl.getAttachedShaders(prog).length, 1, "getAttachedShaders().length == 1 after attach multiple shader of the same type");
    strictEqual(gl.getProgramParameter(prog, gl.ATTACHED_SHADERS), 1, "getProgramParameter(ATTACHED_SHADERS) == 1 after attach multiple shader of the same type");

    gl.deleteShader(vShader);
    CleanProgram(gl, prog);
});

test("verify linkProgram()", function () {
    var gl = GetCleanContext();

    gl.linkProgram(null);
    equal(gl.getError(), gl.INVALID_VALUE, "linkProgram() with null parameters must generate INVALID_VALUE");
    gl.linkProgram(undefined);
    equal(gl.getError(), gl.INVALID_VALUE, "linkProgram() with undefined parameters must generate INVALID_VALUE");

    var prog = CreateProgramNoLinking(gl);
    notStrictEqual(gl.getProgramParameter(prog, gl.LINK_STATUS), true, "getProgramParameter(LINK_STATUS) != true without linkng");

    gl.linkProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "linkProgram() generates errors");
    strictEqual(gl.getProgramParameter(prog, gl.LINK_STATUS), true, "getProgramParameter(LINK_STATUS) == true after successfull linkProgram()");

    CleanProgram(gl, prog);
});

test("verify linkProgram() [only one shader attached]", function () {
    var gl = GetCleanContext();

    var prog = gl.createProgram();
    var shader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(shader, GetSimpleVertexSrc());
    gl.attachShader(prog, shader);
    gl.compileShader(shader);

    gl.linkProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call linkProgram() with fragment shader not attach to program")
    notStrictEqual(gl.getProgramParameter(prog, gl.LINK_STATUS), true, "getProgramParameter(LINK_STATUS) != true with fragment shader not attach to program");

    CleanProgram(gl, prog);

    prog = gl.createProgram();
    shader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(shader, GetSimpleFragmentSrc());
    gl.attachShader(prog, shader);
    gl.compileShader(shader);

    gl.linkProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call linkProgram() with vertex shader not attach to program")
    notStrictEqual(gl.getProgramParameter(prog, gl.LINK_STATUS), true, "getProgramParameter(LINK_STATUS) != true with vertex shader not attach to program");

    CleanProgram(gl, prog);
});

test("verify linkProgram() [linking errors]", function () {
    var gl = GetCleanContext();

    var vShaderSrc =
        "attribute vec3 aVertexPosition;" +
        "uniform mat4 uMVMatrix;" +
        "uniform vec4 uOffset;" +
        "uniform mat4 uPMatrix;";

    var prog = CreateProgramNoLinkingWithVertexSrc(gl, vShaderSrc);

    gl.linkProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call linkProgram() with main function is missing for the vertex shader")
    strictEqual(gl.getProgramParameter(prog, gl.LINK_STATUS), false, "getProgramParameter(LINK_STATUS) != true with main function is missing for the vertex shader");
    // (2) см.ниже
    ok(gl.getProgramInfoLog(prog).length > 0, "getProgramInfoLog() is not empty after call linkProgram() with main function is missing for the vertex shader");

    CleanProgram(gl, prog);

    vShaderSrc =
        "vec4 GetPosition(void);" +
        "void main(void) {" +
        "   gl_Position = GetPosition();" +
        "}";

    prog = CreateProgramNoLinkingWithVertexSrc(gl, vShaderSrc);

    gl.linkProgram(prog);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call linkProgram() with unresolved function")
    strictEqual(gl.getProgramParameter(prog, gl.LINK_STATUS), false, "getProgramParameter(LINK_STATUS) != true with unresolved function");
    // (2) см.ниже
    ok(gl.getProgramInfoLog(prog).length > 0, "getProgramInfoLog() is not empty after call linkProgram() with unresolved function");

    CleanProgram(gl, prog);
});

test("verify getUniformLocation()", function () {
    var gl = GetCleanContext();

    gl.getUniformLocation(null, "uMat4");
    equal(gl.getError(), gl.INVALID_VALUE, "getUniformLocation() with null program must generate INVALID_VALUE");

    gl.getUniformLocation(undefined, "uMat4");
    equal(gl.getError(), gl.INVALID_VALUE, "getUniformLocation() with undefined program must generate INVALID_VALUE");

    var prog = CreateProgramNoLinkingWithShadersSrc(gl, UniformForTest.vertexShaderSrc, UniformForTest.fragmentShaderSrc);

    gl.getUniformLocation(prog, "uMat4");
    equal(gl.getError(), gl.INVALID_OPERATION, "getUniformLocation() with no linking program must generate INVALID_OPERATION");

    gl.linkProgram(prog);

    //8)
    gl.getUniformLocation(prog, "юниформ");
    equal(gl.getError(), gl.INVALID_VALUE, "getUniformLocation() must generate INVALID_VALUE with name containing national symbols");
    
    var loc = gl.getUniformLocation(prog, "uMat4");
    equal(gl.getError(), gl.NO_ERROR, "getUniformLocation() generates no errors");
    ok(loc instanceof WebGLUniformLocation, "getUniformLocation() returned value instanceof WebGLUniformLocation");

    var acceptableUniforms = UniformForTest.GetAcceptableUniforms(gl);
    for (var i = 0, l = acceptableUniforms.length; i < l; i++) {
        ok(gl.getUniformLocation(prog, acceptableUniforms[i].name) !== null, "getUniformLocation() != null with name [" + acceptableUniforms[i].name + "]");
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getUniformLocation() with parameter " + acceptableUniforms[i].name)
    }

    var unacceptableNames =
        [
            { name: "light", desc: "name of struct" },
            { name: "lightProp.light", desc: "name of struct of struct" },
            { name: "  uBVec4 ", desc: "name contained white spaces" },
            { name: "gl_Position", desc: "name started with the prefix 'gl_'" },
            { name: "uVec4.a", desc: "name of vector subcomponent" },
            { name: "uMat4[0][1][2][3]", desc: "name of matrix subcomponent" },
            { name: "unknownName", desc: "unknown name" }
        ];

    for (var i = 0, l = unacceptableNames.length; i < l; i++) {
        ok(gl.getUniformLocation(prog, unacceptableNames[i].name) === null, "getUniformLocation() == null with parameter " + unacceptableNames[i].desc);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getUniformLocation() with parameter " + unacceptableNames[i].desc)
    }

    var uLoc = gl.getUniformLocation(prog, "uMat4");
    ok(gl.getError() == gl.NO_ERROR && uLoc !== null, "getError() == NO_ERROR after call getUniformLocation()");
    ok(uLoc !== null, "getUniformLocation(uMat4) != null");
    gl.linkProgram(prog);
    var uLoc2Link = gl.getUniformLocation(prog, "uMat4");
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getUniformLocation() with relinking")
    ok(uLoc !== uLoc2Link, "getUniformLocation() return different location for the same variable after relinking");

    CleanProgram(gl, prog);
});

test("verify getActiveUniform()", function () {
    var gl = GetCleanContext();

    gl.getActiveUniform(null, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "getActiveUniform() with null program must generate INVALID_VALUE");

    gl.getActiveUniform(undefined, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "getActiveUniform() with undefined program must generate INVALID_VALUE");

    var prog = CreateProgramNoLinkingWithShadersSrc(gl, UniformForTest.vertexShaderSrc, UniformForTest.fragmentShaderSrc);

    gl.getActiveUniform(prog, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "getActiveUniform() must generate INVALID_VALUE with no linking program (no active uniform)");

    gl.linkProgram(prog);

    gl.getActiveUniform(prog, 100500);
    equal(gl.getError(), gl.INVALID_VALUE, "getActiveUniform() must generate INVALID_VALUE if index >= number of active uniform");

    var activeUniformCount = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    var infoArr = [];
    for (var i = 0; i < activeUniformCount; i++) {
        infoArr.push(gl.getActiveUniform(prog, i));
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getActiveUniform() on " + i + " uniform varible while collecting uniform info");
        VerifyWebGLActiveInfo(gl, infoArr[i], "getActiveUniform([" + i + "])");
    }

    var acceptableUniforms = UniformForTest.GetAcceptableUniforms(gl);
    for (var i = 0, l = acceptableUniforms.length; i < l; i++) {
        var curAcceptable = acceptableUniforms[i];
        var found = false;
        var info = null;
        for (var j = 0, count = infoArr.length; j < count; j++) {
            if (infoArr[j].name == curAcceptable.name) {
                info = infoArr[j];
                found = true;
                break;
            }
        }

        ok(found, "Uniform varible [" + curAcceptable.name + "] is found");
        var validInfo = info !== null && info !== undefined;
        ok(validInfo, "Info is not empty for varible [" + curAcceptable.name + "]");
        if (!(found && validInfo))
            continue;

        strictEqual(info.type, curAcceptable.type, "Check type for varible [" + curAcceptable.name + "]");
        strictEqual(info.size, curAcceptable.size, "Check size for varible [" + curAcceptable.name + "]");
    }

    var unacceptableUniforms =
        [
            "light",
            "lightProp",
            "aVertexPosition",
            "LightProp.position",
            "Light"
        ];

    for (var i = 0, l = unacceptableUniforms.length; i < l; i++) {
        var found = false;
        for (var j = 0; j < activeUniformCount; j++) {
            if (infoArr[j].name == unacceptableUniforms[i]) {
                found = true;
                break;
            }
        }
        ok(!found, "Unacceptable uniform varibe [" + unacceptableUniforms[i] + "] not found");
    }

    CleanProgram(gl, prog);

    gl.getActiveUniform(prog, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "getActiveUniform() with deleted program must generate INVALID_VALUE");
});

test("verify getUniform()", function () {
    var gl = GetCleanContext();

    gl.getUniform(null, null);
    equal(gl.getError(), gl.INVALID_VALUE, "getUniform() with null program must generate INVALID_VALUE");

    gl.getUniform(undefined, null);
    equal(gl.getError(), gl.INVALID_VALUE, "getUniform() with undefined program must generate INVALID_VALUE");

    var prog = CreateProgramWithShadersSrc(gl, UniformForTest.vertexShaderSrc, UniformForTest.fragmentShaderSrc);

    gl.getUniform(prog, null);
    // (4) см.ниже
    equal(gl.getError(), gl.INVALID_OPERATION, "getUniform() with null location must generate INVALID_OPERATION");

    gl.getUniform(prog, undefined);
    equal(gl.getError(), gl.INVALID_OPERATION, "getUniform() with undefined location must generate INVALID_OPERATION");

    var loc = gl.getUniformLocation(prog, "uInt");
    gl.getUniform(prog, loc);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.getUniform(prog, loc);
    equal(gl.getError(), gl.INVALID_OPERATION, "getUniform() must generates INVALID_OPERATION after double linking");

    var uniforms = UniformForTest.GetAcceptableUniforms(gl);
    for (var i = 0, l = uniforms.length; i < l; i++) {
        var uLoc = gl.getUniformLocation(prog, uniforms[i].name);
        notStrictEqual(uLoc, null, "getUniformLocation() != null for known variable [" + uniforms[i].name + "]");
        var uVar = gl.getUniform(prog, uLoc);
        equal(gl.getError(), gl.NO_ERROR, "getUniform() must not generate errors with known variable [" + uniforms[i].name + "]");
        ok(uLoc !== null && CheckType(gl, uniforms[i].type, uVar), "Check type for variable [" + uniforms[i].name + "]. Must be [" + GLTypeToReadableStr(gl, uniforms[i].type) + "]");
    }

    CleanProgram(gl, prog);
});

test("verify set uniform", function () {
    var gl = GetCleanContext();

    gl.uniform4f(null, 1, 2, 3, 4);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform4f() with null location");
    gl.uniform4f(undefined, 1, 2, 3, 4);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform4f() with undefined location");

    var prog = CreateProgramWithShadersSrc(gl, UniformForTest.vertexShaderSrc, UniformForTest.fragmentShaderSrc);

    var uLoc = gl.getUniformLocation(prog, "uVec4");
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getUniformLocation()");
    gl.uniform4f(uLoc, 0, 0, 0, 0);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform4f()");

    gl.linkProgram(prog);
    gl.useProgram(prog);

    gl.uniform4f(uLoc, 1, 2, 3, 4);
    equal(gl.getError(), gl.INVALID_OPERATION, "uniform4f() must generate INVALID_OPERATION after double linking");

    uLoc = gl.getUniformLocation(prog, "uVec4");
    var val = gl.getUniform(prog, uLoc);
    ok(val[0] != 1 && val[1] != 2 && val[2] != 3 && val[3] != 4, "uniform4f() does not set value after INVALID_OPERATION")
    ok(val[0] == 0 && val[1] == 0 && val[2] == 0 && val[3] == 0, "Value of variable will not be changed after INVALID_OPERATION")

    uLoc = gl.getUniformLocation(prog, "unknownName");
    gl.uniform4f(uLoc, 4, 3, 2, 1);
    equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call uniform4f() with unknown name [getUniformLocation() == null]");

    var uniforms = UniformForTest.GetAcceptableUniforms(gl);
    for (var i = 0, l = uniforms.length; i < l; i++) {
        var uLoc = gl.getUniformLocation(prog, uniforms[i].name);
        ok(uLoc !== null, "getUniformLocation() != null for variable [" + uniforms[i].name + "]");
        uniforms[i].Check(gl, prog, uLoc);
    }

    CleanProgram(gl, prog);
});


test("verify uniform arrays", function () {
    var gl = GetCleanContext();

    var types = UniformArraysForTest.GetCheckTypes(gl);
    for (var i = 0; i < types.length; ++i) {
        var curType = types[i];

        var vertexShader = UniformArraysForTest.vertexShaderSrc;
        vertexShader = vertexShader.replace(/##varName/g, curType.varName).
                       replace(/##type/g, curType.typeName).
                       replace(/##length/g, curType.arrayLength).
                       replace(/##elemAccess/g, curType.elemAccess);

        var prog = CreateProgramWithVertexSrc(gl, vertexShader);
        if (!prog)
            continue;

        var activeUniformCount = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
        equal(activeUniformCount, 1, "Only one active uniform [uniform array]");
        var info = gl.getActiveUniform(prog, 0);
        strictEqual(info.name, curType.varName + "[0]", "Check uniform array name [must be appended with '[0]']");
        strictEqual(info.size, curType.arrayLength, "Check uniform array size [== array length]");
        strictEqual(info.type, curType.type, "Check uniform array type [must be " + GLTypeToStr(gl, curType.type) + "]");

        curType.checkFunc(gl, prog);

        CleanProgram(gl, prog);
    }
});

test("verify getAttribLocation()", function () {
    var gl = GetCleanContext();

    gl.getAttribLocation(null, "aMat4");
    equal(gl.getError(), gl.INVALID_OPERATION, "getAttribLocation() with null program must generate INVALID_OPERATION");

    gl.getAttribLocation(undefined, "aMat4");
    equal(gl.getError(), gl.INVALID_OPERATION, "getAttribLocation() with undefined program must generate INVALID_OPERATION");

    var prog = CreateProgramNoLinkingWithVertexSrc(gl, AttribsForTest.shaderSrc);

    gl.getAttribLocation(prog, "aMat4");
    equal(gl.getError(), gl.INVALID_OPERATION, "getAttribLocation() with no linking program must generate INVALID_OPERATION");

    gl.linkProgram(prog);

    gl.getAttribLocation(prog, "аттрибут");
    equal(gl.getError(), gl.INVALID_VALUE, "getAttribLocation() must generate INVALID_VALUE with name containing national symbols");

    var acceptableAttribs = AttribsForTest.GetAcceptableAttirbs(gl);
    for (var i = 0, l = acceptableAttribs.length; i < l; i++) {
        notStrictEqual(gl.getAttribLocation(prog, acceptableAttribs[i].name), -1, "getAttribLocation() != -1 with name [" + acceptableAttribs[i].name + "]");
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getAttribLocation() with parameter " + acceptableAttribs[i].name)
    }

    var unacceptableNames =
        [
            { name: "  aVec4 ", desc: "name contained white spaces" },
            { name: "gl_Position", desc: "name started with the prefix 'gl_'" },
            { name: "aVec4.a", desc: "name of vector subcomponent" },
            { name: "aMat4[0][1][2][3]", desc: "name of matrix subcomponent" },
            { name: "invalidName", desc: "invalid name" }
        ];

    for (var i = 0, l = unacceptableNames.length; i < l; i++) {
        strictEqual(gl.getAttribLocation(prog, unacceptableNames[i].name), -1, "getAttribLocation() == -1 with parameter " + unacceptableNames[i].desc);
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getAttribLocation() with parameter " + unacceptableNames[i].desc)
    }

    CleanProgram(gl, prog);
});

test("verify getActiveAttrib()", function () {
    var gl = GetCleanContext();

    gl.getActiveAttrib(null, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "getActiveAttrib() with null program must generate INVALID_VALUE");

    gl.getActiveAttrib(undefined, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "getActiveAttrib() with undefined program must generate INVALID_VALUE");

    var prog = CreateProgramWithVertexSrc(gl, AttribsForTest.shaderSrc);

    gl.getActiveAttrib(prog, 100500);
    equal(gl.getError(), gl.INVALID_VALUE, "getActiveAttrib() must generate INVALID_VALUE if index >= number of active attributes");

    var activeAttribsCount = gl.getProgramParameter(prog, gl.ACTIVE_ATTRIBUTES);
    var infoArr = [];
    for (var i = 0; i < activeAttribsCount; i++) {
        infoArr.push(gl.getActiveAttrib(prog, i));
        equal(gl.getError(), gl.NO_ERROR, "getError() == NO_ERROR after call getActiveAttrib() on " + i + " attribute varible while collecting uniform info");
        VerifyWebGLActiveInfo(gl, infoArr[i], "getActiveAttrib([" + i + "])");
    }

    var acceptableAttributes = AttribsForTest.GetAcceptableAttirbs(gl);
    for (var i = 0, l = acceptableAttributes.length; i < l; i++) {
        var curAcceptable = acceptableAttributes[i];
        var found = false;
        var info = null;
        for (var j = 0, count = infoArr.length; j < count; j++) {
            if (infoArr[j].name == curAcceptable.name) {
                info = infoArr[j];
                found = true;
                break;
            }
        }

        ok(found, "Attribute var [" + curAcceptable.name + "] is found");
        var validInfo = info !== null && info !== undefined;
        ok(validInfo, "Info is not empty for varible [" + curAcceptable.name + "]");
        if (!(found && validInfo))
            continue;

        strictEqual(info.type, curAcceptable.type, "Check type for varible [" + curAcceptable.name + "]");
        strictEqual(info.size, curAcceptable.size, "Check size for varible [" + curAcceptable.name + "]");
    }

    CleanProgram(gl, prog);

    gl.getActiveAttrib(prog, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "getActiveAttrib() with deleted program must generate INVALID_VALUE");
});


test("verify bindAttribLocation()", function () {
    var gl = GetCleanContext();

    gl.bindAttribLocation(null, 0, "some_attrib_name");
    equal(gl.getError(), gl.INVALID_VALUE, "bindAttribLocation() with null program must generate INVALID_VALUE");
    gl.bindAttribLocation(undefined, 0, "some_attrib_name");
    equal(gl.getError(), gl.INVALID_VALUE, "bindAttribLocation() with undefined program must generate INVALID_VALUE");

    var prog = CreateProgramNoLinkingWithVertexSrc(gl, AttribsForTest.shaderSrc);

    gl.bindAttribLocation(prog, 0, "имя_аттрибута");
    equal(gl.getError(), gl.INVALID_VALUE, "bindAttribLocation() must generate INVALID_VALUE if name contains non-ASCII symbols");

    var maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    gl.bindAttribLocation(prog, maxVertexAttribs, "some_attrib_name");
    equal(gl.getError(), gl.INVALID_VALUE, "bindAttribLocation() must generate INVALID_VALUE if index >= MAX_VERTEX_ATTRIBS");

    gl.bindAttribLocation(prog, 0, "gl_attrib_name");
    equal(gl.getError(), gl.INVALID_OPERATION, "bindAttribLocation() must generate INVALID_OPERATION  if name starts with the reserved prefix 'gl_'");

    gl.bindAttribLocation(prog, 0, "gl_TexCoord0");
    equal(gl.getError(), gl.INVALID_OPERATION, "bindAttribLocation() must generate INVALID_OPERATION with reserved name [prefix 'gl_']");

    gl.linkProgram(prog);
    
    var attrName = AttribsForTest.GetAcceptableAttirbs(gl)[0].name;
    var attrLocation = gl.getAttribLocation(prog, attrName); 
    gl.bindAttribLocation(prog, 5, attrName);
    equal(gl.getError(), gl.NO_ERROR, "bindAttribLocation() generate no errors");
    var newLoc = gl.getAttribLocation(prog, attrName);
    equal(newLoc, attrLocation, "bindAttribLocation() wont take effect before linking program");
    gl.linkProgram(prog);
    newLoc = gl.getAttribLocation(prog, attrName);
    notEqual(newLoc, attrLocation, "bindAttribLocation() changed attribute location after linking program");

    gl.bindAttribLocation(prog, 5, "unknown_attrib");
    equal(gl.getError(), gl.NO_ERROR, "bindAttribLocation() with attribute name not defined in shader generates no errors");
    gl.linkProgram(prog);
    var info = gl.getActiveAttrib(prog, 5);
    ok(info === null || info.name != "unknown_attrib", "bindAttribLocation() with attribute name not defined in shader does not take effect after relinking");

    CleanProgram(gl, prog);

    gl.bindAttribLocation(prog, 0, "some_attrib_name");
    equal(gl.getError(), gl.INVALID_VALUE, "bindAttribLocation() with deleted program must generate INVALID_VALUE");
});

test("verify getVertexAttrib()[without array]", function () {
    var gl = GetCleanContext();

    var prog = CreateProgramWithVertexSrc(gl, AttribsForTest.shaderSrc);

    var maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(MAX_VERTEX_ATTRIBS) must not generate errors");

    gl.getVertexAttrib(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.INVALID_VALUE, "getVertexAttrib() generate INVALID_VALUE if index >= MAX_VERTEX_ATTRIBS");

    gl.getVertexAttrib(0, -1);
    equal(gl.getError(), gl.INVALID_ENUM, "getVertexAttrib() must generate INVALID_ENUM with invalid pname");

    var pnames =
    [
        { 'value': gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING, 'name': "VERTEX_ATTRIB_ARRAY_BUFFER_BINDING", 'checkInitVal': function (val) { return val == null } }, //WebGLBuffer
        {'value': gl.VERTEX_ATTRIB_ARRAY_ENABLED, 'name': "VERTEX_ATTRIB_ARRAY_ENABLED", 'checkInitVal': function (val) { return val == false } }, //boolean
        {'value': gl.VERTEX_ATTRIB_ARRAY_SIZE, 'name': "VERTEX_ATTRIB_ARRAY_SIZE", 'checkInitVal': function (val) { return val == 4 } }, //long
        {'value': gl.VERTEX_ATTRIB_ARRAY_STRIDE, 'name': "VERTEX_ATTRIB_ARRAY_STRIDE", 'checkInitVal': function (val) { return val == 0 } }, //long
        {'value': gl.VERTEX_ATTRIB_ARRAY_TYPE, 'name': "VERTEX_ATTRIB_ARRAY_TYPE", 'checkInitVal': function (val) { return val == gl.FLOAT } }, //unsigned long
        {'value': gl.VERTEX_ATTRIB_ARRAY_NORMALIZED, 'name': "VERTEX_ATTRIB_ARRAY_NORMALIZED", 'checkInitVal': function (val) { return val == false } }, //boolean
        {'value': gl.CURRENT_VERTEX_ATTRIB, 'name': "CURRENT_VERTEX_ATTRIB", 'checkInitVal': function (val) { return val[0] == 0 && val[1] == 0 && val[2] == 0 && val[3] == 1 } } //Float32Array (with 4 elements)	
    ];

    for (var i = 0, l = pnames.length; i < l; ++i) {
        var val = gl.getVertexAttrib(0, pnames[i].value);
        equal(gl.getError(), gl.NO_ERROR, "getVertexAttrib() must not generate errors with pname=" + pnames[i].name);
        ok(pnames[i].checkInitVal(val), "Check init val returned getVertexAttrib(" + pnames[i].name + "). Returned: " + val);
    }

    CleanProgram(gl, prog);
});

test("verify vertexAttrib(...) parameters validation", function () {
    var gl = GetCleanContext();

    var maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    var prog = CreateProgramWithVertexSrc(gl, AttribsForTest.shaderSrc);

    var vertexAttribFuncs =
    [
        { 'desc': "vertexAttrib1f", 'run': function (gl, indx) { gl.vertexAttrib1f(indx, 0.0); } },
        { 'desc': "vertexAttrib1fv", 'run': function (gl, indx) { var ar = new Float32Array(1); gl.vertexAttrib1fv(indx, ar); } },
        { 'desc': "vertexAttrib1fv", 'run': function (gl, indx) { var ar = [0.0]; gl.vertexAttrib1fv(indx, ar); } },
        { 'desc': "vertexAttrib2f", 'run': function (gl, indx) { gl.vertexAttrib2f(indx, 0.0, 0.0); } },
        { 'desc': "vertexAttrib2fv", 'run': function (gl, indx) { var ar = new Float32Array(2); gl.vertexAttrib2fv(indx, ar); } },
        { 'desc': "vertexAttrib2fv", 'run': function (gl, indx) { var ar = [0.0, 0.0]; gl.vertexAttrib2fv(indx, ar); } },
        { 'desc': "vertexAttrib3f", 'run': function (gl, indx) { gl.vertexAttrib3f(indx, 0.0, 0.0, 0.0); } },
        { 'desc': "vertexAttrib3fv", 'run': function (gl, indx) { var ar = new Float32Array(3); gl.vertexAttrib3fv(indx, ar); } },
        { 'desc': "vertexAttrib3fv", 'run': function (gl, indx) { var ar = [0.0, 0.0, 0.0]; gl.vertexAttrib3fv(indx, ar); } },
        { 'desc': "vertexAttrib4f", 'run': function (gl, indx) { gl.vertexAttrib4f(indx, 0.0, 0.0, 0.0, 0.0); } },
        { 'desc': "vertexAttrib4fv", 'run': function (gl, indx) { var ar = new Float32Array(4); gl.vertexAttrib4fv(indx, ar); } },
        { 'desc': "vertexAttrib4fv", 'run': function (gl, indx) { var ar = [0.0, 0.0, 0.0, 0.0]; gl.vertexAttrib4fv(indx, ar); } }
    ];

    for (var i = 0, l = vertexAttribFuncs.length; i < l; ++i) {
        vertexAttribFuncs[i].run(gl, maxVertexAttribs);
        equal(gl.getError(), gl.INVALID_VALUE, vertexAttribFuncs[i].desc + " must generate INVALID_VALUE if index >= MAX_VERTEX_ATTRIBS");

        vertexAttribFuncs[i].run(gl, 0);
        equal(gl.getError(), gl.NO_ERROR, vertexAttribFuncs[i].desc + " must not generate errors");
    }

    CleanProgram(gl, prog);
});

test("verify set vertex attributes", function () {
    var gl = GetCleanContext();

    var prog = CreateProgramWithVertexSrc(gl, AttribsForTest.shaderSrc);

    var attribs = AttribsForTest.GetAcceptableAttirbs(gl);
    for (var i = 0, l = attribs.length; i < l; i++) {
        var index = gl.getAttribLocation(prog, attribs[i].name);
        notStrictEqual(index, -1, "getAttribLocation() != -1 for variable [" + attribs[i].name + "]");
        attribs[i].Check(gl, index);
    }

    CleanProgram(gl, prog);
});

test("verify enableVertexAttribArray() && disableVertexAttribArray()", function () {
    var gl = GetCleanContext();

    var maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    var prog = CreateProgramWithVertexSrc(gl, AttribsForTest.shaderSrc);

    gl.enableVertexAttribArray(maxVertexAttribs);
    equal(gl.getError(), gl.INVALID_VALUE, "enableVertexAttribArray() must generate INVALID_VALUE if index >= MAX_VERTEX_ATTRIBS");
    gl.disableVertexAttribArray(maxVertexAttribs);
    equal(gl.getError(), gl.INVALID_VALUE, "disableVertexAttribArray() must generate INVALID_VALUE if index >= MAX_VERTEX_ATTRIBS");

    gl.enableVertexAttribArray(0);
    equal(gl.getError(), gl.NO_ERROR, "enableVertexAttribArray() must not generate errors");
    gl.disableVertexAttribArray(0);
    equal(gl.getError(), gl.NO_ERROR, "disableVertexAttribArray() must not generate errors");

    CleanProgram(gl, prog);
});

test("verify vertexAttribPointer()", function () {
    var gl = GetCleanContext();

    var maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    var prog = CreateProgramWithVertexSrc(gl, AttribsForTest.shaderSrc);

    gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, 0, 0);
    equal(gl.getError(), gl.INVALID_OPERATION, "vertexAttribPointer() must generate INVALID_OPERATION If no WebGLBuffer is bound to the ARRAY_BUFFER");

    var buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STREAM_DRAW);

    gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, 256, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "vertexAttribPointer() must generate INVALID_VALUE If stride > 255");

    gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, -1, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "vertexAttribPointer() must generate INVALID_VALUE If stride < 0");

    gl.vertexAttribPointer(maxVertexAttribs, 4, gl.FLOAT, gl.FALSE, 0, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "vertexAttribPointer() must generate INVALID_VALUE If index >= MAX_VERTEX_ATTRIBS");

    gl.vertexAttribPointer(0, 16, gl.FLOAT, gl.FALSE, 0, 0);
    equal(gl.getError(), gl.INVALID_VALUE, "vertexAttribPointer() must generate INVALID_VALUE if size is not 1, 2, 3, or 4");

    gl.vertexAttribPointer(0, 4, -1, gl.FALSE, 0, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "vertexAttribPointer() must generate INVALID_ENUM if type is invalid value");

    gl.vertexAttribPointer(0, 4, gl.FIXED, gl.FALSE, 0, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "vertexAttribPointer() must generate INVALID_ENUM if type = FIXED [does not support in WebGL]");

    gl.vertexAttribPointer(0, 4, gl.INT, gl.FALSE, 0, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "vertexAttribPointer() must generate INVALID_ENUM if type = INT");

    gl.vertexAttribPointer(0, 4, gl.UNSIGNED_INT, gl.FALSE, 0, 0);
    equal(gl.getError(), gl.INVALID_ENUM, "vertexAttribPointer() must generate INVALID_ENUM if type = UNSIGNED_INT");

    gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, 3, 0);
    equal(gl.getError(), gl.INVALID_OPERATION, "vertexAttribPointer() must generate INVALID_OPERATION  if stride is not multiple of the size of the data type passed to the call");

    gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, 0, 9);
    equal(gl.getError(), gl.INVALID_OPERATION, "vertexAttribPointer() must generate INVALID_OPERATION  if offset is not multiple of the size of the data type passed to the call");

    gl.deleteBuffer(buff);
    CleanProgram(gl, prog);
});

test("verify getVertexAttribOffset()", function () {
    var gl = GetCleanContext();

    var maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    var prog = CreateProgramWithVertexSrc(gl, AttribsForTest.shaderSrc);

    gl.enableVertexAttribArray(0);

    var buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STREAM_DRAW);

    var offset = 4;
    gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, 0, offset);

    gl.getVertexAttribOffset(0, -1);
    equal(gl.getError(), gl.INVALID_ENUM, "getVertexAttribOffset() must generate INVALID_ENUM with invalid pname");

    gl.getVertexAttribOffset(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_POINTER);
    equal(gl.getError(), gl.INVALID_VALUE, "getVertexAttribOffset() must generate INVALID_VALUE if index >= MAX_VERTEX_ATTRIBS");

    var val = gl.getVertexAttribOffset(0, gl.VERTEX_ATTRIB_ARRAY_POINTER);
    equal(gl.getError(), gl.NO_ERROR, "getVertexAttribOffset() must not generate errors");
    strictEqual(val, offset, "Check value returned getVertexAttribOffset()");

    gl.deleteBuffer(buff);
    gl.disableVertexAttribArray(0);

    CleanProgram(gl, prog);
});

test("verify getVertexAttrib()[only array]", function () {
    var gl = GetCleanContext();

    var prog = CreateProgramWithVertexSrc(gl, AttribsForTest.shaderSrc);

    var params =
    [
        { 'size': 4, 'type': gl.FLOAT, 'normalized': false, 'stride': 0, 'offset': 0 },
        { 'size': 1, 'type': gl.FLOAT, 'normalized': false, 'stride': 0, 'offset': 0 },
        { 'size': 2, 'type': gl.FLOAT, 'normalized': false, 'stride': 0, 'offset': 0 },
        { 'size': 3, 'type': gl.FLOAT, 'normalized': false, 'stride': 0, 'offset': 0 },
        { 'size': 4, 'type': gl.BYTE, 'normalized': false, 'stride': 0, 'offset': 0 },
        { 'size': 4, 'type': gl.UNSIGNED_BYTE, 'normalized': false, 'stride': 0, 'offset': 0 },
        { 'size': 4, 'type': gl.SHORT, 'normalized': false, 'stride': 0, 'offset': 0 },
        { 'size': 4, 'type': gl.UNSIGNED_SHORT, 'normalized': false, 'stride': 0, 'offset': 0 },
        { 'size': 4, 'type': gl.FLOAT, 'normalized': true, 'stride': 0, 'offset': 0 },
        { 'size': 4, 'type': gl.FLOAT, 'normalized': false, 'stride': 4, 'offset': 0 },
        { 'size': 4, 'type': gl.FLOAT, 'normalized': false, 'stride': 0, 'offset': 8 }
    ];

    var attribs = AttribsForTest.GetAcceptableAttirbs(gl);
    for (var i = 0, l = attribs.length; i < l; i++) {
        var index = gl.getAttribLocation(prog, attribs[i].name);
        gl.enableVertexAttribArray(index);

        var buff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buff);

        for (var j = 0, lj = params.length; j < lj; ++j) {
            gl.vertexAttribPointer(index, params[j].size, params[j].type, params[j].normalized, params[j].stride, params[j].offset);

            var funcDesc = "vertexAttribPointer(indx: " + index + ", size: " + params[j].size + ", type: " + params[j].type + ", normalized: " + params[j].normalized + ", stride: " + params[j].stride + ", offset: " + params[j].offset + ")";
            var buffVal = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
            ok(buff === buffVal, "Check bounded buffer for attrib [" + attribs[i].name + "] after call " + funcDesc);

            var enabledVal = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_ENABLED);
            strictEqual(enabledVal, true, "Check getVertexAttrib(VERTEX_ATTRIB_ARRAY_ENABLED) for attrib [" + attribs[i].name + "]  after call " + funcDesc + ". Expected: true, returned: " + enabledVal);

            var sizeVal = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_SIZE);
            strictEqual(params[j].size, sizeVal, "Check getVertexAttrib(VERTEX_ATTRIB_ARRAY_SIZE) for attrib [" + attribs[i].name + "]  after call " + funcDesc + ". Expected: " + params[j].size + ", returned: " + sizeVal);

            var strideVal = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_STRIDE);
            strictEqual(params[j].stride, strideVal, "Check getVertexAttrib(VERTEX_ATTRIB_ARRAY_STRIDE) for attrib [" + attribs[i].name + "]  after call " + funcDesc + ". Expected: " + params[j].stride + ", returned: " + strideVal);

            var typeVal = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_TYPE);
            strictEqual(params[j].type, typeVal, "Check getVertexAttrib(VERTEX_ATTRIB_ARRAY_TYPE) for attrib [" + attribs[i].name + "]  after call " + funcDesc + ". Expected: " + params[j].type + ", returned: " + typeVal);

            var normVal = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_NORMALIZED);
            strictEqual(params[j].normalized, normVal, "Check getVertexAttrib(VERTEX_ATTRIB_ARRAY_NORMALIZED) for attrib [" + attribs[i].name + "]  after call " + funcDesc + ". Expected: " + params[j].normalized + ", returned: " + normVal);

            var val = gl.getVertexAttrib(index, gl.CURRENT_VERTEX_ATTRIB);
            ok(val[0] == 0 && val[1] == 0 && val[2] == 0 && val[3] == 1, "Check getVertexAttrib(CURRENT_VERTEX_ATTRIB) for attrib [" + attribs[i].name + "]  after call " + funcDesc + "");

            var offset = gl.getVertexAttribOffset(index, gl.VERTEX_ATTRIB_ARRAY_POINTER);
            strictEqual(params[j].offset, offset, "Check getVertexAttribOffset() for attrib [" + attribs[i].name + "]  after call " + funcDesc + ". Expected: " + params[j].offset + ", returned: " + offset);
        }

        gl.deleteBuffer(buff);
        gl.disableVertexAttribArray(index);
    }

    CleanProgram(gl, prog);
});

test("verify drawArrays()", function () {
    var gl = GetCleanContext();

    var prog = CreateProgramWithVertexSrc(gl, AttribsForTest.shaderSrc);

    var buff = gl.createBuffer();
    gl.enableVertexAttribArray(0);

    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() must generate INVALID_OPERATION if no buffer is bound to that attribute via bindBuffer and vertexAttribPointer");

    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() must generate INVALID_OPERATION if buffer not initialized via bufferData");

    var arr = new Uint8Array(64);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STREAM_DRAW);

    CheckDrawArraysParams(gl);
    CheckDrawArraysStencilOp(gl);

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.INVALID_FRAMEBUFFER_OPERATION, "drawArrays() must generate INVALID_FRAMEBUFFER_OPERATION if the currently bound framebuffer is not framebuffer complete");
    gl.deleteFramebuffer(fb);

    CleanProgram(gl, prog);

    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() must not generate errors if attribute is not consumed by the current program");

    gl.deleteBuffer(buff);
    gl.disableVertexAttribArray(0);
});

test("verify drawArrays() work", function () {
    var gl = GetCleanContext();

    var prog = CreateProgramWithShadersSrc(gl, ForDrawTests.vShader, ForDrawTests.fShader);

    var buffs = [];
    for (var i = 0; i < ForDrawArraysTest.buffDescs.length; ++i)
    {
        var buff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buff);
        equal(gl.getError(), gl.NO_ERROR, "bindBuffer() generates no errors for buffer of " + ForDrawArraysTest.buffDescs[i].desc);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ForDrawArraysTest.buffDescs[i].data), gl.STATIC_DRAW);
        equal(gl.getError(), gl.NO_ERROR, "bufferData() generates no errors for buffer of " + ForDrawArraysTest.buffDescs[i].desc);

        var vLoc = gl.getAttribLocation(prog, ForDrawArraysTest.buffDescs[i].attrName);
        equal(gl.getError(), gl.NO_ERROR, "getAttribLocation() generates no errors for buffer of " + ForDrawArraysTest.buffDescs[i].desc);
        gl.vertexAttribPointer(vLoc, ForDrawArraysTest.buffDescs[i].size, gl.FLOAT, false, 0, 0);
        equal(gl.getError(), gl.NO_ERROR, "vertexAttribPointer() generates no errors for buffer of " + ForDrawArraysTest.buffDescs[i].desc);
        gl.enableVertexAttribArray(vLoc);
        equal(gl.getError(), gl.NO_ERROR, "enableVertexAttribArray() generates no errors for buffer of " + ForDrawArraysTest.buffDescs[i].desc);

        buffs.push(buff);
    }

    var vertexCount = ForDrawArraysTest.buffDescs[0].data.length / ForDrawArraysTest.buffDescs[0].size;

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors with count = vertex count");

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount / 2);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors with count = half vertex count");

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount * 2);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() generates INVALID_OPERATION with count > vertex count");

    gl.drawArrays(gl.TRIANGLES, vertexCount, 1);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() generates INVALID_OPERATION with offset + count > vertex count");

    gl.drawArrays(gl.TRIANGLES, 1, vertexCount);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() generates INVALID_OPERATION with offset + count > vertex count");

    gl.drawArrays(gl.TRIANGLES, 1, vertexCount - 1);
    equal(gl.getError(), gl.NO_ERROR, "drawArrays() generates no errors");

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(gl.getAttribLocation(prog, ForDrawArraysTest.buffDescs[0].attrName));

    gl.drawArrays(gl.TRIANGLES, 0, 1);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawArrays() generates INVALID_OPERATION with zero-length array");

    for (var i = 0; i < ForDrawArraysTest.buffDescs.length; ++i) {
        gl.disableVertexAttribArray(gl.getAttribLocation(prog, ForDrawArraysTest.buffDescs[i].attrName));
    }
    
    for(var i = 0; i < buffs.length; ++i) {
        gl.deleteBuffer(buffs[i]);
    }

    CleanProgram(gl, prog);
});

test("verify drawElements()", function () {
    var gl = GetCleanContext();

    var prog = CreateProgramWithVertexSrc(gl, AttribsForTest.shaderSrc);

    var buff = gl.createBuffer();
    gl.enableVertexAttribArray(0);

    gl.drawElements(gl.TRIANGLES, 1, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawElements() must generate INVALID_OPERATION if no buffer is bound to that attribute via bindBuffer and vertexAttribPointer");

    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, 0, 0);
    var arr = new Uint8Array(64);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STREAM_DRAW);

    gl.drawElements(gl.TRIANGLES, 1, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.INVALID_OPERATION, "drawElements() must generate INVALID_OPERATION if no buffer is bound to ELEMENT_ARRAY_BUFFER");

    var elemBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arr, gl.STREAM_DRAW);

    gl.drawElements(gl.TRIANGLES, 1, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.NO_ERROR, "drawElements() must not generate errors");

    CheckDrawElementsParams(gl);
    CheckDrawElementsStencilOp(gl);

    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.drawElements(gl.TRIANGLES, 1, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.INVALID_FRAMEBUFFER_OPERATION, "drawElements() must generate INVALID_FRAMEBUFFER_OPERATION if the currently bound framebuffer is not framebuffer complete");
    gl.deleteFramebuffer(fb);

    CleanProgram(gl, prog);

    gl.drawElements(gl.TRIANGLES, 1, gl.UNSIGNED_BYTE, 0);
    equal(gl.getError(), gl.NO_ERROR, "drawElements() must not generate errors if attribute is not consumed by the current program");

    gl.deleteBuffer(elemBuff);
    gl.deleteBuffer(buff);
    gl.disableVertexAttribArray(0);
});

test("verify drawElements() work", function () {
    var gl = GetCleanContext();

    var prog = CreateProgramWithShadersSrc(gl, ForDrawTests.vShader, ForDrawTests.fShader);

    var buffs = [];
    for (var i = 0; i < ForDrawElementsTest.buffDescs.length; ++i) {
        var buff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buff);
        equal(gl.getError(), gl.NO_ERROR, "bindBuffer() generates no errors for buffer of " + ForDrawElementsTest.buffDescs[i].desc);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ForDrawElementsTest.buffDescs[i].data), gl.STATIC_DRAW);
        equal(gl.getError(), gl.NO_ERROR, "bufferData() generates no errors for buffer of " + ForDrawElementsTest.buffDescs[i].desc);

        var vLoc = gl.getAttribLocation(prog, ForDrawElementsTest.buffDescs[i].attrName);
        equal(gl.getError(), gl.NO_ERROR, "getAttribLocation() generates no errors for buffer of " + ForDrawElementsTest.buffDescs[i].desc);
        gl.vertexAttribPointer(vLoc, ForDrawElementsTest.buffDescs[i].size, gl.FLOAT, false, 0, 0);
        equal(gl.getError(), gl.NO_ERROR, "vertexAttribPointer() generates no errors for buffer of " + ForDrawElementsTest.buffDescs[i].desc);
        gl.enableVertexAttribArray(vLoc);
        equal(gl.getError(), gl.NO_ERROR, "enableVertexAttribArray() generates no errors for buffer of " + ForDrawElementsTest.buffDescs[i].desc);

        buffs.push(buff);
    }

    var ebuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebuff);
    equal(gl.getError(), gl.NO_ERROR, "bindBuffer(ELEMENT_ARRAY_BUFFER) generates no errors");

    var indicesCount = ForDrawElementsTest.indices.length;
    var vertexCount = ForDrawElementsTest.buffDescs[0].data.length / ForDrawElementsTest.buffDescs[0].size;

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(ForDrawElementsTest.invalidIndices), gl.STATIC_DRAW);
    equal(gl.getError(), gl.NO_ERROR, "bufferData(ELEMENT_ARRAY_BUFFER) generates no error with invalid indices");

    gl.drawElements(gl.TRIANGLES, indicesCount, gl.UNSIGNED_BYTE, 0);
    notEqual(gl.getError(), gl.NO_ERROR, "drawElements() generates error with invalid indices");

    var vals =
    [
        { desc: "Uint8Array", create: function(data) { return new Uint8Array(data); }, byteLength : 1, type: gl.UNSIGNED_BYTE },
        { desc: "Uint16Array", create: function(data) { return new Uint16Array(data); }, byteLength : 2, type: gl.UNSIGNED_SHORT }
    ];

    for (var i = 0; i < vals.length; ++i)
    {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vals[i].create(ForDrawElementsTest.indices), gl.STATIC_DRAW);
        equal(gl.getError(), gl.NO_ERROR, "bufferData(ELEMENT_ARRAY_BUFFER) generates no error [" + vals[i].desc + "]");

        gl.drawElements(gl.TRIANGLES, indicesCount, vals[i].type, 0);
        equal(gl.getError(), gl.NO_ERROR, "drawElements() generates no errors with valid indices [" + vals[i].desc + "]");

        gl.drawElements(gl.TRIANGLES, indicesCount / 2, vals[i].type, (indicesCount / 2) * vals[i].byteLength);
        equal(gl.getError(), gl.NO_ERROR, "drawElements() generates no errors with valid indices [" + vals[i].desc + "]");

        gl.drawElements(gl.TRIANGLES, indicesCount / 2, vals[i].type, indicesCount * vals[i].byteLength);
        equal(gl.getError(), gl.INVALID_OPERATION, "drawElements() generates INVALID_OPERATION if (offset * byteLength + count) is out of bounds [" + vals[i].desc + "]");
    }

    for (var i = 0; i < ForDrawElementsTest.buffDescs.length; ++i) {
        gl.disableVertexAttribArray(gl.getAttribLocation(prog, ForDrawElementsTest.buffDescs[i].attrName));
    }

    gl.deleteBuffer(ebuff);
    for (var i = 0; i < buffs.length; ++i) {
        gl.deleteBuffer(buffs[i]);
    }

    CleanProgram(gl, prog);
});

/*

2) getProgramInfoLog() - bug in chrome?
После неудачной линковки (unresolved functions, main function is missing...) хром ничего не записывает в лог.

4) getUniform() with null location [mozilla] in glGetUniform documentation:
GL_INVALID_OPERATION is generated if location does not correspond to a valid uniform variable 
location for the specified program object.

5) CheckType func [mozilla] - bug?
Проваливает все тесты с (uVar instanceof Float32Array/Int32Array), проходит только с Array.
5.13.10
any getUniform(WebGLProgram program, WebGLUniformLocation location) 
Return the uniform value at the passed location in the passed program. The type returned is dependent on the uniform type,
as shown in the following table:
vec2	Float32Array
ivec2	Int32Array
vec3	Float32Array
ivec3	Int32Array
vec4	Float32Array
ivec4	Int32Array
mat2	Float32Array
mat3	Float32Array
mat4	Float32Array

6) uniform(..)v
5.13.10 
If the array passed to any of the vector forms (those ending in v) has an invalid length, 
an INVALID_VALUE error will be generated. The length is invalid if it is too short for or 
is not an integer multiple of the assigned type.
В хроме ошибка не генерируется и в переменную устанавливается значение. 
В мозиле генерирруется INVALID_VALUE и значение не устанавливается.
Кто прав?


8) getAttribLocation() with name containing national symbols [mozilla]
6.18 Characters Outside the GLSL Source Character Set
If a string containing a character not in this set (ASCII) is passed to any of the shader-related entry points 
bindAttribLocation, getAttribLocation, getUniformLocation, or shaderSource, 
an INVALID_VALUE error will be generated.

*/