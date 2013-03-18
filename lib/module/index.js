var Q = require('q');

var availableModules = [
    // @shortcuts
    'shortcutModule',
    // jQuery etc
    'adoptedModule',
    // Other modules: string, json, fd, fe, amd, plain(cjs)
    'module'
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
    for (var i = 0, c = lmdModuleConfig.length, ModuleConstructor; i < c; i++) {
        ModuleConstructor = lmdModuleConfig[i];

        if (ModuleConstructor.is(lmdModuleConfig)) {
            return new ModuleConstructor(id, lmdModuleConfig);
        }
    }
}

module.exports = moduleFactory;
