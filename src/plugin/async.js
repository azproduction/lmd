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
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name global_noop
 * @name register_module
 * @name create_race
 * @name race_callbacks
 * @name cache_async
 * @name parallel
 */

    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    require.async = function (moduleName, callback) {
        callback = callback || global_noop;

        if (typeof moduleName !== "string") {
            callback = lmd_trigger('*:request-parallel', moduleName, callback, require.async)[1];
            if (!callback) {
                return require;
            }
        }

        var module = modules[moduleName],
            XMLHttpRequestConstructor = global.XMLHttpRequest || global.ActiveXObject;

        var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        lmd_trigger('async:before-check', moduleName, module);
        // If module exists or its a node.js env
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }

        lmd_trigger('js:before-init', moduleName, module);

        callback = lmd_trigger('*:request-race', moduleName, callback)[1];
        // if already called
        if (!callback) {
            return require;
        }

        if (!XMLHttpRequestConstructor) {
            lmd_trigger('async:require-environment-file', moduleName, module, callback);
            return require;
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
                        module = lmd_trigger('*:wrap-module', moduleName, module, contentType)[1];
                        if (!(/json$/).test(contentType)) {
                            module = lmd_trigger('*:coverage-apply', moduleName, module)[1];
                        }

                        module = global_eval(module);
                    }

                    lmd_trigger('async:before-callback', moduleName, typeof module === "function" ? xhr.responseText : module);
                    // 4. Then callback it
                    callback(register_module(moduleName, module));
                } else {
                    lmd_trigger('async:request-error', moduleName, module);
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return require;
/*if ($P.NODE) {*///#JSCOVERAGE_ENDIF/*}*/
    };