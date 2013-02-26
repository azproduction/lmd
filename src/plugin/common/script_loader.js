/**
 * Internal module
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
    sb.on('*:load-script', function (moduleName, callback) {
        var readyState = 'readyState',
            isNotLoaded = 1,
            head;

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
                    sb.trigger('*:request-error', moduleName);
                }
                callback(e ? sb.register(moduleName, script) : head.removeChild(script) && sb.undefined); // e === undefined if error
            }
        }, 3000, 0);

        script.src = moduleName;
        head = sb.document.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);

        return [moduleName, callback];
    });

}(sandbox));