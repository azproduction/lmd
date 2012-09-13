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
        results = [];

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
        method(items[i], readyFactory(i));
    }
}

sb.on('*:request-parallel', function (moduleNames, callback, method) {
    parallel(method, moduleNames, callback);
    return [];
});

}(sandbox));