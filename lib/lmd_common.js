var fs = require('fs'),
    fileExists = fs.existsSync || require('path').existsSync;

var PATH_SPLITTER = /\/|\\/;
var DEFAULT_DEPENDS_MASK = "*.lmd.json";
var MASTER_FIELDS = ['version', 'main', 'global', 'lazy', 'pack'];

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
var mergeConfigs = function (configA, configB, flagsNames, isMasterConfig, context) {
    if (isMasterConfig) {
        // Apply master fields
        MASTER_FIELDS.forEach(function (fieldName) {
            if (typeof configB[fieldName] !== "undefined") {
                configA[fieldName] = configB[fieldName];
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
 * @param {String[]} flagsNames
 * @param {Object}   [usedConfigs]
 *
 * @return {Object}
 */
var assembleLmdConfig = function (configFile, flagsNames, usedConfigs) {
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
                            config: assembleLmdConfig(dependsConfigPath, flagsNames, usedConfigs)
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
            var parentConfig =  assembleLmdConfig(parentConfigFile, flagsNames, usedConfigs);
        }
    }

    var processedConfig = {
        modules: modules
    };

    // keep fields
    MASTER_FIELDS.forEach(function (fieldName) {
        processedConfig[fieldName] = rawConfig[fieldName];
    });

    // keep flags
    flagsNames.forEach(function (fieldName) {
        processedConfig[fieldName] = rawConfig[fieldName];
    });

    if (parentConfig) {
        mergeConfigs(resultConfig, parentConfig, flagsNames, true, 'parent config **' + parentConfigFile + '**');
    }

    for (var i = 0, c = configs.length, dependsMainModuleName; i < c; i++) {
        // Cleanup main module from depends
        dependsMainModuleName = configs[i].config.main || "main";
        if (configs[i].config.modules) {
            delete configs[i].config.modules[dependsMainModuleName];
        }
        mergeConfigs(resultConfig, configs[i].config, flagsNames, false, configs[i].context);
    }

    mergeConfigs(resultConfig, processedConfig, flagsNames, true, 'main config **' + configFile + '**');

    if (isFirstRun) {
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
        globalLazy = typeof config.lazy === "undefined" ? true : config.lazy,
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
            moduleLazy = typeof moduleDesciptor.lazy === "undefined" ? globalLazy : moduleDesciptor.lazy;
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
    var globalLazy = typeof config.lazy === "undefined" ? true : config.lazy,
        moduleName,
        moduleDesciptor,
        moduleLazy;

    for (moduleName in config.modules) {
        moduleDesciptor = config.modules[moduleName].originalModuleDesciptor;

        if (typeof moduleDesciptor === "string") {
            moduleLazy = globalLazy;
        } else {
            moduleLazy = typeof moduleDesciptor.lazy === "undefined" ? globalLazy : moduleDesciptor.lazy;
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

exports.tryExtend = tryExtend;
exports.collectModules = collectModules;
exports.assembleLmdConfig = assembleLmdConfig;

exports.PATH_SPLITTER = PATH_SPLITTER;