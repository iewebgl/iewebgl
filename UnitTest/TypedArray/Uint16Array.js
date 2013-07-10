
var uint16ArrayCreateFunc =
{
    'WithLength': function (length) { return new Uint16Array(length); },
    'FromTypedArray': function (typedArray) { return new Uint16Array(typedArray); },
    'FromJSArray': function (jsArray) { return new Uint16Array(jsArray); },
    'FromArrayBuffer': function (arr, byteOffset, length) {
        if (byteOffset == undefined && length == undefined) {
            return new Uint16Array(arr);
        }
        else if (length == undefined) {
            return new Uint16Array(arr, byteOffset);
        }

        return new Uint16Array(arr, byteOffset, length);
    }
};

var uint16ArrayTest =
{
    'name': "Uint16Array",
    'GetBytesPerElement': function () {
        var bpe = Uint16Array.BYTES_PER_ELEMENT;
        return bpe;
    },
    'maxValue': Math.pow(2, 16)
};

module(uint16ArrayTest.name);

test("object is available as build-in type", function () {
    var arr = Uint16Array;
    ok(arr !== null && arr !== undefined, "object existance");
});

test("Uint16Array constant type attribute BYTES_PER_ELEMENT is available", function () {
    var bpe = Uint16Array.BYTES_PER_ELEMENT;
    strictEqual(bpe, 2, "Check that Uint16Array.BYTES_PER_ELEMENT == 2"); ;
});

test("instanceof is available for Uint16Array", function () {
    var arr = new Uint16Array(10);
    ok(arr instanceof Uint16Array, "instanceof is available");
});

constuctorsTests(uint16ArrayTest, uint16ArrayCreateFunc);
constructorExceptionTests(uint16ArrayTest, uint16ArrayCreateFunc);
commonTests(uint16ArrayTest, uint16ArrayCreateFunc, RunUintDataConversionTest);
