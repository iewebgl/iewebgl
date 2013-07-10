
var float64ArrayCreateFunc =
{
    'WithLength': function (length) { return new Float64Array(length); },
    'FromTypedArray': function (typedArray) { return new Float64Array(typedArray); },
    'FromJSArray': function (jsArray) { return new Float64Array(jsArray); },
    'FromArrayBuffer': function (arr, byteOffset, length) {
        if (byteOffset == undefined && length == undefined) {
            return new Float64Array(arr);
        }
        else if (length == undefined) {
            return new Float64Array(arr, byteOffset);
        }

        return new Float64Array(arr, byteOffset, length);
    }
};

var float64ArrayTest =
{
    'name': "Float64Array",
    'GetBytesPerElement': function () {
        var bpe = Float64Array.BYTES_PER_ELEMENT;
        return bpe;
    },
    'maxValue': Math.pow(2, 1024)
};

module(float64ArrayTest.name);

test("object is available as build-in type", function () {
    var arr = Float64Array;
    ok(arr !== null && arr !== undefined, "object existance");
});

test("Float64Array constant type attribute BYTES_PER_ELEMENT is available", function () {
    var bpe = Float64Array.BYTES_PER_ELEMENT;
    strictEqual(bpe, 8, "Check that Float64Array.BYTES_PER_ELEMENT == 8"); ;
});

test("instanceof is available for Float64Array", function () {
    var arr = new Float64Array(10);
    ok(arr instanceof Float64Array, "instanceof is available");
});

constuctorsTests(float64ArrayTest, float64ArrayCreateFunc);
constructorExceptionTests(float64ArrayTest, float64ArrayCreateFunc);
commonTests(float64ArrayTest, float64ArrayCreateFunc, RunFloatDataConversionTest);
