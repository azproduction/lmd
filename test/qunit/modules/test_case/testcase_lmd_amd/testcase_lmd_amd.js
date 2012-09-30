(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    module('LMD AMD module adaptor @ ' + ENV_NAME);

    test("object and strings", function () {
        ok(false);
    });

    test("depends", function () {
        ok(false);
    });

    test("no depends", function () {
        ok(false);
    });

    test("module name", function () {
        ok(false);
    });

    test("multi define", function () {
        ok(false);
    });

    test("require LMD module from AMD", function () {
        ok(false);
    });

});