/**
 * @param {Module} moduleData
 */
module.exports = function (moduleData) {
    // return JSON as-is
    return moduleData.originalCode.replace(/\n*;\n*$/, '');
};
