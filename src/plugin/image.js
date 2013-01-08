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
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, 'image'), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = replacement[0][0];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2];

        callback = replacement[1];
        moduleName = replacement[0][1];

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