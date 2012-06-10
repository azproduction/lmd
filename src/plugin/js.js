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

    /**
     * Loads any JavaScript file a non-LMD module
     *
     * @param {String|Array} moduleName path to file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLScriptElement on success
     */
    require.js = function (moduleName, callback) {
        callback = callback || global_noop;

        if ($P.PARALLEL) {
            // expect that its an array
            if (typeof moduleName !== "string") {
                parallel(require.js, moduleName, callback);
                return require;
            }
        }
        var module = modules[moduleName],
            readyState = 'readyState',
            isNotLoaded = 1,
            head;

        if ($P.SHORTCUTS) {
            // Its an shortcut
            if (is_shortcut(moduleName, module)) {
                if ($P.STATS) {
                    // assign shortcut name for module
                    stats_shortcut(module, moduleName);
                }
                // rewrite module name
                moduleName = module.replace('@', '');
                module = modules[moduleName];
            }
        }

        if ($P.STATS) {
            if (!module || initialized_modules[moduleName]) {
                stats_require(moduleName);
            }
        }
        // If module exists
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }

        if ($P.STATS) {
            stats_initStart(moduleName);
        }

        if ($P.RACE) {
            callback = create_race(moduleName, callback);
            // if already called
            if (race_callbacks[moduleName].length > 1) {
                return require;
            }
        }
        // by default return undefined
        if (!global_document) {

            if ($P.WORKER || $P.NODE) {
                // if no global try to require
                // node or worker
                try {
                    // call importScripts or require
                    // any of them can throw error if file not found or transmission error
                    module = register_module(moduleName, (global.importScripts || global.require)(moduleName) || {});
                } catch (e) {
                    // error -> default behaviour
                    if ($P.STATS) {
                        // stop init on error
                        stats_initEnd(moduleName);
                    }
                }
            }
            callback(module);
            return require;
        }

/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_IF 0/*}*/
        var script = global_document.createElement("script");
        global.setTimeout(script.onreadystatechange = script.onload = function (e) {
            if ($P.IE) {
                e = e || global.event;
            }
            if (isNotLoaded &&
                (!e ||
                !script[readyState] ||
                script[readyState] == "loaded" ||
                script[readyState] == "complete")) {

                isNotLoaded = 0;
                // register or cleanup
                if ($P.STATS) {
                    // stop init on error
                    !e && stats_initEnd(moduleName);
                }
                callback(e ? register_module(moduleName, script) : head.removeChild(script) && local_undefined); // e === undefined if error
            }
        }, 3000, 0);

        script.src = moduleName;
        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);

        return require;
/*if ($P.WORKER || $P.NODE) {*///#JSCOVERAGE_ENDIF/*}*/
    };