/**
 * This plugin dumps off-package modules content to localStorage
 *
 * Flag "cache_async"
 *
 * Provides cache_async function
 */
/**
 * @name global
 * @name version
 */

function cache_async(moduleName, module) {
    if (global.localStorage && version) {
        try {
            global.localStorage['lmd:' + version + ':' + moduleName] = global.JSON.stringify(module);
        } catch(e) {}
    }
}