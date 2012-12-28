/**
 * Async loader of js files (NOT LMD modules): jQuery, d3.js etc
 *
 * Flag "js"
 *
 * This plugin provides require.js() function
 */

/**
 * @name sandbox
 */
(function (sb) {
    /**
     * Loads any JavaScript file a non-LMD module
     *
     * @param {String|Array} moduleName path to file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLScriptElement on success
     */
    sb.require.js = function (moduleName, callback) {
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, 'js'), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = replacement[0][0];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2],
            readyState = 'readyState',
            isNotLoaded = 1,
            head;

        callback = replacement[1];
        moduleName = replacement[0][1];

        // by default return undefined
        if (!sb.document) {
            module = sb.trigger('js:request-environment-module', moduleName, module)[1];
            callback(module);
            return returnResult;
        }

/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_IF 0/*}*/
        var script = sb.document.createElement("script");
        sb.global.setTimeout(script.onreadystatechange = script.onload = function (e) {
            e = e || sb.global.event;
            if (isNotLoaded &&
                (!e ||
                !script[readyState] ||
                script[readyState] == "loaded" ||
                script[readyState] == "complete")) {

                isNotLoaded = 0;
                // register or cleanup
                if (!e) {
                    sb.trigger('*:request-error', moduleName, module);
                }
                callback(e ? sb.register(moduleName, script) : head.removeChild(script) && sb.undefined); // e === undefined if error
            }
        }, 3000, 0);

        script.src = moduleName;
        head = sb.document.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);

        return returnResult;
/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_ENDIF/*}*/
    };

}(sandbox));