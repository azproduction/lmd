(function lmd(global, main, modules, sandboxed_modules, version) {
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
 * @name version
 */

function cache_async(moduleName, module) {
    if (global.localStorage && version) {
        try {
            global.localStorage['lmd:' + version + ':' + moduleName] = global.JSON.stringify(module);
        } catch(e) {}
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
                    cache_async(moduleName, typeof module === "function" ? xhr.responseText : module);
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

            callback(module);
            return require;
        }


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

    };
/**
 * @name global
 * @name lmd
 * @name sandboxed_modules
 * @name modules
 * @name main
 * @name version
 */

    // If possible to dump and version passed (fallback mode)
    // then dump application source
    if (global.localStorage && version) {
        (function () {
            try {
                global.localStorage['lmd'] = global.JSON.stringify({
                    version: version,
                    modules: modules,
                    // main module function
                    main: '(' + main + ')',
                    // lmd function === arguments.callee
                    lmd: '(' + lmd + ')',
                    sandboxed: sandboxed_modules
                });
            } catch(e) {}
        }());
    }
    main(require, output.exports, output);
})(this,(function(a){a("testcase_lmd_basic_features"),a("testcase_lmd_async_require"),a("testcase_lmd_loader"),a("testcase_lmd_cache")}),{
"module_as_json": {
    "ok": true
},
"module_as_string": "<div class=\"b-template\">${pewpew}</div>",
"module_function_fd": "(function(a,b,c){return a(\"ok\")(!0,\"fd should be called once\"),function(){return!0}})",
"module_function_fd2": "(function(a,b,c){return a(\"ok\")(!0,\"fd2 should be called once\"),function(){return!0}})",
"module_function_fd_sandboxed": "(function(a,b,c){if(typeof a!=\"undefined\")throw\"require should be null\";b.some_function=function(){return!0}})",
"module_function_fe": "(function(a,b,c){return a(\"ok\")(!0,\"fe should be called once\"),function(){return!0}})",
"module_function_fe_sandboxed": "(function(a,b,c){if(typeof a!=\"undefined\")throw\"require should be null\";b.some_function=function(){return!0}})",
"module_function_lazy": "(function(a,b,c){return a(\"ok\")(!0,\"lazy function must be evaled and called once\"),function(){return!0}})",
"module_function_plain": "(function(a,b,c){a(\"ok\")(!0,\"plain module must be called once\"),c.exports=function(){return!0}})",
"module_function_plain_sandboxed": "(function(a,b,c){if(typeof a!=\"undefined\")throw\"require should be null\";b.some_function=function(){return!0}})",
"testcase_lmd_basic_features": "(function(a){var b=a(\"test\"),c=a(\"asyncTest\"),d=a(\"start\"),e=a(\"module\"),f=a(\"ok\"),g=a(\"expect\"),h=a(\"$\"),i=a(\"raises\"),j=\"?\"+Math.random(),k=a(\"worker_some_global_var\")?\"Worker\":a(\"node_some_global_var\")?\"Node\":\"DOM\";e(\"LMD basic features @ \"+k),b(\"require() globals\",function(){g(2),f(a(\"eval\"),\"should require globals as modules\"),f(typeof a(\"some_undefined\")==\"undefined\",\"if no module nor global - return undefined\")}),b(\"require() module-functions\",function(){g(9);var b=a(\"module_function_fd\"),c=a(\"module_function_fe\"),d=a(\"module_function_plain\");f(b()===!0,\"can require function definitions\"),f(c()===!0,\"can require function expressions\"),f(d()===!0,\"can require plain modules\"),f(b===a(\"module_function_fd\"),\"require must return the same instance of fd\"),f(c===a(\"module_function_fe\"),\"require must return the same instance of fe\"),f(d===a(\"module_function_plain\"),\"require must return the same instance of plain module\")}),b(\"require() sandboxed module-functions\",function(){g(3);var b=a(\"module_function_fd_sandboxed\"),c=a(\"module_function_fe_sandboxed\"),d=a(\"module_function_plain_sandboxed\");f(b.some_function()===!0,\"can require sandboxed function definitions\"),f(c.some_function()===!0,\"can require sandboxed function expressions\"),f(d.some_function()===!0,\"can require sandboxed plain modules\")}),b(\"require() lazy module-functions\",function(){g(4);var b=a(\"module_function_lazy\");f(b()===!0,\"can require lazy function definitions\"),f(typeof a(\"lazy_fd\")==\"undefined\",\"lazy function definition's name should not leak into globals\"),f(b===a(\"module_function_lazy\"),\"require must return the same instance of lazy fd\")}),b(\"require() module-objects/json\",function(){g(3);var b=a(\"module_as_json\");f(typeof b==\"object\",\"json module should be an object\"),f(b.ok===!0,\"should return content\"),f(b===a(\"module_as_json\"),\"require of json module should return the same instance\")}),b(\"require() module-strings\",function(){g(2);var b=a(\"module_as_string\");f(typeof b==\"string\",\"string module should be an string\"),f(b===a(\"module_as_string\"),\"require of string module should return the same instance\")})})",
"testcase_lmd_async_require": "(function(a){var b=a(\"test\"),c=a(\"asyncTest\"),d=a(\"start\"),e=a(\"module\"),f=a(\"ok\"),g=a(\"expect\"),h=a(\"$\"),i=a(\"raises\"),j=\"?\"+Math.random(),k=a(\"worker_some_global_var\")?\"Worker\":a(\"node_some_global_var\")?\"Node\":\"DOM\";e(\"LMD async require @ \"+k),c(\"require.async() module-functions\",function(){g(5),a.async(\"./modules/async/module_function_async.js\"+j,function(b){f(b.some_function()===!0,\"should require async module-functions\"),f(a(\"./modules/async/module_function_async.js\"+j)===b,\"can sync require, loaded async module-functions\"),a.async(\"module_function_fd2\",function(a){f(a()===!0,\"can require async in-package modules\"),d()})})}),c(\"require.async() module-strings\",function(){g(3),a.async(\"./modules/async/module_as_string_async.html\"+j,function(b){f(typeof b==\"string\",\"should require async module-strings\"),f(b==='<div class=\"b-template\">${pewpew}</div>',\"content ok?\"),f(a(\"./modules/async/module_as_string_async.html\"+j)===b,\"can sync require, loaded async module-strings\"),d()})}),c(\"require.async() module-objects\",function(){g(2),a.async(\"./modules/async/module_as_json_async.json\"+j,function(b){f(typeof b==\"object\",\"should require async module-object\"),f(a(\"./modules/async/module_as_json_async.json\"+j)===b,\"can sync require, loaded async module-object\"),d()})}),c(\"require.async() chain calls\",function(){g(3);var b=a.async(\"./modules/async/module_as_json_async.json\"+j).async(\"./modules/async/module_as_json_async.json\"+j,function(){f(!0,\"Callback is optional\"),f(!0,\"WeCan use chain calls\"),d()});f(b===a,\"must return require\")}),c(\"require.async():json race calls\",function(){g(1);var b,c=function(a){typeof b==\"undefined\"?b=a:(f(b===a,\"Must perform one call. Results must be the same\"),d())};a.async(\"./modules/async_race/module_as_json_async.json\"+j,c),a.async(\"./modules/async_race/module_as_json_async.json\"+j,c)}),c(\"require.async():js race calls\",function(){g(2);var b,c=function(a){typeof b==\"undefined\"?b=a:(f(b===a,\"Must perform one call. Results must be the same\"),d())};a.async(\"./modules/async_race/module_function_async.js\"+j,c),a.async(\"./modules/async_race/module_function_async.js\"+j,c)}),c(\"require.async():string race calls\",function(){g(1);var b,c=function(a){typeof b==\"undefined\"?b=a:(f(b===a,\"Must perform one call. Results must be the same\"),d())};a.async(\"./modules/async_race/module_as_string_async.html\"+j,c),a.async(\"./modules/async_race/module_as_string_async.html\"+j,c)}),c(\"require.async() errors\",function(){g(2),a.async(\"./modules/async/undefined_module.js\"+j,function(b){f(typeof b==\"undefined\",\"should return undefined on error\"),a.async(\"./modules/async/undefined_module.js\"+j,function(a){f(typeof a==\"undefined\",\"should not cache errorous modules\"),d()})})}),c(\"require.async() parallel loading\",function(){g(2),a.async([\"./modules/parallel/1.js\"+j,\"./modules/parallel/2.js\"+j,\"./modules/parallel/3.js\"+j],function(a,b,c){f(!0,\"Modules executes as they are loaded - in load order\"),f(a.file===\"1.js\"&&b.file===\"2.js\"&&c.file===\"3.js\",\"Modules should be callbacked in list order\"),d()})}),c(\"require.async() shortcuts\",function(){g(7),f(typeof a(\"sk_async_html\")==\"undefined\",\"require should return undefined if shortcuts not initialized by loaders\"),f(typeof a(\"sk_async_html\")==\"undefined\",\"require should return undefined ... always\"),a.async(\"sk_async_json\",function(b){f(b.ok===!0,\"should require shortcuts: json\"),f(a(\"sk_async_json\")===b,\"if shortcut is defined require should return the same code\"),f(a(\"/modules/shortcuts/async.json\")===b,\"Module should be inited using shortcut content\"),a.async(\"sk_async_html\",function(b){f(b===\"ok\",\"should require shortcuts: html\"),a.async(\"sk_async_js\",function(a){f(a()===\"ok\",\"should require shortcuts: js\"),d()})})})})})",
"testcase_lmd_loader": "(function(a){var b=a(\"test\"),c=a(\"asyncTest\"),d=a(\"start\"),e=a(\"module\"),f=a(\"ok\"),g=a(\"expect\"),h=a(\"$\"),i=a(\"raises\"),j=\"?\"+Math.random(),k=a(\"worker_some_global_var\")?\"Worker\":a(\"node_some_global_var\")?\"Node\":\"DOM\";e(\"LMD loader @ \"+k),c(\"require.js()\",function(){g(6),a.js(\"./modules/loader/non_lmd_module.js\"+j,function(b){f(typeof b==\"object\"&&b.nodeName.toUpperCase()===\"SCRIPT\",\"should return script tag on success\"),f(a(\"some_function\")()===!0,\"we can grab content of the loaded script\"),f(a(\"./modules/loader/non_lmd_module.js\"+j)===b,\"should cache script tag on success\"),a.js(\"http://8.8.8.8:8/jquery.js\"+j,function(b){f(typeof b==\"undefined\",\"should return undefined on error in 3 seconds\"),f(typeof a(\"http://8.8.8.8:8/jquery.js\"+j)==\"undefined\",\"should not cache errorous modules\"),a.js(\"module_as_string\",function(b){a.async(\"module_as_string\",function(a){f(b===a,\"require.js() acts like require.async() if in-package/declared module passed\"),d()})})})})}),c(\"require.js() JSON callback and chain calls\",function(){g(2);var b=a(\"setTimeout\")(function(){f(!1,\"JSONP call fails\"),d()},3e3);a(\"window\").someJsonHandler=function(c){f(c.ok,\"JSON called\"),a(\"window\").someJsonHandler=null,a(\"clearTimeout\")(b),d()};var c=a.js(\"./modules/loader/non_lmd_module.jsonp.js\"+j);f(c===a,\"require.js() must return require\")}),c(\"require.js() race calls\",function(){g(1);var b,c=function(a){typeof b==\"undefined\"?b=a:(f(b===a,\"Must perform one call. Results must be the same\"),d())};a.js(\"./modules/loader_race/non_lmd_module.js\"+j,c),a.js(\"./modules/loader_race/non_lmd_module.js\"+j,c)}),c(\"require.css()\",function(){g(6),a.css(\"./modules/loader/some_css.css\"+j,function(b){f(typeof b==\"object\"&&b.nodeName.toUpperCase()===\"LINK\",\"should return link tag on success\"),f(h(\"#qunit-fixture\").css(\"visibility\")===\"hidden\",\"css should be applied\"),f(a(\"./modules/loader/some_css.css\"+j)===b,\"should cache link tag on success\"),a.css(\"./modules/loader/some_css_404.css\"+j,function(b){f(typeof b==\"undefined\",\"should return undefined on error in 3 seconds\"),f(typeof a(\"./modules/loader/some_css_404.css\"+j)==\"undefined\",\"should not cache errorous modules\"),a.css(\"module_as_string\",function(b){a.async(\"module_as_string\",function(a){f(b===a,\"require.css() acts like require.async() if in-package/declared module passed\"),d()})})})})}),c(\"require.css() CSS loader without callback\",function(){g(1);var b=a.css(\"./modules/loader/some_css_callbackless.css\"+j).css(\"./modules/loader/some_css_callbackless.css\"+j+1);f(b===a,\"require.css() must return require\"),d()}),c(\"require.css() race calls\",function(){g(1);var b,c=function(a){typeof b==\"undefined\"?b=a:(f(b===a,\"Must perform one call. Results must be the same\"),d())};a.css(\"./modules/loader_race/some_css.css\"+j,c),a.css(\"./modules/loader_race/some_css.css\"+j,c)}),c(\"require.css() shortcut\",function(){g(4),a.css(\"sk_css_css\",function(b){console.log(arguments),f(typeof b==\"object\"&&b.nodeName.toUpperCase()===\"LINK\",\"should return link tag on success\"),f(a(\"sk_css_css\")===b,\"require should return the same result\"),a.css(\"sk_css_css\",function(c){f(c===b,\"should load once\"),f(a(\"sk_css_css\")===a(\"/modules/shortcuts/css.css\"),\"should be defined using path-to-module\"),d()})})}),c(\"require.js() shortcut\",function(){g(5),a.js(\"sk_js_js\",function(b){console.log(arguments),f(typeof b==\"object\"&&b.nodeName.toUpperCase()===\"SCRIPT\",\"should return script tag on success\"),f(a(\"sk_js_js\")===b,\"require should return the same result\"),a.js(\"sk_js_js\",function(c){f(c===b,\"should load once\"),f(a(\"sk_js_js\")===a(\"/modules/shortcuts/js.js\"),\"should be defined using path-to-module\"),f(typeof a(\"shortcuts_js\")==\"function\",\"Should create a global function shortcuts_js as in module function\"),d()})})})})",
"testcase_lmd_cache": "(function(a){var b=a(\"test\"),c=a(\"asyncTest\"),d=a(\"start\"),e=a(\"module\"),f=a(\"ok\"),g=a(\"expect\"),h=a(\"$\"),i=a(\"raises\"),j=a(\"localStorage\"),k=\"?\"+Math.random(),l=a(\"worker_some_global_var\")?\"Worker\":a(\"node_some_global_var\")?\"Node\":\"DOM\",m=\"latest\";if(!j)return;e(\"LMD cache @ \"+l),c(\"localStorage cache + cache_async test\",function(){g(10),f(typeof j.lmd==\"string\",\"LMD Should create cache\");var b=JSON.parse(j.lmd);f(b.version===m,\"Should save version\"),f(typeof b.modules==\"object\",\"Should save modules\"),f(typeof b.main==\"string\",\"Should save main function as string\"),f(typeof b.lmd==\"string\",\"Should save lmd source as string\"),f(typeof b.sandboxed==\"object\",\"Should save sandboxed modules\"),a.async(\"./modules/async/module_function_async.js\",function(b){var c=\"lmd:\"+m+\":\"+\"./modules/async/module_function_async.js\";f(b.some_function()===!0,\"should require async module-functions\"),f(typeof j[c]==\"string\",\"LMD Should cache async requests\"),j.removeItem(c),a.async(\"./modules/async/module_function_async.js\"),f(!j[c],\"LMD Should not recreate cache it was manually deleted key=\"+c),d()})})})",
"sk_async_html": "@/modules/shortcuts/async.html",
"sk_async_js": "@/modules/shortcuts/async.js",
"sk_async_json": "@/modules/shortcuts/async.json",
"sk_css_css": "@/modules/shortcuts/css.css",
"sk_js_js": "@/modules/shortcuts/js.js"
},{"module_function_fd_sandboxed":true,"module_function_fe_sandboxed":true,"module_function_plain_sandboxed":true},"latest")