/**
 * @param {Module} moduleData
 */
module.exports = function (moduleData) {
    return '(function (require) { /* wrapped by builder */\nvar define = require.define;\n' + moduleData.originalCode + '\n})';
};
