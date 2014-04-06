// This file was automatically generated from "index.lmd.json"
(function (global, main, modules, modules_options, options) {
    var initialized_modules = {},
        global_eval = function (code) {
            return global.Function('return ' + code)();
        },
        global_noop = function () {},
        global_document = global.document,
        local_undefined,
        /**
         * @param {String} moduleName module name or path to file
         * @param {*}      module module content
         *
         * @returns {*}
         */
        register_module = function (moduleName, module) {
            lmd_trigger('lmd-register:before-register', moduleName, module);
            // Predefine in case of recursive require
            var output = {'exports': {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                // or load modules from nodejs/worker environment
                module = lmd_trigger('js:request-environment-module', moduleName, module)[1] || global[moduleName];
            } else if (typeof module === 'function') {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                var module_require = lmd_trigger('lmd-register:decorate-require', moduleName, lmd_require)[1];

                // Make sure that sandboxed modules cant require
                if (modules_options[moduleName] &&
                    modules_options[moduleName].sandbox &&
                    typeof module_require === 'function') {

                    module_require = local_undefined;
                }

                module = module(module_require, output.exports, output) || output.exports;
            }

            module = lmd_trigger('lmd-register:after-register', moduleName, module)[1];
            return modules[moduleName] = module;
        },
        /**
         * List of All lmd Events
         *
         * @important Do not rename it!
         */
        lmd_events = {},
        /**
         * LMD event trigger function
         *
         * @important Do not rename it!
         */
        lmd_trigger = function (event, data, data2, data3) {
            var list = lmd_events[event],
                result;

            if (list) {
                for (var i = 0, c = list.length; i < c; i++) {
                    result = list[i](data, data2, data3) || result;
                    if (result) {
                        // enable decoration
                        data = result[0] || data;
                        data2 = result[1] || data2;
                        data3 = result[2] || data3;
                    }
                }
            }
            return result || [data, data2, data3];
        },
        /**
         * LMD event register function
         *
         * @important Do not rename it!
         */
        lmd_on = function (event, callback) {
            if (!lmd_events[event]) {
                lmd_events[event] = [];
            }
            lmd_events[event].push(callback);
        },
        /**
         * @param {String} moduleName module name or path to file
         *
         * @returns {*}
         */
        lmd_require = function (moduleName) {
            var module = modules[moduleName];

            var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }

            lmd_trigger('*:before-check', moduleName, module);
            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }

            lmd_trigger('*:before-init', moduleName, module);

            // Lazy LMD module not a string
            if (typeof module === 'string' && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {'exports': {}},

        /**
         * Sandbox object for plugins
         *
         * @important Do not rename it!
         */
        sandbox = {
            'global': global,
            'modules': modules,
            'modules_options': modules_options,
            'options': options,

            'eval': global_eval,
            'register': register_module,
            'require': lmd_require,
            'initialized': initialized_modules,

            'noop': global_noop,
            'document': global_document,
            
            

            'on': lmd_on,
            'trigger': lmd_trigger,
            'undefined': local_undefined
        };

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

/**
 * @name sandbox
 */
(function (sb) {
    var domOnlyLoaders = {
        'css': true,
        'image': true
    };

    var reEvalable = /(java|ecma)script|json/,
        reJson = /json/;

    /**
      * Load off-package LMD module
      *
      * @param {String|Array} moduleName same origin path to LMD module
      * @param {Function}     [callback]   callback(result) undefined on error others on success
      */
    sb.on('*:preload', function (moduleName, callback, type) {
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, type), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = [replacement[0][0], callback, type];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2],
            XMLHttpRequestConstructor = sb.global.XMLHttpRequest || sb.global.ActiveXObject;

        callback = replacement[1];
        moduleName = replacement[0][1];

        if (!XMLHttpRequestConstructor) {
            sb.trigger('preload:require-environment-file', moduleName, module, callback);
            return returnResult;
        }

        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    var contentType = xhr.getResponseHeader('content-type');
                    module = xhr.responseText;
                    if (reEvalable.test(contentType)) {
                        module = sb.trigger('*:wrap-module', moduleName, module, contentType)[1];
                        if (!reJson.test(contentType)) {
                            module = sb.trigger('*:coverage-apply', moduleName, module)[1];
                        }

                        sb.trigger('preload:before-callback', moduleName, module);
                        module = sb.eval(module);
                    } else {
                        sb.trigger('preload:before-callback', moduleName, module);
                    }

                    if (type === 'preload') {
                        // 4. Declare it
                        sb.modules[moduleName] = module;
                        // 5. Then callback it
                        callback(moduleName);
                    } else {
                        // 4. Callback it
                        callback(sb.register(moduleName, module));
                    }
                } else {
                    sb.trigger('*:request-error', moduleName, module);
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return returnResult;

    });

    /**
     * @event *:request-off-package
     *
     * @param {String}   moduleName
     * @param {Function} callback
     * @param {String}   type
     *
     * @retuns yes [asap, returnResult]
     */
    sb.on('*:request-off-package', function (moduleName, callback, type) {
        var createPromiseResult = sb.trigger('*:create-promise');
        var returnResult = createPromiseResult[1] || sb.require;
        callback = createPromiseResult[0] || callback || sb.noop;

        if (typeof moduleName !== "string") {
            callback = sb.trigger('*:request-parallel', moduleName, callback, sb.require[type])[1];
            if (!callback) {
                return [[returnResult, moduleName, module, true], callback, type];
            }
        }

        var module = sb.modules[moduleName];

        var replacement = sb.trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        sb.trigger('*:before-check', moduleName, module, type);
        // If module exists or its a node.js env
        if (module || (domOnlyLoaders[type] && !sb.document)) {
            callback(type === "preload" ? moduleName : sb.initialized[moduleName] ? module : sb.require(moduleName));
            return [[returnResult, moduleName, module, true], callback, type];
        }

        sb.trigger('*:before-init', moduleName, module);

        callback = sb.trigger('*:request-race', moduleName, callback)[1];
        // if already called
        if (!callback) {
            return [[returnResult, moduleName, module, true], callback, type]
        }

        return [[returnResult, moduleName, module, false], callback, type];
    });
}(sandbox));

/**
 * Async loader of off-package LMD modules (special LMD format file)
 *
 * @see /README.md near "LMD Modules types" for details
 *
 * Flag "async"
 *
 * This plugin provides require.async() function
 */
/**
 * @name sandbox
 */
(function (sb) {
    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    sb.require.async = function (moduleName, callback) {
        return sb.trigger('*:preload', moduleName, callback, 'async')[0];
    };

}(sandbox));

/**
 * Async loader of css files
 *
 * Flag "css"
 *
 * This plugin provides require.css() function
 */
/**
 * @name sandbox
 */
(function (sb) {

    /**
     * Loads any CSS file
     *
     * Inspired by yepnope.css.js
     *
     * @see https://github.com/SlexAxton/yepnope.js/blob/master/plugins/yepnope.css.js
     *
     * @param {String|Array} moduleName path to css file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLLinkElement on success
     */
    sb.require.css = function (moduleName, callback) {
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, 'css'), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = replacement[0][0];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2],
            isNotLoaded = 1,
            head;

        callback = replacement[1];
        moduleName = replacement[0][1];


        // Create stylesheet link
        var link = sb.document.createElement("link"),
            id = +new sb.global.Date,
            onload = function (e) {
                if (isNotLoaded) {
                    isNotLoaded = 0;
                    // register or cleanup
                    link.removeAttribute('id');

                    if (!e) {
                        sb.trigger('*:request-error', moduleName, module);
                    }
                    callback(e ? sb.register(moduleName, link) : head.removeChild(link) && sb.undefined); // e === undefined if error
                }
            };

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        sb.global.setTimeout(onload, 3000, 0);

        head = sb.document.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        (function poll() {
            if (isNotLoaded) {
                var sheets = sb.document.styleSheets,
                    j = 0,
                    k = sheets.length;

                try {
                    for (; j < k; j++) {
                        if((sheets[j].ownerNode || sheets[j].owningElement).id == id &&
                            (sheets[j].cssRules || sheets[j].rules).length) {
//#JSCOVERAGE_IF 0
                            return onload(1);
//#JSCOVERAGE_ENDIF
                        }
                    }
                    // if we get here, its not in document.styleSheets (we never saw the ID)
                    throw 1;
                } catch(e) {
                    
                    // Keep polling
                    sb.global.setTimeout(poll, 90);
                }
            }
        }());

        return returnResult;

    };

}(sandbox));

/**
 * This plugin enables shortcuts
 *
 * Flag "shortcuts"
 *
 * This plugin provides private "is_shortcut" function
 */

/**
 * @name sandbox
 */
(function (sb) {

function is_shortcut(moduleName, moduleContent) {
    return !sb.initialized[moduleName] &&
           typeof moduleContent === "string" &&
           moduleContent.charAt(0) == '@';
}

function rewrite_shortcut(moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        sb.trigger('shortcuts:before-resolve', moduleName, module);

        moduleName = module.replace('@', '');
        // #66 Shortcut self reference should be resolved as undefined->global name
        var newModule = sb.modules[moduleName];
        module = newModule === module ? sb.undefined : newModule;
    }
    return [moduleName, module];
}

    /**
     * @event *:rewrite-shortcut request for shortcut rewrite
     *
     * @param {String} moduleName race for module name
     * @param {String} module     this callback will be called when module inited
     *
     * @retuns yes returns modified moduleName and module itself
     */
sb.on('*:rewrite-shortcut', rewrite_shortcut);

    /**
     * @event *:rewrite-shortcut fires before stats plugin counts require same as *:rewrite-shortcut
     *        but without triggering shortcuts:before-resolve event
     *
     * @param {String} moduleName race for module name
     * @param {String} module     this callback will be called when module inited
     *
     * @retuns yes returns modified moduleName and module itself
     */
sb.on('stats:before-require-count', function (moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        moduleName = module.replace('@', '');
        module = sb.modules[moduleName];

        return [moduleName, module];
    }
});

}(sandbox));

/**
 * Package usage statistics
 *
 * @see /README.md near "Application statistics. Require, load, eval, call statistics" for details
 *
 * Flag "stats"
 *
 * This plugin provides require.stats() function and bunch of private functions
 */


/**
 * @name LineReport
 * @type {Object}
 *
 * @property {Boolean}  lines        if false -> not called
 * @property {Array[]}  conditions   list of unused conditions [[0, 2], [7, 0]]
 * @property {String[]} functions    list of unused functions in that line
 */

/**
 * @name TypeReport
 * @type {Object}
 *
 * @property {Number} total
 * @property {Number} covered
 * @property {Number} percentage
 */

/**
 * @name LmdCoverage
 * @type {Object}
 *
 * @property {TypeReport}   lines
 * @property {TypeReport}   conditions
 * @property {TypeReport}   functions
 *
 * @property {Object}       report        {lineNum: LineReport}
 */

/**
 * @name lmdStats
 * @type {Object}
 *
 * @property {String}       name            module name
 * @property {Object}       moduleAccessTimes  module access times {byModuleName: accessTimes}
 * @property {Number[]}     accessTimes     access times
 * @property {Number}       initTime        module init time: load+eval+call
 * @property {String[]}     shortcuts       list of used shortcuts
 *
 * @property {String}       type            module type: global, in-package, off-package
 *
 * @property {String[]}     lines           list of all statements
 * @property {String[]}     conditions      list of all conditions
 * @property {String[]}     functions       list of all functions
 *
 * @property {Object}       runLines          {lineId: callTimes}
 * @property {Object}       runConditions     {conditionId: [falseTimes, trueTimes]}
 * @property {Object}       runFunctions      {functionId: callTimes}
 *
 * @property {LmdCoverage} coverage
 *
 * @example
 *  {
 *      name: "pewpew",
 *      type: "in-package",
 *      accessTimes: [0],
 *      moduleAccessTimes: [{
 *          time: 0,
 *          byModule: "main"
 *      }],
 *      initTime: 10,
 *      shortcuts: ["ololo"],
 *
 *      lines: ["4", "5", "8"],
 *      conditions: ["4:1", "5:2"],
 *      functions: ["FunctionName:5:1", "FunctionName2:9:1"],
 *
 *      runLines: {
 *          "4": 1
 *          "5": 0,
 *          "8": 14
 *      },
 *
 *      runConditions: {
 *          "4:1": [1, 0],
 *          "5:2": [0, 0]
 *      },
 *
 *      runFunctions: {
 *          "FunctionName:5:1": 10
 *          "FunctionName2:9:1": 0
 *      }
 *
 *      coverage: {
 *          lines: {
 *              total: 3,
 *              covered: 2,
 *              percentage: 66.66667
 *          },
 *
 *          conditions: {
 *              total: 2,
 *              covered: 0.5,
 *              percentage: 25
 *          },
 *
 *          functions: {
 *              total: 2,
 *              covered: 1,
 *              percentage: 50
 *          },
 *
 *          report: {
 *              "4": {
 *                  conditions: [[1, 0]]
 *              },
 *              "5": {
 *                  lines: false,
 *                  conditions: [[0, 0]]
 *              },
 *              "9": {
 *                  functions: ["FunctionName2"]
 *              }
 *          }
 *      }
 *  }
 */

/**
 * @name sandbox
 */
(function (sb) {

/**
 * @type {lmdStats}
 */
var stats_results = {},
    stats_Date = sb.global.Date,
    stats_startTime = +new stats_Date;

function stats_get(moduleName) {
    return stats_results[moduleName] ?
           stats_results[moduleName] :
           stats_results[moduleName] = {
               name: moduleName,
               accessTimes: [],
               moduleAccessTimes: {},
               initTime: -1
           };
}

function stats_initStart(moduleName) {
    stats_get(moduleName).initTime = +new stats_Date;
}

function stats_initEnd(moduleName) {
    var stat = stats_get(moduleName);
    stat.initTime = +new stats_Date - stat.initTime;
}

function stats_require(moduleName) {
    var stat = stats_get(moduleName);
    stat.accessTimes.push(+new stats_Date - stats_startTime);
}

function stats_require_module(moduleName, byModuleName) {
    var stat = stats_get(moduleName);

    if (!stat.moduleAccessTimes[byModuleName]) {
        stat.moduleAccessTimes[byModuleName] = [];
    }
    stat.moduleAccessTimes[byModuleName].push(+new stats_Date - stats_startTime);
}

function stats_wrap_require_method(method, thisObject, byModuleName) {
    return function (moduleName) {
        stats_require_modules(moduleName, byModuleName);
        return method.apply(thisObject, arguments);
    }
}

function stats_require_modules(moduleName, byModuleName) {
    var moduleNames = [];
    if (Object.prototype.toString.call(moduleName) !== "[object Array]") {
        moduleNames = [moduleName];
    } else {
        moduleNames = moduleName;
    }

    for (var i = 0, c = moduleNames.length, moduleNamesItem, module; i < c; i++) {
        moduleNamesItem = moduleNames[i];
        module = sb.modules[moduleNamesItem];

        var replacement = sb.trigger('stats:before-require-count', moduleNamesItem, module);
        if (replacement) {
            moduleNamesItem = replacement[0];
        }
        stats_require_module(moduleNamesItem, byModuleName);
    }
}

function stats_wrap_require(require, byModuleName) {
    var wrappedRequire = stats_wrap_require_method(require, this, byModuleName);

    for (var name in require) {
        wrappedRequire[name] = require[name];
    }

    if (require.async) {
        wrappedRequire.async = stats_wrap_require_method(require.async, this, byModuleName);
    }

    if (require.css) {
        wrappedRequire.css = stats_wrap_require_method(require.css, this, byModuleName);
    }

    if (require.js) {
        wrappedRequire.js = stats_wrap_require_method(require.js, this, byModuleName);
    }

    return wrappedRequire;
}

function stats_type(moduleName, type) {
    var stat = stats_get(moduleName);
    stat.type = type;
}

function stats_shortcut(moduleName, shortcut) {
    var module = stats_get(moduleName.replace('@', '')),
        shortcuts = module.shortcuts,
        index;
    
    if (!shortcuts) {
        shortcuts = module.shortcuts = [];
    }

    // Link shortcut and real module
    if (!stats_results[shortcut]) {
        stats_results[shortcut] = module;
    }

    // ie6 indexOf hackz
    index = sb.trigger('*:request-indexof', [].indexOf)[0].call(shortcuts, shortcut);

    if (index === -1) {
        shortcuts.push(shortcut);
    }
}

/**
 * Returns module statistics or all statistics
 *
 * @param {String} [moduleName]
 * @return {Object}
 */
sb.require.stats = function (moduleName) {
    var replacement = sb.trigger('stats:before-return-stats', moduleName, stats_results);

    if (replacement && replacement[1]) {
        return replacement[1];
    }
    return moduleName ? stats_results[moduleName] : stats_results;
};

    /**
     * @event lmd-register:decorate-require request for fake require
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns yes wraps require
     */
sb.on('lmd-register:decorate-require', function (moduleName, require) {
    var options = sb.modules_options[moduleName] || {};
    if (options.sandbox) {
        return;
    }
    return [moduleName, stats_wrap_require(require, moduleName)];
});

    /**
     * @event lmd-register:after-register after module register event
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns no
     */
sb.on('lmd-register:after-register', function (moduleName) {
    stats_initEnd(moduleName);
});

    /**
     * @event lmd-register:before-register before module register event
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns no
     */
sb.on('lmd-register:before-register', function (moduleName, module) {
    stats_type(moduleName, !module ? 'global' : typeof sb.modules[moduleName] === "undefined" ? 'off-package' : 'in-package');
});

    /**
     * @event *:before-check before module cache check
     *
     * @param {String} moduleName
     * @param {Object} module
     * @param {String} type
     *
     * @retuns no
     */
sb.on('*:before-check', function (moduleName, module, type) {
    switch (type) {
        case "css":
            if (!(module || !sb.document) || sb.initialized[moduleName]) {
                stats_require(moduleName);
            }
            break;
        case "js":
        case "async":
            if (!module || sb.initialized[moduleName]) {
                stats_require(moduleName);
            }
            break;
        default:
            stats_require(moduleName);
    }
});

    /**
     * @event *:before-init calls when module is goint to eval or call
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns no
     */
sb.on('*:before-init', function (moduleName) {
    stats_initStart(moduleName);
});

    /**
     * @event *:request-error module load error
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns no
     */
sb.on('*:request-error', function (moduleName) {
    stats_initEnd(moduleName);
});

    /**
     * @event shortcuts:before-resolve moduleName is shortcut and its goint to resolve with actual name
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns no
     */
sb.on('shortcuts:before-resolve', function (moduleName, module) {
    // assign shortcut name for module
    stats_shortcut(module, moduleName);
});

    /**
     * @event *:stats-get somethins is request raw module stats
     *
     * @param {String} moduleName
     * @param {Object} result    default stats
     *
     * @retuns yes
     */
sb.on('*:stats-get', function (moduleName, result) {
    return [moduleName, stats_get(moduleName)];
});

    /**
     * @event *:stats-type something tells stats to overwrite module type
     *
     * @param {String} moduleName
     * @param {String} packageType
     *
     * @retuns no
     */
sb.on('*:stats-type', function (moduleName, packageType) {
    stats_type(moduleName, packageType);
});

    /**
     * @event *:stats-results somethins is request processed module stats
     *
     * @param {String} moduleName
     * @param {Object} result     default stats
     *
     * @retuns yes
     */
sb.on('*:stats-results', function (moduleName, result) {
    return [moduleName, stats_results[moduleName]];
});

}(sandbox));

/**
 * @name sandbox
 */
(function (sb) {


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

var async_plain = function (module, contentTypeOrExtension) {
    // its NOT a JSON ant its a plain code
    if (!(/json$/).test(contentTypeOrExtension) && async_is_plain_code(module)) {
        // its not a JSON and its a Plain LMD module - wrap it
        module = '(function(require,exports,module){\n' + module + '\n})';
    }
    return module;
};

    /**
     * @event *:wrap-module Module wrap request
     *
     * @param {String} moduleName
     * @param {String} module this module will be wrapped
     * @param {String} contentTypeOrExtension file content type or extension to avoid wrapping json file
     *
     * @retuns yes
     */
sb.on('*:wrap-module', function (moduleName, module, contentTypeOrExtension) {
    module = async_plain(module, contentTypeOrExtension);
    return [moduleName, module, contentTypeOrExtension];
});

    /**
     * @event *:is-plain-module code type check request: plain or lmd-module
     *
     * @param {String} moduleName
     * @param {String} module
     * @param {String} isPlainCode default value
     *
     * @retuns yes
     */
sb.on('*:is-plain-module', function (moduleName, module, isPlainCode) {
    if (typeof async_is_plain_code === "function") {
        return [moduleName, module, async_is_plain_code(module)];
    }
});

}(sandbox));

/**
 * @name sandbox
 */
(function (sb) {

    var promisePath = sb.options.promise,
        error = 'Bad deferred ' + sb.options.promise,
        deferredFunction,
        name;

    if (typeof promisePath !== "string") {
        throw new Error(error);
    }

    promisePath = promisePath.split('.');
    deferredFunction = sb.require(promisePath[0]);

    while (promisePath.length) {
        name = promisePath.shift();
        if (typeof deferredFunction[name] !== "undefined") {
            deferredFunction = deferredFunction[name];
        }
    }

    if (typeof deferredFunction !== "function") {
        throw new Error(error);
    }

    /**
     * @event *:create-promise creates promise
     */
sb.on('*:create-promise', function () {
    var dfd = deferredFunction(),
        callback = function (argument) {
            if (typeof argument === "undefined") {
                dfd.reject();
            } else {
                dfd.resolve(argument);
            }
        };

    return [callback, typeof dfd.promise === "function" ? dfd.promise() : dfd.promise];
});

}(sandbox));



    main(lmd_trigger('lmd-register:decorate-require', 'main', lmd_require)[1], output.exports, output);
})/*DO NOT ADD ; !*/
(this,(function (require, exports, module) { /* wrapped by builder */
/**
 * LMD require.stats() example
 */

function loadMd5() {
    // md5    -> /js/md5.js    | CommonJS Module (plain)
    return require.async('md5');
}

function loadSha512() {
    // sha512 -> /js/sha512.js | LMD module
    return require.async('sha512');
}

function decorateInputs() {
    return require.css('css/b-input.css');
}

$(function () {
    var $button = $('.b-button'),
        $result = $('.b-result'),
        $input = $('.b-input');

    function calculateSha512OfMd5() {
        var value = $input.val();
        loadSha512().then(function (sha512) {
            value = sha512(value);
            return loadMd5();
        })
        .then(function (md5) {
            value = md5(value);
            return decorateInputs();
        })
        .then(function () {
            $result.val(value);
        }, function () {
            console.log('Failed to load CSS!');
        });
    }

    $button.click(calculateSha512OfMd5);

    require('statsLogger');
});

}),{
"unused": (function (require, exports, module) { /* wrapped by builder */

$(function () {
    console.log(123);
});

}),
"sha512": "@js/sha512.js",
"md5": "@js/md5.js",
"statsLogger": (function (require, exports, module) { /* wrapped by builder */
var $log = $('.b-log');

$('.b-stats-button').click(function () {
    var modulesStats = require.stats();

    console.log(modulesStats);
    $log.empty();
    $(
        '<tr>' +
            '<th>name</th>' +
            '<th>type</th>' +
            '<th>initialization time</th>' +
            '<th>module required at</th>' +
            '<th>module required by</th>' +
        '</tr>'
    ).appendTo($log);

    for (var moduleName in modulesStats) {
        var module = modulesStats[moduleName];
        $(
            '<tr>' +
                '<td><strong>' + moduleName + '</strong>' + (moduleName !== module.name ? ' -> ' + module.name : '') + '</td>' +
                '<td>' + module.type + '</td>' +
                '<td>' + module.initTime + 'ms</td>' +
                '<td>' + module.accessTimes.join('ms, ') + 'ms</td>' +
                '<td>' + Object.keys(module.moduleAccessTimes) + '</td>' +
            '</tr>'
        ).appendTo($log);
    }
});
})
},{},{"promise":"$.Deferred"});
