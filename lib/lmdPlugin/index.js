var File = require('../file'),
    Logger = require('../logger'),
    constants = require('../constants');

var LMD_PLUGINS_NAMES = constants.LMD_PLUGINS_NAMES,
    LMD_PLUGIN_DIR = constants.LMD_PLUGIN_DIR;

/**
 * @param {String} pluginName
 * @param {Object} enabledPluginsNames list of enabled plugins required for plugin preprocessor
 *
 * @constructor
 */
var lmdPlugin = function (pluginName, enabledPluginsNames) {
    this.pluginName = pluginName;
    this.enabledPluginsNames = enabledPluginsNames;
    this.file = null;

    this.logger = new Logger();
    this.promise = null;
};
module.exports = lmdPlugin;

/**
 * @returns {Promise}
 */
lmdPlugin.prototype.load = function () {
    var self = this;

    // If promise already initialized - return as is
    if (this.promise) {
        return this.promise;
    }

    return this.loadLmdPluginSrc().then(function (file) {
        return self.preProcessPlugin(file);
    });
};

lmdPlugin.prototype.loadLmdPluginSrc = function () {
    this.file = new File(this.pluginName + '.js');

    return this.promise = this.file.withLogger(this.logger).load(LMD_PLUGIN_DIR);
};

/**
 *
 * @param {File} file
 * @returns {lmdPlugin}
 */
lmdPlugin.prototype.preProcessPlugin = function (file) {
    var content = file.content;

    LMD_PLUGINS_NAMES.forEach(function (pluginName) {
        // TODO
    });

    return this;
};

/**
 *
 * @param {String} fileContent
 * @returns {String}
 * @private
 */
lmdPlugin.prototype._preProcessIfStatements = function (fileContent) {
    return fileContent;
};

/**
 *
 * @param {String}  fileContent
 * @param {String}  expressionName
 * @param {Boolean} isApply
 * @param {Boolean} isInline
 * @returns {String}
 * @private
 */
lmdPlugin.prototype._preProcessIfBlock = function (fileContent, expressionName, isApply, isInline) {
    return fileContent;
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
