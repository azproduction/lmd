var path = require('path'),
    constants = require('../constants');

var LMD_PLUGIN_DIR = constants.LMD_PLUGIN_DIR;
var LMD_PLUGINS = constants.LMD_PLUGINS;
var LMD_SOURCE_FILE = constants.LMD_SOURCE_FILE;

/**
 *
 * @param {lmdSource} lmdSource
 * @constructor
 */
var LmdSourceRender = function (lmdSource) {
    this.lmdSource = lmdSource;
};
module.exports = LmdSourceRender;

/**
 * @returns {String}
 */
LmdSourceRender.prototype.render = function () {
    // TODO
    return '';
};
