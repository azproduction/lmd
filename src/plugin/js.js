/**
 * Async loader of js files (NOT LMD modules): jQuery, d3.js etc
 *
 * Flag "js"
 *
 * This plugin provides require.js() function
 */

/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

    /**
     * Loads any JavaScript file a non-LMD module
     *
     * @param {String|Array} moduleName path to file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLScriptElement on success
     */
    require.js = function (moduleName, callback) {
        callback = callback || global_noop;

        if (typeof moduleName !== "string") {
            callback = lmd_trigger('*:request-parallel', moduleName, callback, require.js)[1];
            if (!callback) {
                return require;
            }
        }

        var module = modules[moduleName],
            readyState = 'readyState',
            isNotLoaded = 1,
            head;

        var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        lmd_trigger('js:before-check', moduleName, module);
        // If module exists
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
        // by default return undefined
        if (!global_document) {
            module = lmd_trigger('js:request-environment-module', moduleName, module)[1];
            callback(module);
            return require;
        }

/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_IF 0/*}*/
        var script = global_document.createElement("script");
        global.setTimeout(script.onreadystatechange = script.onload = function (e) {
            e = e || global.event;
            if (isNotLoaded &&
                (!e ||
                !script[readyState] ||
                script[readyState] == "loaded" ||
                script[readyState] == "complete")) {

                isNotLoaded = 0;
                // register or cleanup
                if (!e) {
                    lmd_trigger('js:request-error', moduleName, module);
                }
                callback(e ? register_module(moduleName, script) : head.removeChild(script) && local_undefined); // e === undefined if error
            }
        }, 3000, 0);

        script.src = moduleName;
        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);

        return require;
/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_ENDIF/*}*/
    };