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
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, 'css'), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = replacement[0][0];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2],
            isNotLoaded = 1,
            head;

        callback = replacement[1];
        moduleName = replacement[0][1];

/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_IF 0/*}*/
        // Create stylesheet link
        var link = sb.document.createElement("link"),
            id = Math.random() + '',
            onload = function () {
                if (isNotLoaded) {
                    isNotLoaded = 0;
                    // register or cleanup
                    link.removeAttribute('id');

                    callback(sb.register(moduleName, link)); // e === undefined if error
                }
            };

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        head = sb.document.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        function isRules(sheet) {
            if ((sheet.ownerNode || sheet.owningElement).id != id) {
                return false;
            }
            try {
                // It can be null or throw an Security error in case of cross origin stylesheets
                return !!(sheet.cssRules || sheet.rules).length;
            } catch (e) {
                // In case of access error assume that css is loaded
                return true;
            }
        }

        (function poll() {
            if (isNotLoaded) {
                var sheets = sb.document.styleSheets,
                    j = 0,
                    k = sheets.length;

                try {
                    for (; j < k; j++) {
                        if (isRules(sheets[j])) {
//#JSCOVERAGE_IF 0
                            return onload();
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

        return returnResult;
/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_ENDIF/*}*/
    };

}(sandbox));