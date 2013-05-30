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
    if (sb.global.localStorage && sb.options.version) {
        var scriptElement = sb.document.getElementById('lmd-initializer'),
            storageKey = scriptElement ? scriptElement.getAttribute('data-key') : 'lmd';

        try {
            sb.global.localStorage[storageKey + ':' + sb.options.version + ':' + moduleName] = sb.global.JSON.stringify(module);
        } catch(e) {}
    }
}
    /**
     * @event async:before-callback when async.js require is going to return module, uses for cache async module
     *
     * @param {String} moduleName
     * @param {String} module     module content
     *
     * @retuns no
     */
sb.on('preload:before-callback', function (moduleName, module) {
    cache_async(moduleName, module);
});

}(sandbox));