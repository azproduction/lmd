(function () {
    lmd_on('async:require-environment-file', function (event, moduleName, module, callback) {
        global.require('fs').readFile(moduleName, 'utf8', function (err, module) {
            if (err) {
                lmd_trigger('node:request-error', moduleName);
                callback();
                return;
            }
            // check file extension - not content-type
            if ((/js$|json$/).test(moduleName)) {
                module = lmd_trigger('*:wrap-module', moduleName, module, moduleName)[1];
                if (!(/json$/).test(moduleName)) {
                    module = lmd_trigger('*:coverage-apply', moduleName, module)[1];
                }
                module = global_eval(module);
            }
            // 4. Then callback it
            callback(register_module(moduleName, module));
        });
    });
}());