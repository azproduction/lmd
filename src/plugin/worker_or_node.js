(function () {
    lmd_on('js:request-environment-module', function (event, moduleName, module) {
        try {
            // call importScripts or require
            // any of them can throw error if file not found or transmission error
            module = register_module(moduleName, (global.importScripts || global.require)(moduleName) || {});
            return [moduleName, module];
        } catch (e) {
            // error -> default behaviour
            lmd_trigger('worker_or_node:request-error', moduleName, module);
            return [moduleName, module];
        }
    });
}());