
var int16ArrayCreateFunc = 
{
    'WithLength': function (length) { return new Int16Array(length); },
    'FromTypedArray': function (typedArray) { return new Int16Array(typedArray); },
    'FromJSArray':function (jsArray) { return new Int16Array(jsArray); },
    'FromArrayBuffer': function (arr, byteOffset, length) {
        if(byteOffset == undefined && length == undefined) {
            return new Int16Array(arr); 
        }
        else if(length == undefined){
            return new Int16Array(arr, byteOffset);
        }

        return new Int16Array(arr, byteOffset, length); 
     }

 };

var int16ArrayTest = 
{  'name': "Int16Array",
   'GetBytesPerElement': function () { 
        var bpe = Int16Array.BYTES_PER_ELEMENT;
        return  bpe;
    },
    'maxValue': Math.pow(2, 16)
};

module(int16ArrayTest.name);

test("object is available as build-in type", function () {
    var arr = Int16Array;
    ok(arr !== null && arr !== undefined, "object existance");
});

test("Int16Array constant type attribute BYTES_PER_ELEMENT is available", function () {
    var bpe = Int16Array.BYTES_PER_ELEMENT;
    strictEqual(bpe, 2, "Check that Int16Array.BYTES_PER_ELEMENT == 2"); ;
});

test("instanceof is available for Int16Array", function () {
    var arr = new Int16Array(10);
    ok(arr instanceof Int16Array, "instanceof is available");
});

constuctorsTests(int16ArrayTest, int16ArrayCreateFunc);
constructorExceptionTests(int16ArrayTest, int16ArrayCreateFunc);
commonTests(int16ArrayTest, int16ArrayCreateFunc, RunIntDataConversionTest);
