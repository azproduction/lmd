(function (global, main, modules, sandboxed_modules) {
    var initialized_modules = {},
        global_eval = global.eval,
        global_noop = function () {},
        global_document = global.document,
        local_undefined,
        /**
         * @param {String} moduleName module name or path to file
         * @param {*}      module module content
         *
         * @returns {*}
         */
        register_module = function (moduleName, module) {
            // Predefine in case of recursive require
            var output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                module = global[moduleName];
            } else if (typeof module === "function") {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                module = module(sandboxed_modules[moduleName] ? local_undefined : require, output.exports, output) || output.exports;
            }

            return modules[moduleName] = module;
        },
        /**
         * @param {String} moduleName module name or path to file
         *
         * @returns {*}
         */
        require = function (moduleName) {
            var module = modules[moduleName];

            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }
            
            // Do not init shortcut as module!
            // return shortcut as is
            if (is_shortcut(moduleName, module)) {
                // return as is w/ checking globals
                return modules[module.replace('@', '')];
            }
            
            // Lazy LMD module not a string
            if (typeof module === "string" && module.indexOf('(function(') === 0) {
                module = '(function(){return' + module + '})()';
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        
        
        race_callbacks = {},
        /**
         * Creates race.
         *
         * @param {String}   name     race name
         * @param {Function} callback callback
         */
        create_race = function (name, callback) {
            if (!race_callbacks[name]) {
                // create race
                race_callbacks[name] = [];
            }
            race_callbacks[name].push(callback);

            return function (result) {
                var callbacks = race_callbacks[name];
                while(callbacks && callbacks.length) {
                    callbacks.shift()(result);
                }
                // reset race
                race_callbacks[name] = false;
            }
        },
        
        
        output = {exports: {}};

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

function is_shortcut(moduleName, moduleContent) {
    return !initialized_modules[moduleName] &&
           typeof moduleContent === "string" &&
           moduleContent.charAt(0) == '@';
}
/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

function parallel(method, items, callback) {
    var i = 0,
        j = 0,
        c = items.length,
        results = [];

    var readyFactory = function (index) {
        return function (data) {
            // keep the order
            results[index] = data;
            j++;
            if (j >= c) {
                callback.apply(global, results);
            }
        }
    };

    for (; i < c; i++) {
        method(items[i], readyFactory(i));
    }
}

/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name global_noop
 * @name register_module
 * @name create_race
 * @name race_callbacks
 * @name cache_async
 * @name parallel
 */

    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    require.async = function (moduleName, callback) {
        callback = callback || global_noop;

        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.async, moduleName, callback);
            return require;
        }

        var module = modules[moduleName],
            XMLHttpRequestConstructor = global.XMLHttpRequest || global.ActiveXObject;

        
        // Its an shortcut
        if (is_shortcut(moduleName, module)) {
            // rewrite module name
            moduleName = module.replace('@', '');
            module = modules[moduleName];
        }
        

        // If module exists or its a node.js env
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }


        callback = create_race(moduleName, callback);
        // if already called
        if (race_callbacks[moduleName].length > 1) {
            return require;
        }





        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    module = xhr.responseText;
                    if ((/script$|json$/).test(xhr.getResponseHeader('content-type'))) {
                        module = '(function(){return' + module + '})()';
                        module = global_eval('(' + module + ')');
                    }
                    
                    // 4. Then callback it
                    callback(register_module(moduleName, module));
                } else {
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return require;

    };
/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

    /**
     * Loads any JavaScript file a non-LMD module
     *
     * @param {String|Array} moduleName path to file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLScriptElement on success
     */
    require.js = function (moduleName, callback) {
        callback = callback || global_noop;

        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.js, moduleName, callback);
            return require;
        }

        var module = modules[moduleName],
            readyState = 'readyState',
            isNotLoaded = 1,
            head;

        
        // Its an shortcut
        if (is_shortcut(moduleName, module)) {
            // rewrite module name
            moduleName = module.replace('@', '');
            module = modules[moduleName];
        }
        

        // If module exists
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }


        callback = create_race(moduleName, callback);
        // if already called
        if (race_callbacks[moduleName].length > 1) {
            return require;
        }


        // by default return undefined
        if (!global_document) {

            // if no global try to require
            // node or worker
            try {
                // call importScripts or require
                // any of them can throw error if file not found or transmission error
                module = register_module(moduleName, (global.importScripts || global.require)(moduleName) || {});
            } catch (e) {
                // error -> default behaviour
            }

            callback(module);
            return require;
        }


//#JSCOVERAGE_IF 0

        var script = global_document.createElement("script");
        global.setTimeout(script.onreadystatechange = script.onload = function (e) {
            e = e || global.event;
            if (isNotLoaded &&
                (!e ||
                !script[readyState] ||
                script[readyState] == "loaded" ||
                script[readyState] == "complete")) {

                isNotLoaded = 0;
                // register or cleanup
                callback(e ? register_module(moduleName, script) : head.removeChild(script) && local_undefined); // e === undefined if error
            }
        }, 3000, 0);

        script.src = moduleName;
        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);

        return require;

//#JSCOVERAGE_ENDIF

    };
/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

    /**
     * Loads any CSS file
     *
     * Inspired by yepnope.css.js
     *
     * @see https://github.com/SlexAxton/yepnope.js/blob/master/plugins/yepnope.css.js
     *
     * @param {String|Array} moduleName path to css file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLLinkElement on success
     */
    require.css = function (moduleName, callback) {
        callback = callback || global_noop;

        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.css, moduleName, callback);
            return require;
        }

        var module = modules[moduleName],
            isNotLoaded = 1,
            head;

        
        // Its an shortcut
        if (is_shortcut(moduleName, module)) {
            // rewrite module name
            moduleName = module.replace('@', '');
            module = modules[moduleName];
        }
        

        // If module exists or its a worker or node.js environment
        if (module || !global_document) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }


        callback = create_race(moduleName, callback);
        // if already called
        if (race_callbacks[moduleName].length > 1) {
            return require;
        }



//#JSCOVERAGE_IF 0


        // Create stylesheet link
        var link = global_document.createElement("link"),
            id = +new global.Date,
            onload = function (e) {
                if (isNotLoaded) {
                    isNotLoaded = 0;
                    // register or cleanup
                    link.removeAttribute('id');
                    callback(e ? register_module(moduleName, link) : head.removeChild(link) && local_undefined); // e === undefined if error
                }
            };

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        global.setTimeout(onload, 3000, 0);

        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        (function poll() {
            if (isNotLoaded) {
                try {
                    var sheets = global_document.styleSheets;
                    for (var j = 0, k = sheets.length; j < k; j++) {
                        if((sheets[j].ownerNode || sheets[j].owningElement).id == id &&
                           (sheets[j].cssRules || sheets[j].rules).length) {
//#JSCOVERAGE_IF 0
                            return onload(1);
//#JSCOVERAGE_ENDIF
                        }
                    }
                    // if we get here, its not in document.styleSheets (we never saw the ID)
                    throw 1;
                } catch(e) {
                    // Keep polling
                    global.setTimeout(poll, 90);
                }
            }
        }());

        return require;

//#JSCOVERAGE_ENDIF

    };

    main(require, output.exports, output);
})(worker_global_environment,(function (require) {
    // common for BOM Node and Worker Envs
    require('testcase_lmd_basic_features');

    // common for BOM and Worker Envs, Node uses testcase_lmd_async_require.node.js
    require('testcase_lmd_async_require');

    // BOM uses testcase_lmd_loader.js,
    // Worker - lmd_loader.worker.js
    // Node - testcase_lmd_loader._node.js
    require('testcase_lmd_loader');

    // Cache
    require('testcase_lmd_cache');
}),{
"module_as_json": {
    "ok": true
},
"module_as_string": "<div class=\"b-template\">${pewpew}</div>",
"module_function_fd": function fd(require, exports, module) {
    require('ok')(true, "fd should be called once");

    return function () {
        return true;
    }
},
"module_function_fd2": function fd2(require, exports, module) {
    require('ok')(true, "fd2 should be called once");

    return function () {
        return true;
    }
},
"module_function_fd_sandboxed": function fd(require, exports, module) {
    if (typeof require !== "undefined") {
//#JSCOVERAGE_IF 0
        throw 'require should be null';
//#JSCOVERAGE_ENDIF
    }

    exports.some_function = function () {
        return true;
    };
},
"module_function_fe": (function (require, exports, module) {
    require('ok')(true, "fe should be called once");

    return function () {
        return true;
    }
}),
"module_function_fe_sandboxed": (function (require, exports, module) {
    if (typeof require !== "undefined") {
//#JSCOVERAGE_IF 0
        throw 'require should be null';
//#JSCOVERAGE_ENDIF
    }

    exports.some_function = function () {
        return true;
    };
}),
"module_function_lazy": "(function(a,b,c){return a(\"ok\")(!0,\"lazy function must be evaled and called once\"),function(){return!0}})",
"module_function_plain": (function (require, exports, module) { /* wrapped by builder */
require('ok')(true, "plain module must be called once");

module.exports = function () {
    return true;
};
}),
"module_function_plain_sandboxed": (function (require, exports, module) { /* wrapped by builder */
if (typeof require !== "undefined") {
//#JSCOVERAGE_IF 0
    throw 'require should be null';
//#JSCOVERAGE_ENDIF
}

exports.some_function = function () {
    return true;
};
}),
"testcase_lmd_basic_features": (function (require) {
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

    module('LMD basic features @ ' + ENV_NAME);

    test("require() globals", function () {
        expect(2);

        ok(require('eval'), "should require globals as modules");
        ok(typeof require('some_undefined') === "undefined", "if no module nor global - return undefined");
    });

    test("require() module-functions", function () {
        expect(9);

        var fd = require('module_function_fd'),
            fe = require('module_function_fe'),
            plain = require('module_function_plain');

        ok(fd() === true, "can require function definitions");
        ok(fe() === true, "can require function expressions");
        ok(plain() === true, "can require plain modules");

        ok(fd === require('module_function_fd'), "require must return the same instance of fd");
        ok(fe === require('module_function_fe'), "require must return the same instance of fe");
        ok(plain === require('module_function_plain'), "require must return the same instance of plain module");
    });

    test("require() sandboxed module-functions", function () {
        expect(3);

        var fd = require('module_function_fd_sandboxed'),
            fe = require('module_function_fe_sandboxed'),
            plain = require('module_function_plain_sandboxed');

        ok(fd.some_function() === true, "can require sandboxed function definitions");
        ok(fe.some_function() === true, "can require sandboxed function expressions");
        ok(plain.some_function() === true, "can require sandboxed plain modules");
    });

    test("require() lazy module-functions", function () {
        expect(4);

        var lazy = require('module_function_lazy');

        ok(lazy() === true, "can require lazy function definitions");
        ok(typeof require('lazy_fd') === "undefined", "lazy function definition's name should not leak into globals");
        ok(lazy === require('module_function_lazy'), "require must return the same instance of lazy fd");
    });

    test("require() module-objects/json", function () {
        expect(3);

        var json = require('module_as_json');

        ok(typeof json === "object", "json module should be an object");
        ok(json.ok === true, "should return content");
        ok(json === require('module_as_json'), "require of json module should return the same instance");
    });

    test("require() module-strings", function () {
        expect(2);

        var string = require('module_as_string');

        ok(typeof string === "string", "string module should be an string");
        ok(string === require('module_as_string'), "require of string module should return the same instance");
    });
}),
"testcase_lmd_async_require": (function (require) {
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
        expect(7);

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
                    start();
                });
            });
        });
    });
}),
"testcase_lmd_loader": (function (require) {
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

    module('LMD loader @ ' + ENV_NAME);

    asyncTest("require.js()", function () {
        expect(6);

        require.js('./modules/loader/non_lmd_module.js' + rnd, function (object) {
            ok(typeof object === "object", "should return empty object on success");

            ok(require('some_function')() === true, "we can grab content of the loaded script");

            ok(require('./modules/loader/non_lmd_module.js' + rnd) === object, "should cache object on success");

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

    asyncTest("require.js() race calls", function () {
        expect(1);
        var result;

        var check_result = function (object) {
            if (typeof result === "undefined") {
                result = object;
            } else {
                ok(result === object, "Must perform one call. Results must be the same");
                start();
            }
        };

        require.js('./modules/loader_race/non_lmd_module.js' + rnd, check_result);
        require.js('./modules/loader_race/non_lmd_module.js' + rnd, check_result);
    });

    asyncTest("require.css()", function () {
        expect(3);

        require.css('./modules/loader/some_css.css' + rnd, function (link_tag) {
            ok(typeof link_tag === "undefined", "should act like require and return undefined if no module");
            ok(typeof require('./modules/loader/some_css_404.css' + rnd) === "undefined", "should not cache errorous modules");
            require.css('module_as_string', function (module_as_string) {
                require.async('module_as_string', function (module_as_string_expected) {
                    ok(module_as_string === module_as_string_expected, 'require.css() acts like require.async() if in-package/declared module passed');
                    start();
                });
            });
        });
    });
}),
"testcase_lmd_cache": (function (require) {
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
        expect(10);

        ok(typeof ls['lmd'] === "string", 'LMD Should create cache');

        var lmd = JSON.parse(ls['lmd']);

        ok(lmd.version === PACKAGE_VERSION, 'Should save version');
        ok(typeof lmd.modules === 'object', 'Should save modules');
        ok(typeof lmd.main === 'string', 'Should save main function as string');
        ok(typeof lmd.lmd === 'string', 'Should save lmd source as string');
        ok(typeof lmd.sandboxed === 'object', 'Should save sandboxed modules');

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
}),
"sk_async_html": "@/modules/shortcuts/async.html",
"sk_async_js": "@/modules/shortcuts/async.js",
"sk_async_json": "@/modules/shortcuts/async.json",
"sk_css_css": "@/modules/shortcuts/css.css",
"sk_js_js": "@/modules/shortcuts/js.js"
},{"module_function_fd_sandboxed":true,"module_function_fe_sandboxed":true,"module_function_plain_sandboxed":true},"latest")