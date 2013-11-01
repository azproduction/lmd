var File = require('../file'),
    constants = require('../constants');

var LMD_PLUGIN_DIR = constants.LMD_PLUGIN_DIR;

/**
 * @param {String} fileName
 *
 * @constructor
 */
var lmdPlugin = function (fileName) {
    this.fileName = fileName;
    this.file = null;

    this.promise = null;
};
module.exports = lmdPlugin;

/**
 * @returns {Promise}
 */
lmdPlugin.prototype.load = function () {
    // If promise already initialized - return as is
    if (this.promise) {
        return this.promise;
    }

    return this.loadLmdPluginSrc();
};

lmdPlugin.prototype.loadLmdPluginSrc = function () {
    this.file = new File(this.fileName);

    return this.promise = this.file.load(LMD_PLUGIN_DIR);
};
