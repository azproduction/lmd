var Q = require('q');

var availableModules = [
    // @shortcuts
    'shortcutModule',
    // jQuery etc
    'adoptedModule',
    // Other modules: string, json, fd, fe, amd, plain(cjs)
    'commonModule'
].map(function (moduleName) {
    return require('./' + moduleName);
});

/**
 *
 * @param {String} id
 * @param {Object} lmdModuleConfig
 *
 * @returns {ShortcutModule|AdoptedModule|Module}
 */
function moduleFactory(id, lmdModuleConfig) {
    for (var i = 0, c = availableModules.length, ModuleConstructor; i < c; i++) {
        ModuleConstructor = availableModules[i];

        if (ModuleConstructor.is(lmdModuleConfig)) {
            return new ModuleConstructor(id, lmdModuleConfig);
        }
    }
}

module.exports = moduleFactory;
