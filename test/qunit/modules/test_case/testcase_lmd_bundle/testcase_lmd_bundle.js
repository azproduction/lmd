(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        rnd = '?' + Math.random(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    if (ENV_NAME !== 'DOM') {
        return;
    }

    module('LMD bundle @ ' + ENV_NAME);

/*
        "test-bundle-test-mix": "@/out/test-mix-bundle-test.lmd.js",
        "test-bundle-test-with-main": "@/out/test-bundle-test-with-main.lmd.js",
        "test-bundle-test-simultaneous-1": "@/out/test-bundle-test-simultaneous-1.lmd.js",
        "test-bundle-test-simultaneous-2": "@/out/test-bundle-test-simultaneous-2.lmd.js",
        "test-bundle-test-exists-1": "@/out/test-bundle-test-exists-1.lmd.js",
        "test-bundle-test-exists-2": "@/out/test-bundle-test-exists-2.lmd.js"
*/

    asyncTest("require.bundle() should load and mix modules from bundle with local modules", function () {
        expect(3);
        require.bundle('test-bundle-test-mix', function () {
            ok(typeof require('bundle-test-mix_js') === 'object', 'Should mix modules');
            ok(typeof require('bundle-test-mix_html') === 'string', 'Should mix modules');
            ok(typeof require('bundle-test-mix_json') === 'object', 'Should mix modules');
            start();
        });
    });

    asyncTest("require.bundle() should not load bundle twice", function () {
        expect(1);

        require.bundle('test-bundle-test-mix', function (script1) {
            require.bundle('test-bundle-test-mix', function (script2) {
                ok(script1 === script2, 'Returns script tag');
                start();
            });
        });
    });

    asyncTest("require.bundle() can executes main module from bundle", function () {
        expect(1);

        require.bundle('test-bundle-test-with-main', function () {
            ok(window._global_variable_from_bundle_main === true, 'Main should expose global variable');
            start();
        });
    });

    asyncTest("require.bundle() can load multiply bundles simultaneously", function () {
        expect(2);

        var counter = 2;
        function complete() {
            counter--;
            if (counter === 0) {
                ok(typeof require('bundle-test-simultaneous-1_js') === 'object', 'Should mix modules');
                ok(typeof require('bundle-test-simultaneous-2_js') === 'object', 'Should mix modules');
                start();
            }
        }

        require.bundle('test-bundle-test-simultaneous-1', complete);
        require.bundle('test-bundle-test-simultaneous-2', complete);
    });

    asyncTest("require.bundle() modules from bundle can not overwrite existed modules with the same name", function () {
        expect(1);

        require.bundle('test-bundle-test-exists-1', function () {
            var expected = require('bundle-test-exists_js');
            require.bundle('test-bundle-test-exists-2', function () {
                ok(expected === require('bundle-test-exists_js'), 'Should be the same instance');
                start();
            });
        });
    });

    asyncTest("require.bundle() returns undefined in callback if it fails to load bundle", function () {
        expect(1);

        require.bundle('test-bundle-test-not-exists', function (result) {
            ok(typeof result === 'undefined', 'Should return undefined');
            start();
        });
    });

});