// This file was automatically generated from "index.lmd.json"
(function (global, main, modules, modules_options, options) {
    var initialized_modules = {},
        global_eval = function (code) {
            return global.Function('return ' + code)();
        },
        global_noop = function () {},
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

            'noop': global_noop,
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
    var domOnlyLoaders = {
        'css': true,
        'image': true
    };

    var reEvalable = /(java|ecma)script|json/,
        reJson = /json/;

    /**
      * Load off-package LMD module
      *
      * @param {String|Array} moduleName same origin path to LMD module
      * @param {Function}     [callback]   callback(result) undefined on error others on success
      */
    sb.on('*:preload', function (moduleName, callback, type) {
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, type), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = [replacement[0][0], callback, type];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2],
            XMLHttpRequestConstructor = sb.global.XMLHttpRequest || sb.global.ActiveXObject;

        callback = replacement[1];
        moduleName = replacement[0][1];

        if (!XMLHttpRequestConstructor) {
            sb.trigger('preload:require-environment-file', moduleName, module, callback);
            return returnResult;
        }

        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    var contentType = xhr.getResponseHeader('content-type');
                    module = xhr.responseText;
                    if (reEvalable.test(contentType)) {
                        module = sb.trigger('*:wrap-module', moduleName, module, contentType)[1];
                        if (!reJson.test(contentType)) {
                            module = sb.trigger('*:coverage-apply', moduleName, module)[1];
                        }

                        sb.trigger('preload:before-callback', moduleName, module);
                        module = sb.eval(module);
                    } else {
                        sb.trigger('preload:before-callback', moduleName, module);
                    }

                    if (type === 'preload') {
                        // 4. Declare it
                        sb.modules[moduleName] = module;
                        // 5. Then callback it
                        callback(moduleName);
                    } else {
                        // 4. Callback it
                        callback(sb.register(moduleName, module));
                    }
                } else {
                    sb.trigger('*:request-error', moduleName, module);
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return returnResult;

    });

    /**
     * @event *:request-off-package
     *
     * @param {String}   moduleName
     * @param {Function} callback
     * @param {String}   type
     *
     * @retuns yes [asap, returnResult]
     */
    sb.on('*:request-off-package', function (moduleName, callback, type) {
        
        var returnResult = sb.require;
        callback = callback || sb.noop;

        if (typeof moduleName !== "string") {
            callback = sb.trigger('*:request-parallel', moduleName, callback, sb.require[type])[1];
            if (!callback) {
                return [[returnResult, moduleName, module, true], callback, type];
            }
        }

        var module = sb.modules[moduleName];

        var replacement = sb.trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        sb.trigger('*:before-check', moduleName, module, type);
        // If module exists or its a node.js env
        if (module || (domOnlyLoaders[type] && !sb.document)) {
            callback(type === "preload" ? moduleName : sb.initialized[moduleName] ? module : sb.require(moduleName));
            return [[returnResult, moduleName, module, true], callback, type];
        }

        sb.trigger('*:before-init', moduleName, module);

        callback = sb.trigger('*:request-race', moduleName, callback)[1];
        // if already called
        if (!callback) {
            return [[returnResult, moduleName, module, true], callback, type]
        }

        return [[returnResult, moduleName, module, false], callback, type];
    });
}(sandbox));

/**
 * Async loader of off-package LMD modules (special LMD format file)
 *
 * @see /README.md near "LMD Modules types" for details
 *
 * Flag "async"
 *
 * This plugin provides require.async() function
 */
/**
 * @name sandbox
 */
(function (sb) {
    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    sb.require.async = function (moduleName, callback) {
        return sb.trigger('*:preload', moduleName, callback, 'async')[0];
    };

}(sandbox));

/**
 * Parallel resource loader
 *
 * Flag "parallel"
 *
 * This plugin provides private "parallel" function
 */

/**
 * @name sandbox
 */
(function (sb) {

function parallel(method, items, callback) {
    var i = 0,
        j = 0,
        c = items.length,
        results = [],
        ready;

    var readyFactory = function (index) {
        return function (data) {
            // keep the order
            results[index] = data;
            j++;
            if (j >= c) {
                callback.apply(sb.global, results);
            }
        }
    };

    for (; i < c; i++) {
        ready = readyFactory(i);
        method(items[i], ready);
    }
}

    /**
     * @event *:request-parallel parallel module request for require.async(['a', 'b', 'c']) etc
     *
     * @param {Array}    moduleNames list of modules to init
     * @param {Function} callback    this callback will be called when module inited
     * @param {Function} method      method to call for init
     *
     * @retuns yes empty environment
     */
sb.on('*:request-parallel', function (moduleNames, callback, method) {
    parallel(method, moduleNames, callback);
    return [];
});

}(sandbox));

/**
 * This plugin enables shortcuts
 *
 * Flag "shortcuts"
 *
 * This plugin provides private "is_shortcut" function
 */

/**
 * @name sandbox
 */
(function (sb) {

function is_shortcut(moduleName, moduleContent) {
    return !sb.initialized[moduleName] &&
           typeof moduleContent === "string" &&
           moduleContent.charAt(0) == '@';
}

function rewrite_shortcut(moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        sb.trigger('shortcuts:before-resolve', moduleName, module);

        moduleName = module.replace('@', '');
        // #66 Shortcut self reference should be resolved as undefined->global name
        var newModule = sb.modules[moduleName];
        module = newModule === module ? sb.undefined : newModule;
    }
    return [moduleName, module];
}

    /**
     * @event *:rewrite-shortcut request for shortcut rewrite
     *
     * @param {String} moduleName race for module name
     * @param {String} module     this callback will be called when module inited
     *
     * @retuns yes returns modified moduleName and module itself
     */
sb.on('*:rewrite-shortcut', rewrite_shortcut);

    /**
     * @event *:rewrite-shortcut fires before stats plugin counts require same as *:rewrite-shortcut
     *        but without triggering shortcuts:before-resolve event
     *
     * @param {String} moduleName race for module name
     * @param {String} module     this callback will be called when module inited
     *
     * @retuns yes returns modified moduleName and module itself
     */
sb.on('stats:before-require-count', function (moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        moduleName = module.replace('@', '');
        module = sb.modules[moduleName];

        return [moduleName, module];
    }
});

}(sandbox));

/**
 * Package usage statistics
 *
 * @see /README.md near "Application statistics. Require, load, eval, call statistics" for details
 *
 * Flag "stats"
 *
 * This plugin provides require.stats() function and bunch of private functions
 */


/**
 * @name LineReport
 * @type {Object}
 *
 * @property {Boolean}  lines        if false -> not called
 * @property {Array[]}  conditions   list of unused conditions [[0, 2], [7, 0]]
 * @property {String[]} functions    list of unused functions in that line
 */

/**
 * @name TypeReport
 * @type {Object}
 *
 * @property {Number} total
 * @property {Number} covered
 * @property {Number} percentage
 */

/**
 * @name LmdCoverage
 * @type {Object}
 *
 * @property {TypeReport}   lines
 * @property {TypeReport}   conditions
 * @property {TypeReport}   functions
 *
 * @property {Object}       report        {lineNum: LineReport}
 */

/**
 * @name lmdStats
 * @type {Object}
 *
 * @property {String}       name            module name
 * @property {Object}       moduleAccessTimes  module access times {byModuleName: accessTimes}
 * @property {Number[]}     accessTimes     access times
 * @property {Number}       initTime        module init time: load+eval+call
 * @property {String[]}     shortcuts       list of used shortcuts
 *
 * @property {String}       type            module type: global, in-package, off-package
 *
 * @property {String[]}     lines           list of all statements
 * @property {String[]}     conditions      list of all conditions
 * @property {String[]}     functions       list of all functions
 *
 * @property {Object}       runLines          {lineId: callTimes}
 * @property {Object}       runConditions     {conditionId: [falseTimes, trueTimes]}
 * @property {Object}       runFunctions      {functionId: callTimes}
 *
 * @property {LmdCoverage} coverage
 *
 * @example
 *  {
 *      name: "pewpew",
 *      type: "in-package",
 *      accessTimes: [0],
 *      moduleAccessTimes: [{
 *          time: 0,
 *          byModule: "main"
 *      }],
 *      initTime: 10,
 *      shortcuts: ["ololo"],
 *
 *      lines: ["4", "5", "8"],
 *      conditions: ["4:1", "5:2"],
 *      functions: ["FunctionName:5:1", "FunctionName2:9:1"],
 *
 *      runLines: {
 *          "4": 1
 *          "5": 0,
 *          "8": 14
 *      },
 *
 *      runConditions: {
 *          "4:1": [1, 0],
 *          "5:2": [0, 0]
 *      },
 *
 *      runFunctions: {
 *          "FunctionName:5:1": 10
 *          "FunctionName2:9:1": 0
 *      }
 *
 *      coverage: {
 *          lines: {
 *              total: 3,
 *              covered: 2,
 *              percentage: 66.66667
 *          },
 *
 *          conditions: {
 *              total: 2,
 *              covered: 0.5,
 *              percentage: 25
 *          },
 *
 *          functions: {
 *              total: 2,
 *              covered: 1,
 *              percentage: 50
 *          },
 *
 *          report: {
 *              "4": {
 *                  conditions: [[1, 0]]
 *              },
 *              "5": {
 *                  lines: false,
 *                  conditions: [[0, 0]]
 *              },
 *              "9": {
 *                  functions: ["FunctionName2"]
 *              }
 *          }
 *      }
 *  }
 */

/**
 * @name sandbox
 */
(function (sb) {

/**
 * @type {lmdStats}
 */
var stats_results = {},
    stats_Date = sb.global.Date,
    stats_startTime = +new stats_Date;

function stats_get(moduleName) {
    return stats_results[moduleName] ?
           stats_results[moduleName] :
           stats_results[moduleName] = {
               name: moduleName,
               accessTimes: [],
               moduleAccessTimes: {},
               initTime: -1
           };
}

function stats_initStart(moduleName) {
    stats_get(moduleName).initTime = +new stats_Date;
}

function stats_initEnd(moduleName) {
    var stat = stats_get(moduleName);
    stat.initTime = +new stats_Date - stat.initTime;
}

function stats_require(moduleName) {
    var stat = stats_get(moduleName);
    stat.accessTimes.push(+new stats_Date - stats_startTime);
}

function stats_require_module(moduleName, byModuleName) {
    var stat = stats_get(moduleName);

    if (!stat.moduleAccessTimes[byModuleName]) {
        stat.moduleAccessTimes[byModuleName] = [];
    }
    stat.moduleAccessTimes[byModuleName].push(+new stats_Date - stats_startTime);
}

function stats_wrap_require_method(method, thisObject, byModuleName) {
    return function (moduleName) {
        stats_require_modules(moduleName, byModuleName);
        return method.apply(thisObject, arguments);
    }
}

function stats_require_modules(moduleName, byModuleName) {
    var moduleNames = [];
    if (Object.prototype.toString.call(moduleName) !== "[object Array]") {
        moduleNames = [moduleName];
    } else {
        moduleNames = moduleName;
    }

    for (var i = 0, c = moduleNames.length, moduleNamesItem, module; i < c; i++) {
        moduleNamesItem = moduleNames[i];
        module = sb.modules[moduleNamesItem];

        var replacement = sb.trigger('stats:before-require-count', moduleNamesItem, module);
        if (replacement) {
            moduleNamesItem = replacement[0];
        }
        stats_require_module(moduleNamesItem, byModuleName);
    }
}

function stats_wrap_require(require, byModuleName) {
    var wrappedRequire = stats_wrap_require_method(require, this, byModuleName);

    for (var name in require) {
        wrappedRequire[name] = require[name];
    }

    if (require.async) {
        wrappedRequire.async = stats_wrap_require_method(require.async, this, byModuleName);
    }

    if (require.css) {
        wrappedRequire.css = stats_wrap_require_method(require.css, this, byModuleName);
    }

    if (require.js) {
        wrappedRequire.js = stats_wrap_require_method(require.js, this, byModuleName);
    }

    return wrappedRequire;
}

function stats_type(moduleName, type) {
    var stat = stats_get(moduleName);
    stat.type = type;
}

function stats_shortcut(moduleName, shortcut) {
    var module = stats_get(moduleName.replace('@', '')),
        shortcuts = module.shortcuts,
        index;
    
    if (!shortcuts) {
        shortcuts = module.shortcuts = [];
    }

    // Link shortcut and real module
    if (!stats_results[shortcut]) {
        stats_results[shortcut] = module;
    }

    // ie6 indexOf hackz
    index = sb.trigger('*:request-indexof', [].indexOf)[0].call(shortcuts, shortcut);

    if (index === -1) {
        shortcuts.push(shortcut);
    }
}

/**
 * Returns module statistics or all statistics
 *
 * @param {String} [moduleName]
 * @return {Object}
 */
sb.require.stats = function (moduleName) {
    var replacement = sb.trigger('stats:before-return-stats', moduleName, stats_results);

    if (replacement && replacement[1]) {
        return replacement[1];
    }
    return moduleName ? stats_results[moduleName] : stats_results;
};

    /**
     * @event lmd-register:decorate-require request for fake require
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns yes wraps require
     */
sb.on('lmd-register:decorate-require', function (moduleName, require) {
    var options = sb.modules_options[moduleName] || {};
    if (options.sandbox) {
        return;
    }
    return [moduleName, stats_wrap_require(require, moduleName)];
});

    /**
     * @event lmd-register:after-register after module register event
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns no
     */
sb.on('lmd-register:after-register', function (moduleName) {
    stats_initEnd(moduleName);
});

    /**
     * @event lmd-register:before-register before module register event
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns no
     */
sb.on('lmd-register:before-register', function (moduleName, module) {
    stats_type(moduleName, !module ? 'global' : typeof sb.modules[moduleName] === "undefined" ? 'off-package' : 'in-package');
});

    /**
     * @event *:before-check before module cache check
     *
     * @param {String} moduleName
     * @param {Object} module
     * @param {String} type
     *
     * @retuns no
     */
sb.on('*:before-check', function (moduleName, module, type) {
    switch (type) {
        case "css":
            if (!(module || !sb.document) || sb.initialized[moduleName]) {
                stats_require(moduleName);
            }
            break;
        case "js":
        case "async":
            if (!module || sb.initialized[moduleName]) {
                stats_require(moduleName);
            }
            break;
        default:
            stats_require(moduleName);
    }
});

    /**
     * @event *:before-init calls when module is goint to eval or call
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns no
     */
sb.on('*:before-init', function (moduleName) {
    stats_initStart(moduleName);
});

    /**
     * @event *:request-error module load error
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns no
     */
sb.on('*:request-error', function (moduleName) {
    stats_initEnd(moduleName);
});

    /**
     * @event shortcuts:before-resolve moduleName is shortcut and its goint to resolve with actual name
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns no
     */
sb.on('shortcuts:before-resolve', function (moduleName, module) {
    // assign shortcut name for module
    stats_shortcut(module, moduleName);
});

    /**
     * @event *:stats-get somethins is request raw module stats
     *
     * @param {String} moduleName
     * @param {Object} result    default stats
     *
     * @retuns yes
     */
sb.on('*:stats-get', function (moduleName, result) {
    return [moduleName, stats_get(moduleName)];
});

    /**
     * @event *:stats-type something tells stats to overwrite module type
     *
     * @param {String} moduleName
     * @param {String} packageType
     *
     * @retuns no
     */
sb.on('*:stats-type', function (moduleName, packageType) {
    stats_type(moduleName, packageType);
});

    /**
     * @event *:stats-results somethins is request processed module stats
     *
     * @param {String} moduleName
     * @param {Object} result     default stats
     *
     * @retuns yes
     */
sb.on('*:stats-results', function (moduleName, result) {
    return [moduleName, stats_results[moduleName]];
});

}(sandbox));

/**
 * @name sandbox
 */
(function (sb) {

/**
 * Calculate coverage total
 *
 * @param moduleName
 */
function stats_calculate_coverage(moduleName) {
    var stats = sb.trigger('*:stats-get', moduleName, null)[1],
        total,
        covered,
        lineId,
        lineNum,
        parts;

    var lineReport = {};

    if (!stats.lines) {
        return;
    }
    stats.coverage = {};

    covered = 0;
    total = stats.lines.length;
    for (lineId in stats.runLines) {
        if (stats.runLines[lineId] > 0) {
            covered++;
        } else {
            lineNum = lineId;
            if (!lineReport[lineNum]) {
                lineReport[lineNum] = {};
            }
            lineReport[lineNum].lines = false;
        }
    }
    stats.coverage.lines = {
        total: total,
        covered: covered,
        percentage: 100.0 * (total ? covered / total : 1)
    };

    covered = 0;
    total = stats.functions.length;
    for (lineId in stats.runFunctions) {
        if (stats.runFunctions[lineId] > 0) {
            covered++;
        } else {
            parts = lineId.split(':');
            lineNum = parts[1];
            if (!lineReport[lineNum]) {
                lineReport[lineNum] = {};
            }
            if (!lineReport[lineNum].functions) {
                lineReport[lineNum].functions = [];
            }
            lineReport[lineNum].functions.push(parts[0]);
        }
    }
    stats.coverage.functions = {
        total:total,
        covered:covered,
        percentage:100.0 * (total ? covered / total : 1)
    };

    covered = 0;
    total = stats.conditions.length;
    for (lineId in stats.runConditions) {
        if (stats.runConditions[lineId][1] > 0) {
            covered += 1;
        }

        if (stats.runConditions[lineId][1] === 0) {

            parts = lineId.split(':');
            lineNum = parts[1];
            if (!lineReport[lineNum]) {
                lineReport[lineNum] = {};
            }
            if (!lineReport[lineNum].conditions) {
                lineReport[lineNum].conditions = [];
            }
            lineReport[lineNum].conditions.push(stats.runConditions[lineId]);
        }
    }
    stats.coverage.conditions = {
        total:total,
        covered:covered,
        percentage:100.0 * (total ? covered / total : 1)
    };
    stats.coverage.report = lineReport;
}

/**
 * Line counter
 *
 * @private
 */
sb.require.coverage_line = function (moduleName, lineId) {
    sb.trigger('*:stats-results', moduleName, null)[1].runLines[lineId] += 1;
};

/**
 * Function call counter
 *
 * @private
 */
sb.require.coverage_function = function (moduleName, lineId) {
    sb.trigger('*:stats-results', moduleName, null)[1].runFunctions[lineId] += 1;
};

/**
 * Condition counter
 *
 * @private
 */
sb.require.coverage_condition = function (moduleName, lineId, condition) {
    sb.trigger('*:stats-results', moduleName, null)[1].runConditions[lineId][condition ? 1 : 0] += 1;
    return condition;
};

/**
 * Registers module
 *
 * @private
 */
function coverage_module(moduleName, lines, conditions, functions) {
    var stats = sb.trigger('*:stats-get', moduleName, null)[1];
    if (stats.lines) {
        return;
    }
    stats.lines = lines;
    stats.conditions = conditions;
    stats.functions = functions;
    stats.runLines = {};
    stats.runConditions = {};
    stats.runFunctions = {};
    for (var i = 0, c = lines.length; i < c; i += 1) {
        stats.runLines[lines[i]] = 0;
    }

    for (i = 0, c = conditions.length; i < c; i += 1) {
        stats.runConditions[conditions[i]] = [0, 0];
    }

    for (i = 0, c = functions.length; i < c; i += 1) {
        stats.runFunctions[functions[i]] = 0;
    }
}

(function () {
    var moduleOption;
    for (var moduleName in sb.modules_options) {
        if (sb.modules_options.hasOwnProperty(moduleName)) {
            moduleOption = sb.modules_options[moduleName];
            if (!moduleOption.coverage) {
                continue;
            }
            coverage_module(moduleName, moduleOption.lines, moduleOption.conditions, moduleOption.functions);
            sb.trigger('*:stats-type', moduleName, 'in-package');
        }
    }
})();

    /**
     * @event *:stats-coverage adds module parameters for statistics
     *
     * @param {String} moduleName
     * @param {Object} moduleOption preprocessed data for lines, conditions and functions
     *
     * @retuns no
     */
sb.on('*:stats-coverage', function (moduleName, moduleOption) {
    coverage_module(moduleName, moduleOption.lines, moduleOption.conditions, moduleOption.functions);
});

sb.on('lmd-register:decorate-require', function (moduleName, require) {
    var options = sb.modules_options[moduleName] || {};
    if (!options.sandbox) {
        return;
    }
    return [moduleName, {
        coverage_line: require.coverage_line,
        coverage_function: require.coverage_function,
        coverage_condition: require.coverage_condition
    }];
});

    /**
     * @event stats:before-return-stats stats is going to return stats data
     *        this event can modify that data
     *
     * @param {String|undefined} moduleName
     * @param {Object}           stats_results default stats
     *
     * @retuns yes depend on moduleName value returns empty array or replaces stats_results
     */
sb.on('stats:before-return-stats', function (moduleName, stats_results) {
    if (moduleName) {
        stats_calculate_coverage(moduleName);
        return [];
    } else {
        for (var moduleNameId in stats_results) {
            stats_calculate_coverage(moduleNameId);
        }
        // calculate global coverage
        var result = {
                modules: stats_results,
                global: {
                    lines: {
                        total: 0,
                        covered: 0,
                        percentage: 0
                    },

                    conditions: {
                        total: 0,
                        covered: 0,
                        percentage: 0
                    },

                    functions: {
                        total: 0,
                        covered: 0,
                        percentage: 0
                    }
                }
            },
            modulesCount = 0,
            moduleStats;

        for (var moduleName in stats_results) {
            moduleStats = stats_results[moduleName];
            // not a shortcut
            if (moduleName === moduleStats.name && moduleStats.coverage) {
                modulesCount++;
                for (var statName in moduleStats.coverage) {
                    if (statName !== "report") {
                        result.global[statName].total += moduleStats.coverage[statName].total;
                        result.global[statName].covered += moduleStats.coverage[statName].covered;
                        result.global[statName].percentage += moduleStats.coverage[statName].percentage;
                    }
                }
            }
        }
        for (statName in result.global) {
            // avg percentage
            result.global[statName].percentage /= modulesCount;
        }

        return [moduleName, result];
    }
});

}(sandbox));

/**
 * Coverage for off-package LMD modules
 *
 * Flag "stats_sendto"
 *
 * This plugin provides sendTo private function and require.stats.sendTo() public function
 *
 * This plugin depends on stats
 */
/**
 * @name sandbox
 */
(function (sb) {

/**
  * XDomain post
  *
  * @param {String} host
  * @param {String} method
  * @param {Object} data
  * @param {String} [reportName]
  *
  */
var sendTo = function () {
    var runId = function () {
            var userAgent = navigator.userAgent,
                rchrome = /(chrome)[ \/]([\w.]+)/i,
                rwebkit = /(webkit)[ \/]([\w.]+)/i,
                ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/i,
                rmsie = /(msie) ([\w.]+)/i,
                rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/i;

            userAgent = (userAgent.match(rchrome) ||
                userAgent.match(rwebkit) ||
                userAgent.match(ropera) ||
                userAgent.match(rmsie) ||
                userAgent.match(rmozilla)
            );

            return (userAgent ? userAgent.slice(1).join('-') : 'undefined-0') + '-' +
                   (new Date+'').split(' ').slice(1, 5).join('_') + '-' +
                   Math.random();
        }();

    /**
     * @return {HTMLIFrameElement}
     */
    return function (host, method, data, reportName) {
        var JSON = sb.trigger('*:request-json', sb.global.JSON)[0];

        // Add the iframe with a unique name
        var iframe = sb.document.createElement("iframe"),
            uniqueString = sb.global.Math.random();

        sb.document.body.appendChild(iframe);
        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.left = "-1000px";
        iframe.style.top = "-1000px";
        iframe.contentWindow.name = uniqueString;

        // construct a form with hidden inputs, targeting the iframe
        var form = sb.document.createElement("form");
        form.target = uniqueString;
        form.action = host + "/" + method + '/' + (reportName || runId).replace(/\/|\\|\./g, '_');
        form.method = "POST";
        form.setAttribute('accept-charset', 'utf-8');

        // repeat for each parameter
        var input = sb.document.createElement("input");
        input.type = "hidden";
        input.name = "json";
        input.value = JSON.stringify(data);
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();

        return iframe;
    }
}();

sb.require.stats.sendTo = function (host) {
    return sendTo(host, "stats", sb.require.stats());
};

}(sandbox));

/**
 * Coverage for off-package LMD modules
 *
 * Flag "stats_auto"
 *
 * This plugin depends on stats and stats_sendto
 */
/**
 * @name sandbox
 */
(function (sb) {
    var timeout,
        host = sb.options.stats_host;

    if (!host) return;

    if (host === true) {
        host = 'http://' + sb.global.location.hostname + ':8081';
    }

    function updateStats() {
        if (timeout) return;

        timeout = setTimeout(function () {
            sb.require.stats.sendTo(host);
            timeout = 0;
        }, 2000);
    }

    function registerCallbacks() {
        var events = 'click0keyup0orientationchange0resize0scroll0focus'.split(0);
        for (var i = 0, c = events.length; i < c; i++) {
            sb.document.body.addEventListener(events[i], updateStats, false);
        }
    }

    var interval = sb.global.setInterval(function () {
        if (sb.document.body) {
            sb.global.clearInterval(interval);
            registerCallbacks();
        }
    }, 100);

    sb.on('*:before-check', updateStats);
}(sandbox));



    main(lmd_trigger('lmd-register:decorate-require', 'main', lmd_require)[1], output.exports, output);
})/*DO NOT ADD ; !*/
(this,(function(require, exports, module) {
    var require = arguments[0];
    require.coverage_function("main", "(?):0:1");
    require.coverage_line("main", "1");
    var $ = require().$, Roster = require("b-roster");
    require.coverage_line("main", "4");
    new Roster($("body"));
}),{
"b-roster": (function(require, exports, module) {
    var require = arguments[0];
    require.coverage_function("b-roster", "(?):0:1");
    require.coverage_line("b-roster", "1");
    var $ = require().$;
    require.coverage_line("b-roster", "3");
    function Roster(element) {
        require.coverage_function("b-roster", "Roster:3:114");
        require.coverage_line("b-roster", "4");
        element.innerHTML += this.renderWrapper();
        require.coverage_line("b-roster", "6");
        var contactsHtml = [];
        require.coverage_line("b-roster", "8");
        for (var i = 100; i-- > 0; ) {
            require.coverage_line("b-roster", "9");
            contactsHtml.push(this.renderItem());
        }
        require.coverage_line("b-roster", "12");
        $(".b-roster").innerHTML = contactsHtml.join("");
        require.coverage_line("b-roster", "14");
        $(".b-roster").addEventListener("click", function(e) {
            require.coverage_function("b-roster", "(?):14:404");
            require.coverage_line("b-roster", "18");
            require.async([ "b-dialog", "b-talk" ], function(Dialog) {
                require.coverage_function("b-roster", "(?):18:568");
                require.coverage_line("b-roster", "19");
                new Dialog(element);
                require.coverage_line("b-roster", "20");
                require.stats.sendTo("http://localhost:8081");
            });
        }, false);
    }
    require.coverage_line("b-roster", "25");
    Roster.prototype.renderWrapper = function() {
        require.coverage_function("b-roster", "renderWrapper:25:743");
        require.coverage_line("b-roster", "26");
        return '<div class="b-roster"></div>';
    };
    require.coverage_line("b-roster", "29");
    Roster.prototype.renderItem = function() {
        require.coverage_function("b-roster", "renderItem:29:834");
        require.coverage_line("b-roster", "30");
        return '<div class="b-roster__item js-item">' + '<div class="b-roster__item__photo js-photo"></div>' + '<div class="b-roster__item__meta">' + '<div class="b-roster__item__meta__name">' + this.renderName("Test Test Test Test") + "</div>" + '<div class="b-roster__item__meta__status b-roster__item__meta__status_status_online">' + '<span class="b-roster__item__meta__status_icon"></span>' + "<span>Online</span>" + "</div>" + "</div>" + "</div>";
    };
    require.coverage_line("b-roster", "42");
    Roster.prototype.renderName = function(name) {
        require.coverage_function("b-roster", "renderName:42:1490");
        require.coverage_line("b-roster", "43");
        return Long_Long_Name_renderName0("<span>" + name + "</span>");
    };
    require.coverage_line("b-roster", "47");
    function Long_Long_Name_renderName0(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName0:47:1596");
        require.coverage_line("b-roster", "48");
        return Long_Long_Name_renderName1("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "51");
    function Long_Long_Name_renderName1(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName1:51:1728");
        require.coverage_line("b-roster", "52");
        return Long_Long_Name_renderName2("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "55");
    function Long_Long_Name_renderName2(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName2:55:1860");
        require.coverage_line("b-roster", "56");
        return Long_Long_Name_renderName3("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "59");
    function Long_Long_Name_renderName3(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName3:59:1992");
        require.coverage_line("b-roster", "60");
        return Long_Long_Name_renderName4("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "63");
    function Long_Long_Name_renderName4(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName4:63:2124");
        require.coverage_line("b-roster", "64");
        return Long_Long_Name_renderName5("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "67");
    function Long_Long_Name_renderName5(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName5:67:2256");
        require.coverage_line("b-roster", "68");
        return Long_Long_Name_renderName6("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "71");
    function Long_Long_Name_renderName6(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName6:71:2388");
        require.coverage_line("b-roster", "72");
        return Long_Long_Name_renderName7("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "75");
    function Long_Long_Name_renderName7(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName7:75:2520");
        require.coverage_line("b-roster", "76");
        return Long_Long_Name_renderName8("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "79");
    function Long_Long_Name_renderName8(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName8:79:2652");
        require.coverage_line("b-roster", "80");
        return Long_Long_Name_renderName9("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "83");
    function Long_Long_Name_renderName9(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName9:83:2784");
        require.coverage_line("b-roster", "84");
        return Long_Long_Name_renderName10("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "87");
    function Long_Long_Name_renderName10(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName10:87:2917");
        require.coverage_line("b-roster", "88");
        return Long_Long_Name_renderName11("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "91");
    function Long_Long_Name_renderName11(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName11:91:3051");
        require.coverage_line("b-roster", "92");
        return Long_Long_Name_renderName12("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "95");
    function Long_Long_Name_renderName12(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName12:95:3185");
        require.coverage_line("b-roster", "96");
        return Long_Long_Name_renderName13("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "99");
    function Long_Long_Name_renderName13(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName13:99:3319");
        require.coverage_line("b-roster", "100");
        return Long_Long_Name_renderName14("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "103");
    function Long_Long_Name_renderName14(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName14:103:3453");
        require.coverage_line("b-roster", "104");
        return Long_Long_Name_renderName15("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "107");
    function Long_Long_Name_renderName15(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName15:107:3587");
        require.coverage_line("b-roster", "108");
        return Long_Long_Name_renderName16("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "111");
    function Long_Long_Name_renderName16(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName16:111:3721");
        require.coverage_line("b-roster", "112");
        return Long_Long_Name_renderName17("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "115");
    function Long_Long_Name_renderName17(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName17:115:3855");
        require.coverage_line("b-roster", "116");
        return Long_Long_Name_renderName18("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "119");
    function Long_Long_Name_renderName18(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName18:119:3989");
        require.coverage_line("b-roster", "120");
        return Long_Long_Name_renderName19("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "123");
    function Long_Long_Name_renderName19(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName19:123:4123");
        require.coverage_line("b-roster", "124");
        return Long_Long_Name_renderName20("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "127");
    function Long_Long_Name_renderName20(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName20:127:4257");
        require.coverage_line("b-roster", "128");
        return Long_Long_Name_renderName21("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "131");
    function Long_Long_Name_renderName21(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName21:131:4391");
        require.coverage_line("b-roster", "132");
        return Long_Long_Name_renderName22("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "135");
    function Long_Long_Name_renderName22(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName22:135:4525");
        require.coverage_line("b-roster", "136");
        return Long_Long_Name_renderName23("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "139");
    function Long_Long_Name_renderName23(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName23:139:4659");
        require.coverage_line("b-roster", "140");
        return Long_Long_Name_renderName24("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "143");
    function Long_Long_Name_renderName24(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName24:143:4793");
        require.coverage_line("b-roster", "144");
        return Long_Long_Name_renderName25("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "147");
    function Long_Long_Name_renderName25(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName25:147:4927");
        require.coverage_line("b-roster", "148");
        return Long_Long_Name_renderName26("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "151");
    function Long_Long_Name_renderName26(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName26:151:5061");
        require.coverage_line("b-roster", "152");
        return Long_Long_Name_renderName27("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "155");
    function Long_Long_Name_renderName27(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName27:155:5195");
        require.coverage_line("b-roster", "156");
        return Long_Long_Name_renderName28("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "159");
    function Long_Long_Name_renderName28(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName28:159:5329");
        require.coverage_line("b-roster", "160");
        return Long_Long_Name_renderName29("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "163");
    function Long_Long_Name_renderName29(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName29:163:5463");
        require.coverage_line("b-roster", "164");
        return Long_Long_Name_renderName30("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "167");
    function Long_Long_Name_renderName30(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName30:167:5597");
        require.coverage_line("b-roster", "168");
        return Long_Long_Name_renderName31("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "171");
    function Long_Long_Name_renderName31(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName31:171:5731");
        require.coverage_line("b-roster", "172");
        return Long_Long_Name_renderName32("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "175");
    function Long_Long_Name_renderName32(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName32:175:5865");
        require.coverage_line("b-roster", "176");
        return Long_Long_Name_renderName33("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "179");
    function Long_Long_Name_renderName33(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName33:179:5999");
        require.coverage_line("b-roster", "180");
        return Long_Long_Name_renderName34("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "183");
    function Long_Long_Name_renderName34(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName34:183:6133");
        require.coverage_line("b-roster", "184");
        return Long_Long_Name_renderName35("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "187");
    function Long_Long_Name_renderName35(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName35:187:6267");
        require.coverage_line("b-roster", "188");
        return Long_Long_Name_renderName36("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "191");
    function Long_Long_Name_renderName36(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName36:191:6401");
        require.coverage_line("b-roster", "192");
        return Long_Long_Name_renderName37("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "195");
    function Long_Long_Name_renderName37(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName37:195:6535");
        require.coverage_line("b-roster", "196");
        return Long_Long_Name_renderName38("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "199");
    function Long_Long_Name_renderName38(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName38:199:6669");
        require.coverage_line("b-roster", "200");
        return Long_Long_Name_renderName39("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "203");
    function Long_Long_Name_renderName39(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName39:203:6803");
        require.coverage_line("b-roster", "204");
        return Long_Long_Name_renderName40("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "207");
    function Long_Long_Name_renderName40(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName40:207:6937");
        require.coverage_line("b-roster", "208");
        return Long_Long_Name_renderName41("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "211");
    function Long_Long_Name_renderName41(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName41:211:7071");
        require.coverage_line("b-roster", "212");
        return Long_Long_Name_renderName42("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "215");
    function Long_Long_Name_renderName42(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName42:215:7205");
        require.coverage_line("b-roster", "216");
        return Long_Long_Name_renderName43("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "219");
    function Long_Long_Name_renderName43(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName43:219:7339");
        require.coverage_line("b-roster", "220");
        return Long_Long_Name_renderName44("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "223");
    function Long_Long_Name_renderName44(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName44:223:7473");
        require.coverage_line("b-roster", "224");
        return Long_Long_Name_renderName45("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "227");
    function Long_Long_Name_renderName45(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName45:227:7607");
        require.coverage_line("b-roster", "228");
        return Long_Long_Name_renderName46("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "231");
    function Long_Long_Name_renderName46(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName46:231:7741");
        require.coverage_line("b-roster", "232");
        return Long_Long_Name_renderName47("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "235");
    function Long_Long_Name_renderName47(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName47:235:7875");
        require.coverage_line("b-roster", "236");
        return Long_Long_Name_renderName48("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "239");
    function Long_Long_Name_renderName48(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName48:239:8009");
        require.coverage_line("b-roster", "240");
        return Long_Long_Name_renderName49("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "243");
    function Long_Long_Name_renderName49(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName49:243:8143");
        require.coverage_line("b-roster", "244");
        return Long_Long_Name_renderName50("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "247");
    function Long_Long_Name_renderName50(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName50:247:8277");
        require.coverage_line("b-roster", "248");
        return Long_Long_Name_renderName51("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "251");
    function Long_Long_Name_renderName51(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName51:251:8411");
        require.coverage_line("b-roster", "252");
        return Long_Long_Name_renderName52("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "255");
    function Long_Long_Name_renderName52(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName52:255:8545");
        require.coverage_line("b-roster", "256");
        return Long_Long_Name_renderName53("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "259");
    function Long_Long_Name_renderName53(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName53:259:8679");
        require.coverage_line("b-roster", "260");
        return Long_Long_Name_renderName54("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "263");
    function Long_Long_Name_renderName54(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName54:263:8813");
        require.coverage_line("b-roster", "264");
        return Long_Long_Name_renderName55("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "267");
    function Long_Long_Name_renderName55(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName55:267:8947");
        require.coverage_line("b-roster", "268");
        return Long_Long_Name_renderName56("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "271");
    function Long_Long_Name_renderName56(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName56:271:9081");
        require.coverage_line("b-roster", "272");
        return Long_Long_Name_renderName57("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "275");
    function Long_Long_Name_renderName57(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName57:275:9215");
        require.coverage_line("b-roster", "276");
        return Long_Long_Name_renderName58("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "279");
    function Long_Long_Name_renderName58(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName58:279:9349");
        require.coverage_line("b-roster", "280");
        return Long_Long_Name_renderName59("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "283");
    function Long_Long_Name_renderName59(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName59:283:9483");
        require.coverage_line("b-roster", "284");
        return Long_Long_Name_renderName60("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "287");
    function Long_Long_Name_renderName60(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName60:287:9617");
        require.coverage_line("b-roster", "288");
        return Long_Long_Name_renderName61("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "291");
    function Long_Long_Name_renderName61(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName61:291:9751");
        require.coverage_line("b-roster", "292");
        return Long_Long_Name_renderName62("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "295");
    function Long_Long_Name_renderName62(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName62:295:9885");
        require.coverage_line("b-roster", "296");
        return Long_Long_Name_renderName63("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "299");
    function Long_Long_Name_renderName63(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName63:299:10019");
        require.coverage_line("b-roster", "300");
        return Long_Long_Name_renderName64("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "303");
    function Long_Long_Name_renderName64(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName64:303:10153");
        require.coverage_line("b-roster", "304");
        return Long_Long_Name_renderName65("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "307");
    function Long_Long_Name_renderName65(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName65:307:10287");
        require.coverage_line("b-roster", "308");
        return Long_Long_Name_renderName66("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "311");
    function Long_Long_Name_renderName66(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName66:311:10421");
        require.coverage_line("b-roster", "312");
        return Long_Long_Name_renderName67("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "315");
    function Long_Long_Name_renderName67(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName67:315:10555");
        require.coverage_line("b-roster", "316");
        return Long_Long_Name_renderName68("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "319");
    function Long_Long_Name_renderName68(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName68:319:10689");
        require.coverage_line("b-roster", "320");
        return Long_Long_Name_renderName69("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "323");
    function Long_Long_Name_renderName69(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName69:323:10823");
        require.coverage_line("b-roster", "324");
        return Long_Long_Name_renderName70("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "327");
    function Long_Long_Name_renderName70(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName70:327:10957");
        require.coverage_line("b-roster", "328");
        return Long_Long_Name_renderName71("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "331");
    function Long_Long_Name_renderName71(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName71:331:11091");
        require.coverage_line("b-roster", "332");
        return Long_Long_Name_renderName72("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "335");
    function Long_Long_Name_renderName72(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName72:335:11225");
        require.coverage_line("b-roster", "336");
        return Long_Long_Name_renderName73("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "339");
    function Long_Long_Name_renderName73(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName73:339:11359");
        require.coverage_line("b-roster", "340");
        return Long_Long_Name_renderName74("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "343");
    function Long_Long_Name_renderName74(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName74:343:11493");
        require.coverage_line("b-roster", "344");
        return Long_Long_Name_renderName75("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "347");
    function Long_Long_Name_renderName75(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName75:347:11627");
        require.coverage_line("b-roster", "348");
        return Long_Long_Name_renderName76("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "351");
    function Long_Long_Name_renderName76(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName76:351:11761");
        require.coverage_line("b-roster", "352");
        return Long_Long_Name_renderName77("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "355");
    function Long_Long_Name_renderName77(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName77:355:11895");
        require.coverage_line("b-roster", "356");
        return Long_Long_Name_renderName78("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "359");
    function Long_Long_Name_renderName78(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName78:359:12029");
        require.coverage_line("b-roster", "360");
        return Long_Long_Name_renderName79("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "363");
    function Long_Long_Name_renderName79(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName79:363:12163");
        require.coverage_line("b-roster", "364");
        return Long_Long_Name_renderName80("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "367");
    function Long_Long_Name_renderName80(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName80:367:12297");
        require.coverage_line("b-roster", "368");
        return Long_Long_Name_renderName81("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "371");
    function Long_Long_Name_renderName81(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName81:371:12431");
        require.coverage_line("b-roster", "372");
        return Long_Long_Name_renderName82("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "375");
    function Long_Long_Name_renderName82(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName82:375:12565");
        require.coverage_line("b-roster", "376");
        return Long_Long_Name_renderName83("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "379");
    function Long_Long_Name_renderName83(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName83:379:12699");
        require.coverage_line("b-roster", "380");
        return Long_Long_Name_renderName84("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "383");
    function Long_Long_Name_renderName84(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName84:383:12833");
        require.coverage_line("b-roster", "384");
        return Long_Long_Name_renderName85("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "387");
    function Long_Long_Name_renderName85(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName85:387:12967");
        require.coverage_line("b-roster", "388");
        return Long_Long_Name_renderName86("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "391");
    function Long_Long_Name_renderName86(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName86:391:13101");
        require.coverage_line("b-roster", "392");
        return Long_Long_Name_renderName87("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "395");
    function Long_Long_Name_renderName87(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName87:395:13235");
        require.coverage_line("b-roster", "396");
        return Long_Long_Name_renderName88("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "399");
    function Long_Long_Name_renderName88(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName88:399:13369");
        require.coverage_line("b-roster", "400");
        return Long_Long_Name_renderName89("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "403");
    function Long_Long_Name_renderName89(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName89:403:13503");
        require.coverage_line("b-roster", "404");
        return Long_Long_Name_renderName90("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "407");
    function Long_Long_Name_renderName90(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName90:407:13637");
        require.coverage_line("b-roster", "408");
        return Long_Long_Name_renderName91("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "411");
    function Long_Long_Name_renderName91(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName91:411:13771");
        require.coverage_line("b-roster", "412");
        return Long_Long_Name_renderName92("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "415");
    function Long_Long_Name_renderName92(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName92:415:13905");
        require.coverage_line("b-roster", "416");
        return Long_Long_Name_renderName93("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "419");
    function Long_Long_Name_renderName93(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName93:419:14039");
        require.coverage_line("b-roster", "420");
        return Long_Long_Name_renderName94("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "423");
    function Long_Long_Name_renderName94(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName94:423:14173");
        require.coverage_line("b-roster", "424");
        return Long_Long_Name_renderName95("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "427");
    function Long_Long_Name_renderName95(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName95:427:14307");
        require.coverage_line("b-roster", "428");
        return Long_Long_Name_renderName96("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "431");
    function Long_Long_Name_renderName96(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName96:431:14441");
        require.coverage_line("b-roster", "432");
        return Long_Long_Name_renderName97("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "435");
    function Long_Long_Name_renderName97(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName97:435:14575");
        require.coverage_line("b-roster", "436");
        return Long_Long_Name_renderName98("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "439");
    function Long_Long_Name_renderName98(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName98:439:14709");
        require.coverage_line("b-roster", "440");
        return Long_Long_Name_renderName99("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "443");
    function Long_Long_Name_renderName99(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName99:443:14843");
        require.coverage_line("b-roster", "444");
        return Long_Long_Name_renderName100("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "447");
    function Long_Long_Name_renderName100(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName100:447:14978");
        require.coverage_line("b-roster", "448");
        return Long_Long_Name_renderName101("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "451");
    function Long_Long_Name_renderName101(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName101:451:15114");
        require.coverage_line("b-roster", "452");
        return Long_Long_Name_renderName102("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "455");
    function Long_Long_Name_renderName102(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName102:455:15250");
        require.coverage_line("b-roster", "456");
        return Long_Long_Name_renderName103("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "459");
    function Long_Long_Name_renderName103(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName103:459:15386");
        require.coverage_line("b-roster", "460");
        return Long_Long_Name_renderName104("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "463");
    function Long_Long_Name_renderName104(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName104:463:15522");
        require.coverage_line("b-roster", "464");
        return Long_Long_Name_renderName105("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "467");
    function Long_Long_Name_renderName105(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName105:467:15658");
        require.coverage_line("b-roster", "468");
        return Long_Long_Name_renderName106("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "471");
    function Long_Long_Name_renderName106(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName106:471:15794");
        require.coverage_line("b-roster", "472");
        return Long_Long_Name_renderName107("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "475");
    function Long_Long_Name_renderName107(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName107:475:15930");
        require.coverage_line("b-roster", "476");
        return Long_Long_Name_renderName108("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "479");
    function Long_Long_Name_renderName108(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName108:479:16066");
        require.coverage_line("b-roster", "480");
        return Long_Long_Name_renderName109("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "483");
    function Long_Long_Name_renderName109(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName109:483:16202");
        require.coverage_line("b-roster", "484");
        return Long_Long_Name_renderName110("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "487");
    function Long_Long_Name_renderName110(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName110:487:16338");
        require.coverage_line("b-roster", "488");
        return Long_Long_Name_renderName111("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "491");
    function Long_Long_Name_renderName111(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName111:491:16474");
        require.coverage_line("b-roster", "492");
        return Long_Long_Name_renderName112("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "495");
    function Long_Long_Name_renderName112(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName112:495:16610");
        require.coverage_line("b-roster", "496");
        return Long_Long_Name_renderName113("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "499");
    function Long_Long_Name_renderName113(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName113:499:16746");
        require.coverage_line("b-roster", "500");
        return Long_Long_Name_renderName114("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "503");
    function Long_Long_Name_renderName114(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName114:503:16882");
        require.coverage_line("b-roster", "504");
        return Long_Long_Name_renderName115("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "507");
    function Long_Long_Name_renderName115(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName115:507:17018");
        require.coverage_line("b-roster", "508");
        return Long_Long_Name_renderName116("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "511");
    function Long_Long_Name_renderName116(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName116:511:17154");
        require.coverage_line("b-roster", "512");
        return Long_Long_Name_renderName117("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "515");
    function Long_Long_Name_renderName117(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName117:515:17290");
        require.coverage_line("b-roster", "516");
        return Long_Long_Name_renderName118("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "519");
    function Long_Long_Name_renderName118(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName118:519:17426");
        require.coverage_line("b-roster", "520");
        return Long_Long_Name_renderName119("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "523");
    function Long_Long_Name_renderName119(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName119:523:17562");
        require.coverage_line("b-roster", "524");
        return Long_Long_Name_renderName120("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "527");
    function Long_Long_Name_renderName120(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName120:527:17698");
        require.coverage_line("b-roster", "528");
        return Long_Long_Name_renderName121("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "531");
    function Long_Long_Name_renderName121(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName121:531:17834");
        require.coverage_line("b-roster", "532");
        return Long_Long_Name_renderName122("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "535");
    function Long_Long_Name_renderName122(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName122:535:17970");
        require.coverage_line("b-roster", "536");
        return Long_Long_Name_renderName123("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "539");
    function Long_Long_Name_renderName123(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName123:539:18106");
        require.coverage_line("b-roster", "540");
        return Long_Long_Name_renderName124("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "543");
    function Long_Long_Name_renderName124(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName124:543:18242");
        require.coverage_line("b-roster", "544");
        return Long_Long_Name_renderName125("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "547");
    function Long_Long_Name_renderName125(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName125:547:18378");
        require.coverage_line("b-roster", "548");
        return Long_Long_Name_renderName126("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "551");
    function Long_Long_Name_renderName126(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName126:551:18514");
        require.coverage_line("b-roster", "552");
        return Long_Long_Name_renderName127("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "555");
    function Long_Long_Name_renderName127(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName127:555:18650");
        require.coverage_line("b-roster", "556");
        return Long_Long_Name_renderName128("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "559");
    function Long_Long_Name_renderName128(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName128:559:18786");
        require.coverage_line("b-roster", "560");
        return Long_Long_Name_renderName129("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "563");
    function Long_Long_Name_renderName129(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName129:563:18922");
        require.coverage_line("b-roster", "564");
        return Long_Long_Name_renderName130("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "567");
    function Long_Long_Name_renderName130(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName130:567:19058");
        require.coverage_line("b-roster", "568");
        return Long_Long_Name_renderName131("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "571");
    function Long_Long_Name_renderName131(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName131:571:19194");
        require.coverage_line("b-roster", "572");
        return Long_Long_Name_renderName132("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "575");
    function Long_Long_Name_renderName132(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName132:575:19330");
        require.coverage_line("b-roster", "576");
        return Long_Long_Name_renderName133("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "579");
    function Long_Long_Name_renderName133(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName133:579:19466");
        require.coverage_line("b-roster", "580");
        return Long_Long_Name_renderName134("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "583");
    function Long_Long_Name_renderName134(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName134:583:19602");
        require.coverage_line("b-roster", "584");
        return Long_Long_Name_renderName135("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "587");
    function Long_Long_Name_renderName135(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName135:587:19738");
        require.coverage_line("b-roster", "588");
        return Long_Long_Name_renderName136("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "591");
    function Long_Long_Name_renderName136(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName136:591:19874");
        require.coverage_line("b-roster", "592");
        return Long_Long_Name_renderName137("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "595");
    function Long_Long_Name_renderName137(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName137:595:20010");
        require.coverage_line("b-roster", "596");
        return Long_Long_Name_renderName138("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "599");
    function Long_Long_Name_renderName138(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName138:599:20146");
        require.coverage_line("b-roster", "600");
        return Long_Long_Name_renderName139("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "603");
    function Long_Long_Name_renderName139(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName139:603:20282");
        require.coverage_line("b-roster", "604");
        return Long_Long_Name_renderName140("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "607");
    function Long_Long_Name_renderName140(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName140:607:20418");
        require.coverage_line("b-roster", "608");
        return Long_Long_Name_renderName141("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "611");
    function Long_Long_Name_renderName141(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName141:611:20554");
        require.coverage_line("b-roster", "612");
        return Long_Long_Name_renderName142("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "615");
    function Long_Long_Name_renderName142(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName142:615:20690");
        require.coverage_line("b-roster", "616");
        return Long_Long_Name_renderName143("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "619");
    function Long_Long_Name_renderName143(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName143:619:20826");
        require.coverage_line("b-roster", "620");
        return Long_Long_Name_renderName144("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "623");
    function Long_Long_Name_renderName144(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName144:623:20962");
        require.coverage_line("b-roster", "624");
        return Long_Long_Name_renderName145("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "627");
    function Long_Long_Name_renderName145(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName145:627:21098");
        require.coverage_line("b-roster", "628");
        return Long_Long_Name_renderName146("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "631");
    function Long_Long_Name_renderName146(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName146:631:21234");
        require.coverage_line("b-roster", "632");
        return Long_Long_Name_renderName147("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "635");
    function Long_Long_Name_renderName147(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName147:635:21370");
        require.coverage_line("b-roster", "636");
        return Long_Long_Name_renderName148("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "639");
    function Long_Long_Name_renderName148(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName148:639:21506");
        require.coverage_line("b-roster", "640");
        return Long_Long_Name_renderName149("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "643");
    function Long_Long_Name_renderName149(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName149:643:21642");
        require.coverage_line("b-roster", "644");
        return Long_Long_Name_renderName150("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "647");
    function Long_Long_Name_renderName150(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName150:647:21778");
        require.coverage_line("b-roster", "648");
        return Long_Long_Name_renderName151("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "651");
    function Long_Long_Name_renderName151(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName151:651:21914");
        require.coverage_line("b-roster", "652");
        return Long_Long_Name_renderName152("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "655");
    function Long_Long_Name_renderName152(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName152:655:22050");
        require.coverage_line("b-roster", "656");
        return Long_Long_Name_renderName153("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "659");
    function Long_Long_Name_renderName153(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName153:659:22186");
        require.coverage_line("b-roster", "660");
        return Long_Long_Name_renderName154("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "663");
    function Long_Long_Name_renderName154(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName154:663:22322");
        require.coverage_line("b-roster", "664");
        return Long_Long_Name_renderName155("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "667");
    function Long_Long_Name_renderName155(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName155:667:22458");
        require.coverage_line("b-roster", "668");
        return Long_Long_Name_renderName156("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "671");
    function Long_Long_Name_renderName156(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName156:671:22594");
        require.coverage_line("b-roster", "672");
        return Long_Long_Name_renderName157("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "675");
    function Long_Long_Name_renderName157(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName157:675:22730");
        require.coverage_line("b-roster", "676");
        return Long_Long_Name_renderName158("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "679");
    function Long_Long_Name_renderName158(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName158:679:22866");
        require.coverage_line("b-roster", "680");
        return Long_Long_Name_renderName159("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "683");
    function Long_Long_Name_renderName159(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName159:683:23002");
        require.coverage_line("b-roster", "684");
        return Long_Long_Name_renderName160("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "687");
    function Long_Long_Name_renderName160(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName160:687:23138");
        require.coverage_line("b-roster", "688");
        return Long_Long_Name_renderName161("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "691");
    function Long_Long_Name_renderName161(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName161:691:23274");
        require.coverage_line("b-roster", "692");
        return Long_Long_Name_renderName162("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "695");
    function Long_Long_Name_renderName162(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName162:695:23410");
        require.coverage_line("b-roster", "696");
        return Long_Long_Name_renderName163("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "699");
    function Long_Long_Name_renderName163(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName163:699:23546");
        require.coverage_line("b-roster", "700");
        return Long_Long_Name_renderName164("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "703");
    function Long_Long_Name_renderName164(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName164:703:23682");
        require.coverage_line("b-roster", "704");
        return Long_Long_Name_renderName165("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "707");
    function Long_Long_Name_renderName165(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName165:707:23818");
        require.coverage_line("b-roster", "708");
        return Long_Long_Name_renderName166("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "711");
    function Long_Long_Name_renderName166(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName166:711:23954");
        require.coverage_line("b-roster", "712");
        return Long_Long_Name_renderName167("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "715");
    function Long_Long_Name_renderName167(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName167:715:24090");
        require.coverage_line("b-roster", "716");
        return Long_Long_Name_renderName168("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "719");
    function Long_Long_Name_renderName168(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName168:719:24226");
        require.coverage_line("b-roster", "720");
        return Long_Long_Name_renderName169("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "723");
    function Long_Long_Name_renderName169(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName169:723:24362");
        require.coverage_line("b-roster", "724");
        return Long_Long_Name_renderName170("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "727");
    function Long_Long_Name_renderName170(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName170:727:24498");
        require.coverage_line("b-roster", "728");
        return Long_Long_Name_renderName171("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "731");
    function Long_Long_Name_renderName171(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName171:731:24634");
        require.coverage_line("b-roster", "732");
        return Long_Long_Name_renderName172("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "735");
    function Long_Long_Name_renderName172(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName172:735:24770");
        require.coverage_line("b-roster", "736");
        return Long_Long_Name_renderName173("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "739");
    function Long_Long_Name_renderName173(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName173:739:24906");
        require.coverage_line("b-roster", "740");
        return Long_Long_Name_renderName174("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "743");
    function Long_Long_Name_renderName174(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName174:743:25042");
        require.coverage_line("b-roster", "744");
        return Long_Long_Name_renderName175("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "747");
    function Long_Long_Name_renderName175(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName175:747:25178");
        require.coverage_line("b-roster", "748");
        return Long_Long_Name_renderName176("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "751");
    function Long_Long_Name_renderName176(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName176:751:25314");
        require.coverage_line("b-roster", "752");
        return Long_Long_Name_renderName177("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "755");
    function Long_Long_Name_renderName177(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName177:755:25450");
        require.coverage_line("b-roster", "756");
        return Long_Long_Name_renderName178("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "759");
    function Long_Long_Name_renderName178(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName178:759:25586");
        require.coverage_line("b-roster", "760");
        return Long_Long_Name_renderName179("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "763");
    function Long_Long_Name_renderName179(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName179:763:25722");
        require.coverage_line("b-roster", "764");
        return Long_Long_Name_renderName180("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "767");
    function Long_Long_Name_renderName180(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName180:767:25858");
        require.coverage_line("b-roster", "768");
        return Long_Long_Name_renderName181("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "771");
    function Long_Long_Name_renderName181(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName181:771:25994");
        require.coverage_line("b-roster", "772");
        return Long_Long_Name_renderName182("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "775");
    function Long_Long_Name_renderName182(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName182:775:26130");
        require.coverage_line("b-roster", "776");
        return Long_Long_Name_renderName183("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "779");
    function Long_Long_Name_renderName183(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName183:779:26266");
        require.coverage_line("b-roster", "780");
        return Long_Long_Name_renderName184("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "783");
    function Long_Long_Name_renderName184(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName184:783:26402");
        require.coverage_line("b-roster", "784");
        return Long_Long_Name_renderName185("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "787");
    function Long_Long_Name_renderName185(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName185:787:26538");
        require.coverage_line("b-roster", "788");
        return Long_Long_Name_renderName186("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "791");
    function Long_Long_Name_renderName186(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName186:791:26674");
        require.coverage_line("b-roster", "792");
        return Long_Long_Name_renderName187("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "795");
    function Long_Long_Name_renderName187(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName187:795:26810");
        require.coverage_line("b-roster", "796");
        return Long_Long_Name_renderName188("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "799");
    function Long_Long_Name_renderName188(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName188:799:26946");
        require.coverage_line("b-roster", "800");
        return Long_Long_Name_renderName189("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "803");
    function Long_Long_Name_renderName189(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName189:803:27082");
        require.coverage_line("b-roster", "804");
        return Long_Long_Name_renderName190("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "807");
    function Long_Long_Name_renderName190(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName190:807:27218");
        require.coverage_line("b-roster", "808");
        return Long_Long_Name_renderName191("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "811");
    function Long_Long_Name_renderName191(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName191:811:27354");
        require.coverage_line("b-roster", "812");
        return Long_Long_Name_renderName192("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "815");
    function Long_Long_Name_renderName192(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName192:815:27490");
        require.coverage_line("b-roster", "816");
        return Long_Long_Name_renderName193("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "819");
    function Long_Long_Name_renderName193(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName193:819:27626");
        require.coverage_line("b-roster", "820");
        return Long_Long_Name_renderName194("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "823");
    function Long_Long_Name_renderName194(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName194:823:27762");
        require.coverage_line("b-roster", "824");
        return Long_Long_Name_renderName195("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "827");
    function Long_Long_Name_renderName195(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName195:827:27898");
        require.coverage_line("b-roster", "828");
        return Long_Long_Name_renderName196("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "831");
    function Long_Long_Name_renderName196(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName196:831:28034");
        require.coverage_line("b-roster", "832");
        return Long_Long_Name_renderName197("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "835");
    function Long_Long_Name_renderName197(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName197:835:28170");
        require.coverage_line("b-roster", "836");
        return Long_Long_Name_renderName198("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "839");
    function Long_Long_Name_renderName198(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName198:839:28306");
        require.coverage_line("b-roster", "840");
        return Long_Long_Name_renderName199("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "843");
    function Long_Long_Name_renderName199(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName199:843:28442");
        require.coverage_line("b-roster", "844");
        return Long_Long_Name_renderName200("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "847");
    function Long_Long_Name_renderName200(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName200:847:28578");
        require.coverage_line("b-roster", "848");
        return Long_Long_Name_renderName201("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "851");
    function Long_Long_Name_renderName201(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName201:851:28714");
        require.coverage_line("b-roster", "852");
        return Long_Long_Name_renderName202("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "855");
    function Long_Long_Name_renderName202(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName202:855:28850");
        require.coverage_line("b-roster", "856");
        return Long_Long_Name_renderName203("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "859");
    function Long_Long_Name_renderName203(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName203:859:28986");
        require.coverage_line("b-roster", "860");
        return Long_Long_Name_renderName204("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "863");
    function Long_Long_Name_renderName204(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName204:863:29122");
        require.coverage_line("b-roster", "864");
        return Long_Long_Name_renderName205("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "867");
    function Long_Long_Name_renderName205(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName205:867:29258");
        require.coverage_line("b-roster", "868");
        return Long_Long_Name_renderName206("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "871");
    function Long_Long_Name_renderName206(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName206:871:29394");
        require.coverage_line("b-roster", "872");
        return Long_Long_Name_renderName207("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "875");
    function Long_Long_Name_renderName207(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName207:875:29530");
        require.coverage_line("b-roster", "876");
        return Long_Long_Name_renderName208("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "879");
    function Long_Long_Name_renderName208(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName208:879:29666");
        require.coverage_line("b-roster", "880");
        return Long_Long_Name_renderName209("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "883");
    function Long_Long_Name_renderName209(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName209:883:29802");
        require.coverage_line("b-roster", "884");
        return Long_Long_Name_renderName210("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "887");
    function Long_Long_Name_renderName210(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName210:887:29938");
        require.coverage_line("b-roster", "888");
        return Long_Long_Name_renderName211("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "891");
    function Long_Long_Name_renderName211(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName211:891:30074");
        require.coverage_line("b-roster", "892");
        return Long_Long_Name_renderName212("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "895");
    function Long_Long_Name_renderName212(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName212:895:30210");
        require.coverage_line("b-roster", "896");
        return Long_Long_Name_renderName213("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "899");
    function Long_Long_Name_renderName213(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName213:899:30346");
        require.coverage_line("b-roster", "900");
        return Long_Long_Name_renderName214("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "903");
    function Long_Long_Name_renderName214(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName214:903:30482");
        require.coverage_line("b-roster", "904");
        return Long_Long_Name_renderName215("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "907");
    function Long_Long_Name_renderName215(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName215:907:30618");
        require.coverage_line("b-roster", "908");
        return Long_Long_Name_renderName216("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "911");
    function Long_Long_Name_renderName216(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName216:911:30754");
        require.coverage_line("b-roster", "912");
        return Long_Long_Name_renderName217("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "915");
    function Long_Long_Name_renderName217(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName217:915:30890");
        require.coverage_line("b-roster", "916");
        return Long_Long_Name_renderName218("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "919");
    function Long_Long_Name_renderName218(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName218:919:31026");
        require.coverage_line("b-roster", "920");
        return Long_Long_Name_renderName219("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "923");
    function Long_Long_Name_renderName219(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName219:923:31162");
        require.coverage_line("b-roster", "924");
        return Long_Long_Name_renderName220("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "927");
    function Long_Long_Name_renderName220(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName220:927:31298");
        require.coverage_line("b-roster", "928");
        return Long_Long_Name_renderName221("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "931");
    function Long_Long_Name_renderName221(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName221:931:31434");
        require.coverage_line("b-roster", "932");
        return Long_Long_Name_renderName222("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "935");
    function Long_Long_Name_renderName222(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName222:935:31570");
        require.coverage_line("b-roster", "936");
        return Long_Long_Name_renderName223("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "939");
    function Long_Long_Name_renderName223(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName223:939:31706");
        require.coverage_line("b-roster", "940");
        return Long_Long_Name_renderName224("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "943");
    function Long_Long_Name_renderName224(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName224:943:31842");
        require.coverage_line("b-roster", "944");
        return Long_Long_Name_renderName225("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "947");
    function Long_Long_Name_renderName225(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName225:947:31978");
        require.coverage_line("b-roster", "948");
        return Long_Long_Name_renderName226("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "951");
    function Long_Long_Name_renderName226(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName226:951:32114");
        require.coverage_line("b-roster", "952");
        return Long_Long_Name_renderName227("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "955");
    function Long_Long_Name_renderName227(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName227:955:32250");
        require.coverage_line("b-roster", "956");
        return Long_Long_Name_renderName228("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "959");
    function Long_Long_Name_renderName228(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName228:959:32386");
        require.coverage_line("b-roster", "960");
        return Long_Long_Name_renderName229("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "963");
    function Long_Long_Name_renderName229(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName229:963:32522");
        require.coverage_line("b-roster", "964");
        return Long_Long_Name_renderName230("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "967");
    function Long_Long_Name_renderName230(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName230:967:32658");
        require.coverage_line("b-roster", "968");
        return Long_Long_Name_renderName231("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "971");
    function Long_Long_Name_renderName231(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName231:971:32794");
        require.coverage_line("b-roster", "972");
        return Long_Long_Name_renderName232("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "975");
    function Long_Long_Name_renderName232(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName232:975:32930");
        require.coverage_line("b-roster", "976");
        return Long_Long_Name_renderName233("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "979");
    function Long_Long_Name_renderName233(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName233:979:33066");
        require.coverage_line("b-roster", "980");
        return Long_Long_Name_renderName234("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "983");
    function Long_Long_Name_renderName234(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName234:983:33202");
        require.coverage_line("b-roster", "984");
        return Long_Long_Name_renderName235("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "987");
    function Long_Long_Name_renderName235(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName235:987:33338");
        require.coverage_line("b-roster", "988");
        return Long_Long_Name_renderName236("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "991");
    function Long_Long_Name_renderName236(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName236:991:33474");
        require.coverage_line("b-roster", "992");
        return Long_Long_Name_renderName237("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "995");
    function Long_Long_Name_renderName237(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName237:995:33610");
        require.coverage_line("b-roster", "996");
        return Long_Long_Name_renderName238("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "999");
    function Long_Long_Name_renderName238(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName238:999:33746");
        require.coverage_line("b-roster", "1000");
        return Long_Long_Name_renderName239("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1003");
    function Long_Long_Name_renderName239(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName239:1003:33882");
        require.coverage_line("b-roster", "1004");
        return Long_Long_Name_renderName240("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1007");
    function Long_Long_Name_renderName240(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName240:1007:34018");
        require.coverage_line("b-roster", "1008");
        return Long_Long_Name_renderName241("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1011");
    function Long_Long_Name_renderName241(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName241:1011:34154");
        require.coverage_line("b-roster", "1012");
        return Long_Long_Name_renderName242("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1015");
    function Long_Long_Name_renderName242(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName242:1015:34290");
        require.coverage_line("b-roster", "1016");
        return Long_Long_Name_renderName243("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1019");
    function Long_Long_Name_renderName243(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName243:1019:34426");
        require.coverage_line("b-roster", "1020");
        return Long_Long_Name_renderName244("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1023");
    function Long_Long_Name_renderName244(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName244:1023:34562");
        require.coverage_line("b-roster", "1024");
        return Long_Long_Name_renderName245("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1027");
    function Long_Long_Name_renderName245(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName245:1027:34698");
        require.coverage_line("b-roster", "1028");
        return Long_Long_Name_renderName246("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1031");
    function Long_Long_Name_renderName246(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName246:1031:34834");
        require.coverage_line("b-roster", "1032");
        return Long_Long_Name_renderName247("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1035");
    function Long_Long_Name_renderName247(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName247:1035:34970");
        require.coverage_line("b-roster", "1036");
        return Long_Long_Name_renderName248("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1039");
    function Long_Long_Name_renderName248(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName248:1039:35106");
        require.coverage_line("b-roster", "1040");
        return Long_Long_Name_renderName249("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1043");
    function Long_Long_Name_renderName249(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName249:1043:35242");
        require.coverage_line("b-roster", "1044");
        return Long_Long_Name_renderName250("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1047");
    function Long_Long_Name_renderName250(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName250:1047:35378");
        require.coverage_line("b-roster", "1048");
        return Long_Long_Name_renderName251("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1051");
    function Long_Long_Name_renderName251(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName251:1051:35514");
        require.coverage_line("b-roster", "1052");
        return Long_Long_Name_renderName252("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1055");
    function Long_Long_Name_renderName252(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName252:1055:35650");
        require.coverage_line("b-roster", "1056");
        return Long_Long_Name_renderName253("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1059");
    function Long_Long_Name_renderName253(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName253:1059:35786");
        require.coverage_line("b-roster", "1060");
        return Long_Long_Name_renderName254("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1063");
    function Long_Long_Name_renderName254(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName254:1063:35922");
        require.coverage_line("b-roster", "1064");
        return Long_Long_Name_renderName255("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1067");
    function Long_Long_Name_renderName255(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName255:1067:36058");
        require.coverage_line("b-roster", "1068");
        return Long_Long_Name_renderName256("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1071");
    function Long_Long_Name_renderName256(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName256:1071:36194");
        require.coverage_line("b-roster", "1072");
        return Long_Long_Name_renderName257("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1075");
    function Long_Long_Name_renderName257(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName257:1075:36330");
        require.coverage_line("b-roster", "1076");
        return Long_Long_Name_renderName258("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1079");
    function Long_Long_Name_renderName258(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName258:1079:36466");
        require.coverage_line("b-roster", "1080");
        return Long_Long_Name_renderName259("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1083");
    function Long_Long_Name_renderName259(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName259:1083:36602");
        require.coverage_line("b-roster", "1084");
        return Long_Long_Name_renderName260("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1087");
    function Long_Long_Name_renderName260(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName260:1087:36738");
        require.coverage_line("b-roster", "1088");
        return Long_Long_Name_renderName261("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1091");
    function Long_Long_Name_renderName261(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName261:1091:36874");
        require.coverage_line("b-roster", "1092");
        return Long_Long_Name_renderName262("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1095");
    function Long_Long_Name_renderName262(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName262:1095:37010");
        require.coverage_line("b-roster", "1096");
        return Long_Long_Name_renderName263("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1099");
    function Long_Long_Name_renderName263(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName263:1099:37146");
        require.coverage_line("b-roster", "1100");
        return Long_Long_Name_renderName264("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1103");
    function Long_Long_Name_renderName264(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName264:1103:37282");
        require.coverage_line("b-roster", "1104");
        return Long_Long_Name_renderName265("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1107");
    function Long_Long_Name_renderName265(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName265:1107:37418");
        require.coverage_line("b-roster", "1108");
        return Long_Long_Name_renderName266("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1111");
    function Long_Long_Name_renderName266(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName266:1111:37554");
        require.coverage_line("b-roster", "1112");
        return Long_Long_Name_renderName267("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1115");
    function Long_Long_Name_renderName267(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName267:1115:37690");
        require.coverage_line("b-roster", "1116");
        return Long_Long_Name_renderName268("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1119");
    function Long_Long_Name_renderName268(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName268:1119:37826");
        require.coverage_line("b-roster", "1120");
        return Long_Long_Name_renderName269("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1123");
    function Long_Long_Name_renderName269(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName269:1123:37962");
        require.coverage_line("b-roster", "1124");
        return Long_Long_Name_renderName270("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1127");
    function Long_Long_Name_renderName270(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName270:1127:38098");
        require.coverage_line("b-roster", "1128");
        return Long_Long_Name_renderName271("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1131");
    function Long_Long_Name_renderName271(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName271:1131:38234");
        require.coverage_line("b-roster", "1132");
        return Long_Long_Name_renderName272("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1135");
    function Long_Long_Name_renderName272(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName272:1135:38370");
        require.coverage_line("b-roster", "1136");
        return Long_Long_Name_renderName273("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1139");
    function Long_Long_Name_renderName273(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName273:1139:38506");
        require.coverage_line("b-roster", "1140");
        return Long_Long_Name_renderName274("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1143");
    function Long_Long_Name_renderName274(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName274:1143:38642");
        require.coverage_line("b-roster", "1144");
        return Long_Long_Name_renderName275("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1147");
    function Long_Long_Name_renderName275(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName275:1147:38778");
        require.coverage_line("b-roster", "1148");
        return Long_Long_Name_renderName276("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1151");
    function Long_Long_Name_renderName276(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName276:1151:38914");
        require.coverage_line("b-roster", "1152");
        return Long_Long_Name_renderName277("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1155");
    function Long_Long_Name_renderName277(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName277:1155:39050");
        require.coverage_line("b-roster", "1156");
        return Long_Long_Name_renderName278("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1159");
    function Long_Long_Name_renderName278(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName278:1159:39186");
        require.coverage_line("b-roster", "1160");
        return Long_Long_Name_renderName279("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1163");
    function Long_Long_Name_renderName279(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName279:1163:39322");
        require.coverage_line("b-roster", "1164");
        return Long_Long_Name_renderName280("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1167");
    function Long_Long_Name_renderName280(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName280:1167:39458");
        require.coverage_line("b-roster", "1168");
        return Long_Long_Name_renderName281("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1171");
    function Long_Long_Name_renderName281(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName281:1171:39594");
        require.coverage_line("b-roster", "1172");
        return Long_Long_Name_renderName282("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1175");
    function Long_Long_Name_renderName282(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName282:1175:39730");
        require.coverage_line("b-roster", "1176");
        return Long_Long_Name_renderName283("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1179");
    function Long_Long_Name_renderName283(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName283:1179:39866");
        require.coverage_line("b-roster", "1180");
        return Long_Long_Name_renderName284("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1183");
    function Long_Long_Name_renderName284(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName284:1183:40002");
        require.coverage_line("b-roster", "1184");
        return Long_Long_Name_renderName285("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1187");
    function Long_Long_Name_renderName285(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName285:1187:40138");
        require.coverage_line("b-roster", "1188");
        return Long_Long_Name_renderName286("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1191");
    function Long_Long_Name_renderName286(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName286:1191:40274");
        require.coverage_line("b-roster", "1192");
        return Long_Long_Name_renderName287("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1195");
    function Long_Long_Name_renderName287(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName287:1195:40410");
        require.coverage_line("b-roster", "1196");
        return Long_Long_Name_renderName288("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1199");
    function Long_Long_Name_renderName288(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName288:1199:40546");
        require.coverage_line("b-roster", "1200");
        return Long_Long_Name_renderName289("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1203");
    function Long_Long_Name_renderName289(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName289:1203:40682");
        require.coverage_line("b-roster", "1204");
        return Long_Long_Name_renderName290("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1207");
    function Long_Long_Name_renderName290(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName290:1207:40818");
        require.coverage_line("b-roster", "1208");
        return Long_Long_Name_renderName291("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1211");
    function Long_Long_Name_renderName291(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName291:1211:40954");
        require.coverage_line("b-roster", "1212");
        return Long_Long_Name_renderName292("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1215");
    function Long_Long_Name_renderName292(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName292:1215:41090");
        require.coverage_line("b-roster", "1216");
        return Long_Long_Name_renderName293("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1219");
    function Long_Long_Name_renderName293(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName293:1219:41226");
        require.coverage_line("b-roster", "1220");
        return Long_Long_Name_renderName294("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1223");
    function Long_Long_Name_renderName294(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName294:1223:41362");
        require.coverage_line("b-roster", "1224");
        return Long_Long_Name_renderName295("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1227");
    function Long_Long_Name_renderName295(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName295:1227:41498");
        require.coverage_line("b-roster", "1228");
        return Long_Long_Name_renderName296("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1231");
    function Long_Long_Name_renderName296(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName296:1231:41634");
        require.coverage_line("b-roster", "1232");
        return Long_Long_Name_renderName297("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1235");
    function Long_Long_Name_renderName297(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName297:1235:41770");
        require.coverage_line("b-roster", "1236");
        return Long_Long_Name_renderName298("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1239");
    function Long_Long_Name_renderName298(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName298:1239:41906");
        require.coverage_line("b-roster", "1240");
        return Long_Long_Name_renderName299("<span>" + name + "</span>");
    }
    require.coverage_line("b-roster", "1243");
    function Long_Long_Name_renderName299(name) {
        require.coverage_function("b-roster", "Long_Long_Name_renderName299:1243:42042");
        require.coverage_line("b-roster", "1244");
        return name;
    }
    require.coverage_line("b-roster", "1247");
    module.exports = Roster;
}),
"undefined": (function(require, exports) {
    var require = arguments[0];
    require.coverage_function("undefined", "(?):1:1");
    require.coverage_line("undefined", "3");
    var document = require("document");
    require.coverage_line("undefined", "5");
    exports.$ = function(string, relativeTo) {
        require.coverage_function("undefined", "$:5:85");
        require.coverage_line("undefined", "6");
        return (relativeTo || document).querySelector(string);
    };
}),
"b-unused-module": (function(require, exports, module) {
    var require = arguments[0];
    require.coverage_function("b-unused-module", "(?):0:1");
    require.coverage_line("b-unused-module", "1");
    exports.pewpewOlolo = function() {
        require.coverage_function("b-unused-module", "pewpewOlolo:1:86");
        require.coverage_line("b-unused-module", "2");
        return true;
    };
}),
"b-dialog": "@js/lmd/modules/b-dialog.js",
"b-talk": "@js/lmd/modules/b-talk.js"
},{"main":{"lines":["1","4"],"conditions":[],"functions":["(?):0:1"],"coverage":1},"b-roster":{"lines":["1","3","4","6","8","9","12","14","18","19","20","25","26","29","30","42","43","47","48","51","52","55","56","59","60","63","64","67","68","71","72","75","76","79","80","83","84","87","88","91","92","95","96","99","100","103","104","107","108","111","112","115","116","119","120","123","124","127","128","131","132","135","136","139","140","143","144","147","148","151","152","155","156","159","160","163","164","167","168","171","172","175","176","179","180","183","184","187","188","191","192","195","196","199","200","203","204","207","208","211","212","215","216","219","220","223","224","227","228","231","232","235","236","239","240","243","244","247","248","251","252","255","256","259","260","263","264","267","268","271","272","275","276","279","280","283","284","287","288","291","292","295","296","299","300","303","304","307","308","311","312","315","316","319","320","323","324","327","328","331","332","335","336","339","340","343","344","347","348","351","352","355","356","359","360","363","364","367","368","371","372","375","376","379","380","383","384","387","388","391","392","395","396","399","400","403","404","407","408","411","412","415","416","419","420","423","424","427","428","431","432","435","436","439","440","443","444","447","448","451","452","455","456","459","460","463","464","467","468","471","472","475","476","479","480","483","484","487","488","491","492","495","496","499","500","503","504","507","508","511","512","515","516","519","520","523","524","527","528","531","532","535","536","539","540","543","544","547","548","551","552","555","556","559","560","563","564","567","568","571","572","575","576","579","580","583","584","587","588","591","592","595","596","599","600","603","604","607","608","611","612","615","616","619","620","623","624","627","628","631","632","635","636","639","640","643","644","647","648","651","652","655","656","659","660","663","664","667","668","671","672","675","676","679","680","683","684","687","688","691","692","695","696","699","700","703","704","707","708","711","712","715","716","719","720","723","724","727","728","731","732","735","736","739","740","743","744","747","748","751","752","755","756","759","760","763","764","767","768","771","772","775","776","779","780","783","784","787","788","791","792","795","796","799","800","803","804","807","808","811","812","815","816","819","820","823","824","827","828","831","832","835","836","839","840","843","844","847","848","851","852","855","856","859","860","863","864","867","868","871","872","875","876","879","880","883","884","887","888","891","892","895","896","899","900","903","904","907","908","911","912","915","916","919","920","923","924","927","928","931","932","935","936","939","940","943","944","947","948","951","952","955","956","959","960","963","964","967","968","971","972","975","976","979","980","983","984","987","988","991","992","995","996","999","1000","1003","1004","1007","1008","1011","1012","1015","1016","1019","1020","1023","1024","1027","1028","1031","1032","1035","1036","1039","1040","1043","1044","1047","1048","1051","1052","1055","1056","1059","1060","1063","1064","1067","1068","1071","1072","1075","1076","1079","1080","1083","1084","1087","1088","1091","1092","1095","1096","1099","1100","1103","1104","1107","1108","1111","1112","1115","1116","1119","1120","1123","1124","1127","1128","1131","1132","1135","1136","1139","1140","1143","1144","1147","1148","1151","1152","1155","1156","1159","1160","1163","1164","1167","1168","1171","1172","1175","1176","1179","1180","1183","1184","1187","1188","1191","1192","1195","1196","1199","1200","1203","1204","1207","1208","1211","1212","1215","1216","1219","1220","1223","1224","1227","1228","1231","1232","1235","1236","1239","1240","1243","1244","1247"],"conditions":[],"functions":["(?):0:1","Roster:3:114","(?):14:404","(?):18:568","renderWrapper:25:743","renderItem:29:834","renderName:42:1490","Long_Long_Name_renderName0:47:1596","Long_Long_Name_renderName1:51:1728","Long_Long_Name_renderName2:55:1860","Long_Long_Name_renderName3:59:1992","Long_Long_Name_renderName4:63:2124","Long_Long_Name_renderName5:67:2256","Long_Long_Name_renderName6:71:2388","Long_Long_Name_renderName7:75:2520","Long_Long_Name_renderName8:79:2652","Long_Long_Name_renderName9:83:2784","Long_Long_Name_renderName10:87:2917","Long_Long_Name_renderName11:91:3051","Long_Long_Name_renderName12:95:3185","Long_Long_Name_renderName13:99:3319","Long_Long_Name_renderName14:103:3453","Long_Long_Name_renderName15:107:3587","Long_Long_Name_renderName16:111:3721","Long_Long_Name_renderName17:115:3855","Long_Long_Name_renderName18:119:3989","Long_Long_Name_renderName19:123:4123","Long_Long_Name_renderName20:127:4257","Long_Long_Name_renderName21:131:4391","Long_Long_Name_renderName22:135:4525","Long_Long_Name_renderName23:139:4659","Long_Long_Name_renderName24:143:4793","Long_Long_Name_renderName25:147:4927","Long_Long_Name_renderName26:151:5061","Long_Long_Name_renderName27:155:5195","Long_Long_Name_renderName28:159:5329","Long_Long_Name_renderName29:163:5463","Long_Long_Name_renderName30:167:5597","Long_Long_Name_renderName31:171:5731","Long_Long_Name_renderName32:175:5865","Long_Long_Name_renderName33:179:5999","Long_Long_Name_renderName34:183:6133","Long_Long_Name_renderName35:187:6267","Long_Long_Name_renderName36:191:6401","Long_Long_Name_renderName37:195:6535","Long_Long_Name_renderName38:199:6669","Long_Long_Name_renderName39:203:6803","Long_Long_Name_renderName40:207:6937","Long_Long_Name_renderName41:211:7071","Long_Long_Name_renderName42:215:7205","Long_Long_Name_renderName43:219:7339","Long_Long_Name_renderName44:223:7473","Long_Long_Name_renderName45:227:7607","Long_Long_Name_renderName46:231:7741","Long_Long_Name_renderName47:235:7875","Long_Long_Name_renderName48:239:8009","Long_Long_Name_renderName49:243:8143","Long_Long_Name_renderName50:247:8277","Long_Long_Name_renderName51:251:8411","Long_Long_Name_renderName52:255:8545","Long_Long_Name_renderName53:259:8679","Long_Long_Name_renderName54:263:8813","Long_Long_Name_renderName55:267:8947","Long_Long_Name_renderName56:271:9081","Long_Long_Name_renderName57:275:9215","Long_Long_Name_renderName58:279:9349","Long_Long_Name_renderName59:283:9483","Long_Long_Name_renderName60:287:9617","Long_Long_Name_renderName61:291:9751","Long_Long_Name_renderName62:295:9885","Long_Long_Name_renderName63:299:10019","Long_Long_Name_renderName64:303:10153","Long_Long_Name_renderName65:307:10287","Long_Long_Name_renderName66:311:10421","Long_Long_Name_renderName67:315:10555","Long_Long_Name_renderName68:319:10689","Long_Long_Name_renderName69:323:10823","Long_Long_Name_renderName70:327:10957","Long_Long_Name_renderName71:331:11091","Long_Long_Name_renderName72:335:11225","Long_Long_Name_renderName73:339:11359","Long_Long_Name_renderName74:343:11493","Long_Long_Name_renderName75:347:11627","Long_Long_Name_renderName76:351:11761","Long_Long_Name_renderName77:355:11895","Long_Long_Name_renderName78:359:12029","Long_Long_Name_renderName79:363:12163","Long_Long_Name_renderName80:367:12297","Long_Long_Name_renderName81:371:12431","Long_Long_Name_renderName82:375:12565","Long_Long_Name_renderName83:379:12699","Long_Long_Name_renderName84:383:12833","Long_Long_Name_renderName85:387:12967","Long_Long_Name_renderName86:391:13101","Long_Long_Name_renderName87:395:13235","Long_Long_Name_renderName88:399:13369","Long_Long_Name_renderName89:403:13503","Long_Long_Name_renderName90:407:13637","Long_Long_Name_renderName91:411:13771","Long_Long_Name_renderName92:415:13905","Long_Long_Name_renderName93:419:14039","Long_Long_Name_renderName94:423:14173","Long_Long_Name_renderName95:427:14307","Long_Long_Name_renderName96:431:14441","Long_Long_Name_renderName97:435:14575","Long_Long_Name_renderName98:439:14709","Long_Long_Name_renderName99:443:14843","Long_Long_Name_renderName100:447:14978","Long_Long_Name_renderName101:451:15114","Long_Long_Name_renderName102:455:15250","Long_Long_Name_renderName103:459:15386","Long_Long_Name_renderName104:463:15522","Long_Long_Name_renderName105:467:15658","Long_Long_Name_renderName106:471:15794","Long_Long_Name_renderName107:475:15930","Long_Long_Name_renderName108:479:16066","Long_Long_Name_renderName109:483:16202","Long_Long_Name_renderName110:487:16338","Long_Long_Name_renderName111:491:16474","Long_Long_Name_renderName112:495:16610","Long_Long_Name_renderName113:499:16746","Long_Long_Name_renderName114:503:16882","Long_Long_Name_renderName115:507:17018","Long_Long_Name_renderName116:511:17154","Long_Long_Name_renderName117:515:17290","Long_Long_Name_renderName118:519:17426","Long_Long_Name_renderName119:523:17562","Long_Long_Name_renderName120:527:17698","Long_Long_Name_renderName121:531:17834","Long_Long_Name_renderName122:535:17970","Long_Long_Name_renderName123:539:18106","Long_Long_Name_renderName124:543:18242","Long_Long_Name_renderName125:547:18378","Long_Long_Name_renderName126:551:18514","Long_Long_Name_renderName127:555:18650","Long_Long_Name_renderName128:559:18786","Long_Long_Name_renderName129:563:18922","Long_Long_Name_renderName130:567:19058","Long_Long_Name_renderName131:571:19194","Long_Long_Name_renderName132:575:19330","Long_Long_Name_renderName133:579:19466","Long_Long_Name_renderName134:583:19602","Long_Long_Name_renderName135:587:19738","Long_Long_Name_renderName136:591:19874","Long_Long_Name_renderName137:595:20010","Long_Long_Name_renderName138:599:20146","Long_Long_Name_renderName139:603:20282","Long_Long_Name_renderName140:607:20418","Long_Long_Name_renderName141:611:20554","Long_Long_Name_renderName142:615:20690","Long_Long_Name_renderName143:619:20826","Long_Long_Name_renderName144:623:20962","Long_Long_Name_renderName145:627:21098","Long_Long_Name_renderName146:631:21234","Long_Long_Name_renderName147:635:21370","Long_Long_Name_renderName148:639:21506","Long_Long_Name_renderName149:643:21642","Long_Long_Name_renderName150:647:21778","Long_Long_Name_renderName151:651:21914","Long_Long_Name_renderName152:655:22050","Long_Long_Name_renderName153:659:22186","Long_Long_Name_renderName154:663:22322","Long_Long_Name_renderName155:667:22458","Long_Long_Name_renderName156:671:22594","Long_Long_Name_renderName157:675:22730","Long_Long_Name_renderName158:679:22866","Long_Long_Name_renderName159:683:23002","Long_Long_Name_renderName160:687:23138","Long_Long_Name_renderName161:691:23274","Long_Long_Name_renderName162:695:23410","Long_Long_Name_renderName163:699:23546","Long_Long_Name_renderName164:703:23682","Long_Long_Name_renderName165:707:23818","Long_Long_Name_renderName166:711:23954","Long_Long_Name_renderName167:715:24090","Long_Long_Name_renderName168:719:24226","Long_Long_Name_renderName169:723:24362","Long_Long_Name_renderName170:727:24498","Long_Long_Name_renderName171:731:24634","Long_Long_Name_renderName172:735:24770","Long_Long_Name_renderName173:739:24906","Long_Long_Name_renderName174:743:25042","Long_Long_Name_renderName175:747:25178","Long_Long_Name_renderName176:751:25314","Long_Long_Name_renderName177:755:25450","Long_Long_Name_renderName178:759:25586","Long_Long_Name_renderName179:763:25722","Long_Long_Name_renderName180:767:25858","Long_Long_Name_renderName181:771:25994","Long_Long_Name_renderName182:775:26130","Long_Long_Name_renderName183:779:26266","Long_Long_Name_renderName184:783:26402","Long_Long_Name_renderName185:787:26538","Long_Long_Name_renderName186:791:26674","Long_Long_Name_renderName187:795:26810","Long_Long_Name_renderName188:799:26946","Long_Long_Name_renderName189:803:27082","Long_Long_Name_renderName190:807:27218","Long_Long_Name_renderName191:811:27354","Long_Long_Name_renderName192:815:27490","Long_Long_Name_renderName193:819:27626","Long_Long_Name_renderName194:823:27762","Long_Long_Name_renderName195:827:27898","Long_Long_Name_renderName196:831:28034","Long_Long_Name_renderName197:835:28170","Long_Long_Name_renderName198:839:28306","Long_Long_Name_renderName199:843:28442","Long_Long_Name_renderName200:847:28578","Long_Long_Name_renderName201:851:28714","Long_Long_Name_renderName202:855:28850","Long_Long_Name_renderName203:859:28986","Long_Long_Name_renderName204:863:29122","Long_Long_Name_renderName205:867:29258","Long_Long_Name_renderName206:871:29394","Long_Long_Name_renderName207:875:29530","Long_Long_Name_renderName208:879:29666","Long_Long_Name_renderName209:883:29802","Long_Long_Name_renderName210:887:29938","Long_Long_Name_renderName211:891:30074","Long_Long_Name_renderName212:895:30210","Long_Long_Name_renderName213:899:30346","Long_Long_Name_renderName214:903:30482","Long_Long_Name_renderName215:907:30618","Long_Long_Name_renderName216:911:30754","Long_Long_Name_renderName217:915:30890","Long_Long_Name_renderName218:919:31026","Long_Long_Name_renderName219:923:31162","Long_Long_Name_renderName220:927:31298","Long_Long_Name_renderName221:931:31434","Long_Long_Name_renderName222:935:31570","Long_Long_Name_renderName223:939:31706","Long_Long_Name_renderName224:943:31842","Long_Long_Name_renderName225:947:31978","Long_Long_Name_renderName226:951:32114","Long_Long_Name_renderName227:955:32250","Long_Long_Name_renderName228:959:32386","Long_Long_Name_renderName229:963:32522","Long_Long_Name_renderName230:967:32658","Long_Long_Name_renderName231:971:32794","Long_Long_Name_renderName232:975:32930","Long_Long_Name_renderName233:979:33066","Long_Long_Name_renderName234:983:33202","Long_Long_Name_renderName235:987:33338","Long_Long_Name_renderName236:991:33474","Long_Long_Name_renderName237:995:33610","Long_Long_Name_renderName238:999:33746","Long_Long_Name_renderName239:1003:33882","Long_Long_Name_renderName240:1007:34018","Long_Long_Name_renderName241:1011:34154","Long_Long_Name_renderName242:1015:34290","Long_Long_Name_renderName243:1019:34426","Long_Long_Name_renderName244:1023:34562","Long_Long_Name_renderName245:1027:34698","Long_Long_Name_renderName246:1031:34834","Long_Long_Name_renderName247:1035:34970","Long_Long_Name_renderName248:1039:35106","Long_Long_Name_renderName249:1043:35242","Long_Long_Name_renderName250:1047:35378","Long_Long_Name_renderName251:1051:35514","Long_Long_Name_renderName252:1055:35650","Long_Long_Name_renderName253:1059:35786","Long_Long_Name_renderName254:1063:35922","Long_Long_Name_renderName255:1067:36058","Long_Long_Name_renderName256:1071:36194","Long_Long_Name_renderName257:1075:36330","Long_Long_Name_renderName258:1079:36466","Long_Long_Name_renderName259:1083:36602","Long_Long_Name_renderName260:1087:36738","Long_Long_Name_renderName261:1091:36874","Long_Long_Name_renderName262:1095:37010","Long_Long_Name_renderName263:1099:37146","Long_Long_Name_renderName264:1103:37282","Long_Long_Name_renderName265:1107:37418","Long_Long_Name_renderName266:1111:37554","Long_Long_Name_renderName267:1115:37690","Long_Long_Name_renderName268:1119:37826","Long_Long_Name_renderName269:1123:37962","Long_Long_Name_renderName270:1127:38098","Long_Long_Name_renderName271:1131:38234","Long_Long_Name_renderName272:1135:38370","Long_Long_Name_renderName273:1139:38506","Long_Long_Name_renderName274:1143:38642","Long_Long_Name_renderName275:1147:38778","Long_Long_Name_renderName276:1151:38914","Long_Long_Name_renderName277:1155:39050","Long_Long_Name_renderName278:1159:39186","Long_Long_Name_renderName279:1163:39322","Long_Long_Name_renderName280:1167:39458","Long_Long_Name_renderName281:1171:39594","Long_Long_Name_renderName282:1175:39730","Long_Long_Name_renderName283:1179:39866","Long_Long_Name_renderName284:1183:40002","Long_Long_Name_renderName285:1187:40138","Long_Long_Name_renderName286:1191:40274","Long_Long_Name_renderName287:1195:40410","Long_Long_Name_renderName288:1199:40546","Long_Long_Name_renderName289:1203:40682","Long_Long_Name_renderName290:1207:40818","Long_Long_Name_renderName291:1211:40954","Long_Long_Name_renderName292:1215:41090","Long_Long_Name_renderName293:1219:41226","Long_Long_Name_renderName294:1223:41362","Long_Long_Name_renderName295:1227:41498","Long_Long_Name_renderName296:1231:41634","Long_Long_Name_renderName297:1235:41770","Long_Long_Name_renderName298:1239:41906","Long_Long_Name_renderName299:1243:42042"],"coverage":1},"undefined":{"lines":["3","5","6"],"conditions":[],"functions":["(?):1:1","$:5:85"],"coverage":1},"b-unused-module":{"lines":["1","2"],"conditions":[],"functions":["(?):0:1","pewpewOlolo:1:86"],"coverage":1}},{"stats_host":true});
