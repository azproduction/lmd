var fs = require('fs'),
    fileExists = fs.existsSync || require('path').existsSync,
    uglifyCompress = require("uglify-js"),
    parser = uglifyCompress.parser,
    uglify = uglifyCompress.uglify;

require('colors');

var PATH_SPLITTER = /\/|\\/;
var DEFAULT_DEPENDS_MASK = "*.lmd.json";
var MASTER_FIELDS = ['version', 'main', 'global', 'lazy', 'pack', 'pack_options', 'log', 'warn', 'mixins',
                     'output', 'path', 'root', "sourcemap", "sourcemap_inline", "sourcemap_www", "www_root"];

var INHERITABLE_FIELDS = ['version', 'main', 'global', 'lazy', 'pack', 'pack_options', 'log', 'warn', 'mixins'];
var FILED_ALIASES = {"path": "root"};

var GLOBALS = {
    Array               : 0,
    Boolean             : 0,
    Date                : 0,
    decodeURI           : 0,
    decodeURIComponent  : 0,
    encodeURI           : 0,
    encodeURIComponent  : 0,
    Error               : 0,
    'eval'              : 0,
    EvalError           : 0,
    Function            : 0,
    hasOwnProperty      : 0,
    isFinite            : 0,
    isNaN               : 0,
    JSON                : 0,
    Math                : 0,
    Number              : 0,
    Object              : 0,
    parseInt            : 0,
    parseFloat          : 0,
    RangeError          : 0,
    ReferenceError      : 0,
    RegExp              : 0,
    String              : 0,
    SyntaxError         : 0,
    TypeError           : 0,
    URIError            : 0
};

var LMD_JS_SRC_PATH = __dirname + '/../src/';

var LMD_PLUGINS = JSON.parse(fs.readFileSync(LMD_JS_SRC_PATH + 'lmd_plugins.json', 'utf8'))

/**
 * Config files deep merge
 *
 * @param {Object} left
 * @param {Object} right
 */
var deepDestructableMerge = function (left, right) {
    for (var prop in right) {
        if (right.hasOwnProperty(prop))  {
            if (typeof left[prop] === "object") {
                deepDestructableMerge(left[prop], right[prop]);
            } else {
                left[prop] = right[prop];
            }
        }
    }
    return left;
};

/**
 * Merges all config files in module's lineage
 *
 * @param config
 */
var tryExtend = function (config, configDir) {
    config = config || {};
    if (typeof config.extends !== "string") {
        return config;
    }
    var parentConfig = tryExtend(JSON.parse(fs.readFileSync(configDir + '/' + config.extends, 'utf8')), configDir);

    return deepDestructableMerge(parentConfig, config);
};

/**
 * Extracts file path parameters
 *
 * @param file
 */
var extract = function (file) {
    file = file.split(PATH_SPLITTER);
    return {
        file: file.pop(),
        path: (file.length ? file.join('/') + '/' : '')
    };
};

var getDependsConfigOf = function (modulePath, dependsFileMask) {
    var fileName = modulePath.replace(/^.*\/|\.[a-z0-9]+$/g, '');
    return extract(modulePath).path + dependsFileMask.replace('*', fileName);
};

/**
 * Merges configs
 *
 * @param {Object}   configA
 * @param {Object}   configB
 * @param {String[]} flagsNames
 * @param {Boolean}  isMasterConfig some parameters from configA will be overwritten using configB
 * @param {String}   context        configB description
 *
 * @return {*}
 */
var mergeConfigs = function (configA, configB, flagsNames, inheritableFields, isMasterConfig, context) {
    if (isMasterConfig) {
        // Apply master fields
        inheritableFields.forEach(function (fieldName) {
            if (typeof configB[fieldName] !== "undefined") {
                configA[fieldName] = configB[fieldName];
                if (FILED_ALIASES.hasOwnProperty(fieldName)) {
                    configA[FILED_ALIASES[fieldName]] = configB[fieldName];
                }
            }
        });
    }

    // Save errors
    configA.errors = configA.errors || [];
    configB.errors = configB.errors || [];
    configA.errors = configA.errors.concat(configB.errors);

    // Apply Flags
    flagsNames.forEach(function (optionsName) {
        // if master -> B
        if (typeof configB[optionsName] === "undefined") {
            return;
        }

        if (isMasterConfig) {
            configA[optionsName] = configB[optionsName];
        } else {
            // if A literal B array -> B
            if (configB[optionsName] instanceof Array && !(configA[optionsName] instanceof Array) ) {
                configA[optionsName] = configB[optionsName];
            } else if (configB[optionsName] instanceof Array && configA[optionsName] instanceof Array) {
                // if A array B array -> A concat B
                configA[optionsName] = configA[optionsName].concat(configB[optionsName]);
            } else {
                // if A literal B literal -> union
                // if A array B literal -> A
                configA[optionsName] = configA[optionsName] || configB[optionsName];
            }
            // else {}
        }
    });

    // Apply Modules
    configA.modules = configA.modules || {};
    configB.modules = configB.modules || {};
    for (var moduleName in configB.modules) {
        // Warn if module exists an its not a master
        if (!isMasterConfig && configA.modules[moduleName]) {
            configA.errors.push('Name conflict! Module **"' + moduleName + '"** will be overwritten by ' + context);
        }
        configA.modules[moduleName] = configB.modules[moduleName];
    }

    return configA; // not rly need...
};

/**
 * Creates LMD config: applies depends and extends
 *
 * @param {Object}   configFile
 * @param {String[]} [flagsNames]
 * @param {Object}   [extraOptions]
 * @param {Object}   [usedConfigs]
 *
 * @return {Object}
 */
var assembleLmdConfig = function (configFile, flagsNames, extraOptions, usedConfigs) {
    flagsNames = flagsNames || Object.keys(LMD_PLUGINS);

    var isFirstRun = typeof usedConfigs === "undefined";
    usedConfigs = usedConfigs || {};
    var configDir = fs.realpathSync(configFile);
    usedConfigs[configDir] = true; // mark config as used

    configDir = configDir.split(PATH_SPLITTER);
    configDir.pop();
    configDir = configDir.join('/');
    var rawConfig = JSON.parse(fs.readFileSync(configFile, 'utf8')),
        configs = [],
        resultConfig = {
            modules: {},
            errors: []
        };

    if (extraOptions) {
        rawConfig = deepDestructableMerge(rawConfig, extraOptions);
    }

    // collect modules and module options
    var modules = collectModules(rawConfig, configDir);
    if (rawConfig.depends) {
        var /*dependsMask = rawConfig.depends === true ? DEFAULT_DEPENDS_MASK : rawConfig.depends,*/
            dependsConfigPath,
            dependsMask;
        for (var moduleName in modules) {
            if (!modules[moduleName].is_shortcut) {
                dependsMask = modules[moduleName].depends;
                dependsConfigPath = getDependsConfigOf(modules[moduleName].path, dependsMask);
                if (fileExists(dependsConfigPath)) {
                    if (!usedConfigs[dependsConfigPath]) {
                        configs.unshift({
                            context: 'depends config **' + dependsConfigPath + '**',
                            config: assembleLmdConfig(dependsConfigPath, flagsNames, null, usedConfigs)
                        });
                    }
                }
            }
        }
    }

    // extend parent config
    if (typeof rawConfig['extends'] === "string") {
        var parentConfigFile = fs.realpathSync(configDir + '/' + rawConfig['extends']);
        if (!usedConfigs[parentConfigFile]) {
            var parentConfig =  assembleLmdConfig(parentConfigFile, flagsNames, null, usedConfigs);
        }
    }

    var processedConfig = {
        modules: modules
    };

    // keep fields
    MASTER_FIELDS.forEach(function (fieldName) {
        processedConfig[fieldName] = rawConfig[fieldName];
        if (FILED_ALIASES.hasOwnProperty(fieldName)) {
            processedConfig[FILED_ALIASES[fieldName]] = rawConfig[fieldName];
        }
    });

    // keep flags
    flagsNames.forEach(function (fieldName) {
        processedConfig[fieldName] = rawConfig[fieldName];
    });

    if (parentConfig) {
        mergeConfigs(resultConfig, parentConfig, flagsNames, INHERITABLE_FIELDS, true, 'parent config **' + parentConfigFile + '**');
    }

    for (var i = 0, c = configs.length, dependsMainModuleName; i < c; i++) {
        // Cleanup main module from depends
        dependsMainModuleName = configs[i].config.main || "main";
        if (configs[i].config.modules) {
            delete configs[i].config.modules[dependsMainModuleName];
        }
        mergeConfigs(resultConfig, configs[i].config, flagsNames, [], false, configs[i].context);
    }

    mergeConfigs(resultConfig, processedConfig, flagsNames, MASTER_FIELDS, true, 'main config **' + configFile + '**');

    if (isFirstRun) {
        // Apply mixins
        var mixins = resultConfig.mixins;
        if (Array.isArray(mixins)) {
            mixins.forEach(function (mixinName) {
                var mixinConfigFile = fs.realpathSync(configDir + '/' + mixinName),
                    processedMixin = assembleLmdConfig(mixinConfigFile, flagsNames, null, usedConfigs);

                mergeConfigs(resultConfig, processedMixin, flagsNames, INHERITABLE_FIELDS, true, 'mixin config **' + mixinConfigFile + '**');
            });
        }
        reapplyModuleOptions(resultConfig);
    }
    return resultConfig;
};

function isCoverage(config, moduleName) {
    if (!config.stats_coverage) {
        return false;
    }

    if (config.stats_coverage === true) {
        return true;
    }

    if (config.stats_coverage instanceof Array) {
        return config.stats_coverage.indexOf(moduleName) !== -1;
    }

    return false;
}

/**
 * @name LmdModuleStruct
 * @class
 *
 * @field {String}  name            module name
 * @field {String}  path            full path to module
 * @field {String}  depends         depends file mask
 * @field {Boolean} is_lazy         is lazy module?
 * @field {Boolean} is_sandbox      is module sandboxed?
 * @field {Boolean} is_greedy       module is collected using wildcard
 * @field {Boolean} is_shortcut     is module shortcut?
 * @field {Boolean} is_coverage     is module under code coverage?
 * @field {Boolean} is_third_party  uses custom export/require?
 *
 */

/**
 * Collecting module using merged config
 *
 * @param config
 *
 * @returns {Object}
 */
var collectModules = function (config, configDir) {
    var IS_HAS_WILD_CARD = /\*/;

    var modules = {},
        globalLazy = config.lazy || false,
        globalDepends = (config.depends === true ? DEFAULT_DEPENDS_MASK : config.depends) || false,
        moduleLazy = false,
        moduleName,
        modulePath,
        moduleExports,
        moduleRequire,
        descriptor,
        moduleDesciptor,
        wildcardRegex,
        moduleData,
        path = config.root || config.path || '';

    if (path[0] !== '/') { // non-absolute
        path = configDir + '/' + path;
    }

    // grep paths
    for (moduleName in config.modules) {
        moduleDesciptor = config.modules[moduleName];
        // case "moduleName": "path/to/module.js"
        if (typeof moduleDesciptor === "string") {
            moduleExports = false;
            moduleRequire = false;
            modulePath = moduleDesciptor;
            moduleLazy = globalLazy;
        } else { // case "moduleName": {"path": "path/to/module.js", "lazy": false}
            moduleExports = moduleDesciptor.exports || false;
            moduleRequire = moduleDesciptor.require || false;
            modulePath = moduleDesciptor.path;
            moduleLazy = moduleDesciptor.lazy || false;
        }

        // Override if cache flag = true
        if (config.cache) {
            moduleLazy = true;
        }
        // its a wildcard
        // "*": "*.js" or "*_pewpew": "*.ru.json" or "ololo": "*.js"
        if (IS_HAS_WILD_CARD.test(modulePath)) {
            descriptor = extract(modulePath);
            wildcardRegex = new RegExp("^" + descriptor.file.replace(/\*/g, "(\\w+)") + "$");
            fs.readdirSync(path + descriptor.path).forEach(function (fileName) {
                var match = fileName.match(wildcardRegex),
                    newModuleName;

                if (match) {
                    match.shift();

                    // Modify a module name
                    match.forEach(function (replacement) {
                        newModuleName = moduleName.replace('*', replacement);
                    });

                    moduleData = {
                        originalModuleDesciptor: moduleDesciptor,
                        name: newModuleName,
                        path: fs.realpathSync(path + descriptor.path + fileName),
                        originalPath: descriptor.path + fileName,
                        lines: 0,
                        extra_exports: moduleExports,
                        extra_require: moduleRequire,
                        is_third_party: !!moduleExports || !!moduleRequire,
                        is_lazy: moduleLazy,
                        is_greedy: true,
                        is_shortcut: false,
                        is_coverage: isCoverage(config, newModuleName),
                        is_sandbox: moduleDesciptor.sandbox || false,
                        depends: typeof moduleDesciptor.depends === "undefined" ? globalDepends : moduleDesciptor.depends
                    };

                    // wildcard have a low priority
                    // if module was directly named it pass
                    if (!(modules[newModuleName] && !modules[newModuleName].is_greedy)) {
                        modules[newModuleName] = moduleData;
                    }
                }
            });
        } else if (/^@/.test(modulePath)) {
            // shortcut
            modules[moduleName] = {
                originalModuleDesciptor: moduleDesciptor,
                name: moduleName,
                originalPath: modulePath,
                lines: 0,
                path: modulePath,
                extra_exports: moduleExports,
                extra_require: moduleRequire,
                is_third_party: !!moduleExports || !!moduleRequire,
                is_lazy: moduleLazy,
                is_greedy: false,
                is_shortcut: true,
                is_coverage: false,
                is_sandbox: moduleDesciptor.sandbox || false,
                depends: typeof moduleDesciptor.depends === "undefined" ? globalDepends : moduleDesciptor.depends
            };
        } else {
            // normal name
            // "name": "name.js"
            modules[moduleName] = {
                originalModuleDesciptor: moduleDesciptor,
                name: moduleName,
                path: fs.realpathSync(path + modulePath),
                originalPath: modulePath,
                lines: 0,
                extra_exports: moduleExports,
                extra_require: moduleRequire,
                is_third_party: !!moduleExports || !!moduleRequire,
                is_lazy: moduleLazy,
                is_greedy: false,
                is_shortcut: false,
                is_coverage: isCoverage(config, moduleName),
                is_sandbox: moduleDesciptor.sandbox || false,
                depends: typeof moduleDesciptor.depends === "undefined" ? globalDepends : moduleDesciptor.depends
            };
        }
    }

    return modules;
};

var reapplyModuleOptions = function (config) {
    var globalLazy = config.lazy || false,
        moduleName,
        moduleDesciptor,
        moduleLazy;

    for (moduleName in config.modules) {
        moduleDesciptor = config.modules[moduleName].originalModuleDesciptor;

        if (typeof moduleDesciptor === "string") {
            moduleLazy = globalLazy;
        } else {
            moduleLazy = moduleDesciptor.lazy || false;
        }

        // Override if cache flag = true
        if (config.cache) {
            moduleLazy = true;
        }

        delete config.modules[moduleName].originalModuleDesciptor;
        config.modules[moduleName].is_lazy = moduleLazy;
        config.modules[moduleName].is_coverage = isCoverage(config, moduleName);
    }
};

var collectModulesInfo = function (config) {
    var configModules = config.modules,
        moduleOptions,
        result = {};

    for (var moduleName in configModules) {
        moduleOptions = configModules[moduleName];
        result[moduleName] = analiseModuleContent(moduleOptions);
    }

    return result;
};

/**
 * Wrapper for plain files
 *
 * @param {String} code
 *
 * @returns {String} wrapped code
 */
var wrapPlainModule = function (code) {
    return '(function (require, exports, module) { /* wrapped by builder */\n' + code + '\n})';
};

/**
 * Wrapper for AMD files
 *
 * @param {String} code
 *
 * @returns {String} wrapped code
 */
var wrapAmdModule = function (code) {
    return '(function (require) { /* wrapped by builder */\nvar define = require.define;\n' + code + '\n})';
};

/**
 * Wrapper for non-lmd modules files
 *
 * @param {String}               code
 * @param {Object|String}        extra_exports
 * @param {Object|String|String} extra_exports
 *
 * @returns {String} wrapped code
 */
var wrapNonLmdModule = function (code, extra_exports, extra_require) {
    var exports = [],
        requires = [],
        exportCode;

    // add exports
    // extra_exports = {name: code, name: code}
    if (typeof extra_exports === "object") {
        for (var exportName in extra_exports) {
            exportCode = extra_exports[exportName];
            exports.push('    ' + JSON.stringify(exportName) + ': ' + exportCode);
        }
        code += '\n\n/* added by builder */\nreturn {\n' + exports.join(',\n') + '\n};';
    } else if (extra_exports) {
        // extra_exports = string
        code += '\n\n/* added by builder */\nreturn ' + extra_exports + ';';
    }

    // add require
    if (typeof extra_require === "object") {
        // extra_require = [name, name, name]
        if (extra_require instanceof Array) {
            for (var i = 0, c = extra_require.length, moduleName; i < c; i++) {
                moduleName = extra_require[i];
                requires.push('require(' + JSON.stringify(moduleName) + ');');
            }
            code = '/* added by builder */\n' + requires.join('\n') + '\n\n' + code;
        } else {
            // extra_require = {name: name, name: name}
            for (var localName in extra_require) {
                moduleName = extra_require[localName];
                requires.push(localName + ' = require(' + JSON.stringify(moduleName) + ')');
            }
            code = '/* added by builder */\nvar ' + requires.join(',\n    ') + ';\n\n' + code;
        }
    } else if (extra_require) {
        // extra_require = string
        code = '/* added by builder */\nrequire(' + JSON.stringify(extra_require) + ');\n\n' + code;
    }

    return '(function (require) { /* wrapped by builder */\n' + code + '\n})';
};

/**
 * Removes tail semicolons
 *
 * @param {String} code
 *
 * @return {String}
 */
var removeTailSemicolons = function (code) {
    return code.replace(/\n*;$/, '');
};

var astLookupExtraRequireName = function (ast, itemIndex) {
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
            return astLookupExtraRequireName(ast, itemIndex + 1);
        }
    }
};

var findLastDefine = function (ast) {
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
};

var findRequireAccesses = function (ast, moduleType) {
    var requireName,
        extraRequireName,
        requireAccesses = [];

    switch (moduleType) {
        case "plain":
            requireName = "require";
            break;
        case "amd":
            requireName = "require";

            var lastDefineAst = findLastDefine(ast);

            if (lastDefineAst) {
               extraRequireName = astLookupExtraRequireName(lastDefineAst[2], 0);
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
};

var findModuleRequirementsAndFeatures = function (requireExpressions) {
    var features = {},
        depends = [];

    requireExpressions.forEach(function (requireAst) {
        var nameAst = requireAst[0] === "call" ? requireAst[1] : requireAst,
            currentIsAsyncFunction = false;

        // js           [ 'dot', [ 'name', 'require' ], 'js' ]
        if (nameAst[0] === "dot" && nameAst[2] === "js") {
            features.js = true;
            currentIsAsyncFunction = true;
        }
        // css          [ 'dot', [ 'name', 'require' ], 'css' ]
        if (nameAst[0] === "dot" && nameAst[2] === "css") {
            features.css = true;
            currentIsAsyncFunction = true;
        }
        // async        [ 'dot', [ 'name', 'require' ], 'async' ]
        if (nameAst[0] === "dot" && nameAst[2] === "async") {
            features.async = true;
            currentIsAsyncFunction = true;
        }
        // stats        [ 'dot', [ 'name', 'require' ], 'stats' ]
        if (nameAst[0] === "dot" && nameAst[2] === "stats") {
            features.stats = true;
        }
        // stats_sendto [ 'dot', [ 'dot', [ 'name', 'require' ], 'stats' ], 'sendTo' ]
        if (nameAst[0] === "dot" && nameAst[2] === "sendTo" && nameAst[1][0] === "dot" && nameAst[1][2] === "stats") {
            features.stats_sendto = true;
        }
        // amd          [ 'dot', [ 'name', 'require' ], 'define' ]
        if (nameAst[0] === "dot" && nameAst[2] === "define") {
            features.amd = true;
        }


        if (requireAst[0] === "call") {
            // parallel
            if (currentIsAsyncFunction && requireAst[2][0] && requireAst[2][0] && requireAst[2][0][0] === "array") {
                features.parallel = true;
            }

            // require() || require.js() || require.css() || require.async()
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
        features: features,
        depends: depends
    };
};


var addExtraAmdDepends = function (ast, depends) {
    var lastDefine = findLastDefine(ast);

    // find amd requirements
    for (var i = 0, c = lastDefine[2].length, arg; i < c; i++) {
        arg = lastDefine[2][i];
        if (arg[0] === "array") {
            for (var j = 0, c2 = arg[1].length, dependsName; j < c2; j++) {
                dependsName = arg[1][j][1];
                if (dependsName !== "require" && dependsName !== "module" && dependsName !== "exports") {
                    if (depends.indexOf(dependsName) === -1) {
                        depends.push(dependsName);
                    }
                }
            }
        }
    }

    return depends;
};

var analiseModuleContent = function (moduleOptions) {
    var moduleDescriptor = {
            type: "",
            warns: [],
            code: null,
            depends: [],
            features: {}
        };

    if (moduleOptions.is_shortcut) {
        moduleDescriptor.type = "shortcut";

        return moduleDescriptor;
    }

    var code = fs.readFileSync(moduleOptions.path, 'utf8'),
        ast;

    moduleDescriptor.code = code;

    try {
        JSON.parse(code);
        moduleDescriptor.type = "json";
        return moduleDescriptor;
    } catch (e) {}

    try {
        ast = parser.parse(code);
    } catch (e) {
        moduleDescriptor.type = "string";

        if (/.js$/.test(moduleOptions.path)) {
            moduleDescriptor.type = "error_js";
        }
        return moduleDescriptor;
    }

    if (moduleOptions.is_third_party) {
        moduleDescriptor.type = "3-party";
    } else {
        moduleDescriptor.type = getModuleType(ast);
    }

    switch (moduleDescriptor.type) {
        case "3-party":
            // create lmd module from non-lmd module
            moduleDescriptor.code = wrapNonLmdModule(moduleDescriptor.code, moduleOptions.extra_exports, moduleOptions.extra_require);
            if (moduleOptions.extra_require && moduleOptions.is_sandbox) {
                moduleDescriptor.warns
                    .push('Your module "**' + moduleOptions.path + '**" have to require() some deps, but it sandboxed. ' +
                    'Remove sandbox flag to allow module require().');
            }
            if (typeof moduleOptions.extra_require !== "object") {
                moduleDescriptor.depends.push(moduleOptions.extra_require);
            } else {
                for (var requireVarName in moduleOptions.extra_require) {
                    moduleDescriptor.depends.push(moduleOptions.extra_require[requireVarName]);
                }
            }

            // 3-party module do not know about lmd and it features -> return without analitycs
            return moduleDescriptor;

        case "plain":
            // wrap plain module
            moduleDescriptor.code = wrapPlainModule(moduleDescriptor.code);
            break;

        case "amd":
            moduleDescriptor.code = wrapAmdModule(moduleDescriptor.code);
            break;

        default:
            // wipe tail ;
            moduleDescriptor.code = removeTailSemicolons(moduleDescriptor.code);
    }

    var requireExpressions = findRequireAccesses(ast, moduleDescriptor.type),
        analyticsResult = findModuleRequirementsAndFeatures(requireExpressions);

    moduleDescriptor.features = analyticsResult.features;
    moduleDescriptor.depends = analyticsResult.depends;

    if (moduleDescriptor.type === "amd") {
        moduleDescriptor.features.amd = true;
        moduleDescriptor.depends = addExtraAmdDepends(ast, moduleDescriptor.depends);
    }

    return moduleDescriptor;
};

var collectFlagsWarnings = function (config, deepModulesInfo) {
    var featureWarnings = {},
        result = [];

    // aggregate usage
    for (var moduleName in deepModulesInfo) {
        var features = deepModulesInfo[moduleName].features;
        for (var featureName in features) {
            if (config[featureName] !== true) {
                if (!featureWarnings[featureName]) {
                    featureWarnings[featureName] = [];
                }
                featureWarnings[featureName].push(moduleName);
            }
        }
    }

    for (var featureName in featureWarnings) {
        result.push("Required " + ("\"" + featureName + "\": true").green +
                    ". Some of your modules (" + (featureWarnings[featureName].join(', ')).cyan + ") are uses feature `" + featureName + "`, " +
                    "but it disable in this build");
    }

    return result;
};

/**
 * Checks module type
 *
 * @param {Object|String} code module AST or module Content
 *
 * @return {String} df|fe|plain|amd
 */
var getModuleType = function (code) {
    var ast;

    if (typeof code === "object") {
        ast = code;
    } else {
        try {
            JSON.parse(code);
            return "json";
        } catch (e) {}

        try {
            ast = parser.parse(code);
        } catch (e) {
            return "string";
        }
    }

    // ["toplevel",[["defun","depA",["require"],[]]]]
    if (ast && ast.length === 2 &&
        ast[1] && ast[1].length === 1 &&
        ast[1][0][0] === "defun"
        ) {
        return "fd";
    }

    // ["toplevel",[["stat",["function",null,["require"],[]]]]]
    if (ast && ast.length === 2 &&
        ast[1] && ast[1].length === 1 &&
        ast[1][0][0] === "stat" &&
        ast[1][0][1] &&
        ast[1][0][1][0] === "function"
        ) {
        return "fe";
    }

    if (ast) {
        var isAmd = ast[1].every(function (ast) {
            return ast[0] === "stat" &&
                ast[1][0] === "call" &&
                ast[1][1][0] === "name" &&
                ast[1][1][1] === "define";
        });

        if (isAmd) {
            return "amd";
        }
    }

    return "plain";
};

exports.tryExtend = tryExtend;
exports.collectModules = collectModules;
exports.assembleLmdConfig = assembleLmdConfig;
exports.deepDestructableMerge = deepDestructableMerge;
exports.analiseModuleContent = analiseModuleContent;
exports.collectModulesInfo = collectModulesInfo;
exports.collectFlagsWarnings = collectFlagsWarnings;

exports.PATH_SPLITTER = PATH_SPLITTER;
exports.GLOBALS = GLOBALS;
exports.LMD_JS_SRC_PATH = LMD_JS_SRC_PATH;
exports.LMD_JS_SRC_PATH = LMD_JS_SRC_PATH;
exports.LMD_PLUGINS = LMD_PLUGINS;