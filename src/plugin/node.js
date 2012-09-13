/**
 * @name sandbox
 */
(function (sb) {
    sb.on('async:require-environment-file', function (moduleName, module, callback) {
        sb.global.require('fs').readFile(moduleName, 'utf8', function (err, module) {
            if (err) {
                sb.trigger('*:request-error', moduleName);
                callback();
                return;
            }
            // check file extension - not content-type
            if ((/js$|json$/).test(moduleName)) {
                module = sb.trigger('*:wrap-module', moduleName, module, moduleName)[1];
                if (!(/json$/).test(moduleName)) {
                    module = sb.trigger('*:coverage-apply', moduleName, module)[1];
                }
                module = sb.eval(module);
            }
            // 4. Then callback it
            callback(sb.register(moduleName, module));
        });
    });
}(sandbox));