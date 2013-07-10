
var uint32ArrayCreateFunc =
{
    'WithLength': function (length) { return new Uint32Array(length); },
    'FromTypedArray': function (typedArray) { return new Uint32Array(typedArray); },
    'FromJSArray': function (jsArray) { return new Uint32Array(jsArray); },
    'FromArrayBuffer': function (arr, byteOffset, length) {
        if (byteOffset == undefined && length == undefined) {
            return new Uint32Array(arr);
        }
        else if (length == undefined) {
            return new Uint32Array(arr, byteOffset);
        }

        return new Uint32Array(arr, byteOffset, length);
    }
};

var uint32ArrayTest =
{
    'name': "Uint32Array",
    'GetBytesPerElement': function () {
        var bpe = Uint32Array.BYTES_PER_ELEMENT;
        return bpe;
    },
    'maxValue': Math.pow(2, 32)
};


module(uint32ArrayTest.name);

test("object is available as build-in type", function () {
    var arr = Uint32Array;
    ok(arr !== null && arr !== undefined, "object existance");
});

test("Uint32Array constant type attribute BYTES_PER_ELEMENT is available", function () {
    var bpe = Uint32Array.BYTES_PER_ELEMENT;
    strictEqual(bpe, 4, "Check that Uint32Array.BYTES_PER_ELEMENT == 4"); ;
});

test("instanceof is available for Uint32Array", function () {
    var arr = new Uint32Array(10);
    ok(arr instanceof Uint32Array, "instanceof is available");
});

constuctorsTests(uint32ArrayTest, uint32ArrayCreateFunc);
constructorExceptionTests(uint32ArrayTest, uint32ArrayCreateFunc);
commonTests(uint32ArrayTest, uint32ArrayCreateFunc, RunUintDataConversionTest);
