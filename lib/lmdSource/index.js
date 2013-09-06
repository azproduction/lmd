var Q = require('q'),
    Logger = require('../logger'),
    LmdPlugin = require('../lmdPlugin'),
    File = require('../file'),
    constants = require('../constants');

var LMD_PLUGINS_NAMES = constants.LMD_PLUGINS_NAMES,
    LMD_SOURCE_FILE = constants.LMD_SOURCE_FILE;

/**
 * @param {Object} lmdConfigObject
 *
 * @constructor
 */
var lmdSource = function (lmdConfigObject) {
    this.config = lmdConfigObject;
    this.plugins = [];
    this.file = null;

    this.enabledPlugins = this.collectPlugins();
    this.enabledPluginsNames = this.enabledPlugins.reduce(function (all, plugin) {
        all[plugin.name] = true;

        return all;
    }, {});

    this.logger = new Logger();
    this.promise = null;
};
module.exports = lmdSource;

/**
 * @returns {Promise}
 */
lmdSource.prototype.load = function () {
    var self = this;

    // If promise already initialized - return as is
    if (this.promise) {
        return this.promise;
    }

    var promises = [
        this.loadLmdSrc(),
        this.loadLmdPlugins(),
        this.loadUserPlugins()
    ];

    return this.promise = Q.allResolved(promises)
        .then(function () {
            return self;
        });
};

lmdSource.prototype.loadLmdSrc = function () {
    this.file = new File(LMD_SOURCE_FILE);

    return this.file.withLogger(this.logger).load();
};

lmdSource.prototype.loadLmdPlugins = function () {
    var self = this;

    var promises = this.enabledPlugins.map(function (plugin) {
        var lmdPlugin = new LmdPlugin(plugin.name, self.enabledPluginsNames);
        self.plugins.push(lmdPlugin);

        lmdPlugin.withLogger(self.logger).load();
    });

    return Q.allResolved(promises);
};

lmdSource.prototype.loadUserPlugins = function () {
    // TODO
    return Q.resolve();
};

/**
 * @returns {Array}
 */
lmdSource.prototype.collectPlugins = function () {
    var config = this.config,
        plugins = [];

    LMD_PLUGINS_NAMES.forEach(function (name) {
        if (name in config) {
            plugins.push({
                name: name,
                options: config[name]
            });
        }
    });

    return plugins;
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
