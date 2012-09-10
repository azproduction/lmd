/**
 * This plugin enables shortcuts
 *
 * Flag "shortcuts"
 *
 * This plugin provides private "is_shortcut" function
 */

/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

function is_shortcut(moduleName, moduleContent) {
    return !initialized_modules[moduleName] &&
           typeof moduleContent === "string" &&
           moduleContent.charAt(0) == '@';
}

lmd_on('lmd-require:first-init', function (event, moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        lmd_trigger('shortcuts:before-resolve', moduleName, module);

        moduleName = module.replace('@', '');
        module = modules[moduleName];
        return [moduleName, module];
    }
});

lmd_on('stats:before-require-count', function (event, moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        moduleName = module.replace('@', '');
    }
    return [moduleName, module];
});