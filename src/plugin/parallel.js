/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

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
                callback.apply(global, results);
            }
        }
    };

    for (; i < c; i++) {
        method(items[i], readyFactory(i));
    }
}