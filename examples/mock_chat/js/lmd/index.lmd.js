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
  * XDomain post
  *
  * @param {String} host
  * @param {String} method
  * @param {Object} data
  * @param {String} [reportName]
  *
  * @return {HTMLIFrameElement}
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

    return function (host, method, data, reportName) {
        var JSON = require('JSON');

        // Add the iframe with a unique name
        var iframe = global_document.createElement("iframe"),
            uniqueString = global.Math.random();

        global_document.body.appendChild(iframe);
        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.left = "-1000px";
        iframe.style.top = "-1000px";
        iframe.contentWindow.name = uniqueString;

        // construct a form with hidden inputs, targeting the iframe
        var form = global_document.createElement("form");
        form.target = uniqueString;
        form.action = host + "/" + method + '/' + (reportName || runId).replace(/\/|\\|\./g, '_');
        form.method = "POST";

        // repeat for each parameter
        var input = global_document.createElement("input");
        input.type = "hidden";
        input.name = "json";
        input.value = JSON.stringify(data);
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();

        return iframe;
    }
}();
/*if ($P.RACE) include('race.js');*/
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
    index = shortcuts.indexOf(shortcut);

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


require.stats.sendTo = function (host) {
    return sendTo(host, "stats", require.stats());
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
 * @name coverage_module
 */

var coverage_apply = (function () {
var mock_exports = {},
    mock_modules = {};

var mock_require = function (name) {
    return mock_modules[name];
};

mock_modules["./squeeze-more"] = {};

mock_modules["./parse-js"] = (function () {
var exports = {};
/***********************************************************************

  A JavaScript tokenizer / parser / beautifier / compressor.

  This version is suitable for Node.js.  With minimal changes (the
  exports stuff) it should work on any JS platform.

  This file contains the tokenizer/parser.  It is a port to JavaScript
  of parse-js [1], a JavaScript parser library written in Common Lisp
  by Marijn Haverbeke.  Thank you Marijn!

  [1] http://marijn.haverbeke.nl/parse-js/

  Exported functions:

    - tokenizer(code) -- returns a function.  Call the returned
      function to fetch the next token.

    - parse(code) -- returns an AST of the given JavaScript code.

  -------------------------------- (C) ---------------------------------

                           Author: Mihai Bazon
                         <mihai.bazon@gmail.com>
                       http://mihai.bazon.net/blog

  Distributed under the BSD license:

    Copyright 2010 (c) Mihai Bazon <mihai.bazon@gmail.com>
    Based on parse-js (http://marijn.haverbeke.nl/parse-js/).

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

        * Redistributions of source code must retain the above
          copyright notice, this list of conditions and the following
          disclaimer.

        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials
          provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
    EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
    LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
    OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
    TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
    THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
    SUCH DAMAGE.

 ***********************************************************************/

/* -----[ Tokenizer (constants) ]----- */

var KEYWORDS = array_to_hash([
        "break",
        "case",
        "catch",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "finally",
        "for",
        "function",
        "if",
        "in",
        "instanceof",
        "new",
        "return",
        "switch",
        "throw",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with"
]);

var RESERVED_WORDS = array_to_hash([
        "abstract",
        "boolean",
        "byte",
        "char",
        "class",
        "double",
        "enum",
        "export",
        "extends",
        "final",
        "float",
        "goto",
        "implements",
        "import",
        "int",
        "interface",
        "long",
        "native",
        "package",
        "private",
        "protected",
        "public",
        "short",
        "static",
        "super",
        "synchronized",
        "throws",
        "transient",
        "volatile"
]);

var KEYWORDS_BEFORE_EXPRESSION = array_to_hash([
        "return",
        "new",
        "delete",
        "throw",
        "else",
        "case"
]);

var KEYWORDS_ATOM = array_to_hash([
        "false",
        "null",
        "true",
        "undefined"
]);

var OPERATOR_CHARS = array_to_hash(characters("+-*&%=<>!?|~^"));

var RE_HEX_NUMBER = /^0x[0-9a-f]+$/i;
var RE_OCT_NUMBER = /^0[0-7]+$/;
var RE_DEC_NUMBER = /^\d*\.?\d*(?:e[+-]?\d*(?:\d\.?|\.?\d)\d*)?$/i;

var OPERATORS = array_to_hash([
        "in",
        "instanceof",
        "typeof",
        "new",
        "void",
        "delete",
        "++",
        "--",
        "+",
        "-",
        "!",
        "~",
        "&",
        "|",
        "^",
        "*",
        "/",
        "%",
        ">>",
        "<<",
        ">>>",
        "<",
        ">",
        "<=",
        ">=",
        "==",
        "===",
        "!=",
        "!==",
        "?",
        "=",
        "+=",
        "-=",
        "/=",
        "*=",
        "%=",
        ">>=",
        "<<=",
        ">>>=",
        "|=",
        "^=",
        "&=",
        "&&",
        "||"
]);

var WHITESPACE_CHARS = array_to_hash(characters(" \u00a0\n\r\t\f\u000b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000"));

var PUNC_BEFORE_EXPRESSION = array_to_hash(characters("[{}(,.;:"));

var PUNC_CHARS = array_to_hash(characters("[]{}(),;:"));

var REGEXP_MODIFIERS = array_to_hash(characters("gmsiy"));

/* -----[ Tokenizer ]----- */

// regexps adapted from http://xregexp.com/plugins/#unicode
var UNICODE = {
        letter: new RegExp("[\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0523\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971\\u0972\\u097B-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3D\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC\\u0EDD\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8B\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10D0-\\u10FA\\u10FC\\u1100-\\u1159\\u115F-\\u11A2\\u11A8-\\u11F9\\u1200-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u1676\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19A9\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u2094\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2183\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2C6F\\u2C71-\\u2C7D\\u2C80-\\u2CE4\\u2D00-\\u2D25\\u2D30-\\u2D65\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005\\u3006\\u3031-\\u3035\\u303B\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31B7\\u31F0-\\u31FF\\u3400\\u4DB5\\u4E00\\u9FC3\\uA000-\\uA48C\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA65F\\uA662-\\uA66E\\uA67F-\\uA697\\uA717-\\uA71F\\uA722-\\uA788\\uA78B\\uA78C\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA90A-\\uA925\\uA930-\\uA946\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAC00\\uD7A3\\uF900-\\uFA2D\\uFA30-\\uFA6A\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]"),
        non_spacing_mark: new RegExp("[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065E\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0900-\\u0902\\u093C\\u0941-\\u0948\\u094D\\u0951-\\u0955\\u0962\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD\\u09E2\\u09E3\\u0A01\\u0A02\\u0A3C\\u0A41\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70\\u0A71\\u0A75\\u0A81\\u0A82\\u0ABC\\u0AC1-\\u0AC5\\u0AC7\\u0AC8\\u0ACD\\u0AE2\\u0AE3\\u0B01\\u0B3C\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62\\u0B63\\u0B82\\u0BC0\\u0BCD\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C62\\u0C63\\u0CBC\\u0CBF\\u0CC6\\u0CCC\\u0CCD\\u0CE2\\u0CE3\\u0D41-\\u0D44\\u0D4D\\u0D62\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB\\u0EBC\\u0EC8-\\u0ECD\\u0F18\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86\\u0F87\\u0F90-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039\\u103A\\u103D\\u103E\\u1058\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085\\u1086\\u108D\\u109D\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752\\u1753\\u1772\\u1773\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922\\u1927\\u1928\\u1932\\u1939-\\u193B\\u1A17\\u1A18\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73\\u1B80\\u1B81\\u1BA2-\\u1BA5\\u1BA8\\u1BA9\\u1C2C-\\u1C33\\u1C36\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1DC0-\\u1DE6\\u1DFD-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2DE0-\\u2DFF\\u302A-\\u302F\\u3099\\u309A\\uA66F\\uA67C\\uA67D\\uA6F0\\uA6F1\\uA802\\uA806\\uA80B\\uA825\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uAA29-\\uAA2E\\uAA31\\uAA32\\uAA35\\uAA36\\uAA43\\uAA4C\\uAAB0\\uAAB2-\\uAAB4\\uAAB7\\uAAB8\\uAABE\\uAABF\\uAAC1\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26]"),
        space_combining_mark: new RegExp("[\\u0903\\u093E-\\u0940\\u0949-\\u094C\\u094E\\u0982\\u0983\\u09BE-\\u09C0\\u09C7\\u09C8\\u09CB\\u09CC\\u09D7\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB\\u0ACC\\u0B02\\u0B03\\u0B3E\\u0B40\\u0B47\\u0B48\\u0B4B\\u0B4C\\u0B57\\u0BBE\\u0BBF\\u0BC1\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82\\u0C83\\u0CBE\\u0CC0-\\u0CC4\\u0CC7\\u0CC8\\u0CCA\\u0CCB\\u0CD5\\u0CD6\\u0D02\\u0D03\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82\\u0D83\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2\\u0DF3\\u0F3E\\u0F3F\\u0F7F\\u102B\\u102C\\u1031\\u1038\\u103B\\u103C\\u1056\\u1057\\u1062-\\u1064\\u1067-\\u106D\\u1083\\u1084\\u1087-\\u108C\\u108F\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7\\u17C8\\u1923-\\u1926\\u1929-\\u192B\\u1930\\u1931\\u1933-\\u1938\\u19B0-\\u19C0\\u19C8\\u19C9\\u1A19-\\u1A1B\\u1A55\\u1A57\\u1A61\\u1A63\\u1A64\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43\\u1B44\\u1B82\\u1BA1\\u1BA6\\u1BA7\\u1BAA\\u1C24-\\u1C2B\\u1C34\\u1C35\\u1CE1\\u1CF2\\uA823\\uA824\\uA827\\uA880\\uA881\\uA8B4-\\uA8C3\\uA952\\uA953\\uA983\\uA9B4\\uA9B5\\uA9BA\\uA9BB\\uA9BD-\\uA9C0\\uAA2F\\uAA30\\uAA33\\uAA34\\uAA4D\\uAA7B\\uABE3\\uABE4\\uABE6\\uABE7\\uABE9\\uABEA\\uABEC]"),
        connector_punctuation: new RegExp("[\\u005F\\u203F\\u2040\\u2054\\uFE33\\uFE34\\uFE4D-\\uFE4F\\uFF3F]")
};

function is_letter(ch) {
        return UNICODE.letter.test(ch);
};

function is_digit(ch) {
        ch = ch.charCodeAt(0);
        return ch >= 48 && ch <= 57; //XXX: find out if "UnicodeDigit" means something else than 0..9
};

function is_alphanumeric_char(ch) {
        return is_digit(ch) || is_letter(ch);
};

function is_unicode_combining_mark(ch) {
        return UNICODE.non_spacing_mark.test(ch) || UNICODE.space_combining_mark.test(ch);
};

function is_unicode_connector_punctuation(ch) {
        return UNICODE.connector_punctuation.test(ch);
};

function is_identifier_start(ch) {
        return ch == "$" || ch == "_" || is_letter(ch);
};

function is_identifier_char(ch) {
        return is_identifier_start(ch)
                || is_unicode_combining_mark(ch)
                || is_digit(ch)
                || is_unicode_connector_punctuation(ch)
                || ch == "\u200c" // zero-width non-joiner <ZWNJ>
                || ch == "\u200d" // zero-width joiner <ZWJ> (in my ECMA-262 PDF, this is also 200c)
        ;
};

function parse_js_number(num) {
        if (RE_HEX_NUMBER.test(num)) {
                return parseInt(num.substr(2), 16);
        } else if (RE_OCT_NUMBER.test(num)) {
                return parseInt(num.substr(1), 8);
        } else if (RE_DEC_NUMBER.test(num)) {
                return parseFloat(num);
        }
};

function JS_Parse_Error(message, line, col, pos) {
        this.message = message;
        this.line = line + 1;
        this.col = col + 1;
        this.pos = pos + 1;
        this.stack = new Error().stack;
};

JS_Parse_Error.prototype.toString = function() {
        return this.message + " (line: " + this.line + ", col: " + this.col + ", pos: " + this.pos + ")" + "\n\n" + this.stack;
};

function js_error(message, line, col, pos) {
        throw new JS_Parse_Error(message, line, col, pos);
};

function is_token(token, type, val) {
        return token.type == type && (val == null || token.value == val);
};

var EX_EOF = {};

function tokenizer($TEXT) {

        var S = {
                text            : $TEXT.replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, ''),
                pos             : 0,
                tokpos          : 0,
                line            : 0,
                tokline         : 0,
                col             : 0,
                tokcol          : 0,
                newline_before  : false,
                regex_allowed   : false,
                comments_before : []
        };

        function peek() { return S.text.charAt(S.pos); };

        function next(signal_eof, in_string) {
                var ch = S.text.charAt(S.pos++);
                if (signal_eof && !ch)
                        throw EX_EOF;
                if (ch == "\n") {
                        S.newline_before = S.newline_before || !in_string;
                        ++S.line;
                        S.col = 0;
                } else {
                        ++S.col;
                }
                return ch;
        };

        function eof() {
                return !S.peek();
        };

        function find(what, signal_eof) {
                var pos = S.text.indexOf(what, S.pos);
                if (signal_eof && pos == -1) throw EX_EOF;
                return pos;
        };

        function start_token() {
                S.tokline = S.line;
                S.tokcol = S.col;
                S.tokpos = S.pos;
        };

        function token(type, value, is_comment) {
                S.regex_allowed = ((type == "operator" && !HOP(UNARY_POSTFIX, value)) ||
                                   (type == "keyword" && HOP(KEYWORDS_BEFORE_EXPRESSION, value)) ||
                                   (type == "punc" && HOP(PUNC_BEFORE_EXPRESSION, value)));
                var ret = {
                        type   : type,
                        value  : value,
                        line   : S.tokline,
                        col    : S.tokcol,
                        pos    : S.tokpos,
                        endpos : S.pos,
                        nlb    : S.newline_before
                };
                if (!is_comment) {
                        ret.comments_before = S.comments_before;
                        S.comments_before = [];
                }
                S.newline_before = false;
                return ret;
        };

        function skip_whitespace() {
                while (HOP(WHITESPACE_CHARS, peek()))
                        next();
        };

        function read_while(pred) {
                var ret = "", ch = peek(), i = 0;
                while (ch && pred(ch, i++)) {
                        ret += next();
                        ch = peek();
                }
                return ret;
        };

        function parse_error(err) {
                js_error(err, S.tokline, S.tokcol, S.tokpos);
        };

        function read_num(prefix) {
                var has_e = false, after_e = false, has_x = false, has_dot = prefix == ".";
                var num = read_while(function(ch, i){
                        if (ch == "x" || ch == "X") {
                                if (has_x) return false;
                                return has_x = true;
                        }
                        if (!has_x && (ch == "E" || ch == "e")) {
                                if (has_e) return false;
                                return has_e = after_e = true;
                        }
                        if (ch == "-") {
                                if (after_e || (i == 0 && !prefix)) return true;
                                return false;
                        }
                        if (ch == "+") return after_e;
                        after_e = false;
                        if (ch == ".") {
                                if (!has_dot && !has_x)
                                        return has_dot = true;
                                return false;
                        }
                        return is_alphanumeric_char(ch);
                });
                if (prefix)
                        num = prefix + num;
                var valid = parse_js_number(num);
                if (!isNaN(valid)) {
                        return token("num", valid);
                } else {
                        parse_error("Invalid syntax: " + num);
                }
        };

        function read_escaped_char(in_string) {
                var ch = next(true, in_string);
                switch (ch) {
                    case "n" : return "\n";
                    case "r" : return "\r";
                    case "t" : return "\t";
                    case "b" : return "\b";
                    case "v" : return "\u000b";
                    case "f" : return "\f";
                    case "0" : return "\0";
                    case "x" : return String.fromCharCode(hex_bytes(2));
                    case "u" : return String.fromCharCode(hex_bytes(4));
                    case "\n": return "";
                    default  : return ch;
                }
        };

        function hex_bytes(n) {
                var num = 0;
                for (; n > 0; --n) {
                        var digit = parseInt(next(true), 16);
                        if (isNaN(digit))
                                parse_error("Invalid hex-character pattern in string");
                        num = (num << 4) | digit;
                }
                return num;
        };

        function read_string() {
                return with_eof_error("Unterminated string constant", function(){
                        var quote = next(), ret = "";
                        for (;;) {
                                var ch = next(true);
                                if (ch == "\\") {
                                        // read OctalEscapeSequence (XXX: deprecated if "strict mode")
                                        // https://github.com/mishoo/UglifyJS/issues/178
                                        var octal_len = 0, first = null;
                                        ch = read_while(function(ch){
                                                if (ch >= "0" && ch <= "7") {
                                                        if (!first) {
                                                                first = ch;
                                                                return ++octal_len;
                                                        }
                                                        else if (first <= "3" && octal_len <= 2) return ++octal_len;
                                                        else if (first >= "4" && octal_len <= 1) return ++octal_len;
                                                }
                                                return false;
                                        });
                                        if (octal_len > 0) ch = String.fromCharCode(parseInt(ch, 8));
                                        else ch = read_escaped_char(true);
                                }
                                else if (ch == quote) break;
                                ret += ch;
                        }
                        return token("string", ret);
                });
        };

        function read_line_comment() {
                next();
                var i = find("\n"), ret;
                if (i == -1) {
                        ret = S.text.substr(S.pos);
                        S.pos = S.text.length;
                } else {
                        ret = S.text.substring(S.pos, i);
                        S.pos = i;
                }
                return token("comment1", ret, true);
        };

        function read_multiline_comment() {
                next();
                return with_eof_error("Unterminated multiline comment", function(){
                        var i = find("*/", true),
                            text = S.text.substring(S.pos, i);
                        S.pos = i + 2;
                        S.line += text.split("\n").length - 1;
                        S.newline_before = text.indexOf("\n") >= 0;

                        // https://github.com/mishoo/UglifyJS/issues/#issue/100
                        if (/^@cc_on/i.test(text)) {
                                warn("WARNING: at line " + S.line);
                                warn("*** Found \"conditional comment\": " + text);
                                warn("*** UglifyJS DISCARDS ALL COMMENTS.  This means your code might no longer work properly in Internet Explorer.");
                        }

                        return token("comment2", text, true);
                });
        };

        function read_name() {
                var backslash = false, name = "", ch;
                while ((ch = peek()) != null) {
                        if (!backslash) {
                                if (ch == "\\") backslash = true, next();
                                else if (is_identifier_char(ch)) name += next();
                                else break;
                        }
                        else {
                                if (ch != "u") parse_error("Expecting UnicodeEscapeSequence -- uXXXX");
                                ch = read_escaped_char();
                                if (!is_identifier_char(ch)) parse_error("Unicode char: " + ch.charCodeAt(0) + " is not valid in identifier");
                                name += ch;
                                backslash = false;
                        }
                }
                return name;
        };

        function read_regexp(regexp) {
                return with_eof_error("Unterminated regular expression", function(){
                        var prev_backslash = false, ch, in_class = false;
                        while ((ch = next(true))) if (prev_backslash) {
                                regexp += "\\" + ch;
                                prev_backslash = false;
                        } else if (ch == "[") {
                                in_class = true;
                                regexp += ch;
                        } else if (ch == "]" && in_class) {
                                in_class = false;
                                regexp += ch;
                        } else if (ch == "/" && !in_class) {
                                break;
                        } else if (ch == "\\") {
                                prev_backslash = true;
                        } else {
                                regexp += ch;
                        }
                        var mods = read_name();
                        return token("regexp", [ regexp, mods ]);
                });
        };

        function read_operator(prefix) {
                function grow(op) {
                        if (!peek()) return op;
                        var bigger = op + peek();
                        if (HOP(OPERATORS, bigger)) {
                                next();
                                return grow(bigger);
                        } else {
                                return op;
                        }
                };
                return token("operator", grow(prefix || next()));
        };

        function handle_slash() {
                next();
                var regex_allowed = S.regex_allowed;
                switch (peek()) {
                    case "/":
                        S.comments_before.push(read_line_comment());
                        S.regex_allowed = regex_allowed;
                        return next_token();
                    case "*":
                        S.comments_before.push(read_multiline_comment());
                        S.regex_allowed = regex_allowed;
                        return next_token();
                }
                return S.regex_allowed ? read_regexp("") : read_operator("/");
        };

        function handle_dot() {
                next();
                return is_digit(peek())
                        ? read_num(".")
                        : token("punc", ".");
        };

        function read_word() {
                var word = read_name();
                return !HOP(KEYWORDS, word)
                        ? token("name", word)
                        : HOP(OPERATORS, word)
                        ? token("operator", word)
                        : HOP(KEYWORDS_ATOM, word)
                        ? token("atom", word)
                        : token("keyword", word);
        };

        function with_eof_error(eof_error, cont) {
                try {
                        return cont();
                } catch(ex) {
                        if (ex === EX_EOF) parse_error(eof_error);
                        else throw ex;
                }
        };

        function next_token(force_regexp) {
                if (force_regexp != null)
                        return read_regexp(force_regexp);
                skip_whitespace();
                start_token();
                var ch = peek();
                if (!ch) return token("eof");
                if (is_digit(ch)) return read_num();
                if (ch == '"' || ch == "'") return read_string();
                if (HOP(PUNC_CHARS, ch)) return token("punc", next());
                if (ch == ".") return handle_dot();
                if (ch == "/") return handle_slash();
                if (HOP(OPERATOR_CHARS, ch)) return read_operator();
                if (ch == "\\" || is_identifier_start(ch)) return read_word();
                parse_error("Unexpected character '" + ch + "'");
        };

        next_token.context = function(nc) {
                if (nc) S = nc;
                return S;
        };

        return next_token;

};

/* -----[ Parser (constants) ]----- */

var UNARY_PREFIX = array_to_hash([
        "typeof",
        "void",
        "delete",
        "--",
        "++",
        "!",
        "~",
        "-",
        "+"
]);

var UNARY_POSTFIX = array_to_hash([ "--", "++" ]);

var ASSIGNMENT = (function(a, ret, i){
        while (i < a.length) {
                ret[a[i]] = a[i].substr(0, a[i].length - 1);
                i++;
        }
        return ret;
})(
        ["+=", "-=", "/=", "*=", "%=", ">>=", "<<=", ">>>=", "|=", "^=", "&="],
        { "=": true },
        0
);

var PRECEDENCE = (function(a, ret){
        for (var i = 0, n = 1; i < a.length; ++i, ++n) {
                var b = a[i];
                for (var j = 0; j < b.length; ++j) {
                        ret[b[j]] = n;
                }
        }
        return ret;
})(
        [
                ["||"],
                ["&&"],
                ["|"],
                ["^"],
                ["&"],
                ["==", "===", "!=", "!=="],
                ["<", ">", "<=", ">=", "in", "instanceof"],
                [">>", "<<", ">>>"],
                ["+", "-"],
                ["*", "/", "%"]
        ],
        {}
);

var STATEMENTS_WITH_LABELS = array_to_hash([ "for", "do", "while", "switch" ]);

var ATOMIC_START_TOKEN = array_to_hash([ "atom", "num", "string", "regexp", "name" ]);

/* -----[ Parser ]----- */

function NodeWithToken(str, start, end) {
        this.name = str;
        this.start = start;
        this.end = end;
};

NodeWithToken.prototype.toString = function() { return this.name; };

function parse($TEXT, exigent_mode, embed_tokens) {

        var S = {
                input       : typeof $TEXT == "string" ? tokenizer($TEXT, true) : $TEXT,
                token       : null,
                prev        : null,
                peeked      : null,
                in_function : 0,
                in_loop     : 0,
                labels      : []
        };

        S.token = next();

        function is(type, value) {
                return is_token(S.token, type, value);
        };

        function peek() { return S.peeked || (S.peeked = S.input()); };

        function next() {
                S.prev = S.token;
                if (S.peeked) {
                        S.token = S.peeked;
                        S.peeked = null;
                } else {
                        S.token = S.input();
                }
                return S.token;
        };

        function prev() {
                return S.prev;
        };

        function croak(msg, line, col, pos) {
                var ctx = S.input.context();
                js_error(msg,
                         line != null ? line : ctx.tokline,
                         col != null ? col : ctx.tokcol,
                         pos != null ? pos : ctx.tokpos);
        };

        function token_error(token, msg) {
                croak(msg, token.line, token.col);
        };

        function unexpected(token) {
                if (token == null)
                        token = S.token;
                token_error(token, "Unexpected token: " + token.type + " (" + token.value + ")");
        };

        function expect_token(type, val) {
                if (is(type, val)) {
                        return next();
                }
                token_error(S.token, "Unexpected token " + S.token.type + ", expected " + type);
        };

        function expect(punc) { return expect_token("punc", punc); };

        function can_insert_semicolon() {
                return !exigent_mode && (
                        S.token.nlb || is("eof") || is("punc", "}")
                );
        };

        function semicolon() {
                if (is("punc", ";")) next();
                else if (!can_insert_semicolon()) unexpected();
        };

        function as() {
                return slice(arguments);
        };

        function parenthesised() {
                expect("(");
                var ex = expression();
                expect(")");
                return ex;
        };

        function add_tokens(str, start, end) {
                return str instanceof NodeWithToken ? str : new NodeWithToken(str, start, end);
        };

        function maybe_embed_tokens(parser) {
                if (embed_tokens) return function() {
                        var start = S.token;
                        var ast = parser.apply(this, arguments);
                        ast[0] = add_tokens(ast[0], start, prev());
                        return ast;
                };
                else return parser;
        };

        var statement = maybe_embed_tokens(function() {
                if (is("operator", "/") || is("operator", "/=")) {
                        S.peeked = null;
                        S.token = S.input(S.token.value.substr(1)); // force regexp
                }
                switch (S.token.type) {
                    case "num":
                    case "string":
                    case "regexp":
                    case "operator":
                    case "atom":
                        return simple_statement();

                    case "name":
                        return is_token(peek(), "punc", ":")
                                ? labeled_statement(prog1(S.token.value, next, next))
                                : simple_statement();

                    case "punc":
                        switch (S.token.value) {
                            case "{":
                                return as("block", block_());
                            case "[":
                            case "(":
                                return simple_statement();
                            case ";":
                                next();
                                return as("block");
                            default:
                                unexpected();
                        }

                    case "keyword":
                        switch (prog1(S.token.value, next)) {
                            case "break":
                                return break_cont("break");

                            case "continue":
                                return break_cont("continue");

                            case "debugger":
                                semicolon();
                                return as("debugger");

                            case "do":
                                return (function(body){
                                        expect_token("keyword", "while");
                                        return as("do", prog1(parenthesised, semicolon), body);
                                })(in_loop(statement));

                            case "for":
                                return for_();

                            case "function":
                                return function_(true);

                            case "if":
                                return if_();

                            case "return":
                                if (S.in_function == 0)
                                        croak("'return' outside of function");
                                return as("return",
                                          is("punc", ";")
                                          ? (next(), null)
                                          : can_insert_semicolon()
                                          ? null
                                          : prog1(expression, semicolon));

                            case "switch":
                                return as("switch", parenthesised(), switch_block_());

                            case "throw":
                                if (S.token.nlb)
                                        croak("Illegal newline after 'throw'");
                                return as("throw", prog1(expression, semicolon));

                            case "try":
                                return try_();

                            case "var":
                                return prog1(var_, semicolon);

                            case "const":
                                return prog1(const_, semicolon);

                            case "while":
                                return as("while", parenthesised(), in_loop(statement));

                            case "with":
                                return as("with", parenthesised(), statement());

                            default:
                                unexpected();
                        }
                }
        });

        function labeled_statement(label) {
                S.labels.push(label);
                var start = S.token, stat = statement();
                if (exigent_mode && !HOP(STATEMENTS_WITH_LABELS, stat[0]))
                        unexpected(start);
                S.labels.pop();
                return as("label", label, stat);
        };

        function simple_statement() {
                return as("stat", prog1(expression, semicolon));
        };

        function break_cont(type) {
                var name;
                if (!can_insert_semicolon()) {
                        name = is("name") ? S.token.value : null;
                }
                if (name != null) {
                        next();
                        if (!member(name, S.labels))
                                croak("Label " + name + " without matching loop or statement");
                }
                else if (S.in_loop == 0)
                        croak(type + " not inside a loop or switch");
                semicolon();
                return as(type, name);
        };

        function for_() {
                expect("(");
                var init = null;
                if (!is("punc", ";")) {
                        init = is("keyword", "var")
                                ? (next(), var_(true))
                                : expression(true, true);
                        if (is("operator", "in")) {
                                if (init[0] == "var" && init[1].length > 1)
                                        croak("Only one variable declaration allowed in for..in loop");
                                return for_in(init);
                        }
                }
                return regular_for(init);
        };

        function regular_for(init) {
                expect(";");
                var test = is("punc", ";") ? null : expression();
                expect(";");
                var step = is("punc", ")") ? null : expression();
                expect(")");
                return as("for", init, test, step, in_loop(statement));
        };

        function for_in(init) {
                var lhs = init[0] == "var" ? as("name", init[1][0]) : init;
                next();
                var obj = expression();
                expect(")");
                return as("for-in", init, lhs, obj, in_loop(statement));
        };

        var function_ = function(in_statement) {
                var name = is("name") ? prog1(S.token.value, next) : null;
                if (in_statement && !name)
                        unexpected();
                expect("(");
                return as(in_statement ? "defun" : "function",
                          name,
                          // arguments
                          (function(first, a){
                                  while (!is("punc", ")")) {
                                          if (first) first = false; else expect(",");
                                          if (!is("name")) unexpected();
                                          a.push(S.token.value);
                                          next();
                                  }
                                  next();
                                  return a;
                          })(true, []),
                          // body
                          (function(){
                                  ++S.in_function;
                                  var loop = S.in_loop;
                                  S.in_loop = 0;
                                  var a = block_();
                                  --S.in_function;
                                  S.in_loop = loop;
                                  return a;
                          })());
        };

        function if_() {
                var cond = parenthesised(), body = statement(), belse;
                if (is("keyword", "else")) {
                        next();
                        belse = statement();
                }
                return as("if", cond, body, belse);
        };

        function block_() {
                expect("{");
                var a = [];
                while (!is("punc", "}")) {
                        if (is("eof")) unexpected();
                        a.push(statement());
                }
                next();
                return a;
        };

        var switch_block_ = curry(in_loop, function(){
                expect("{");
                var a = [], cur = null;
                while (!is("punc", "}")) {
                        if (is("eof")) unexpected();
                        if (is("keyword", "case")) {
                                next();
                                cur = [];
                                a.push([ expression(), cur ]);
                                expect(":");
                        }
                        else if (is("keyword", "default")) {
                                next();
                                expect(":");
                                cur = [];
                                a.push([ null, cur ]);
                        }
                        else {
                                if (!cur) unexpected();
                                cur.push(statement());
                        }
                }
                next();
                return a;
        });

        function try_() {
                var body = block_(), bcatch, bfinally;
                if (is("keyword", "catch")) {
                        next();
                        expect("(");
                        if (!is("name"))
                                croak("Name expected");
                        var name = S.token.value;
                        next();
                        expect(")");
                        bcatch = [ name, block_() ];
                }
                if (is("keyword", "finally")) {
                        next();
                        bfinally = block_();
                }
                if (!bcatch && !bfinally)
                        croak("Missing catch/finally blocks");
                return as("try", body, bcatch, bfinally);
        };

        function vardefs(no_in) {
                var a = [];
                for (;;) {
                        if (!is("name"))
                                unexpected();
                        var name = S.token.value;
                        next();
                        if (is("operator", "=")) {
                                next();
                                a.push([ name, expression(false, no_in) ]);
                        } else {
                                a.push([ name ]);
                        }
                        if (!is("punc", ","))
                                break;
                        next();
                }
                return a;
        };

        function var_(no_in) {
                return as("var", vardefs(no_in));
        };

        function const_() {
                return as("const", vardefs());
        };

        function new_() {
                var newexp = expr_atom(false), args;
                if (is("punc", "(")) {
                        next();
                        args = expr_list(")");
                } else {
                        args = [];
                }
                return subscripts(as("new", newexp, args), true);
        };

        var expr_atom = maybe_embed_tokens(function(allow_calls) {
                if (is("operator", "new")) {
                        next();
                        return new_();
                }
                if (is("punc")) {
                        switch (S.token.value) {
                            case "(":
                                next();
                                return subscripts(prog1(expression, curry(expect, ")")), allow_calls);
                            case "[":
                                next();
                                return subscripts(array_(), allow_calls);
                            case "{":
                                next();
                                return subscripts(object_(), allow_calls);
                        }
                        unexpected();
                }
                if (is("keyword", "function")) {
                        next();
                        return subscripts(function_(false), allow_calls);
                }
                if (HOP(ATOMIC_START_TOKEN, S.token.type)) {
                        var atom = S.token.type == "regexp"
                                ? as("regexp", S.token.value[0], S.token.value[1])
                                : as(S.token.type, S.token.value);
                        return subscripts(prog1(atom, next), allow_calls);
                }
                unexpected();
        });

        function expr_list(closing, allow_trailing_comma, allow_empty) {
                var first = true, a = [];
                while (!is("punc", closing)) {
                        if (first) first = false; else expect(",");
                        if (allow_trailing_comma && is("punc", closing)) break;
                        if (is("punc", ",") && allow_empty) {
                                a.push([ "atom", "undefined" ]);
                        } else {
                                a.push(expression(false));
                        }
                }
                next();
                return a;
        };

        function array_() {
                return as("array", expr_list("]", !exigent_mode, true));
        };

        function object_() {
                var first = true, a = [];
                while (!is("punc", "}")) {
                        if (first) first = false; else expect(",");
                        if (!exigent_mode && is("punc", "}"))
                                // allow trailing comma
                                break;
                        var type = S.token.type;
                        var name = as_property_name();
                        if (type == "name" && (name == "get" || name == "set") && !is("punc", ":")) {
                                a.push([ as_name(), function_(false), name ]);
                        } else {
                                expect(":");
                                a.push([ name, expression(false) ]);
                        }
                }
                next();
                return as("object", a);
        };

        function as_property_name() {
                switch (S.token.type) {
                    case "num":
                    case "string":
                        return prog1(S.token.value, next);
                }
                return as_name();
        };

        function as_name() {
                switch (S.token.type) {
                    case "name":
                    case "operator":
                    case "keyword":
                    case "atom":
                        return prog1(S.token.value, next);
                    default:
                        unexpected();
                }
        };

        function subscripts(expr, allow_calls) {
                if (is("punc", ".")) {
                        next();
                        return subscripts(as("dot", expr, as_name()), allow_calls);
                }
                if (is("punc", "[")) {
                        next();
                        return subscripts(as("sub", expr, prog1(expression, curry(expect, "]"))), allow_calls);
                }
                if (allow_calls && is("punc", "(")) {
                        next();
                        return subscripts(as("call", expr, expr_list(")")), true);
                }
                return expr;
        };

        function maybe_unary(allow_calls) {
                if (is("operator") && HOP(UNARY_PREFIX, S.token.value)) {
                        return make_unary("unary-prefix",
                                          prog1(S.token.value, next),
                                          maybe_unary(allow_calls));
                }
                var val = expr_atom(allow_calls);
                while (is("operator") && HOP(UNARY_POSTFIX, S.token.value) && !S.token.nlb) {
                        val = make_unary("unary-postfix", S.token.value, val);
                        next();
                }
                return val;
        };

        function make_unary(tag, op, expr) {
                if ((op == "++" || op == "--") && !is_assignable(expr))
                        croak("Invalid use of " + op + " operator");
                return as(tag, op, expr);
        };

        function expr_op(left, min_prec, no_in) {
                var op = is("operator") ? S.token.value : null;
                if (op && op == "in" && no_in) op = null;
                var prec = op != null ? PRECEDENCE[op] : null;
                if (prec != null && prec > min_prec) {
                        next();
                        var right = expr_op(maybe_unary(true), prec, no_in);
                        return expr_op(as("binary", op, left, right), min_prec, no_in);
                }
                return left;
        };

        function expr_ops(no_in) {
                return expr_op(maybe_unary(true), 0, no_in);
        };

        function maybe_conditional(no_in) {
                var expr = expr_ops(no_in);
                if (is("operator", "?")) {
                        next();
                        var yes = expression(false);
                        expect(":");
                        return as("conditional", expr, yes, expression(false, no_in));
                }
                return expr;
        };

        function is_assignable(expr) {
                if (!exigent_mode) return true;
                switch (expr[0]+"") {
                    case "dot":
                    case "sub":
                    case "new":
                    case "call":
                        return true;
                    case "name":
                        return expr[1] != "this";
                }
        };

        function maybe_assign(no_in) {
                var left = maybe_conditional(no_in), val = S.token.value;
                if (is("operator") && HOP(ASSIGNMENT, val)) {
                        if (is_assignable(left)) {
                                next();
                                return as("assign", ASSIGNMENT[val], left, maybe_assign(no_in));
                        }
                        croak("Invalid assignment");
                }
                return left;
        };

        var expression = maybe_embed_tokens(function(commas, no_in) {
                if (arguments.length == 0)
                        commas = true;
                var expr = maybe_assign(no_in);
                if (commas && is("punc", ",")) {
                        next();
                        return as("seq", expr, expression(true, no_in));
                }
                return expr;
        });

        function in_loop(cont) {
                try {
                        ++S.in_loop;
                        return cont();
                } finally {
                        --S.in_loop;
                }
        };

        return as("toplevel", (function(a){
                while (!is("eof"))
                        a.push(statement());
                return a;
        })([]));

};

/* -----[ Utilities ]----- */

function curry(f) {
        var args = slice(arguments, 1);
        return function() { return f.apply(this, args.concat(slice(arguments))); };
};

function prog1(ret) {
        if (ret instanceof Function)
                ret = ret();
        for (var i = 1, n = arguments.length; --n > 0; ++i)
                arguments[i]();
        return ret;
};

function array_to_hash(a) {
        var ret = {};
        for (var i = 0; i < a.length; ++i)
                ret[a[i]] = true;
        return ret;
};

function slice(a, start) {
        return Array.prototype.slice.call(a, start || 0);
};

function characters(str) {
        return str.split("");
};

function member(name, array) {
        for (var i = array.length; --i >= 0;)
                if (array[i] == name)
                        return true;
        return false;
};

function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
};

var warn = function() {};

/* -----[ Exports ]----- */

exports.tokenizer = tokenizer;
exports.parse = parse;
exports.slice = slice;
exports.curry = curry;
exports.member = member;
exports.array_to_hash = array_to_hash;
exports.PRECEDENCE = PRECEDENCE;
exports.KEYWORDS_ATOM = KEYWORDS_ATOM;
exports.RESERVED_WORDS = RESERVED_WORDS;
exports.KEYWORDS = KEYWORDS;
exports.ATOMIC_START_TOKEN = ATOMIC_START_TOKEN;
exports.OPERATORS = OPERATORS;
exports.is_alphanumeric_char = is_alphanumeric_char;
exports.set_logger = function(logger) {
        warn = logger;
};

return exports;
}());

mock_modules["./process"] = (function (require) {
var exports = {};
/***********************************************************************

  A JavaScript tokenizer / parser / beautifier / compressor.

  This version is suitable for Node.js.  With minimal changes (the
  exports stuff) it should work on any JS platform.

  This file implements some AST processors.  They work on data built
  by parse-js.

  Exported functions:

    - ast_mangle(ast, options) -- mangles the variable/function names
      in the AST.  Returns an AST.

    - ast_squeeze(ast) -- employs various optimizations to make the
      final generated code even smaller.  Returns an AST.

    - gen_code(ast, options) -- generates JS code from the AST.  Pass
      true (or an object, see the code for some options) as second
      argument to get "pretty" (indented) code.

  -------------------------------- (C) ---------------------------------

                           Author: Mihai Bazon
                         <mihai.bazon@gmail.com>
                       http://mihai.bazon.net/blog

  Distributed under the BSD license:

    Copyright 2010 (c) Mihai Bazon <mihai.bazon@gmail.com>

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

        * Redistributions of source code must retain the above
          copyright notice, this list of conditions and the following
          disclaimer.

        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials
          provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
    EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
    LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
    OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
    TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
    THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
    SUCH DAMAGE.

 ***********************************************************************/

var jsp = require("./parse-js"),
    slice = jsp.slice,
    member = jsp.member,
    PRECEDENCE = jsp.PRECEDENCE,
    OPERATORS = jsp.OPERATORS;

/* -----[ helper for AST traversal ]----- */

function ast_walker() {
        function _vardefs(defs) {
                return [ this[0], MAP(defs, function(def){
                        var a = [ def[0] ];
                        if (def.length > 1)
                                a[1] = walk(def[1]);
                        return a;
                }) ];
        };
        function _block(statements) {
                var out = [ this[0] ];
                if (statements != null)
                        out.push(MAP(statements, walk));
                return out;
        };
        var walkers = {
                "string": function(str) {
                        return [ this[0], str ];
                },
                "num": function(num) {
                        return [ this[0], num ];
                },
                "name": function(name) {
                        return [ this[0], name ];
                },
                "toplevel": function(statements) {
                        return [ this[0], MAP(statements, walk) ];
                },
                "block": _block,
                "splice": _block,
                "var": _vardefs,
                "const": _vardefs,
                "try": function(t, c, f) {
                        return [
                                this[0],
                                MAP(t, walk),
                                c != null ? [ c[0], MAP(c[1], walk) ] : null,
                                f != null ? MAP(f, walk) : null
                        ];
                },
                "throw": function(expr) {
                        return [ this[0], walk(expr) ];
                },
                "new": function(ctor, args) {
                        return [ this[0], walk(ctor), MAP(args, walk) ];
                },
                "switch": function(expr, body) {
                        return [ this[0], walk(expr), MAP(body, function(branch){
                                return [ branch[0] ? walk(branch[0]) : null,
                                         MAP(branch[1], walk) ];
                        }) ];
                },
                "break": function(label) {
                        return [ this[0], label ];
                },
                "continue": function(label) {
                        return [ this[0], label ];
                },
                "conditional": function(cond, t, e) {
                        return [ this[0], walk(cond), walk(t), walk(e) ];
                },
                "assign": function(op, lvalue, rvalue) {
                        return [ this[0], op, walk(lvalue), walk(rvalue) ];
                },
                "dot": function(expr) {
                        return [ this[0], walk(expr) ].concat(slice(arguments, 1));
                },
                "call": function(expr, args) {
                        return [ this[0], walk(expr), MAP(args, walk) ];
                },
                "function": function(name, args, body) {
                        return [ this[0], name, args.slice(), MAP(body, walk) ];
                },
                "debugger": function() {
                        return [ this[0] ];
                },
                "defun": function(name, args, body) {
                        return [ this[0], name, args.slice(), MAP(body, walk) ];
                },
                "if": function(conditional, t, e) {
                        return [ this[0], walk(conditional), walk(t), walk(e) ];
                },
                "for": function(init, cond, step, block) {
                        return [ this[0], walk(init), walk(cond), walk(step), walk(block) ];
                },
                "for-in": function(vvar, key, hash, block) {
                        return [ this[0], walk(vvar), walk(key), walk(hash), walk(block) ];
                },
                "while": function(cond, block) {
                        return [ this[0], walk(cond), walk(block) ];
                },
                "do": function(cond, block) {
                        return [ this[0], walk(cond), walk(block) ];
                },
                "return": function(expr) {
                        return [ this[0], walk(expr) ];
                },
                "binary": function(op, left, right) {
                        return [ this[0], op, walk(left), walk(right) ];
                },
                "unary-prefix": function(op, expr) {
                        return [ this[0], op, walk(expr) ];
                },
                "unary-postfix": function(op, expr) {
                        return [ this[0], op, walk(expr) ];
                },
                "sub": function(expr, subscript) {
                        return [ this[0], walk(expr), walk(subscript) ];
                },
                "object": function(props) {
                        return [ this[0], MAP(props, function(p){
                                return p.length == 2
                                        ? [ p[0], walk(p[1]) ]
                                        : [ p[0], walk(p[1]), p[2] ]; // get/set-ter
                        }) ];
                },
                "regexp": function(rx, mods) {
                        return [ this[0], rx, mods ];
                },
                "array": function(elements) {
                        return [ this[0], MAP(elements, walk) ];
                },
                "stat": function(stat) {
                        return [ this[0], walk(stat) ];
                },
                "seq": function() {
                        return [ this[0] ].concat(MAP(slice(arguments), walk));
                },
                "label": function(name, block) {
                        return [ this[0], name, walk(block) ];
                },
                "with": function(expr, block) {
                        return [ this[0], walk(expr), walk(block) ];
                },
                "atom": function(name) {
                        return [ this[0], name ];
                }
        };

        var user = {};
        var stack = [];
        function walk(ast) {
                if (ast == null)
                        return null;
                try {
                        stack.push(ast);
                        var type = ast[0];
                        var gen = user[type];
                        if (gen) {
                                var ret = gen.apply(ast, ast.slice(1));
                                if (ret != null)
                                        return ret;
                        }
                        gen = walkers[type];
                        return gen.apply(ast, ast.slice(1));
                } finally {
                        stack.pop();
                }
        };

        function dive(ast) {
                if (ast == null)
                        return null;
                try {
                        stack.push(ast);
                        return walkers[ast[0]].apply(ast, ast.slice(1));
                } finally {
                        stack.pop();
                }
        };

        function with_walkers(walkers, cont){
                var save = {}, i;
                for (i in walkers) if (HOP(walkers, i)) {
                        save[i] = user[i];
                        user[i] = walkers[i];
                }
                var ret = cont();
                for (i in save) if (HOP(save, i)) {
                        if (!save[i]) delete user[i];
                        else user[i] = save[i];
                }
                return ret;
        };

        return {
                walk: walk,
                dive: dive,
                with_walkers: with_walkers,
                parent: function() {
                        return stack[stack.length - 2]; // last one is current node
                },
                stack: function() {
                        return stack;
                }
        };
};

/* -----[ Scope and mangling ]----- */

function Scope(parent) {
        this.names = {};        // names defined in this scope
        this.mangled = {};      // mangled names (orig.name => mangled)
        this.rev_mangled = {};  // reverse lookup (mangled => orig.name)
        this.cname = -1;        // current mangled name
        this.refs = {};         // names referenced from this scope
        this.uses_with = false; // will become TRUE if with() is detected in this or any subscopes
        this.uses_eval = false; // will become TRUE if eval() is detected in this or any subscopes
        this.parent = parent;   // parent scope
        this.children = [];     // sub-scopes
        if (parent) {
                this.level = parent.level + 1;
                parent.children.push(this);
        } else {
                this.level = 0;
        }
};

var base54 = (function(){
        var DIGITS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";
        return function(num) {
                var ret = "";
                do {
                        ret = DIGITS.charAt(num % 54) + ret;
                        num = Math.floor(num / 54);
                } while (num > 0);
                return ret;
        };
})();

Scope.prototype = {
        has: function(name) {
                for (var s = this; s; s = s.parent)
                        if (HOP(s.names, name))
                                return s;
        },
        has_mangled: function(mname) {
                for (var s = this; s; s = s.parent)
                        if (HOP(s.rev_mangled, mname))
                                return s;
        },
        toJSON: function() {
                return {
                        names: this.names,
                        uses_eval: this.uses_eval,
                        uses_with: this.uses_with
                };
        },

        next_mangled: function() {
                // we must be careful that the new mangled name:
                //
                // 1. doesn't shadow a mangled name from a parent
                //    scope, unless we don't reference the original
                //    name from this scope OR from any sub-scopes!
                //    This will get slow.
                //
                // 2. doesn't shadow an original name from a parent
                //    scope, in the event that the name is not mangled
                //    in the parent scope and we reference that name
                //    here OR IN ANY SUBSCOPES!
                //
                // 3. doesn't shadow a name that is referenced but not
                //    defined (possibly global defined elsewhere).
                for (;;) {
                        var m = base54(++this.cname), prior;

                        // case 1.
                        prior = this.has_mangled(m);
                        if (prior && this.refs[prior.rev_mangled[m]] === prior)
                                continue;

                        // case 2.
                        prior = this.has(m);
                        if (prior && prior !== this && this.refs[m] === prior && !prior.has_mangled(m))
                                continue;

                        // case 3.
                        if (HOP(this.refs, m) && this.refs[m] == null)
                                continue;

                        // I got "do" once. :-/
                        if (!is_identifier(m))
                                continue;

                        return m;
                }
        },
        set_mangle: function(name, m) {
                this.rev_mangled[m] = name;
                return this.mangled[name] = m;
        },
        get_mangled: function(name, newMangle) {
                if (this.uses_eval || this.uses_with) return name; // no mangle if eval or with is in use
                var s = this.has(name);
                if (!s) return name; // not in visible scope, no mangle
                if (HOP(s.mangled, name)) return s.mangled[name]; // already mangled in this scope
                if (!newMangle) return name;                      // not found and no mangling requested
                return s.set_mangle(name, s.next_mangled());
        },
        references: function(name) {
                return name && !this.parent || this.uses_with || this.uses_eval || this.refs[name];
        },
        define: function(name, type) {
                if (name != null) {
                        if (type == "var" || !HOP(this.names, name))
                                this.names[name] = type || "var";
                        return name;
                }
        }
};

function ast_add_scope(ast) {

        var current_scope = null;
        var w = ast_walker(), walk = w.walk;
        var having_eval = [];

        function with_new_scope(cont) {
                current_scope = new Scope(current_scope);
                current_scope.labels = new Scope();
                var ret = current_scope.body = cont();
                ret.scope = current_scope;
                current_scope = current_scope.parent;
                return ret;
        };

        function define(name, type) {
                return current_scope.define(name, type);
        };

        function reference(name) {
                current_scope.refs[name] = true;
        };

        function _lambda(name, args, body) {
                var is_defun = this[0] == "defun";
                return [ this[0], is_defun ? define(name, "defun") : name, args, with_new_scope(function(){
                        if (!is_defun) define(name, "lambda");
                        MAP(args, function(name){ define(name, "arg") });
                        return MAP(body, walk);
                })];
        };

        function _vardefs(type) {
                return function(defs) {
                        MAP(defs, function(d){
                                define(d[0], type);
                                if (d[1]) reference(d[0]);
                        });
                };
        };

        function _breacont(label) {
                if (label)
                        current_scope.labels.refs[label] = true;
        };

        return with_new_scope(function(){
                // process AST
                var ret = w.with_walkers({
                        "function": _lambda,
                        "defun": _lambda,
                        "label": function(name, stat) { current_scope.labels.define(name) },
                        "break": _breacont,
                        "continue": _breacont,
                        "with": function(expr, block) {
                                for (var s = current_scope; s; s = s.parent)
                                        s.uses_with = true;
                        },
                        "var": _vardefs("var"),
                        "const": _vardefs("const"),
                        "try": function(t, c, f) {
                                if (c != null) return [
                                        this[0],
                                        MAP(t, walk),
                                        [ define(c[0], "catch"), MAP(c[1], walk) ],
                                        f != null ? MAP(f, walk) : null
                                ];
                        },
                        "name": function(name) {
                                if (name == "eval")
                                        having_eval.push(current_scope);
                                reference(name);
                        }
                }, function(){
                        return walk(ast);
                });

                // the reason why we need an additional pass here is
                // that names can be used prior to their definition.

                // scopes where eval was detected and their parents
                // are marked with uses_eval, unless they define the
                // "eval" name.
                MAP(having_eval, function(scope){
                        if (!scope.has("eval")) while (scope) {
                                scope.uses_eval = true;
                                scope = scope.parent;
                        }
                });

                // for referenced names it might be useful to know
                // their origin scope.  current_scope here is the
                // toplevel one.
                function fixrefs(scope, i) {
                        // do children first; order shouldn't matter
                        for (i = scope.children.length; --i >= 0;)
                                fixrefs(scope.children[i]);
                        for (i in scope.refs) if (HOP(scope.refs, i)) {
                                // find origin scope and propagate the reference to origin
                                for (var origin = scope.has(i), s = scope; s; s = s.parent) {
                                        s.refs[i] = origin;
                                        if (s === origin) break;
                                }
                        }
                };
                fixrefs(current_scope);

                return ret;
        });

};

/* -----[ mangle names ]----- */

function ast_mangle(ast, options) {
        var w = ast_walker(), walk = w.walk, scope;
        options = options || {};

        function get_mangled(name, newMangle) {
                if (!options.toplevel && !scope.parent) return name; // don't mangle toplevel
                if (options.except && member(name, options.except))
                        return name;
                return scope.get_mangled(name, newMangle);
        };

        function get_define(name) {
                if (options.defines) {
                        // we always lookup a defined symbol for the current scope FIRST, so declared
                        // vars trump a DEFINE symbol, but if no such var is found, then match a DEFINE value
                        if (!scope.has(name)) {
                                if (HOP(options.defines, name)) {
                                        return options.defines[name];
                                }
                        }
                        return null;
                }
        };

        function _lambda(name, args, body) {
                if (!options.no_functions) {
                        var is_defun = this[0] == "defun", extra;
                        if (name) {
                                if (is_defun) name = get_mangled(name);
                                else if (body.scope.references(name)) {
                                        extra = {};
                                        if (!(scope.uses_eval || scope.uses_with))
                                                name = extra[name] = scope.next_mangled();
                                        else
                                                extra[name] = name;
                                }
                                else name = null;
                        }
                }
                body = with_scope(body.scope, function(){
                        args = MAP(args, function(name){ return get_mangled(name) });
                        return MAP(body, walk);
                }, extra);
                return [ this[0], name, args, body ];
        };

        function with_scope(s, cont, extra) {
                var _scope = scope;
                scope = s;
                if (extra) for (var i in extra) if (HOP(extra, i)) {
                        s.set_mangle(i, extra[i]);
                }
                for (var i in s.names) if (HOP(s.names, i)) {
                        get_mangled(i, true);
                }
                var ret = cont();
                ret.scope = s;
                scope = _scope;
                return ret;
        };

        function _vardefs(defs) {
                return [ this[0], MAP(defs, function(d){
                        return [ get_mangled(d[0]), walk(d[1]) ];
                }) ];
        };

        function _breacont(label) {
                if (label) return [ this[0], scope.labels.get_mangled(label) ];
        };

        return w.with_walkers({
                "function": _lambda,
                "defun": function() {
                        // move function declarations to the top when
                        // they are not in some block.
                        var ast = _lambda.apply(this, arguments);
                        switch (w.parent()[0]) {
                            case "toplevel":
                            case "function":
                            case "defun":
                                return MAP.at_top(ast);
                        }
                        return ast;
                },
                "label": function(label, stat) {
                        if (scope.labels.refs[label]) return [
                                this[0],
                                scope.labels.get_mangled(label, true),
                                walk(stat)
                        ];
                        return walk(stat);
                },
                "break": _breacont,
                "continue": _breacont,
                "var": _vardefs,
                "const": _vardefs,
                "name": function(name) {
                        return get_define(name) || [ this[0], get_mangled(name) ];
                },
                "try": function(t, c, f) {
                        return [ this[0],
                                 MAP(t, walk),
                                 c != null ? [ get_mangled(c[0]), MAP(c[1], walk) ] : null,
                                 f != null ? MAP(f, walk) : null ];
                },
                "toplevel": function(body) {
                        var self = this;
                        return with_scope(self.scope, function(){
                                return [ self[0], MAP(body, walk) ];
                        });
                }
        }, function() {
                return walk(ast_add_scope(ast));
        });
};

/* -----[
   - compress foo["bar"] into foo.bar,
   - remove block brackets {} where possible
   - join consecutive var declarations
   - various optimizations for IFs:
     - if (cond) foo(); else bar();  ==>  cond?foo():bar();
     - if (cond) foo();  ==>  cond&&foo();
     - if (foo) return bar(); else return baz();  ==> return foo?bar():baz(); // also for throw
     - if (foo) return bar(); else something();  ==> {if(foo)return bar();something()}
   ]----- */

var warn = function(){};

function best_of(ast1, ast2) {
        return gen_code(ast1).length > gen_code(ast2[0] == "stat" ? ast2[1] : ast2).length ? ast2 : ast1;
};

function last_stat(b) {
        if (b[0] == "block" && b[1] && b[1].length > 0)
                return b[1][b[1].length - 1];
        return b;
}

function aborts(t) {
        if (t) switch (last_stat(t)[0]) {
            case "return":
            case "break":
            case "continue":
            case "throw":
                return true;
        }
};

function boolean_expr(expr) {
        return ( (expr[0] == "unary-prefix"
                  && member(expr[1], [ "!", "delete" ])) ||

                 (expr[0] == "binary"
                  && member(expr[1], [ "in", "instanceof", "==", "!=", "===", "!==", "<", "<=", ">=", ">" ])) ||

                 (expr[0] == "binary"
                  && member(expr[1], [ "&&", "||" ])
                  && boolean_expr(expr[2])
                  && boolean_expr(expr[3])) ||

                 (expr[0] == "conditional"
                  && boolean_expr(expr[2])
                  && boolean_expr(expr[3])) ||

                 (expr[0] == "assign"
                  && expr[1] === true
                  && boolean_expr(expr[3])) ||

                 (expr[0] == "seq"
                  && boolean_expr(expr[expr.length - 1]))
               );
};

function empty(b) {
        return !b || (b[0] == "block" && (!b[1] || b[1].length == 0));
};

function is_string(node) {
        return (node[0] == "string" ||
                node[0] == "unary-prefix" && node[1] == "typeof" ||
                node[0] == "binary" && node[1] == "+" &&
                (is_string(node[2]) || is_string(node[3])));
};

var when_constant = (function(){

        var $NOT_CONSTANT = {};

        // this can only evaluate constant expressions.  If it finds anything
        // not constant, it throws $NOT_CONSTANT.
        function evaluate(expr) {
                switch (expr[0]) {
                    case "string":
                    case "num":
                        return expr[1];
                    case "name":
                    case "atom":
                        switch (expr[1]) {
                            case "true": return true;
                            case "false": return false;
                            case "null": return null;
                        }
                        break;
                    case "unary-prefix":
                        switch (expr[1]) {
                            case "!": return !evaluate(expr[2]);
                            case "typeof": return typeof evaluate(expr[2]);
                            case "~": return ~evaluate(expr[2]);
                            case "-": return -evaluate(expr[2]);
                            case "+": return +evaluate(expr[2]);
                        }
                        break;
                    case "binary":
                        var left = expr[2], right = expr[3];
                        switch (expr[1]) {
                            case "&&"         : return evaluate(left) &&         evaluate(right);
                            case "||"         : return evaluate(left) ||         evaluate(right);
                            case "|"          : return evaluate(left) |          evaluate(right);
                            case "&"          : return evaluate(left) &          evaluate(right);
                            case "^"          : return evaluate(left) ^          evaluate(right);
                            case "+"          : return evaluate(left) +          evaluate(right);
                            case "*"          : return evaluate(left) *          evaluate(right);
                            case "/"          : return evaluate(left) /          evaluate(right);
                            case "%"          : return evaluate(left) %          evaluate(right);
                            case "-"          : return evaluate(left) -          evaluate(right);
                            case "<<"         : return evaluate(left) <<         evaluate(right);
                            case ">>"         : return evaluate(left) >>         evaluate(right);
                            case ">>>"        : return evaluate(left) >>>        evaluate(right);
                            case "=="         : return evaluate(left) ==         evaluate(right);
                            case "==="        : return evaluate(left) ===        evaluate(right);
                            case "!="         : return evaluate(left) !=         evaluate(right);
                            case "!=="        : return evaluate(left) !==        evaluate(right);
                            case "<"          : return evaluate(left) <          evaluate(right);
                            case "<="         : return evaluate(left) <=         evaluate(right);
                            case ">"          : return evaluate(left) >          evaluate(right);
                            case ">="         : return evaluate(left) >=         evaluate(right);
                            case "in"         : return evaluate(left) in         evaluate(right);
                            case "instanceof" : return evaluate(left) instanceof evaluate(right);
                        }
                }
                throw $NOT_CONSTANT;
        };

        return function(expr, yes, no) {
                try {
                        var val = evaluate(expr), ast;
                        switch (typeof val) {
                            case "string": ast =  [ "string", val ]; break;
                            case "number": ast =  [ "num", val ]; break;
                            case "boolean": ast =  [ "name", String(val) ]; break;
                            default:
                                if (val === null) { ast = [ "atom", "null" ]; break; }
                                throw new Error("Can't handle constant of type: " + (typeof val));
                        }
                        return yes.call(expr, ast, val);
                } catch(ex) {
                        if (ex === $NOT_CONSTANT) {
                                if (expr[0] == "binary"
                                    && (expr[1] == "===" || expr[1] == "!==")
                                    && ((is_string(expr[2]) && is_string(expr[3]))
                                        || (boolean_expr(expr[2]) && boolean_expr(expr[3])))) {
                                        expr[1] = expr[1].substr(0, 2);
                                }
                                else if (no && expr[0] == "binary"
                                         && (expr[1] == "||" || expr[1] == "&&")) {
                                    // the whole expression is not constant but the lval may be...
                                    try {
                                        var lval = evaluate(expr[2]);
                                        expr = ((expr[1] == "&&" && (lval ? expr[3] : lval))    ||
                                                (expr[1] == "||" && (lval ? lval    : expr[3])) ||
                                                expr);
                                    } catch(ex2) {
                                        // IGNORE... lval is not constant
                                    }
                                }
                                return no ? no.call(expr, expr) : null;
                        }
                        else throw ex;
                }
        };

})();

function warn_unreachable(ast) {
        if (!empty(ast))
                warn("Dropping unreachable code: " + gen_code(ast, true));
};

function prepare_ifs(ast) {
        var w = ast_walker(), walk = w.walk;
        // In this first pass, we rewrite ifs which abort with no else with an
        // if-else.  For example:
        //
        // if (x) {
        //     blah();
        //     return y;
        // }
        // foobar();
        //
        // is rewritten into:
        //
        // if (x) {
        //     blah();
        //     return y;
        // } else {
        //     foobar();
        // }
        function redo_if(statements) {
                statements = MAP(statements, walk);

                for (var i = 0; i < statements.length; ++i) {
                        var fi = statements[i];
                        if (fi[0] != "if") continue;

                        if (fi[3] && walk(fi[3])) continue;

                        var t = walk(fi[2]);
                        if (!aborts(t)) continue;

                        var conditional = walk(fi[1]);

                        var e_body = redo_if(statements.slice(i + 1));
                        var e = e_body.length == 1 ? e_body[0] : [ "block", e_body ];

                        return statements.slice(0, i).concat([ [
                                fi[0],          // "if"
                                conditional,    // conditional
                                t,              // then
                                e               // else
                        ] ]);
                }

                return statements;
        };

        function redo_if_lambda(name, args, body) {
                body = redo_if(body);
                return [ this[0], name, args, body ];
        };

        function redo_if_block(statements) {
                return [ this[0], statements != null ? redo_if(statements) : null ];
        };

        return w.with_walkers({
                "defun": redo_if_lambda,
                "function": redo_if_lambda,
                "block": redo_if_block,
                "splice": redo_if_block,
                "toplevel": function(statements) {
                        return [ this[0], redo_if(statements) ];
                },
                "try": function(t, c, f) {
                        return [
                                this[0],
                                redo_if(t),
                                c != null ? [ c[0], redo_if(c[1]) ] : null,
                                f != null ? redo_if(f) : null
                        ];
                }
        }, function() {
                return walk(ast);
        });
};

function for_side_effects(ast, handler) {
        var w = ast_walker(), walk = w.walk;
        var $stop = {}, $restart = {};
        function stop() { throw $stop };
        function restart() { throw $restart };
        function found(){ return handler.call(this, this, w, stop, restart) };
        function unary(op) {
                if (op == "++" || op == "--")
                        return found.apply(this, arguments);
        };
        return w.with_walkers({
                "try": found,
                "throw": found,
                "return": found,
                "new": found,
                "switch": found,
                "break": found,
                "continue": found,
                "assign": found,
                "call": found,
                "if": found,
                "for": found,
                "for-in": found,
                "while": found,
                "do": found,
                "return": found,
                "unary-prefix": unary,
                "unary-postfix": unary,
                "defun": found
        }, function(){
                while (true) try {
                        walk(ast);
                        break;
                } catch(ex) {
                        if (ex === $stop) break;
                        if (ex === $restart) continue;
                        throw ex;
                }
        });
};

function ast_lift_variables(ast) {
        var w = ast_walker(), walk = w.walk, scope;
        function do_body(body, env) {
                var _scope = scope;
                scope = env;
                body = MAP(body, walk);
                var hash = {}, names = MAP(env.names, function(type, name){
                        if (type != "var") return MAP.skip;
                        if (!env.references(name)) return MAP.skip;
                        hash[name] = true;
                        return [ name ];
                });
                if (names.length > 0) {
                        // looking for assignments to any of these variables.
                        // we can save considerable space by moving the definitions
                        // in the var declaration.
                        for_side_effects([ "block", body ], function(ast, walker, stop, restart) {
                                if (ast[0] == "assign"
                                    && ast[1] === true
                                    && ast[2][0] == "name"
                                    && HOP(hash, ast[2][1])) {
                                        // insert the definition into the var declaration
                                        for (var i = names.length; --i >= 0;) {
                                                if (names[i][0] == ast[2][1]) {
                                                        if (names[i][1]) // this name already defined, we must stop
                                                                stop();
                                                        names[i][1] = ast[3]; // definition
                                                        names.push(names.splice(i, 1)[0]);
                                                        break;
                                                }
                                        }
                                        // remove this assignment from the AST.
                                        var p = walker.parent();
                                        if (p[0] == "seq") {
                                                var a = p[2];
                                                a.unshift(0, p.length);
                                                p.splice.apply(p, a);
                                        }
                                        else if (p[0] == "stat") {
                                                p.splice(0, p.length, "block"); // empty statement
                                        }
                                        else {
                                                stop();
                                        }
                                        restart();
                                }
                                stop();
                        });
                        body.unshift([ "var", names ]);
                }
                scope = _scope;
                return body;
        };
        function _vardefs(defs) {
                var ret = null;
                for (var i = defs.length; --i >= 0;) {
                        var d = defs[i];
                        if (!d[1]) continue;
                        d = [ "assign", true, [ "name", d[0] ], d[1] ];
                        if (ret == null) ret = d;
                        else ret = [ "seq", d, ret ];
                }
                if (ret == null) {
                        if (w.parent()[0] == "for-in")
                                return [ "name", defs[0][0] ];
                        return MAP.skip;
                }
                return [ "stat", ret ];
        };
        function _toplevel(body) {
                return [ this[0], do_body(body, this.scope) ];
        };
        return w.with_walkers({
                "function": function(name, args, body){
                        for (var i = args.length; --i >= 0 && !body.scope.references(args[i]);)
                                args.pop();
                        if (!body.scope.references(name)) name = null;
                        return [ this[0], name, args, do_body(body, body.scope) ];
                },
                "defun": function(name, args, body){
                        if (!scope.references(name)) return MAP.skip;
                        for (var i = args.length; --i >= 0 && !body.scope.references(args[i]);)
                                args.pop();
                        return [ this[0], name, args, do_body(body, body.scope) ];
                },
                "var": _vardefs,
                "toplevel": _toplevel
        }, function(){
                return walk(ast_add_scope(ast));
        });
};

function ast_squeeze(ast, options) {
        options = defaults(options, {
                make_seqs   : true,
                dead_code   : true,
                no_warnings : false,
                keep_comps  : true
        });

        var w = ast_walker(), walk = w.walk;

        function negate(c) {
                var not_c = [ "unary-prefix", "!", c ];
                switch (c[0]) {
                    case "unary-prefix":
                        return c[1] == "!" && boolean_expr(c[2]) ? c[2] : not_c;
                    case "seq":
                        c = slice(c);
                        c[c.length - 1] = negate(c[c.length - 1]);
                        return c;
                    case "conditional":
                        return best_of(not_c, [ "conditional", c[1], negate(c[2]), negate(c[3]) ]);
                    case "binary":
                        var op = c[1], left = c[2], right = c[3];
                        if (!options.keep_comps) switch (op) {
                            case "<="  : return [ "binary", ">", left, right ];
                            case "<"   : return [ "binary", ">=", left, right ];
                            case ">="  : return [ "binary", "<", left, right ];
                            case ">"   : return [ "binary", "<=", left, right ];
                        }
                        switch (op) {
                            case "=="  : return [ "binary", "!=", left, right ];
                            case "!="  : return [ "binary", "==", left, right ];
                            case "===" : return [ "binary", "!==", left, right ];
                            case "!==" : return [ "binary", "===", left, right ];
                            case "&&"  : return best_of(not_c, [ "binary", "||", negate(left), negate(right) ]);
                            case "||"  : return best_of(not_c, [ "binary", "&&", negate(left), negate(right) ]);
                        }
                        break;
                }
                return not_c;
        };

        function make_conditional(c, t, e) {
                var make_real_conditional = function() {
                        if (c[0] == "unary-prefix" && c[1] == "!") {
                                return e ? [ "conditional", c[2], e, t ] : [ "binary", "||", c[2], t ];
                        } else {
                                return e ? best_of(
                                        [ "conditional", c, t, e ],
                                        [ "conditional", negate(c), e, t ]
                                ) : [ "binary", "&&", c, t ];
                        }
                };
                // shortcut the conditional if the expression has a constant value
                return when_constant(c, function(ast, val){
                        warn_unreachable(val ? e : t);
                        return          (val ? t : e);
                }, make_real_conditional);
        };

        function rmblock(block) {
                if (block != null && block[0] == "block" && block[1]) {
                        if (block[1].length == 1)
                                block = block[1][0];
                        else if (block[1].length == 0)
                                block = [ "block" ];
                }
                return block;
        };

        function _lambda(name, args, body) {
                return [ this[0], name, args, tighten(body, "lambda") ];
        };

        // this function does a few things:
        // 1. discard useless blocks
        // 2. join consecutive var declarations
        // 3. remove obviously dead code
        // 4. transform consecutive statements using the comma operator
        // 5. if block_type == "lambda" and it detects constructs like if(foo) return ... - rewrite like if (!foo) { ... }
        function tighten(statements, block_type) {
                statements = MAP(statements, walk);

                statements = statements.reduce(function(a, stat){
                        if (stat[0] == "block") {
                                if (stat[1]) {
                                        a.push.apply(a, stat[1]);
                                }
                        } else {
                                a.push(stat);
                        }
                        return a;
                }, []);

                statements = (function(a, prev){
                        statements.forEach(function(cur){
                                if (prev && ((cur[0] == "var" && prev[0] == "var") ||
                                             (cur[0] == "const" && prev[0] == "const"))) {
                                        prev[1] = prev[1].concat(cur[1]);
                                } else {
                                        a.push(cur);
                                        prev = cur;
                                }
                        });
                        return a;
                })([]);

                if (options.dead_code) statements = (function(a, has_quit){
                        statements.forEach(function(st){
                                if (has_quit) {
                                        if (st[0] == "function" || st[0] == "defun") {
                                                a.push(st);
                                        }
                                        else if (st[0] == "var" || st[0] == "const") {
                                                if (!options.no_warnings)
                                                        warn("Variables declared in unreachable code");
                                                st[1] = MAP(st[1], function(def){
                                                        if (def[1] && !options.no_warnings)
                                                                warn_unreachable([ "assign", true, [ "name", def[0] ], def[1] ]);
                                                        return [ def[0] ];
                                                });
                                                a.push(st);
                                        }
                                        else if (!options.no_warnings)
                                                warn_unreachable(st);
                                }
                                else {
                                        a.push(st);
                                        if (member(st[0], [ "return", "throw", "break", "continue" ]))
                                                has_quit = true;
                                }
                        });
                        return a;
                })([]);

                if (options.make_seqs) statements = (function(a, prev) {
                        statements.forEach(function(cur){
                                if (prev && prev[0] == "stat" && cur[0] == "stat") {
                                        prev[1] = [ "seq", prev[1], cur[1] ];
                                } else {
                                        a.push(cur);
                                        prev = cur;
                                }
                        });
                        if (a.length >= 2
                            && a[a.length-2][0] == "stat"
                            && (a[a.length-1][0] == "return" || a[a.length-1][0] == "throw")
                            && a[a.length-1][1])
                        {
                                a.splice(a.length - 2, 2,
                                         [ a[a.length-1][0],
                                           [ "seq", a[a.length-2][1], a[a.length-1][1] ]]);
                        }
                        return a;
                })([]);

                // this increases jQuery by 1K.  Probably not such a good idea after all..
                // part of this is done in prepare_ifs anyway.
                // if (block_type == "lambda") statements = (function(i, a, stat){
                //         while (i < statements.length) {
                //                 stat = statements[i++];
                //                 if (stat[0] == "if" && !stat[3]) {
                //                         if (stat[2][0] == "return" && stat[2][1] == null) {
                //                                 a.push(make_if(negate(stat[1]), [ "block", statements.slice(i) ]));
                //                                 break;
                //                         }
                //                         var last = last_stat(stat[2]);
                //                         if (last[0] == "return" && last[1] == null) {
                //                                 a.push(make_if(stat[1], [ "block", stat[2][1].slice(0, -1) ], [ "block", statements.slice(i) ]));
                //                                 break;
                //                         }
                //                 }
                //                 a.push(stat);
                //         }
                //         return a;
                // })(0, []);

                return statements;
        };

        function make_if(c, t, e) {
                return when_constant(c, function(ast, val){
                        if (val) {
                                t = walk(t);
                                warn_unreachable(e);
                                return t || [ "block" ];
                        } else {
                                e = walk(e);
                                warn_unreachable(t);
                                return e || [ "block" ];
                        }
                }, function() {
                        return make_real_if(c, t, e);
                });
        };

        function abort_else(c, t, e) {
                var ret = [ [ "if", negate(c), e ] ];
                if (t[0] == "block") {
                        if (t[1]) ret = ret.concat(t[1]);
                } else {
                        ret.push(t);
                }
                return walk([ "block", ret ]);
        };

        function make_real_if(c, t, e) {
                c = walk(c);
                t = walk(t);
                e = walk(e);

                if (empty(t)) {
                        c = negate(c);
                        t = e;
                        e = null;
                } else if (empty(e)) {
                        e = null;
                } else {
                        // if we have both else and then, maybe it makes sense to switch them?
                        (function(){
                                var a = gen_code(c);
                                var n = negate(c);
                                var b = gen_code(n);
                                if (b.length < a.length) {
                                        var tmp = t;
                                        t = e;
                                        e = tmp;
                                        c = n;
                                }
                        })();
                }
                if (empty(e) && empty(t))
                        return [ "stat", c ];
                var ret = [ "if", c, t, e ];
                if (t[0] == "if" && empty(t[3]) && empty(e)) {
                        ret = best_of(ret, walk([ "if", [ "binary", "&&", c, t[1] ], t[2] ]));
                }
                else if (t[0] == "stat") {
                        if (e) {
                                if (e[0] == "stat")
                                        ret = best_of(ret, [ "stat", make_conditional(c, t[1], e[1]) ]);
                                else if (aborts(e))
                                        ret = abort_else(c, t, e);
                        }
                        else {
                                ret = best_of(ret, [ "stat", make_conditional(c, t[1]) ]);
                        }
                }
                else if (e && t[0] == e[0] && (t[0] == "return" || t[0] == "throw") && t[1] && e[1]) {
                        ret = best_of(ret, [ t[0], make_conditional(c, t[1], e[1] ) ]);
                }
                else if (e && aborts(t)) {
                        ret = [ [ "if", c, t ] ];
                        if (e[0] == "block") {
                                if (e[1]) ret = ret.concat(e[1]);
                        }
                        else {
                                ret.push(e);
                        }
                        ret = walk([ "block", ret ]);
                }
                else if (t && aborts(e)) {
                        ret = abort_else(c, t, e);
                }
                return ret;
        };

        function _do_while(cond, body) {
                return when_constant(cond, function(cond, val){
                        if (!val) {
                                warn_unreachable(body);
                                return [ "block" ];
                        } else {
                                return [ "for", null, null, null, walk(body) ];
                        }
                });
        };

        return w.with_walkers({
                "sub": function(expr, subscript) {
                        if (subscript[0] == "string") {
                                var name = subscript[1];
                                if (is_identifier(name))
                                        return [ "dot", walk(expr), name ];
                                else if (/^[1-9][0-9]*$/.test(name) || name === "0")
                                        return [ "sub", walk(expr), [ "num", parseInt(name, 10) ] ];
                        }
                },
                "if": make_if,
                "toplevel": function(body) {
                        return [ "toplevel", tighten(body) ];
                },
                "switch": function(expr, body) {
                        var last = body.length - 1;
                        return [ "switch", walk(expr), MAP(body, function(branch, i){
                                var block = tighten(branch[1]);
                                if (i == last && block.length > 0) {
                                        var node = block[block.length - 1];
                                        if (node[0] == "break" && !node[1])
                                                block.pop();
                                }
                                return [ branch[0] ? walk(branch[0]) : null, block ];
                        }) ];
                },
                "function": _lambda,
                "defun": _lambda,
                "block": function(body) {
                        if (body) return rmblock([ "block", tighten(body) ]);
                },
                "binary": function(op, left, right) {
                        return when_constant([ "binary", op, walk(left), walk(right) ], function yes(c){
                                return best_of(walk(c), this);
                        }, function no() {
                                return function(){
                                        if(op != "==" && op != "!=") return;
                                        var l = walk(left), r = walk(right);
                                        if(l && l[0] == "unary-prefix" && l[1] == "!" && l[2][0] == "num")
                                                left = ['num', +!l[2][1]];
                                        else if (r && r[0] == "unary-prefix" && r[1] == "!" && r[2][0] == "num")
                                                right = ['num', +!r[2][1]];
                                        return ["binary", op, left, right];
                                }() || this;
                        });
                },
                "conditional": function(c, t, e) {
                        return make_conditional(walk(c), walk(t), walk(e));
                },
                "try": function(t, c, f) {
                        return [
                                "try",
                                tighten(t),
                                c != null ? [ c[0], tighten(c[1]) ] : null,
                                f != null ? tighten(f) : null
                        ];
                },
                "unary-prefix": function(op, expr) {
                        expr = walk(expr);
                        var ret = [ "unary-prefix", op, expr ];
                        if (op == "!")
                                ret = best_of(ret, negate(expr));
                        return when_constant(ret, function(ast, val){
                                return walk(ast); // it's either true or false, so minifies to !0 or !1
                        }, function() { return ret });
                },
                "name": function(name) {
                        switch (name) {
                            case "true": return [ "unary-prefix", "!", [ "num", 0 ]];
                            case "false": return [ "unary-prefix", "!", [ "num", 1 ]];
                        }
                },
                "while": _do_while,
                "assign": function(op, lvalue, rvalue) {
                        lvalue = walk(lvalue);
                        rvalue = walk(rvalue);
                        var okOps = [ '+', '-', '/', '*', '%', '>>', '<<', '>>>', '|', '^', '&' ];
                        if (op === true && lvalue[0] === "name" && rvalue[0] === "binary" &&
                            ~okOps.indexOf(rvalue[1]) && rvalue[2][0] === "name" &&
                            rvalue[2][1] === lvalue[1]) {
                                return [ this[0], rvalue[1], lvalue, rvalue[3] ]
                        }
                        return [ this[0], op, lvalue, rvalue ];
                }
        }, function() {
                for (var i = 0; i < 2; ++i) {
                        ast = prepare_ifs(ast);
                        ast = walk(ast);
                }
                return ast;
        });
};

/* -----[ re-generate code from the AST ]----- */

var DOT_CALL_NO_PARENS = jsp.array_to_hash([
        "name",
        "array",
        "object",
        "string",
        "dot",
        "sub",
        "call",
        "regexp",
        "defun"
]);

function make_string(str, ascii_only) {
        var dq = 0, sq = 0;
        str = str.replace(/[\\\b\f\n\r\t\x22\x27\u2028\u2029\0]/g, function(s){
                switch (s) {
                    case "\\": return "\\\\";
                    case "\b": return "\\b";
                    case "\f": return "\\f";
                    case "\n": return "\\n";
                    case "\r": return "\\r";
                    case "\t": return "\\t";
                    case "\u2028": return "\\u2028";
                    case "\u2029": return "\\u2029";
                    case '"': ++dq; return '"';
                    case "'": ++sq; return "'";
                    case "\0": return "\\0";
                }
                return s;
        });
        if (ascii_only) str = to_ascii(str);
        if (dq > sq) return "'" + str.replace(/\x27/g, "\\'") + "'";
        else return '"' + str.replace(/\x22/g, '\\"') + '"';
};

function to_ascii(str) {
        return str.replace(/[\u0080-\uffff]/g, function(ch) {
                var code = ch.charCodeAt(0).toString(16);
                while (code.length < 4) code = "0" + code;
                return "\\u" + code;
        });
};

var SPLICE_NEEDS_BRACKETS = jsp.array_to_hash([ "if", "while", "do", "for", "for-in", "with" ]);

function gen_code(ast, options) {
        options = defaults(options, {
                indent_start : 0,
                indent_level : 4,
                quote_keys   : false,
                space_colon  : false,
                beautify     : false,
                ascii_only   : false,
                inline_script: false
        });
        var beautify = !!options.beautify;
        var indentation = 0,
            newline = beautify ? "\n" : "",
            space = beautify ? " " : "";

        function encode_string(str) {
                var ret = make_string(str, options.ascii_only);
                if (options.inline_script)
                        ret = ret.replace(/<\x2fscript([>\/\t\n\f\r ])/gi, "<\\/script../vendors/process.js");
                return ret;
        };

        function make_name(name) {
                name = name.toString();
                if (options.ascii_only)
                        name = to_ascii(name);
                return name;
        };

        function indent(line) {
                if (line == null)
                        line = "";
                if (beautify)
                        line = repeat_string(" ", options.indent_start + indentation * options.indent_level) + line;
                return line;
        };

        function with_indent(cont, incr) {
                if (incr == null) incr = 1;
                indentation += incr;
                try { return cont.apply(null, slice(arguments, 1)); }
                finally { indentation -= incr; }
        };

        function add_spaces(a) {
                if (beautify)
                        return a.join(" ");
                var b = [];
                for (var i = 0; i < a.length; ++i) {
                        var next = a[i + 1];
                        b.push(a[i]);
                        if (next &&
                            ((/[a-z0-9_\x24]$/i.test(a[i].toString()) && /^[a-z0-9_\x24]/i.test(next.toString())) ||
                             (/[\+\-]$/.test(a[i].toString()) && /^[\+\-]/.test(next.toString())))) {
                                b.push(" ");
                        }
                }
                return b.join("");
        };

        function add_commas(a) {
                return a.join("," + space);
        };

        function parenthesize(expr) {
                var gen = make(expr);
                for (var i = 1; i < arguments.length; ++i) {
                        var el = arguments[i];
                        if ((el instanceof Function && el(expr)) || expr[0] == el)
                                return "(" + gen + ")";
                }
                return gen;
        };

        function best_of(a) {
                if (a.length == 1) {
                        return a[0];
                }
                if (a.length == 2) {
                        var b = a[1];
                        a = a[0];
                        return a.length <= b.length ? a : b;
                }
                return best_of([ a[0], best_of(a.slice(1)) ]);
        };

        function needs_parens(expr) {
                if (expr[0] == "function" || expr[0] == "object") {
                        // dot/call on a literal function requires the
                        // function literal itself to be parenthesized
                        // only if it's the first "thing" in a
                        // statement.  This means that the parent is
                        // "stat", but it could also be a "seq" and
                        // we're the first in this "seq" and the
                        // parent is "stat", and so on.  Messy stuff,
                        // but it worths the trouble.
                        var a = slice(w.stack()), self = a.pop(), p = a.pop();
                        while (p) {
                                if (p[0] == "stat") return true;
                                if (((p[0] == "seq" || p[0] == "call" || p[0] == "dot" || p[0] == "sub" || p[0] == "conditional") && p[1] === self) ||
                                    ((p[0] == "binary" || p[0] == "assign" || p[0] == "unary-postfix") && p[2] === self)) {
                                        self = p;
                                        p = a.pop();
                                } else {
                                        return false;
                                }
                        }
                }
                return !HOP(DOT_CALL_NO_PARENS, expr[0]);
        };

        function make_num(num) {
                var str = num.toString(10), a = [ str.replace(/^0\./, ".") ], m;
                if (Math.floor(num) === num) {
                        if (num >= 0) {
                                a.push("0x" + num.toString(16).toLowerCase(), // probably pointless
                                       "0" + num.toString(8)); // same.
                        } else {
                                a.push("-0x" + (-num).toString(16).toLowerCase(), // probably pointless
                                       "-0" + (-num).toString(8)); // same.
                        }
                        if ((m = /^(.*?)(0+)$/.exec(num))) {
                                a.push(m[1] + "e" + m[2].length);
                        }
                } else if ((m = /^0?\.(0+)(.*)$/.exec(num))) {
                        a.push(m[2] + "e-" + (m[1].length + m[2].length),
                               str.substr(str.indexOf(".")));
                }
                return best_of(a);
        };

        var w = ast_walker();
        var make = w.walk;
        return w.with_walkers({
                "string": encode_string,
                "num": make_num,
                "name": make_name,
                "debugger": function(){ return "debugger" },
                "toplevel": function(statements) {
                        return make_block_statements(statements)
                                .join(newline + newline);
                },
                "splice": function(statements) {
                        var parent = w.parent();
                        if (HOP(SPLICE_NEEDS_BRACKETS, parent)) {
                                // we need block brackets in this case
                                return make_block.apply(this, arguments);
                        } else {
                                return MAP(make_block_statements(statements, true),
                                           function(line, i) {
                                                   // the first line is already indented
                                                   return i > 0 ? indent(line) : line;
                                           }).join(newline);
                        }
                },
                "block": make_block,
                "var": function(defs) {
                        return "var " + add_commas(MAP(defs, make_1vardef)) + ";";
                },
                "const": function(defs) {
                        return "const " + add_commas(MAP(defs, make_1vardef)) + ";";
                },
                "try": function(tr, ca, fi) {
                        var out = [ "try", make_block(tr) ];
                        if (ca) out.push("catch", "(" + ca[0] + ")", make_block(ca[1]));
                        if (fi) out.push("finally", make_block(fi));
                        return add_spaces(out);
                },
                "throw": function(expr) {
                        return add_spaces([ "throw", make(expr) ]) + ";";
                },
                "new": function(ctor, args) {
                        args = args.length > 0 ? "(" + add_commas(MAP(args, function(expr){
                                return parenthesize(expr, "seq");
                        })) + ")" : "";
                        return add_spaces([ "new", parenthesize(ctor, "seq", "binary", "conditional", "assign", function(expr){
                                var w = ast_walker(), has_call = {};
                                try {
                                        w.with_walkers({
                                                "call": function() { throw has_call },
                                                "function": function() { return this }
                                        }, function(){
                                                w.walk(expr);
                                        });
                                } catch(ex) {
                                        if (ex === has_call)
                                                return true;
                                        throw ex;
                                }
                        }) + args ]);
                },
                "switch": function(expr, body) {
                        return add_spaces([ "switch", "(" + make(expr) + ")", make_switch_block(body) ]);
                },
                "break": function(label) {
                        var out = "break";
                        if (label != null)
                                out += " " + make_name(label);
                        return out + ";";
                },
                "continue": function(label) {
                        var out = "continue";
                        if (label != null)
                                out += " " + make_name(label);
                        return out + ";";
                },
                "conditional": function(co, th, el) {
                        return add_spaces([ parenthesize(co, "assign", "seq", "conditional"), "?",
                                            parenthesize(th, "seq"), ":",
                                            parenthesize(el, "seq") ]);
                },
                "assign": function(op, lvalue, rvalue) {
                        if (op && op !== true) op += "=";
                        else op = "=";
                        return add_spaces([ make(lvalue), op, parenthesize(rvalue, "seq") ]);
                },
                "dot": function(expr) {
                        var out = make(expr), i = 1;
                        if (expr[0] == "num") {
                                if (!/\./.test(expr[1]))
                                        out += ".";
                        } else if (needs_parens(expr))
                                out = "(" + out + ")";
                        while (i < arguments.length)
                                out += "." + make_name(arguments[i++]);
                        return out;
                },
                "call": function(func, args) {
                        var f = make(func);
                        if (f.charAt(0) != "(" && needs_parens(func))
                                f = "(" + f + ")";
                        return f + "(" + add_commas(MAP(args, function(expr){
                                return parenthesize(expr, "seq");
                        })) + ")";
                },
                "function": make_function,
                "defun": make_function,
                "if": function(co, th, el) {
                        var out = [ "if", "(" + make(co) + ")", el ? make_then(th) : make(th) ];
                        if (el) {
                                out.push("else", make(el));
                        }
                        return add_spaces(out);
                },
                "for": function(init, cond, step, block) {
                        var out = [ "for" ];
                        init = (init != null ? make(init) : "").replace(/;*\s*$/, ";" + space);
                        cond = (cond != null ? make(cond) : "").replace(/;*\s*$/, ";" + space);
                        step = (step != null ? make(step) : "").replace(/;*\s*$/, "");
                        var args = init + cond + step;
                        if (args == "; ; ") args = ";;";
                        out.push("(" + args + ")", make(block));
                        return add_spaces(out);
                },
                "for-in": function(vvar, key, hash, block) {
                        return add_spaces([ "for", "(" +
                                            (vvar ? make(vvar).replace(/;+$/, "") : make(key)),
                                            "in",
                                            make(hash) + ")", make(block) ]);
                },
                "while": function(condition, block) {
                        return add_spaces([ "while", "(" + make(condition) + ")", make(block) ]);
                },
                "do": function(condition, block) {
                        return add_spaces([ "do", make(block), "while", "(" + make(condition) + ")" ]) + ";";
                },
                "return": function(expr) {
                        var out = [ "return" ];
                        if (expr != null) out.push(make(expr));
                        return add_spaces(out) + ";";
                },
                "binary": function(operator, lvalue, rvalue) {
                        var left = make(lvalue), right = make(rvalue);
                        // XXX: I'm pretty sure other cases will bite here.
                        //      we need to be smarter.
                        //      adding parens all the time is the safest bet.
                        if (member(lvalue[0], [ "assign", "conditional", "seq" ]) ||
                            lvalue[0] == "binary" && PRECEDENCE[operator] > PRECEDENCE[lvalue[1]] ||
                            lvalue[0] == "function" && needs_parens(this)) {
                                left = "(" + left + ")";
                        }
                        if (member(rvalue[0], [ "assign", "conditional", "seq" ]) ||
                            rvalue[0] == "binary" && PRECEDENCE[operator] >= PRECEDENCE[rvalue[1]] &&
                            !(rvalue[1] == operator && member(operator, [ "&&", "||", "*" ]))) {
                                right = "(" + right + ")";
                        }
                        else if (!beautify && options.inline_script && (operator == "<" || operator == "<<")
                                 && rvalue[0] == "regexp" && /^script/i.test(rvalue[1])) {
                                right = " " + right;
                        }
                        return add_spaces([ left, operator, right ]);
                },
                "unary-prefix": function(operator, expr) {
                        var val = make(expr);
                        if (!(expr[0] == "num" || (expr[0] == "unary-prefix" && !HOP(OPERATORS, operator + expr[1])) || !needs_parens(expr)))
                                val = "(" + val + ")";
                        return operator + (jsp.is_alphanumeric_char(operator.charAt(0)) ? " " : "") + val;
                },
                "unary-postfix": function(operator, expr) {
                        var val = make(expr);
                        if (!(expr[0] == "num" || (expr[0] == "unary-postfix" && !HOP(OPERATORS, operator + expr[1])) || !needs_parens(expr)))
                                val = "(" + val + ")";
                        return val + operator;
                },
                "sub": function(expr, subscript) {
                        var hash = make(expr);
                        if (needs_parens(expr))
                                hash = "(" + hash + ")";
                        return hash + "[" + make(subscript) + "]";
                },
                "object": function(props) {
                        var obj_needs_parens = needs_parens(this);
                        if (props.length == 0)
                                return obj_needs_parens ? "({})" : "{}";
                        var out = "{" + newline + with_indent(function(){
                                return MAP(props, function(p){
                                        if (p.length == 3) {
                                                // getter/setter.  The name is in p[0], the arg.list in p[1][2], the
                                                // body in p[1][3] and type ("get" / "set") in p[2].
                                                return indent(make_function(p[0], p[1][2], p[1][3], p[2]));
                                        }
                                        var key = p[0], val = parenthesize(p[1], "seq");
                                        if (options.quote_keys) {
                                                key = encode_string(key);
                                        } else if ((typeof key == "number" || !beautify && +key + "" == key)
                                                   && parseFloat(key) >= 0) {
                                                key = make_num(+key);
                                        } else if (!is_identifier(key)) {
                                                key = encode_string(key);
                                        }
                                        return indent(add_spaces(beautify && options.space_colon
                                                                 ? [ key, ":", val ]
                                                                 : [ key + ":", val ]));
                                }).join("," + newline);
                        }) + newline + indent("}");
                        return obj_needs_parens ? "(" + out + ")" : out;
                },
                "regexp": function(rx, mods) {
                        return "/" + rx + "/" + mods;
                },
                "array": function(elements) {
                        if (elements.length == 0) return "[]";
                        return add_spaces([ "[", add_commas(MAP(elements, function(el, i){
                                if (!beautify && el[0] == "atom" && el[1] == "undefined") return i === elements.length - 1 ? "," : "";
                                return parenthesize(el, "seq");
                        })), "]" ]);
                },
                "stat": function(stmt) {
                        return make(stmt).replace(/;*\s*$/, ";");
                },
                "seq": function() {
                        return add_commas(MAP(slice(arguments), make));
                },
                "label": function(name, block) {
                        return add_spaces([ make_name(name), ":", make(block) ]);
                },
                "with": function(expr, block) {
                        return add_spaces([ "with", "(" + make(expr) + ")", make(block) ]);
                },
                "atom": function(name) {
                        return make_name(name);
                }
        }, function(){ return make(ast) });

        // The squeezer replaces "block"-s that contain only a single
        // statement with the statement itself; technically, the AST
        // is correct, but this can create problems when we output an
        // IF having an ELSE clause where the THEN clause ends in an
        // IF *without* an ELSE block (then the outer ELSE would refer
        // to the inner IF).  This function checks for this case and
        // adds the block brackets if needed.
        function make_then(th) {
                if (th == null) return ";";
                if (th[0] == "do") {
                        // https://github.com/mishoo/UglifyJS/issues/#issue/57
                        // IE croaks with "syntax error" on code like this:
                        //     if (foo) do ... while(cond); else ...
                        // we need block brackets around do/while
                        return make_block([ th ]);
                }
                var b = th;
                while (true) {
                        var type = b[0];
                        if (type == "if") {
                                if (!b[3])
                                        // no else, we must add the block
                                        return make([ "block", [ th ]]);
                                b = b[3];
                        }
                        else if (type == "while" || type == "do") b = b[2];
                        else if (type == "for" || type == "for-in") b = b[4];
                        else break;
                }
                return make(th);
        };

        function make_function(name, args, body, keyword) {
                var out = keyword || "function";
                if (name) {
                        out += " " + make_name(name);
                }
                out += "(" + add_commas(MAP(args, make_name)) + ")";
                out = add_spaces([ out, make_block(body) ]);
                return needs_parens(this) ? "(" + out + ")" : out;
        };

        function must_has_semicolon(node) {
                switch (node[0]) {
                    case "with":
                    case "while":
                        return empty(node[2]); // `with' or `while' with empty body?
                    case "for":
                    case "for-in":
                        return empty(node[4]); // `for' with empty body?
                    case "if":
                        if (empty(node[2]) && !node[3]) return true; // `if' with empty `then' and no `else'
                        if (node[3]) {
                                if (empty(node[3])) return true; // `else' present but empty
                                return must_has_semicolon(node[3]); // dive into the `else' branch
                        }
                        return must_has_semicolon(node[2]); // dive into the `then' branch
                }
        };

        function make_block_statements(statements, noindent) {
                for (var a = [], last = statements.length - 1, i = 0; i <= last; ++i) {
                        var stat = statements[i];
                        var code = make(stat);
                        if (code != ";") {
                                if (!beautify && i == last && !must_has_semicolon(stat)) {
                                        code = code.replace(/;+\s*$/, "");
                                }
                                a.push(code);
                        }
                }
                return noindent ? a : MAP(a, indent);
        };

        function make_switch_block(body) {
                var n = body.length;
                if (n == 0) return "{}";
                return "{" + newline + MAP(body, function(branch, i){
                        var has_body = branch[1].length > 0, code = with_indent(function(){
                                return indent(branch[0]
                                              ? add_spaces([ "case", make(branch[0]) + ":" ])
                                              : "default:");
                        }, 0.5) + (has_body ? newline + with_indent(function(){
                                return make_block_statements(branch[1]).join(newline);
                        }) : "");
                        if (!beautify && has_body && i < n - 1)
                                code += ";";
                        return code;
                }).join(newline) + newline + indent("}");
        };

        function make_block(statements) {
                if (!statements) return ";";
                if (statements.length == 0) return "{}";
                return "{" + newline + with_indent(function(){
                        return make_block_statements(statements).join(newline);
                }) + newline + indent("}");
        };

        function make_1vardef(def) {
                var name = def[0], val = def[1];
                if (val != null)
                        name = add_spaces([ make_name(name), "=", parenthesize(val, "seq") ]);
                return name;
        };

};

function split_lines(code, max_line_length) {
        var splits = [ 0 ];
        jsp.parse(function(){
                var next_token = jsp.tokenizer(code);
                var last_split = 0;
                var prev_token;
                function current_length(tok) {
                        return tok.pos - last_split;
                };
                function split_here(tok) {
                        last_split = tok.pos;
                        splits.push(last_split);
                };
                function custom(){
                        var tok = next_token.apply(this, arguments);
                        out: {
                                if (prev_token) {
                                        if (prev_token.type == "keyword") break out;
                                }
                                if (current_length(tok) > max_line_length) {
                                        switch (tok.type) {
                                            case "keyword":
                                            case "atom":
                                            case "name":
                                            case "punc":
                                                split_here(tok);
                                                break out;
                                        }
                                }
                        }
                        prev_token = tok;
                        return tok;
                };
                custom.context = function() {
                        return next_token.context.apply(this, arguments);
                };
                return custom;
        }());
        return splits.map(function(pos, i){
                return code.substring(pos, splits[i + 1] || code.length);
        }).join("\n");
};

/* -----[ Utilities ]----- */

function repeat_string(str, i) {
        if (i <= 0) return "";
        if (i == 1) return str;
        var d = repeat_string(str, i >> 1);
        d += d;
        if (i & 1) d += str;
        return d;
};

function defaults(args, defs) {
        var ret = {};
        if (args === true)
                args = {};
        for (var i in defs) if (HOP(defs, i)) {
                ret[i] = (args && HOP(args, i)) ? args[i] : defs[i];
        }
        return ret;
};

function is_identifier(name) {
        return /^[a-z_$][a-z0-9_$]*$/i.test(name)
                && name != "this"
                && !HOP(jsp.KEYWORDS_ATOM, name)
                && !HOP(jsp.RESERVED_WORDS, name)
                && !HOP(jsp.KEYWORDS, name);
};

function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
};

// some utilities

var MAP;

(function(){
        MAP = function(a, f, o) {
                var ret = [], top = [], i;
                function doit() {
                        var val = f.call(o, a[i], i);
                        if (val instanceof AtTop) {
                                val = val.v;
                                if (val instanceof Splice) {
                                        top.push.apply(top, val.v);
                                } else {
                                        top.push(val);
                                }
                        }
                        else if (val != skip) {
                                if (val instanceof Splice) {
                                        ret.push.apply(ret, val.v);
                                } else {
                                        ret.push(val);
                                }
                        }
                };
                if (a instanceof Array) for (i = 0; i < a.length; ++i) doit();
                else for (i in a) if (HOP(a, i)) doit();
                return top.concat(ret);
        };
        MAP.at_top = function(val) { return new AtTop(val) };
        MAP.splice = function(val) { return new Splice(val) };
        var skip = MAP.skip = {};
        function AtTop(val) { this.v = val };
        function Splice(val) { this.v = val };
})();

/* -----[ Exports ]----- */

exports.ast_walker = ast_walker;
exports.ast_mangle = ast_mangle;
exports.ast_squeeze = ast_squeeze;
exports.ast_lift_variables = ast_lift_variables;
exports.gen_code = gen_code;
exports.ast_add_scope = ast_add_scope;
exports.set_logger = function(logger) { warn = logger };
exports.make_string = make_string;
exports.split_lines = split_lines;
exports.MAP = MAP;

// keep this last!
exports.ast_squeeze_more = require("./squeeze-more").ast_squeeze_more;

return exports;
}(mock_require));

mock_modules["uglify-js"] = {
    parser: mock_modules["./parse-js"],
    uglify: mock_modules["./process"]
};

(function (require, exports) {
/**
 * This code was originally made by Fabio Crisci and distributed under MIT licence
 *
 * Copyright (c) 2012 Fabio Crisci <fabio.crisci@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var parser = require("uglify-js").parser;
var uglify = require("uglify-js").uglify;

function generateCode (tree) {
	return uglify.gen_code(tree, {beautify : true});
};

/**
 * This is the main function of this module (it's the only one exported)
 * Given a file path and content returns the instrumented file
 * It won't instrument files that are already instrumented
 *
 * options allow to enable/disable coverage metrics
 *    "function" enable function coverage
 *    "condition" enable condition coverage
 */
exports.interpret = function (moduleName, file, content, lineOffset, options) {
	options = options || {
		"function" : true,
		"condition" : true
	};

	try {
		var tree = parser.parse(content, false, true);
	} catch (e) {
		return {
            error: "Error instrumentig file " + file + " " + e.message
        }
	}

	var walker = uglify.ast_walker();
	// this is the list of nodes being analyzed by the walker
	// without this, w.walk(this) would re-enter the newly generated code with infinite recursion
	var analyzing = [];
	// list of all lines' id encounterd in this file
	var lines = [];
	// list of all conditions' id encounterd in this file
	var allConditions = [];
	// list of all functions' id encounterd in this file
	var allFunctions = [];
	// anonymous function takes the name of their var definition
	var candidateFunctionName = null;

    var isFirstFunction = true,
        isFirstLine = true;

	/**
	 * A statement was found in the file, remember its id.
	 */
	function rememberStatement (id) {
		lines.push(id);
	};

	/**
	 * A function was found in the file, remember its id.
	 */
	function rememberFunction (id) {
		allFunctions.push(id);
	};

	/**
	 * Generic function for counting a line.
	 * It generates a lineId from the line number and the block name (in minified files there
	 * are more logical lines on the same file line) and adds a function call before the actual
	 * line of code.
	 *
	 * 'this' is any node in the AST
	 */
	function countLine() {
		var ret;
        // skip first line
        if (isFirstLine) {
            isFirstLine = false;
            return ret;
        }
		if (this[0].start && analyzing.indexOf(this) < 0) {
			giveNameToAnonymousFunction.call(this);
			var lineId = this[0].start.line + lineOffset + ''; //this[0].name + ':' + this[0].start.line + ":" + this[0].start.pos;
			rememberStatement(lineId);

			analyzing.push(this);
			ret = [ "splice",
				[
					[ "stat",
						[ "call",
                            ["dot", ["name", "require"], "coverage_line"],
							[
								[ "string", moduleName],
								[ "string", lineId]
							]
						]
					],
					walker.walk(this)
				]
			];
			analyzing.pop(this);
		}
		return ret;
	};

	/**
	 * Walker for 'if' nodes. It overrides countLine because we want to instrument conditions.
	 *
	 * 'this' is an if node, so
	 *    'this[0]' is the node descriptor
	 *    'this[1]' is the decision block
	 *    'this[2]' is the 'then' code block
	 *    'this[3]' is the 'else' code block
	 *
	 * Note that if/else if/else in AST are represented as nested if/else
	 */
	function countIf() {
		var self = this, ret;
		if (self[0].start && analyzing.indexOf(self) < 0) {
			var decision = self[1];
			var lineId = self[0].name + ':' + (self[0].start.line + lineOffset);

			self[1] = wrapCondition(decision, lineId);

			// We are adding new lines, make sure code blocks are actual blocks
			if (self[2] && self[2][0].start && self[2][0].start.value != "{") {
				self[2] = [ "block", [self[2]]];
			}

			if (self[3] && self[3][0].start && self[3][0].start.value != "{") {
				self[3] = [ "block", [self[3]]];
			}
		}

		ret = countLine.call(self);

		if (decision) {
			analyzing.pop(decision);
		}

		return ret;
	};

	/**
	 * This is the key function for condition coverage as it wraps every condition in
	 * a function call.
	 * The condition id is generated fron the lineId (@see countLine) plus the character
	 * position of the condition.
	 */
	function wrapCondition(decision, lineId, parentPos) {
		if (options.condition === false) {
			// condition coverage is disabled
			return decision;
		}

		if (isSingleCondition(decision)) {
			var pos = getPositionStart(decision, parentPos);
			var condId = lineId + ":" + pos;

			analyzing.push(decision);
			allConditions.push(condId);
			return ["call",
                ["dot", ["name", "require"], "coverage_condition"],
				[
					[ "string", moduleName ],
					[ "string", condId],
					decision
				]
			];
		} else {
			decision[2] = wrapCondition(decision[2], lineId, getPositionStart(decision, parentPos));
			decision[3] = wrapCondition(decision[3], lineId, getPositionEnd(decision, parentPos));

			return decision;
		}
	};

	/**
	 * Wheter or not the if decision has only one boolean condition
	 */
	function isSingleCondition(decision) {
		if (decision[0].start && decision[0].name != "binary") {
			return true;
		} else if (decision[1] == "&&" || decision[1] == "||") {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * Get the start position of a given condition, if it has a start it's a true condition
	 * so get the value, otherwise use a default value that is coming from an upper decision
	 */
	function getPositionStart (decision, defaultValue) {
		if (decision[0].start) {
			return decision[0].start.pos;
		} else {
			return defaultValue || "s";
		}
	};

	/**
	 * As for getPositionStart but returns end position. It allows to give different ids to
	 * math and binary operations in multiple conditions ifs.
	 */
	function getPositionEnd (decision, defaultValue) {
		if (decision[0].end) {
			return decision[0].end.pos;
		} else {
			return defaultValue || "e";
		}
	};

	/**
	 * Generic function for every node that needs to be wrapped in a block.
	 * For instance, the following code
	 *
	 *    for (a in b) doSomething(a)
	 *
	 * once converted in AST does not have a block but only a function call.
	 * Instrumentig this code would return
	 *
	 *    for (a in b) instrumentation()
	 *    doSomething(a)
	 *
	 * which clearly does not have the same behavior as the non instrumented code.
	 *
	 * This function generates a function that can be used by the walker to add
	 * blocks when they are missing depending on where the block is supposed to be
	 */
	function wrapBlock(position) {
		return function countFor() {
			var self = this;

			if (self[0].start && analyzing.indexOf(self) < 0) {
				if (self[0].start && analyzing.indexOf(self) < 0) {
					if (self[position] && self[position][0].name != "block") {
						self[position] = [ "block", [self[position]]];
					}
				}
			}

			return countLine.call(self);
		};
	};

	/**
	 * Label nodes need special treatment as well.
	 *
	 *    myLabel : for (;;) {
	 *	     //whateveer code here
	 *       continue myLabel
	 *    }
	 *
	 * Label can be wrapped by countLine, hovewer the subsequent for shouldn't be wrapped.
	 *
	 *    instrumentation("label");
	 *    mylabel : instrumentation("for")
	 *       for (;;) {}
	 *
	 * The above code would be wrong.
	 *
	 * This function makes sure that the 'for' after a label is not instrumented and that
	 * the 'for' content is wrapped in a block.
	 *
	 * I'm don't think it's reasonable to use labels with something that is not a 'for' block.
	 * In that case the instrumented code might easily break.
	 */
	function countLabel() {
		var ret;
		if (this[0].start && analyzing.indexOf(this) < 0) {
			var content = this[2];

			if (content[0].name == "for" && content[4] && content[4].name != "block") {
				content[4] = [ "block", [content[4]]];
			}
			analyzing.push(content);

			var ret = countLine.call(this);

			analyzing.pop(content);
		}
		return ret;
	};

	/**
	 * Instrumenting function strictly needed for statement coverage only in case of 'defun'
	 * (function definition), however the block 'function' does not correspond to a new statement.
	 * This method allows to track every function call (function coverage).
	 *
	 * As far as I can tell, 'function' is different from 'defun' for the fact that 'defun'
	 * refers to the global definition of a function
	 *    function something () {}    -> defun
	 *    something = function () {}  -> function
	 * 'function' doesn't need to be counted because the line is covered by 'name' or whatever
	 * other block.
	 *
	 * Strictly speaking full statement coverage does not imply function coverage only if there
	 * are empty function, which however are empty!
	 *
	 * The tracking for functions is also a bit different from countLine (except 'defun'). This
	 * method assigns every function a name and tracks the history of every call throughout the
	 * whole lifetime of the application, It's a sort of profiler.
	 *
	 *
	 * The structure of 'this' is
	 *    'this[0]' node descriptor
	 *    'this[1]' string, name of the function or null
	 *    'this[2]' array of arguments names (string)
	 *    'this[3]' block with the function's body
	 *
	 * As 'function' happens in the middle of a line, the instrumentation should be in the body.
	 */
	function countFunction () {
		var ret;
        if (isFirstLine) {
            isFirstLine = false;
            return ret;
        }
		if (this[0].start && analyzing.indexOf(this) < 0) {
			var defun = this[0].name === "defun";
			var lineId = this[0].start.line + lineOffset + ''; //this[0].name + ":" + this[0].start.line + ":" + this[0].start.pos;
			var fnName = this[1] || this[0].anonymousName || "(?)";
            var fnId = fnName + ':' + (this[0].start.line + lineOffset) + ":" + this[0].start.pos;
			var body = this[3];

			analyzing.push(this);

			// put a new function call inside the body, works also on empty functions
			if (options["function"]) {
				body.splice(0, 0, [ "stat",
					[ "call",
                        ["dot", ["name", "require"], "coverage_function"],
						[
							["string", moduleName],
							["string", fnId]
						]
					]
				]);
				// It would be great to instrument the 'exit' from a function
				// but it means tracking all return statements, maybe in the future...

				rememberFunction(fnId);
			}

			if (defun) {
				// 'defun' should also be remembered as statements
				rememberStatement(lineId);

				ret = [ "splice",
					[
						[ "stat",
							[ "call",
                                ["dot", ["name", "require"], "coverage_line"],
								[
									[ "string", moduleName],
									[ "string", lineId]
								]
							]
						],
						walker.walk(this)
					]
				];
			} else {
				ret = walker.walk(this);
			}

			analyzing.pop(this);

		}
		return ret;
	};

	/**
	 * This function tries to extract the name of anonymous functions depending on where they are
	 * defined.
	 *
	 * For instance
	 *    var something = function () {}
	 * the function itself is anonymous but we can use 'something' as its name
	 *
	 * 'node' is anything that gets counted, function are extracted from
	 *
	 * var
	 *   node[0] : node description
	 *   node[1] : array of assignments
	 *       node[x][0] : variable name
	 *       node[x][1] : value, node
	 *
	 * object  (when functions are properties of an object)
	 *   node[0] : node description
	 *   node[1] : array of attributes
	 *       node[x][0] : attribute name
	 *       node[x][1] : value, node
	 *
	 * assign  (things like object.name = function () {})
	 *   node[0] : node description
	 *   node[1] : type of assignment, 'true' if '=' or operand (like += |= and others)
	 *   node[2] : left value, object property or variable
	 *   node[3] : right value, node
	 *
	 *   in case of assign, node[2] can be
	 *      'name' if we assign to a variable
	 *          name[0] : node description
	 *          name[1] : variable's name
	 *      'dot' when we assign to an object's property
	 *          dot[0] : node description
	 *          dot[1] : container object
	 *          dot[2] : property
	 */
	function giveNameToAnonymousFunction () {
		node = this;

		if (node[0].name == "var" || node[0].name == "object") {
			node[1].forEach(function (assignemt) {
				if (assignemt[1]) {
					if (assignemt[1][0].name === "function") {
						assignemt[1][0].anonymousName = assignemt[0];
					} else if (assignemt[1][0].name === "conditional") {
						if (assignemt[1][2][0] && assignemt[1][2][0].name === "function") {
							assignemt[1][2][0].anonymousName = assignemt[0];
						}
						if (assignemt[1][3][0] && assignemt[1][3][0].name === "function") {
							assignemt[1][3][0].anonymousName = assignemt[0];
						}
					}
				}
			});
		} else if (node[0].name == "assign" && node[1] === true) {
			if (node[3][0].name === "function") {
				node[3][0].anonymousName = getNameFromAssign(node);
			} else if (node[3][0] === "conditional") {
				if (node[3][2][0] && node[3][2][0].name === "function") {
					node[3][2][0].anonymousName = getNameFromAssign(node);
				}
				if (node[3][3][0] && node[3][3][0].name === "function") {
					node[3][3][0].anonymousName = getNameFromAssign(node);
				}
			}
		}
	};

	function getNameFromAssign (node) {
		if (node[2][0].name === "name") {
			return node[2][1];
		} else if (node[2][0].name === "dot") {
			return node[2][2];
		}
	}

	/**
	 * This function wraps ternary conditionals in order to have condition coverage
	 *
	 * 'this' is a node containing
	 *    'this[0]' node descriptor
	 *    'this[1]' decision block
	 *    'this[2]' first statement
	 *    'this[3]' second statement
	 */
	function wrapConditionals () {
		if (options.condition === false) {
			// condition coverage is disabled
			return;
		}

		var self = this, ret;
		if (self[0].start && analyzing.indexOf(self) < 0) {
			analyzing.push(self);
			var lineId = self[0].name + ':' + (self[0].start.line + lineOffset);

			self[1] = wrapCondition(self[1], lineId);

			self[2] = walker.walk(self[2]);
			self[3] = walker.walk(self[3]);

			analyzing.pop(self);

			return self;
		} else if (self[1]) {
			self[1] = wrapCondition(self[1], lineId);
		}
	};

    function createAstForArray(array) {
        // ["array",[["string","1"],["string","2"]]]
        var result = [];
        for (var i = 0, c = array.length, item; i < c; i++) {
            item = array[i];
            result.push(["string", item]);
        }

        return ["array", result];
    }

    function insertRequireFallback() {
        if (this[0].start) {
            var body = this[3];

            if (isFirstFunction) {
                isFirstFunction = false;
                // var require = arguments[0];
                body.splice(0, 0, ["var",[["require",["sub",["name","arguments"],["num",0]]]]]);
            }
        }
    }

	var instrumentedTree = walker.with_walkers({
		"stat"     : countLine,
		"label"    : countLabel,
		"break"    : countLine,
		"continue" : countLine,
		"debugger" : countLine,
		"var"      : countLine,
		"const"    : countLine,
		"return"   : countLine,
		"throw"    : countLine,
		"try"      : countLine,
		"defun"    : countFunction,
		"if"       : countIf,
		"while"    : wrapBlock(2),
		"do"       : wrapBlock(2),
		"for"      : wrapBlock(4),
		"for-in"   : wrapBlock(4),
		"switch"   : countLine,
		"with"     : countLine,
		"function" : countFunction,
		"assign"   : giveNameToAnonymousFunction,
		"object"   : giveNameToAnonymousFunction,
		"conditional": wrapConditionals
	}, function () {
		return walker.walk(tree);
	});

    instrumentedTree = walker.with_walkers({
        "function" : insertRequireFallback
    }, function () {
        return walker.walk(instrumentedTree);
    });

	var code = generateCode(instrumentedTree);
	return {
        code: code.replace(/;$/, ''),
        options: {
            lines: lines,
            conditions: allConditions,
            functions: allFunctions
        }
    };
};
} (mock_require, mock_exports));

var interpret = mock_exports.interpret;
return function (moduleName, file, content, isPlainModule) {
    var coverageResult = interpret(moduleName, file, content, isPlainModule ? 0 : 1),
        moduleOption = coverageResult.options;

    coverage_module(moduleName, moduleOption.lines, moduleOption.conditions, moduleOption.functions);
    return coverageResult.code;
};

} ());
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
/*if ($P.CACHE_ASYNC) include('cache_async.js');*/
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



        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    var contentType = xhr.getResponseHeader('content-type');
                    module = xhr.responseText;
                    if ((/script$|json$/).test(contentType)) {
                        var isPlainModule = false;
                        if (!(/json$/).test(contentType)) {
                            module = coverage_apply(moduleName, moduleName, module, isPlainModule);
                        }
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
/*if ($P.JS) include('js.js');*/
/*if ($P.CSS) include('css.js');*/
/*if ($P.CACHE) include('cache.js');*/
    main(require, output.exports, output);
})(this,(function(require, exports, module) {
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
                require.stats.sendTo("http://localhost:8081");
                require.coverage_line("b-roster", "20");
                new Dialog(element);
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
},{},{"main":{"lines":["1","4"],"conditions":[],"functions":["(?):0:1"]},"b-roster":{"lines":["1","3","4","6","8","9","12","14","18","19","20","25","26","29","30","42","43","47","48","51","52","55","56","59","60","63","64","67","68","71","72","75","76","79","80","83","84","87","88","91","92","95","96","99","100","103","104","107","108","111","112","115","116","119","120","123","124","127","128","131","132","135","136","139","140","143","144","147","148","151","152","155","156","159","160","163","164","167","168","171","172","175","176","179","180","183","184","187","188","191","192","195","196","199","200","203","204","207","208","211","212","215","216","219","220","223","224","227","228","231","232","235","236","239","240","243","244","247","248","251","252","255","256","259","260","263","264","267","268","271","272","275","276","279","280","283","284","287","288","291","292","295","296","299","300","303","304","307","308","311","312","315","316","319","320","323","324","327","328","331","332","335","336","339","340","343","344","347","348","351","352","355","356","359","360","363","364","367","368","371","372","375","376","379","380","383","384","387","388","391","392","395","396","399","400","403","404","407","408","411","412","415","416","419","420","423","424","427","428","431","432","435","436","439","440","443","444","447","448","451","452","455","456","459","460","463","464","467","468","471","472","475","476","479","480","483","484","487","488","491","492","495","496","499","500","503","504","507","508","511","512","515","516","519","520","523","524","527","528","531","532","535","536","539","540","543","544","547","548","551","552","555","556","559","560","563","564","567","568","571","572","575","576","579","580","583","584","587","588","591","592","595","596","599","600","603","604","607","608","611","612","615","616","619","620","623","624","627","628","631","632","635","636","639","640","643","644","647","648","651","652","655","656","659","660","663","664","667","668","671","672","675","676","679","680","683","684","687","688","691","692","695","696","699","700","703","704","707","708","711","712","715","716","719","720","723","724","727","728","731","732","735","736","739","740","743","744","747","748","751","752","755","756","759","760","763","764","767","768","771","772","775","776","779","780","783","784","787","788","791","792","795","796","799","800","803","804","807","808","811","812","815","816","819","820","823","824","827","828","831","832","835","836","839","840","843","844","847","848","851","852","855","856","859","860","863","864","867","868","871","872","875","876","879","880","883","884","887","888","891","892","895","896","899","900","903","904","907","908","911","912","915","916","919","920","923","924","927","928","931","932","935","936","939","940","943","944","947","948","951","952","955","956","959","960","963","964","967","968","971","972","975","976","979","980","983","984","987","988","991","992","995","996","999","1000","1003","1004","1007","1008","1011","1012","1015","1016","1019","1020","1023","1024","1027","1028","1031","1032","1035","1036","1039","1040","1043","1044","1047","1048","1051","1052","1055","1056","1059","1060","1063","1064","1067","1068","1071","1072","1075","1076","1079","1080","1083","1084","1087","1088","1091","1092","1095","1096","1099","1100","1103","1104","1107","1108","1111","1112","1115","1116","1119","1120","1123","1124","1127","1128","1131","1132","1135","1136","1139","1140","1143","1144","1147","1148","1151","1152","1155","1156","1159","1160","1163","1164","1167","1168","1171","1172","1175","1176","1179","1180","1183","1184","1187","1188","1191","1192","1195","1196","1199","1200","1203","1204","1207","1208","1211","1212","1215","1216","1219","1220","1223","1224","1227","1228","1231","1232","1235","1236","1239","1240","1243","1244","1247"],"conditions":[],"functions":["(?):0:1","Roster:3:114","(?):14:404","(?):18:568","renderWrapper:25:743","renderItem:29:834","renderName:42:1490","Long_Long_Name_renderName0:47:1596","Long_Long_Name_renderName1:51:1728","Long_Long_Name_renderName2:55:1860","Long_Long_Name_renderName3:59:1992","Long_Long_Name_renderName4:63:2124","Long_Long_Name_renderName5:67:2256","Long_Long_Name_renderName6:71:2388","Long_Long_Name_renderName7:75:2520","Long_Long_Name_renderName8:79:2652","Long_Long_Name_renderName9:83:2784","Long_Long_Name_renderName10:87:2917","Long_Long_Name_renderName11:91:3051","Long_Long_Name_renderName12:95:3185","Long_Long_Name_renderName13:99:3319","Long_Long_Name_renderName14:103:3453","Long_Long_Name_renderName15:107:3587","Long_Long_Name_renderName16:111:3721","Long_Long_Name_renderName17:115:3855","Long_Long_Name_renderName18:119:3989","Long_Long_Name_renderName19:123:4123","Long_Long_Name_renderName20:127:4257","Long_Long_Name_renderName21:131:4391","Long_Long_Name_renderName22:135:4525","Long_Long_Name_renderName23:139:4659","Long_Long_Name_renderName24:143:4793","Long_Long_Name_renderName25:147:4927","Long_Long_Name_renderName26:151:5061","Long_Long_Name_renderName27:155:5195","Long_Long_Name_renderName28:159:5329","Long_Long_Name_renderName29:163:5463","Long_Long_Name_renderName30:167:5597","Long_Long_Name_renderName31:171:5731","Long_Long_Name_renderName32:175:5865","Long_Long_Name_renderName33:179:5999","Long_Long_Name_renderName34:183:6133","Long_Long_Name_renderName35:187:6267","Long_Long_Name_renderName36:191:6401","Long_Long_Name_renderName37:195:6535","Long_Long_Name_renderName38:199:6669","Long_Long_Name_renderName39:203:6803","Long_Long_Name_renderName40:207:6937","Long_Long_Name_renderName41:211:7071","Long_Long_Name_renderName42:215:7205","Long_Long_Name_renderName43:219:7339","Long_Long_Name_renderName44:223:7473","Long_Long_Name_renderName45:227:7607","Long_Long_Name_renderName46:231:7741","Long_Long_Name_renderName47:235:7875","Long_Long_Name_renderName48:239:8009","Long_Long_Name_renderName49:243:8143","Long_Long_Name_renderName50:247:8277","Long_Long_Name_renderName51:251:8411","Long_Long_Name_renderName52:255:8545","Long_Long_Name_renderName53:259:8679","Long_Long_Name_renderName54:263:8813","Long_Long_Name_renderName55:267:8947","Long_Long_Name_renderName56:271:9081","Long_Long_Name_renderName57:275:9215","Long_Long_Name_renderName58:279:9349","Long_Long_Name_renderName59:283:9483","Long_Long_Name_renderName60:287:9617","Long_Long_Name_renderName61:291:9751","Long_Long_Name_renderName62:295:9885","Long_Long_Name_renderName63:299:10019","Long_Long_Name_renderName64:303:10153","Long_Long_Name_renderName65:307:10287","Long_Long_Name_renderName66:311:10421","Long_Long_Name_renderName67:315:10555","Long_Long_Name_renderName68:319:10689","Long_Long_Name_renderName69:323:10823","Long_Long_Name_renderName70:327:10957","Long_Long_Name_renderName71:331:11091","Long_Long_Name_renderName72:335:11225","Long_Long_Name_renderName73:339:11359","Long_Long_Name_renderName74:343:11493","Long_Long_Name_renderName75:347:11627","Long_Long_Name_renderName76:351:11761","Long_Long_Name_renderName77:355:11895","Long_Long_Name_renderName78:359:12029","Long_Long_Name_renderName79:363:12163","Long_Long_Name_renderName80:367:12297","Long_Long_Name_renderName81:371:12431","Long_Long_Name_renderName82:375:12565","Long_Long_Name_renderName83:379:12699","Long_Long_Name_renderName84:383:12833","Long_Long_Name_renderName85:387:12967","Long_Long_Name_renderName86:391:13101","Long_Long_Name_renderName87:395:13235","Long_Long_Name_renderName88:399:13369","Long_Long_Name_renderName89:403:13503","Long_Long_Name_renderName90:407:13637","Long_Long_Name_renderName91:411:13771","Long_Long_Name_renderName92:415:13905","Long_Long_Name_renderName93:419:14039","Long_Long_Name_renderName94:423:14173","Long_Long_Name_renderName95:427:14307","Long_Long_Name_renderName96:431:14441","Long_Long_Name_renderName97:435:14575","Long_Long_Name_renderName98:439:14709","Long_Long_Name_renderName99:443:14843","Long_Long_Name_renderName100:447:14978","Long_Long_Name_renderName101:451:15114","Long_Long_Name_renderName102:455:15250","Long_Long_Name_renderName103:459:15386","Long_Long_Name_renderName104:463:15522","Long_Long_Name_renderName105:467:15658","Long_Long_Name_renderName106:471:15794","Long_Long_Name_renderName107:475:15930","Long_Long_Name_renderName108:479:16066","Long_Long_Name_renderName109:483:16202","Long_Long_Name_renderName110:487:16338","Long_Long_Name_renderName111:491:16474","Long_Long_Name_renderName112:495:16610","Long_Long_Name_renderName113:499:16746","Long_Long_Name_renderName114:503:16882","Long_Long_Name_renderName115:507:17018","Long_Long_Name_renderName116:511:17154","Long_Long_Name_renderName117:515:17290","Long_Long_Name_renderName118:519:17426","Long_Long_Name_renderName119:523:17562","Long_Long_Name_renderName120:527:17698","Long_Long_Name_renderName121:531:17834","Long_Long_Name_renderName122:535:17970","Long_Long_Name_renderName123:539:18106","Long_Long_Name_renderName124:543:18242","Long_Long_Name_renderName125:547:18378","Long_Long_Name_renderName126:551:18514","Long_Long_Name_renderName127:555:18650","Long_Long_Name_renderName128:559:18786","Long_Long_Name_renderName129:563:18922","Long_Long_Name_renderName130:567:19058","Long_Long_Name_renderName131:571:19194","Long_Long_Name_renderName132:575:19330","Long_Long_Name_renderName133:579:19466","Long_Long_Name_renderName134:583:19602","Long_Long_Name_renderName135:587:19738","Long_Long_Name_renderName136:591:19874","Long_Long_Name_renderName137:595:20010","Long_Long_Name_renderName138:599:20146","Long_Long_Name_renderName139:603:20282","Long_Long_Name_renderName140:607:20418","Long_Long_Name_renderName141:611:20554","Long_Long_Name_renderName142:615:20690","Long_Long_Name_renderName143:619:20826","Long_Long_Name_renderName144:623:20962","Long_Long_Name_renderName145:627:21098","Long_Long_Name_renderName146:631:21234","Long_Long_Name_renderName147:635:21370","Long_Long_Name_renderName148:639:21506","Long_Long_Name_renderName149:643:21642","Long_Long_Name_renderName150:647:21778","Long_Long_Name_renderName151:651:21914","Long_Long_Name_renderName152:655:22050","Long_Long_Name_renderName153:659:22186","Long_Long_Name_renderName154:663:22322","Long_Long_Name_renderName155:667:22458","Long_Long_Name_renderName156:671:22594","Long_Long_Name_renderName157:675:22730","Long_Long_Name_renderName158:679:22866","Long_Long_Name_renderName159:683:23002","Long_Long_Name_renderName160:687:23138","Long_Long_Name_renderName161:691:23274","Long_Long_Name_renderName162:695:23410","Long_Long_Name_renderName163:699:23546","Long_Long_Name_renderName164:703:23682","Long_Long_Name_renderName165:707:23818","Long_Long_Name_renderName166:711:23954","Long_Long_Name_renderName167:715:24090","Long_Long_Name_renderName168:719:24226","Long_Long_Name_renderName169:723:24362","Long_Long_Name_renderName170:727:24498","Long_Long_Name_renderName171:731:24634","Long_Long_Name_renderName172:735:24770","Long_Long_Name_renderName173:739:24906","Long_Long_Name_renderName174:743:25042","Long_Long_Name_renderName175:747:25178","Long_Long_Name_renderName176:751:25314","Long_Long_Name_renderName177:755:25450","Long_Long_Name_renderName178:759:25586","Long_Long_Name_renderName179:763:25722","Long_Long_Name_renderName180:767:25858","Long_Long_Name_renderName181:771:25994","Long_Long_Name_renderName182:775:26130","Long_Long_Name_renderName183:779:26266","Long_Long_Name_renderName184:783:26402","Long_Long_Name_renderName185:787:26538","Long_Long_Name_renderName186:791:26674","Long_Long_Name_renderName187:795:26810","Long_Long_Name_renderName188:799:26946","Long_Long_Name_renderName189:803:27082","Long_Long_Name_renderName190:807:27218","Long_Long_Name_renderName191:811:27354","Long_Long_Name_renderName192:815:27490","Long_Long_Name_renderName193:819:27626","Long_Long_Name_renderName194:823:27762","Long_Long_Name_renderName195:827:27898","Long_Long_Name_renderName196:831:28034","Long_Long_Name_renderName197:835:28170","Long_Long_Name_renderName198:839:28306","Long_Long_Name_renderName199:843:28442","Long_Long_Name_renderName200:847:28578","Long_Long_Name_renderName201:851:28714","Long_Long_Name_renderName202:855:28850","Long_Long_Name_renderName203:859:28986","Long_Long_Name_renderName204:863:29122","Long_Long_Name_renderName205:867:29258","Long_Long_Name_renderName206:871:29394","Long_Long_Name_renderName207:875:29530","Long_Long_Name_renderName208:879:29666","Long_Long_Name_renderName209:883:29802","Long_Long_Name_renderName210:887:29938","Long_Long_Name_renderName211:891:30074","Long_Long_Name_renderName212:895:30210","Long_Long_Name_renderName213:899:30346","Long_Long_Name_renderName214:903:30482","Long_Long_Name_renderName215:907:30618","Long_Long_Name_renderName216:911:30754","Long_Long_Name_renderName217:915:30890","Long_Long_Name_renderName218:919:31026","Long_Long_Name_renderName219:923:31162","Long_Long_Name_renderName220:927:31298","Long_Long_Name_renderName221:931:31434","Long_Long_Name_renderName222:935:31570","Long_Long_Name_renderName223:939:31706","Long_Long_Name_renderName224:943:31842","Long_Long_Name_renderName225:947:31978","Long_Long_Name_renderName226:951:32114","Long_Long_Name_renderName227:955:32250","Long_Long_Name_renderName228:959:32386","Long_Long_Name_renderName229:963:32522","Long_Long_Name_renderName230:967:32658","Long_Long_Name_renderName231:971:32794","Long_Long_Name_renderName232:975:32930","Long_Long_Name_renderName233:979:33066","Long_Long_Name_renderName234:983:33202","Long_Long_Name_renderName235:987:33338","Long_Long_Name_renderName236:991:33474","Long_Long_Name_renderName237:995:33610","Long_Long_Name_renderName238:999:33746","Long_Long_Name_renderName239:1003:33882","Long_Long_Name_renderName240:1007:34018","Long_Long_Name_renderName241:1011:34154","Long_Long_Name_renderName242:1015:34290","Long_Long_Name_renderName243:1019:34426","Long_Long_Name_renderName244:1023:34562","Long_Long_Name_renderName245:1027:34698","Long_Long_Name_renderName246:1031:34834","Long_Long_Name_renderName247:1035:34970","Long_Long_Name_renderName248:1039:35106","Long_Long_Name_renderName249:1043:35242","Long_Long_Name_renderName250:1047:35378","Long_Long_Name_renderName251:1051:35514","Long_Long_Name_renderName252:1055:35650","Long_Long_Name_renderName253:1059:35786","Long_Long_Name_renderName254:1063:35922","Long_Long_Name_renderName255:1067:36058","Long_Long_Name_renderName256:1071:36194","Long_Long_Name_renderName257:1075:36330","Long_Long_Name_renderName258:1079:36466","Long_Long_Name_renderName259:1083:36602","Long_Long_Name_renderName260:1087:36738","Long_Long_Name_renderName261:1091:36874","Long_Long_Name_renderName262:1095:37010","Long_Long_Name_renderName263:1099:37146","Long_Long_Name_renderName264:1103:37282","Long_Long_Name_renderName265:1107:37418","Long_Long_Name_renderName266:1111:37554","Long_Long_Name_renderName267:1115:37690","Long_Long_Name_renderName268:1119:37826","Long_Long_Name_renderName269:1123:37962","Long_Long_Name_renderName270:1127:38098","Long_Long_Name_renderName271:1131:38234","Long_Long_Name_renderName272:1135:38370","Long_Long_Name_renderName273:1139:38506","Long_Long_Name_renderName274:1143:38642","Long_Long_Name_renderName275:1147:38778","Long_Long_Name_renderName276:1151:38914","Long_Long_Name_renderName277:1155:39050","Long_Long_Name_renderName278:1159:39186","Long_Long_Name_renderName279:1163:39322","Long_Long_Name_renderName280:1167:39458","Long_Long_Name_renderName281:1171:39594","Long_Long_Name_renderName282:1175:39730","Long_Long_Name_renderName283:1179:39866","Long_Long_Name_renderName284:1183:40002","Long_Long_Name_renderName285:1187:40138","Long_Long_Name_renderName286:1191:40274","Long_Long_Name_renderName287:1195:40410","Long_Long_Name_renderName288:1199:40546","Long_Long_Name_renderName289:1203:40682","Long_Long_Name_renderName290:1207:40818","Long_Long_Name_renderName291:1211:40954","Long_Long_Name_renderName292:1215:41090","Long_Long_Name_renderName293:1219:41226","Long_Long_Name_renderName294:1223:41362","Long_Long_Name_renderName295:1227:41498","Long_Long_Name_renderName296:1231:41634","Long_Long_Name_renderName297:1235:41770","Long_Long_Name_renderName298:1239:41906","Long_Long_Name_renderName299:1243:42042"]},"undefined":{"lines":["3","5","6"],"conditions":[],"functions":["(?):1:1","$:5:85"]},"b-unused-module":{"lines":["1","2"],"conditions":[],"functions":["(?):0:1","pewpewOlolo:1:86"]}})