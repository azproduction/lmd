var Q = require('q'),
    ModuleCollection = require('/.moduleCollection');

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

    this.deferred = Q.defer();
    this.promise = this.deferred.promise;
};
module.exports = Bundle;

/**
 *
 */
Bundle.prototype.load = function () {
    if (this.deferred.isResolved()) {
        return this.promise;
    }

    this.modulesCollection.load()
        .then(this.deferred.resolve, this.deferred.reject);

    return this.promise;
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
        config.output = mainConfig.output.replace(reJavaScriptExtension, '') + '-bundle-' + this.id + '.js'
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
