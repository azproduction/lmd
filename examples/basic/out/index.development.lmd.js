(function(global, main, modules, sandboxed_modules) {
    var initialized_modules = {}, global_eval = function(code) {
        return global.Function("return " + code)();
    }, global_noop = function() {}, global_document = global.document, local_undefined, register_module = function(moduleName, module) {
        null;
        var output = {
            exports: {}
        };
        initialized_modules[moduleName] = 1;
        modules[moduleName] = output.exports;
        if (!module) {
            module = global[moduleName];
        } else if (typeof module === "function") {
            var module_require;
            if (sandboxed_modules[moduleName]) {
                module_require = [ moduleName, require ][1];
            } else {
                module_require = [ moduleName, require ][1];
            }
            module = module(module_require, output.exports, output) || output.exports;
        }
        null;
        return modules[moduleName] = module;
    }, require = function(moduleName) {
        var module = modules[moduleName];
        if (initialized_modules[moduleName] && module) {
            null;
            return module;
        }
        var replacement = [ moduleName, module ];
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }
        if (typeof module === "string" && module.indexOf("(function(") === 0) {
            module = global_eval(module);
        }
        return register_module(moduleName, module);
    }, output = {
        exports: {}
    };
    for (var moduleName in modules) {
        initialized_modules[moduleName] = 0;
    }
    (function() {
        function stringify(object) {
            var properties = [];
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    properties.push(quote(key) + ":" + getValue(object[key]));
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
                    return "[" + flat.join(",") + "]";
                }
            } else if (typeof value === "number") {
                return value;
            } else {
                return stringify(value);
            }
        }
        function pad(s) {
            return "0000".substr(s.length) + s;
        }
        function replacer(c) {
            switch (c) {
              case "\b":
                return "\\b";
              case "\f":
                return "\\f";
              case "\n":
                return "\\n";
              case "\r":
                return "\\r";
              case "\t":
                return "\\t";
              case '"':
                return '\\"';
              case "\\":
                return "\\\\";
              default:
                return "\\u" + pad(c.charCodeAt(0).toString(16));
            }
        }
        function quote(s) {
            return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, replacer) + '"';
        }
        function indexOf(item) {
            for (var i = this.length; i-- > 0; ) {
                if (this[i] === item) {
                    return i;
                }
            }
            return -1;
        }
        null;
        null;
    })();
    (function() {
        require.async = function(moduleName, callback) {
            callback = callback || global_noop;
            if (typeof moduleName !== "string") {
                callback = [ moduleName, callback, require.async ][1];
                if (!callback) {
                    return require;
                }
            }
            var module = modules[moduleName], XMLHttpRequestConstructor = global.XMLHttpRequest || global.ActiveXObject;
            var replacement = [ moduleName, module ];
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }
            null;
            if (module) {
                callback(initialized_modules[moduleName] ? module : require(moduleName));
                return require;
            }
            null;
            callback = [ moduleName, callback ][1];
            if (!callback) {
                return require;
            }
            if (!XMLHttpRequestConstructor) {
                null;
                return require;
            }
            var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status < 201) {
                        var contentType = xhr.getResponseHeader("content-type");
                        module = xhr.responseText;
                        if (/script$|json$/.test(contentType)) {
                            module = [ moduleName, module, contentType ][1];
                            if (!/json$/.test(contentType)) {
                                module = [ moduleName, module ][1];
                            }
                            module = global_eval(module);
                        }
                        null;
                        callback(register_module(moduleName, module));
                    } else {
                        null;
                        callback();
                    }
                }
            };
            xhr.open("get", moduleName);
            xhr.send();
            return require;
        };
    })();
    (function() {
        require.js = function(moduleName, callback) {
            callback = callback || global_noop;
            if (typeof moduleName !== "string") {
                callback = [ moduleName, callback, require.js ][1];
                if (!callback) {
                    return require;
                }
            }
            var module = modules[moduleName], readyState = "readyState", isNotLoaded = 1, head;
            var replacement = [ moduleName, module ];
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }
            null;
            if (module) {
                callback(initialized_modules[moduleName] ? module : require(moduleName));
                return require;
            }
            null;
            callback = [ moduleName, callback ][1];
            if (!callback) {
                return require;
            }
            if (!global_document) {
                module = [ moduleName, module ][1];
                callback(module);
                return require;
            }
            var script = global_document.createElement("script");
            global.setTimeout(script.onreadystatechange = script.onload = function(e) {
                e = e || global.event;
                if (isNotLoaded && (!e || !script[readyState] || script[readyState] == "loaded" || script[readyState] == "complete")) {
                    isNotLoaded = 0;
                    if (!e) {
                        null;
                    }
                    callback(e ? register_module(moduleName, script) : head.removeChild(script) && local_undefined);
                }
            }, 3e3, 0);
            script.src = moduleName;
            head = global_document.getElementsByTagName("head")[0];
            head.insertBefore(script, head.firstChild);
            return require;
        };
    })();
    (function() {
        require.css = function(moduleName, callback) {
            callback = callback || global_noop;
            if (typeof moduleName !== "string") {
                callback = [ moduleName, callback, require.css ][1];
                if (!callback) {
                    return require;
                }
            }
            var module = modules[moduleName], isNotLoaded = 1, head;
            var replacement = [ moduleName, module ];
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }
            null;
            if (module || !global_document) {
                callback(initialized_modules[moduleName] ? module : require(moduleName));
                return require;
            }
            null;
            callback = [ moduleName, callback ][1];
            if (!callback) {
                return require;
            }
            var link = global_document.createElement("link"), id = +(new global.Date), onload = function(e) {
                if (isNotLoaded) {
                    isNotLoaded = 0;
                    link.removeAttribute("id");
                    if (!e) {
                        null;
                    }
                    callback(e ? register_module(moduleName, link) : head.removeChild(link) && local_undefined);
                }
            };
            link.href = moduleName;
            link.rel = "stylesheet";
            link.id = id;
            global.setTimeout(onload, 3e3, 0);
            head = global_document.getElementsByTagName("head")[0];
            head.insertBefore(link, head.firstChild);
            (function poll() {
                if (isNotLoaded) {
                    try {
                        var sheets = global_document.styleSheets;
                        for (var j = 0, k = sheets.length; j < k; j++) {
                            if ((sheets[j].ownerNode || sheets[j].owningElement).id == id && (sheets[j].cssRules || sheets[j].rules).length) {
                                return onload(1);
                            }
                        }
                        throw 1;
                    } catch (e) {
                        global.setTimeout(poll, 90);
                    }
                }
            })();
            return require;
        };
    })();
    main([ "main", require ][1], output.exports, output);
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
},{})