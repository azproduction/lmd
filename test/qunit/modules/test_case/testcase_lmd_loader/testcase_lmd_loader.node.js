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

    module('LMD loader @ ' + ENV_NAME);

    asyncTest("require.js()", function () {
        expect(6);

        require.js('./modules/loader/non_lmd_module.js', function (exports) {
            ok(typeof exports === "object", "should act like node.js require");

            ok(exports.some_function() === true, "we can use exported script");

            ok(require('./modules/loader/non_lmd_module.js') === exports, "should cache object on success");

            // some external
            require.js('http://yandex.ru/jquery.js', function (script_tag) {
                ok(typeof script_tag === "undefined", "should return undefined on error in 3 seconds");
                ok(typeof require('http://yandex.ru/jquery.js') === "undefined", "should not cache errorous modules");
                require.js('module_as_string', function (module_as_string) {
                    require.async('module_as_string', function (module_as_string_expected) {
                        ok(module_as_string === module_as_string_expected, 'require.js() acts like require.async() if in-package/declared module passed');
                        start();
                    });
                });
            });
        });
    });

    asyncTest("require.css()", function () {
        expect(3);

        require.css('./modules/loader/some_css.css', function (link_tag) {
            ok(typeof link_tag === "undefined", "should act like require and return undefined if no module");
            ok(typeof require('./modules/loader/some_css_404.css') === "undefined", "should not cache errorous modules");
            require.css('module_as_string', function (module_as_string) {
                require.async('module_as_string', function (module_as_string_expected) {
                    ok(module_as_string === module_as_string_expected, 'require.css() acts like require.async() if in-package/declared module passed');
                    start();
                });
            });
        });
    });
})