var Q = require('q'),
    Logger = require('../logger');

/**
 * @param {Object} buildConfig
 *
 * @constructor
 */
var lmdSource = function (buildConfig) {
    this.config = buildConfig;
    this.plugins = [];

    this.logger = new Logger();
    this.promise = null;
};
module.exports = lmdSource;

/**
 * @returns {Promise}
 */
lmdSource.prototype.load = function () {
    // TODO
    return Q.resolve();
};

/**
 *
 * @param {Logger} logger
 * @returns {Bundle}
 */
lmdSource.prototype.withLogger = function (logger) {
    this.logger = logger;

    return this;
};