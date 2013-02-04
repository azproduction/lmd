/**
 * Async loader of off-package LMD modules (special LMD format file)
 *
 * @see /README.md near "LMD Modules types" for details
 *
 * Flag "async"
 *
 * This plugin provides require.preload() function
 */
/**
 * @name sandbox
 */
(function (sb) {
    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    sb.require.preload = function (moduleName, callback) {
        return sb.trigger('*:preload', moduleName, callback, 'preload')[0];
    };

}(sandbox));