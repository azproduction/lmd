var util = require('util');

/**
 * @param {Number} [logLevel=Infinity]
 * @param {Object} [consoleObject=console]
 * @constructor
 */
var Logger = function (logLevel, consoleObject) {
    if (typeof logLevel === "undefined") {
        this.logLevel = Infinity;
    } else {
        this.logLevel = logLevel;
    }

    this.console = consoleObject || console;
};

/**
 * @param {String} message
 * @param {Number} [level=1]
 */
Logger.prototype._format = function (message, level) {
    message[0] = (message[0] || '').replace(/%[\w]+/g, '%s');
    return util.format.apply(util, message);
};

/**
 * @param {Array}  message
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
 * @param {String} string
 * @param {*}      [arg1]
 * @param {*}      [arg2]
 */
Logger.prototype.log1 = function (string, arg1, arg2) {
    this.log([].slice.call(arguments), 1);
};

/**
 * @param {String} string
 * @param {*}      [arg1]
 * @param {*}      [arg2]
 */
Logger.prototype.log2 = function (string, arg1, arg2) {
    this.log([].slice.call(arguments), 2);
};

/**
 * @param {String} string
 * @param {*}      [arg1]
 * @param {*}      [arg2]
 */
Logger.prototype.log3 = function (string, arg1, arg2) {
    this.log([].slice.call(arguments), 3);
};

/**
 * @param {String} string
 * @param {*}      [arg1]
 * @param {*}      [arg2]
 */
Logger.prototype.error = function (string, arg1, arg2) {
    if (this.logLevel === 0) {
        return;
    }

    var message = this._format([].slice.call(arguments));
    this.console.error(message);
};

module.exports = Logger;
