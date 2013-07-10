
var float32ArrayCreateFunc =
{
    'WithLength': function (length) { return new Float32Array(length); },
    'FromTypedArray': function (typedArray) { return new Float32Array(typedArray); },
    'FromJSArray': function (jsArray) { return new Float32Array(jsArray); },
    'FromArrayBuffer': function (arr, byteOffset, length) {
        if (byteOffset == undefined && length == undefined) {
            return new Float32Array(arr);
        }
        else if (length == undefined) {
            return new Float32Array(arr, byteOffset);
        }

        return new Float32Array(arr, byteOffset, length);
    }
};

var float32ArrayTest =
{
    'name': "Float32Array",
    'GetBytesPerElement': function () {
        var bpe = Float32Array.BYTES_PER_ELEMENT;
        return bpe;
    },
    'maxValue': Math.pow(2, 128)
};


module(float32ArrayTest.name);

test("object is available as build-in type", function () {
    var arr = Float32Array;
    ok(arr !== null && arr !== undefined, "object existance");
});

test("Int32Array constant type attribute BYTES_PER_ELEMENT is available", function () {
    var bpe = Float32Array.BYTES_PER_ELEMENT;
    strictEqual(bpe, 4, "Check that Float32Array.BYTES_PER_ELEMENT == 4"); ;
});

test("instanceof is available for Float32Array", function () {
    var arr = new Float32Array(10);
    ok(arr instanceof Float32Array, "instanceof is available");
});

constuctorsTests(float32ArrayTest, float32ArrayCreateFunc);
constructorExceptionTests(float32ArrayTest, float32ArrayCreateFunc);
commonTests(float32ArrayTest, float32ArrayCreateFunc, RunFloatDataConversionTest);
