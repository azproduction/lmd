(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        rnd = '',

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    if ('\v' == 'v') {
        return; // this module should not run in older IE
    }

    module('LMD async require @ ' + ENV_NAME);

    asyncTest("require.async() module-functions", function () {
        expect(5);

        require.async('./modules/async/module_function_async.js' + rnd, function (module_function_async) {

            ok(module_function_async.some_function() === true, "should require async module-functions");
            ok(require('./modules/async/module_function_async.js' + rnd) === module_function_async, "can sync require, loaded async module-functions");
            require.async('module_function_fd2', function (fd) {
                ok(fd() === true, "can require async in-package modules");
                start();
            });
        });
    });

    asyncTest("require.async() module-strings", function () {
        expect(3);

        require.async('./modules/async/module_as_string_async.html' + rnd, function (module_as_string_async) {
            ok(typeof module_as_string_async === "string", "should require async module-strings");
            ok(module_as_string_async === '<div class="b-template">${pewpew}</div>', "content ok?");
            ok(require('./modules/async/module_as_string_async.html' + rnd) === module_as_string_async, "can sync require, loaded async module-strings");
            start();
        });
    });

    asyncTest("require.async() module-objects", function () {
        expect(2);

        require.async('./modules/async/module_as_json_async.json' + rnd, function (module_as_json_async) {
            ok(typeof module_as_json_async === "object", "should require async module-object");
            ok(require('./modules/async/module_as_json_async.json' + rnd) === module_as_json_async, "can sync require, loaded async module-object");
            start();
        });
    });

    asyncTest("require.async() chain calls", function () {
        expect(3);

        var requireReturned = require
            .async('./modules/async/module_as_json_async.json' + rnd)
            .async('./modules/async/module_as_json_async.json' + rnd, function () {
                ok(true, 'Callback is optional');
                ok(true, 'WeCan use chain calls');

                start();
            });

        ok(requireReturned === require, "require.async() must return require");
    });

    asyncTest("require.async() errors", function () {
        expect(2);

        require.async('./modules/async/undefined_module.js' + rnd, function (undefined_module) {
            ok(typeof undefined_module === "undefined", "should return undefined on error");
            require.async('./modules/async/undefined_module.js' + rnd, function (undefined_module_2) {
                ok(typeof undefined_module_2 === "undefined", "should not cache errorous modules");
                start();
            });
        });
    });
})