var Q = require('q'),
    ModuleCollection = require('../moduleCollection');

var INHERITABLE_FIELDS = ['root', 'warn', 'log', 'depends', 'lazy', 'pack', 'pack_options', 'main'];

var reJavaScriptExtension = /.js$/;

/**
 * @param {String} id
 *
 * @param {Object} lmdConfigObject
 *
 * @constructor
 */
var Bundle = function (id, lmdConfigObject) {
    var self = this;

    this.id = id;
    this.isMain = id === '.';
    this.config = lmdConfigObject;
    this.parent = null;

    /**
     * @type {ModuleCollection}
     */
    this.modulesCollection = new ModuleCollection(lmdConfigObject.modules);

    var bundles = this.config.bundles || {};
    this.bundles = Object.keys(bundles).map(function (bundleName) {
        var bundleObject = new Bundle(bundleName, bundles[bundleName]);

        bundleObject.inheritFromMainBundle(self);

        return bundleObject;
    });

    this.promise = null;
};
module.exports = Bundle;

/**
 *
 */
Bundle.prototype.load = function (modulesRoot) {
    var self = this;

    // If promise already resolved - return as is
    if (this.promise) {
        return this.promise;
    }

    // load sub bundles
    var promises = this.bundles.map(function (bundle) {
        return bundle.load(modulesRoot);
    });
    // load modules collection
    promises.push(this.modulesCollection.load(modulesRoot));

    return this.promise = Q.allResolved(promises)
        .then(function () {
            return self;
        });
};

/**
 * @param {Bundle} bundle
 */
Bundle.prototype.margeWith = function (bundle) {
    // flatten Modules
    this.modulesCollection.mergeWith(bundle.modulesCollection);

    // flatten sub-bundles
    this.bundles = this.bundles.concat(bundle.bundles);

    return this;
};

/**
 * Finds modules depends
 *
 * @param {String} defaultDependsMask
 *
 * @returns {Array}
 */
Bundle.prototype.resolveModulesDepends = function (defaultDependsMask) {
    var depends = [];

    // collect depends from own modules collection
    depends = depends.concat(this.modulesCollection.resolveModulesDepends(defaultDependsMask));

    // collect depends from sub bundles
    depends = depends.concat(this.bundles.reduce(function (depends, bundle) {
        return depends.concat(bundle.resolveModulesDepends(defaultDependsMask));
    }, []));

    return depends;
};

/**
 *
 * @param {Bundle} mainBundle
 */
Bundle.prototype.inheritFromMainBundle = function (mainBundle) {
    this.parent = mainBundle;

    var config = this.config,
        mainConfig = mainBundle.config;

    INHERITABLE_FIELDS.forEach(function (name) {
        if (typeof config[name] === "undefined" && typeof mainConfig[name] !== "undefined") {
            config[name] = mainConfig[name];
        }
    });

    // Set output path
    if (!config.output && mainConfig.output) {
        // using parent output, set output path for bundle
        // ../index.js -> ../index-bundle-%id%.js
        config.output = mainConfig.output.replace(reJavaScriptExtension, '') + '-bundle-' + this.id + '.js';
    }

    // Set sourcemap
    if (config.output && mainConfig.sourcemap) {
        config.sourcemap = config.output.replace(reJavaScriptExtension, '') + '.map';
        config.sourcemap_inline = config.sourcemap_inline || mainConfig.sourcemap_inline;
        config.sourcemap_www = config.sourcemap_www || mainConfig.sourcemap_www;
    }

    // Override
    config.bundles_callback = mainConfig.bundles_callback;
};

/**
 *
 */
Bundle.prototype.render = function () {

};
