var template = require('./template'),
    amd = template('amd');

/**
 * @param {Module} moduleData
 */
module.exports = function (moduleData) {
    return amd({
        code: moduleData.code
    });
};
