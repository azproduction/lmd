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

    module('LMD async require @ ' + ENV_NAME);

    asyncTest("require.async() module-functions", function () {
        expect(6);

        require.async('./modules/async/module_function_async.js' + rnd, function (module_function_async) {

            ok(module_function_async.some_function() === true, "should require async module-functions");
            ok(require('./modules/async/module_function_async.js' + rnd) === module_function_async, "can sync require, loaded async module-functions");
            require.async('module_function_fd2', function (fd) {
                ok(fd() === true, "can require async in-package modules");

                // stats
                ok(!!require.stats('module_function_fd2'), "should count stats: async modules");
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

        ok(requireReturned === require, "must return require");
    });

    asyncTest("require.async():json race calls", function () {
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

        require.async('./modules/async_race/module_as_json_async.json' + rnd, check_result);
        require.async('./modules/async_race/module_as_json_async.json' + rnd, check_result);
    });

    asyncTest("require.async():js race calls", function () {
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

        require.async('./modules/async_race/module_function_async.js' + rnd, check_result);
        require.async('./modules/async_race/module_function_async.js' + rnd, check_result);
    });

    asyncTest("require.async():string race calls", function () {
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

        require.async('./modules/async_race/module_as_string_async.html' + rnd, check_result);
        require.async('./modules/async_race/module_as_string_async.html' + rnd, check_result);
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

    asyncTest("require.async() parallel loading", function () {
        expect(2);

        require.async(['./modules/parallel/1.js' + rnd,
                       './modules/parallel/2.js' + rnd,
                       './modules/parallel/3.js' + rnd],
        function (module1, module2, module3) {
            ok(true, "Modules executes as they are loaded - in load order");
            ok(module1.file === "1.js" && module2.file === "2.js" && module3.file === "3.js",
              "Modules should be callbacked in list order");
            start();
        });
    });

    asyncTest("require.async() shortcuts", function () {
        expect(10);

        ok(typeof require('sk_async_html') === "undefined", 'require should return undefined if shortcuts not initialized by loaders');
        ok(typeof require('sk_async_html') === "undefined", 'require should return undefined ... always');

        require.async('sk_async_json', function (json) {
            ok(json.ok === true, 'should require shortcuts: json');
            ok(require('sk_async_json') === json, 'if shortcut is defined require should return the same code');
            ok(require('/modules/shortcuts/async.json') === json, 'Module should be inited using shortcut content');
            require.async('sk_async_html', function (html) {
                ok(html === 'ok', 'should require shortcuts: html');
                require.async('sk_async_js', function (js) {
                    ok(js() === 'ok', 'should require shortcuts: js');

                    // stats
                    ok(require.stats('sk_async_js') === require.stats('/modules/shortcuts/async.js'), "shortcut should point to the same object as module");
                    ok(!!require.stats('/modules/shortcuts/async.js'), "should count stats of real file");
                    ok(require.stats('/modules/shortcuts/async.js').shortcuts[0] === 'sk_async_js', "should pass shourtcuts names");
                    start();
                });
            });
        });
    });

    asyncTest("require.async() plain", function () {
        expect(3);

        require.async('./modules/async/module_plain_function_async.js' + rnd, function (module_plain_function_async) {
            ok(module_plain_function_async.some_function() === true, "should require async module-functions");
            ok(require('./modules/async/module_plain_function_async.js' + rnd) === module_plain_function_async, "can async require plain modules, loaded async module-functions");

            start();
        });
    });
})