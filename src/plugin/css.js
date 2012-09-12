/**
 * Async loader of css files
 *
 * Flag "css"
 *
 * This plugin provides require.css() function
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
     * Loads any CSS file
     *
     * Inspired by yepnope.css.js
     *
     * @see https://github.com/SlexAxton/yepnope.js/blob/master/plugins/yepnope.css.js
     *
     * @param {String|Array} moduleName path to css file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLLinkElement on success
     */
    require.css = function (moduleName, callback) {
        callback = callback || global_noop;

        if (typeof moduleName !== "string") {
            callback = lmd_trigger('*:request-parallel', moduleName, callback, require.css)[1];
            if (!callback) {
                return require;
            }
        }

        var module = modules[moduleName],
            isNotLoaded = 1,
            head;

        var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        lmd_trigger('css:before-check', moduleName, module);
        // If module exists or its a worker or node.js environment
        if (module || !global_document) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }

        lmd_trigger('css:before-init', moduleName, module);

        callback = lmd_trigger('*:request-race', moduleName, callback)[1];
        // if already called
        if (!callback) {
            return require;
        }
/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_IF 0/*}*/
        // Create stylesheet link
        var link = global_document.createElement("link"),
            id = +new global.Date,
            onload = function (e) {
                if (isNotLoaded) {
                    isNotLoaded = 0;
                    // register or cleanup
                    link.removeAttribute('id');

                    if (!e) {
                        lmd_trigger('css:request-error', moduleName, module);
                    }
                    callback(e ? register_module(moduleName, link) : head.removeChild(link) && local_undefined); // e === undefined if error
                }
            };

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        global.setTimeout(onload, 3000, 0);

        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        (function poll() {
            if (isNotLoaded) {
                try {
                    var sheets = global_document.styleSheets;
                    for (var j = 0, k = sheets.length; j < k; j++) {
                        if((sheets[j].ownerNode/*if ($P.IE) {*/ || sheets[j].owningElement/*}*/).id == id &&
                           (sheets[j].cssRules/*if ($P.IE) {*/ || sheets[j].rules/*}*/).length) {
//#JSCOVERAGE_IF 0
                            return onload(1);
//#JSCOVERAGE_ENDIF
                        }
                    }
                    // if we get here, its not in document.styleSheets (we never saw the ID)
                    throw 1;
                } catch(e) {
                    // Keep polling
                    global.setTimeout(poll, 90);
                }
            }
        }());

        return require;
/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_ENDIF/*}*/
    };