var Q = require('q'),
    Logger = require('../logger'),
    LmdPlugin = require('../lmdPlugin'),
    File = require('../file'),
    arrayUnique = require('../utils').arrayUnique,
    constants = require('../constants');

var LMD_PLUGINS = constants.LMD_PLUGINS,
    LMD_PLUGINS_NAMES = constants.LMD_PLUGINS_NAMES,
    LMD_SOURCE_FILE = constants.LMD_SOURCE_FILE,
    LMD_PLUGINS_LOCATION_MARK = constants.LMD_PLUGINS_LOCATION_MARK,
    LMD_PLUGINS_GLUE = '\n\n';

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
    this.content = null;
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
            // lmd + user plugins
            var files = self.plugins.map(function (plugin) {
                return plugin.file;
            });
            // embed lmd content with plugins
            return self.embedContentWithPlugins(self.file, files);
        })
        .then(function (rawContent) {
            return self.embedContentWithIncludes(rawContent, self.preprocessors);
        })
        .then(function (rawContent) {
            self.content = self.preProcessContent(rawContent, self.preprocessors);
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
 * @returns {Promise}
 */
lmdSource.prototype.embedContentWithPlugins = function (file, files) {
    var pluginsCode = files.map(function (file) {
        return file.content;
    }).join(LMD_PLUGINS_GLUE);

    var lmdSource = file.content.replace(LMD_PLUGINS_LOCATION_MARK, pluginsCode);

    return Q.resolve(lmdSource);
};

/**
 *
 * @returns {Promise} content
 */
lmdSource.prototype.embedContentWithIncludes = function (content, preprocessors) {
    var self = this;

    var promises = Object.keys(preprocessors).map(function (preprocessor) {
        /*if ($P.STATS) include('stats.js');*/
        var pattern = new RegExp('\\/\\*\\if \\(' + preprocessor.replace(/\$/g, '\\$').replace(/\|/g, '\\|') + '\\)\\s+include\\(\'([a-z-\\/_\\.]+)\'\\);?\\s*\\*\\/', ''),
            isEnabled = preprocessors[preprocessor];

        // Looking for include pattern
        var includeFileName = (content.match(pattern) || 0)[1];

        // not found -> skip
        if (!includeFileName) {
            return Q.resolve();
        }

        // disabled include
        if (!isEnabled) {
            return Q.resolve({
                pattern: pattern,
                content: ''
            });
        }

        return new LmdPlugin(includeFileName)
            .withLogger(self.logger)
            .load()
            .then(function (file) {
                // enabled include
                return {
                    pattern: pattern,
                    content: file.content
                };
            });
    });

    return Q.allResolved(promises).then(function (promises) {
        promises
            .map(function (promise) {
                return promise.valueOf();
            })
            .filter(function (replacement) {
                return !!replacement;
            })
            .forEach(function (replacement) {
                content = content.replace(replacement.pattern, replacement.content);
            });

        return content;
    });
};

/**
 * Applies or removes block from lmd_js
 *
 * @param {String} content
 * @param {String} optionName block name eg $P.CACHE
 * @param isApply  apply or remove block
 * @param isInline block is inline (based on block comment)
 *
 * @todo this code is too complex
 *
 * @returns {Object}
 */
lmdSource.prototype.preProcessBlock = function (content, optionName, isApply, isInline) {
    // /*if ($P.CSS || $P.JS || $P.ASYNC) {*/
    var inlinePreprocessorBlock = isInline ? '/*if (' + optionName + ') {*/' : 'if (' + optionName + ') {',
        bracesCounter = 0,

        startIndex = content.indexOf(inlinePreprocessorBlock),
        startLength = inlinePreprocessorBlock.length,

        endIndex = startIndex + inlinePreprocessorBlock.length,
        endLength = isInline ? 5 : 1;

    if (startIndex === -1) {
        return {
            content: content,
            found: false
        };
    }

    // lookup for own }
    while (content.length > endIndex) {
        if (content[endIndex] === '{') {
            bracesCounter++;
        }
        if (content[endIndex] === '}') {
            bracesCounter--;
        }

        // found!
        if (bracesCounter === -1) {
            if (isInline) {
                // step back
                endIndex -= 2;
            } else {
                // remove leading spaces from open part
                while (startIndex) {
                    startIndex--;
                    startLength++;
                    if (content[startIndex] !== '\t' && content[startIndex] !== ' ') {
                        startIndex++;
                        startLength--;
                        break;
                    }
                }

                // remove leading spaces from close part
                while (endIndex) {
                    endIndex--;
                    endLength++;
                    if (content[endIndex] !== '\t' && content[endIndex] !== ' ') {
                        endIndex++;
                        endLength--;
                        break;
                    }
                }
                // add front \n
                endLength++;
                startLength++;
            }

            if (isApply) {
                // wipe preprocessor blocks only
                // open
                content = content.substr(0, startIndex) + content.substr(startIndex + startLength);

                // close
                content = content.substr(0, endIndex - startLength) + content.substr(endIndex + endLength - startLength);

                if (!isInline) {
                    // indent block back
                    var blockForIndent = content.substr(startIndex, endIndex - startLength - startIndex);

                    blockForIndent = blockForIndent
                        .split('\n')
                        .map(function (line) {
                            return line.replace(/^\s{4}/, '');
                        })
                        .join('\n');

                    content = content.substr(0, startIndex) + blockForIndent + content.substr(endIndex - startLength);
                }
            } else {
                // wipe all
                content = content.substr(0, startIndex) + content.substr(endIndex + endLength);
            }
            break;
        }
        endIndex++;
    }

    return {
        content: content,
        found: true
    };
};

lmdSource.prototype._toggleBlock = function (content, preprocessorName, isApply) {
    var self = this;

    // true - inline code
    // false - block code
    [true, false].forEach(function (isInline) {
        while (true) {
            var result = self.preProcessBlock(content, preprocessorName, isApply, isInline);
            content = result.content;

            if (!result.found) {
                break;
            }
        }
    });

    return content;
};

/**
 *
 * @returns {String}
 */
lmdSource.prototype.preProcessContent = function (content, preprocessors) {
    var self = this;
    var preprocessorNames = Object.keys(preprocessors);

    // true -  Apply IF statements
    // false - Wipe IF statements
    [true, false].forEach(function (isApply) {
        preprocessorNames.forEach(function (preprocessorName) {
            var isAvailable = preprocessors[preprocessorName];
            if (isAvailable === isApply) {
                content = self._toggleBlock(content, preprocessorName, isApply);
            }
        });
    });

    return content;
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
