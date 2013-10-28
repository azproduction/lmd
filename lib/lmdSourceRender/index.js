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
 *
 * @param {String} content
 * @param {Object} block
 * @returns {Object}
 * @private
 */
LmdSourceRender.prototype._findClosingStatement = function (content, block) {
    var bracesCounter = 0;
    while (content.length > block.close.start) {
        if (content[block.close.start] === '{') {
            bracesCounter++;
        }
        if (content[block.close.start] === '}') {
            bracesCounter--;
        }

        if (bracesCounter === 0) {
            break;
        }

        block.close.start++;
    }

    return block;
};

/**
 *
 * @param {String} content
 * @param {Object} block
 * @returns {Object}
 * @private
 */
LmdSourceRender.prototype._expandByComments = function (content, block) {
    if (content[block.open.start - 1] === '*' && content[block.open.start - 2] === '/') {
        // commented statement -> expand borders
        block.isCommented = true;
        block.open.start -= 2;
        block.open.length += 4;

        block.close.start -= 2;
        block.close.length += 4;
    }

    return block;
};

/**
 *
 * @param {String} content
 * @param {Object} block
 * @returns {Object}
 * @private
 */
LmdSourceRender.prototype._expandByLeadingSpaces = function (content, block) {
    if (block.isCommented) {
        return block;
    }

    ['open', 'close'].forEach(function (statementType) {
        var statement = block[statementType];

        // remove leading spaces
        while (statement.start) {
            statement.start--;
            statement.length++;
            if (content[statement.start] !== '\t' && content[statement.start] !== ' ') {
                statement.start++;
                statement.length--;
                break;
            }
        }

        // 4.3) add front \n
        statement.length++;
    });

    return block;
};

/**
 *
 * @param {String}       content             content code
 * @param {String}       conditionExpression for example $P.CACHE
 * @returns {Object|null} {open, close, isCommented} or null if block is not found
 */
LmdSourceRender.prototype.findBlock = function (content, conditionExpression) {
    // if (conditionExpression) {...}
    // /*if (conditionExpression) {*/.../*}*/
    var openStatementString = 'if (' + conditionExpression + ') {';

    // 1) Search for "if (conditionExpression) {" pattern

        // if ($P.CONDITION) { ... }
        // ^
    var startIndex = content.indexOf(openStatementString),
        // if ($P.CONDITION) { ... }
        // ^^^^^^^^^^^^^^^^^^^
        startLength = openStatementString.length,
        // if ($P.CONDITION) { ... }
        //                   ^
        endIndex = startIndex + startLength - 1,
        // if ($P.CONDITION) { ... }
        //                         ^
        endLength = 1; // }

    // Not found
    if (startIndex === -1) {
        return null;
    }

    var block = {
        open: {
            start: startIndex,
            end: startIndex + startLength,
            length: startLength
        },
        close: {
            start: endIndex,
            end: endIndex + endLength,
            length: endLength
        },
        isCommented: false
    };

    // 2) Search for "}"
    block = this._findClosingStatement(content, block);

    // 3) look around for /* */
    block = this._expandByComments(content, block);

    // 4) Look back for indent spaces if statement is not commented
    block = this._expandByLeadingSpaces(content, block);

    return block;
};

/**
 *
 * @param {String} content
 * @param {Object} block
 * @returns {String} content'
 */
LmdSourceRender.prototype.removeBlock = function (content, block) {
    return content.substr(0, block.open.start) + content.substr(block.close.start + block.close.length);
};

/**
 *
 * @param {String} content
 * @param {Object} block
 * @returns {String} content'
 */
LmdSourceRender.prototype.applyBlock = function (content, block) {
    // open
    content = content.substr(0, block.open.start) +
              content.substr(block.open.start + block.open.length);
    // close
    content = content.substr(0, block.close.start - block.open.length) +
              content.substr(block.close.start + block.close.length - block.open.length);

    // Do not indent back commented block
    if (block.isCommented) {
        return content;
    }

    // Indent back wrapped code
    var backIndentedLines = content
        .substr(block.open.start, block.close.start - block.open.length - block.open.start)
        .split('\n')
        .map(function (line) {
            return line.replace(/^\s{4}/, '');
        })
        .join('\n');

    return content.substr(0, block.open.start) +
           backIndentedLines +
           content.substr(block.close.start -  block.open.length);
};

/**
 * Removes or applies code blocks
 *
 * @param {String}  content
 * @param {String}  preprocessorName
 * @param {Boolean} isApply
 * @returns {String} content'
 * @private
 */
LmdSourceRender.prototype._toggleBlock = function (content, preprocessorName, isApply) {
    // remove all block of same type
    while (true) {
        var block = this.findBlock(content, preprocessorName);
        // Block is not found
        if (block === null) {
            break;
        }

        if (isApply) {
            content = this.applyBlock(content, block);
        } else {
            content = this.removeBlock(content, block);
        }
    }

    return content;
};

/**
 *
 * @param {String} content
 * @param {Object} preprocessors
 * @returns {String} content'
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
