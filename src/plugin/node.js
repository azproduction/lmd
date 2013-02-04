/**
 * @name sandbox
 */
(function (sb) {
    /**
     * @event async:require-environment-file requests file register using some environment functions non XHR
     *
     * @param {String}   moduleName
     * @param {String}   module
     * @param {Function} callback   this callback will be called when module inited
     *
     * @retuns no
     */
    sb.on('preload:require-environment-file', function (moduleName, module, callback) {
        require('fs').readFile(moduleName, 'utf8', function (err, module) {
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