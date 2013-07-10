
var int32ArrayCreateFunc = 
{
    'WithLength': function (length) { return new Int32Array(length); },
    'FromTypedArray': function (typedArray) { return new Int32Array(typedArray); },
    'FromJSArray':function (jsArray) { return new Int32Array(jsArray); },
    'FromArrayBuffer': function (arr, byteOffset, length) {
        if(byteOffset == undefined && length == undefined) {
            return new Int32Array(arr); 
        }
        else if(length == undefined){
            return new Int32Array(arr, byteOffset);
        }

        return new Int32Array(arr, byteOffset, length); 
     }

 };

var int32ArrayTest = 
{  'name': "Int32Array",
   'GetBytesPerElement': function () { 
        var bpe = Int32Array.BYTES_PER_ELEMENT;
        return  bpe;
    },
    'maxValue': Math.pow(2, 32)
};


module(int32ArrayTest.name);

test("object is available as build-in type", function () {
    var arr = Int32Array;
    ok(arr !== null && arr !== undefined, "object existance");
});

test("Int32Array constant type attribute BYTES_PER_ELEMENT is available", function () {
    var bpe = Int32Array.BYTES_PER_ELEMENT;
    strictEqual(bpe, 4, "Check that Int32Array.BYTES_PER_ELEMENT == 4"); ;
});

test("instanceof is available for Int32Array", function () {
    var arr = new Int32Array(10);
    ok(arr instanceof Int32Array, "instanceof is available");
});

constuctorsTests(int32ArrayTest, int32ArrayCreateFunc);
constructorExceptionTests(int32ArrayTest, int32ArrayCreateFunc);
commonTests(int32ArrayTest, int32ArrayCreateFunc, RunIntDataConversionTest);