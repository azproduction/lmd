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
            
            // Lazy LMD module not a string
            if (typeof module === "string" && module.indexOf('(function(') === 0) {
                module = '(function(){return' + module + '})()';
                module = global_eval(module);
            }

            return register_module(moduleName, module);
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

        var module = modules[moduleName],
            XMLHttpRequestConstructor = global.XMLHttpRequest || global.ActiveXObject;

        

        // If module exists or its a node.js env
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
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

        var module = modules[moduleName],
            readyState = 'readyState',
            isNotLoaded = 1,
            head;

        

        // If module exists
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
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

        var module = modules[moduleName],
            isNotLoaded = 1,
            head;

        

        // If module exists or its a worker or node.js environment
        if (module || !global_document) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
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

    main(require, output.exports, output);
})(this,function main(require) {
    // Common Worker or Browser
    var i18n = require('i18n'),
        text = i18n.hello +  ', lmd',
        $, print, Worker, worker, cfg, tpl, escape;


    if (typeof window !== "undefined") {
        // Browser
        print = require('depA');
        escape = require('depB');
        Worker = require('Worker'); // grab from globals
        cfg = require('config');
        tpl = require('template'); // template string

        $ = require('$'); // grab module from globals: LMD version 1.2.0

        $(function () {
            // require off-package module config. Config flag: `async: true`
            // LMD parses content of module depend on Content-type header!
            // *** You must work on you HTTP server for correct headers,
            // *** if you work offline (using file:// protocol) then
            // *** Content-type header will be INVALID so all modules will be strings
            require.async('./modules/templates/async_template.html', function (async_template) {
                $('#log').html(
                    // use template to render text
                    typeof async_template !== "undefined" ?
                        async_template.replace('${content}', tpl.replace('${content}', escape(text))) :
                        tpl.replace('${content}', escape(text))
                );
            });

            // require some off-package javascript file - not a lmd module. Config flag: `js: true`
            require.js('./vendors/jquery.someplugin.js', function (scriptTag) {
                if (typeof scriptTag !== "undefined") {
                    print($.somePlugin());
                } else {
                    print('fail to load: ./vendors/jquery.someplugin.js');
                }
            });

            // require some off-package css file. Config flag: `css: true`
            require.css('./css/b-template.css', function (linkTag) {
                if (typeof linkTag !== "undefined") {
                    print('CSS - OK!');
                } else {
                    print('fail to load: ./css/b-template.css');
                }
            })
        });

        if (Worker) { // test if browser support workers
            worker = new Worker(cfg.worker);
            worker.addEventListener('message', function (event) {
                print("Received some data from worker: " + event.data);
            }, false);
        }
    } else {
        // Worker
        print = require('workerDepA');
    }


    // Common Worker or Browser
    print(text);
},{
"depA": (function (require) {
    var escape = require('depB'),
        console = require('console');
    return function(message) {
        console.log(escape(message));
    }
}),
"template": "<i class=\"b-template\">${content}</i>",
"depB": (function (require, exports, module) { /* wrapped by builder */
// module is sandboxed(see cfgs) - it cannot require
// CommonJS Module exports
// or exports.feature = function () {}
// This module is common for worker and browser
module.exports = function(message) {
    return message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// hack comment
}),
"workerDepA": function workerDepA(require){
    var escape = require('depB'), // shared module
        postMessage = require('postMessage'); // grab from global

    return function(message) {
        postMessage(escape(message));
    }
},
"i18n": {
    "hello": "Привет"
},
"config": {
    "worker": "./out/index.development.lmd.js"
}
},{"depB":true})