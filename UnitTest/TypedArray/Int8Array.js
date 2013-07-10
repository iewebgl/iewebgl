var int8ArrayCreateFunc = 
{
    'WithLength': function (length) { return new Int8Array(length); },
    'FromTypedArray': function (typedArray) { return new Int8Array(typedArray); },
    'FromJSArray':function (jsArray) { return new Int8Array(jsArray); },
    'FromArrayBuffer': function (arr, byteOffset, length) {
        if(byteOffset == undefined && length == undefined) {
            return new Int8Array(arr); 
        }
        else if(length == undefined){
            return new Int8Array(arr, byteOffset);
        }

        return new Int8Array(arr, byteOffset, length); 
     }

 };

var int8ArrayTest = 
{  'name': "Int8Array",
   'GetBytesPerElement': function () { 
        var bpe = Int8Array.BYTES_PER_ELEMENT;
        return  bpe;
    },
    'maxValue': Math.pow(2, 8)
};

module(int8ArrayTest.name);

test("object is available as build-in type", function () {
    var arr = Int8Array;
    ok(arr !== null && arr !== undefined, "object existance");
});

test("Int8Array constant type attribute BYTES_PER_ELEMENT is available", function () {
    var bpe = Int8Array.BYTES_PER_ELEMENT;
    strictEqual(bpe, 1, "Check that Int8Array.BYTES_PER_ELEMENT == 1");;
});

test("instanceof is available for Int8Array", function () {
    var arr = new Int8Array(10);
    ok(arr instanceof Int8Array, "instanceof is available");
});

constuctorsTests(int8ArrayTest, int8ArrayCreateFunc);
commonTests(int8ArrayTest, int8ArrayCreateFunc, RunIntDataConversionTest);
