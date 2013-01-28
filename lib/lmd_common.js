var fs = require('fs'),
    path = require('path'),
    fileExists = fs.existsSync || path.existsSync,
    uglifyCompress = require("uglify-js"),
    parser = uglifyCompress.parser,
    uglify = uglifyCompress.uglify,
    template = require('lodash-template'),
    glob = require('glob');

require('colors');

var DEFAULT_DEPENDS_MASK = "*.lmd.json";

var SOURCE_TWEAK_FLAGS = ["warn", "log", "pack", "lazy", "optimize"];

exports.SOURCE_TWEAK_FLAGS = SOURCE_TWEAK_FLAGS;

var INHERITABLE_FIELDS = SOURCE_TWEAK_FLAGS.concat(['version', 'main', 'global', 'pack_options', 'mixins']);

var MASTER_FIELDS = INHERITABLE_FIELDS.concat(['output', 'path', 'root', "sourcemap", "sourcemap_inline", "sourcemap_www", "www_root", "name", "description"]);

exports.MASTER_FIELDS = MASTER_FIELDS;

var FILED_ALIASES = {"path": "root"};

exports.GLOBALS = {
    Array               : 1,
    Boolean             : 1,
    Date                : 1,
    decodeURI           : 1,
    decodeURIComponent  : 1,
    encodeURI           : 1,
    encodeURIComponent  : 1,
    Error               : 1,
    'eval'              : 1,
    EvalError           : 1,
    Function            : 1,
    hasOwnProperty      : 1,
    isFinite            : 1,
    isNaN               : 1,
    JSON                : 1,
    Math                : 1,
    Number              : 1,
    Object              : 1,
    parseInt            : 1,
    parseFloat          : 1,
    RangeError          : 1,
    ReferenceError      : 1,
    RegExp              : 1,
    String              : 1,
    SyntaxError         : 1,
    TypeError           : 1,
    URIError            : 1,
	ArrayBuffer          : 1,
	ArrayBufferView      : 1,
	Audio                : 1,
	Blob                 : 1,
	addEventListener     : 1,
	applicationCache     : 1,
	atob                 : 1,
	blur                 : 1,
	btoa                 : 1,
	clearInterval        : 1,
	clearTimeout         : 1,
	close                : 1,
	closed               : 1,
	DataView             : 1,
	DOMParser            : 1,
	defaultStatus        : 1,
	document             : 1,
	Element              : 1,
	event                : 1,
	FileReader           : 1,
	Float32Array         : 1,
	Float64Array         : 1,
	FormData             : 1,
	focus                : 1,
	frames               : 1,
	getComputedStyle     : 1,
	HTMLElement          : 1,
	HTMLAnchorElement    : 1,
	HTMLBaseElement      : 1,
	HTMLBlockquoteElement: 1,
	HTMLBodyElement      : 1,
	HTMLBRElement        : 1,
	HTMLButtonElement    : 1,
	HTMLCanvasElement    : 1,
	HTMLDirectoryElement : 1,
	HTMLDivElement       : 1,
	HTMLDListElement     : 1,
	HTMLFieldSetElement  : 1,
	HTMLFontElement      : 1,
	HTMLFormElement      : 1,
	HTMLFrameElement     : 1,
	HTMLFrameSetElement  : 1,
	HTMLHeadElement      : 1,
	HTMLHeadingElement   : 1,
	HTMLHRElement        : 1,
	HTMLHtmlElement      : 1,
	HTMLIFrameElement    : 1,
	HTMLImageElement     : 1,
	HTMLInputElement     : 1,
	HTMLIsIndexElement   : 1,
	HTMLLabelElement     : 1,
	HTMLLayerElement     : 1,
	HTMLLegendElement    : 1,
	HTMLLIElement        : 1,
	HTMLLinkElement      : 1,
	HTMLMapElement       : 1,
	HTMLMenuElement      : 1,
	HTMLMetaElement      : 1,
	HTMLModElement       : 1,
	HTMLObjectElement    : 1,
	HTMLOListElement     : 1,
	HTMLOptGroupElement  : 1,
	HTMLOptionElement    : 1,
	HTMLParagraphElement : 1,
	HTMLParamElement     : 1,
	HTMLPreElement       : 1,
	HTMLQuoteElement     : 1,
	HTMLScriptElement    : 1,
	HTMLSelectElement    : 1,
	HTMLStyleElement     : 1,
	HTMLTableCaptionElement: 1,
	HTMLTableCellElement : 1,
	HTMLTableColElement  : 1,
	HTMLTableElement     : 1,
	HTMLTableRowElement  : 1,
	HTMLTableSectionElement: 1,
	HTMLTextAreaElement  : 1,
	HTMLTitleElement     : 1,
	HTMLUListElement     : 1,
	HTMLVideoElement     : 1,
	history              : 1,
	Int16Array           : 1,
	Int32Array           : 1,
	Int8Array            : 1,
	Image                : 1,
	length               : 1,
	localStorage         : 1,
	location             : 1,
	MessageChannel       : 1,
	MessageEvent         : 1,
	MessagePort          : 1,
	moveBy               : 1,
	moveTo               : 1,
	MutationObserver     : 1,
	name                 : 1,
	Node                 : 1,
	NodeFilter           : 1,
	navigator            : 1,
	onbeforeunload       : 1,
	onblur               : 1,
	onerror              : 1,
	onfocus              : 1,
	onload               : 1,
	onresize             : 1,
	onunload             : 1,
	open                 : 1,
	openDatabase         : 1,
	opener               : 1,
	Option               : 1,
	parent               : 1,
	print                : 1,
	removeEventListener  : 1,
	resizeBy             : 1,
	resizeTo             : 1,
	screen               : 1,
	scroll               : 1,
	scrollBy             : 1,
	scrollTo             : 1,
	sessionStorage       : 1,
	setInterval          : 1,
	setTimeout           : 1,
	SharedWorker         : 1,
	status               : 1,
	top                  : 1,
	Uint16Array          : 1,
	Uint32Array          : 1,
	Uint8Array           : 1,
	WebSocket            : 1,
	window               : 1,
	Worker               : 1,
	XMLHttpRequest       : 1,
	XMLSerializer        : 1,
	XPathEvaluator       : 1,
	XPathException       : 1,
	XPathExpression      : 1,
	XPathNamespace       : 1,
	XPathNSResolver      : 1,
	XPathResult          : 1,
    escape  : 1,
   	unescape: 1,
	alert  : 1,
	confirm: 1,
	console: 1,
	Debug  : 1,
	opera  : 1,
	prompt : 1
};

exports.WORKER_GLOBALS = {
	importScripts: 1,
	postMessage  : 1,
	self         : 1
};

exports.NODE_GLOBALS = {
	__filename   : 1,
	__dirname    : 1,
	Buffer       : 1,
	console      : 1,
	exports      : 1,
	GLOBAL       : 1,
	global       : 1,
	module       : 1,
	process      : 1,
	require      : 1,
	setTimeout   : 1,
	clearTimeout : 1,
	setInterval  : 1,
	clearInterval: 1
};

exports.LMD_GLOBALS = {
	exports: 1,
	module: 1,
	require: 1
};

// required to check string for being template
var templateParts = /<%|\$\{/,
    reLmdFile = /\.lmd\.json$/,
    globPattern = /\*|\{|\}/,
    maxInterpolateRecursion = 10;

exports.RE_LMD_FILE = reLmdFile;

/**
 * It uses _.template to interpolate config strings
 * {
 *   "output": "index-<%= version %>.js",
 *   "version": "1.0.1"
 * }
 *
 * ->
 *
 * {
 *   "output": "index-1.0.1.js",
 *   "version": "1.0.1"
 * }
 *
 * @param {Object} config
 * @param {Object} [data]
 *
 * @return {Object} config'
 */
function interpolateConfigStrings(config, data) {
    data = data || config;

    for (var key in config) {
        var value = config[key];

        if (typeof value === "object") {
            config[key] = interpolateConfigStrings(value, data);
        } else if (typeof value === "string") {
            var currentInterpolation = 0;
            while (templateParts.test(value)) {
                currentInterpolation++;
                if (currentInterpolation > maxInterpolateRecursion) {
                    break;
                }
                config[key] = value = template(value, data);
            }
        }
    }

    return config;
}

// require() is Caches json files
var readConfig = function (file/*, filePart, filePart*/) {
    file = path.join.apply(path, arguments);

    return interpolateConfigStrings(JSON.parse(fs.readFileSync(file, 'utf8')));
};
exports.readConfig = readConfig;


var LMD_JS_SRC_PATH = path.join(__dirname, '../src');
exports.LMD_JS_SRC_PATH = LMD_JS_SRC_PATH;


var LMD_PLUGINS = readConfig(LMD_JS_SRC_PATH, 'lmd_plugins.json');
exports.LMD_PLUGINS = LMD_PLUGINS;


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
exports.deepDestructableMerge = deepDestructableMerge;

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

    var parentConfig = tryExtend(readConfig(configDir, config.extends), configDir);

    return deepDestructableMerge(parentConfig, config);
};
exports.tryExtend = tryExtend;

/**
 * Returns depends config file of this module
 *
 * @param {String} modulePath
 * @param {String} dependsFileMask
 *
 * @return {String}
 */
var getDependsConfigOf = function (modulePath, dependsFileMask) {
    var fileName = modulePath.replace(/^.*\/|\.[a-z0-9]+$/g, '');

    return path.join(path.dirname(modulePath), dependsFileMask.replace('*', fileName));
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

    // Apply User Plugins
    configA.plugins = configA.plugins || {};
    configB.plugins = configB.plugins || {};
    for (var pluginName in configB.plugins) {
        // Warn if module exists an its not a master
        if (!isMasterConfig && configA.plugins[pluginName]) {
            configA.errors.push('Name conflict! User plugin **"' + pluginName + '"** will be overwritten by ' + context);
        }
        configA.plugins[pluginName] = configB.plugins[pluginName];
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
    configFile = fs.realpathSync(configFile);
    usedConfigs[configFile] = true; // mark config as used

    var configDir = path.dirname(configFile);

    var rawConfig = readConfig(configFile),
        configs = [],
        resultConfig = {
            modules: {},
            errors: [],
            plugins_depends: {}
        };

    if (extraOptions && extraOptions.mixins) {
        rawConfig = deepDestructableMerge(rawConfig, {
            mixins: extraOptions.mixins
        });
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
            var parentConfig = assembleLmdConfig(parentConfigFile, flagsNames, null, usedConfigs);
        }
    }

    var processedConfig = {
        modules: modules,
        plugins: collectUserPlugins(rawConfig, configDir)
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
        if (extraOptions) {
            extraOptions.modules = collectModules(extraOptions, configDir);
            mergeConfigs(resultConfig, extraOptions, flagsNames, MASTER_FIELDS, true, 'CLI options');
        }
        reapplyModuleOptions(resultConfig);
        addPluginsDepends(resultConfig);
    }
    return resultConfig;
};
exports.assembleLmdConfig = assembleLmdConfig;

function addPluginsDepends(resultConfig) {
    for (var pluginName in LMD_PLUGINS) {
        if (typeof resultConfig[pluginName] !== "undefined") {
            addOnePluginDepends(pluginName, resultConfig);
        }
    }
}

function collectUserPlugins(resultConfig, configDir) {
    var plugins = resultConfig.plugins,
        collectedPlugins = {};

    if (typeof plugins !== "object") {
        return collectedPlugins;
    }

    var rootDir = path.join(configDir, resultConfig.path || resultConfig.root),
        invalidPluginNames = [],
        plugin,
        pluginName,
        pluginOriginalPath,
        pluginPath,
        pluginExists,
        pluginConflict,
        pluginValid,
        pluginOptions,
        pluginCode;

    // format plugin descriptor struct
    for (pluginName in plugins) {
        plugin = plugins[pluginName];

        pluginOptions = (typeof plugin === "string" ? null : plugin.options) || null;
        pluginOriginalPath = (typeof plugin === "string" ? plugin : plugin.path) || '';
        pluginPath = path.join(rootDir, pluginOriginalPath);
        pluginExists = true;

        try {
            pluginPath = fs.realpathSync(pluginPath);
        } catch (e) {
            pluginExists = false;
        }

        pluginConflict = pluginName in LMD_PLUGINS;
        pluginValid = false;
        pluginCode = null;
        if (!pluginConflict && pluginExists) {
            pluginCode = fs.readFileSync(pluginPath, 'utf8');
            pluginValid = validateUserPlugin(pluginCode);
        }

        collectedPlugins[pluginName] = {
            name: pluginName,
            isConflict: pluginConflict,
            isExists: pluginExists,
            isValid: pluginValid,
            isOk: !pluginConflict && pluginExists && pluginValid,
            originalPath: pluginOriginalPath,
            path: pluginPath,
            code: pluginCode,
            options: pluginOptions
        };
    }

    return collectedPlugins;
}

function validateUserPlugin(code) {
    var ast;

    try {
        ast = parser.parse(code);
    } catch (e) {
        return e.toString();
    }

    // should match this pattern
    // ["toplevel", [["stat", ["call", ["function", null, ["sb"],[*]],[["name", "sandbox"]]]]]];
    return (
        ast && ast.length === 2 &&
        ast[1] && ast[1].length === 1 &&
        ast[1][0][0] === "stat" &&
        ast[1][0][1] &&
        ast[1][0][1][0] === "call" &&
        ast[1][0][1][1] &&
        ast[1][0][1][1][0] === "function"
    );
}

function addOnePluginDepends(pluginName, resultConfig) {
    var plugin = LMD_PLUGINS[pluginName];
    if (plugin.depends) {
        plugin.depends.forEach(function (flagName) {
            // check that depends is plugin and that plugin is not included
            if (flagName in LMD_PLUGINS && typeof resultConfig[flagName] === "undefined") {
                // add flag as true
                resultConfig[flagName] = true;

                // add flag to plugins_depends list
                if (!resultConfig.plugins_depends[flagName]) {
                    resultConfig.plugins_depends[flagName] = [];
                }
                resultConfig.plugins_depends[flagName].push(pluginName);

                // recursively check plugin depends
                addOnePluginDepends(flagName, resultConfig);
            }
        });
    }
}

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
    var modules = {},
        globalLazy = config.lazy || false,
        globalDepends = (config.depends === true ? DEFAULT_DEPENDS_MASK : config.depends) || false,
        moduleLazy = false,
        moduleName,
        modulePath,
        moduleRealPath,
        moduleExists,
        moduleExports,
        moduleRequire,
        moduleFileName,
        moduleFilePath,
        moduleDesciptor,
        wildcardRegex,
        moduleData,
        modulesDirPath = config.root || config.path || '';

    if (modulesDirPath[0] !== '/') { // non-absolute
        modulesDirPath = path.join(configDir, modulesDirPath);
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

        // its a glob pattern
        // @see https://github.com/isaacs/node-glob
        if (globPattern.test(modulePath)) {
            var globModules = glob.sync(modulePath, {
                cwd: modulesDirPath,
                nosort: true
            });

            // * -> <%= file => for backward capability
            var moduleNameTemplate = template(moduleName.replace('*', '<%= file %>'));

            globModules.forEach(function (module) {
                var moduleRealPath = path.join(modulesDirPath, module),
                    fileParts = path.basename(moduleRealPath).split('.'),
                    file = fileParts[0],
                    ext = fileParts[1],
                    dir = path.dirname(moduleRealPath).split(path.sep).reverse();

                // modify module name using template
                var newModuleName = moduleNameTemplate({
                    file: file,
                    ext: ext,
                    dir: dir
                });

                moduleExists = true;
                try {
                    moduleRealPath = fs.realpathSync(moduleRealPath);
                } catch (e) {
                    moduleExists = false;
                }

                moduleData = {
                    originalModuleDesciptor: moduleDesciptor,
                    name: newModuleName,
                    path: moduleRealPath,
                    originalPath: modulePath,
                    lines: 0,
                    extra_exports: moduleExports,
                    extra_require: moduleRequire,
                    is_exists: moduleExists,
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
                is_exists: true,
                is_third_party: !!moduleExports || !!moduleRequire,
                is_lazy: moduleLazy,
                is_greedy: false,
                is_shortcut: true,
                is_coverage: false,
                is_sandbox: moduleDesciptor.sandbox || false,
                depends: typeof moduleDesciptor.depends === "undefined" ? globalDepends : moduleDesciptor.depends
            };
        } else {

            moduleRealPath = path.join(modulesDirPath, modulePath);
            moduleExists = true;

            try {
                moduleRealPath = fs.realpathSync(moduleRealPath);
            } catch (e) {
                moduleExists = false;
            }
            // normal name
            // "name": "name.js"
            modules[moduleName] = {
                originalModuleDesciptor: moduleDesciptor,
                name: moduleName,
                path: moduleRealPath,
                originalPath: modulePath,
                lines: 0,
                extra_exports: moduleExports,
                extra_require: moduleRequire,
                is_exists: moduleExists,
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
exports.collectModules = collectModules;

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
exports.collectModulesInfo = collectModulesInfo;

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
    return code.replace(/\n*;\n*$/, '');
};

/**
 * Aggregates all module wrappers
 *
 * @param code
 * @param moduleOptions
 * @param moduleType
 *
 * @return {String}
 */
var wrapModule = function (code, moduleOptions, moduleType) {
    switch (moduleType) {
        case "3-party":
            // create lmd module from non-lmd module
            code = wrapNonLmdModule(code, moduleOptions.extra_exports, moduleOptions.extra_require);
            break;

        case "plain":
            // wrap plain module
            code = wrapPlainModule(code);
            break;

        case "amd":
            // AMD RequireJS
            code = wrapAmdModule(code);
            break;

        case "fd":
        case "fe":
            // wipe tail ;
            code = removeTailSemicolons(code);
    }

    return code;
};
exports.wrapModule = wrapModule;

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
        case "3-party":
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

        // promise           [ 'dot', [ 'call', [ 'dot', [Object], 'js' ], [ [Object] ] ], 'then' ]
        if (nameAst[0] === "dot" && nameAst[2] === "then" && nameAst[1] && nameAst[1][0] === "call" ) {
            features.promise = true;
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
    if (!ast[1].length) return depends;
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
            originalCode: null,
            depends: [],
            features: {}
        };

    if (moduleOptions.is_shortcut) {
        moduleDescriptor.type = "shortcut";
        moduleDescriptor.features.shortcuts = true;

        return moduleDescriptor;
    }

    if (!moduleOptions.is_exists) {
        moduleDescriptor.type = "not-exists";

        return moduleDescriptor;
    }

    var code = fs.readFileSync(moduleOptions.path, 'utf8'),
        ast;

    moduleDescriptor.code = code;
    moduleDescriptor.originalCode = code;

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
            moduleDescriptor.type = "string";
            moduleDescriptor.warns
                .push('File "**' + module.path + '**" has extension **.js** and LMD detect an parse error. \n' +
                    e.toString().red +
                    '\nThis module will be string. Please check the source.');
        }
        return moduleDescriptor;
    }

    if (moduleOptions.is_third_party) {
        moduleDescriptor.type = "3-party";
    } else {
        moduleDescriptor.type = getModuleType(ast);
    }

    moduleDescriptor.code = wrapModule(moduleDescriptor.code, moduleOptions, moduleDescriptor.type);

    if (moduleDescriptor.type === "3-party") {
        if (moduleOptions.extra_require && moduleOptions.is_sandbox) {
            moduleDescriptor.warns
                .push('Your module "**' + moduleOptions.path + '**" have to require() some deps, but it sandboxed. ' +
                'Remove sandbox flag to allow module require().');
        }
        if (typeof moduleOptions.extra_require !== "object") {
            // #81 Falsy warnings appears after adding 3-party modules
            if (typeof moduleOptions.extra_require === "string") {
                moduleDescriptor.depends.push(moduleOptions.extra_require);
            }
        } else {
            for (var requireVarName in moduleOptions.extra_require) {
                moduleDescriptor.depends.push(moduleOptions.extra_require[requireVarName]);
            }
        }
    }

    var requireExpressions = findRequireAccesses(ast, moduleDescriptor.type),
        analyticsResult = findModuleRequirementsAndFeatures(requireExpressions);

    moduleDescriptor.features = analyticsResult.features;
    moduleDescriptor.depends = moduleDescriptor.depends.concat(analyticsResult.depends);

    moduleDescriptor.depends = moduleDescriptor.depends.filter(function(item, index, array) {
        return array.indexOf(item, index + 1) < 0;
    });

    if (moduleDescriptor.type === "amd") {
        moduleDescriptor.features.amd = true;
        moduleDescriptor.depends = addExtraAmdDepends(ast, moduleDescriptor.depends);
    }

    return moduleDescriptor;
};
exports.analiseModuleContent = analiseModuleContent;

var collectFlagsWarnings = function (config, deepModulesInfo) {
    var featureWarnings = {},
        result = [],
        is_using_shortcuts = false,
        is_using_amd = false;

    // aggregate usage
    for (var moduleName in deepModulesInfo) {
        if (deepModulesInfo[moduleName].type === "amd") {
            is_using_amd = true;
        }
        if (deepModulesInfo[moduleName].type === "shortcut") {
            is_using_shortcuts = true;
        }
        var features = deepModulesInfo[moduleName].features;
        for (var featureName in features) {
            if (typeof config[featureName] === "undefined" || config[featureName] === false) {
                if (!featureWarnings[featureName]) {
                    featureWarnings[featureName] = [];
                }
                featureWarnings[featureName].push(moduleName);
            }
        }
    }

    for (var featureName in featureWarnings) {
        result.push("Required " + ("\"" + featureName + "\"").green + ": " + "true".green +
                    ". Some of your modules (" + (featureWarnings[featureName].join(', ')).cyan + ") are uses feature " + ("`" + featureName + "`").green + ", " +
                    "but it disable in this build.");
    }

    if (!is_using_shortcuts && config.shortcuts) {
        result.push('Config flag ' + '`shortcuts`'.green + ' is enabled, but there is no shortcuts in your package. ' +
                  'Disable that flag to optimize your package.');
    }

    if (!is_using_amd && config.amd) {
        result.push('Config flag ' + '`amd`'.green + ' is enabled, but there is no AMD Modules in your package. ' +
                  'Disable that flag to optimize your package.');
    }

    if (config.stats_coverage && (config.cache || config.cache_async)) {
        result.push('LMD will cache your modules under code coverage. You can disable ' + '`cache`'.green + ' and ' + '`cache_async`'.green + ' flags.');
    }

    if (config.async_plain && config.async_plainonly) {
        result.push('You are using both config flags ' + '`async_plain`'.green + ' and ' + '`async_plainonly`'.green + '. Disable one to optimise your source.');
    }

    if (!config.stats_coverage && config.stats_coverage_async) {
        result.push('You are using ' + '`stats_coverage_async`'.green + ' without ' + '`stats_coverage`'.green + '. Enable ' + '`stats_coverage`'.green + ' flag.');
    }

    if (!config.async && config.stats_coverage_async) {
        result.push('You are using ' + '`stats_coverage_async`'.green + ' but not using ' + '`async`'.green + '. Disable ' + '`stats_coverage_async`'.green + ' flag.');
    }

    if ('promise' in config && typeof config.promise !== "string") {
        result.push('`promise`'.green + ' should be a string pointing to the deferred factory function. eg ' + '"promise"'.green + ': ' + '"$.Deferred"'.green);
    }

    var warnings = {
        globals: 'Some of your modules are undeclared (register them as ' + '"name"'.green + ': ' + '"@shortcut"'.green + ' or use directly if they are globals):',
        modules: 'Some of our modules are probably off-package (you can register them as ' + '"name"'.green + ': ' + '"@shortcut"'.green + '):',
        unused: 'Some of your modules are declared but not used:'
    };

    var suspiciousNames = getSuspiciousNames(config, deepModulesInfo);
    Object.keys(warnings).forEach(function (warningName) {
        if (suspiciousNames[warningName].length) {
            result.push(warnings[warningName]);
            suspiciousNames[warningName].forEach(function (name) {
                result.push('    - ' + name.toString().yellow);
            });
            result.push('');
        }
    });

    // User plugins warnings
    var plugins = config.plugins,
        pluginInfo,
        badPlugins = [];

    for (var pluginName in plugins) {
        pluginInfo = plugins[pluginName];
        if (!pluginInfo.isOk) {
            badPlugins.push(pluginName.cyan);
        }
        if (pluginInfo.isConflict) {
            result.push('User plugin "' + pluginName.toString().cyan + '": "' + pluginInfo.originalPath.red + '" should not be named as internal plugin.');
            continue;
        }
        if (!pluginInfo.isExists) {
            result.push('User plugin "' + pluginName.toString().cyan + '": "' + pluginInfo.originalPath.red + '" (' + pluginInfo.path.red + ') is not exists.');
            continue;
        }
        if (!pluginInfo.isValid) {
            result.push('User plugin "' + pluginName.toString().cyan + '": "' + pluginInfo.originalPath.red + '" is not valid. ' +
                'It should be IIFE eg (function(sb){var your_code;}(sandbox));');
        }
    }

    if (badPlugins.length) {
        result.push('User plugins "' + badPlugins.join('", "') + '" will be excluded from this build.');
    }

    return result;
};
exports.collectFlagsWarnings = collectFlagsWarnings;

var collectFlagsNotifications = function (config) {
    var result = [], dependsOf;
    if (config.plugins_depends) {
        for (var dependsName in config.plugins_depends) {
            dependsOf = config.plugins_depends[dependsName];

            result.push('Extra plugin was added ' + ('"' + dependsName + '"').green + ': ' + 'true'.green + '. This is depends of ' + dependsOf.join(', ').cyan + '.');
        }
    }

    return result;
};
exports.collectFlagsNotifications = collectFlagsNotifications;

function getGlobals(config) {
    var result = {},
        names = ['GLOBALS'];

    if (config.node) {
        names.push('NODE_GLOBALS');
    }

    if (config.worker) {
        names.push('WORKER_GLOBALS');
    }

    names.forEach(function (name) {
        var globalNames = exports[name];
        for (var name in globalNames) {
            result[name] = globalNames[name];
        }
    });

    return result;
}
exports.getGlobals = getGlobals;

function discoverModuleType(moduleName, modulesNames, globalsNames) {
    if (modulesNames.indexOf(moduleName) != -1) {
        return 'in-package';
    }

    if (typeof globalsNames[moduleName] !== "undefined") {
        return 'global';
    }

    if (/\.[a-z]{1,}$/.test(moduleName)) {
        return 'off-package?';
    }

    return 'global?';
}
exports.discoverModuleType = discoverModuleType;

function getSuspiciousNames(config, deepModulesInfo) {
    var modules = config.modules || {},
        modulesNames = Object.keys(modules),
        globalsNames = getGlobals(config),
        suspiciousNames = {
            globals: [],
            modules: [],
            unused: []
        },
        suspiciousNamesIndex = {
            globals: {},
            modules: {},
            unused: {}
        };

    if (!modulesNames.length) {
        return suspiciousNames;
    }

    modulesNames.forEach(function (name) {

        if (!suspiciousNamesIndex.unused.hasOwnProperty(name)) {
            suspiciousNamesIndex.unused[name] = false;
        }
        var depends = deepModulesInfo[name].depends;
        if (depends.length) {
            depends.forEach(function (name) {
                var moduleType = discoverModuleType(name, modulesNames, globalsNames);
                // skip special LMD names
                if (typeof exports.LMD_GLOBALS[name] !== "undefined") {
                    return;
                }

                if (moduleType === 'global?' && !suspiciousNamesIndex.globals[name]) {
                    suspiciousNamesIndex.globals[name] = true;
                    suspiciousNames.globals.push(name);
                }

                if (moduleType === 'off-package?' && !suspiciousNamesIndex.modules[name]) {
                    suspiciousNamesIndex.modules[name] = true;
                    suspiciousNames.modules.push(name);
                }

                suspiciousNamesIndex.unused[name] = true;
            });
        }
    });

    // add unused
    modulesNames.forEach(function (name) {
        if (config.main === name) {
            return;
        }
        if (!suspiciousNamesIndex.unused[name]) {
            suspiciousNames.unused.push(name);
        }
    });

    return suspiciousNames;
}
exports.getSuspiciousNames = getSuspiciousNames;

/**
 * Checks module type
 *
 * @param {Object|String} code module AST or module Content
 *
 * @return {String} df|fe|plain|amd
 */
function getModuleType (code) {
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

    // Empty module
    if (ast.length === 2 && !ast[1].length && ast[0] === 'toplevel') return "plain";

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
}
