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