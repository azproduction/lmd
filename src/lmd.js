(function /*$IF CACHE$*/lmd/*$ENDIF CACHE$*/(global, main, modules, sandboxed_modules/*$IF CACHE$*/, version/*$ENDIF CACHE$*/) {
    var initialized_modules = {},
        global_eval = global.eval,
        /*$IF CSS_OR_JS_OR_ASYNC$*/global_noop = function () {},/*$ENDIF CSS_OR_JS_OR_ASYNC$*/
        /*$IF CSS_OR_JS$*/global_document = global.document,/*$ENDIF CSS_OR_JS$*/
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
            if (/^\(function\(/.test(module)) {
                /*$IF IE$*/module = '(function(){return' + module + '})()';/*$ENDIF IE$*/
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {exports: {}};

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }
/*$INCLUDE IF ASYNC async.js $*/
/*$INCLUDE IF JS    js.js $*/
/*$INCLUDE IF CSS   css.js $*/
/*$INCLUDE IF CACHE cache.js $*/
    main(require, output.exports, output);
})