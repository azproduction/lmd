var fs = require('fs');

var PATH_SPLITTER = /\/|\\/;

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

/**
 * @name LmdModuleStruct
 * @class
 *
 * @field {String}  name        module name
 * @field {String}  path        full path to module
 * @field {Boolean} is_lazy     is lazy module?
 * @field {Boolean} is_sandbox  is module sandboxed?
 * @field {Boolean} is_greedy   module is collected using wildcard
 * @field {Boolean} is_shortcut is module shortcut?
 * @field {Boolean} is_coverage is module under code coverage?
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
        moduleLazy = false,
        moduleName,
        modulePath,
        moduleExports,
        descriptor,
        moduleDesciptor,
        wildcardRegex,
        moduleData,
        path =  config.path || '';

    if (path[0] !== '/') { // non-absolute
        path = configDir + '/' + path;
    }

    function isCoverage(moduleName) {
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

    // grep paths
    for (moduleName in config.modules) {
        moduleDesciptor = config.modules[moduleName];
        // case "moduleName": "path/to/module.js"
        if (typeof moduleDesciptor === "string") {
            moduleExports = false;
            modulePath = moduleDesciptor;
            moduleLazy = globalLazy;
        } else { // case "moduleName": {"path": "path/to/module.js", "lazy": false}
            moduleExports = moduleDesciptor.exports || false;
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
                        name: newModuleName,
                        path: fs.realpathSync(path + descriptor.path + fileName),
                        extra_exports: moduleExports,
                        is_lazy: moduleLazy,
                        is_greedy: true,
                        is_shortcut: false,
                        is_coverage: isCoverage(newModuleName),
                        // sandbox 3-party modules
                        is_sandbox: moduleDesciptor.sandbox || !!moduleExports || false
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
                name: moduleName,
                path: modulePath,
                extra_exports: moduleExports,
                is_lazy: moduleLazy,
                is_greedy: false,
                is_shortcut: true,
                is_coverage: false,
                // sandbox 3-party modules
                is_sandbox: moduleDesciptor.sandbox || !!moduleExports || false
            };
        } else {
            // normal name
            // "name": "name.js"
            modules[moduleName] = {
                name: moduleName,
                path: fs.realpathSync(path + modulePath),
                extra_exports: moduleExports,
                is_lazy: moduleLazy,
                is_greedy: false,
                is_shortcut: false,
                is_coverage: isCoverage(moduleName),
                // sandbox 3-party modules
                is_sandbox: moduleDesciptor.sandbox || !!moduleExports || false
            };
        }
    }

    return modules;
};

exports.tryExtend = tryExtend;
exports.collectModules = collectModules;

exports.PATH_SPLITTER = PATH_SPLITTER;