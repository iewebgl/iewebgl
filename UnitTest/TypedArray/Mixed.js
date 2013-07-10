//var uint8bpe = Uint8Array.BYTES_PER_ELEMENT;

module("Mixed");

test("Int8Array and Uint8Array data views on same data", function () {
    var arr = new ArrayBuffer(1);
    var sBytes = new Int8Array(arr);
    var usBytes = new Uint8Array(arr);
    sBytes[0] = -1;
    ok(usBytes[0] === 255, "same data");
});

test("Uint8Array and UInt32Array data views on same data", function () {
    var arr = new ArrayBuffer(Uint32Array.BYTES_PER_ELEMENT);
    var usBytes = new Uint8Array(arr);
    var usDwords = new Uint32Array(arr);
    usDwords[0] = 0x80FF00FF;
    ok(usBytes[3] == 0x80 && usBytes[0] == usBytes[2], "same data");
});

test("NaN representation for float", function () {
    var arr = new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT);
    var fArr = new Float32Array(arr);
    var usBytes = new Uint8Array(arr);

    fArr[0] = "ss";
    ok(isNaN(fArr[0]), "NaN from invalid string");
    fArr[0] = 0.0;

    fArr[0] = Number.NaN;
    ok(isNaN(fArr[0]), "NaN from Number.NaN");
    fArr[0] = 0.0;

    fArr[0] = undefined;
    ok(isNaN(fArr[0]), "NaN from undefined");
});

test("NaN representation for double", function () {
    var arr = new ArrayBuffer(Float64Array.BYTES_PER_ELEMENT);
    var fArr = new Float64Array(arr);
    var usBytes = new Uint8Array(arr);

    fArr[0] = "ss";
    ok(isNaN(fArr[0]), "NaN from invalid string");
    fArr[0] = 0.0;

    fArr[0] = Number.NaN;
    ok(isNaN(fArr[0]), "NaN from Number.NaN");
    fArr[0] = 0.0;

    fArr[0] = undefined;
    ok(isNaN(fArr[0]), "NaN from undefined");
});

test("multiple typed array views (from example in section 2 of TypedArray spec with {v2[4] = 0x10, v2[5] = 0x0C, v3[1] = 0x1F0F, v1[0] = 0x50F0D745})", function () {
    var arr = new ArrayBuffer(8);
    var v1 = new Int32Array(arr);
    var v2 = new Uint8Array(arr, 2);
    var v3 = new Int16Array(arr, 2, 2);
    v2[4] = 0x10;
    v2[5] = 0x0C;
    v3[1] = 0x1F0F;
    v1[0] = 0x50F0D745;

    ok(v1[1] == 0x0C101F0F, "v1[1] == 0x0C101F0F");
    ok(v2[2] == 0x0F, "v2[2] == 0x0F");
    ok(v2[3] == 0x1F, "v2[3] == 0x1F");
    ok(v2[0] == 0xF0, "v2[0] == 0xF0");
    ok(v2[1] == 0x50, "v2[1] == 0x50");
    ok(v3[0] == 0x50F0, "v3[0] == 0xF0C0");
});

test("static property is available in global scope", function () {
    // failed in IE - [SCRIPT5009: 'Uint8Array' is undefined]
    //ok(uint8bpe == 1, "static property is available");
});
