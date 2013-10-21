var path = require('path'),
    constants = require('../constants');

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
    return this.lmdSource.content;
};
