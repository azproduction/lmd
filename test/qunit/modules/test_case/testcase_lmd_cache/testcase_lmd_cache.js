(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),
        ls = require('localStorage'),

        rnd = '?' + Math.random(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM',

        PACKAGE_VERSION = 'latest';

    if (!ls) {
        return;
    }

    module('LMD cache @ ' + ENV_NAME);

    asyncTest("localStorage cache + cache_async test", function () {
        expect(11);

        ok(typeof ls['lmd'] === "string", 'LMD Should create cache');

        var lmd = JSON.parse(ls['lmd']);

        ok(typeof lmd.modules === 'object', 'Should save modules');
        ok(typeof lmd.main === 'string', 'Should save main function as string');
        ok(typeof lmd.lmd === 'string', 'Should save lmd source as string');
        ok(typeof lmd.options === 'object', 'Should save options');
        ok(typeof lmd.modules_options === 'object', 'Should save modules options');
        ok(lmd.options.version === PACKAGE_VERSION, 'Should save version');

        require.async('./modules/async/module_function_async.js', function (module_function_async) {
            var key = 'lmd:' + PACKAGE_VERSION + ':' + './modules/async/module_function_async.js';

            ok(module_function_async.some_function() === true, "should require async module-functions");

            ok(typeof ls[key] === "string", 'LMD Should cache async requests');

            ls.removeItem(key);

            require.async('./modules/async/module_function_async.js');

            ok(!ls[key], 'LMD Should not recreate cache it was manually deleted key=' + key);

            start();
        });
    });
})