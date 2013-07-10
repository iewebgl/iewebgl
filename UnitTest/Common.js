
function isTypeOf(type, obj) {
    var className = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && className === type;
}

function isEqual(val1, val2) {
    return Math.abs(val1 - val2) < 0.001;
}

function isArraysEqual(val1, val2) {
    if (val1.length != val2.length) {
        return false;
    }
    for (var i = 0, l = val1.length; i < l; ++i) {
        if (!isEqual(val1[i], val2[i])) {
            return false;
        }
    }
    return true;
}

function IsValueNaN(val) {
//[ECMA-262] 15.1.2.4
//NOTE A reliable way for ECMAScript code to test if a value X is a NaN is an expression of the form X !== X. The 
//result will be true if and only if X is a NaN
    return val !== val;
}

function GetRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function GetAnyRandom() {
    return GetRandom(-5000, 5000);
}

function GetRandomArray(length) {
    var arr = [];
    for (var i = 0; i < length; i++) {
        arr.push(GetRandom(-5000, 5000));
    }
    return arr;
}

function GetRandomArrayWithRange(length, min, max) {
    var arr = [];
    for (var i = 0; i < length; i++) {
        arr.push(GetRandom(min, max));
    }
    return arr;
}

function GetBoolRandomArray(length) {
    var arr = [];
    for (var i = 0; i < length; i++) {
        arr.push(GetRandom(-5000, 5000) > 0);
    }
    return arr;
}

function GetIntRandomArray(length) {
    var arr = [];
    for (var i = 0; i < length; i++) {
        arr.push(GetRandom(-5000, 5000).toFixed());
    }
    return arr;
}

function GLErrorToStr(gl, error) {
    switch (error) {
        case gl.NO_ERROR: return "NO_ERROR";
        case gl.INVALID_ENUM: return "INVALID_ENUM";
        case gl.INVALID_VALUE: return "INVALID_VALUE";
        case gl.INVALID_OPERATION: return "INVALID_OPERATION";
        case gl.INVALID_FRAMEBUFFER_OPERATION: return "INVALID_FRAMEBUFFER_OPERATION";
        case gl.OUT_OF_MEMORY: return "OUT_OF_MEMORY";
    }
    return "unknown error";
}

function ArrayToStr(arr) {
    var str = "[";
    for (var i = 0, l = arr.length - 1; i < l; ++i) {
        str += arr[i] + ", ";
    }
    str += arr[arr.length - 1] + "]";
    return str;
}