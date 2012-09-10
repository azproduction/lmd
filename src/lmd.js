(function /*if ($P.CACHE) {*/lmd/*}*/(global, main, modules, sandboxed_modules/*if ($P.CACHE) {*/, version/*}*//*if ($P.STATS_COVERAGE) {*/, coverage_options/*}*/) {
    var initialized_modules = {},
        global_eval = function (code) {
            return global.Function('return ' + code)();
        },
        /*if ($P.CSS || $P.JS || $P.ASYNC) {*/global_noop = function () {},/*}*/
        /*if ($P.CSS || $P.JS || $P.STATS_SENDTO) {*/global_document = global.document,/*}*/
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
            var output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                module = global[moduleName];
            } else if (typeof module === "function") {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                var module_require = lmd_trigger(
                    sandboxed_modules[moduleName] ?
                        'lmd-register:call-sandboxed-module' :
                        'lmd-register:call-module',
                    moduleName,
                    require
                )[1];

                module = module(module_require, output.exports, output) || output.exports;
            }

            lmd_trigger('lmd-register:after-register', moduleName, module);
            return modules[moduleName] = module;
        },
        /**
         * List of All lmd Events
         */
        lmd_events = {},
        /**
         * LMD event trigger function
         */
        lmd_trigger = function (event, data, data2) {
            var list = lmd_events[event],
                result;

            if (list) {
                for (var i = 0, c = list.length; i < c; i++) {
                    result = list[i](event, data, data2) || result;
                }
            }
            return result || [data, data2];
        },
        /**
         * LMD event register function
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
        require = function (moduleName) {
            var module = modules[moduleName];

            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                lmd_trigger('lmd-require:from-cache', moduleName);
                return module;
            }

            var replacement = lmd_trigger('lmd-require:first-init', moduleName, module);
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }

            // Lazy LMD module not a string
            if (typeof module === "string" && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {exports: {}};

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

/*if ($P.RACE) include('race.js');*/
/*if ($P.STATS) include('stats.js');*/
/*if ($P.STATS_SENDTO) include('stats_sendto.js');*/
/*if ($P.STATS_COVERAGE) include('stats_coverage.js');*/
/*if ($P.STATS_COVERAGE_ASYNC) include('stats_coverage_async.js');*/
/*if ($P.SHORTCUTS) include('shortcuts.js');*/
/*if ($P.PARALLEL) include('parallel.js');*/
/*if ($P.CACHE_ASYNC) include('cache_async.js');*/
/*if ($P.ASYNC) include('async.js');*/
/*if ($P.JS) include('js.js');*/
/*if ($P.CSS) include('css.js');*/
/*if ($P.CACHE) include('cache.js');*/
    main(lmd_trigger('lmd-register:call-module', "main", require)[1], output.exports, output);
})