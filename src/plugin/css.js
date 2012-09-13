/**
 * Async loader of css files
 *
 * Flag "css"
 *
 * This plugin provides require.css() function
 */
/**
 * @name sandbox
 */
(function (sb) {

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
    sb.require.css = function (moduleName, callback) {
        callback = callback || sb.noop;

        if (typeof moduleName !== "string") {
            callback = sb.trigger('*:request-parallel', moduleName, callback, sb.require.css)[1];
            if (!callback) {
                return sb.require;
            }
        }

        var module = sb.modules[moduleName],
            isNotLoaded = 1,
            head;

        var replacement = sb.trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        sb.trigger('css:before-check', moduleName, module);
        // If module exists or its a worker or node.js environment
        if (module || !sb.document) {
            callback(sb.initialized[moduleName] ? module : sb.require(moduleName));
            return sb.require;
        }

        sb.trigger('*:before-init', moduleName, module);

        callback = sb.trigger('*:request-race', moduleName, callback)[1];
        // if already called
        if (!callback) {
            return sb.require;
        }
/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_IF 0/*}*/
        // Create stylesheet link
        var link = sb.document.createElement("link"),
            id = +new sb.global.Date,
            onload = function (e) {
                if (isNotLoaded) {
                    isNotLoaded = 0;
                    // register or cleanup
                    link.removeAttribute('id');

                    if (!e) {
                        sb.trigger('*:request-error', moduleName, module);
                    }
                    callback(e ? sb.register(moduleName, link) : head.removeChild(link) && sb.undefined); // e === undefined if error
                }
            };

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        sb.global.setTimeout(onload, 3000, 0);

        head = sb.document.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        (function poll() {
            if (isNotLoaded) {
                try {
                    var sheets = sb.document.styleSheets;
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
                    sb.global.setTimeout(poll, 90);
                }
            }
        }());

        return sb.require;
/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_ENDIF/*}*/
    };

}(sandbox));