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
    this.lines = 0;

    this.logger = new Logger();
    this.promise = null;
};
module.exports = File;

/**
 *
 * @returns {Promise}
 */
File.prototype.realPath = function (modulesRoot) {
    var modulePath = path.join(modulesRoot, this.originalName);
    return realPath(modulePath);
};

/**
 *
 * @returns {Promise}
 */
File.prototype.load = function (modulesRoot) {
    var self = this;

    // If promise already resolved - return as is
    if (this.promise) {
        return this.promise;
    }

    return this.promise = this.realPath(modulesRoot)
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
            self.content = content;
            self.lines = self.calculateModuleLines(content);

            return self;
        });
};

/**
 *
 * @param {Logger} logger
 * @returns {Bundle}
 */
File.prototype.withLogger = function (logger) {
    this.logger = logger;

    return this;
};

/**
 *
 * @param {String} content
 *
 * @return {Number}
 */
File.prototype.calculateModuleLines = function (content) {
    var lines = 1;
    for (var i = 0, c = content.length; i < c; i++) {
        if (content[i] === "\n") {
            lines++;
        }
    }

    return lines;
};
