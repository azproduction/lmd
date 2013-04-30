var path = require('path'),
    constants = require('../constants');

var LMD_PLUGIN_DIR = constants.LMD_PLUGIN_DIR;
var LMD_PLUGINS = constants.LMD_PLUGINS;
var LMD_SOURCE_FILE = constants.LMD_SOURCE_FILE;

/**
 *
 * @param {Object} buildConfig
 * @constructor
 */
var LmdSourceRender = function (buildConfig) {
    this.buildConfig = buildConfig;
};
module.exports = LmdSourceRender;

/**
 * @returns {String}
 */
LmdSourceRender.prototype.render = function () {
    return this.buildConfig;
};