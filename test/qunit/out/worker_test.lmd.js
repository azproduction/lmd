(function (global, main, modules, sandboxed_modules, coverage_options) {
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
            stats_type(moduleName, !module ? 'global' : typeof modules[moduleName] === "undefined" ? 'off-package' : 'in-package');
            // Predefine in case of recursive require
            var output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                module = global[moduleName];
            } else if (typeof module === "function") {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                module = module(
                    sandboxed_modules[moduleName] ?
                        {coverage_line: require.coverage_line, coverage_function: require.coverage_function, coverage_condition: require.coverage_condition} ||
                        local_undefined : require,
                    output.exports,
                    output
                ) || output.exports;
            }
            stats_initEnd(moduleName);

            return modules[moduleName] = module;
        },
        /**
         * @param {String} moduleName module name or path to file
         *
         * @returns {*}
         */
        require = function (moduleName) {
            var module = modules[moduleName];

            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                stats_require(moduleName);
                return module;
            }

            // Do not init shortcut as module!
            // return shortcut as is
            if (is_shortcut(moduleName, module)) {
                // assign shortcut name for module
                stats_shortcut(module, moduleName);
                moduleName = module.replace('@', '');
                module = modules[moduleName];
            }

            stats_require(moduleName);
            
            stats_initStart(moduleName);
            // Lazy LMD module not a string
            if (typeof module === "string" && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {exports: {}};

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }



var race_callbacks = {},
    /**
     * Creates race.
     *
     * @param {String}   name     race name
     * @param {Function} callback callback
     */
    create_race = function (name, callback) {
        if (!race_callbacks[name]) {
            // create race
            race_callbacks[name] = [];
        }
        race_callbacks[name].push(callback);

        return function (result) {
            var callbacks = race_callbacks[name];
            while(callbacks && callbacks.length) {
                callbacks.shift()(result);
            }
            // reset race
            race_callbacks[name] = false;
        }
    };
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
    index = shortcuts.indexOf ? shortcuts.indexOf(shortcut):function(){for(var i=shortcuts.length;i-->0;)if(shortcuts[i]===shortcut)return i;return-1;}();

    if (index === -1) {
        shortcuts.push(shortcut);
    }
}



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



/**
 * Returns module statistics or all statistics
 *
 * @param {String} [moduleName]
 * @return {Object}
 */
require.stats = function (moduleName) {

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

    return moduleName ? stats_results[moduleName] : stats_results;
};

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
 */

function is_shortcut(moduleName, moduleContent) {
    return !initialized_modules[moduleName] &&
           typeof moduleContent === "string" &&
           moduleContent.charAt(0) == '@';
}
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
 */

function parallel(method, items, callback) {
    var i = 0,
        j = 0,
        c = items.length,
        results = [];

    var readyFactory = function (index) {
        return function (data) {
            // keep the order
            results[index] = data;
            j++;
            if (j >= c) {
                callback.apply(global, results);
            }
        }
    };

    for (; i < c; i++) {
        method(items[i], readyFactory(i));
    }
}

/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name global_noop
 * @name register_module
 * @name create_race
 * @name race_callbacks
 * @name cache_async
 * @name parallel
 */


    /**
     * @param code
     * @return {Boolean} true if it is a plain LMD module
     */
    var async_is_plain_code = function (code) {
        // remove comments (bad rx - I know it, but it works for that case), spaces and ;
        code = code.replace(/\/\*.*?\*\/|\/\/.*(?=[\n\r])|\s|\;/g, '');

        // simple FD/FE parser
        if (/\(function\(|function[a-z0-9_]+\(/.test(code)) {
            var index = 0,
                length = code.length,
                is_can_return = false,
                string = false,
                parentheses = 0,
                braces = 0;

            while (index < length) {
                switch (code.charAt(index)) {
                    // count braces if not in string
                    case '{':
                        if (!string) {
                            is_can_return = true;
                            braces++
                        }
                        break;
                    case '}':
                        if (!string) braces--;
                        break;

                    case '(':
                        if (!string) parentheses++;
                        break;
                    case ')':
                        if (!string) parentheses--;
                        break;

                    case '\\':
                        if (string) index++; // skip next char in in string
                        break;

                    case "'":
                        if (string === "'") {
                            string = false; // close string
                        } else if (string === false) {
                            string = "'"; // open string
                        }
                        break;

                    case '"':
                        if (string === '"') {
                            string = false; // close string
                        } else if (string === false) {
                            string = '"'; // open string
                        }
                        break;
                }
                index++;

                if (is_can_return && !parentheses && !braces) {
                    return index !== length;
                }
            }
        }
        return true;
    };

    var async_plain = function (module, contentTypeOrExtension) {
        // its NOT a JSON ant its a plain code
        if (!(/json$/).test(contentTypeOrExtension) && async_is_plain_code(module)) {
            // its not a JSON and its a Plain LMD module - wrap it
            module = '(function(require,exports,module){\n' + module + '\n})';
        }
        return module;
    };

    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    require.async = function (moduleName, callback) {
        callback = callback || global_noop;

        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.async, moduleName, callback);
            return require;
        }
        var module = modules[moduleName],
            XMLHttpRequestConstructor = global.XMLHttpRequest || global.ActiveXObject;

        // Its an shortcut
        if (is_shortcut(moduleName, module)) {
            // rewrite module name
            // assign shortcut name for module
            stats_shortcut(module, moduleName);
            moduleName = module.replace('@', '');
            module = modules[moduleName];
        }

        if (!module || initialized_modules[moduleName]) {
            stats_require(moduleName);
        }
        // If module exists or its a node.js env
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }

        stats_initStart(moduleName);

        callback = create_race(moduleName, callback);
        // if already called
        if (race_callbacks[moduleName].length > 1) {
            return require;
        }


        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    module = xhr.responseText;
                    if ((/script$|json$/).test(xhr.getResponseHeader('content-type'))) {
                        module = async_plain(module, xhr.getResponseHeader('content-type'));
                        module = global_eval(module);
                    }

                    // 4. Then callback it
                    callback(register_module(moduleName, module));
                } else {
                    // stop init on error
                    stats_initEnd(moduleName);
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return require;

    };
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
 */

    /**
     * Loads any JavaScript file a non-LMD module
     *
     * @param {String|Array} moduleName path to file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLScriptElement on success
     */
    require.js = function (moduleName, callback) {
        callback = callback || global_noop;

        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.js, moduleName, callback);
            return require;
        }
        var module = modules[moduleName],
            readyState = 'readyState',
            isNotLoaded = 1,
            head;

        // Its an shortcut
        if (is_shortcut(moduleName, module)) {
            // assign shortcut name for module
            stats_shortcut(module, moduleName);
            // rewrite module name
            moduleName = module.replace('@', '');
            module = modules[moduleName];
        }

        if (!module || initialized_modules[moduleName]) {
            stats_require(moduleName);
        }
        // If module exists
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }

        stats_initStart(moduleName);

        callback = create_race(moduleName, callback);
        // if already called
        if (race_callbacks[moduleName].length > 1) {
            return require;
        }
        // by default return undefined
        if (!global_document) {

            // if no global try to require
            // node or worker
            try {
                // call importScripts or require
                // any of them can throw error if file not found or transmission error
                module = register_module(moduleName, (global.importScripts || global.require)(moduleName) || {});
            } catch (e) {
                // error -> default behaviour
                // stop init on error
                stats_initEnd(moduleName);
            }
            callback(module);
            return require;
        }

//#JSCOVERAGE_IF 0
        var script = global_document.createElement("script");
        global.setTimeout(script.onreadystatechange = script.onload = function (e) {
            e = e || global.event;
            if (isNotLoaded &&
                (!e ||
                !script[readyState] ||
                script[readyState] == "loaded" ||
                script[readyState] == "complete")) {

                isNotLoaded = 0;
                // register or cleanup
                // stop init on error
                !e && stats_initEnd(moduleName);
                callback(e ? register_module(moduleName, script) : head.removeChild(script) && local_undefined); // e === undefined if error
            }
        }, 3000, 0);

        script.src = moduleName;
        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);

        return require;
//#JSCOVERAGE_ENDIF
    };
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
 */

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
    require.css = function (moduleName, callback) {
        callback = callback || global_noop;

        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.css, moduleName, callback);
            return require;
        }
        var module = modules[moduleName],
            isNotLoaded = 1,
            head;

        // Its an shortcut
        if (is_shortcut(moduleName, module)) {
            // assign shortcut name for module
            stats_shortcut(module, moduleName);
            // rewrite module name
            moduleName = module.replace('@', '');
            module = modules[moduleName];
        }

        if (!(module || !global_document) || initialized_modules[moduleName]) {
            stats_require(moduleName);
        }
        // If module exists or its a worker or node.js environment
        if (module || !global_document) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }

        stats_initStart(moduleName);

        callback = create_race(moduleName, callback);
        // if already called
        if (race_callbacks[moduleName].length > 1) {
            return require;
        }
//#JSCOVERAGE_IF 0
        // Create stylesheet link
        var link = global_document.createElement("link"),
            id = +new global.Date,
            onload = function (e) {
                if (isNotLoaded) {
                    isNotLoaded = 0;
                    // register or cleanup
                    link.removeAttribute('id');

                    // stop init on error
                    !e && stats_initEnd(moduleName);
                    callback(e ? register_module(moduleName, link) : head.removeChild(link) && local_undefined); // e === undefined if error
                }
            };

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        global.setTimeout(onload, 3000, 0);

        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        (function poll() {
            if (isNotLoaded) {
                try {
                    var sheets = global_document.styleSheets;
                    for (var j = 0, k = sheets.length; j < k; j++) {
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
                    global.setTimeout(poll, 90);
                }
            }
        }());

        return require;
//#JSCOVERAGE_ENDIF
    };

    main(require, output.exports, output);
})(worker_global_environment,(function (require) {
    // common for BOM Node and Worker Envs
    require('testcase_lmd_basic_features');

    // common for BOM and Worker Envs, Node uses testcase_lmd_async_require.node.js
    require('testcase_lmd_async_require');

    // BOM uses testcase_lmd_loader.js,
    // Worker - lmd_loader.worker.js
    // Node - testcase_lmd_loader._node.js
    require('testcase_lmd_loader');

    // Cache
    require('testcase_lmd_cache');

    // Coverage
    require('testcase_lmd_coverage');
}),{
"module_as_json": {
    "ok": true
},
"module_as_string": "<div class=\"b-template\">${pewpew}</div>",
"module_function_fd": function fd(require, exports, module) {
    require('ok')(true, "fd should be called once");

    return function () {
        return true;
    }
},
"module_function_fd2": function fd2(require, exports, module) {
    require('ok')(true, "fd2 should be called once");

    return function () {
        return true;
    }
},
"module_function_fd_sandboxed": function fd(require, exports, module) {
    if (typeof require === "function") {
//#JSCOVERAGE_IF 0
        throw 'require should not be a function';
//#JSCOVERAGE_ENDIF
    }

    exports.some_function = function () {
        return true;
    };
},
"module_function_fe": (function (require, exports, module) {
    require('ok')(true, "fe should be called once");

    return function () {
        return true;
    }
}),
"module_function_fe_sandboxed": (function (require, exports, module) {
    if (typeof require === "function") {
//#JSCOVERAGE_IF 0
        throw 'require should not be a function';
//#JSCOVERAGE_ENDIF
    }

    exports.some_function = function () {
        return true;
    };
}),
"module_function_lazy": "(function(a,b,c){return a(\"ok\")(!0,\"lazy function must be evaled and called once\"),function(){return!0}})",
"module_function_plain": (function (require, exports, module) { /* wrapped by builder */
require('ok')(true, "plain module must be called once");

module.exports = function () {
    return true;
};
}),
"module_function_plain_sandboxed": (function (require, exports, module) { /* wrapped by builder */
if (typeof require === "function") {
//#JSCOVERAGE_IF 0
    throw 'require should not be a function';
//#JSCOVERAGE_ENDIF
}

exports.some_function = function () {
    return true;
};
}),
"testcase_lmd_basic_features": (function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        rnd = '?' + Math.random(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    module('LMD basic features @ ' + ENV_NAME);

    test("require() globals", function () {
        expect(4);

        ok(require('eval'), "should require globals as modules");
        ok(typeof require('some_undefined') === "undefined", "if no module nor global - return undefined");

        // stats
        ok(!!require.stats('eval'), "should count stats: globals");
        ok(!!require.stats('some_undefined'), "should count stats: undefineds");
    });

    test("require() module-functions", function () {
        expect(10);

        var fd = require('module_function_fd'),
            fe = require('module_function_fe'),
            plain = require('module_function_plain');

        ok(fd() === true, "can require function definitions");
        ok(fe() === true, "can require function expressions");
        ok(plain() === true, "can require plain modules");

        ok(fd === require('module_function_fd'), "require must return the same instance of fd");
        ok(fe === require('module_function_fe'), "require must return the same instance of fe");
        ok(plain === require('module_function_plain'), "require must return the same instance of plain module");

        ok(!!require.stats('module_function_fd'), "should count stats: in-package modules");
    });

    test("require() sandboxed module-functions", function () {
        expect(3);

        var fd = require('module_function_fd_sandboxed'),
            fe = require('module_function_fe_sandboxed'),
            plain = require('module_function_plain_sandboxed');

        ok(fd.some_function() === true, "can require sandboxed function definitions");
        ok(fe.some_function() === true, "can require sandboxed function expressions");
        ok(plain.some_function() === true, "can require sandboxed plain modules");
    });

    test("require() lazy module-functions", function () {
        expect(4);

        var lazy = require('module_function_lazy');

        ok(lazy() === true, "can require lazy function definitions");
        ok(typeof require('lazy_fd') === "undefined", "lazy function definition's name should not leak into globals");
        ok(lazy === require('module_function_lazy'), "require must return the same instance of lazy fd");
    });

    test("require() module-objects/json", function () {
        expect(3);

        var json = require('module_as_json');

        ok(typeof json === "object", "json module should be an object");
        ok(json.ok === true, "should return content");
        ok(json === require('module_as_json'), "require of json module should return the same instance");
    });

    test("require() module-strings", function () {
        expect(2);

        var string = require('module_as_string');

        ok(typeof string === "string", "string module should be an string");
        ok(string === require('module_as_string'), "require of string module should return the same instance");
    });

    test("require() shortcuts", function () {
        expect(2);

        var dateObject = require('sk_to_global_object');
        ok(dateObject.toString().replace(/\s|\n/g,'') === "functionDate(){[nativecode]}", "require() should follow shortcuts: require global by shortcut");

        var json = require('sk_to_module_as_json');
        ok(typeof json === "object" &&
           json.ok === true &&
           json === require('module_as_json'), "require() should follow shortcuts: require in-package module by shortcut");
    });

    test("require() third party", function () {
        expect(2);

        var module = require('third_party_module_a'); // mock jquery
        ok(typeof module === "function", 'require() can load plain 3-party non-lmd modules, 1 exports');

        module = require('third_party_module_b'); // other plain module
        ok(typeof module === "object" &&
           typeof module.pewpew === "function" &&
           typeof module.ololo === "function" &&
           module.someVariable === "string", "require() can load plain 3-party non-lmd modules, N exports");
    });
}),
"testcase_lmd_async_require": (function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        rnd = '?' + Math.random(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    module('LMD async require @ ' + ENV_NAME);

    asyncTest("require.async() module-functions", function () {
        expect(6);

        require.async('./modules/async/module_function_async.js' + rnd, function (module_function_async) {

            ok(module_function_async.some_function() === true, "should require async module-functions");
            ok(require('./modules/async/module_function_async.js' + rnd) === module_function_async, "can sync require, loaded async module-functions");
            require.async('module_function_fd2', function (fd) {
                ok(fd() === true, "can require async in-package modules");

                // stats
                ok(!!require.stats('module_function_fd2'), "should count stats: async modules");
                start();
            });
        });
    });

    asyncTest("require.async() module-strings", function () {
        expect(3);

        require.async('./modules/async/module_as_string_async.html' + rnd, function (module_as_string_async) {
            ok(typeof module_as_string_async === "string", "should require async module-strings");
            ok(module_as_string_async === '<div class="b-template">${pewpew}</div>', "content ok?");
            ok(require('./modules/async/module_as_string_async.html' + rnd) === module_as_string_async, "can sync require, loaded async module-strings");
            start();
        });
    });

    asyncTest("require.async() module-objects", function () {
        expect(2);

        require.async('./modules/async/module_as_json_async.json' + rnd, function (module_as_json_async) {
            ok(typeof module_as_json_async === "object", "should require async module-object");
            ok(require('./modules/async/module_as_json_async.json' + rnd) === module_as_json_async, "can sync require, loaded async module-object");
            start();
        });
    });

    asyncTest("require.async() chain calls", function () {
        expect(3);

        var requireReturned = require
            .async('./modules/async/module_as_json_async.json' + rnd)
            .async('./modules/async/module_as_json_async.json' + rnd, function () {
                ok(true, 'Callback is optional');
                ok(true, 'WeCan use chain calls');

                start();
            });

        ok(requireReturned === require, "must return require");
    });

    asyncTest("require.async():json race calls", function () {
        expect(1);
        var result;

        var check_result = function (module_as_json_async) {
            if (typeof result === "undefined") {
                result = module_as_json_async;
            } else {
                ok(result === module_as_json_async, "Must perform one call. Results must be the same");
                start();
            }
        };

        require.async('./modules/async_race/module_as_json_async.json' + rnd, check_result);
        require.async('./modules/async_race/module_as_json_async.json' + rnd, check_result);
    });

    asyncTest("require.async():js race calls", function () {
        expect(2); // 1 +1 in module ok()
        var result;

        var check_result = function (module_as_json_async) {
            if (typeof result === "undefined") {
                result = module_as_json_async;
            } else {
                ok(result === module_as_json_async, "Must perform one call. Results must be the same");
                start();
            }
        };

        require.async('./modules/async_race/module_function_async.js' + rnd, check_result);
        require.async('./modules/async_race/module_function_async.js' + rnd, check_result);
    });

    asyncTest("require.async():string race calls", function () {
        expect(1);
        var result;

        var check_result = function (module_as_json_async) {
            if (typeof result === "undefined") {
                result = module_as_json_async;
            } else {
                ok(result === module_as_json_async, "Must perform one call. Results must be the same");
                start();
            }
        };

        require.async('./modules/async_race/module_as_string_async.html' + rnd, check_result);
        require.async('./modules/async_race/module_as_string_async.html' + rnd, check_result);
    });

    asyncTest("require.async() errors", function () {
        expect(2);

        require.async('./modules/async/undefined_module.js' + rnd, function (undefined_module) {
            ok(typeof undefined_module === "undefined", "should return undefined on error");
            require.async('./modules/async/undefined_module.js' + rnd, function (undefined_module_2) {
                ok(typeof undefined_module_2 === "undefined", "should not cache errorous modules");
                start();
            });
        });
    });

    asyncTest("require.async() parallel loading", function () {
        expect(2);

        require.async(['./modules/parallel/1.js' + rnd,
                       './modules/parallel/2.js' + rnd,
                       './modules/parallel/3.js' + rnd],
        function (module1, module2, module3) {
            ok(true, "Modules executes as they are loaded - in load order");
            ok(module1.file === "1.js" && module2.file === "2.js" && module3.file === "3.js",
              "Modules should be callbacked in list order");
            start();
        });
    });

    asyncTest("require.async() shortcuts", function () {
        expect(10);

        ok(typeof require('sk_async_html') === "undefined", 'require should return undefined if shortcuts not initialized by loaders');
        ok(typeof require('sk_async_html') === "undefined", 'require should return undefined ... always');

        require.async('sk_async_json', function (json) {
            ok(json.ok === true, 'should require shortcuts: json');
            ok(require('sk_async_json') === json, 'if shortcut is defined require should return the same code');
            ok(require('/modules/shortcuts/async.json') === json, 'Module should be inited using shortcut content');
            require.async('sk_async_html', function (html) {
                ok(html === 'ok', 'should require shortcuts: html');
                require.async('sk_async_js', function (js) {
                    ok(js() === 'ok', 'should require shortcuts: js');

                    // stats
                    ok(require.stats('sk_async_js') === require.stats('/modules/shortcuts/async.js'), "shortcut should point to the same object as module");
                    ok(!!require.stats('/modules/shortcuts/async.js'), "should count stats of real file");
                    ok(require.stats('/modules/shortcuts/async.js').shortcuts[0] === 'sk_async_js', "should pass shourtcuts names");
                    start();
                });
            });
        });
    });

    asyncTest("require.async() plain", function () {
        expect(3);

        require.async('./modules/async/module_plain_function_async.js' + rnd, function (module_plain_function_async) {
            ok(module_plain_function_async.some_function() === true, "should require async module-functions");
            ok(require('./modules/async/module_plain_function_async.js' + rnd) === module_plain_function_async, "can async require plain modules, loaded async module-functions");

            start();
        });
    });
}),
"testcase_lmd_loader": (function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        rnd = '?' + Math.random(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    module('LMD loader @ ' + ENV_NAME);

    asyncTest("require.js()", function () {
        expect(6);

        require.js('./modules/loader/non_lmd_module.js' + rnd, function (object) {
            ok(typeof object === "object", "should return empty object on success");

            ok(require('some_function')() === true, "we can grab content of the loaded script");

            ok(require('./modules/loader/non_lmd_module.js' + rnd) === object, "should cache object on success");

            // some external
            require.js('http://8.8.8.8:8/jquery.js' + rnd, function (script_tag) {
                ok(typeof script_tag === "undefined", "should return undefined on error in 3 seconds");
                ok(typeof require('http://8.8.8.8:8/jquery.js' + rnd) === "undefined", "should not cache errorous modules");
                require.js('module_as_string', function (module_as_string) {
                    require.async('module_as_string', function (module_as_string_expected) {
                        ok(module_as_string === module_as_string_expected, 'require.js() acts like require.async() if in-package/declared module passed');
                        start();
                    });
                });
            });
        });
    });

    asyncTest("require.js() race calls", function () {
        expect(1);
        var result;

        var check_result = function (object) {
            if (typeof result === "undefined") {
                result = object;
            } else {
                ok(result === object, "Must perform one call. Results must be the same");
                start();
            }
        };

        require.js('./modules/loader_race/non_lmd_module.js' + rnd, check_result);
        require.js('./modules/loader_race/non_lmd_module.js' + rnd, check_result);
    });

    asyncTest("require.css()", function () {
        expect(3);

        require.css('./modules/loader/some_css.css' + rnd, function (link_tag) {
            ok(typeof link_tag === "undefined", "should act like require and return undefined if no module");
            ok(typeof require('./modules/loader/some_css_404.css' + rnd) === "undefined", "should not cache errorous modules");
            require.css('module_as_string', function (module_as_string) {
                require.async('module_as_string', function (module_as_string_expected) {
                    ok(module_as_string === module_as_string_expected, 'require.css() acts like require.async() if in-package/declared module passed');
                    start();
                });
            });
        });
    });
}),
"testcase_lmd_coverage": (function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        deepEqual = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        rnd = '?' + Math.random(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    module('LMD Stats coverage @ ' + ENV_NAME);

    test("Coverage", function () {
        expect(6);

        require("coverage_fully_covered");
        require("coverage_not_conditions");
        require("coverage_not_functions");
        require("coverage_not_statements");
        // do not call "coverage_not_covered"

        var stats = require.stats(),
            report;

        report = stats.modules["coverage_fully_covered"].coverage.report;

        for (var i in report) {
            if (report.hasOwnProperty(i)) {
                ok(false, "should be fully covered!");
            }
        }

        report = stats.modules["coverage_not_conditions"].coverage.report;
        ok(report[2].conditions, "coverage_not_conditions: not 1 line");
        ok(report[3].lines === false, "coverage_not_conditions: not 2 line");

        report = stats.modules["coverage_not_functions"].coverage.report;
        ok(report[3].functions[0] === "test", "coverage_not_functions: not 2 line");
        ok(report[4].lines === false, "coverage_not_functions: not 3 line");

        report = stats.modules["coverage_not_statements"].coverage.report;
        ok(report[11].lines === false, "coverage_not_statements: not 11 line");

        report = stats.modules["coverage_not_covered"].coverage.report;
        ok(report[1] && report[2] && report[3] && report[6] && report[7], "coverage_not_covered: not covered");
    });
}),
"testcase_lmd_cache": (function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),
        ls = require('localStorage'),

        rnd = '?' + Math.random(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM',

        PACKAGE_VERSION = 'latest';

    if (!ls) {
        return;
    }

    module('LMD cache @ ' + ENV_NAME);

    asyncTest("localStorage cache + cache_async test", function () {
        expect(10);

        ok(typeof ls['lmd'] === "string", 'LMD Should create cache');

        var lmd = JSON.parse(ls['lmd']);

        ok(lmd.version === PACKAGE_VERSION, 'Should save version');
        ok(typeof lmd.modules === 'object', 'Should save modules');
        ok(typeof lmd.main === 'string', 'Should save main function as string');
        ok(typeof lmd.lmd === 'string', 'Should save lmd source as string');
        ok(typeof lmd.sandboxed === 'object', 'Should save sandboxed modules');

        require.async('./modules/async/module_function_async.js', function (module_function_async) {
            var key = 'lmd:' + PACKAGE_VERSION + ':' + './modules/async/module_function_async.js';

            ok(module_function_async.some_function() === true, "should require async module-functions");

            ok(typeof ls[key] === "string", 'LMD Should cache async requests');

            ls.removeItem(key);

            require.async('./modules/async/module_function_async.js');

            ok(!ls[key], 'LMD Should not recreate cache it was manually deleted key=' + key);

            start();
        });
    });
}),
"sk_async_html": "@/modules/shortcuts/async.html",
"sk_async_js": "@/modules/shortcuts/async.js",
"sk_async_json": "@/modules/shortcuts/async.json",
"sk_css_css": "@/modules/shortcuts/css.css",
"sk_js_js": "@/modules/shortcuts/js.js",
"sk_to_global_object": "@Date",
"sk_to_module_as_json": "@module_as_json",
"coverage_fully_covered": (function(require, exports, module) {
    require.coverage_function("coverage_fully_covered", "(?):0:1");
    require.coverage_line("coverage_fully_covered", "1");
    var a = "123";
    require.coverage_line("coverage_fully_covered", "2");
    function test() {
        require.coverage_function("coverage_fully_covered", "test:2:79");
        require.coverage_line("coverage_fully_covered", "3");
        return a;
    }
    require.coverage_line("coverage_fully_covered", "6");
    if (require.coverage_condition("coverage_fully_covered", "if:6:118", typeof true === "boolean")) {
        require.coverage_line("coverage_fully_covered", "7");
        var b = test();
    }
}),
"coverage_not_conditions": function df(require) {
    require.coverage_line("coverage_not_conditions", "2");
    if (require.coverage_condition("coverage_not_conditions", "if:2:31", typeof true === "string")) {
        require.coverage_line("coverage_not_conditions", "3");
        var b = 123;
    }
},
"coverage_not_functions": (function(require) {
    require.coverage_function("coverage_not_functions", "(?):1:1");
    require.coverage_line("coverage_not_functions", "2");
    var a = "123";
    require.coverage_line("coverage_not_functions", "3");
    function test() {
        require.coverage_function("coverage_not_functions", "test:3:45");
        require.coverage_line("coverage_not_functions", "4");
        return a;
    }
    require.coverage_line("coverage_not_functions", "7");
    if (require.coverage_condition("coverage_not_functions", "if:7:110", typeof true === "boolean")) {
        require.coverage_line("coverage_not_functions", "8");
        var b = a;
    }
}),
"coverage_not_statements": (function(require, exports, module) {
    require.coverage_function("coverage_not_statements", "(?):0:1");
    require.coverage_line("coverage_not_statements", "1");
    var a = "123", b;
    require.coverage_line("coverage_not_statements", "4");
    function test(a) {
        require.coverage_function("coverage_not_statements", "test:4:87");
        require.coverage_line("coverage_not_statements", "5");
        return a;
    }
    require.coverage_line("coverage_not_statements", "8");
    if (require.coverage_condition("coverage_not_statements", "if:8:127", typeof true === "boolean")) {
        require.coverage_line("coverage_not_statements", "9");
        b = test(1);
    } else {
        require.coverage_line("coverage_not_statements", "11");
        b = test(2);
    }
}),
"coverage_not_covered": (function(require, exports, module) {
    require.coverage_function("coverage_not_covered", "(?):0:1");
    require.coverage_line("coverage_not_covered", "1");
    var a = "123";
    require.coverage_line("coverage_not_covered", "2");
    function test() {
        require.coverage_function("coverage_not_covered", "test:2:88");
        require.coverage_line("coverage_not_covered", "3");
        return a;
    }
    require.coverage_line("coverage_not_covered", "6");
    if (require.coverage_condition("coverage_not_covered", "if:6:145", typeof true === "boolean")) {
        require.coverage_line("coverage_not_covered", "7");
        var b = test();
    }
}),
"third_party_module_a": (function (require) { /* wrapped by builder */
/*!
 * uQuery JavaScript Library v1.7.2
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Wed Mar 21 12:46:34 2012 -0700
 */
(function( window, undefined ) {

// crop

var uQuery = (function() {

    var uQuery = function () {
        // crop
    };

    // crop

    return uQuery;
})();

// crop

// Expose jQuery to the global object
window.uQuery = uQuery;

// crop

})( window );

/* added by builder */
return window.uQuery;
}),
"third_party_module_b": (function (require) { /* wrapped by builder */
function pewpew () {

}

function ololo() {

}

var someVariable = "string";

/* added by builder */
return {
    "pewpew": pewpew,
    "ololo": ololo,
    "someVariable": someVariable
};
})
},{"module_function_fd_sandboxed":true,"module_function_fe_sandboxed":true,"module_function_plain_sandboxed":true},{"coverage_fully_covered":{"lines":["1","2","3","6","7"],"conditions":["if:6:118"],"functions":["(?):0:1","test:2:79"]},"coverage_not_conditions":{"lines":["2","3"],"conditions":["if:2:31"],"functions":[]},"coverage_not_functions":{"lines":["2","3","4","7","8"],"conditions":["if:7:110"],"functions":["(?):1:1","test:3:45"]},"coverage_not_statements":{"lines":["1","4","5","8","9","11"],"conditions":["if:8:127"],"functions":["(?):0:1","test:4:87"]},"coverage_not_covered":{"lines":["1","2","3","6","7"],"conditions":["if:6:145"],"functions":["(?):0:1","test:2:88"]}})