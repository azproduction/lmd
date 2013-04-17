/**
 * @param {Module} moduleData
 */
module.exports = function (moduleData) {
    // remove function name
    var code = moduleData.code.replace(/^function[^\(]*/, 'function');

    if (code.indexOf('(function(') !== 0) {
        code = '(' + code + ')';
    }

    // remove tail ;
    return code.replace(/\n*;\n*$/, '');
};
