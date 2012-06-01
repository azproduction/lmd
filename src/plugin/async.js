/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name global_noop
 * @name register_module
 * @name create_race
 * @name race_callbacks
 * @name cache_async
 * @name parallel
 */

    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    require.async = function (moduleName, callback) {
        callback = callback || global_noop;
/*$IF PARALLEL$*/
        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.async, moduleName, callback);
            return require;
        }
/*$ENDIF PARALLEL$*/
        var module = modules[moduleName],
            XMLHttpRequestConstructor = global.XMLHttpRequest || global.ActiveXObject;

        /*$IF SHORTCUTS$*/
        // Its an shortcut
        if (is_shortcut(moduleName, module)) {
            // rewrite module name
            moduleName = module.replace('@', '');
            module = modules[moduleName];
        }
        /*$ENDIF SHORTCUTS$*/

        // If module exists or its a node.js env
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

/*$IF NODE$*/
        if (!XMLHttpRequestConstructor) {
            global.require('fs').readFile(moduleName, 'utf8', function (err, module) {
                if (err) {
                    callback();
                    return;
                }
                // check file extension not content-type
                if ((/js$|json$/).test(moduleName)) {
                    module = global_eval('(' + module + ')');
                }
                // 4. Then callback it
                callback(register_module(moduleName, module));
            });
            return require;
        }
/*$ENDIF NODE$*/

/*$IF NODE$*/
//#JSCOVERAGE_IF 0
/*$ENDIF NODE$*/
        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    module = xhr.responseText;
                    if ((/script$|json$/).test(xhr.getResponseHeader('content-type'))) {
                        /*$IF IE$*/module = '(function(){return' + module + '})()';/*$ENDIF IE$*/
                        module = global_eval('(' + module + ')');
                    }
                    /*$IF CACHE_ASYNC$*/cache_async(moduleName, typeof module === "function" ? xhr.responseText : module);/*$ENDIF CACHE_ASYNC$*/
                    // 4. Then callback it
                    callback(register_module(moduleName, module));
                } else {
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return require;
/*$IF NODE$*/
//#JSCOVERAGE_ENDIF
/*$ENDIF NODE$*/
    };