/**
 * This plugin prevents from duplicate resource loading
 *
 * Flag "race"
 *
 * This plugin provides private "race_callbacks" function
 */

(function () {

var race_callbacks = {},
    /**
     * Creates race.
     *
     * @param {String}   name     race name
     * @param {Function} callback callback
     */
    create_race = function (name, callback) {
        if (!race_callbacks[name]) {
            // create race
            race_callbacks[name] = [];
        }
        race_callbacks[name].push(callback);

        return function (result) {
            var callbacks = race_callbacks[name];
            while(callbacks && callbacks.length) {
                callbacks.shift()(result);
            }
            // reset race
            race_callbacks[name] = false;
        }
    };

lmd_on('*:request-race', function (event, moduleName, callback) {
    callback = create_race(moduleName, callback);
    if (race_callbacks[moduleName].length > 1) {
        return [moduleName];
    } else {
        return [moduleName, callback];
    }
});

}());