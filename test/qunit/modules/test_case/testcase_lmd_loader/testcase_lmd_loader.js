(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        document = require('document'),
        raises = require('raises'),

        rnd = '?' + Math.random(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    function getComputedStyle(element, rule) {
    	if(document.defaultView && document.defaultView.getComputedStyle){
    		return document.defaultView.getComputedStyle(element, "").getPropertyValue(rule);
    	}

        rule = rule.replace(/\-(\w)/g, function (strMatch, p1){
            return p1.toUpperCase();
        });
        return element.currentStyle[rule];
    }

    module('LMD loader @ ' + ENV_NAME);

    asyncTest("require.js()", function () {
        expect(6);

        require.js('./modules/loader/non_lmd_module.js' + rnd, function (script_tag) {
            ok(typeof script_tag === "object" &&
               script_tag.nodeName.toUpperCase() === "SCRIPT", "should return script tag on success");

            ok(require('some_function')() === true, "we can grab content of the loaded script");

            ok(require('./modules/loader/non_lmd_module.js' + rnd) === script_tag, "should cache script tag on success");

            // some external
            require.js('http://yandex.ru/jquery.js' + rnd, function (script_tag) {
                ok(typeof script_tag === "undefined", "should return undefined on error in 3 seconds");
                ok(typeof require('http://yandex.ru/jquery.js' + rnd) === "undefined", "should not cache errorous modules");
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

    asyncTest("require.js() race calls", function () {
        expect(1);
        var result;

        var check_result = function (scriptTag) {
            if (typeof result === "undefined") {
                result = scriptTag;
            } else {
                ok(result === scriptTag, "Must perform one call. Results must be the same");
                start();
            }
        };

        require.js('./modules/loader_race/non_lmd_module.js' + rnd, check_result);
        require.js('./modules/loader_race/non_lmd_module.js' + rnd, check_result);
    });

    asyncTest("require.css()", function () {
        expect(6);

        require.css('./modules/loader/some_css.css' + rnd, function (link_tag) {
            ok(typeof link_tag === "object" &&
                link_tag.nodeName.toUpperCase() === "LINK", "should return link tag on success");

            ok(getComputedStyle(document.getElementById('qunit-fixture'), 'visibility') === "hidden", "css should be applied");

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

    asyncTest("require.css() race calls", function () {
        expect(1);
        var result;

        var check_result = function (linkTag) {
            if (typeof result === "undefined") {
                result = linkTag;
            } else {
                ok(result === linkTag, "Must perform one call. Results must be the same");
                start();
            }
        };

        require.css('./modules/loader_race/some_css.css' + rnd, check_result);
        require.css('./modules/loader_race/some_css.css' + rnd, check_result);
    });

    asyncTest("require.css() shortcut", function () {
        expect(4);

        require.css('sk_css_css', function (link_tag) {
            ok(typeof link_tag === "object" &&
                link_tag.nodeName.toUpperCase() === "LINK", "should return link tag on success");

            ok(require('sk_css_css') === link_tag, "require should return the same result");
            require.css('sk_css_css', function (link_tag2) {
                ok(link_tag2 === link_tag, 'should load once');
                ok(require('sk_css_css') === require('/modules/shortcuts/css.css'), "should be defined using path-to-module");
                start();
            })
        });
    });

    asyncTest("require.js() shortcut", function () {
        expect(5);

        require.js('sk_js_js', function (script_tag) {
            ok(typeof script_tag === "object" &&
               script_tag.nodeName.toUpperCase() === "SCRIPT", "should return script tag on success");

            ok(require('sk_js_js') === script_tag, "require should return the same result");
            require.js('sk_js_js', function (script_tag2) {
                ok(script_tag2 === script_tag, 'should load once');
                ok(require('sk_js_js') === require('/modules/shortcuts/js.js'), "should be defined using path-to-module");
                ok(typeof require('shortcuts_js') === "function", 'Should create a global function shortcuts_js as in module function');
                start();
            })
        });
    });
})