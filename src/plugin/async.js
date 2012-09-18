/**
 * Async loader of off-package LMD modules (special LMD format file)
 *
 * @see /README.md near "LMD Modules types" for details
 *
 * Flag "async"
 *
 * This plugin provides require.async() function
 */
/**
 * @name sandbox
 */
(function (sb) {
    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    sb.require.async = function (moduleName, callback) {
        callback = callback || sb.noop;

        if (typeof moduleName !== "string") {
            callback = sb.trigger('*:request-parallel', moduleName, callback, sb.require.async)[1];
            if (!callback) {
                return sb.require;
            }
        }

        var module = sb.modules[moduleName],
            XMLHttpRequestConstructor = sb.global.XMLHttpRequest || sb.global.ActiveXObject;

        var replacement = sb.trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        sb.trigger('async:before-check', moduleName, module);
        // If module exists or its a node.js env
        if (module) {
            callback(sb.initialized[moduleName] ? module : sb.require(moduleName));
            return sb.require;
        }

        sb.trigger('*:before-init', moduleName, module);

        callback = sb.trigger('*:request-race', moduleName, callback)[1];
        // if already called
        if (!callback) {
            return sb.require;
        }

        if (!XMLHttpRequestConstructor) {
            sb.trigger('async:require-environment-file', moduleName, module, callback);
            return sb.require;
        }
/*if ($P.NODE) {*///#JSCOVERAGE_IF 0/*}*/
        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    var contentType = xhr.getResponseHeader('content-type');
                    module = xhr.responseText;
                    if ((/script$|json$/).test(contentType)) {
                        module = sb.trigger('*:wrap-module', moduleName, module, contentType)[1];
                        if (!(/json$/).test(contentType)) {
                            module = sb.trigger('*:coverage-apply', moduleName, module)[1];
                        }

                        module = sb.eval(module);
                    }

                    sb.trigger('async:before-callback', moduleName, typeof module === "function" ? xhr.responseText : module);
                    // 4. Then callback it
                    callback(sb.register(moduleName, module));
                } else {
                    sb.trigger('*:request-error', moduleName, module);
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return sb.require;
/*if ($P.NODE) {*///#JSCOVERAGE_ENDIF/*}*/
    };

}(sandbox));