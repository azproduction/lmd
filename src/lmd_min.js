(function (window) {
    var modules = {},
        initialized_modules = {},
        require = function (moduleName) {
            if (initialized_modules[moduleName] === null) {
                throw 'Module "' + moduleName + '" is recursively required';
            }
            var module = modules[moduleName];
            if (!module || initialized_modules[moduleName]) {
                return module;
            }
            initialized_modules[moduleName] = null;
            if (typeof module === "string") {
                module = (0, window.eval)(module);
            }
            if (typeof module === "function") {
                module = module(require);
            }
            initialized_modules[moduleName] = 1;
            return modules[moduleName] = module;
        },
        lmd = function (misc) {
            switch (typeof misc) {
                case "function":
                    misc(require);
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