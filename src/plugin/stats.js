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
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 * @name coverage_options
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
 * @type {lmdStats}
 */
var stats_results = {},
    stats_Date = global.Date,
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
        var moduleNames = [];
        if (Object.prototype.toString.call(moduleName) !== "[object Array]") {
            moduleNames = [moduleName];
        } else {
            moduleNames = moduleName;
        }

        for (var i = 0, c = moduleNames.length, moduleNamesItem, module; i < c; i++) {
            moduleNamesItem = moduleNames[i];
            module = modules[moduleNamesItem];

            var replacement = lmd_trigger('stats:before-require-count', moduleNamesItem, module);
            if (replacement) {
                moduleNamesItem = replacement[0];
            }
            stats_require_module(moduleNamesItem, byModuleName);
        }
        return method.apply(thisObject, arguments);
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
    index = /*if ($P.IE) {*/shortcuts.indexOf ? /*}*/shortcuts.indexOf(shortcut)/*if ($P.IE) {*/:function(){for(var i=shortcuts.length;i-->0;)if(shortcuts[i]===shortcut)return i;return-1;}()/*}*/;

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
require.stats = function (moduleName) {
    var replacement = lmd_trigger('stats:before-return-stats', moduleName, stats_results);

    if (replacement && replacement[1]) {
        return replacement[1];
    }
    return moduleName ? stats_results[moduleName] : stats_results;
};

lmd_on('lmd-register:call-module', function (event, moduleName, require) {
    return [moduleName, stats_wrap_require(require, moduleName)];
});

lmd_on('lmd-register:after-register', function (event, moduleName, module) {
    stats_initEnd(moduleName);
});

lmd_on('lmd-register:before-register', function (event, moduleName, module) {
    stats_type(moduleName, !module ? 'global' : typeof modules[moduleName] === "undefined" ? 'off-package' : 'in-package');
});

lmd_on('lmd-require:from-cache', function (event, moduleName) {
    stats_require(moduleName);
});

lmd_on('lmd-require:first-init', function (event, moduleName, module) {
    stats_require(moduleName);
    stats_initStart(moduleName);
});

lmd_on('shortcuts:before-resolve', function (event, moduleName, module) {
    // assign shortcut name for module
    stats_shortcut(module, moduleName);
});