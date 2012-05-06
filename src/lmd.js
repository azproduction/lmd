(function /*$IF CACHE$*/lmd/*$ENDIF CACHE$*/(global, main, modules, sandboxed_modules/*$IF CACHE$*/, version/*$ENDIF CACHE$*/) {
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
/*$IF ASYNC$*/
    require.async = function (moduleName, callback) {
        var module = modules[moduleName];

        // Already inited - return as is
        if (initialized_modules[moduleName] && module) {
            return module;
        }

        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new(global.XMLHttpRequest||global.ActiveXObject)("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            // if readyState === 4
            xhr.readyState^4 ||
            // 4. Then callback it
            callback(
                // 3. Check for correct status 200 or 0 - OK?
                xhr.status < 201 ?
                // 2. Register and init module module
                register_module(
                    moduleName,
                    // 1. Parse or return as is
                    // application/javascript   - parse
                    // application/x-javascript - parse
                    // text/javascript          - parse
                    // application/json         - parse
                    // */*                      - as is
                    (/script$|json$/.test(xhr.getResponseHeader('content-type')) ? global_eval : String)
                        (xhr.responseText)
                ) :
                // 1. Not OK - Return undefined
                void 0
            );
        };
        xhr.open('get', moduleName);
        xhr.send();
    };
/*$ENDIF ASYNC$*/

/*$IF JS$*/
    require.js = function (moduleName, callback) {
        var module = modules[moduleName],
            readyState = 'readyState',
            isNotLoaded = 1,
            doc = global.document,
            head;

        // Already inited - return as is
        if (initialized_modules[moduleName] && module) {
            return module;
        }

        var script = doc.createElement("script");
        global.setTimeout(script.onreadystatechange = script.onload = function (e) {
            if (isNotLoaded &&
                (!e ||
                !script[readyState] ||
                script[readyState] == "loaded" ||
                script[readyState] == "complete")) {
                
                isNotLoaded = 0;
                callback(e ? register_module(moduleName, script) : e); // e === undefined
            }
        }, 3000, head); // in that moment head === undefined

        script.src = moduleName;
        head = doc.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);
    };
/*$ENDIF JS$*/

/*$IF CSS$*/
    // Inspired by yepnope.css.js
    // @see https://github.com/SlexAxton/yepnope.js/blob/master/plugins/yepnope.css.js
    require.css = function (moduleName, callback) {
        var module = modules[moduleName];

        // Already inited - return as is
        if (initialized_modules[moduleName] && module) {
            return module;
        }

        // Create stylesheet link
        var isNotLoaded = 1,
            doc = global.document,
            head,
            link = doc.createElement("link"),
            id = +new Date;

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        global.setTimeout(link.onload = function (e) {
            if (isNotLoaded) {
                isNotLoaded = 0;
                callback(e ? register_module(moduleName, link) : e);
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
                            return link.onload(1);
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
/*$ENDIF CSS$*/

/*$IF CACHE$*/
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
/*$ENDIF CACHE$*/
    main(require, output.exports, output);
})