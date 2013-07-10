
var bufferDataFuncs =
[
    { 'desc': 'size', 'run': function (gl, target, size, usage) { gl.bufferData(target, size, usage); } },
    { 'desc': 'ArrayBufferView', 'run': function (gl, target, size, usage) { gl.bufferData(target, new ArrayBuffer(size), usage); } },
    { 'desc': 'ArrayBuffer', 'run': function (gl, target, size, usage) { gl.bufferData(target, new Uint8Array(size), usage); } }
];

module("WebGLBuffer");

test("verify createBuffer() && deleteBuffer()", function () {
    var gl = GetCleanContext();

    var buffer1 = gl.createBuffer();
    equal(gl.getError(), gl.NO_ERROR, "createBuffer() must not generate errors");
    ok(buffer1 != null || buffer1 != undefined, "createBuffer() returned valid value (not null or undefined)");
    ok(buffer1 instanceof WebGLBuffer, "createBuffer() returned value instanceof WebGLBuffer");

    var buffer2 = gl.createBuffer();
    equal(gl.getError(), gl.NO_ERROR, "recall createBuffer() must not generate errors");
    notStrictEqual(buffer1, buffer2, "recall createBuffer() returns different buffer object");

    gl.deleteBuffer(buffer1);
    equal(gl.getError(), gl.NO_ERROR, "deleteBuffer() must not generate errors");

    gl.deleteBuffer(buffer1);
    equal(gl.getError(), gl.NO_ERROR, "deleteBuffer() must not generate errors with deleted buffer");

    gl.deleteBuffer(null);
    equal(gl.getError(), gl.NO_ERROR, "deleteBuffer() must not generate errors with null buffer");
    gl.deleteBuffer(undefined);
    equal(gl.getError(), gl.NO_ERROR, "deleteBuffer() must not generate errors with undefined buffer");

    gl.deleteBuffer(buffer2);
    equal(gl.getError(), gl.NO_ERROR, "deleteBuffer() must not generate errors");
});

test("verify bindBuffer() && getParameter([ARRAY_BUFFER_BINDING, ELEMENT_ARRAY_BUFFER_BINDING])", function () {
    var gl = GetCleanContext();

    gl.bindBuffer(-1, null);
    equal(gl.getError(), gl.INVALID_ENUM, "bindBuffer() must generate bindBuffer invalid target");

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    equal(gl.getError(), gl.NO_ERROR, "bindBuffer(ARRAY_BUFFER, null) must not generate errors");
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    equal(gl.getError(), gl.NO_ERROR, "bindBuffer(ELEMENT_ARRAY_BUFFER, null) must not generate errors");

    var bound = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ARRAY_BUFFER_BINDING) must not generate errors");
    ok(bound == null, "getParameter(ARRAY_BUFFER_BINDING) returned null wit no bound WebGLBuffer");

    bound = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ELEMENT_ARRAY_BUFFER_BINDING) must not generate errors");
    ok(bound == null, "getParameter(ELEMENT_ARRAY_BUFFER_BINDING) returned null wit no bound WebGLBuffer");

    var arrayBuff = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuff);
    equal(gl.getError(), gl.NO_ERROR, "bindBuffer(ARRAY_BUFFER) must not generate errors with just created buffer");

    bound = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ARRAY_BUFFER_BINDING) must not generate after call bindBuffer(ARRAY_BUFFER)");
    strictEqual(bound, arrayBuff, "check returned value getParameter(ARRAY_BUFFER_BINDING)");

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrayBuff);
    equal(gl.getError(), gl.INVALID_OPERATION, "bindBuffer(ELEMENT_ARRAY_BUFFER) must generate INVALID_OPERATION if buffer was previosly bound with ARRAY_BUFFER target");

    bound = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ARRAY_BUFFER_BINDING) must not generate errors after call bindBuffer(ELEMENT_ARRAY_BUFFER) with ARRAY_BUFFER buffer");
    ok(bound === arrayBuff, "getParameter(ARRAY_BUFFER_BINDING) must not change value after call bindBuffer(ELEMENT_ARRAY_BUFFER) with ARRAY_BUFFER buffer");
    bound = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ELEMENT_ARRAY_BUFFER_BINDING) must not generate errors");
    ok(bound == null, "getParameter(ELEMENT_ARRAY_BUFFER_BINDING) must not change value after call bindBuffer(ELEMENT_ARRAY_BUFFER) with ARRAY_BUFFER buffer");

    gl.deleteBuffer(arrayBuff);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    bound = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ARRAY_BUFFER_BINDING) must not generate errors after call deleteBuffer(ARRAY_BUFFER)");
    ok(bound == null, "getParameter(ARRAY_BUFFER_BINDING) must return null after call deleteBuffer(ARRAY_BUFFER)");

    var elemBuff = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuff);
    equal(gl.getError(), gl.NO_ERROR, "bindBuffer(ELEMENT_ARRAY_BUFFER) must not generate errors with just created buffer");

    bound = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ELEMENT_ARRAY_BUFFER) must not generate after call bindBuffer(ARRAY_BUFFER)");
    strictEqual(bound, elemBuff, "check returned value getParameter(ELEMENT_ARRAY_BUFFER)");

    gl.bindBuffer(gl.ARRAY_BUFFER, elemBuff);
    equal(gl.getError(), gl.INVALID_OPERATION, "bindBuffer(ARRAY_BUFFER) must generate INVALID_OPERATION if buffer was previosly bound with ELEMENT_ARRAY_BUFFER target");

    bound = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ELEMENT_ARRAY_BUFFER_BINDING) must not generate errors after call bindBuffer(ARRAY_BUFFER) with ELEMENT_ARRAY_BUFFER buffer");
    ok(bound === elemBuff, "getParameter(ELEMENT_ARRAY_BUFFER_BINDING) must not change value  after call bindBuffer(ARRAY_BUFFER) with ELEMENT_ARRAY_BUFFER buffer");
    bound = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ARRAY_BUFFER_BINDING) must not generate errors");
    ok(bound == null, "getParameter(ARRAY_BUFFER_BINDING) must not change value after call bindBuffer(ARRAY_BUFFER) with ELEMENT_ARRAY_BUFFER buffer");

    var elemBuff2 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuff2);

    bound = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ELEMENT_ARRAY_BUFFER_BINDING) must not generate errors after call bindBuffer(ELEMENT_ARRAY_BUFFER) with another buffer");
    strictEqual(bound, elemBuff2, "check returned value getParameter(ELEMENT_ARRAY_BUFFER_BINDING) after call bindBuffer(ELEMENT_ARRAY_BUFFER) with another buffer");

    gl.deleteBuffer(elemBuff);
    gl.deleteBuffer(elemBuff2);

    bound = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    equal(gl.getError(), gl.NO_ERROR, "getParameter(ELEMENT_ARRAY_BUFFER_BINDING) must not generate errors after call deleteBuffer(ELEMENT_ARRAY_BUFFER)");
    ok(bound == null, "getParameter(ELEMENT_ARRAY_BUFFER_BINDING) must return null after call deleteBuffer(ELEMENT_ARRAY_BUFFER)");
});

test("verify bufferData() target && usage parameter, getBufferParameter(BUFFER_USAGE)", function () {
    var gl = GetCleanContext();

    var usages =
    [
        { name: "STREAM_DRAW", value: gl.STREAM_DRAW },
        { name: "STATIC_DRAW", value: gl.STATIC_DRAW },
        { name: "DYNAMIC_DRAW", value: gl.DYNAMIC_DRAW }
    ];

    var targets =
    [
        { name: "ARRAY_BUFFER", value: gl.ARRAY_BUFFER },
        { name: "ELEMENT_ARRAY_BUFFER", value: gl.ELEMENT_ARRAY_BUFFER }
    ];

    var checkSize = 64;

    for (bIt = 0, bLength = bufferDataFuncs.length; bIt < bLength; ++bIt) {
        for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
            var buff = gl.createBuffer();
            gl.bindBuffer(targets[tIt].value, buff);

            bufferDataFuncs[bIt].run(gl, targets[tIt].value, checkSize, -1);
            equal(gl.getError(), gl.INVALID_ENUM, "bufferData(" + targets[tIt].name + ") must generate INVALID_ENUM with invalid usage [" + bufferDataFuncs[bIt].desc + "]");

            for (var uIt = 0, uLength = usages.length; uIt < uLength; ++uIt) {
                gl.bindBuffer(targets[tIt].value, buff);

                bufferDataFuncs[bIt].run(gl, -1, checkSize, usages[uIt].value);
                equal(gl.getError(), gl.INVALID_ENUM, "bufferData(" + usages[uIt].name + ") must generate INVALID_ENUM with invalid target [" + bufferDataFuncs[bIt].desc + "]");

                gl.bufferData(targets[tIt].value, -1, usages[uIt].value);
                equal(gl.getError(), gl.INVALID_VALUE, "bufferData(" + targets[tIt].name + "," + usages[uIt].name + ") must generate INVALID_VALUE if size is negative [" + bufferDataFuncs[bIt].desc + "]");

                bufferDataFuncs[bIt].run(gl, targets[tIt].value, 0, usages[uIt].value);
                equal(gl.getError(), gl.NO_ERROR, "bufferData(" + targets[tIt].name + ", " + usages[uIt].name + ") must not generate errors if size = 0 [" + bufferDataFuncs[bIt].desc + "]");

                bufferDataFuncs[bIt].run(gl, targets[tIt].value, checkSize, usages[uIt].value);
                equal(gl.getError(), gl.NO_ERROR, "bufferData(" + targets[tIt].name + ", " + usages[uIt].name + ") must not generate errors [" + bufferDataFuncs[bIt].desc + "]");

                var usage = gl.getBufferParameter(targets[tIt].value, gl.BUFFER_USAGE);
                equal(gl.getError(), gl.NO_ERROR, "getBufferParameter(BUFFER_USAGE) must not generate errors");
                strictEqual(usage, usages[uIt].value, "getBufferParameter(BUFFER_USAGE) == " + usages[uIt].name + " after call bufferData(" + targets[tIt].name + ", " + usages[uIt].name + ") [" + bufferDataFuncs[bIt].desc + "]");

                var size = gl.getBufferParameter(targets[tIt].value, gl.BUFFER_SIZE);
                equal(gl.getError(), gl.NO_ERROR, "getBufferParameter(BUFFER_SIZE) must not generate errors");
                strictEqual(size, checkSize, "check returned value getBufferParameter(BUFFER_SIZE) after call bufferData(" + targets[tIt].name + ", " + usages[uIt].name + ") [" + bufferDataFuncs[bIt].desc + "]");

                gl.bindBuffer(targets[tIt].value, null);
                bufferDataFuncs[bIt].run(gl, targets[tIt].value, checkSize, usages[uIt].value);
                equal(gl.getError(), gl.INVALID_OPERATION, "bufferData(" + targets[tIt].name + "," + usages[uIt].name + ") must generate INVALID_OPERATION if  buffer object name zero is bound");           
            }

        }
        gl.deleteBuffer(buff);
    }
});


test("verify bufferData() data parameter", function () {
    var gl = GetCleanContext();

    var usages =
    [
        { name: "STREAM_DRAW", value: gl.STREAM_DRAW },
        { name: "STATIC_DRAW", value: gl.STATIC_DRAW },
        { name: "DYNAMIC_DRAW", value: gl.DYNAMIC_DRAW }
    ];

    var targets =
    [
        { name: "ARRAY_BUFFER", value: gl.ARRAY_BUFFER },
        { name: "ELEMENT_ARRAY_BUFFER", value: gl.ELEMENT_ARRAY_BUFFER }
    ];

    var defaultSize = 64;
    var uint16array = new Uint16Array(defaultSize);

    for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
        for (var uIt = 0, uLength = usages.length; uIt < uLength; ++uIt) {
            var buff = gl.createBuffer();
            gl.bindBuffer(targets[tIt].value, buff);

            gl.bufferData(targets[tIt].value, null, usages[tIt].value);
            equal(gl.getError(), gl.INVALID_VALUE, "bufferData(" + targets[tIt].name + "," + usages[uIt].name + ") must generate INVALID_VALUE if data is null");

            gl.bufferData(targets[tIt].value, uint16array.buffer, usages[tIt].value);
            equal(gl.getError(), gl.NO_ERROR, "bufferData(" + targets[tIt].name + "," + usages[uIt].name + ") must not generate errors [ArrayBuffer]");

            var size = gl.getBufferParameter(targets[tIt].value, gl.BUFFER_SIZE);
            equal(gl.getError(), gl.NO_ERROR, "getBufferParameter(BUFFER_SIZE) must not generate errors");
            strictEqual(size, uint16array.buffer.byteLength, "getBufferParameter(BUFFER_SIZE) == ArrayBuffer.length after call bufferData(" + targets[tIt].name + ", " + usages[uIt].name + ") [ArrayBuffer]");

            gl.bufferData(targets[tIt].value, uint16array, usages[tIt].value);
            equal(gl.getError(), gl.NO_ERROR, "bufferData(" + targets[tIt].name + "," + usages[uIt].name + ") mustnot generate error [ArrayBufferView]");

            size = gl.getBufferParameter(targets[tIt].value, gl.BUFFER_SIZE);
            equal(gl.getError(), gl.NO_ERROR, "getBufferParameter(BUFFER_SIZE) must not generate errors");
            strictEqual(size, uint16array.buffer.byteLength, "getBufferParameter(BUFFER_SIZE) == ArrayBufferView.buffer.length after call bufferData(" + targets[tIt].name + ", " + usages[uIt].name + ") [ArrayBufferView]");
        }
        gl.deleteBuffer(buff);
    }
});

test("verify bufferSubData()", function () {
    var gl = GetCleanContext();

    var targets =
    [
        { name: "ARRAY_BUFFER", value: gl.ARRAY_BUFFER },
        { name: "ELEMENT_ARRAY_BUFFER", value: gl.ELEMENT_ARRAY_BUFFER }
    ];

    var defaultSize = 64;
    var arr = new Uint8Array(defaultSize);
    var smallArr = new Uint8Array(2);

    for (var tIt = 0, tLength = targets.length; tIt < tLength; ++tIt) {
        var buff = gl.createBuffer();
        gl.bindBuffer(targets[tIt].value, buff);

        gl.bufferData(targets[tIt].value, arr, gl.STREAM_DRAW);
        equal(gl.getError(), gl.NO_ERROR, "bufferData(" + targets[tIt].name + ") must not generate errors");

        gl.bufferSubData(-1, 0, smallArr);
        equal(gl.getError(), gl.INVALID_ENUM, "bufferSubData() must generate errors with invalid target");

        gl.bufferSubData(targets[tIt].value, -1, smallArr);
        equal(gl.getError(), gl.INVALID_VALUE, "bufferSubData(" + targets[tIt].name + ") must generate INVALID_VALUE if offset is negative");

        gl.bufferSubData(targets[tIt].value, 0, new Uint8Array(0));
        equal(gl.getError(), gl.NO_ERROR, "bufferSubData(" + targets[tIt].name + ") must not generate errors if data size = 0");

        gl.bufferSubData(targets[tIt].value, 0, smallArr);
        equal(gl.getError(), gl.NO_ERROR, "bufferSubData(" + targets[tIt].name + ") must not generate errors");

        gl.bufferSubData(targets[tIt].value, defaultSize, smallArr);
        equal(gl.getError(), gl.INVALID_VALUE, "bufferSubData(" + targets[tIt].name + ") must generate INVALID_VALUE if data is written past the end of the buffer");

        gl.bindBuffer(targets[tIt].value, null);
        gl.bufferSubData(targets[tIt].value, 0, smallArr);
        equal(gl.getError(), gl.INVALID_OPERATION, "bufferSubData(" + targets[tIt].name + ") must not generate INVALID_OPERATION if  buffer object name zero is bound");           

        gl.deleteBuffer(buff);
    }
});

test("verify bufferData() & bufferSubData() js array as data parameter", function () {
    var gl = GetCleanContext();

    var buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    raises(function () {
        gl.bufferData(gl.ARRAY_BUFFER, [0, 0, 0, 1], gl.STATIC_DRAW);
    }, "bufferData() with js array as data parameter throw error");

    gl.bufferData(gl.ARRAY_BUFFER, 10, gl.STATIC_DRAW);
    raises(function () {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, [0, 0, 0, 1]);
    }, "bufferSubData() with js array as data parameter throw error");

    gl.deleteBuffer(buff);
});

test("verify isBuffer()", function () {
    var gl = GetCleanContext();

    var isBuff = gl.isBuffer(null);
    strictEqual(isBuff, false, "isBuffer() == false if buffer null");
    equal(gl.getError(), gl.NO_ERROR, "isBuffer() must not generate errors with null buffer");
    isBuff = gl.isBuffer(undefined);
    strictEqual(isBuff, false, "isBuffer() == false if buffer undefined");
    equal(gl.getError(), gl.NO_ERROR, "isBuffer() must not generate errors with undefined buffer");

    var buff = gl.createBuffer();

    isBuff = gl.isBuffer(buff);
    strictEqual(isBuff, false, "isBuffer() == false if buffer is not bound");
    equal(gl.getError(), gl.NO_ERROR, "isBuffer() must not generate errors if buffer is not bound");

    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    isBuff = gl.isBuffer(buff);
    strictEqual(isBuff, true, "isBuffer() == true with bounded buffer");
    equal(gl.getError(), gl.NO_ERROR, "isBuffer() must not generate errors");

    var buff2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff2);

    isBuff = gl.isBuffer(buff);
    strictEqual(isBuff, true, "isBuffer() == true with unbounded buffer");
    equal(gl.getError(), gl.NO_ERROR, "isBuffer() must not generate errors");

    gl.deleteBuffer(buff2);
    gl.deleteBuffer(buff);

    isBuff = gl.isBuffer(buff);
    strictEqual(isBuff, false, "isBuffer() == false with deleted buffer");
    equal(gl.getError(), gl.NO_ERROR, "isBuffer() must not generate errors if buffer is deleted");
});
