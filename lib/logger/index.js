/**
 * @param {Number} [logLevel=Infinity]
 * @param {Object} [consoleObject=console]
 * @constructor
 */
var Logger = function (logLevel, consoleObject) {
    this.logLevel = logLevel || Infinity;
    this.console = consoleObject || console;
};

/**
 * @param {String} message
 * @param {Number} [level=1]
 */
Logger.prototype._format = function (message, level) {
    // pad message
    return new Array(level | 1).join('    ') + message;
};

/**
 * @param {String} message
 * @param {Number} [level=3]
 */
Logger.prototype.log = function (message, level) {
    level = level || 1;
    if (level > this.logLevel) {
        return;
    }

    message = this._format(message, level);
    this.console.log(message);
};

/**
 * @param {String} message
 */
Logger.prototype.error = function (message) {
    if (this.logLevel === 0) {
        return;
    }

    message = this._format(message);
    this.console.error(message);
};

module.exports = Logger;
