var Q = require('q'),
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

    this.depends = [];
    this.plugins = [];
    this.warnings = [];

    this.dependsFile = null;

    this.isExists = false;

    this.deferred = Q.defer();
    this.promise = this.deferred.promise;
};

module.exports = AbstractModule;

/**
 *
 * @return {Promise}
 */
AbstractModule.prototype.load = function () {
    if (this.deferred.isResolved()) {
        return this.promise;
    }

    this._load();

    return this.promise;
};

/**
 *
 */
AbstractModule.prototype._load = function () {
    // ABSTRACT
};

/**
 * @return {Promise}
 */
AbstractModule.prototype.render = function () {
    if (!this.isExists) {
        return Q.reject('Module "' + this.id + '" is not exists');
    }

    if (!this.type) {
        return Q.reject('Module "' + this.id + '" is not loaded');
    }

    return moduleRender(this);
};

/**
 * @param {String} pluginName
 */
AbstractModule.prototype.addPluginDepends = function (pluginName) {
    if (this.plugins.indexOf(pluginName)) {
        return;
    }

    this.plugins.push(pluginName);
};

/**
 * @param {String} moduleName
 */
AbstractModule.prototype.addModuleDepends = function (moduleName) {
    if (this.depends.indexOf(moduleName)) {
        return;
    }

    this.depends.push(moduleName);
};

/**
 * @param {String} warning
 */
AbstractModule.prototype.addWarning = function (warning) {
    this.warnings.push(warning);
};

/**
 * @param {String} dependsFile
 */
AbstractModule.prototype.setDependsFile = function (dependsFile) {
    this.dependsFile = dependsFile;
};
