(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        rnd = '?' + +new Date(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    module('LMD loader @ ' + ENV_NAME);

    asyncTest("require.js()", function () {
        expect(6);

        require.js('./modules/loader/non_lmd_module.js' + rnd, function (script_tag) {
            ok(typeof script_tag === "object" &&
               script_tag.nodeName.toUpperCase() === "SCRIPT", "should return script tag on success");

            ok(require('some_function')() === true, "we can grab content of the loaded script");

            ok(require('./modules/loader/non_lmd_module.js' + rnd) === script_tag, "should cache script tag on success");

            // some external
            require.js('http://8.8.8.8:8/jquery.js' + rnd, function (script_tag) {
                ok(typeof script_tag === "undefined", "should return undefined on error in 3 seconds");
                ok(typeof require('http://8.8.8.8:8/jquery.js' + rnd) === "undefined", "should not cache errorous modules");
                require.js('module_as_string', function (module_as_string) {
                    require.async('module_as_string', function (module_as_string_expected) {
                        ok(module_as_string === module_as_string_expected, 'require.js() acts like require.async() if in-package/declared module passed');
                        start();
                    });
                });
            });
        });
    });

    asyncTest("require.js() JSON callback and chain calls", function () {
        expect(2);

        var id = require('setTimeout')(function () {
            ok(false, 'JSONP call fails');
            start();
        }, 3000);

        require('window').someJsonHandler = function (result) {
            ok(result.ok, 'JSON called');
            require('window').someJsonHandler = null;
            require('clearTimeout')(id);
            start();
        };

        var requireReturned = require.js('./modules/loader/non_lmd_module.jsonp.js' + rnd);

        ok(requireReturned === require, "require.js() must return require");
    });

    asyncTest("require.css()", function () {
        expect(6);

        require.css('./modules/loader/some_css.css' + rnd, function (link_tag) {
            ok(typeof link_tag === "object" &&
                link_tag.nodeName.toUpperCase() === "LINK", "should return link tag on success");

            ok($('#qunit-fixture').css('visibility') === "hidden", "css should be applied");

            ok(require('./modules/loader/some_css.css' + rnd) === link_tag, "should cache link tag on success");

            require.css('./modules/loader/some_css_404.css' + rnd, function (link_tag) {
                ok(typeof link_tag === "undefined", "should return undefined on error in 3 seconds");
                ok(typeof require('./modules/loader/some_css_404.css' + rnd) === "undefined", "should not cache errorous modules");
                require.css('module_as_string', function (module_as_string) {
                    require.async('module_as_string', function (module_as_string_expected) {
                        ok(module_as_string === module_as_string_expected, 'require.css() acts like require.async() if in-package/declared module passed');
                        start();
                    });
                });
            });
        });
    });

    asyncTest("require.css() CSS loader without callback", function () {
        expect(1);

        var requireReturned = require
            .css('./modules/loader/some_css_callbackless.css' + rnd)
            .css('./modules/loader/some_css_callbackless.css' + rnd + 1);

        ok(requireReturned === require, "require.css() must return require");
        start();
    });
})