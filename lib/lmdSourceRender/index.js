var Q = require('q'),
    LmdPlugin = require('../lmdPlugin'),
    constants = require('../constants');

var LMD_PLUGINS = constants.LMD_PLUGINS,
    LMD_PLUGINS_LOCATION_MARK = constants.LMD_PLUGINS_LOCATION_MARK,
    LMD_PLUGINS_GLUE = '\n\n';

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
 * @returns {Promise}
 */
LmdSourceRender.prototype.render = function () {
    var self = this;
    // lmd + user plugins
    var files = this.lmdSource.plugins.map(function (plugin) {
        return plugin.file;
    });
    var preprocessors = self.lmdSource.preprocessors;

    // embed lmd content with plugins
    return this.embedContentWithPlugins(this.lmdSource.file, files)
    .then(function (rawContent) {
        return self.embedContentWithIncludes(rawContent, preprocessors);
    })
    .then(function (rawContent) {
        return self.preProcessContent(rawContent, preprocessors);
    });
};


/**
 *
 * @returns {Promise}
 */
LmdSourceRender.prototype.embedContentWithPlugins = function (file, files) {
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
LmdSourceRender.prototype.embedContentWithIncludes = function (content, preprocessors) {
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
LmdSourceRender.prototype.preProcessBlock = function (content, optionName, isApply, isInline) {
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

LmdSourceRender.prototype._toggleBlock = function (content, preprocessorName, isApply) {
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
LmdSourceRender.prototype.preProcessContent = function (content, preprocessors) {
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
