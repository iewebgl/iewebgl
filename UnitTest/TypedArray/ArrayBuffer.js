
module("ArrayBuffer");

test("object is available as build-in type", function () {
    var arr = ArrayBuffer;
    ok(arr !== null && arr !== undefined, "object existance");
});

test("Normal ArrayBuffer creation", function () {
    var arr = new ArrayBuffer(10);

    ok(arr !== null || arr !== undefined, "constructor ArrayBuffer(length) is available");
    strictEqual(arr.byteLength, 10, "Check [byteLength] property after call constructor ArrayBuffer(length)");
});

test("instanceof is available for ArrayBuffer", function () {
    var arr = new ArrayBuffer(10);
    ok(arr instanceof ArrayBuffer, "check instanceof");
});

test("Zero-sized ArrayBuffer creation", function () {
    var arr = new ArrayBuffer(0);

    ok(arr !== null || arr !== undefined, "zero-sized ArrayBuffer can be created");
    strictEqual(arr.byteLength, 0, "Check [byteLength] property in zero-sized ArrayBuffer");
});

test("Oversized ArrayBuffer creation", function () {
    raises(function () {
        var arr = new ArrayBuffer(4 * 1024 * 1024 * 1024);  //4 Gb 
    }, "very large ArrayBuffer creation request raises exception");
});

test("ArrayBuffer can be converted to string", function () {
    var arr = new ArrayBuffer(10);

    ok(true, "Check that ArrayBuffer can be implicitly converted to string: " + arr);
    ok(true, "Check ArrayBuffer.toString() is available : " + arr.toString());
});
