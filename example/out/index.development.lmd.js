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
}(window))({
"depA": function depA(require){
    var escape = require('depB');
    return function(message) {
        console.log(escape(message));
    }
},
"depB": function depB(require, exports, module){
    // CommonJS Module exports
    // or exports.feature = function () {}
    module.exports = function(message) {
        return message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
},
"i18n": {
    "hello": "Привет"
}
})(function main(require) {
    var print = require('depA'),
        i18n = require('i18n');

    print(i18n.hello + ' ololo');
})