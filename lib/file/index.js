var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    Logger = require('../logger');

var readFile = Q.nfbind(fs.readFile),
    realPath  = Q.nfbind(fs.realpath);

/**
 * @param {String} originalFileName
 *
 * @constructor
 */
var File = function (originalFileName) {
    this.isExists = false;
    this.name = '';
    this.originalName = originalFileName;
    this.content = null;

    this.logger = new Logger();
    this.promise = null;
};
module.exports = File;

/**
 *
 * @param {String} [root='']
 * @returns {Promise}
 */
File.prototype.realPath = function (root) {
    root = root || '';
    var modulePath = path.join(root, this.originalName);
    return realPath(modulePath);
};

/**
 *
 * @param {String} [root]
 * @returns {Promise}
 */
File.prototype.load = function (root) {
    var self = this;

    // If promise already resolved - return as is
    if (this.promise) {
        return this.promise;
    }

    return this.promise = this.realPath(root)
        // Check file exists
        .then(function (fileName) {
            self.name = fileName;
            self.isExists = true;

            return readFile(fileName, 'utf8');
        }, function () {
            self.isExists = false;
            return null;
        })
        .then(function (content) {
            this.content = content;
            return self;
        });
};

/**
 *
 * @param {Logger} logger
 * @returns {File}
 */
File.prototype.withLogger = function (logger) {
    this.logger = logger;

    return this;
};

/**
 *
 * @return {Number}
 */
File.prototype.lines = function () {
    var content = this.content;
    if (typeof content !== 'string') {
        return 0;
    }

    var lines = 1;
    for (var i = 0, c = content.length; i < c; i++) {
        if (content[i] === '\n') {
            lines++;
        }
    }

    return lines;
};
