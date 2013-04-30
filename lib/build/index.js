var Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    template = require('lodash-template'),
    glob = require('glob'),
    arrayUnique = require('../utils').arrayUnique,
    NodeModule = require('module').Module,
    ShortcutModule = require('../module/shortcutModule'),
    Logger = require('../logger'),
    LmdSource = require('../lmdSource'),
    constants = require('../constants');

var Bundle = require('../bundle');

var LMD_ROOT = constants.LMD_ROOT;
var DEFAULT_DEPENDS_MASK = constants.DEFAULT_DEPENDS_MASK;
var LMD_PLUGINS = constants.LMD_PLUGINS;
var LMD_PLUGINS_NAMES = constants.LMD_PLUGINS_NAMES;
var SOURCE_TWEAK_FIELDS = constants.SOURCE_TWEAK_FIELDS;
var INHERITABLE_FIELDS = constants.INHERITABLE_FIELDS;
var ALL_KNOWN_FIELDS = constants.ALL_KNOWN_FIELDS;
var FILED_ALIASES = constants.FILED_ALIASES;

// required to check string for being template
var templateParts = /<%|\$\{/,
    reLmdFile = /\.lmd\.(json|js)$/,
    globPattern = /\*|\{|\}/,
    maxInterpolateRecursion = 10;

var readFile = Q.nfbind(fs.readFile);

/**
 * @param {String} id                build id
 * @param {String} configFile        path to build file
 * @param {Object} [extraOptions={}] extra options
 *
 * @constructor
 */
var Build = function (id, configFile, extraOptions) {
    this._initNullVariables();
    this.id = id;

    this.isMain = true;
    this.isExists = false;
    this.configFile = configFile;
    this.extraOptions = extraOptions || {};

    this.warnings = [];
    this.plugins = [];

    // build files that already used
    this.buildCache = {};
    this.logger = new Logger();
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
    this.isExists = true;
    this.config = config;

    this.promise = Q.resolve();
};
Build.fromExtraOptions.prototype = Build.prototype;

/**
 * Calculates modules root related to lmd config file
 */
Build.prototype._initNullVariables = function () {
    this.config = null;
    this.modulesRoot = null;
    /**
     * @type {Bundle}
     */
    this.bundle = null;
    /**
     *
     * @type {LmdSource}
     */
    this.lmdSource = null;
    this.promise = null;
};

/**
 * Calculates modules root related to lmd config file
 */
Build.prototype.resolveModulesRoot = function () {
    return path.join(path.dirname(this.configFile), this.config.root);
};

/**
 *
 */
Build.prototype.load = function () {
    var self = this;

    // If promise already resolved - return as is
    if (this.promise) {
        return this.promise;
    }

    this.buildCache[this.configFile] = this;

    return this.promise = this.readConfig(this.configFile)
        .then(function (config) {
            self.logger.log1('Config loaded %id file %file', self.id, self.configFile);
            self.isExists = true;
            self.config = config;

            return self.configure();
        }, function (error) {
            self.logger.error('Failed to load config %id file %file', self.id, self.configFile);

            return error;
        })
        .then(function () {
            return self;
        });
};

/**
 *
 */
Build.prototype.configure = function () {
    var self = this;

    this.applyExtraOptions();
    this.setDefaultValues();
    this.modulesRoot = self.resolveModulesRoot();

    return this.extendsBy(self.config['extends'])
        .then(function () {
            return self.mixWith(self.config.mixins);
        })
        .then(function () {
            self.logger.log1('Loading main bundle of %id file %file', self.id, self.configFile);
            self.bundle = new Bundle('.', self.config);
            return self.bundle.withLogger(this.logger).load(self.modulesRoot);
        }, function (error) {
            self.logger.error('Failed to load main bundle of %id file %file', self.id, self.configFile);

            return error;
        })
        .then(function () {
            return self.addModulesDepends();
        });
};

/**
 *
 */
Build.prototype.withLogger = function (logger) {
    this.logger = logger;

    return this;
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

    this.mergeConfigWith(tempBuild, ALL_KNOWN_FIELDS);
};

/**
 *
 */
Build.prototype.setDefaultValues = function () {
    var config = this.config.root;

    config.lazy = config.lazy || false;
    config.pack = config.lazy ? true : (config.pack || false);
    config.root = config.root || config.path || '';
    config.main = config.main || 'main';
    config.depends = (config.depends === true ? DEFAULT_DEPENDS_MASK : config.depends) || false;
};

/**
 * @param {String} configFile
 */
Build.prototype.extendsBy = function (configFile) {
    var self = this;
    if (!configFile || this.isCache(configFile)) {
        return Q.resolve();
    }
    this.addCache(configFile);

    var build = new Build.asSubBuild(configFile, configFile);
    build.useBuildCacheOf(this);

    self.logger.log1('Extending %id file %file with %file', self.id, self.configFile, configFile);
    return build.withLogger(this.logger).load().then(function () {
        self.logger.log1('Merging %id file %file with %file', self.id, self.configFile, configFile);
        self.mergeConfigWith(build, INHERITABLE_FIELDS);

        return build;
    });
};

/**
 * @param {Build} build
 */
Build.prototype.drainModulesAndBundlesFrom = function (build) {
    this.bundle.margeWith(build.bundle);

    return this;
};

/**
 *
 */
Build.prototype.addModulesDepends = function () {
    var self = this,
        defaultDepends = this.config.depends;

    // No depends
    if (defaultDepends === false) {
        return Q.resolve();
    }

    var buildDepends = this.bundle.resolveModulesDepends(defaultDepends);

    self.logger.log1('Applying modules depends of %id file %file', self.id, self.configFile);
    var promises = buildDepends.map(function (configFile) {
        return self.extendsBy(configFile).then(function (build) {
            return self.drainModulesAndBundlesFrom(build);
        });
    });

    // promises
    return Q.allResolved(promises);
};

/**
 * @param {Array} buildNames
 */
Build.prototype.mixWith = function (buildNames) {
    var self = this;
    // TODO
    if (!buildNames || !buildNames.length) {
        return Q.resolve();
    }
    this.logger.log1('Mixing %id file %file with %s', self.id, self.configFile, buildNames.join(', '));
    return Q.resolve();
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
    var self = this;

    Object.keys(right).forEach(function (prop) {
        if (typeof left[prop] === "object") {
            self._deepMerge(left[prop], right[prop]);
        } else {
            left[prop] = right[prop];
        }
    });
};

/**
 * @param {Build}   build
 * @param {Array}   allowedFields
 * @param {Boolean} [isModuleDependsConfig=false]
 */
Build.prototype.mergeConfigWith = function (build, allowedFields, isModuleDependsConfig) {
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
Build.prototype.interpolateConfigStrings = function (config, data) {
    data = data || config;

    for (var key in config) {
        var value = config[key];

        if (typeof value === "object") {
            config[key] = this.interpolateConfigStrings(value, data);
        } else if (typeof value === "string") {
            config[key] = this._interpolateString(value, data);
        }
    }

    return config;
};

/**
 *
 * @param {String} value
 * @param {Object} data
 *
 * @returns {String}
 * @private
 */
Build.prototype._interpolateString = function (value, data) {
    var currentInterpolation = 0;
    while (templateParts.test(value)) {
        currentInterpolation++;
        if (currentInterpolation > maxInterpolateRecursion) {
            break;
        }
        value = template(value, data);
    }

    return value;
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
