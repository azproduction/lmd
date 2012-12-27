/**
 * Image loader plugin
 *
 * Flag "image"
 *
 * This plugin provides require.image() function
 */

/**
 * @name sandbox
 */
(function (sb) {
    /**
     * Loads any image
     *
     * @param {String|Array} moduleName path to file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLImageElement on success
     */
    sb.require.image = function (moduleName, callback) {
        /*if ($P.PROMISE) {*/var createPromiseResult = sb.trigger('*:create-promise');/*}*/
        var returnResult = /*if ($P.PROMISE) {*/createPromiseResult[1] || /*}*/sb.require;
        callback = /*if ($P.PROMISE) {*/createPromiseResult[0] || /*}*/callback || sb.noop;

        if (typeof moduleName !== "string") {
            callback = sb.trigger('*:request-parallel', moduleName, callback, sb.require.image)[1];
            if (!callback) {
                return returnResult;
            }
        }

        var module = sb.modules[moduleName];

        var replacement = sb.trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        sb.trigger('*:before-check', moduleName, module, 'image');
        // If module exists or its a worker or node.js environment
        if (module || !sb.document) {
            callback(sb.initialized[moduleName] ? module : sb.require(moduleName));
            return returnResult;
        }

        sb.trigger('*:before-init', moduleName, module);

        callback = sb.trigger('*:request-race', moduleName, callback)[1];
        // if already called
        if (!callback) {
            return returnResult;
        }

/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_IF 0/*}*/
        var img = new Image();
        /*if ($P.IE) {*/var cleanup = function () {try {delete img.onload; delete img.onerror;} catch (err) {img.onload = img.onerror = sb.noop;}};/*}*/
        img.onload = function () {
            callback(sb.register(moduleName, img));
            /*if ($P.IE) {*/cleanup();/*}*/
        };
        img.onerror = function () {
            sb.trigger('*:request-error', moduleName, module);
            callback();
            /*if ($P.IE) {*/cleanup();/*}*/
        };
        img.src = moduleName;

        return returnResult;
/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_ENDIF/*}*/
    };

}(sandbox));