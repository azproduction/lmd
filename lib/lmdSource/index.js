var Q = require('q'),
    Logger = require('../logger'),
    LmdPlugin = require('../lmdPlugin'),
    File = require('../file'),
    arrayUnique = require('../utils').arrayUnique,
    constants = require('../constants');

var LMD_PLUGINS = constants.LMD_PLUGINS,
    LMD_PLUGINS_NAMES = constants.LMD_PLUGINS_NAMES,
    LMD_SOURCE_FILE = constants.LMD_SOURCE_FILE;

/**
 * @param {Object} lmdConfigObject
 *
 * @constructor
 */
var lmdSource = function (lmdConfigObject) {
    this.config = lmdConfigObject;
    this.plugins = [];
    this.preprocessors = [];
    this.file = null;

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

    return this.promise = this.loadLmdSrc()
        .then(function () {
            var filesAndPreprocessors = self._resolveUniqueFilesAndPreprocessors();
            self.preprocessors = filesAndPreprocessors.preprocessors;

            return filesAndPreprocessors.files;
        })
        .then(function (files) {
            return self.loadLmdPlugins(files);
        })
        .then(function () {
            return self.loadUserPlugins();
        })
        .then(function () {
            return self;
        });
};


/**
 * @returns {Promise}
 */
lmdSource.prototype.loadLmdSrc = function () {
    this.file = new File(LMD_SOURCE_FILE);

    return this.file.withLogger(this.logger).load();
};

/**
 * @returns {Promise}
 */
lmdSource.prototype.loadLmdPlugins = function (files) {
    var self = this;

    var promises = files.map(function (file) {
        var lmdPlugin = new LmdPlugin(file);
        self.plugins.push(lmdPlugin);

        return lmdPlugin.withLogger(self.logger).load();
    });

    return Q.allResolved(promises);
};

lmdSource.prototype.loadUserPlugins = function () {
    // TODO
    return Q.resolve();
};

/**
 * @returns {Object}
 * @private
 */
lmdSource.prototype._resolveUniqueFilesAndPreprocessors = function () {
    var self = this,
        config = this.config,
        accumulator = {
            files: [],
            // disable all preprocessors
            preprocessors: LMD_PLUGINS_NAMES.reduce(function (preprocessors, lmdPluginName) {
                (LMD_PLUGINS[lmdPluginName].preprocess || []).forEach(function (preprocessor) {
                    preprocessors[preprocessor] = false;
                });

                return preprocessors;
            }, {})
        };

    // collect all configured plugins
    LMD_PLUGINS_NAMES.forEach(function (name) {
        if (!(name in config)) {
            return;
        }
        self._resolveFilesAndPreprocessors(name, accumulator);
    });

    return {
        files: arrayUnique(accumulator.files),
        preprocessors: accumulator.preprocessors
    };
};

/**
 *
 * @param {String} lmdPluginName
 * @param {Object} accumulator
 * @param {Object} accumulator.preprocessors
 * @param {Array}  accumulator.files
 * @private
 */
lmdSource.prototype._resolveFilesAndPreprocessors = function (lmdPluginName, accumulator) {
    var self = this;
    // push files to accumulator
    var files = LMD_PLUGINS[lmdPluginName].require;
    if (files) {
        accumulator.files.push.apply(accumulator.files, [].concat(files));
    }

    // push preprocessors
    var preprocessors = LMD_PLUGINS[lmdPluginName].preprocess;
    if (preprocessors) {
        preprocessors.forEach(function (preprocessor) {
            // enable preprocessor
            accumulator.preprocessors[preprocessor] = true;
        });
    }

    // require depends
    var depends = LMD_PLUGINS[lmdPluginName].depends;
    if (!depends) {
        return;
    }
    depends.forEach(function (name) {
        self._resolveFilesAndPreprocessors(name, accumulator);
    });
};

/**
 *
 * @param {Logger} logger
 * @returns {lmdSource}
 */
lmdSource.prototype.withLogger = function (logger) {
    this.logger = logger;

    return this;
};
