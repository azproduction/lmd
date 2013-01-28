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