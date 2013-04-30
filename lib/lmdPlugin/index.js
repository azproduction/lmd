var Q = require('q'),
    Logger = require('../logger');

/**
 * @param {String} pluginName
 *
 * @constructor
 */
var lmdPlugin = function (pluginName) {
    this.pluginName = pluginName;
    this.plugins = [];

    this.logger = new Logger();
    this.promise = null;
};
module.exports = lmdPlugin;

/**
 * @returns {Promise}
 */
lmdPlugin.prototype.load = function () {
    // TODO
    return Q.resolve();
};

/**
 *
 * @param {Logger} logger
 * @returns {Bundle}
 */
lmdPlugin.prototype.withLogger = function (logger) {
    this.logger = logger;

    return this;
};
