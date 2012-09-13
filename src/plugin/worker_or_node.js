/**
 * @name sandbox
 */
(function (sb) {
    sb.on('js:request-environment-module', function (moduleName, module) {
        try {
            // call importScripts or require
            // any of them can throw error if file not found or transmission error
            module = sb.register(moduleName, (sb.global.importScripts || sb.global.require)(moduleName) || {});
            return [moduleName, module];
        } catch (e) {
            // error -> default behaviour
            sb.trigger('*:request-error', moduleName, module);
            return [moduleName, module];
        }
    });
}(sandbox));