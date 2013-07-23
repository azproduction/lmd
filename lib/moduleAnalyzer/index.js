var Q = require('q'),
    uglify = require("uglify-js").uglify,
    arrayUnique = require('../utils').arrayUnique;

var asynchronousPlugins = {
    js: 'js',
    css: 'css',
    async: 'async',
    preload: 'preload',
    bundle: 'bundle'
};

var utilitiesPlugins = {
    stats: 'stats',
    define: 'amd'
};

function _addAsynchronousPluginsTo(nameAst, plugins) {
    // [ 'dot', [ 'name', 'require' ], pluginName ]
    var pluginName = asynchronousPlugins[nameAst[2]];

    if (pluginName) {
        plugins.push(pluginName);
        return true;
    }

    return false;
}

function _addUtilitiesPluginsTo(nameAst, requiredPlugins) {
    // [ 'dot', [ 'name', 'require' ], pluginName ]
    var pluginName = utilitiesPlugins[nameAst[2]];

    if (pluginName) {
        requiredPlugins.push(pluginName);
    }
}

function _addSpecialPluginsTo(nameAst, requiredPlugins) {
    // stats_sendto [ 'dot', [ 'dot', [ 'name', 'require' ], 'stats' ], 'sendTo' ]
    if (nameAst[2] === "sendTo" && nameAst[1][0] === "dot" && nameAst[1][2] === "stats") {
        requiredPlugins.push('stats_sendto');
    }

    // promise           [ 'dot', [ 'call', [ 'dot', [Object], 'js' ], [ [Object] ] ], 'then' ]
    if (nameAst[2] === "then" && nameAst[1] && nameAst[1][0] === "call" ) {
        requiredPlugins.push('promise');
    }
}

function _addRequiredModulesTo(requireAst, requiredModules) {
    var argument = requireAst[2][0],
        parameters;

    if (argument && (argument[0] === "array" || argument[0] === "string" || argument[0] === "number")) {
        if (argument[0] === "array") {
            parameters = argument[1];
        } else {
            parameters = [argument];
        }

        parameters.forEach(function (arg) {
            // uniq only
            if (requiredModules.indexOf(arg[1]) === -1) {
                requiredModules.push(arg[1]);
            }
        });
    }
}

/**
 * @param {Array} requireExpressions list of AST require expressions
 *
 * @returns {{requiredPlugins: Array, requiredModules: Array}}
 */
function findRequiredModulesAndPlugins(requireExpressions) {
    var requiredPlugins = [],
        requiredModules = [];

    requireExpressions.forEach(function (requireAst) {
        var nameAst = requireAst[0] === "call" ? requireAst[1] : requireAst,
            currentIsAsyncFunction = false;

        // find plugins
        if (nameAst[0] === "dot") {
            currentIsAsyncFunction = _addAsynchronousPluginsTo(nameAst, requiredPlugins);
            _addUtilitiesPluginsTo(nameAst, requiredPlugins);
            _addSpecialPluginsTo(nameAst, requiredPlugins);
        }

        if (requireAst[0] !== "call") {
            return;
        }

        // parallel plugin
        if (currentIsAsyncFunction && requireAst[2][0] && requireAst[2][0] && requireAst[2][0][0] === "array") {
            requiredPlugins.push('parallel');
        }

        // find required modules
        // require() || require.js() || require.css() ||
        // require.async() || require.bundle() || require.preload()
        if (currentIsAsyncFunction || requireAst[1][0] === "name") {
            _addRequiredModulesTo(requireAst, requiredModules);
        }

    });

    return {
        requiredPlugins: requiredPlugins,
        requiredModules: requiredModules
    };
}

/**
 * @param {Object} ast
 *
 * @returns {Object}
 */
function findLastDefine(ast) {
    var define = uglify.ast_walker(),
        lastDefineAst;

    define.with_walkers({
        "call": function () {
            if (this[1][0] === "name" && this[1][1] === "define") {
                lastDefineAst = this;
            }
        }
    }, function () {
        return define.walk(ast);
    });

    return lastDefineAst;
}

/**
 *
 * @param {Array} ast
 * @returns {Array} list of required AMD modules
 */
function findRequiredAmdModules(ast) {
    var requiredModules = [];

    if (!ast[1].length) {
        return requiredModules;
    }
    var lastDefine = findLastDefine(ast);

    lastDefine[2].forEach(function (arg) {
        if (arg[0] !== "array") {
            return;
        }

        arg[1].forEach(function (amdModuleName) {
            if (amdModuleName !== "require" && amdModuleName !== "module" && amdModuleName !== "exports") {
                requiredModules.push(amdModuleName);
            }
        });
    });

    return requiredModules;
}

/**
 * @param {Object|String} extra
 *
 * @returns {Array}
 */
function find3partyRequiredModules(extra) {
    var requiredModules = [];
    if (!extra) {
        return requiredModules;
    }

    if (typeof extra !== "object") {
        // #81 Falsy warnings appears after adding 3-party modules
        if (typeof extra === "string") {
            requiredModules.push(extra);
        }
    } else {
        for (var requireVarName in extra) {
            requiredModules.push(extra[requireVarName]);
        }
    }

    return requiredModules;
}

function _walkerFindRequireCallsInStack(stack) {
    var requireAccesses = [],
        last = stack.length - 1;

    var findRequire = function () {
        var lastStackItem = stack[last];
        /*
        ["var", [
            ["x", ["dot", ["name", "require"], "js"]],
            ["y"]
        ]],
        ["dot", ["name", "require"], "js"],
        ["name", "require"]
        */

        /*
        ["assign", true, ["name", "y"],
            ["dot", ["name", "require"], "css"]
        ],
        ["dot", ["name", "require"], "css"],
        ["name", "require"]
        */
        if (lastStackItem[0] === "assign" || lastStackItem[0] === "var") {
            requireAccesses.push(stack[last + 1]);
            return false;
        }

        /*
        ["call", ["dot", ["name", "require"], "define"],
            [
                ["function", null, [],
                    []
                ]
            ]
        ],
        ["dot", ["name", "require"], "define"],
        ["name", "require"]
        */
        if (lastStackItem[0] === "call") {
            requireAccesses.push(lastStackItem);
            // add parent also for require.js().then()
            if (stack[last - 1]) {
                requireAccesses.push(stack[last - 1]);
            }
            return false;
        }

        return true;
    };

    while (last >= 0 && findRequire()) {
        last--;
    }

    return requireAccesses;
}

/**
 *
 * @param {Object} ast
 * @param {Number} itemIndex
 *
 * @returns {String|undefined}
 */
function findExtraRequireName(ast, itemIndex) {
    if (ast[itemIndex][0] === "array") {
        var index = -1;
        ast[itemIndex][1].forEach(function (item, i) {
            if (item[1] === "require") {
                index = i;
            }
        });

        // get require index
        if (index !== -1 && ast[itemIndex + 1][0] === "function") {
            return ast[itemIndex + 1][2][index];
        }
    } else if (ast[itemIndex][0] === "function") {
        return ast[itemIndex][2][0];

    } else if (ast[itemIndex][0] === "string" && ast[itemIndex + 1]) {

        return findExtraRequireName(ast, itemIndex + 1);
    }
}

/**
 * @param {Object} ast
 *
 * @returns {{name: string, extra: Array}}
 * @private
 */
function _findRequiresInAmd(ast) {
    var requireName = "require",
        extraRequireName;

    var lastDefineAst = findLastDefine(ast);

    if (lastDefineAst) {
        extraRequireName = findExtraRequireName(lastDefineAst[2], 0);
    }

    return {
        name: requireName,
        extra: extraRequireName
    };
}

/**
 * @returns {{name: string}}
 * @private
 */
function _findRequiresInPlain() {
    return {
        name: 'require'
    };
}

/**
 * @param {Object} ast
 *
 * @returns {{name: string}}
 * @private
 */
function _findRequiresInFunction(ast) {
    var requireName;
    if (ast[1] && ast[1][0] && ast[1][0][0] === "stat") {
        requireName = ast[1] && ast[1][0] && ast[1][0][1] && ast[1][0][1][2] && ast[1][0][1][2][0];
    } else {
        requireName = ast[1] && ast[1][0] && ast[1][0][2] && ast[1][0][2][0];
    }

    return {
        name: requireName
    };
}

var _moduleTypeToRequireFinderMap = {
    'amd': _findRequiresInAmd,
    'plain': _findRequiresInPlain,
    '3-party': _findRequiresInPlain,
    'fd': _findRequiresInFunction,
    'fe': _findRequiresInFunction
};

/**
 * @param {Object} ast
 * @param {String} moduleType
 *
 * @returns {Array} list of AST require calls
 */
function findRequireCalls(ast, moduleType) {
    var requireAccesses = [],
        requireFinder = _moduleTypeToRequireFinderMap[moduleType];

    if (!requireFinder) {
        return requireAccesses;
    }

    var struct = requireFinder(ast),
        requireName = struct.name,
        extraRequireName = struct.extra;

    var walker = uglify.ast_walker();

    walker.with_walkers({
        "name": function () {
            if (this[1] !== requireName && this[1] !== extraRequireName) {
                return;
            }

            var stack = walker.stack(),
                requires = _walkerFindRequireCallsInStack(stack);

            requireAccesses = requireAccesses.concat(requires);
        }
    }, function () {
        return walker.walk(ast);
    });

    return requireAccesses;
}

/**
 * Static module analytics
 *
 * @param {Module} moduleData
 *
 * @returns {{requiredPlugins: Array, requiredModules: Array}}
 */
module.exports = function (moduleData) {
    var type = moduleData.type,
        requiredModules = [];

    if (type === '3-party') {
        requiredModules = requiredModules
            .concat(find3partyRequiredModules(moduleData.extraRequire))
            .concat(find3partyRequiredModules(moduleData.extraBind));
    }

    var requireExpressions = findRequireCalls(moduleData.ast, type),
        analyticsResult = findRequiredModulesAndPlugins(requireExpressions);

    var requiredPlugins = analyticsResult.requiredPlugins;
    requiredModules = requiredModules.concat(analyticsResult.requiredModules);

    if (type === 'amd') {
        requiredPlugins.push('amd');
        requiredModules = requiredModules.concat(findRequiredAmdModules(moduleData.ast));
    }

    return {
        requiredPlugins: arrayUnique(requiredPlugins),
        requiredModules: arrayUnique(requiredModules)
    };
};
