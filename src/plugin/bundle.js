/**
 * Bundle loader
 *
 * Flag "bundle"
 *
 * This plugin provides require.bundle() function
 */

/**
 * @name sandbox
 */
(function (sb) {
    var callbackName = sb.options.bundle,
        pendingBundlesLength = 0;

    /**
     * Cases:
     *     ({main}, {modules}, {options})
     *     ({modules}, {options})
     *     ({modules})
     *
     * @param {Function} _main
     * @param {Object}   _modules
     * @param {Object}   _modules_options
     */
    var processBundleJSONP = function (_main, _modules, _modules_options) {
        if (typeof _main === "object") {
            _modules_options = _modules;
            _modules = _main;
        }

        for (var moduleName in _modules) {
            // if already initialized - skip
            if (moduleName in sb.modules) {
                continue;
            }

            // declare new modules
            sb.modules[moduleName] = _modules[moduleName];
            sb.initialized[moduleName] = 0;

            // declare module options
            if (_modules_options && moduleName in _modules_options) {
                sb.modules_options[moduleName] = _modules_options[moduleName];
            }
        }

        if (typeof _main === "function") {
            var output = {'exports': {}};
            _main(sb.trigger('lmd-register:decorate-require', "<bundle:main>", sb.require)[1], output.exports, output);
        }
    };

    var trap = function () {
        pendingBundlesLength++;
        // make trap
        sb.global[callbackName] = processBundleJSONP;
    };

    var cleanup = function (callback, scriptTag) {
        // Be sure that callback will be called after script eval
        setTimeout(function () {
            pendingBundlesLength--;
            // cleanup if no pending bundles
            if (!pendingBundlesLength) {
                sb.global[callbackName] = sb.undefined;
            }
            callback(scriptTag);
        }, 10);
    };

    /**
     * Loads LMD bundle
     *
     * @param {String|Array} bundleSrc path to file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLScriptElement on success
     */
    sb.require.bundle = function (bundleSrc, callback) {
        var replacement = sb.trigger('*:request-off-package', bundleSrc, callback, 'image'), // [[returnResult, bundleSrc, bundle, true], callback, type]
            returnResult = replacement[0][0];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        callback = replacement[1];
        bundleSrc = replacement[0][1];

        trap();

        sb.trigger('*:load-script', bundleSrc, function (scriptTag) {
            cleanup(callback, scriptTag);
        });

        return returnResult;
    };

}(sandbox));