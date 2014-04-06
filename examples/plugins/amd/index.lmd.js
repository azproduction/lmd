// This file was automatically generated from "index.lmd.json"
(function (global, main, modules, modules_options, options) {
    var initialized_modules = {},
        global_eval = function (code) {
            return global.Function('return ' + code)();
        },
        
        global_document = global.document,
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
            var output = {'exports': {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                // or load modules from nodejs/worker environment
                module = lmd_trigger('js:request-environment-module', moduleName, module)[1] || global[moduleName];
            } else if (typeof module === 'function') {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                var module_require = lmd_trigger('lmd-register:decorate-require', moduleName, lmd_require)[1];

                // Make sure that sandboxed modules cant require
                if (modules_options[moduleName] &&
                    modules_options[moduleName].sandbox &&
                    typeof module_require === 'function') {

                    module_require = local_undefined;
                }

                module = module(module_require, output.exports, output) || output.exports;
            }

            module = lmd_trigger('lmd-register:after-register', moduleName, module)[1];
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
                    if (result) {
                        // enable decoration
                        data = result[0] || data;
                        data2 = result[1] || data2;
                        data3 = result[2] || data3;
                    }
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
        lmd_require = function (moduleName) {
            var module = modules[moduleName];

            var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }

            lmd_trigger('*:before-check', moduleName, module);
            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }

            lmd_trigger('*:before-init', moduleName, module);

            // Lazy LMD module not a string
            if (typeof module === 'string' && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {'exports': {}},

        /**
         * Sandbox object for plugins
         *
         * @important Do not rename it!
         */
        sandbox = {
            'global': global,
            'modules': modules,
            'modules_options': modules_options,
            'options': options,

            'eval': global_eval,
            'register': register_module,
            'require': lmd_require,
            'initialized': initialized_modules,

            
            'document': global_document,
            
            

            'on': lmd_on,
            'trigger': lmd_trigger,
            'undefined': local_undefined
        };

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

/**
 * @name sandbox
 */
(function (sb) {

var amdModules = {},
    currentModule,
    currentRequire;

/**
 * RequireJS & AMD-style define
 *
 * (function (require) {
 *     var define = require.define;
 *
 *     define(["a"], function (a) {
 *          return a + 2;
 *     });
 * })
 *
 * @param name
 * @param deps
 * @param module
 */
var define = function (name, deps, module) {
    switch (arguments.length) {
        case 1: // define(function () {})
            module = name;
            deps = name = sb.undefined;
            break;

        case 2: // define(['a', 'b'], function () {})
            module = deps;
            deps = name;
            name = sb.undefined;
            break;

        case 3: // define('name', ['a', 'b'], function () {})
    }

    if (typeof module !== "function") {
        amdModules[currentModule] = module;
        return;
    }

    var output = {'exports': {}};
    if (!deps) {
        deps = ["require", "exports", "module"];
    }
    for (var i = 0, c = deps.length; i < c; i++) {
        switch (deps[i]) {
            case "require":
                deps[i] = currentRequire;
                break;
            case "module":
                deps[i] = output;
                break;
            case "exports":
                deps[i] = output.exports;
                break;
            default:
                deps[i] = currentRequire && currentRequire(deps[i]);
        }
    }
    module = module.apply(this, deps) || output.exports;
    amdModules[currentModule] = module;
};

sb.require.define = define;

// First called this than called few of define
sb.on('lmd-register:decorate-require', function (moduleName, require) {
    var options = sb.modules_options[moduleName] || {};
    // grab current require and module name
    currentModule = moduleName;

    if (options.sandbox) {
        currentRequire = sb.undefined;
        if (typeof require === "function") {
            require = {};
        }
        require.define = define;
    } else {
        currentRequire = require;
    }

    return [moduleName, require];
});

// Than called this
sb.on('lmd-register:after-register', function (moduleName, module) {
    if (amdModules.hasOwnProperty(currentModule)) {
        module = amdModules[currentModule];
        delete amdModules[currentModule];

        return [moduleName, module];
    }
});

}(sandbox));



    main(lmd_trigger('lmd-register:decorate-require', 'main', lmd_require)[1], output.exports, output);
})/*DO NOT ADD ; !*/
(this,(function (require) { /* wrapped by builder */
var define = require.define;
define(['$', 'button', 'list'], function ($, Button, List) {

    $(function () {
        var $list = new List();
        var $button = new Button('Click me');

        $button.appendTo('body')
            .on('click', function () {
                $list.trigger('item', {
                    value: "Item with random value " + Math.random()
                });
            });

        $list.appendTo('body')
    });
});

}),{
"button": (function (require) { /* wrapped by builder */
var define = require.define;
define('ignored-module-name', ['$'], function ($) {

    function Button(text) {
        return $('<button/>').text(text);
    }

    return Button;
});

}),
"list": (function (require) { /* wrapped by builder */
var define = require.define;
define(['$', 'listItem'], function ($, ListItem) {

    function List() {
        var $list = $('<ul/>');

        $list.on('item', function (e, item) {
            new ListItem(item.value).appendTo($list);
        });

        return $list;
    }

    return List;
});
}),
"listItem": (function (require) { /* wrapped by builder */
var define = require.define;
define(function (require, exports, module) {
    var $ = require('$');

    function ListItem(text) {
        var $listItem = $('<li/>').text(text);

        $listItem.click(function () {
            $(this).css('color', 'green');
        });

        return $listItem;
    }

    module.exports = ListItem;
});

})
},{},{});
