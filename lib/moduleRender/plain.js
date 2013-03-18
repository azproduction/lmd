/**
 * @param {Module} moduleData
 */
module.exports = function (moduleData) {
    return '(function (require, exports, module) { /* wrapped by builder */\n' + moduleData.originalCode + '\n})';
};
