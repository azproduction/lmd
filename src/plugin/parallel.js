/**
 * Parallel resource loader
 *
 * Flag "parallel"
 *
 * This plugin provides private "parallel" function
 */

/**
 * @name sandbox
 */
(function (sb) {

function parallel(method, items, callback) {
    var i = 0,
        j = 0,
        c = items.length,
        results = [],
        ready;

    var readyFactory = function (index) {
        return function (data) {
            // keep the order
            results[index] = data;
            j++;
            if (j >= c) {
                callback.apply(sb.global, results);
            }
        }
    };

    for (; i < c; i++) {
        ready = readyFactory(i);
        method(items[i], ready)/*if ($P.PROMISE) {*/.then(ready, ready)/*}*/;
    }
}

    /**
     * @event *:request-parallel parallel module request for require.async(['a', 'b', 'c']) etc
     *
     * @param {Array}    moduleNames list of modules to init
     * @param {Function} callback    this callback will be called when module inited
     * @param {Function} method      method to call for init
     *
     * @retuns yes empty environment
     */
sb.on('*:request-parallel', function (moduleNames, callback, method) {
    parallel(method, moduleNames, callback);
    return [];
});

}(sandbox));