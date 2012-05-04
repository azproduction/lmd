(function /*$IF STORAGE_CACHE$*/lmd/*$ENDIF$*/(global, main, modules, sandboxed_modules/*$IF STORAGE_CACHE$*/, version/*$ENDIF$*/) {
    var initialized_modules = {},
        global_eval = global.eval,
        /**
         * @param {String}    moduleName module name or path to file
         * @param {Function} [callback]  async callback
         *
         * @returns {*}
         */
        require = function (moduleName, callback) {
            var module = modules[moduleName];

            // if not inited
            if (!initialized_modules[moduleName] || !module) {
                // module is not in package and callback passed -> require async
                if (callback && !module) {
                    // its async require
                    return require_async(moduleName, callback);
                }
                // else sync require

                // Lazy LMD module not a string
                if (/^\(function\(/.test(module)) {
                    module = global_eval(module);
                }

                module = register_module(moduleName, module);
            }

            // async/sync call and module already in package
            return callback ? callback(module) : module;
        },
        /**
         * @param {String}    modulePath path to file for XHR GET
         * @param {Function} [callback]  async callback
         */
        require_async = function (modulePath, callback) {
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
                        modulePath,
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
            xhr.open('get', modulePath);
            xhr.send();
        },
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
        output = {exports: {}};

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }
/*$INCLUDE lmd_cache_dump.part.js IF STORAGE_CACHE$*/
    main(require, output.exports, output);
})