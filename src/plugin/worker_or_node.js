/**
 * @name sandbox
 */
(function (sb) {
    /**
     * @event js:request-environment-module js.js plugin requests for enviroment-based module init
     *        (importScripts or node require)
     *
     * @param {String}   moduleName
     * @param {String}   module
     *
     * @retuns yes
     */
    sb.on('js:request-environment-module', function (moduleName, module) {
        try {
            // call importScripts or require
            // any of them can throw error if file not found or transmission error
            module = sb.modules[moduleName] = (sb.global.importScripts || require)(moduleName) || {};
            return [moduleName, module];
        } catch (e) {
            // error -> default behaviour
            sb.trigger('*:request-error', moduleName, module);
            return [moduleName, module];
        }
    });
}(sandbox));