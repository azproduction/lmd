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

// #183 define.amd should be defined
define.amd = {
    jQuery: true
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