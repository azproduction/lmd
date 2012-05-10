(function (global, main, modules, sandboxed_modules) {
    var initialized_modules = {},
        global_eval = global.eval,
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
                module = module(sandboxed_modules[moduleName] ? null : require, output.exports, output) || output.exports;
            }

            return modules[moduleName] = module;
        },
        require = function (moduleName) {
            var module = modules[moduleName];

            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }

            // Lazy LMD module not a string
            if (/^\(function\(/.test(module)) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {exports: {}};

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

    require.async = function (moduleName, callback) {
        var module = modules[moduleName];

        // Already inited - return as is
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return;
        }

        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new(global.XMLHttpRequest||global.ActiveXObject)("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    module = xhr.responseText;
                    if ((/script$|json$/).test(xhr.getResponseHeader('content-type'))) {
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
    };



    require.js = function (moduleName, callback) {
        var module = modules[moduleName],
            readyState = 'readyState',
            isNotLoaded = 1,
            doc = global.document,
            head;

        // Already inited - return as is
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return;
        }

        var script = doc.createElement("script");
        global.setTimeout(script.onreadystatechange = script.onload = function (e) {
            if (isNotLoaded &&
                (!e ||
                !script[readyState] ||
                script[readyState] == "loaded" ||
                script[readyState] == "complete")) {
                
                isNotLoaded = 0;
                // register or cleanup
                callback(e ? register_module(moduleName, script) : head.removeChild(script) && e); // e === undefined if error
            }
        }, 3000, head); // in that moment head === undefined

        script.src = moduleName;
        head = doc.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);
    };



    // Inspired by yepnope.css.js
    // @see https://github.com/SlexAxton/yepnope.js/blob/master/plugins/yepnope.css.js
    require.css = function (moduleName, callback) {
        var module = modules[moduleName];

        // Already inited - return as is
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return;
        }

        // Create stylesheet link
        var isNotLoaded = 1,
            doc = global.document,
            head,
            link = doc.createElement("link"),
            id = global.Math.random();

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        global.setTimeout(link.onload = function (e) {
            if (isNotLoaded) {
                isNotLoaded = 0;
                // register or cleanup
                link.removeAttribute('id');
                callback(e ? register_module(moduleName, link) : head.removeChild(link) && e); // e === undefined if error
            }
        }, 3000, head); // in that moment head === undefined

        head = doc.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        (function poll() {
            if (isNotLoaded) {
                try {
                    var sheets = document.styleSheets;
                    for (var j = 0, k = sheets.length; j < k; j++) {
                        if(sheets[j].ownerNode.id == id && sheets[j].cssRules.length) {
//#JSCOVERAGE_IF 0
                            return link.onload(1);
//#JSCOVERAGE_ENDIF
                        }
                    }
                    // if we get here, its not in document.styleSheets (we never saw the ID)
                    throw 1;
                } catch(e) {
                    // Keep polling
                    global.setTimeout(poll, 20);
                }
            }
        }());
    };



    main(require, output.exports, output);
})(this,(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        rnd = '?' + +new Date();

    module('LMD basic features');

    test("require() globals", function () {
        expect(2);

        ok(require('document'), "should require globals as modules");
        ok(typeof require('some_undefined') === "undefined", "if no module nor global - return undefined");
    });

    test("require() module-functions", function () {
        expect(10);

        var fd = require('module_function_fd'),
            fe = require('module_function_fe'),
            plain = require('module_function_plain');

        ok(fd() === true, "can require function definitions");
        ok(typeof require('fd') === "undefined", "function definition's name should not leak into globals");
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

    module('LMD async require');

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

    module('LMD loader');

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
    if (require !== null) {
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
    if (require !== null) {
//#JSCOVERAGE_IF 0
        throw 'require should be null';
//#JSCOVERAGE_ENDIF
    }

    exports.some_function = function () {
        return true;
    };
}),
"module_function_lazy": "(function(require, exports, module) {\n    require('ok')(true, \"lazy function must be evaled and called once\");\n\n    return function () {\n        return true;\n    }\n})",
"module_function_plain": (function (require, exports, module) { /* wrapped by builder */
require('ok')(true, "plain module must be called once");

module.exports = function () {
    return true;
};
}),
"module_function_plain_sandboxed": (function (require, exports, module) { /* wrapped by builder */
if (require !== null) {
//#JSCOVERAGE_IF 0
    throw 'require should be null';
//#JSCOVERAGE_ENDIF
}

exports.some_function = function () {
    return true;
};
})
},{"module_function_fd_sandboxed":true,"module_function_fe_sandboxed":true,"module_function_plain_sandboxed":true})