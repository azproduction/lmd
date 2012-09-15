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
                var module_require;

                if (sandboxed_modules[moduleName]) {
                    module_require = lmd_trigger('lmd-register:call-sandboxed-module', moduleName, require)[1];
                } else {
                    module_require = lmd_trigger('lmd-register:call-module', moduleName, require)[1];
                }

                module = module(module_require, output.exports, output) || output.exports;
            }

            lmd_trigger('lmd-register:after-register', moduleName, module);
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
        require = function (moduleName) {
            var module = modules[moduleName];

            lmd_trigger('lmd-require:before-check', moduleName, module);
            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }
            var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }

            lmd_trigger('*:before-init', moduleName, module);

            // Lazy LMD module not a string
            if (typeof module === "string" && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {exports: {}},

        /**
         * Sandbox object for plugins
         *
         * @important Do not rename it!
         */
        sandbox = {
            global: global,
            modules: modules,
            sandboxed: sandboxed_modules,

            eval: global_eval,
            register: register_module,
            require: require,
            initialized: initialized_modules,

            /*if ($P.CSS || $P.JS || $P.ASYNC) {*/noop: global_noop,/*}*/
            /*if ($P.CSS || $P.JS || $P.STATS_SENDTO) {*/document: global_document,/*}*/
            /*if ($P.CACHE) {*/lmd: lmd,/*}*/
            /*if ($P.CACHE) {*/main: main,/*}*/
            /*if ($P.CACHE) {*/version: version,/*}*/
            /*if ($P.STATS_COVERAGE) {*/coverage_options: coverage_options,/*}*/

            on: lmd_on,
            trigger: lmd_trigger,
            undefined: local_undefined
        };

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

/*if ($P.WORKER || $P.NODE) include('worker_or_node.js')*/
/*if ($P.NODE) include('node.js')*/
/*if ($P.IE) include('ie.js');*/
/*if ($P.RACE) include('race.js');*/
/*if ($P.STATS) include('stats.js');*/
/*if ($P.STATS_SENDTO) include('stats_sendto.js');*/
/*if ($P.STATS_COVERAGE) include('stats_coverage.js');*/
/*if ($P.STATS_COVERAGE_ASYNC) include('stats_coverage_async.js');*/
/*if ($P.SHORTCUTS) include('shortcuts.js');*/
/*if ($P.PARALLEL) include('parallel.js');*/
/*if ($P.CACHE_ASYNC) include('cache_async.js');*/
/*if ($P.ASYNC) include('async.js');*/
/*if ($P.ASYNC_PLAIN || $P.ASYNC_PLAINONLY) include('async_plain.js');*/
/*if ($P.JS) include('js.js');*/
/*if ($P.CSS) include('css.js');*/
/*if ($P.CACHE) include('cache.js');*/
    main(lmd_trigger('lmd-register:call-module', "main", require)[1], output.exports, output);
})/*DO NOT ADD ; !*/