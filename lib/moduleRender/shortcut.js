/**
 * @param {ShortcutModule} moduleData
 */
module.exports = function (moduleData) {
    // return JSON as-is
    return JSON.stringify(moduleData.shortcutName);
};
