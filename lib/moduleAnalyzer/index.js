var Q = require('q'),
    uglify = require("uglify-js").uglify;

/**
 * Static module analytics
 *
 * @param {Module} moduleData
 *
 * @returns {{plugins: Array, depends: Array}}
 */
module.exports = function (moduleData) {
    var type = moduleData.type,
        plugins = [],
        depends = [];

    if (type === '3-party') {
        depends = depends
            .concat(find3partyDepends(moduleData.extraRequire))
            .concat(find3partyDepends(moduleData.extraBind));
    }

    var requireExpressions = findRequireCalls(moduleData.ast, type),
        analyticsResult = findModuleDependsAndPlugins(requireExpressions);

    plugins = analyticsResult.plugins;
    depends = depends.concat(analyticsResult.depends);

    if (type === 'amd') {
        plugins.push('amd');
        depends = depends.concat(findAmdDepends(moduleData.ast));
    }

    return {
        plugins: arrayUnique(plugins),
        depends: arrayUnique(depends)
    }
};

/**
 * @param {Array} array
 *
 * @returns {Array}
 */
function arrayUnique(array) {
    return array.filter(function(item, index, array) {
        return array.indexOf(item, index + 1) < 0;
    });
}

/**
 * @param {Array} requireExpressions list of AST require expressions
 *
 * @returns {{plugins: Array, depends: Array}}
 */
function findModuleDependsAndPlugins(requireExpressions) {
    var plugins = [],
        depends = [];

    requireExpressions.forEach(function (requireAst) {
        var nameAst = requireAst[0] === "call" ? requireAst[1] : requireAst,
            currentIsAsyncFunction = false;

        // js           [ 'dot', [ 'name', 'require' ], 'js' ]
        if (nameAst[0] === "dot" && nameAst[2] === "js") {
            plugins.push('js');
            currentIsAsyncFunction = true;
        }
        // css          [ 'dot', [ 'name', 'require' ], 'css' ]
        if (nameAst[0] === "dot" && nameAst[2] === "css") {
            plugins.push('css');
            currentIsAsyncFunction = true;
        }
        // async        [ 'dot', [ 'name', 'require' ], 'async' ]
        if (nameAst[0] === "dot" && nameAst[2] === "async") {
            plugins.push('async');
            currentIsAsyncFunction = true;
        }
        // preload        [ 'dot', [ 'name', 'require' ], 'preload' ]
        if (nameAst[0] === "dot" && nameAst[2] === "preload") {
            plugins.push('preload');
            currentIsAsyncFunction = true;
        }
        // bundle        [ 'dot', [ 'name', 'require' ], 'bundle' ]
        if (nameAst[0] === "dot" && nameAst[2] === "bundle") {
            plugins.push('bundle');
            currentIsAsyncFunction = true;
        }
        // stats        [ 'dot', [ 'name', 'require' ], 'stats' ]
        if (nameAst[0] === "dot" && nameAst[2] === "stats") {
            plugins.push('stats');
        }
        // stats_sendto [ 'dot', [ 'dot', [ 'name', 'require' ], 'stats' ], 'sendTo' ]
        if (nameAst[0] === "dot" && nameAst[2] === "sendTo" && nameAst[1][0] === "dot" && nameAst[1][2] === "stats") {
            plugins.push('stats_sendto');
        }
        // amd          [ 'dot', [ 'name', 'require' ], 'define' ]
        if (nameAst[0] === "dot" && nameAst[2] === "define") {
            plugins.push('amd');
        }

        // promise           [ 'dot', [ 'call', [ 'dot', [Object], 'js' ], [ [Object] ] ], 'then' ]
        if (nameAst[0] === "dot" && nameAst[2] === "then" && nameAst[1] && nameAst[1][0] === "call" ) {
            plugins.push('promise');
        }

        if (requireAst[0] === "call") {
            // parallel
            if (currentIsAsyncFunction && requireAst[2][0] && requireAst[2][0] && requireAst[2][0][0] === "array") {
                plugins.push('parallel');
            }

            // require() || require.js() || require.css() ||
            // require.async() || require.bundle() || require.preload()
            if (currentIsAsyncFunction || requireAst[1][0] === "name") {
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
                        if (depends.indexOf(arg[1]) === -1) {
                            depends.push(arg[1]);
                        }
                    });
                }
            }
        }
    });

    return {
        plugins: plugins,
        depends: depends
    };
}

function findAmdDepends(ast) {
    var depends = [];

    if (!ast[1].length) {
        return depends;
    }
    var lastDefine = findLastDefine(ast);

    // find amd requirements
    for (var i = 0, c = lastDefine[2].length, arg; i < c; i++) {
        arg = lastDefine[2][i];
        if (arg[0] === "array") {
            for (var j = 0, c2 = arg[1].length, dependsName; j < c2; j++) {
                dependsName = arg[1][j][1];
                if (dependsName !== "require" && dependsName !== "module" && dependsName !== "exports") {
                    depends.push(dependsName);
                }
            }
        }
    }

    return depends;
}

/**
 * @param {Object|String} extra
 *
 * @returns {Array}
 */
function find3partyDepends(extra) {
    var depends = [];
    if (!extra) {
        return depends;
    }

    if (typeof extra !== "object") {
        // #81 Falsy warnings appears after adding 3-party modules
        if (typeof extra === "string") {
            depends.push(extra);
        }
    } else {
        for (var requireVarName in extra) {
            depends.push(extra[requireVarName]);
        }
    }

    return depends;
}

/**
 *
 * @param {Object} ast
 * @param {Number} itemIndex
 *
 * @returns {Object}
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
        if (index !== -1) {
            if (ast[itemIndex + 1][0] === "function") {
                return ast[itemIndex + 1][2][index];
            }
        }
    } else if (ast[itemIndex][0] === "function") {
        return ast[itemIndex][2][0];

    } else if (ast[itemIndex][0] === "string") {
        if (ast[itemIndex + 1]) {
            return findExtraRequireName(ast, itemIndex + 1);
        }
    }
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
 * @param {Object} ast
 * @param {String} moduleType
 *
 * @returns {Array} list of AST require calls
 */
function findRequireCalls(ast, moduleType) {
    var requireName,
        extraRequireName,
        requireAccesses = [];

    switch (moduleType) {
        case "plain":
        case "3-party":
            requireName = "require";
            break;

        case "amd":
            requireName = "require";

            var lastDefineAst = findLastDefine(ast);

            if (lastDefineAst) {
               extraRequireName = findExtraRequireName(lastDefineAst[2], 0);
            }
            break;

        case "fd":
        case "fe":
            if (ast[1] && ast[1][0] && ast[1][0][0] === "stat") {
                requireName = ast[1] && ast[1][0] && ast[1][0][1] && ast[1][0][1][2] && ast[1][0][1][2][0];
            } else {
                requireName = ast[1] && ast[1][0] && ast[1][0][2] && ast[1][0][2][0];
            }

            break;

        default:
            return requireAccesses;
    }

    var walker = uglify.ast_walker();

    walker.with_walkers({
        "name": function () {
            if (this[1] === requireName || this[1] === extraRequireName) {

                var stack = walker.stack(),
                    last = stack.length - 1;

                while (last >= 0) {
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
                    if (stack[last][0] === "assign" || stack[last][0] === "var") {
                        requireAccesses.push(stack[last + 1]);
                        break;
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
                    if (stack[last][0] === "call") {
                        requireAccesses.push(stack[last]);
                        // add parent also for require.js().then()
                        if (stack[last - 1]) {
                            requireAccesses.push(stack[last - 1]);
                        }
                        break;
                    }
                    last--;
                }
            }
        }
    }, function () {
        return walker.walk(ast);
    });

    return requireAccesses;
}
