var Q = require('q'),
    path = require('path'),
    moduleRender = require('../moduleRender');

/**
 * @param {String} id
 * @param {*}      lmdModuleConfig
 *
 * @constructor
 */
var AbstractModule = function (id, lmdModuleConfig) {
    this.id = id;
    this.type = null;
    this.config = lmdModuleConfig;

    this.requiredModules = [];
    this.requiredPlugins = [];
    this.warnings = [];

    this.isExists = false;

    this.promise = null;
};

module.exports = AbstractModule;

/**
 *
 * @return {Promise}
 */
AbstractModule.prototype.load = function (modulesRoot) {
    var self = this;

    // If promise already resolved - return as is
    if (this.promise) {
        return this.promise;
    }

    return this.promise = this._load(modulesRoot)
        .then(function () {
            return self;
        });
};

/**
 *
 */
AbstractModule.prototype._load = function (modulesRoot) {
    return Q.reject(new Error('_load is abstract Method'));
};

/**
 * @return {String}
 */
AbstractModule.prototype.render = function () {
    if (!this.isExists) {
        throw new Error('Module "' + this.id + '" is not exists');
    }

    if (!this.type) {
        throw new Error('Module "' + this.id + '" is not loaded');
    }

    return moduleRender(this);
};

/**
 * @param {String} pluginName
 */
AbstractModule.prototype.addRequiredPlugin = function (pluginName) {
    if (this.requiredPlugins.indexOf(pluginName)) {
        return;
    }

    this.requiredPlugins.push(pluginName);
};

/**
 * @param {String} moduleName
 */
AbstractModule.prototype.addRequiredModule = function (moduleName) {
    if (this.requiredModules.indexOf(moduleName)) {
        return;
    }

    this.requiredModules.push(moduleName);
};

/**
 * @param {String} warning
 */
AbstractModule.prototype.addWarning = function (warning) {
    this.warnings.push(warning);
};

/**
 * Finds modules depends
 *
 * @param {String} defaultDependsMask
 *
 * @returns {Array}
 */
AbstractModule.prototype.resolveModulesDepends = function (defaultDependsMask) {
    return [];
};
