/**
 * LMD
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */
/*{*/var lmd = /*}*/(function (window) {
    var modules = {},
        initialized_modules = {},
        // debug = true,
        require = function (moduleName) {
            if (initialized_modules[moduleName] === null) {
                throw 'Module "' + moduleName + '" is recursively required';
            }
            if (initialized_modules[moduleName]) {
                return modules[moduleName];
            }
            var module = modules[moduleName]/*, time*/;
            if (!module) {
                return;
            }
            initialized_modules[moduleName] = null;
            if (typeof module === "string") {
                // if (debug)  time = +new Date();
                modules[moduleName] = (0, window.eval)(module)(require);
                // if (debug) console.log('Module "' + moduleName + '" eval time ' + (+new Date() - time) + 'ms');
            } else if (typeof module === "function") {
                modules[moduleName] = module(require);
            }
            initialized_modules[moduleName] = true;
            return modules[moduleName];
        },
        lmd = function (misc, initCallback) {
            //var time;
            switch (arguments.length) {
                case 1:
                    switch (typeof misc) {
                        // case init:
                        // 1. lmd(function(require){...})
                        case "function":
                            misc(require);
                            break;
                        // case modules archive:
                        // 2. lmd({"a": "function(require){return 100500}"})
                        case "object":
                            // reset
                            for (var moduleName in misc) {
                                delete initialized_modules[moduleName];
                                modules[moduleName] = misc[moduleName];
                            }
                            break;
                        // case init module:
                        // 3. lmd('main')
                        case "string":
                            require(misc);
                            break;
                    }
                    break;
                case 2:
                    // if (debug) time = +new Date();
                    if (Object.prototype.toString.call(misc) == '[object Array]') {
                        // case init with padding arguments:
                        // 4. lmd([window, jQuery], function (window, jQuery, require) {})
                        initCallback.apply(window, misc.push(require));
                    } else {
                        // case init with padding arguments:
                        // 5. lmd(window, function (window, require) {})
                        initCallback(misc, require);
                    }
                    // if (debug) console.log('Startup time ' + (+new Date() - time) + 'ms');
                    break;
            }
            return lmd;
        };
    return lmd;
}(window))/*{*/;/*}*/