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
 * @property {String}   name            module name
 * @property {Number[]} accessTimes     module access times
 * @property {Number}   initTime        module init time: load+eval+call
 * @property {String[]} shortcuts       list of used shortcuts
 *
 * @property {String[]} lines           list of all statements
 * @property {String[]} conditions      list of all conditions
 * @property {String[]} functions       list of all functions
 *
 * @property {Object} runLines          {lineId: callTimes}
 * @property {Object} runConditions     {conditionId: [falseTimes, trueTimes]}
 * @property {Object} runFunctions      {functionId: callTimes}
 *
 * @property {LmdCoverage} coverage
 *
 * @example
 *  {
 *      name: "pewpew",
 *      accessTimes: [0, 5, 2715],
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

if ($P.STATS_COVERAGE) {

    /**
     * Calculate coverage total
     *
     * @param moduleName
     */
    function stats_calculate_coverage(moduleName) {
        var stats = stats_get(moduleName),
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
            total: total,
            covered: covered,
            percentage: 100.0 * (total ? covered / total : 1)
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
            total: total,
            covered: covered,
            percentage: 100.0 * (total ? covered / total : 1)
        };
        stats.coverage.report = lineReport;
    }

    /**
     * Line counter
     *
     * @private
     */
    require.coverage_line = function (moduleName, lineId) {
        stats_results[moduleName].runLines[lineId] += 1;
    };

    /**
     * Function call counter
     *
     * @private
     */
    require.coverage_function = function (moduleName, lineId) {
        stats_results[moduleName].runFunctions[lineId] += 1;
    };

    /**
     * Condition counter
     *
     * @private
     */
    require.coverage_condition = function (moduleName, lineId, condition) {
        stats_results[moduleName].runConditions[lineId][condition ? 1 : 0] += 1;
        return condition;
    };

    /**
     * Registers module
     *
     * @private
     */
    function coverage_module(moduleName, lines, conditions, functions) {
        var stats = stats_get(moduleName);
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
        for (var moduleName in coverage_options) {
            if (coverage_options.hasOwnProperty(moduleName)) {
                moduleOption = coverage_options[moduleName];
                coverage_module(moduleName, moduleOption.lines, moduleOption.conditions, moduleOption.functions);
                stats_type(moduleName, 'in-package');
            }
        }
    })();

}

/**
 * Returns module statistics or all statistics
 *
 * @param {String} [moduleName]
 * @return {Object}
 */
require.stats = function (moduleName) {
    if ($P.STATS_COVERAGE) {
        if (moduleName) {
            stats_calculate_coverage(moduleName);
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

            return result;
        }
    }
    return moduleName ? stats_results[moduleName] : stats_results;
};

if ($P.STATS_SENDTO) {
    require.stats.sendTo = function (host) {
        return sendTo(host, "stats", require.stats());
    };
}