(function (window) {
    var modules = {},
        initialized_modules = {},
        require = function (moduleName) {
            var module = modules[moduleName];
            if (!module || initialized_modules[moduleName]) {
                return module;
            }
            if (typeof module === "string") {
                module = (0, window.eval)(module);
            }
            if (typeof module === "function") {
                module = module(require);
            }
            initialized_modules[moduleName] = true;
            return modules[moduleName] = module;
        },
        lmd = function (misc) {
            switch (typeof misc) {
                case "function":
                    misc(require);
                    break;
                case "object":
                    for (var moduleName in misc) {
                        initialized_modules[moduleName] = false;
                        modules[moduleName] = misc[moduleName];
                    }
                    break;
            }
            return lmd;
        };
    return lmd;
}(window))({
"depA": function depA(require){
    return function(message) {
        console.log(message);
    }
},
"i18n": {
    "hello": "Привет"
}
})(function main(require) {
    var depA = require('depA'),
        i18n = require('i18n');
    depA(i18n.hello + ' ololo');
})