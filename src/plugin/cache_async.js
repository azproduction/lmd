/**
 * This plugin dumps off-package modules content to localStorage
 *
 * Flag "cache_async"
 *
 * Provides cache_async function
 */
/**
 * @name sandbox
 */
(function (sb) {

function cache_async(moduleName, module) {
    if (sb.global.localStorage && sb.version) {
        try {
            sb.global.localStorage['lmd:' + sb.version + ':' + moduleName] = sb.global.JSON.stringify(module);
        } catch(e) {}
    }
}

sb.on('async:before-callback', function (moduleName, module) {
    cache_async(moduleName, module);
});

}(sandbox));