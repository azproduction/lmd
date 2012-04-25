(function (global, main, modules, sandboxed_modules) {
    var initialized_modules = {},
        require = function (moduleName) {
            var module = modules[moduleName],
                output;

            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }

            // Lazy LMD module not a string
            if (/^\(function\(/.test(module)) {
                module = window.eval(module);
            }

            // Predefine in case of recursive require
            output = {exports: {}};
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

    main(require, output.exports, output);
})