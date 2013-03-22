var path = require('path'),
    fs = require('fs'),
    Q = require('Q');

var readDir = Q.nfbind(fs.readdir);

var reLmdFile = /\.lmd\.(json|js)$/;

/**
 * Array#unique()
 *
 * @param {Array} array
 *
 * @returns {Array}
 */
exports.arrayUnique = function(array) {
    return array.filter(function(item, index, array) {
        return array.indexOf(item, index + 1) < 0;
    });
};

/**
 * Extracts shortName from filePath
 *
 * @param {String} filePath
 *
 * @returns {String}
 */
exports.extractShortName = function (filePath) {
    return path.basename(filePath).replace(reLmdFile);
};

/**
 * It scans lmdDir and resolves short name
 *
 * @param {String} lmdDir
 * @param {String} shortName
 *
 * @returns {Promise} resolve(fileName)
 */
exports.resolveLmdConfig = function(lmdDir, shortName) {
    return readDir(lmdDir).then(function (files) {
        for (var i = 0, c = files.length, fileName; i < c; i++) {
            fileName = files[i];
            var fileExtension = (fileName.match(reLmdFile) || 0)[0];
            if (fileExtension && path.basename(fileName, fileExtension) === shortName) {
                return fileName;
            }
        }
    });
};
