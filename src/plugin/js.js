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
/*$IF PARALLEL$*/
        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.js, moduleName, callback);
            return require;
        }
/*$ENDIF PARALLEL$*/
        var module = modules[moduleName],
            readyState = 'readyState',
            isNotLoaded = 1,
            head;

        // If module exists
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }

/*$IF RACE$*/
        callback = create_race(moduleName, callback);
        // if already called
        if (race_callbacks[moduleName].length > 1) {
            return require;
        }
/*$ENDIF RACE$*/

        // by default return undefined
        if (!global_document) {
/*$IF WORKER_OR_NODE$*/
            // if no global try to require
            // node or worker
            try {
                // call importScripts or require
                // any of them can throw error if file not found or transmission error
                module = register_module(moduleName, (global.importScripts || global.require)(moduleName) || {});
            } catch (e) {
                // error -> default behaviour
            }
/*$ENDIF WORKER_OR_NODE$*/
            callback(module);
            return require;
        }

/*$IF WORKER_OR_NODE$*/
//#JSCOVERAGE_IF 0
/*$ENDIF WORKER_OR_NODE$*/
        var script = global_document.createElement("script");
        global.setTimeout(script.onreadystatechange = script.onload = function (e) {
            /*$IF IE$*/e = e || global.event;/*$ENDIF IE$*/
            if (isNotLoaded &&
                (!e ||
                !script[readyState] ||
                script[readyState] == "loaded" ||
                script[readyState] == "complete")) {

                isNotLoaded = 0;
                // register or cleanup
                callback(e ? register_module(moduleName, script) : head.removeChild(script) && local_undefined); // e === undefined if error
            }
        }, 3000, 0);

        script.src = moduleName;
        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);

        return require;
/*$IF WORKER_OR_NODE$*/
//#JSCOVERAGE_ENDIF
/*$ENDIF WORKER_OR_NODE$*/
    };