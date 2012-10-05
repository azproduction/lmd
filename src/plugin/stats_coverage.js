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