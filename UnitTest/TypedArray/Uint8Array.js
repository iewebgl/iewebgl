
var uint8ArrayCreateFunc =
{
    'WithLength': function (length) { return new Uint8Array(length); },
    'FromTypedArray': function (typedArray) { return new Uint8Array(typedArray); },
    'FromJSArray': function (jsArray) { return new Uint8Array(jsArray); },
    'FromArrayBuffer': function (arr, byteOffset, length) {
        if (byteOffset == undefined && length == undefined) {
            return new Uint8Array(arr);
        }
        else if (length == undefined) {
            return new Uint8Array(arr, byteOffset);
        }

        return new Uint8Array(arr, byteOffset, length);
    }
};

var uint8ArrayTest =
{
    'name': "Uint8Array",
    'GetBytesPerElement': function () {
        var bpe = Uint8Array.BYTES_PER_ELEMENT;
        return bpe;
    },
    'maxValue': Math.pow(2, 8)
};

module(uint8ArrayTest.name);

test("object is available as build-in type", function () {
    var arr = Uint8Array;
    ok(arr !== null && arr !== undefined, "object existance");
});

test("Uint8Array constant type attribute BYTES_PER_ELEMENT is available", function () {
    var bpe = Uint8Array.BYTES_PER_ELEMENT;
    strictEqual(bpe, 1, "Check that Uint8Array.BYTES_PER_ELEMENT == 1");;
});

test("instanceof is available for Uint8Array", function () {
    var arr = new Uint8Array(10);
    ok(arr instanceof Uint8Array, "instanceof is available");
});

constuctorsTests(uint8ArrayTest, uint8ArrayCreateFunc);
commonTests(uint8ArrayTest, uint8ArrayCreateFunc, RunUintDataConversionTest);