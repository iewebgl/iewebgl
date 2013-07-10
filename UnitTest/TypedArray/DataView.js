function CheckDataViewAccessors(accessors, value) {
    var arr = new ArrayBuffer(accessors.bytesLength);
    var dv = new DataView(arr);

    accessors.setValue(dv, value, true);
    strictEqual(accessors.getValue(dv, true), value, "Check " + accessors.desc + " with little-endian order");
    accessors.setValue(dv, value, false);
    strictEqual(accessors.getValue(dv, false), value, "Check " + accessors.desc + " with big-endian order");
}

module("DataView");

test("object is available as build-in type", function () {
    var dv = DataView;
    ok(dv !== null && dv !== undefined, "object existance");
});

test("all constructors are available", function () {
    var arr = new ArrayBuffer(16);

    var dv1 = new DataView(arr);
    ok(dv1 !== null && dv1 !== undefined, "DataView(arr, [opt, opt]) constructor is available");

    var dv2 = new DataView(arr, 8);
    ok(dv2 !== null && dv2 !== undefined, "DataView(arr, offset, [opt]) constructor is available");

    var dv3 = new DataView(arr, 8, 8);
    ok(dv3 !== null && dv3 !== undefined, "DataView(arr, offset, length) constructor is available");
});

test("instanceof is available for DataView", function () {
    var arr = new ArrayBuffer(16);
    var dv = new DataView(arr);
    ok(dv instanceof DataView, "instanceof is available");
});

test("setters and getters are available", function () {
    var arr = new ArrayBuffer(16);
    var dv = new DataView(arr);
    dv.setUint8(0, 1);
    dv.setUint16(1, 5, true);
    dv.setUint32(3, 100, true);
    dv.setFloat32(7, 0.7, true);

    strictEqual(dv.getUint8(0), 1, "setUint8/getUint8");
    strictEqual(dv.getUint16(1, true), 5, "setUint16/getUint16");
    strictEqual(dv.getUint32(3, true), 100, "setUint32/getUint32");
    ok(isEqual(dv.getFloat32(7, true), 0.7), "setFloat32/getFloat32");
});

test("out of range access", function () {
    raises(function () {
        var arr = new ArrayBuffer(16);
        var dv = new DataView(arr);
        dv.setUint8(16, 1, true);
    }, "[byteOffset >= byteLength]");

    raises(function () {
        var arr = new ArrayBuffer(16);
        var dv = new DataView(arr);
        dv.setUint32(14, 1, true);
    }, "[byteOffset + BYTES_PER_ELEMENT >= byteLength]");

    raises(function () {
        var arr = new ArrayBuffer(16);
        var dv = new DataView(arr);
        dv.setUint8(-1, 1, true);
    }, "[byteOffset < 0]");
});

test("setter and getters methods", function () {
    var accessors =
    [
        { 'bytesLength': Uint8Array.BYTES_PER_ELEMENT,
            'desc': "setUint8/getUint8",
            'setValue': function (dv, value, leOrder) { dv.setUint8(0, value) },
            'getValue': function (dv, leOrder) { return dv.getUint8(0); }
        },
         { 'bytesLength': Int8Array.BYTES_PER_ELEMENT,
             'desc': "setInt8/getInt8",
             'setValue': function (dv, value, leOrder) { dv.setInt8(0, value) },
             'getValue': function (dv, leOrder) { return dv.getInt8(0); }
         },
         { 'bytesLength': Uint16Array.BYTES_PER_ELEMENT,
             'desc': "setUint16/getUint16",
             'setValue': function (dv, value, leOrder) { dv.setUint16(0, value, leOrder) },
             'getValue': function (dv, leOrder) { return dv.getUint16(0, leOrder); }
         },
         { 'bytesLength': Int16Array.BYTES_PER_ELEMENT,
             'desc': "setInt16/getInt16",
             'setValue': function (dv, value, leOrder) { dv.setInt16(0, value, leOrder) },
             'getValue': function (dv, leOrder) { return dv.getInt16(0, leOrder); }
         },
          { 'bytesLength': Uint32Array.BYTES_PER_ELEMENT,
              'desc': "setUint32/getUint32",
              'setValue': function (dv, value, leOrder) { dv.setUint32(0, value, leOrder) },
              'getValue': function (dv, leOrder) { return dv.getUint32(0, leOrder); }
          },
          { 'bytesLength': Int32Array.BYTES_PER_ELEMENT,
              'desc': "setInt32/getInt32",
              'setValue': function (dv, value, leOrder) { dv.setInt32(0, value, leOrder) },
              'getValue': function (dv, leOrder) { return dv.getInt32(0, leOrder); }
          },
         { 'bytesLength': Float32Array.BYTES_PER_ELEMENT,
             'desc': "setFloat32/getFloat32",
             'setValue': function (dv, value, leOrder) { dv.setFloat32(0, value, leOrder) },
             'getValue': function (dv, leOrder) { return dv.getFloat32(0, leOrder); }
         }
         //1)
    // setFloat64/getFloat64 - not implement in IE
    //          { 'bytesLength': Float64Array.BYTES_PER_ELEMENT,
    //              'desc': "setFloat64/getFloat64",
    //              'setValue': function (dv, value, leOrder) { dv.setFloat64(0, value, leOrder) },
    //              'getValue': function (dv, leOrder) { return dv.getFloat64(0, leOrder); } 
    //          }
     ];

    for (var i = 0, l = accessors.length; i < l; i++) {
        CheckDataViewAccessors(accessors[i], 57);
    } 
});

test("big/little endian reade", function () {
    var arr = new ArrayBuffer(Uint32Array.BYTES_PER_ELEMENT);
    var dv = new DataView(arr);

    dv.setUint16(0, 0x7F00);
    strictEqual(dv.getUint16(0, false), 0x7F00, "setUint16() with undefined littleEndian param stores in big-endian byte order");
    dv.setUint16(0, 0x106D, false);
    strictEqual(dv.getUint16(0, false), 0x106D, "setUint16() with false littleEndian param stores in big-endian byte order");
    dv.setUint16(0, 0x0D10, true);
    strictEqual(dv.getUint16(0, true), 0x0D10, "setUint16() with true littleEndian param stores in little-endian byte order");

    dv.setUint8(0, 0x7F);
    dv.setUint8(1, 0x00);
    dv.setUint8(2, 0xC0);
    dv.setUint8(3, 0xCF);

    strictEqual(dv.getUint32(0, true), 0xCFC0007F, "little-endian read check");
    strictEqual(dv.getUint32(0, false), 0x7F00C0CF, "big-endian read check");
});

test("DataView can be converted to string", function () {
    var arr = new ArrayBuffer(16);
    var dv = new DataView(arr);

    ok(true, "Check that DataView can be implicitly converted to string: " + dv);
    ok(true, "Check DataView.toString() is available : " + dv.toString());
});


/*
1) setFloat64/getFloat64 - not implement in IE
https://bitbucket.org/MOD/iewebgl/issue/15/dataview-setfloat64-getfloat64-not
*/