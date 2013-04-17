var template = require('./template'),
    plain = template('plain');

/**
 * @param {Module} moduleData
 */
module.exports = function (moduleData) {
    return plain({
        code: moduleData.code
    });
};
