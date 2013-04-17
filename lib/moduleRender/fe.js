/**
 * @param {Module} moduleData
 */
module.exports = function (moduleData) {
    // remove tail ;
    return moduleData.code.replace(/\n*;\n*$/, '');
};
