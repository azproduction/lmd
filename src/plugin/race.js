if ($P.CSS || $P.JS || $P.ASYNC) {
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
}