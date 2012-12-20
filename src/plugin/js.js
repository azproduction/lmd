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
        /*if ($P.PROMISE) {*/var createPromiseResult = sb.trigger('*:create-promise');/*}*/
        var returnResult = /*if ($P.PROMISE) {*/createPromiseResult[1] || /*}*/sb.require;
        callback = /*if ($P.PROMISE) {*/createPromiseResult[0] || /*}*/callback || sb.noop;

        if (typeof moduleName !== "string") {
            callback = sb.trigger('*:request-parallel', moduleName, callback, sb.require.js)[1];
            if (!callback) {
                return returnResult;
            }
        }

        var module = sb.modules[moduleName],
            readyState = 'readyState',
            isNotLoaded = 1,
            head;

        var replacement = sb.trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        sb.trigger('js:before-check', moduleName, module);
        // If module exists
        if (module) {
            callback(sb.initialized[moduleName] ? module : sb.require(moduleName));
            return returnResult;
        }

        sb.trigger('*:before-init', moduleName, module);

        callback = sb.trigger('*:request-race', moduleName, callback)[1];
        // if already called
        if (!callback) {
            return returnResult;
        }
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