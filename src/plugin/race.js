/**
 * This plugin prevents from duplicate resource loading
 *
 * Flag "race"
 *
 * This plugin provides private "race_callbacks" function
 */

/**
 * @name sandbox
 */
(function (sb) {

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

    /**
     * @event *:request-race race module request eg for cases when some async modules are required simultaneously
     *
     * @param {String}   moduleName race for module name
     * @param {Function} callback   this callback will be called when module inited
     *
     * @retuns yes returns callback if race is empty or only 1 item in it
     */
sb.on('*:request-race', function (moduleName, callback) {
    callback = create_race(moduleName, callback);
    if (race_callbacks[moduleName].length > 1) {
        return [moduleName];
    } else {
        return [moduleName, callback];
    }
});

}(sandbox));