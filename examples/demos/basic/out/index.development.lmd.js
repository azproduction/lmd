// This file was automatically generated from "index.development.lmd.json"
(function (global, main, modules, modules_options, options) {
    var initialized_modules = {},
        global_eval = function (code) {
            return global.Function('return ' + code)();
        },
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
            lmd_trigger('lmd-register:before-register', moduleName, module);
            // Predefine in case of recursive require
            var output = {'exports': {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                // or load modules from nodejs/worker environment
                module = lmd_trigger('js:request-environment-module', moduleName, module)[1] || global[moduleName];
            } else if (typeof module === 'function') {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                var module_require = lmd_trigger('lmd-register:decorate-require', moduleName, lmd_require)[1];

                // Make sure that sandboxed modules cant require
                if (modules_options[moduleName] &&
                    modules_options[moduleName].sandbox &&
                    typeof module_require === 'function') {

                    module_require = local_undefined;
                }

                module = module(module_require, output.exports, output) || output.exports;
            }

            module = lmd_trigger('lmd-register:after-register', moduleName, module)[1];
            return modules[moduleName] = module;
        },
        /**
         * List of All lmd Events
         *
         * @important Do not rename it!
         */
        lmd_events = {},
        /**
         * LMD event trigger function
         *
         * @important Do not rename it!
         */
        lmd_trigger = function (event, data, data2, data3) {
            var list = lmd_events[event],
                result;

            if (list) {
                for (var i = 0, c = list.length; i < c; i++) {
                    result = list[i](data, data2, data3) || result;
                    if (result) {
                        // enable decoration
                        data = result[0] || data;
                        data2 = result[1] || data2;
                        data3 = result[2] || data3;
                    }
                }
            }
            return result || [data, data2, data3];
        },
        /**
         * LMD event register function
         *
         * @important Do not rename it!
         */
        lmd_on = function (event, callback) {
            if (!lmd_events[event]) {
                lmd_events[event] = [];
            }
            lmd_events[event].push(callback);
        },
        /**
         * @param {String} moduleName module name or path to file
         *
         * @returns {*}
         */
        lmd_require = function (moduleName) {
            var module = modules[moduleName];

            var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }

            lmd_trigger('*:before-check', moduleName, module);
            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }

            lmd_trigger('*:before-init', moduleName, module);

            // Lazy LMD module not a string
            if (typeof module === 'string' && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {'exports': {}},

        /**
         * Sandbox object for plugins
         *
         * @important Do not rename it!
         */
        sandbox = {
            'global': global,
            'modules': modules,
            'modules_options': modules_options,
            'options': options,

            'eval': global_eval,
            'register': register_module,
            'require': lmd_require,
            'initialized': initialized_modules,

            'noop': global_noop,
            'document': global_document,
            
            

            'on': lmd_on,
            'trigger': lmd_trigger,
            'undefined': local_undefined
        };

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

/**
 * @name sandbox
 */
(function (sb) {
    var domOnlyLoaders = {
        'css': true,
        'image': true
    };

    var reEvalable = /(java|ecma)script|json/,
        reJson = /json/;

    /**
      * Load off-package LMD module
      *
      * @param {String|Array} moduleName same origin path to LMD module
      * @param {Function}     [callback]   callback(result) undefined on error others on success
      */
    sb.on('*:preload', function (moduleName, callback, type) {
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, type), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = [replacement[0][0], callback, type];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2],
            XMLHttpRequestConstructor = sb.global.XMLHttpRequest || sb.global.ActiveXObject;

        callback = replacement[1];
        moduleName = replacement[0][1];

        if (!XMLHttpRequestConstructor) {
            sb.trigger('preload:require-environment-file', moduleName, module, callback);
            return returnResult;
        }

        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    var contentType = xhr.getResponseHeader('content-type');
                    module = xhr.responseText;
                    if (reEvalable.test(contentType)) {
                        module = sb.trigger('*:wrap-module', moduleName, module, contentType)[1];
                        if (!reJson.test(contentType)) {
                            module = sb.trigger('*:coverage-apply', moduleName, module)[1];
                        }

                        sb.trigger('preload:before-callback', moduleName, module);
                        module = sb.eval(module);
                    } else {
                        sb.trigger('preload:before-callback', moduleName, module);
                    }

                    if (type === 'preload') {
                        // 4. Declare it
                        sb.modules[moduleName] = module;
                        // 5. Then callback it
                        callback(moduleName);
                    } else {
                        // 4. Callback it
                        callback(sb.register(moduleName, module));
                    }
                } else {
                    sb.trigger('*:request-error', moduleName, module);
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return returnResult;

    });

    /**
     * @event *:request-off-package
     *
     * @param {String}   moduleName
     * @param {Function} callback
     * @param {String}   type
     *
     * @retuns yes [asap, returnResult]
     */
    sb.on('*:request-off-package', function (moduleName, callback, type) {
        
        var returnResult = sb.require;
        callback = callback || sb.noop;

        if (typeof moduleName !== "string") {
            callback = sb.trigger('*:request-parallel', moduleName, callback, sb.require[type])[1];
            if (!callback) {
                return [[returnResult, moduleName, module, true], callback, type];
            }
        }

        var module = sb.modules[moduleName];

        var replacement = sb.trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        sb.trigger('*:before-check', moduleName, module, type);
        // If module exists or its a node.js env
        if (module || (domOnlyLoaders[type] && !sb.document)) {
            callback(type === "preload" ? moduleName : sb.initialized[moduleName] ? module : sb.require(moduleName));
            return [[returnResult, moduleName, module, true], callback, type];
        }

        sb.trigger('*:before-init', moduleName, module);

        callback = sb.trigger('*:request-race', moduleName, callback)[1];
        // if already called
        if (!callback) {
            return [[returnResult, moduleName, module, true], callback, type]
        }

        return [[returnResult, moduleName, module, false], callback, type];
    });
}(sandbox));

/**
 * Async loader of off-package LMD modules (special LMD format file)
 *
 * @see /README.md near "LMD Modules types" for details
 *
 * Flag "async"
 *
 * This plugin provides require.async() function
 */
/**
 * @name sandbox
 */
(function (sb) {
    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    sb.require.async = function (moduleName, callback) {
        return sb.trigger('*:preload', moduleName, callback, 'async')[0];
    };

}(sandbox));

/**
 * Internal module
 */

/**
 * @name sandbox
 */
(function (sb) {
    /**
     * Loads any JavaScript file a non-LMD module
     *
     * @param {String|Array} moduleName path to file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLScriptElement on success
     */
    sb.on('*:load-script', function (moduleName, callback) {
        var readyState = 'readyState',
            isNotLoaded = 1,
            head;

        var script = sb.document.createElement("script");
        sb.global.setTimeout(script.onreadystatechange = script.onload = function (e) {
            e = e || sb.global.event;
            if (isNotLoaded &&
                (!e ||
                !script[readyState] ||
                script[readyState] == "loaded" ||
                script[readyState] == "complete")) {

                isNotLoaded = 0;
                // register or cleanup
                if (!e) {
                    sb.trigger('*:request-error', moduleName);
                }
                callback(e ? sb.register(moduleName, script) : head.removeChild(script) && sb.undefined); // e === undefined if error
            }
        }, 3000, 0);

        script.src = moduleName;
        head = sb.document.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);

        return [moduleName, callback];
    });

}(sandbox));

/**
 * Async loader of js files (NOT LMD modules): jQuery, d3.js etc
 *
 * Flag "js"
 *
 * This plugin provides require.js() function
 */

/**
 * @name sandbox
 */
(function (sb) {
    /**
     * Loads any JavaScript file a non-LMD module
     *
     * @param {String|Array} moduleName path to file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLScriptElement on success
     */
    sb.require.js = function (moduleName, callback) {
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, 'js'), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = replacement[0][0];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2],
            readyState = 'readyState';

        callback = replacement[1];
        moduleName = replacement[0][1];

        // by default return undefined
        if (!sb.document) {
            module = sb.trigger('js:request-environment-module', moduleName, module)[1];
            callback(module);
            return returnResult;
        }


        sb.trigger('*:load-script', moduleName, callback);

        return returnResult;

    };

}(sandbox));

/**
 * Async loader of css files
 *
 * Flag "css"
 *
 * This plugin provides require.css() function
 */
/**
 * @name sandbox
 */
(function (sb) {

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
    sb.require.css = function (moduleName, callback) {
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, 'css'), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = replacement[0][0];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2],
            isNotLoaded = 1,
            head;

        callback = replacement[1];
        moduleName = replacement[0][1];


        // Create stylesheet link
        var link = sb.document.createElement("link"),
            id = +new sb.global.Date,
            onload = function (e) {
                if (isNotLoaded) {
                    isNotLoaded = 0;
                    // register or cleanup
                    link.removeAttribute('id');

                    if (!e) {
                        sb.trigger('*:request-error', moduleName, module);
                    }
                    callback(e ? sb.register(moduleName, link) : head.removeChild(link) && sb.undefined); // e === undefined if error
                }
            };

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        sb.global.setTimeout(onload, 3000, 0);

        head = sb.document.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        (function poll() {
            if (isNotLoaded) {
                var sheets = sb.document.styleSheets,
                    j = 0,
                    k = sheets.length;

                try {
                    for (; j < k; j++) {
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
                    sb.global.setTimeout(poll, 90);
                }
            }
        }());

        return returnResult;

    };

}(sandbox));

/**
 * @name sandbox
 */
(function (sb) {

// Simple JSON stringify
function stringify(object) {
    var properties = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            properties.push(quote(key) + ':' + getValue(object[key]));
        }
    }
    return "{" + properties.join(",") + "}";
}

function getValue(value) {
    if (typeof value === "string") {
        return quote(value);
    } else if (typeof value === "boolean") {
        return "" + value;
    } else if (value.join) {
        if (value.length == 0) {
            return "[]";
        } else {
            var flat = [];
            for (var i = 0, len = value.length; i < len; i += 1) {
                flat.push(getValue(value[i]));
            }
            return '[' + flat.join(",") + ']';
        }
    } else if (typeof value === "number") {
        return value;
    } else {
        return stringify(value);
    }
}

function pad(s) {
    return '0000'.substr(s.length) + s;
}

function replacer(c) {
    switch (c) {
        case '\b': return '\\b';
        case '\f': return '\\f';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '\t': return '\\t';
        case '"': return '\\"';
        case '\\': return '\\\\';
        default: return '\\u' + pad(c.charCodeAt(0).toString(16));
    }
}

function quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, replacer) + '"';
}

function indexOf(item) {
    for (var i = this.length; i --> 0;) {
        if (this[i] === item) {
            return i;
        }
    }
    return -1;
}

    /**
     * @event *:request-json requests JSON polifill with only stringify function!
     *
     * @param {Object|undefined} JSON default JSON value
     *
     * @retuns yes
     */
sb.on('*:request-json', function (JSON) {
    if (typeof JSON === "object") {
        return [JSON];
    }

    return [{stringify: stringify}];
});

    /**
     * @event *:request-indexof requests indexOf polifill
     *
     * @param {Function|undefined} arrayIndexOf default indexOf value
     *
     * @retuns yes
     */
sb.on('*:request-indexof', function (arrayIndexOf) {
    if (typeof arrayIndexOf === "function") {
        return [arrayIndexOf];
    }

    return [indexOf];
});

}(sandbox));



    main(lmd_trigger('lmd-register:decorate-require', 'main', lmd_require)[1], output.exports, output);
})/*DO NOT ADD ; !*/
(this,function main(require) {
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
},{},{});
