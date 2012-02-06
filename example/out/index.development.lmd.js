(function (window) {
    var modules = {},
        initialized_modules = {},
        require = function (moduleName) {
            var module = modules[moduleName],
                output;

            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }

            // Lazy LMD module
            if (typeof module === "string") {
                module = (0, window.eval)(module);
            }

            // Predefine in case of recursive require
            output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                module = window[moduleName];
            } else if (typeof module === "function") {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                module = module(require, output.exports, output) || output.exports;
            }

            return modules[moduleName] = module;
        },
        lmd = function (misc) {
            var output = {exports: {}};
            switch (typeof misc) {
                case "function":
                    misc(require, output.exports, output);
                    break;
                case "object":
                    for (var moduleName in misc) {
                        // reset module init flag in case of overwriting
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
        i18n = require('i18n'),
        $ = require('$'); // grab module from globals: LMD version 1.2.0

    var text = i18n.hello +  ', lmd';

    print(text);

    $(function () {
        $('#log').text(text);
    });
})