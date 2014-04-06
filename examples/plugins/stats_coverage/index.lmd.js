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
 * Async loader of css files
 *
 * Flag "css"
 *
 * This plugin provides require.css() function
 */
/**
 * @name sandbox
 */
(function (sb) {

    /**
     * Loads any CSS file
     *
     * Inspired by yepnope.css.js
     *
     * @see https://github.com/SlexAxton/yepnope.js/blob/master/plugins/yepnope.css.js
     *
     * @param {String|Array} moduleName path to css file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLLinkElement on success
     */
    sb.require.css = function (moduleName, callback) {
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, 'css'), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = replacement[0][0];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2],
            isNotLoaded = 1,
            head;

        callback = replacement[1];
        moduleName = replacement[0][1];


        // Create stylesheet link
        var link = sb.document.createElement("link"),
            id = +new sb.global.Date,
            onload = function (e) {
                if (isNotLoaded) {
                    isNotLoaded = 0;
                    // register or cleanup
                    link.removeAttribute('id');

                    if (!e) {
                        sb.trigger('*:request-error', moduleName, module);
                    }
                    callback(e ? sb.register(moduleName, link) : head.removeChild(link) && sb.undefined); // e === undefined if error
                }
            };

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        sb.global.setTimeout(onload, 3000, 0);

        head = sb.document.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        (function poll() {
            if (isNotLoaded) {
                var sheets = sb.document.styleSheets,
                    j = 0,
                    k = sheets.length;

                try {
                    for (; j < k; j++) {
                        if((sheets[j].ownerNode || sheets[j].owningElement).id == id &&
                            (sheets[j].cssRules || sheets[j].rules).length) {
//#JSCOVERAGE_IF 0
                            return onload(1);
//#JSCOVERAGE_ENDIF
                        }
                    }
                    // if we get here, its not in document.styleSheets (we never saw the ID)
                    throw 1;
                } catch(e) {
                    
                    // Keep polling
                    sb.global.setTimeout(poll, 90);
                }
            }
        }());

        return returnResult;

    };

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



    main(lmd_trigger('lmd-register:decorate-require', 'main', lmd_require)[1], output.exports, output);
})/*DO NOT ADD ; !*/
(this,(function(require, exports, module) {
    var require = arguments[0];
    require.coverage_function("main", "(?):0:1");
    require.coverage_line("main", "5");
    var sha512 = require("sha512");
    require.coverage_line("main", "7");
    function decorateInputs() {
        require.coverage_function("main", "decorateInputs:7:154");
        require.coverage_line("main", "8");
        return require.css("css/b-input.css");
    }
    require.coverage_line("main", "11");
    $(function() {
        require.coverage_function("main", "(?):11:230");
        require.coverage_line("main", "12");
        var $button = $(".b-button"), $result = $(".b-result"), $input = $(".b-input");
        require.coverage_line("main", "16");
        function calculateSha512OfMd5() {
            require.coverage_function("main", "calculateSha512OfMd5:16:349");
            require.coverage_line("main", "17");
            var md5 = require("md5");
            require.coverage_line("main", "18");
            var value = $input.val();
            require.coverage_line("main", "19");
            $result.val(sha512(md5(value)));
            require.coverage_line("main", "20");
            decorateInputs();
        }
        require.coverage_line("main", "23");
        $button.click(calculateSha512OfMd5);
        require.coverage_line("main", "25");
        require("statsLogger");
    });
}),{
"unused": (function(require, exports, module) {
    var require = arguments[0];
    require.coverage_function("unused", "(?):0:1");
    require.coverage_line("unused", "2");
    $(function() {
        require.coverage_function("unused", "(?):2:67");
        require.coverage_line("unused", "3");
        if (require.coverage_condition("unused", "if:3:89", Math.random() > .5)) {
            require.coverage_line("unused", "4");
            console.log(123);
        }
    });
}),
"sha512": (function(require, exports, module) {
    var require = arguments[0];
    require.coverage_function("sha512", "(?):0:1");
    require.coverage_line("sha512", "14");
    var hexcase = 0;
    require.coverage_line("sha512", "15");
    var b64pad = "";
    require.coverage_line("sha512", "21");
    function hex_sha512(s) {
        require.coverage_function("sha512", "hex_sha512:21:840");
        require.coverage_line("sha512", "21");
        return rstr2hex(rstr_sha512(str2rstr_utf8(s)));
    }
    require.coverage_line("sha512", "22");
    function b64_sha512(s) {
        require.coverage_function("sha512", "b64_sha512:22:918");
        require.coverage_line("sha512", "22");
        return rstr2b64(rstr_sha512(str2rstr_utf8(s)));
    }
    require.coverage_line("sha512", "23");
    function any_sha512(s, e) {
        require.coverage_function("sha512", "any_sha512:23:996");
        require.coverage_line("sha512", "23");
        return rstr2any(rstr_sha512(str2rstr_utf8(s)), e);
    }
    require.coverage_line("sha512", "24");
    function hex_hmac_sha512(k, d) {
        require.coverage_function("sha512", "hex_hmac_sha512:24:1076");
        require.coverage_line("sha512", "25");
        return rstr2hex(rstr_hmac_sha512(str2rstr_utf8(k), str2rstr_utf8(d)));
    }
    require.coverage_line("sha512", "26");
    function b64_hmac_sha512(k, d) {
        require.coverage_function("sha512", "b64_hmac_sha512:26:1184");
        require.coverage_line("sha512", "27");
        return rstr2b64(rstr_hmac_sha512(str2rstr_utf8(k), str2rstr_utf8(d)));
    }
    require.coverage_line("sha512", "28");
    function any_hmac_sha512(k, d, e) {
        require.coverage_function("sha512", "any_hmac_sha512:28:1292");
        require.coverage_line("sha512", "29");
        return rstr2any(rstr_hmac_sha512(str2rstr_utf8(k), str2rstr_utf8(d)), e);
    }
    require.coverage_line("sha512", "34");
    function sha512_vm_test() {
        require.coverage_function("sha512", "sha512_vm_test:34:1471");
        require.coverage_line("sha512", "36");
        return hex_sha512("abc").toLowerCase() == "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a" + "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f";
    }
    require.coverage_line("sha512", "44");
    function rstr_sha512(s) {
        require.coverage_function("sha512", "rstr_sha512:44:1739");
        require.coverage_line("sha512", "46");
        return binb2rstr(binb_sha512(rstr2binb(s), s.length * 8));
    }
    require.coverage_line("sha512", "52");
    function rstr_hmac_sha512(key, data) {
        require.coverage_function("sha512", "rstr_hmac_sha512:52:1903");
        require.coverage_line("sha512", "54");
        var bkey = rstr2binb(key);
        require.coverage_line("sha512", "55");
        if (require.coverage_condition("sha512", "if:55:1976", bkey.length > 32)) {
            require.coverage_line("sha512", "55");
            bkey = binb_sha512(bkey, key.length * 8);
        }
        require.coverage_line("sha512", "57");
        var ipad = Array(32), opad = Array(32);
        require.coverage_line("sha512", "58");
        for (var i = 0; i < 32; i++) {
            require.coverage_line("sha512", "60");
            ipad[i] = bkey[i] ^ 909522486;
            require.coverage_line("sha512", "61");
            opad[i] = bkey[i] ^ 1549556828;
        }
        require.coverage_line("sha512", "64");
        var hash = binb_sha512(ipad.concat(rstr2binb(data)), 1024 + data.length * 8);
        require.coverage_line("sha512", "65");
        return binb2rstr(binb_sha512(opad.concat(hash), 1024 + 512));
    }
    require.coverage_line("sha512", "71");
    function rstr2hex(input) {
        require.coverage_function("sha512", "rstr2hex:71:2384");
        require.coverage_line("sha512", "73");
        try {
            require.coverage_line("sha512", "73");
            hexcase;
        } catch (e) {
            require.coverage_line("sha512", "73");
            hexcase = 0;
        }
        require.coverage_line("sha512", "74");
        var hex_tab = require.coverage_condition("sha512", "conditional:74:2469", hexcase) ? "0123456789ABCDEF" : "0123456789abcdef";
        require.coverage_line("sha512", "75");
        var output = "";
        require.coverage_line("sha512", "76");
        var x;
        require.coverage_line("sha512", "77");
        for (var i = 0; i < input.length; i++) {
            require.coverage_line("sha512", "79");
            x = input.charCodeAt(i);
            require.coverage_line("sha512", "80");
            output += hex_tab.charAt(x >>> 4 & 15) + hex_tab.charAt(x & 15);
        }
        require.coverage_line("sha512", "83");
        return output;
    }
    require.coverage_line("sha512", "89");
    function rstr2b64(input) {
        require.coverage_function("sha512", "rstr2b64:89:2791");
        require.coverage_line("sha512", "91");
        try {
            require.coverage_line("sha512", "91");
            b64pad;
        } catch (e) {
            require.coverage_line("sha512", "91");
            b64pad = "";
        }
        require.coverage_line("sha512", "92");
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        require.coverage_line("sha512", "93");
        var output = "";
        require.coverage_line("sha512", "94");
        var len = input.length;
        require.coverage_line("sha512", "95");
        for (var i = 0; i < len; i += 3) {
            require.coverage_line("sha512", "97");
            var triplet = input.charCodeAt(i) << 16 | (require.coverage_condition("sha512", "conditional:98:s", i + 1 < len) ? input.charCodeAt(i + 1) << 8 : 0) | (require.coverage_condition("sha512", "conditional:99:s", i + 2 < len) ? input.charCodeAt(i + 2) : 0);
            require.coverage_line("sha512", "100");
            for (var j = 0; j < 4; j++) {
                require.coverage_line("sha512", "102");
                if (require.coverage_condition("sha512", "if:102:3245", i * 8 + j * 6 > input.length * 8)) {
                    require.coverage_line("sha512", "102");
                    output += b64pad;
                } else {
                    require.coverage_line("sha512", "103");
                    output += tab.charAt(triplet >>> 6 * (3 - j) & 63);
                }
            }
        }
        require.coverage_line("sha512", "106");
        return output;
    }
    require.coverage_line("sha512", "112");
    function rstr2any(input, encoding) {
        require.coverage_function("sha512", "rstr2any:112:3453");
        require.coverage_line("sha512", "114");
        var divisor = encoding.length;
        require.coverage_line("sha512", "115");
        var i, j, q, x, quotient;
        require.coverage_line("sha512", "118");
        var dividend = Array(Math.ceil(input.length / 2));
        require.coverage_line("sha512", "119");
        for (i = 0; i < dividend.length; i++) {
            require.coverage_line("sha512", "121");
            dividend[i] = input.charCodeAt(i * 2) << 8 | input.charCodeAt(i * 2 + 1);
        }
        require.coverage_line("sha512", "130");
        var full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
        require.coverage_line("sha512", "132");
        var remainders = Array(full_length);
        require.coverage_line("sha512", "133");
        for (j = 0; j < full_length; j++) {
            require.coverage_line("sha512", "135");
            quotient = Array();
            require.coverage_line("sha512", "136");
            x = 0;
            require.coverage_line("sha512", "137");
            for (i = 0; i < dividend.length; i++) {
                require.coverage_line("sha512", "139");
                x = (x << 16) + dividend[i];
                require.coverage_line("sha512", "140");
                q = Math.floor(x / divisor);
                require.coverage_line("sha512", "141");
                x -= q * divisor;
                require.coverage_line("sha512", "142");
                if (require.coverage_condition("sha512", "if:142:4457", quotient.length > 0) || require.coverage_condition("sha512", "if:142:4484", q > 0)) {
                    require.coverage_line("sha512", "143");
                    quotient[quotient.length] = q;
                }
            }
            require.coverage_line("sha512", "145");
            remainders[j] = x;
            require.coverage_line("sha512", "146");
            dividend = quotient;
        }
        require.coverage_line("sha512", "150");
        var output = "";
        require.coverage_line("sha512", "151");
        for (i = remainders.length - 1; i >= 0; i--) {
            require.coverage_line("sha512", "152");
            output += encoding.charAt(remainders[i]);
        }
        require.coverage_line("sha512", "154");
        return output;
    }
    require.coverage_line("sha512", "161");
    function str2rstr_utf8(input) {
        require.coverage_function("sha512", "str2rstr_utf8:161:4864");
        require.coverage_line("sha512", "163");
        var output = "";
        require.coverage_line("sha512", "164");
        var i = -1;
        require.coverage_line("sha512", "165");
        var x, y;
        require.coverage_line("sha512", "167");
        while (++i < input.length) {
            require.coverage_line("sha512", "170");
            x = input.charCodeAt(i);
            require.coverage_line("sha512", "171");
            y = require.coverage_condition("sha512", "undefined:s", i + 1 < input.length) ? input.charCodeAt(i + 1) : 0;
            require.coverage_line("sha512", "172");
            if (require.coverage_condition("sha512", "if:172:5110", 55296 <= x) && require.coverage_condition("sha512", "if:172:5110", x <= 56319) && require.coverage_condition("sha512", "if:172:5110", 56320 <= y) && require.coverage_condition("sha512", "if:172:5160", y <= 57343)) {
                require.coverage_line("sha512", "174");
                x = 65536 + ((x & 1023) << 10) + (y & 1023);
                require.coverage_line("sha512", "175");
                i++;
            }
            require.coverage_line("sha512", "179");
            if (require.coverage_condition("sha512", "if:179:5289", x <= 127)) {
                require.coverage_line("sha512", "180");
                output += String.fromCharCode(x);
            } else {
                require.coverage_line("sha512", "181");
                if (require.coverage_condition("sha512", "if:181:5352", x <= 2047)) {
                    require.coverage_line("sha512", "182");
                    output += String.fromCharCode(192 | x >>> 6 & 31, 128 | x & 63);
                } else {
                    require.coverage_line("sha512", "184");
                    if (require.coverage_condition("sha512", "if:184:5505", x <= 65535)) {
                        require.coverage_line("sha512", "185");
                        output += String.fromCharCode(224 | x >>> 12 & 15, 128 | x >>> 6 & 63, 128 | x & 63);
                    } else {
                        require.coverage_line("sha512", "188");
                        if (require.coverage_condition("sha512", "if:188:5723", x <= 2097151)) {
                            require.coverage_line("sha512", "189");
                            output += String.fromCharCode(240 | x >>> 18 & 7, 128 | x >>> 12 & 63, 128 | x >>> 6 & 63, 128 | x & 63);
                        }
                    }
                }
            }
        }
        require.coverage_line("sha512", "194");
        return output;
    }
    require.coverage_line("sha512", "200");
    function str2rstr_utf16le(input) {
        require.coverage_function("sha512", "str2rstr_utf16le:200:6055");
        require.coverage_line("sha512", "202");
        var output = "";
        require.coverage_line("sha512", "203");
        for (var i = 0; i < input.length; i++) {
            require.coverage_line("sha512", "204");
            output += String.fromCharCode(input.charCodeAt(i) & 255, input.charCodeAt(i) >>> 8 & 255);
        }
        require.coverage_line("sha512", "206");
        return output;
    }
    require.coverage_line("sha512", "209");
    function str2rstr_utf16be(input) {
        require.coverage_function("sha512", "str2rstr_utf16be:209:6310");
        require.coverage_line("sha512", "211");
        var output = "";
        require.coverage_line("sha512", "212");
        for (var i = 0; i < input.length; i++) {
            require.coverage_line("sha512", "213");
            output += String.fromCharCode(input.charCodeAt(i) >>> 8 & 255, input.charCodeAt(i) & 255);
        }
        require.coverage_line("sha512", "215");
        return output;
    }
    require.coverage_line("sha512", "222");
    function rstr2binb(input) {
        require.coverage_function("sha512", "rstr2binb:222:6686");
        require.coverage_line("sha512", "224");
        var output = Array(input.length >> 2);
        require.coverage_line("sha512", "225");
        for (var i = 0; i < output.length; i++) {
            require.coverage_line("sha512", "226");
            output[i] = 0;
        }
        require.coverage_line("sha512", "227");
        for (var i = 0; i < input.length * 8; i += 8) {
            require.coverage_line("sha512", "228");
            output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << 24 - i % 32;
        }
        require.coverage_line("sha512", "229");
        return output;
    }
    require.coverage_line("sha512", "235");
    function binb2rstr(input) {
        require.coverage_function("sha512", "binb2rstr:235:7012");
        require.coverage_line("sha512", "237");
        var output = "";
        require.coverage_line("sha512", "238");
        for (var i = 0; i < input.length * 32; i += 8) {
            require.coverage_line("sha512", "239");
            output += String.fromCharCode(input[i >> 5] >>> 24 - i % 32 & 255);
        }
        require.coverage_line("sha512", "240");
        return output;
    }
    require.coverage_line("sha512", "246");
    var sha512_k;
    require.coverage_line("sha512", "247");
    function binb_sha512(x, len) {
        require.coverage_function("sha512", "binb_sha512:247:7299");
        require.coverage_line("sha512", "249");
        if (require.coverage_condition("sha512", "if:249:7335", sha512_k == undefined)) {
            require.coverage_line("sha512", "252");
            sha512_k = new Array(new int64(1116352408, -685199838), new int64(1899447441, 602891725), new int64(-1245643825, -330482897), new int64(-373957723, -2121671748), new int64(961987163, -213338824), new int64(1508970993, -1241133031), new int64(-1841331548, -1357295717), new int64(-1424204075, -630357736), new int64(-670586216, -1560083902), new int64(310598401, 1164996542), new int64(607225278, 1323610764), new int64(1426881987, -704662302), new int64(1925078388, -226784913), new int64(-2132889090, 991336113), new int64(-1680079193, 633803317), new int64(-1046744716, -815192428), new int64(-459576895, -1628353838), new int64(-272742522, 944711139), new int64(264347078, -1953704523), new int64(604807628, 2007800933), new int64(770255983, 1495990901), new int64(1249150122, 1856431235), new int64(1555081692, -1119749164), new int64(1996064986, -2096016459), new int64(-1740746414, -295247957), new int64(-1473132947, 766784016), new int64(-1341970488, -1728372417), new int64(-1084653625, -1091629340), new int64(-958395405, 1034457026), new int64(-710438585, -1828018395), new int64(113926993, -536640913), new int64(338241895, 168717936), new int64(666307205, 1188179964), new int64(773529912, 1546045734), new int64(1294757372, 1522805485), new int64(1396182291, -1651133473), new int64(1695183700, -1951439906), new int64(1986661051, 1014477480), new int64(-2117940946, 1206759142), new int64(-1838011259, 344077627), new int64(-1564481375, 1290863460), new int64(-1474664885, -1136513023), new int64(-1035236496, -789014639), new int64(-949202525, 106217008), new int64(-778901479, -688958952), new int64(-694614492, 1432725776), new int64(-200395387, 1467031594), new int64(275423344, 851169720), new int64(430227734, -1194143544), new int64(506948616, 1363258195), new int64(659060556, -544281703), new int64(883997877, -509917016), new int64(958139571, -976659869), new int64(1322822218, -482243893), new int64(1537002063, 2003034995), new int64(1747873779, -692930397), new int64(1955562222, 1575990012), new int64(2024104815, 1125592928), new int64(-2067236844, -1578062990), new int64(-1933114872, 442776044), new int64(-1866530822, 593698344), new int64(-1538233109, -561857047), new int64(-1090935817, -1295615723), new int64(-965641998, -479046869), new int64(-903397682, -366583396), new int64(-779700025, 566280711), new int64(-354779690, -840897762), new int64(-176337025, -294727304), new int64(116418474, 1914138554), new int64(174292421, -1563912026), new int64(289380356, -1090974290), new int64(460393269, 320620315), new int64(685471733, 587496836), new int64(852142971, 1086792851), new int64(1017036298, 365543100), new int64(1126000580, -1676669620), new int64(1288033470, -885112138), new int64(1501505948, -60457430), new int64(1607167915, 987167468), new int64(1816402316, 1246189591));
        }
        require.coverage_line("sha512", "296");
        var H = new Array(new int64(1779033703, -205731576), new int64(-1150833019, -2067093701), new int64(1013904242, -23791573), new int64(-1521486534, 1595750129), new int64(1359893119, -1377402159), new int64(-1694144372, 725511199), new int64(528734635, -79577749), new int64(1541459225, 327033209));
        require.coverage_line("sha512", "306");
        var T1 = new int64(0, 0), T2 = new int64(0, 0), a = new int64(0, 0), b = new int64(0, 0), c = new int64(0, 0), d = new int64(0, 0), e = new int64(0, 0), f = new int64(0, 0), g = new int64(0, 0), h = new int64(0, 0), s0 = new int64(0, 0), s1 = new int64(0, 0), Ch = new int64(0, 0), Maj = new int64(0, 0), r1 = new int64(0, 0), r2 = new int64(0, 0), r3 = new int64(0, 0);
        require.coverage_line("sha512", "324");
        var j, i;
        require.coverage_line("sha512", "325");
        var W = new Array(80);
        require.coverage_line("sha512", "326");
        for (i = 0; i < 80; i++) {
            require.coverage_line("sha512", "327");
            W[i] = new int64(0, 0);
        }
        require.coverage_line("sha512", "330");
        x[len >> 5] |= 128 << 24 - (len & 31);
        require.coverage_line("sha512", "331");
        x[(len + 128 >> 10 << 5) + 31] = len;
        require.coverage_line("sha512", "333");
        for (i = 0; i < x.length; i += 32) {
            require.coverage_line("sha512", "335");
            int64copy(a, H[0]);
            require.coverage_line("sha512", "336");
            int64copy(b, H[1]);
            require.coverage_line("sha512", "337");
            int64copy(c, H[2]);
            require.coverage_line("sha512", "338");
            int64copy(d, H[3]);
            require.coverage_line("sha512", "339");
            int64copy(e, H[4]);
            require.coverage_line("sha512", "340");
            int64copy(f, H[5]);
            require.coverage_line("sha512", "341");
            int64copy(g, H[6]);
            require.coverage_line("sha512", "342");
            int64copy(h, H[7]);
            require.coverage_line("sha512", "344");
            for (j = 0; j < 16; j++) {
                require.coverage_line("sha512", "346");
                W[j].h = x[i + 2 * j];
                require.coverage_line("sha512", "347");
                W[j].l = x[i + 2 * j + 1];
            }
            require.coverage_line("sha512", "350");
            for (j = 16; j < 80; j++) {
                require.coverage_line("sha512", "353");
                int64rrot(r1, W[j - 2], 19);
                require.coverage_line("sha512", "354");
                int64revrrot(r2, W[j - 2], 29);
                require.coverage_line("sha512", "355");
                int64shr(r3, W[j - 2], 6);
                require.coverage_line("sha512", "356");
                s1.l = r1.l ^ r2.l ^ r3.l;
                require.coverage_line("sha512", "357");
                s1.h = r1.h ^ r2.h ^ r3.h;
                require.coverage_line("sha512", "359");
                int64rrot(r1, W[j - 15], 1);
                require.coverage_line("sha512", "360");
                int64rrot(r2, W[j - 15], 8);
                require.coverage_line("sha512", "361");
                int64shr(r3, W[j - 15], 7);
                require.coverage_line("sha512", "362");
                s0.l = r1.l ^ r2.l ^ r3.l;
                require.coverage_line("sha512", "363");
                s0.h = r1.h ^ r2.h ^ r3.h;
                require.coverage_line("sha512", "365");
                int64add4(W[j], s1, W[j - 7], s0, W[j - 16]);
            }
            require.coverage_line("sha512", "368");
            for (j = 0; j < 80; j++) {
                require.coverage_line("sha512", "371");
                Ch.l = e.l & f.l ^ ~e.l & g.l;
                require.coverage_line("sha512", "372");
                Ch.h = e.h & f.h ^ ~e.h & g.h;
                require.coverage_line("sha512", "375");
                int64rrot(r1, e, 14);
                require.coverage_line("sha512", "376");
                int64rrot(r2, e, 18);
                require.coverage_line("sha512", "377");
                int64revrrot(r3, e, 9);
                require.coverage_line("sha512", "378");
                s1.l = r1.l ^ r2.l ^ r3.l;
                require.coverage_line("sha512", "379");
                s1.h = r1.h ^ r2.h ^ r3.h;
                require.coverage_line("sha512", "382");
                int64rrot(r1, a, 28);
                require.coverage_line("sha512", "383");
                int64revrrot(r2, a, 2);
                require.coverage_line("sha512", "384");
                int64revrrot(r3, a, 7);
                require.coverage_line("sha512", "385");
                s0.l = r1.l ^ r2.l ^ r3.l;
                require.coverage_line("sha512", "386");
                s0.h = r1.h ^ r2.h ^ r3.h;
                require.coverage_line("sha512", "389");
                Maj.l = a.l & b.l ^ a.l & c.l ^ b.l & c.l;
                require.coverage_line("sha512", "390");
                Maj.h = a.h & b.h ^ a.h & c.h ^ b.h & c.h;
                require.coverage_line("sha512", "392");
                int64add5(T1, h, s1, Ch, sha512_k[j], W[j]);
                require.coverage_line("sha512", "393");
                int64add(T2, s0, Maj);
                require.coverage_line("sha512", "395");
                int64copy(h, g);
                require.coverage_line("sha512", "396");
                int64copy(g, f);
                require.coverage_line("sha512", "397");
                int64copy(f, e);
                require.coverage_line("sha512", "398");
                int64add(e, d, T1);
                require.coverage_line("sha512", "399");
                int64copy(d, c);
                require.coverage_line("sha512", "400");
                int64copy(c, b);
                require.coverage_line("sha512", "401");
                int64copy(b, a);
                require.coverage_line("sha512", "402");
                int64add(a, T1, T2);
            }
            require.coverage_line("sha512", "404");
            int64add(H[0], H[0], a);
            require.coverage_line("sha512", "405");
            int64add(H[1], H[1], b);
            require.coverage_line("sha512", "406");
            int64add(H[2], H[2], c);
            require.coverage_line("sha512", "407");
            int64add(H[3], H[3], d);
            require.coverage_line("sha512", "408");
            int64add(H[4], H[4], e);
            require.coverage_line("sha512", "409");
            int64add(H[5], H[5], f);
            require.coverage_line("sha512", "410");
            int64add(H[6], H[6], g);
            require.coverage_line("sha512", "411");
            int64add(H[7], H[7], h);
        }
        require.coverage_line("sha512", "415");
        var hash = new Array(16);
        require.coverage_line("sha512", "416");
        for (i = 0; i < 8; i++) {
            require.coverage_line("sha512", "418");
            hash[2 * i] = H[i].h;
            require.coverage_line("sha512", "419");
            hash[2 * i + 1] = H[i].l;
        }
        require.coverage_line("sha512", "421");
        return hash;
    }
    require.coverage_line("sha512", "425");
    function int64(h, l) {
        require.coverage_function("sha512", "int64:425:13443");
        require.coverage_line("sha512", "427");
        this.h = h;
        require.coverage_line("sha512", "428");
        this.l = l;
    }
    require.coverage_line("sha512", "433");
    function int64copy(dst, src) {
        require.coverage_function("sha512", "int64copy:433:13588");
        require.coverage_line("sha512", "435");
        dst.h = src.h;
        require.coverage_line("sha512", "436");
        dst.l = src.l;
    }
    require.coverage_line("sha512", "442");
    function int64rrot(dst, x, shift) {
        require.coverage_function("sha512", "int64rrot:442:13768");
        require.coverage_line("sha512", "444");
        dst.l = x.l >>> shift | x.h << 32 - shift;
        require.coverage_line("sha512", "445");
        dst.h = x.h >>> shift | x.l << 32 - shift;
    }
    require.coverage_line("sha512", "450");
    function int64revrrot(dst, x, shift) {
        require.coverage_function("sha512", "int64revrrot:450:14023");
        require.coverage_line("sha512", "452");
        dst.l = x.h >>> shift | x.l << 32 - shift;
        require.coverage_line("sha512", "453");
        dst.h = x.l >>> shift | x.h << 32 - shift;
    }
    require.coverage_line("sha512", "458");
    function int64shr(dst, x, shift) {
        require.coverage_function("sha512", "int64shr:458:14273");
        require.coverage_line("sha512", "460");
        dst.l = x.l >>> shift | x.h << 32 - shift;
        require.coverage_line("sha512", "461");
        dst.h = x.h >>> shift;
    }
    require.coverage_line("sha512", "466");
    function int64add(dst, x, y) {
        require.coverage_function("sha512", "int64add:466:14488");
        require.coverage_line("sha512", "468");
        var w0 = (x.l & 65535) + (y.l & 65535);
        require.coverage_line("sha512", "469");
        var w1 = (x.l >>> 16) + (y.l >>> 16) + (w0 >>> 16);
        require.coverage_line("sha512", "470");
        var w2 = (x.h & 65535) + (y.h & 65535) + (w1 >>> 16);
        require.coverage_line("sha512", "471");
        var w3 = (x.h >>> 16) + (y.h >>> 16) + (w2 >>> 16);
        require.coverage_line("sha512", "472");
        dst.l = w0 & 65535 | w1 << 16;
        require.coverage_line("sha512", "473");
        dst.h = w2 & 65535 | w3 << 16;
    }
    require.coverage_line("sha512", "477");
    function int64add4(dst, a, b, c, d) {
        require.coverage_function("sha512", "int64add4:477:14887");
        require.coverage_line("sha512", "479");
        var w0 = (a.l & 65535) + (b.l & 65535) + (c.l & 65535) + (d.l & 65535);
        require.coverage_line("sha512", "480");
        var w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (w0 >>> 16);
        require.coverage_line("sha512", "481");
        var w2 = (a.h & 65535) + (b.h & 65535) + (c.h & 65535) + (d.h & 65535) + (w1 >>> 16);
        require.coverage_line("sha512", "482");
        var w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (w2 >>> 16);
        require.coverage_line("sha512", "483");
        dst.l = w0 & 65535 | w1 << 16;
        require.coverage_line("sha512", "484");
        dst.h = w2 & 65535 | w3 << 16;
    }
    require.coverage_line("sha512", "488");
    function int64add5(dst, a, b, c, d, e) {
        require.coverage_function("sha512", "int64add5:488:15378");
        require.coverage_line("sha512", "490");
        var w0 = (a.l & 65535) + (b.l & 65535) + (c.l & 65535) + (d.l & 65535) + (e.l & 65535);
        require.coverage_line("sha512", "491");
        var w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (e.l >>> 16) + (w0 >>> 16);
        require.coverage_line("sha512", "492");
        var w2 = (a.h & 65535) + (b.h & 65535) + (c.h & 65535) + (d.h & 65535) + (e.h & 65535) + (w1 >>> 16);
        require.coverage_line("sha512", "493");
        var w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (e.h >>> 16) + (w2 >>> 16);
        require.coverage_line("sha512", "494");
        dst.l = w0 & 65535 | w1 << 16;
        require.coverage_line("sha512", "495");
        dst.h = w2 & 65535 | w3 << 16;
    }
    require.coverage_line("sha512", "498");
    module.exports = hex_sha512;
}),
"md5": (function(require, exports, module) {
    var require = arguments[0];
    require.coverage_function("md5", "(?):0:1");
    require.coverage_line("md5", "14");
    var hexcase = 0;
    require.coverage_line("md5", "15");
    var b64pad = "";
    require.coverage_line("md5", "21");
    function hex_md5(s) {
        require.coverage_function("md5", "hex_md5:21:845");
        require.coverage_line("md5", "21");
        return rstr2hex(rstr_md5(str2rstr_utf8(s)));
    }
    require.coverage_line("md5", "22");
    function b64_md5(s) {
        require.coverage_function("md5", "b64_md5:22:917");
        require.coverage_line("md5", "22");
        return rstr2b64(rstr_md5(str2rstr_utf8(s)));
    }
    require.coverage_line("md5", "23");
    function any_md5(s, e) {
        require.coverage_function("md5", "any_md5:23:989");
        require.coverage_line("md5", "23");
        return rstr2any(rstr_md5(str2rstr_utf8(s)), e);
    }
    require.coverage_line("md5", "24");
    function hex_hmac_md5(k, d) {
        require.coverage_function("md5", "hex_hmac_md5:24:1064");
        require.coverage_line("md5", "25");
        return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
    }
    require.coverage_line("md5", "26");
    function b64_hmac_md5(k, d) {
        require.coverage_function("md5", "b64_hmac_md5:26:1166");
        require.coverage_line("md5", "27");
        return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
    }
    require.coverage_line("md5", "28");
    function any_hmac_md5(k, d, e) {
        require.coverage_function("md5", "any_hmac_md5:28:1268");
        require.coverage_line("md5", "29");
        return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e);
    }
    require.coverage_line("md5", "34");
    function md5_vm_test() {
        require.coverage_function("md5", "md5_vm_test:34:1442");
        require.coverage_line("md5", "36");
        return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
    }
    require.coverage_line("md5", "42");
    function rstr_md5(s) {
        require.coverage_function("md5", "rstr_md5:42:1591");
        require.coverage_line("md5", "44");
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }
    require.coverage_line("md5", "50");
    function rstr_hmac_md5(key, data) {
        require.coverage_function("md5", "rstr_hmac_md5:50:1746");
        require.coverage_line("md5", "52");
        var bkey = rstr2binl(key);
        require.coverage_line("md5", "53");
        if (require.coverage_condition("md5", "if:53:1816", bkey.length > 16)) {
            require.coverage_line("md5", "53");
            bkey = binl_md5(bkey, key.length * 8);
        }
        require.coverage_line("md5", "55");
        var ipad = Array(16), opad = Array(16);
        require.coverage_line("md5", "56");
        for (var i = 0; i < 16; i++) {
            require.coverage_line("md5", "58");
            ipad[i] = bkey[i] ^ 909522486;
            require.coverage_line("md5", "59");
            opad[i] = bkey[i] ^ 1549556828;
        }
        require.coverage_line("md5", "62");
        var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        require.coverage_line("md5", "63");
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }
    require.coverage_line("md5", "69");
    function rstr2hex(input) {
        require.coverage_function("md5", "rstr2hex:69:2213");
        require.coverage_line("md5", "71");
        try {
            require.coverage_line("md5", "71");
            hexcase;
        } catch (e) {
            require.coverage_line("md5", "71");
            hexcase = 0;
        }
        require.coverage_line("md5", "72");
        var hex_tab = require.coverage_condition("md5", "conditional:72:2298", hexcase) ? "0123456789ABCDEF" : "0123456789abcdef";
        require.coverage_line("md5", "73");
        var output = "";
        require.coverage_line("md5", "74");
        var x;
        require.coverage_line("md5", "75");
        for (var i = 0; i < input.length; i++) {
            require.coverage_line("md5", "77");
            x = input.charCodeAt(i);
            require.coverage_line("md5", "78");
            output += hex_tab.charAt(x >>> 4 & 15) + hex_tab.charAt(x & 15);
        }
        require.coverage_line("md5", "81");
        return output;
    }
    require.coverage_line("md5", "87");
    function rstr2b64(input) {
        require.coverage_function("md5", "rstr2b64:87:2620");
        require.coverage_line("md5", "89");
        try {
            require.coverage_line("md5", "89");
            b64pad;
        } catch (e) {
            require.coverage_line("md5", "89");
            b64pad = "";
        }
        require.coverage_line("md5", "90");
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        require.coverage_line("md5", "91");
        var output = "";
        require.coverage_line("md5", "92");
        var len = input.length;
        require.coverage_line("md5", "93");
        for (var i = 0; i < len; i += 3) {
            require.coverage_line("md5", "95");
            var triplet = input.charCodeAt(i) << 16 | (require.coverage_condition("md5", "conditional:96:s", i + 1 < len) ? input.charCodeAt(i + 1) << 8 : 0) | (require.coverage_condition("md5", "conditional:97:s", i + 2 < len) ? input.charCodeAt(i + 2) : 0);
            require.coverage_line("md5", "98");
            for (var j = 0; j < 4; j++) {
                require.coverage_line("md5", "100");
                if (require.coverage_condition("md5", "if:100:3074", i * 8 + j * 6 > input.length * 8)) {
                    require.coverage_line("md5", "100");
                    output += b64pad;
                } else {
                    require.coverage_line("md5", "101");
                    output += tab.charAt(triplet >>> 6 * (3 - j) & 63);
                }
            }
        }
        require.coverage_line("md5", "104");
        return output;
    }
    require.coverage_line("md5", "110");
    function rstr2any(input, encoding) {
        require.coverage_function("md5", "rstr2any:110:3282");
        require.coverage_line("md5", "112");
        var divisor = encoding.length;
        require.coverage_line("md5", "113");
        var i, j, q, x, quotient;
        require.coverage_line("md5", "116");
        var dividend = Array(Math.ceil(input.length / 2));
        require.coverage_line("md5", "117");
        for (i = 0; i < dividend.length; i++) {
            require.coverage_line("md5", "119");
            dividend[i] = input.charCodeAt(i * 2) << 8 | input.charCodeAt(i * 2 + 1);
        }
        require.coverage_line("md5", "128");
        var full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
        require.coverage_line("md5", "130");
        var remainders = Array(full_length);
        require.coverage_line("md5", "131");
        for (j = 0; j < full_length; j++) {
            require.coverage_line("md5", "133");
            quotient = Array();
            require.coverage_line("md5", "134");
            x = 0;
            require.coverage_line("md5", "135");
            for (i = 0; i < dividend.length; i++) {
                require.coverage_line("md5", "137");
                x = (x << 16) + dividend[i];
                require.coverage_line("md5", "138");
                q = Math.floor(x / divisor);
                require.coverage_line("md5", "139");
                x -= q * divisor;
                require.coverage_line("md5", "140");
                if (require.coverage_condition("md5", "if:140:4286", quotient.length > 0) || require.coverage_condition("md5", "if:140:4313", q > 0)) {
                    require.coverage_line("md5", "141");
                    quotient[quotient.length] = q;
                }
            }
            require.coverage_line("md5", "143");
            remainders[j] = x;
            require.coverage_line("md5", "144");
            dividend = quotient;
        }
        require.coverage_line("md5", "148");
        var output = "";
        require.coverage_line("md5", "149");
        for (i = remainders.length - 1; i >= 0; i--) {
            require.coverage_line("md5", "150");
            output += encoding.charAt(remainders[i]);
        }
        require.coverage_line("md5", "152");
        return output;
    }
    require.coverage_line("md5", "159");
    function str2rstr_utf8(input) {
        require.coverage_function("md5", "str2rstr_utf8:159:4693");
        require.coverage_line("md5", "161");
        var output = "";
        require.coverage_line("md5", "162");
        var i = -1;
        require.coverage_line("md5", "163");
        var x, y;
        require.coverage_line("md5", "165");
        while (++i < input.length) {
            require.coverage_line("md5", "168");
            x = input.charCodeAt(i);
            require.coverage_line("md5", "169");
            y = require.coverage_condition("md5", "undefined:s", i + 1 < input.length) ? input.charCodeAt(i + 1) : 0;
            require.coverage_line("md5", "170");
            if (require.coverage_condition("md5", "if:170:4939", 55296 <= x) && require.coverage_condition("md5", "if:170:4939", x <= 56319) && require.coverage_condition("md5", "if:170:4939", 56320 <= y) && require.coverage_condition("md5", "if:170:4989", y <= 57343)) {
                require.coverage_line("md5", "172");
                x = 65536 + ((x & 1023) << 10) + (y & 1023);
                require.coverage_line("md5", "173");
                i++;
            }
            require.coverage_line("md5", "177");
            if (require.coverage_condition("md5", "if:177:5118", x <= 127)) {
                require.coverage_line("md5", "178");
                output += String.fromCharCode(x);
            } else {
                require.coverage_line("md5", "179");
                if (require.coverage_condition("md5", "if:179:5181", x <= 2047)) {
                    require.coverage_line("md5", "180");
                    output += String.fromCharCode(192 | x >>> 6 & 31, 128 | x & 63);
                } else {
                    require.coverage_line("md5", "182");
                    if (require.coverage_condition("md5", "if:182:5334", x <= 65535)) {
                        require.coverage_line("md5", "183");
                        output += String.fromCharCode(224 | x >>> 12 & 15, 128 | x >>> 6 & 63, 128 | x & 63);
                    } else {
                        require.coverage_line("md5", "186");
                        if (require.coverage_condition("md5", "if:186:5552", x <= 2097151)) {
                            require.coverage_line("md5", "187");
                            output += String.fromCharCode(240 | x >>> 18 & 7, 128 | x >>> 12 & 63, 128 | x >>> 6 & 63, 128 | x & 63);
                        }
                    }
                }
            }
        }
        require.coverage_line("md5", "192");
        return output;
    }
    require.coverage_line("md5", "198");
    function str2rstr_utf16le(input) {
        require.coverage_function("md5", "str2rstr_utf16le:198:5884");
        require.coverage_line("md5", "200");
        var output = "";
        require.coverage_line("md5", "201");
        for (var i = 0; i < input.length; i++) {
            require.coverage_line("md5", "202");
            output += String.fromCharCode(input.charCodeAt(i) & 255, input.charCodeAt(i) >>> 8 & 255);
        }
        require.coverage_line("md5", "204");
        return output;
    }
    require.coverage_line("md5", "207");
    function str2rstr_utf16be(input) {
        require.coverage_function("md5", "str2rstr_utf16be:207:6139");
        require.coverage_line("md5", "209");
        var output = "";
        require.coverage_line("md5", "210");
        for (var i = 0; i < input.length; i++) {
            require.coverage_line("md5", "211");
            output += String.fromCharCode(input.charCodeAt(i) >>> 8 & 255, input.charCodeAt(i) & 255);
        }
        require.coverage_line("md5", "213");
        return output;
    }
    require.coverage_line("md5", "220");
    function rstr2binl(input) {
        require.coverage_function("md5", "rstr2binl:220:6518");
        require.coverage_line("md5", "222");
        var output = Array(input.length >> 2);
        require.coverage_line("md5", "223");
        for (var i = 0; i < output.length; i++) {
            require.coverage_line("md5", "224");
            output[i] = 0;
        }
        require.coverage_line("md5", "225");
        for (var i = 0; i < input.length * 8; i += 8) {
            require.coverage_line("md5", "226");
            output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << i % 32;
        }
        require.coverage_line("md5", "227");
        return output;
    }
    require.coverage_line("md5", "233");
    function binl2rstr(input) {
        require.coverage_function("md5", "binl2rstr:233:6840");
        require.coverage_line("md5", "235");
        var output = "";
        require.coverage_line("md5", "236");
        for (var i = 0; i < input.length * 32; i += 8) {
            require.coverage_line("md5", "237");
            output += String.fromCharCode(input[i >> 5] >>> i % 32 & 255);
        }
        require.coverage_line("md5", "238");
        return output;
    }
    require.coverage_line("md5", "244");
    function binl_md5(x, len) {
        require.coverage_function("md5", "binl_md5:244:7107");
        require.coverage_line("md5", "247");
        x[len >> 5] |= 128 << len % 32;
        require.coverage_line("md5", "248");
        x[(len + 64 >>> 9 << 4) + 14] = len;
        require.coverage_line("md5", "250");
        var a = 1732584193;
        require.coverage_line("md5", "251");
        var b = -271733879;
        require.coverage_line("md5", "252");
        var c = -1732584194;
        require.coverage_line("md5", "253");
        var d = 271733878;
        require.coverage_line("md5", "255");
        for (var i = 0; i < x.length; i += 16) {
            require.coverage_line("md5", "257");
            var olda = a;
            require.coverage_line("md5", "258");
            var oldb = b;
            require.coverage_line("md5", "259");
            var oldc = c;
            require.coverage_line("md5", "260");
            var oldd = d;
            require.coverage_line("md5", "262");
            a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
            require.coverage_line("md5", "263");
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            require.coverage_line("md5", "264");
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            require.coverage_line("md5", "265");
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            require.coverage_line("md5", "266");
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            require.coverage_line("md5", "267");
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            require.coverage_line("md5", "268");
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            require.coverage_line("md5", "269");
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            require.coverage_line("md5", "270");
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            require.coverage_line("md5", "271");
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            require.coverage_line("md5", "272");
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            require.coverage_line("md5", "273");
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            require.coverage_line("md5", "274");
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            require.coverage_line("md5", "275");
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            require.coverage_line("md5", "276");
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            require.coverage_line("md5", "277");
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
            require.coverage_line("md5", "279");
            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            require.coverage_line("md5", "280");
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            require.coverage_line("md5", "281");
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            require.coverage_line("md5", "282");
            b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
            require.coverage_line("md5", "283");
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            require.coverage_line("md5", "284");
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            require.coverage_line("md5", "285");
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            require.coverage_line("md5", "286");
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            require.coverage_line("md5", "287");
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            require.coverage_line("md5", "288");
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            require.coverage_line("md5", "289");
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            require.coverage_line("md5", "290");
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            require.coverage_line("md5", "291");
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            require.coverage_line("md5", "292");
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            require.coverage_line("md5", "293");
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            require.coverage_line("md5", "294");
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
            require.coverage_line("md5", "296");
            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            require.coverage_line("md5", "297");
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            require.coverage_line("md5", "298");
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            require.coverage_line("md5", "299");
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            require.coverage_line("md5", "300");
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            require.coverage_line("md5", "301");
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            require.coverage_line("md5", "302");
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            require.coverage_line("md5", "303");
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            require.coverage_line("md5", "304");
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            require.coverage_line("md5", "305");
            d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
            require.coverage_line("md5", "306");
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            require.coverage_line("md5", "307");
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            require.coverage_line("md5", "308");
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            require.coverage_line("md5", "309");
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            require.coverage_line("md5", "310");
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            require.coverage_line("md5", "311");
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
            require.coverage_line("md5", "313");
            a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
            require.coverage_line("md5", "314");
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            require.coverage_line("md5", "315");
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            require.coverage_line("md5", "316");
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            require.coverage_line("md5", "317");
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            require.coverage_line("md5", "318");
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            require.coverage_line("md5", "319");
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            require.coverage_line("md5", "320");
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            require.coverage_line("md5", "321");
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            require.coverage_line("md5", "322");
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            require.coverage_line("md5", "323");
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            require.coverage_line("md5", "324");
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            require.coverage_line("md5", "325");
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            require.coverage_line("md5", "326");
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            require.coverage_line("md5", "327");
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            require.coverage_line("md5", "328");
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
            require.coverage_line("md5", "330");
            a = safe_add(a, olda);
            require.coverage_line("md5", "331");
            b = safe_add(b, oldb);
            require.coverage_line("md5", "332");
            c = safe_add(c, oldc);
            require.coverage_line("md5", "333");
            d = safe_add(d, oldd);
        }
        require.coverage_line("md5", "335");
        return Array(a, b, c, d);
    }
    require.coverage_line("md5", "341");
    function md5_cmn(q, a, b, x, s, t) {
        require.coverage_function("md5", "md5_cmn:341:11082");
        require.coverage_line("md5", "343");
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    require.coverage_line("md5", "345");
    function md5_ff(a, b, c, d, x, s, t) {
        require.coverage_function("md5", "md5_ff:345:11196");
        require.coverage_line("md5", "347");
        return md5_cmn(b & c | ~b & d, a, b, x, s, t);
    }
    require.coverage_line("md5", "349");
    function md5_gg(a, b, c, d, x, s, t) {
        require.coverage_function("md5", "md5_gg:349:11292");
        require.coverage_line("md5", "351");
        return md5_cmn(b & d | c & ~d, a, b, x, s, t);
    }
    require.coverage_line("md5", "353");
    function md5_hh(a, b, c, d, x, s, t) {
        require.coverage_function("md5", "md5_hh:353:11388");
        require.coverage_line("md5", "355");
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    require.coverage_line("md5", "357");
    function md5_ii(a, b, c, d, x, s, t) {
        require.coverage_function("md5", "md5_ii:357:11473");
        require.coverage_line("md5", "359");
        return md5_cmn(c ^ (b | ~d), a, b, x, s, t);
    }
    require.coverage_line("md5", "366");
    function safe_add(x, y) {
        require.coverage_function("md5", "safe_add:366:11693");
        require.coverage_line("md5", "368");
        var lsw = (x & 65535) + (y & 65535);
        require.coverage_line("md5", "369");
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        require.coverage_line("md5", "370");
        return msw << 16 | lsw & 65535;
    }
    require.coverage_line("md5", "376");
    function bit_rol(num, cnt) {
        require.coverage_function("md5", "bit_rol:376:11905");
        require.coverage_line("md5", "378");
        return num << cnt | num >>> 32 - cnt;
    }
    require.coverage_line("md5", "381");
    module.exports = hex_md5;
}),
"statsLogger": (function (require, exports, module) { /* wrapped by builder */
var $log = $('.b-log'),
    $coverage = $('.b-coverage');

$('.b-stats-button').click(function () {

    var stats = require.stats(),
        globalCoverage = stats.global,
        modulesStats = stats.modules;

    console.log(stats);

    $coverage.text(
        'Global coverage\n' +
        'Conditions: ' + globalCoverage.conditions.percentage.toFixed(2) + '%\n' +
        'Functions: ' + globalCoverage.functions.percentage.toFixed(2) + '%\n' +
        'Statements: ' + globalCoverage.lines.percentage.toFixed(2) + '%'
    );

    $log.empty();
    $(
        '<tr>' +
            '<th>name</th>' +
            '<th>type</th>' +
            '<th>initialization time</th>' +
            '<th>module required at</th>' +
            '<th>module required by</th>' +
            '<th>Conditions</th>' +
            '<th>Functions</th>' +
            '<th>Statements</th>' +
        '</tr>'
    ).appendTo($log);

    for (var moduleName in modulesStats) {
        var module = modulesStats[moduleName];
        $(
            '<tr>' +
                '<td><strong>' + moduleName + '</strong>' + (moduleName !== module.name ? ' -> ' + module.name : '') + '</td>' +
                '<td>' + module.type + '</td>' +
                (module.initTime < 0 ? moduleName == "main" ? '<td>0ms</td>' : '<td>[not inited]</td>' : '<td>' + module.initTime + 'ms</td>') +
                '<td>' + (module.accessTimes.join('ms, ') || 0) + 'ms</td>' +
                '<td>' + Object.keys(module.moduleAccessTimes) + '</td>' +
                (module.coverage ?
                '<td>' + module.coverage.conditions.percentage.toFixed(2) + '%</td>' +
                '<td>' + module.coverage.functions.percentage.toFixed(2) + '%</td>' +
                '<td>' + module.coverage.lines.percentage.toFixed(2) + '%</td>'
                : '<td>[no info]</td><td>[no info]</td><td>[no info]</td>') +
            '</tr>'
        ).appendTo($log);
    }
});
})
},{"main":{"lines":["5","7","8","11","12","16","17","18","19","20","23","25"],"conditions":[],"functions":["(?):0:1","decorateInputs:7:154","(?):11:230","calculateSha512OfMd5:16:349"],"coverage":1},"unused":{"lines":["2","3","4"],"conditions":["if:3:89"],"functions":["(?):0:1","(?):2:67"],"coverage":1},"sha512":{"lines":["14","15","21","21","22","22","23","23","24","25","26","27","28","29","34","36","44","46","52","54","55","55","57","58","60","61","64","65","71","73","73","73","74","75","76","77","79","80","83","89","91","91","91","92","93","94","95","97","100","102","102","103","106","112","114","115","118","119","121","130","132","133","135","136","137","139","140","141","142","143","145","146","150","151","152","154","161","163","164","165","167","170","171","172","174","175","179","180","181","182","184","185","188","189","194","200","202","203","204","206","209","211","212","213","215","222","224","225","226","227","228","229","235","237","238","239","240","246","247","249","252","296","306","324","325","326","327","330","331","333","335","336","337","338","339","340","341","342","344","346","347","350","353","354","355","356","357","359","360","361","362","363","365","368","371","372","375","376","377","378","379","382","383","384","385","386","389","390","392","393","395","396","397","398","399","400","401","402","404","405","406","407","408","409","410","411","415","416","418","419","421","425","427","428","433","435","436","442","444","445","450","452","453","458","460","461","466","468","469","470","471","472","473","477","479","480","481","482","483","484","488","490","491","492","493","494","495","498"],"conditions":["if:55:1976","conditional:74:2469","conditional:98:s","conditional:99:s","if:102:3245","if:142:4457","if:142:4484","undefined:s","if:172:5110","if:172:5110","if:172:5110","if:172:5160","if:179:5289","if:181:5352","if:184:5505","if:188:5723","if:249:7335"],"functions":["(?):0:1","hex_sha512:21:840","b64_sha512:22:918","any_sha512:23:996","hex_hmac_sha512:24:1076","b64_hmac_sha512:26:1184","any_hmac_sha512:28:1292","sha512_vm_test:34:1471","rstr_sha512:44:1739","rstr_hmac_sha512:52:1903","rstr2hex:71:2384","rstr2b64:89:2791","rstr2any:112:3453","str2rstr_utf8:161:4864","str2rstr_utf16le:200:6055","str2rstr_utf16be:209:6310","rstr2binb:222:6686","binb2rstr:235:7012","binb_sha512:247:7299","int64:425:13443","int64copy:433:13588","int64rrot:442:13768","int64revrrot:450:14023","int64shr:458:14273","int64add:466:14488","int64add4:477:14887","int64add5:488:15378"],"coverage":1},"md5":{"lines":["14","15","21","21","22","22","23","23","24","25","26","27","28","29","34","36","42","44","50","52","53","53","55","56","58","59","62","63","69","71","71","71","72","73","74","75","77","78","81","87","89","89","89","90","91","92","93","95","98","100","100","101","104","110","112","113","116","117","119","128","130","131","133","134","135","137","138","139","140","141","143","144","148","149","150","152","159","161","162","163","165","168","169","170","172","173","177","178","179","180","182","183","186","187","192","198","200","201","202","204","207","209","210","211","213","220","222","223","224","225","226","227","233","235","236","237","238","244","247","248","250","251","252","253","255","257","258","259","260","262","263","264","265","266","267","268","269","270","271","272","273","274","275","276","277","279","280","281","282","283","284","285","286","287","288","289","290","291","292","293","294","296","297","298","299","300","301","302","303","304","305","306","307","308","309","310","311","313","314","315","316","317","318","319","320","321","322","323","324","325","326","327","328","330","331","332","333","335","341","343","345","347","349","351","353","355","357","359","366","368","369","370","376","378","381"],"conditions":["if:53:1816","conditional:72:2298","conditional:96:s","conditional:97:s","if:100:3074","if:140:4286","if:140:4313","undefined:s","if:170:4939","if:170:4939","if:170:4939","if:170:4989","if:177:5118","if:179:5181","if:182:5334","if:186:5552"],"functions":["(?):0:1","hex_md5:21:845","b64_md5:22:917","any_md5:23:989","hex_hmac_md5:24:1064","b64_hmac_md5:26:1166","any_hmac_md5:28:1268","md5_vm_test:34:1442","rstr_md5:42:1591","rstr_hmac_md5:50:1746","rstr2hex:69:2213","rstr2b64:87:2620","rstr2any:110:3282","str2rstr_utf8:159:4693","str2rstr_utf16le:198:5884","str2rstr_utf16be:207:6139","rstr2binl:220:6518","binl2rstr:233:6840","binl_md5:244:7107","md5_cmn:341:11082","md5_ff:345:11196","md5_gg:349:11292","md5_hh:353:11388","md5_ii:357:11473","safe_add:366:11693","bit_rol:376:11905"],"coverage":1}},{});
