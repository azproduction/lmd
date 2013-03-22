var Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    template = require('lodash-template'),
    glob = require('glob'),
    arrayUnique = require('../utils').arrayUnique,
    NodeModule = require('module').Module,
    ShortcutModule = require('../module/shortcutModule');

var Bundle = require('../bundle');

var LMD_ROOT = path.join(__dirname, '..', '..');

var DEFAULT_DEPENDS_MASK = '*.lmd.json';

// lmd/src/lmd_plugins.json
var LMD_PLUGINS = require(path.join(LMD_ROOT, 'src', 'lmd_plugins.json'));
var LMD_PLUGINS_NAMES = Object.keys(LMD_PLUGINS);

var SOURCE_TWEAK_FIELDS = ['warn', 'log', 'pack', 'lazy', 'optimize'];
var INHERITABLE_FIELDS = SOURCE_TWEAK_FIELDS.concat(['version', 'main', 'global', 'pack_options', 'mixins', 'bundles_callback']);
var ALL_KNOWN_FIELDS = INHERITABLE_FIELDS.concat(['output', 'path', 'root', 'sourcemap', 'sourcemap_inline', 'sourcemap_www', 'www_root', 'name', 'description']);

var FILED_ALIASES = {"path": "root"};

// required to check string for being template
var templateParts = /<%|\$\{/,
    reLmdFile = /\.lmd\.(json|js)$/,
    globPattern = /\*|\{|\}/,
    maxInterpolateRecursion = 10;

var readFile = Q.nfbind(fs.readFile);

/**
 * @param {String} id
 * @param {String} configFile
 * @param {Object} [extraOptions={}]
 *
 * @constructor
 */
var Build = function (id, configFile, extraOptions) {
    this.id = id;

    this.isMain = true;
    this.configFile = configFile;
    this.config = null;
    this.extraOptions = extraOptions || {};

    this.warnings = [];
    this.plugins = [];

    // build files that already used
    this.buildCache = {};

    /**
     * @type {Bundle}
     */
    this.bundle = null;

    this.deferred = Q.defer();
    this.promise = this.deferred.promise;
};
module.exports = Build;

/**
 *
 * @param id
 * @param configFile
 *
 * @constructor
 */
Build.asSubBuild = function (id, configFile) {
    Build.call(this, id, configFile);

    this.isMain = false;
};
Build.asSubBuild.prototype = Build.prototype;

/**
 *
 * @param config
 *
 * @constructor
 */
Build.fromExtraOptions = function (config) {
    Build.call(this, 'Extra options', void 0);

    this.isMain = false;
    this.config = config;
    this.deferred.resolve();
};
Build.fromExtraOptions.prototype = Build.prototype;

/**
 *
 */
Build.prototype.load = function () {
    var self = this;
    if (this.deferred.isResolved()) {
        return this.promise;
    }

    this.buildCache[this.configFile] = this;

    this.readConfig(this.configFile)
        .then(function (config) {
            self.config = config;

            return self.configure();
        })
        .then(this.deferred.resolve, this.deferred.reject);

    return this.promise;
};

/**
 *
 */
Build.prototype.configure = function () {
    var self = this;

    this.applyExtraOptions();
    this.setDefaultValues();

    return this.extendsBy(self.config['extends'])
        .then(function () {
            return this.addModulesDepends();
        })
        .then(function () {
            return self.mixWith(self.config.mixins);
        })
        .then(function () {
            self.bundle = new Bundle('.', self.config);
            return self.bundle.load();
        });
};

/**
 *
 * @param {Build} build
 */
Build.prototype.useBuildCacheOf = function (build) {
    this.buildCache = build.buildCache;
};

/**
 *
 * @param {Build} build
 */
Build.prototype.addCache = function (build) {
    this.buildCache[build.configFile] = build;
};

/**
 *
 * @param {String} configFile
 */
Build.prototype.isCache = function (configFile) {
    return configFile in this.buildCache;
};

/**
 *
 */
Build.prototype.applyExtraOptions = function () {
    var tempBuild = new Build.fromExtraOptions(this.extraOptions);

    // Share cache object
    tempBuild.useBuildCacheOf(this);

    this.mergeWith(tempBuild, ALL_KNOWN_FIELDS);
};

/**
 *
 */
Build.prototype.setDefaultValues = function () {
    var config = this.config.root;

    config.lazy = config.lazy || false;
    config.pack = config.lazy ? true : (config.pack || false);
    config.root = config.root || config.path || '';
    config.depends = (config.depends === true ? DEFAULT_DEPENDS_MASK : config.depends) || false;
};

/**
 * @param {String} configFile
 */
Build.prototype.extendsBy = function (configFile) {
    if (!configFile || this.isCache(configFile)) {
        return Q.resolve();
    }
    this.addCache(configFile);

    var self = this,
        build = new Build.asSubBuild(configFile, configFile);

    build.useBuildCacheOf(this);

    return build.load().then(function () {
        self.mergeWith(build, INHERITABLE_FIELDS);
    });
};

/**
 *
 */
Build.prototype.addModulesDepends = function () {
    var modules = this.config.modules || {},
        depends = this.config.depends;

    if (!depends) {
        return Q.resolve();
    }

    // TODO ???
    var dependsPaths = Object.keys(modules).reduce(function (paths, moduleObject) {
        // Not a shortcut
        if (ShortcutModule.is(moduleObject)) {
            return paths;
        }

        var path = typeof moduleObject === "string" ? moduleObject : moduleObject.path;

        return paths;
    }, []);
    // find list of depends
        // for each
            // check if not in cache
                // create build
                // add to cache
                // add shared cache
                // extend
};

/**
 * @param {Array} buildNames
 */
Build.prototype.mixWith = function (buildNames) {
    if (!buildNames || !buildNames.length) {
        return Q.resolve();
    }
};

/**
 * @param {Build} build
 * @param {Array} allowedFields
 */
Build.prototype._mergeFields = function (build, allowedFields) {
    var configA = this.config,
        configB = build.config;

    allowedFields.forEach(function (fieldName) {
        if (typeof configB[fieldName] !== "undefined") {
            configA[fieldName] = configB[fieldName];
            if (FILED_ALIASES.hasOwnProperty(fieldName)) {
                configA[FILED_ALIASES[fieldName]] = configB[fieldName];
            }
        }
    });
};

/**
 * Merges configs flags
 *
 * @param {Build}   build
 * @param {Boolean} [isModuleDepends=false]
 *
 * @private
 */
Build.prototype._mergeLmdPlugins = function (build, isModuleDepends) {
    isModuleDepends = isModuleDepends || false;

    var configA = this.config,
        configB = build.config;

    // Apply plugins
    LMD_PLUGINS_NAMES.forEach(function (optionsName) {
        // if master -> B
        if (typeof configB[optionsName] === "undefined") {
            return;
        }

        if (!isModuleDepends) {
            configA[optionsName] = configB[optionsName];
        } else {
            // if A literal B array -> B
            if (Array.isArray(configB[optionsName]) && !Array.isArray(configA[optionsName]) ) {
                configA[optionsName] = configB[optionsName];
            } else if (Array.isArray(configB[optionsName]) && Array.isArray(configA[optionsName])) {
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
};

/**
 *
 * @param build
 *
 * @private
 */
Build.prototype._mergeWarnings = function (build) {
    // Save warnings
    this.warnings = this.warnings.concat(build.warnings);
};

/**
 * Merges collections
 *
 * @param {Build}   build
 * @param {String}  collectionName
 * @param {String}  collectionItemTitle
 * @param {Boolean} [isWarnAboutConflicts=false]
 *
 * @private
 */
Build.prototype._mergeCollection = function (build, collectionName, collectionItemTitle, isWarnAboutConflicts) {
    var self = this;
    isWarnAboutConflicts = isWarnAboutConflicts || false;

    var configA = this.config,
        configB = build.config;

    // Apply defaults
    configA[collectionName] = configA[collectionName] || {};
    configB[collectionName] = configB[collectionName] || {};

    var collectionA = configA[collectionName],
        collectionB = configB[collectionName];

    Object.keys(collectionB).forEach(function (itemName) {
        // Warn if module exists an its not a master config
        if (isWarnAboutConflicts && collectionA[itemName]) {
            self.warnings.push(
                'Name conflict! ' + collectionItemTitle + ' "' + itemName.green +
                '" will be overwritten by ' + build.id + (build.configFile ? ' ' + build.configFile.green : '')
            );
        }
        collectionA[itemName] = collectionB[itemName];
    });
};

/**
 * Merges modules
 *
 * @param {Build}   build
 * @param {Boolean} [isWarnAboutConflicts=false]
 *
 * @private
 */
Build.prototype._mergeModules = function (build, isWarnAboutConflicts) {
    this._mergeCollection(build, 'modules', 'Module', isWarnAboutConflicts);
};

/**
 * Merges bundles
 *
 * @param {Build}   build
 * @param {Boolean} [isWarnAboutConflicts=false]
 *
 * @private
 */
Build.prototype._mergeBundles = function (build, isWarnAboutConflicts) {
    this._mergeCollection(build, 'bundles', 'Bundle', isWarnAboutConflicts);
};

/**
 * Merges plugins
 *
 * @param {Build}   build
 * @param {Boolean} [isWarnAboutConflicts=false]
 *
 * @private
 */
Build.prototype._mergeUserPlugins = function (build, isWarnAboutConflicts) {
    this._mergeCollection(build, 'plugins', 'User plugin', isWarnAboutConflicts);
};

/**
 * Merges mixins
 *
 * @param {Build} build
 *
 * @private
 */
Build.prototype._mergeMixins = function (build) {
    this.config.mixins = arrayUnique((this.config.mixins || []).concat(build.config.mixins || []));
};

/**
 *
 * @param {Object} left
 * @param {Object} right
 *
 * @private
 */
Build.prototype._deepMerge = function (left, right) {
    for (var prop in right) {
        if (right.hasOwnProperty(prop))  {
            if (typeof left[prop] === "object") {
                this._deepMerge(left[prop], right[prop]);
            } else {
                left[prop] = right[prop];
            }
        }
    }
};

/**
 * @param {Build}   build
 * @param {Array}   allowedFields
 * @param {Boolean} [isModuleDependsConfig=false]
 */
Build.prototype.mergeWith = function (build, allowedFields, isModuleDependsConfig) {
    isModuleDependsConfig = isModuleDependsConfig || false;

    // Merge config fields depend on allowedFields
    if (!isModuleDependsConfig) {
        this._mergeFields(build, allowedFields);
    }

    // Save Warnings
    this._mergeWarnings(build);

    // Apply Lmd Plugins
    this._mergeLmdPlugins(build, isModuleDependsConfig);

    // Apply Modules
    this._mergeModules(build, isModuleDependsConfig);

    // Apply Bundles
    this._mergeBundles(build, isModuleDependsConfig);

    // Apply User Plugins
    this._mergeUserPlugins(build, isModuleDependsConfig);

    // Apply mixins
    this._mergeMixins(build);
};

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
Build.prototype.interpolateConfigStrings = function(config, data) {
    data = data || config;

    for (var key in config) {
        var value = config[key];

        if (typeof value === "object") {
            config[key] = this.interpolateConfigStrings(value, data);
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
};

/**
 *
 * @param {String} file
 *
 * @returns {Promise} resolve(config)
 */
Build.prototype.readConfig = function (file) {
    var self = this;

    return readFile(file, 'utf8').then(function (fileContent) {
        var config;
        if (path.extname(file) === '.json') {
            // require() is Caches json files
            config = JSON.parse(fileContent);
        } else {
            var mod = new NodeModule('.', null);
            mod.load(file);
            config = mod.exports;
        }

        return self.interpolateConfigStrings(config);
    });
};
