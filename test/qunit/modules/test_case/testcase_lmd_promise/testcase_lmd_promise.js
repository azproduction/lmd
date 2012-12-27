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

        ENV_NAME = 'DOM:Promise';

    require('Q');

    module('LMD async require @ ' + ENV_NAME);

    asyncTest("require.async().then() should return promise not require()", function () {
        expect(1);

        var promise = require.async('./modules/async/module_as_json_async.json' + rnd);

        ok(typeof promise === "object" && typeof promise.then === "function", "must return promise");
        start();
    });

    asyncTest("require.async().then() module-functions", function () {
        expect(5);

        require.async('./modules/async/module_function_async.js' + rnd)
            .then(function (module_function_async) {

                ok(module_function_async.some_function() === true, "should require async module-functions");
                ok(require('./modules/async/module_function_async.js' + rnd) === module_function_async, "can sync require, loaded async module-functions");

                return require.async('module_function_fd2');
            })
            .then(function (fd) {
                ok(fd() === true, "can require async in-package modules");

                start();
            });
    });

    asyncTest("require.async().then() module-strings", function () {
        expect(3);

        require.async('./modules/async/module_as_string_async.html' + rnd).then(function (module_as_string_async) {
            ok(typeof module_as_string_async === "string", "should require async module-strings");
            ok(module_as_string_async === '<div class="b-template">${pewpew}</div>', "content ok?");
            ok(require('./modules/async/module_as_string_async.html' + rnd) === module_as_string_async, "can sync require, loaded async module-strings");
            start();
        });
    });

    asyncTest("require.async().then() module-objects", function () {
        expect(2);

        require.async('./modules/async/module_as_json_async.json' + rnd).then(function (module_as_json_async) {
            ok(typeof module_as_json_async === "object", "should require async module-object");
            ok(require('./modules/async/module_as_json_async.json' + rnd) === module_as_json_async, "can sync require, loaded async module-object");
            start();
        });
    });

    asyncTest("require.async().then():json race calls", function () {
        expect(1);
        var result;

        var check_result = function (module_as_json_async) {
            if (typeof result === "undefined") {
                result = module_as_json_async;
            } else {
                ok(result === module_as_json_async, "Must perform one call. Results must be the same");
                start();
            }
        };

        require.async('./modules/async_race/module_as_json_async.json' + rnd).then(check_result);
        require.async('./modules/async_race/module_as_json_async.json' + rnd).then(check_result);
    });

    asyncTest("require.async().then():js race calls", function () {
        expect(2); // 1 +1 in module ok()
        var result;

        var check_result = function (module_as_json_async) {
            if (typeof result === "undefined") {
                result = module_as_json_async;
            } else {
                ok(result === module_as_json_async, "Must perform one call. Results must be the same");
                start();
            }
        };

        require.async('./modules/async_race/module_function_async.js' + rnd).then(check_result);
        require.async('./modules/async_race/module_function_async.js' + rnd).then(check_result);
    });

    asyncTest("require.async().then():string race calls", function () {
        expect(1);
        var result;

        var check_result = function (module_as_json_async) {
            if (typeof result === "undefined") {
                result = module_as_json_async;
            } else {
                ok(result === module_as_json_async, "Must perform one call. Results must be the same");
                start();
            }
        };

        require.async('./modules/async_race/module_as_string_async.html' + rnd).then(check_result);
        require.async('./modules/async_race/module_as_string_async.html' + rnd).then(check_result);
    });

    asyncTest("require.async().then() errors", function () {
        expect(2);

        require.async('./modules/async/undefined_module.js' + rnd).then(function () {
            ok(false, "Should not be fulfilled");
        }, function () {
            ok(true, "Promise should be rejected");

            require.async('./modules/async/undefined_module.js' + rnd).then(function () {
                ok(false, "Should not be fulfilled");
            }, function () {
                ok(true, "Promise should be rejected: should not cache errorous modules");
                start();
            });
        });
    });

    asyncTest("require.async().then() parallel loading", function () {
        expect(2);

        require.async(['./modules/parallel/1.js' + rnd,
                       './modules/parallel/2.js' + rnd,
                       './modules/parallel/3.js' + rnd])
        .then(function (modules) {
            var module1 = modules[0],
                module2 = modules[1],
                module3 = modules[2];

            ok(true, "Modules executes as they are loaded - in load order");
            ok(module1.file === "1.js" && module2.file === "2.js" && module3.file === "3.js",
              "Modules should be callbacked in list order");
            start();
        });
    });

    asyncTest("require.async().then() shortcuts", function () {
        expect(7);

        ok(typeof require('sk_async_html') === "undefined", 'require should return undefined if shortcuts not initialized by loaders');
        ok(typeof require('sk_async_html') === "undefined", 'require should return undefined ... always');

        require.async('sk_async_json').then(function (json) {
            ok(json.ok === true, 'should require shortcuts: json');
            ok(require('sk_async_json') === json, 'if shortcut is defined require should return the same code');
            ok(require('/modules/shortcuts/async.json') === json, 'Module should be inited using shortcut content');

            return require.async('sk_async_html')
        })
        .then(function (html) {
            ok(html === 'ok', 'should require shortcuts: html');

            return require.async('sk_async_js');
        })
        .then(function (js) {
            ok(js() === 'ok', 'should require shortcuts: js');

            start();
        });
    });

    asyncTest("require.async().then() plain", function () {
        expect(3);

        require.async('./modules/async/module_plain_function_async.js' + rnd).then(function (module_plain_function_async) {
            ok(module_plain_function_async.some_function() === true, "should require async module-functions");
            ok(require('./modules/async/module_plain_function_async.js' + rnd) === module_plain_function_async, "can async require plain modules, loaded async module-functions");

            start();
        });
    });

//--

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

    asyncTest("require.js().then()", function () {
        expect(6);

        require.js('./modules/loader/non_lmd_module.js' + rnd).then(function (script_tag) {
            ok(typeof script_tag === "object" &&
               script_tag.nodeName.toUpperCase() === "SCRIPT", "should return script tag on success");

            ok(require('some_function')() === true, "we can grab content of the loaded script");

            ok(require('./modules/loader/non_lmd_module.js' + rnd) === script_tag, "should cache script tag on success");

            // some external
            return require.js('http://yandex.ru/jquery.js' + rnd);
        })
        .then(function () {
            ok(false, "Should not be resolved");
        }, function () {
            ok(true, "Should be rejected");
            ok(typeof require('http://yandex.ru/jquery.js' + rnd) === "undefined", "should not cache errorous modules");

            require.js('module_as_string').then(function (module_as_string) {
                require.async('module_as_string').then(function (module_as_string_expected) {
                    ok(module_as_string === module_as_string_expected, 'require.js() acts like require.async() if in-package/declared module passed');
                    start();
                });
            });
        });
    });

    asyncTest("require.js().then() JSON callback and chain calls", function () {
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

        var promise = require.js('./modules/loader/non_lmd_module.jsonp.js' + rnd);

        ok(typeof promise === "object" && typeof promise.then === "function", "must return promise");
    });

    asyncTest("require.js().then() race calls", function () {
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

        require.js('./modules/loader_race/non_lmd_module.js' + rnd).then(check_result, check_result);
        require.js('./modules/loader_race/non_lmd_module.js' + rnd).then(check_result, check_result);
    });

    asyncTest("require.js().then() shortcut", function () {
        expect(5);

        require.js('sk_js_js').then(function (script_tag) {
            ok(typeof script_tag === "object" &&
               script_tag.nodeName.toUpperCase() === "SCRIPT", "should return script tag on success");

            ok(require('sk_js_js') === script_tag, "require should return the same result");
            require.js('sk_js_js').then(function (script_tag2) {
                ok(script_tag2 === script_tag, 'should load once');
                ok(require('sk_js_js') === require('/modules/shortcuts/js.js'), "should be defined using path-to-module");
                ok(typeof require('shortcuts_js') === "function", 'Should create a global function shortcuts_js as in module function');
                start();
            })
        });
    });

// -- CSS

    asyncTest("require.css().then()", function () {
        expect(6);

        require.css('./modules/loader/some_css.css' + rnd).then(function (link_tag) {
            ok(typeof link_tag === "object" &&
                link_tag.nodeName.toUpperCase() === "LINK", "should return link tag on success");

            ok(getComputedStyle(document.getElementById('qunit-fixture'), 'visibility') === "hidden", "css should be applied");

            ok(require('./modules/loader/some_css.css' + rnd) === link_tag, "should cache link tag on success");

            return require.css('./modules/loader/some_css_404.css' + rnd);
        }).then(function () {
            ok(false, "promise should no be resolved");
        }, function () {
            ok(true, "promise should be rejected");
            ok(typeof require('./modules/loader/some_css_404.css' + rnd) === "undefined", "should not cache errorous modules");
            require.css('module_as_string').then(function (module_as_string) {
                require.async('module_as_string').then(function (module_as_string_expected) {
                    ok(module_as_string === module_as_string_expected, 'require.css() acts like require.async() if in-package/declared module passed');
                    start();
                });
            });
        });
    });

    asyncTest("require.css().then() CSS loader without callback", function () {
        expect(1);

        var promise = require.css('./modules/loader/some_css_callbackless.css' + rnd);
        ok(typeof promise === "object" && typeof promise.then === "function", "must return promise");

        start();
    });

    asyncTest("require.css().then() race calls", function () {
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

        require.css('./modules/loader_race/some_css.css' + rnd).then(check_result, check_result);
        require.css('./modules/loader_race/some_css.css' + rnd).then(check_result, check_result);
    });

    asyncTest("require.css().then() shortcut", function () {
        expect(4);

        require.css('sk_css_css').then(function (link_tag) {
            ok(typeof link_tag === "object" &&
                link_tag.nodeName.toUpperCase() === "LINK", "should return link tag on success");

            ok(require('sk_css_css') === link_tag, "require should return the same result");
            require.css('sk_css_css').then(function (link_tag2) {
                ok(link_tag2 === link_tag, 'should load once');
                ok(require('sk_css_css') === require('/modules/shortcuts/css.css'), "should be defined using path-to-module");
                start();
            })
        });
    });

// -- image

    asyncTest("require.image().then()", function () {
        expect(5);

        require.image('./modules/loader/image.gif' + rnd).then(function (img_tag) {
            ok(typeof img_tag === "object" &&
                img_tag.nodeName.toUpperCase() === "IMG", "should return img tag on success");

            ok(require('./modules/loader/image.gif' + rnd) === img_tag, "should cache img tag on success");

            return require.image('./modules/loader/image_404.gif' + rnd)
        }).then(function () {
            ok(false, "promise should no be resolved");
        }, function () {
            ok(true, "promise should be rejected");

            ok(typeof require('./modules/loader/image_404.gif' + rnd) === "undefined", "should not cache errorous modules");
            require.image('module_as_string').then(function (module_as_string) {
                require.async('module_as_string').then(function (module_as_string_expected) {
                    ok(module_as_string === module_as_string_expected, 'require.image() acts like require.async() if in-package/declared module passed');
                    start();
                });
            });
        });
    });

    asyncTest("require.image().then() image loader without callback", function () {
        expect(1);

        var promise = require.image('./modules/loader/image_callbackless.gif' + rnd);

        ok(typeof promise === "object" && typeof promise.then === "function", "must return promise");
        start();
    });

    asyncTest("require.image().then() race calls", function () {
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

        require.image('./modules/loader_race/image.gif' + rnd).then(check_result, check_result);
        require.image('./modules/loader_race/image.gif' + rnd).then(check_result, check_result);
    });

    asyncTest("require.image().then() shortcut", function () {
        expect(4);

        require.image('sk_image_image').then(function (img_tag) {
            ok(typeof img_tag === "object" &&
                img_tag.nodeName.toUpperCase() === "IMG", "should return img tag on success");

            ok(require('sk_image_image') === img_tag, "require should return the same result");
            require.image('sk_image_image').then(function (img_tag2) {
                ok(img_tag2 === img_tag, 'should load once');
                ok(require('sk_image_image') === require('/modules/shortcuts/image.gif'), "should be defined using path-to-module");
                start();
            })
        });
    });
});