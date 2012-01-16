(function (window) {
    var modules = {},
        initialized_modules = {},
        require = function (moduleName) {
            var module = modules[moduleName],
                output;

            if (initialized_modules[moduleName]) {
                return module;
            }

            if (typeof module === "string") {
                module = (0, window.eval)(module);
            }

            // Predefine in case of recursive require
            output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (typeof module === "function") {
                module = module(require, output.exports, output);
            }

            return modules[moduleName] = module || output.exports;
        },
        lmd = function (misc) {
            var output = {exports: {}};
            switch (typeof misc) {
                case "function":
                    misc(require, output.exports, output);
                    break;
                case "object":
                    for (var moduleName in misc) {
                        initialized_modules[moduleName] = 0;
                        modules[moduleName] = misc[moduleName];
                    }
                    break;
            }
            return lmd;
        };
    return lmd;
}(window))