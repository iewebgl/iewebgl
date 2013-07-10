
function RunUintDataConversionTest(arr, maxValue) {

    var values =
    [
       { 'desc': "int [155]", 'value': 155, "acceptValue": 155 },
       { 'desc': "double [155.645]", 'value': 155.645, "acceptValue": 155 },
       { 'desc': "negative int [-155]", 'value': -155, "acceptValue": (maxValue - 155) },
       { 'desc': "negative double [-155.645]", 'value': -155.645, "acceptValue": (maxValue - 155) },
       { 'desc': "int that's out of range [MaxValue + 1]", 'value': maxValue + 1, "acceptValue": 1 },
       { 'desc': "double that's out of range [MaxValue + 1.657]", 'value': maxValue + 1.657, "acceptValue": 1 },
       { 'desc': "hex value [0xF0]", 'value': 0xF0, "acceptValue": 0xF0 },
       { 'desc': "oct value [010]", 'value': 010, "acceptValue": 8 },
       { 'desc': "0", 'value': 0, "acceptValue": 0 },
       { 'desc': "-0", 'value': -0, "acceptValue": 0 },
       { 'desc': "+INF [1 / 0]", 'value': 1 / 0, "acceptValue": 0 },
       { 'desc': "-INF [-1 / 0]", 'value': -1 / 0, "acceptValue": 0 },
       { 'desc': "string with whitespace ['  -6   ']", 'value': "  -6   ", "acceptValue": (maxValue - 6) },
       { 'desc': "string with hex value ['0xF0']", 'value': "0xF0", "acceptValue": 0xF0 },
       { 'desc': "string with negative hex value ['-0x10']", 'value': "-0x10", "acceptValue": 0 },
       { 'desc': "string with pseudo-oct value ['010']", 'value': "010", "acceptValue": 10 },
       { 'desc': "string with exponent ['12345e-4']", 'value': "12345e-4", "acceptValue": 1 },
       { 'desc': "empty string", 'value': "", "acceptValue": 0 },
       { 'desc': "invalid string ['wasd']", 'value': "wasd", "acceptValue": 0 },
       { 'desc': "true boolean", 'value': true, "acceptValue": 1 },
       { 'desc': "false boolean", 'value': false, "acceptValue": 0 },
       { 'desc': "undefined", 'value': undefined, "acceptValue": 0 },
       { 'desc': "null", 'value': null, "acceptValue": 0 },
       { 'desc': "Number.NaN", 'value': Number.NaN, "acceptValue": 0 }
    ];

    for (var i = 0, l = values.length; i < l; i++) {
        arr[0] = values[i].value;
        strictEqual(arr[0], values[i].acceptValue, "Conversion from " + values[i].desc);
        arr[0] = -1;
    }
}

function RunIntDataConversionTest(arr, maxValue) {

    var values =
    [
       { 'desc': "int [15]", 'value': 15, "acceptValue": 15 },
       { 'desc': "double [15.645]", 'value': 15.645, "acceptValue": 15 },
       { 'desc': "negative int [-15]", 'value': -15, "acceptValue": -15 },
       { 'desc': "negative double [-15.645]", 'value': -15.645, "acceptValue": -15 },
       { 'desc': "int that's out of range [MaxValue + 1]", 'value': maxValue + 1, "acceptValue": 1 },
       { 'desc': "negative int that's out of range [-MaxValue - 1]", 'value': -maxValue - 1, "acceptValue": -1 },
       { 'desc': "double that's out of range [MaxValue + 1.657]", 'value': maxValue + 1.657, "acceptValue": 1 },
       { 'desc': "negative double that's out of range [-MaxValue - 1.657]", 'value': -maxValue - 1.657, "acceptValue": -1 },
       { 'desc': "hex value [0x10]", 'value': 0x10, "acceptValue": 0x10 },
       { 'desc': "oct value [010]", 'value': -010, "acceptValue": -8 },
       { 'desc': "0", 'value': 0, "acceptValue": 0 },
       { 'desc': "-0", 'value': -0, "acceptValue": 0 },
       { 'desc': "+INF [1 / 0]", 'value': 1 / 0, "acceptValue": 0 },
       { 'desc': "-INF [-1 / 0]", 'value': -1 / 0, "acceptValue": 0 },
       { 'desc': "string with whitespace ['  -6   ']", 'value': "  -6   ", "acceptValue": -6 },
       { 'desc': "string with hex value ['0x10']", 'value': "0x10", "acceptValue": 0x10 },
       { 'desc': "string with negative hex value ['-0x10']", 'value': "-0x10", "acceptValue": 0 },
       { 'desc': "string with pseudo-oct value ['010']", 'value': "010", "acceptValue": 10 },
       { 'desc': "string with exponent ['12345e-4']", 'value': "12345e-4", "acceptValue": 1 },
       { 'desc': "empty string", 'value': "", "acceptValue": 0 },
       { 'desc': "invalid string ['wasd']", 'value': "wasd", "acceptValue": 0 },
       { 'desc': "true boolean", 'value': true, "acceptValue": 1 },
       { 'desc': "false boolean", 'value': false, "acceptValue": 0 },
       { 'desc': "undefined", 'value': undefined, "acceptValue": 0 },
       { 'desc': "null", 'value': null, "acceptValue": 0 },
       { 'desc': "Number.NaN", 'value': Number.NaN, "acceptValue": 0 }
    ];

    for (var i = 0, l = values.length; i < l; i++) {
        arr[0] = values[i].value;
        strictEqual(arr[0], values[i].acceptValue, "Conversion from " + values[i].desc);
        arr[0] = -1;
    }
}

function RunFloatDataConversionTest(arr, maxValue) {

    var values =
    [
       { 'desc': "int [257]", 'value': 257, "acceptValue": 257, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "double [257.645]", 'value': 257.645, "acceptValue": 257.645, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "negative int [-257]", 'value': -257, "acceptValue": -257, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "negative double [-257.645]", 'value': -257.645, "acceptValue": -257.645, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "double that's out of range [MaxValue + 1.657]", 'value': maxValue + 1.657, "acceptValue": Number.POSITIVE_INFINITY, 'compFunc': function (val1, val2) { return val1 === val2; } },
       { 'desc': "negative double that's out of range [-MaxValue - 1.657]", 'value': -maxValue - 1.657, "acceptValue": Number.NEGATIVE_INFINITY, 'compFunc': function (val1, val2) { return val1 === val2; } },
       { 'desc': "hex value [0xF0]", 'value': 0xF0, "acceptValue": 0xF0, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "oct value [-010]", 'value': -010, "acceptValue": -8, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "0", 'value': 0, "acceptValue": 0, 'compFunc': function (val1, val2) { return val1 === val2; } },
       { 'desc': "-0", 'value': -0, "acceptValue": -0, 'compFunc': function (val1, val2) { return val1 === val2; } },
       { 'desc': "+INF [1 / 0]", 'value': 1 / 0, "acceptValue": Number.POSITIVE_INFINITY, 'compFunc': function (val1, val2) { return val1 === val2; } },
       { 'desc': "-INF [-1 / 0]", 'value': -1 / 0, "acceptValue": Number.NEGATIVE_INFINITY, 'compFunc': function (val1, val2) { return val1 === val2; } },
       { 'desc': "string ['0.25']", 'value': "0.25", "acceptValue": 0.25, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "string with whitespace ['  -6   ']", 'value': "  -6   ", "acceptValue": -6, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "string with hex value ['0xF0']", 'value': "0xF0", "acceptValue": 0xF0, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "string with negative hex value ['-0x10']", 'value': "-0x10", "acceptValue": Number.NaN, 'compFunc': function (val) { return IsValueNaN(val); } },
       { 'desc': "string with pseudo-oct value ['010']", 'value': "010", "acceptValue": 10, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "string with exponent ['12345e-4']", 'value': "12345e-4", "acceptValue": 1.2345, 'compFunc': function (val1, val2) { return isEqual(val1, val2); } },
       { 'desc': "empty string", 'value': "", "acceptValue": 0, 'compFunc': function (val1, val2) { return val1 === val2; } },
       { 'desc': "invalid string ['wasd']", 'value': "wasd", "acceptValue": Number.NaN, 'compFunc': function (val) { return IsValueNaN(val); } },
       { 'desc': "true boolean", 'value': true, "acceptValue": 1, 'compFunc': function (val1, val2) { return val1 === val2; } },
       { 'desc': "false boolean", 'value': false, "acceptValue": 0, 'compFunc': function (val1, val2) { return val1 === val2; } },
       { 'desc': "undefined", 'value': undefined, "acceptValue": Number.NaN, 'compFunc': function (val) { return IsValueNaN(val); } },
       { 'desc': "null", 'value': null, "acceptValue": 0, 'compFunc': function (val1, val2) { return val1 === val2; } },
       { 'desc': "Number.NaN", 'value': Number.NaN, "acceptValue": Number.NaN, 'compFunc': function (val) { return IsValueNaN(val); } }
    ];

    for (var i = 0, l = values.length; i < l; i++) {
        arr[0] = values[i].value;
        ok(values[i].compFunc(arr[0], values[i].acceptValue), "Conversion from " + values[i].desc + ". Expected [" + values[i].acceptValue + "], returned [" + arr[0] + "]");
        arr[0] = 0;
    }
}

var constuctorsTests = function (desc, createArrayFunc) {
   test("constructor " + desc.name + "(length) is available", function () {
        var arr = createArrayFunc.WithLength(10);
        ok(arr !== null && arr !== undefined, "Constructor is available");
        strictEqual(arr.length, 10, "check length property");
        equal(arr.byteLength, arr.length * desc.GetBytesPerElement(), "check that byteLength == length * BYTES_PER_ELEMENT");
        equal(arr.buffer.byteLength, arr.byteLength, "check that buffer.byteLength == byteLength");
        strictEqual(arr.byteOffset, 0, "check byteOffset property");
    });

    test("constructor " + desc.name + "(TypeArray) is available", function () {
        var arr = createArrayFunc.WithLength(10);
        arr[0] = 50;
        var arr2 = createArrayFunc.FromTypedArray(arr);

        ok(arr2 !== null && arr2 !== undefined, "Constructor is available");
        strictEqual(arr2.length, 10, "check length property");
        equal(arr2.byteLength, arr.length * desc.GetBytesPerElement(), "check that byteLength == length * BYTES_PER_ELEMENT");
        ok(arr2.buffer.byteLength && arr2.byteLength && arr2.byteLength == arr.byteLength, "check that buffer.byteLength == byteLength");
        strictEqual(arr2.byteOffset, 0, "check byteOffset property");
        strictEqual(arr2[0], arr[0], desc.name + " ref on the same data as TypeArray");
    });

    test("constructor " + desc.name + "(type[]) is available", function () {
        var initArr = [0, 1, 2, 3, 4, 5];
        var arr = createArrayFunc.FromJSArray(initArr);

        ok(arr !== null && arr !== undefined, "Constructor is available");
        equal(arr.length, initArr.length, "check length property");
        equal(arr.byteLength, arr.length * desc.GetBytesPerElement(), "check that byteLength == length * BYTES_PER_ELEMENT");
        equal(arr.buffer.byteLength, arr.byteLength, "check that buffer.byteLength == byteLength");
        strictEqual(arr.byteOffset, 0, "check byteOffset property");
        strictEqual(arr[4], initArr[4], desc.name + " contains the same data as type[]");
    });

    test("constructor " + desc.name + "(arrBuffer, opt, opt) is available", function () {
        var arr = new ArrayBuffer(16 * desc.GetBytesPerElement());
        var bytes = createArrayFunc.FromArrayBuffer(arr);

        ok(bytes !== null && bytes !== undefined, "Constructor is available");
        equal(bytes.length, arr.byteLength / desc.GetBytesPerElement(), "check length property");
        equal(arr.byteLength, bytes.byteLength, "check that ArrayBuffer.byteLength == " + desc.name + ".byteLength");
        equal(bytes.byteLength, bytes.length * desc.GetBytesPerElement(), "check that byteLength == length * BYTES_PER_ELEMENT");
        strictEqual(bytes.buffer.byteLength, bytes.byteLength, "check that buffer.byteLength == byteLength");
        strictEqual(bytes.byteOffset, 0, "check byteOffset property");
    });

    test("constructor " + desc.name + "(arrBuffer, offset, opt) is available", function () {
        var arr = new ArrayBuffer(16 * desc.GetBytesPerElement());
        var bytes = createArrayFunc.FromArrayBuffer(arr, 4 * desc.GetBytesPerElement());

        ok(bytes !== null && bytes !== undefined, "Constructor is available");
        equal(bytes.byteLength, arr.byteLength - bytes.byteOffset, "check byteLength property");
        equal(bytes.length , (arr.byteLength - bytes.byteOffset) / desc.GetBytesPerElement(), "check length property");
        equal(bytes.buffer.byteLength , arr.byteLength, "check that buffer.byteLength == array.byteLength");
        equal(bytes.byteOffset, 4 * desc.GetBytesPerElement(), "check byteOffset property");
    });

    test("constructor " + desc.name + "(arrBuffer, offset, length) is available", function () {
        var arr = new ArrayBuffer(16 * desc.GetBytesPerElement());
        var bytes = createArrayFunc.FromArrayBuffer(arr, 4 * desc.GetBytesPerElement(), 8);

        ok(bytes !== null && bytes !== undefined, "Constructor is available");
        equal(bytes.byteLength, bytes.length * desc.GetBytesPerElement(), "check byteLength property");
        strictEqual(bytes.length, 8, "check length property");
        equal(bytes.buffer.byteLength, arr.byteLength, "check that buffer.byteLength == array.byteLength");
        equal(bytes.byteOffset, 4 * desc.GetBytesPerElement(), "check byteOffset property");
    });
}

var constructorExceptionTests = function (desc, createArrayFunc) {
    test("raising exception from constructor", function () {
        raises(function () {
            var arr = new ArrayBuffer(16 * desc.GetBytesPerElement());
            var bytes = createArrayFunc.FromArrayBuffer(arr, 3, 3);
        }, "If call constructor " + desc.name + "(arrBuffer, offset, length) with byteOffset is not a multiple of the element size of the specific type an exception is raised");

        raises(function () {
            var arr = new ArrayBuffer(9);
            var bytes = createArrayFunc.FromArrayBuffer(arr, 4);
        }, "An exception is raised if call constructor " + desc.name + "(arrBuffer, offset) with length is not explicitly specified && ArrayBuffer.length - byteOffset is not a multiple of the element size of the specific type");

        raises(function () {
            var arr = new ArrayBuffer(7);
            var bytes = createArrayFunc.FromArrayBuffer(arr);
        }, "An exception is raised if ArrayBuffer.length is not a multiple of the element size of the specific type");
    });
}

var commonTests = function (desc, createArrayFunc, convertionTestFunc) {

    test("with empty ArrayBuffer", function () {
        var arr = new ArrayBuffer(0);
        var bytes = createArrayFunc.FromArrayBuffer(arr);

        strictEqual(bytes.byteLength, 0, "byteLength == 0");
        equal(bytes[0], undefined, "bytes[0] == undefined");
    });

    test("hidden properties & methods are unavailable", function () {
        var arr = createArrayFunc.WithLength(10);
        ok(arr.mem === undefined, "hidden properties [mem] are unavailable");
        ok(arr.get === undefined, "hidden methods [get] are unavailable");
        raises(function () {
            arr.set(0, 5);
        }, "hidden methods [set(index, value)] are unavailable");
    });

    test("index accessors test", function () {
        var arr = createArrayFunc.WithLength(10);
        arr[0] = 200;
        arr[1] = 200;

        strictEqual(arr[2], 0, "Elements should be initialized to zero");
        strictEqual(arr[0], arr[1], "Check index accessors");
    });

    test("out of range access [index >= length]", function () {
        var arr = createArrayFunc.WithLength(10);
        arr[10] = 255;
    });

    test("out of range access [index is negative]", function () {
        var arr = createArrayFunc.WithLength(10);
        arr[-10] = 255;
    });

    test("sharing of ArrayBuffer", function () {
        var buf = new ArrayBuffer(16 * desc.GetBytesPerElement());
        var v1 = createArrayFunc.FromArrayBuffer(buf, 4 * desc.GetBytesPerElement(), 8);
        var v2 = createArrayFunc.FromArrayBuffer(buf, 0 * desc.GetBytesPerElement(), 8);

        v1[0] = 5;
        strictEqual(v2[4], 5, "same data");
    });

    test("view going out of ArrayBuffer length", function () {
        raises(function () {
            var buf = new ArrayBuffer(16);
            var v1 = createArrayFunc.FromArrayBuffer(buf, 4, 100);
        });
    });

    test("verify set()", function () {
        var v = createArrayFunc.WithLength(16);
        v.set([0, 1, 2, 3, 4]);
        ok(v[3] == 3, "set(JSArray)");

        v.set([0, 1, 2, 3, 4], 2);
        ok(v[5] == 3, "set(JSArray, offset)");

        var v1 = createArrayFunc.WithLength(10);
        v1.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        v.set(v1);
        ok(v[5] == 5, "set(TypedArray)");

        var v2 = createArrayFunc.WithLength(8);
        v2.set([0, 1, 2, 3, 4, 5, 6, 7]);
        v.set(v2, 2);
        ok(v[7] == 5, "set(TypedArray, offset)");
    });

    test("verify set(TypedArray, offset) method with shared ArrayBuffer", function () {
        var buf = new ArrayBuffer(16 * desc.GetBytesPerElement());
        var v1 = createArrayFunc.FromArrayBuffer(buf);
        var v2 = createArrayFunc.FromArrayBuffer(buf, 0 * desc.GetBytesPerElement(), 8);
        var v3 = createArrayFunc.FromArrayBuffer(buf, 4 * desc.GetBytesPerElement(), 8);

        v1.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

        equal(v2[6], 6, "v2[6] == 6");
        equal(v3[2], 6, "v3[2] == 6");

        v3.set(v2);
        equal(v1[8], 4, "v1[8] == 4");
    });

    test("verify set() that out of range [offset + array length > array length]", function () {
        raises(function () {
            var v = createArrayFunc.WithLength(5);
            v.set([0, 1, 2, 3, 4, 5]);
        }, "set(JSArray)");

        raises(function () {
            var v = createArrayFunc.WithLength(5);
            v.set([0, 1, 2, 3, 4], 1);
        }, "set(JSArray, offset)");

        raises(function () {
            var v1 = createArrayFunc.WithLength(5);
            var v2 = createArrayFunc.WithLength(6);
            v.set(v2);
        }, "set(TypedArray)");

        raises(function () {
            var v1 = createArrayFunc.WithLength(5);
            var v2 = createArrayFunc.WithLength(5);
            v.set(v2, 1);
        }, "set(TypedArray, offset)");
    });

    test("verify subarray()", function () {
        var arr = createArrayFunc.WithLength(10);
        arr[5] = 5;
        var subArr = arr.subarray(4, 7);
        strictEqual(subArr[1], 5, "subarray() ref on the same data as array");
        strictEqual(subArr.length, 3, "subarray(begin, end)");

        subArr = arr.subarray(4);
        strictEqual(subArr.length, 6, "subarray() with 1 optional argument");

        subArr = arr.subarray(-6, -2);
        strictEqual(subArr.length, 4, "subarray() with negative arguments");

        subArr = arr.subarray(6, 12);
        strictEqual(subArr.length, 4, "subarray() with clamped end");

        subArr = arr.subarray(6, 4);
        strictEqual(subArr.length, 0, "subarray() with negative length");
    });

    test(desc.name + " can be converted to string", function () {
        var arr = createArrayFunc.WithLength(10);

        ok(true, "Check that TypedArray can be implicitly converted to string: " + arr);
        ok(true, "Check TypedArray.toString() is available : " + arr.toString());
    });

    test("data type conversion test", function () {
        var arr = createArrayFunc.WithLength(10);
        convertionTestFunc(arr, desc.maxValue);
    });

    //     test("large array test", function () {
    //        var arr = createArrayFunc.WithLength(2 * 1024 * 1024); // e.x. 65536 32-byte vertices
    //        var i = 0;
    //        for (; i < arr.byteLength; ++i) {
    //            arr[i] = 1;
    //        }
    //     });
};
