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

    if ($P.ASYNC_PLAIN) {

        /**
         * @param code
         * @return {Boolean} true if it is a plain LMD module
         */
        var async_is_plain_code = function (code) {
            // remove comments (bad rx - I know it, but it works for that case), spaces and ;
            code = code.replace(/\/\*.*?\*\/|\/\/.*(?=[\n\r])|\s|\;/g, '');

            // simple FD/FE parser
            if (/\(function\(|function[a-z0-9_]+\(/.test(code)) {
                var index = 0,
                    length = code.length,
                    is_can_return = false,
                    string = false,
                    parentheses = 0,
                    braces = 0;

                while (index < length) {
                    switch (code.charAt(index)) {
                        // count braces if not in string
                        case '{':
                            if (!string) {
                                is_can_return = true;
                                braces++
                            }
                            break;
                        case '}':
                            if (!string) braces--;
                            break;

                        case '(':
                            if (!string) parentheses++;
                            break;
                        case ')':
                            if (!string) parentheses--;
                            break;

                        case '\\':
                            if (string) index++; // skip next char in in string
                            break;

                        case "'":
                            if (string === "'") {
                                string = false; // close string
                            } else if (string === false) {
                                string = "'"; // open string
                            }
                            break;

                        case '"':
                            if (string === '"') {
                                string = false; // close string
                            } else if (string === false) {
                                string = '"'; // open string
                            }
                            break;
                    }
                    index++;

                    if (is_can_return && !parentheses && !braces) {
                        return index !== length;
                    }
                }
            }
            return true;
        };
    }

    if ($P.ASYNC_PLAIN || $P.ASYNC_PLAINONLY) {
        var async_plain = function (module, contentTypeOrExtension) {
            // its NOT a JSON ant its a plain code
            if (!(/json$/).test(contentTypeOrExtension)/*if ($P.ASYNC_PLAIN) {*/ && async_is_plain_code(module)/*}*/) {
                // its not a JSON and its a Plain LMD module - wrap it
                module = '(function(require,exports,module){\n' + module + '\n})';
            }
            return module;
        };
    }

    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    require.async = function (moduleName, callback) {
        callback = callback || global_noop;

        if ($P.PARALLEL) {
            // expect that its an array
            if (typeof moduleName !== "string") {
                parallel(require.async, moduleName, callback);
                return require;
            }
        }
        var module = modules[moduleName],
            XMLHttpRequestConstructor = global.XMLHttpRequest || global.ActiveXObject;

        if ($P.SHORTCUTS) {
            // Its an shortcut
            if (is_shortcut(moduleName, module)) {
                // rewrite module name
                if ($P.STATS) {
                    // assign shortcut name for module
                    stats_shortcut(module, moduleName);
                }
                moduleName = module.replace('@', '');
                module = modules[moduleName];
            }
        }

        if ($P.STATS) {
            if (!module || initialized_modules[moduleName]) {
                stats_require(moduleName);
            }
        }
        // If module exists or its a node.js env
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

        if ($P.NODE) {
            if (!XMLHttpRequestConstructor) {
                global.require('fs').readFile(moduleName, 'utf8', function (err, module) {
                    if (err) {

                        if ($P.STATS) {
                            // stop init on error
                            stats_initEnd(moduleName);
                        }
                        callback();
                        return;
                    }
                    // check file extension - not content-type
                    if ((/js$|json$/).test(moduleName)) {
                        if ($P.STATS_COVERAGE_ASYNC) {
                            var isPlainModule = false;
                            if ($P.ASYNC_PLAIN) {
                                isPlainModule = async_is_plain_code(module);
                            }
                            if ($P.ASYNC_PLAINONLY) {
                                isPlainModule = true;
                            }
                        }
                        if ($P.ASYNC_PLAIN || $P.ASYNC_PLAINONLY) {
                            module = async_plain(module, moduleName);
                        }
                        if ($P.STATS_COVERAGE_ASYNC) {
                            if (!(/json$/).test(moduleName)) {
                                module = coverage_apply(moduleName, moduleName, module, isPlainModule);
                            }
                        }
                        module = global_eval(module);
                    }
                    // 4. Then callback it
                    callback(register_module(moduleName, module));
                });
                return require;
            }
        }
/*if ($P.NODE) {*///#JSCOVERAGE_IF 0/*}*/
        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    var contentType = xhr.getResponseHeader('content-type');
                    module = xhr.responseText;
                    if ((/script$|json$/).test(contentType)) {
                        if ($P.STATS_COVERAGE_ASYNC) {
                            var isPlainModule = false;
                            if ($P.ASYNC_PLAIN) {
                                isPlainModule = async_is_plain_code(module);
                            }
                            if ($P.ASYNC_PLAINONLY) {
                                isPlainModule = true;
                            }
                        }
                        if ($P.ASYNC_PLAIN || $P.ASYNC_PLAINONLY) {
                            module = async_plain(module, contentType);
                        }
                        if ($P.STATS_COVERAGE_ASYNC) {
                            if (!(/json$/).test(contentType)) {
                                module = coverage_apply(moduleName, moduleName, module, isPlainModule);
                            }
                        }
                        module = global_eval(module);
                    }

                    if ($P.CACHE_ASYNC) {
                        cache_async(moduleName, typeof module === "function" ? xhr.responseText : module);
                    }
                    // 4. Then callback it
                    callback(register_module(moduleName, module));
                } else {
                    if ($P.STATS) {
                        // stop init on error
                        stats_initEnd(moduleName);
                    }
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return require;
/*if ($P.NODE) {*///#JSCOVERAGE_ENDIF/*}*/
    };