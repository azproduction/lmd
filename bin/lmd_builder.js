/**
 * LMD Builder
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */

var LMD_JS_SRC_PATH = __dirname + '/../src/';

var JSHINT_CONFIG = {
    debug:      true,
    eqnull:     true,
    boss:       true,
    loopfunc:   true,
    evil:       true,
    laxbreak:   true,
    undef:      true,
    nonew:      true,
    maxerr:     Infinity
};

var JSHINT_GLOBALS = {
    Array               : 0,
    Boolean             : 0,
    Date                : 0,
    decodeURI           : 0,
    decodeURIComponent  : 0,
    encodeURI           : 0,
    encodeURIComponent  : 0,
    Error               : 0,
    'eval'              : 0,
    EvalError           : 0,
    Function            : 0,
    hasOwnProperty      : 0,
    isFinite            : 0,
    isNaN               : 0,
    JSON                : 0,
    Math                : 0,
    Number              : 0,
    Object              : 0,
    parseInt            : 0,
    parseFloat          : 0,
    RangeError          : 0,
    ReferenceError      : 0,
    RegExp              : 0,
    String              : 0,
    SyntaxError         : 0,
    TypeError           : 0,
    URIError            : 0
};

var fs = require('fs'),
    parser = require("uglify-js").parser,
    uglify = require("uglify-js").uglify,
    JsHint = require('jshint').JSHINT,
    lmdCoverage = require(__dirname + '/../lib/coverage_apply.js'),
    common = require(__dirname + '/../lib/lmd_common.js'),
    assembleLmdConfig = common.assembleLmdConfig;

var CROSS_PLATFORM_PATH_SPLITTER = common.PATH_SPLITTER;

/**
 * LmdBuilder
 * 
 * @constructor
 *
 * @param {Object|String} data               lmd options or argv string
 *
 * If data is {Object}:
 * @param {Object}        data.config               path to config file
 * @param {Object}        [data.mode='main']        watch or main
 * @param {Object}        [data.output]             result file or STDOUT
 * @param {Object}        [data.version='lmd_tiny'] lmd version
 * @param {Boolean}       [data.log=false]          log?
 *
 * If data is {String}:
 * @format
 *
 * data old format
 *      node lmd_builder.js [mode] path/to/config.lmd.json [result.js]
 *
 * data new format
 *      node lmd_builder.js [-m main] -c path/to/config.lmd.json [-r result.js] [-v lmd_tiny] [-l]
 *
 *      -c -config
 *      -m -mode       default main
 *      -o -output     default print to stdout
 *      -l -log        default false
 *      -v -version    default lmd_tiny
 *      -no-w -no-warn disable warnings
 *
 * @example
 *      // pass and object
 *      new LmdBuilder({
 *          config: "config.json",
 *          output: "result.js", // optional
 *          version: "lmd_tiny" // optional - default=lmd_tiny
 *      });
 *
 *      // pass string
 *      new LmdBuilder(process.argv.join(' '));
 *
 *      // old argv format
 *      new LmdBuilder("node lmd_builder.js watch path/to/config.lmd.json result.js");
 *
 *      // new argv format
 *      new LmdBuilder("node lmd_builder.js -m main -c path/to/config.lmd.json -r result.js -v lmd_tiny -l");
 */
var LmdBuilder = function (data) {
    var args = this.parseData(data);

    // apply config
    this.mode = args.mode || 'main';
    this.configFile = args.config;
    this.outputFile = args.output;
    this.isLog = args.log || false;
    this.isWarn = this.isLog && !args['no-warn'];

    if (LmdBuilder.availableModes.indexOf(this.mode) === -1) {
        throw new Error('No such LMD run mode - ' + this.mode);
    }

    this.configDir = fs.realpathSync(this.configFile);
    this.configDir = this.configDir.split(CROSS_PLATFORM_PATH_SPLITTER);
    this.flagToOptionNameMap = JSON.parse(fs.readFileSync(LMD_JS_SRC_PATH + 'lmd_flags.json'));
    this.configDir.pop();
    this.configDir = this.configDir.join('/');
    if (this.configure()) {
        this.runMode(this.mode);
    }
};

/**
 * LMD template
 * 
 * @param {Object} data
 */
LmdBuilder.prototype.template = function (data) {
    return data.lmd_js + '(' + data.global + ',' + data.lmd_main + ',' + data.lmd_modules + ',' + data.sandboxed_modules +
        // if version passed
        (data.version ? ',' + data.version : '') +
        (data.coverage_options ? ',' + data.coverage_options : '') +
    ')';
};

/**
 *
 *
 * @type {String[]}
 */
LmdBuilder.availableModes = ['main', 'watch'];

/**
 * Run LMD builder in specific mode
 *
 * @param {String} mode
 */
LmdBuilder.prototype.runMode = function (mode) {
    switch (mode) {
        case 'watch':
            this.fsWatch();
            break;

        case 'main':
            this.build();
            break;
    }
};

/**
 * Simple argv parser
 *
 * @see https://gist.github.com/1497865
 *
 * @param {String} a an argv string
 *
 * @returns {Object}
 */
LmdBuilder.prototype.parseArgv = function (a,b,c,d) {
    c={};for(a=a.split(/\s*\B[-]+([\w-]+)[\s=]*/),d=1;b=a[d++];c[b]=a[d++]||!0);return c
};

/**
 * Formats lmd config
 *
 * @param  {String|Object} data
 *
 * @return {Object}
 */
LmdBuilder.prototype.parseData = function (data) {
    var config;

    // case data is argv string
    if (typeof data === "string") {
        // try to parse new version
        config = this.parseArgv(data);

        // its new config argv string
        if (Object.keys(config).length) {
            // translate short params to long one
            config.version = config.version || config.v;
            config.mode = config.mode || config.m;
            config.output = config.output || config.o;
            config.log = config.log || config.l;
            config.config = config.config || config.c;
            config['no-warn'] = config['no-warn'] || config['no-w'];
        } else {
            // an old argv format, split argv and parse manually
            data = data.split(' ');

            // without mode
            if (LmdBuilder.availableModes.indexOf(data[2]) === -1) {
                config = {
                    mode: 'main',
                    config: data[2],
                    output: data[3]
                };
            } else { // with mode
                config = {
                    mode: data[2],
                    config: data[3],
                    output: data[4]
                };
            }
        }

    // case data is config object
    } else if (typeof config === "object") {
        // use as is
        config = data;

    // case else
    } else {
        // wut?
        throw new Error('Bad config data');
    }

    return config;
};

/**
 * Compress code using UglifyJS
 * 
 * @param {String} code
 *
 * @returns {String} compressed code
 */
LmdBuilder.prototype.compress = function (code) {
    var ast = parser.parse(code);
    ast = uglify.ast_mangle(ast);
    ast = uglify.ast_squeeze(ast);

    return uglify.gen_code(ast);
};

/**
 * Checks if code is plain module
 *
 * @param code
 * @return {Boolean}
 */
LmdBuilder.prototype.isPlainModule = function (code) {
    try {
        var ast = parser.parse(code);
    } catch (e) {
        throw new Error('parse error on ' + code);
    }

    // ["toplevel",[["defun","depA",["require"],[]]]]
    if (ast && ast.length === 2 &&
        ast[1] && ast[1].length === 1 &&
        ast[1][0][0] === "defun"
        ) {
        return false;
    }

    // ["toplevel",[["stat",["function",null,["require"],[]]]]]
    if (ast && ast.length === 2 &&
        ast[1] && ast[1].length === 1 &&
        ast[1][0][0] === "stat" &&
        ast[1][0][1] &&
        ast[1][0][1][0] === "function"
        ) {
        return false;
    }

    return true;
};

/**
 * Wrapper for plain files
 *
 * @param {String} code
 *
 * @returns {String} wrapped code
 */
LmdBuilder.prototype.wrapPlainModule = function (code) {
    return '(function (require, exports, module) { /* wrapped by builder */\n' + code + '\n})';
};

/**
 * Wrapper for non-lmd modules files
 *
 * @param {String}               code
 * @param {Object|String}        extra_exports
 * @param {Object|String|String} extra_exports
 *
 * @returns {String} wrapped code
 */
LmdBuilder.prototype.wrapNonLmdModule = function (code, extra_exports, extra_require) {
    var exports = [],
        requires = [],
        exportCode;

    // add exports
    // extra_exports = {name: code, name: code}
    if (typeof extra_exports === "object") {
        for (var exportName in extra_exports) {
            exportCode = extra_exports[exportName];
            exports.push('    ' + JSON.stringify(exportName) + ': ' + exportCode);
        }
        code += '\n\n/* added by builder */\nreturn {\n' + exports.join(',\n') + '\n};';
    } else if (extra_exports) {
        // extra_exports = string
        code += '\n\n/* added by builder */\nreturn ' + extra_exports + ';';
    }

    // add require
    if (typeof extra_require === "object") {
        // extra_require = [name, name, name]
        if (extra_require instanceof Array) {
            for (var i = 0, c = extra_require.length, moduleName; i < c; i++) {
                moduleName = extra_require[i];
                requires.push('require(' + JSON.stringify(moduleName) + ');');
            }
            code = '/* added by builder */\n' + requires.join('\n') + '\n\n' + code;
        } else {
            // extra_require = {name: name, name: name}
            for (var localName in extra_require) {
                moduleName = extra_require[localName];
                requires.push(localName + ' = require(' + JSON.stringify(moduleName) + ')');
            }
            code = '/* added by builder */\nvar ' + requires.join(',\n    ') + ';\n\n' + code;
        }
    } else if (extra_require) {
        // extra_require = string
        code = '/* added by builder */\nrequire(' + JSON.stringify(extra_require) + ');\n\n' + code;
    }

    return '(function (require) { /* wrapped by builder */\n' + code + '\n})';
};

/**
 * JSON escaper
 *
 * @param file
 */
LmdBuilder.prototype.escape = function (file) {
    return JSON.stringify(file);
};

/**
 * Module code renderer
 * 
 * @param {String[]} lmd_modules
 * @param {String}   lmd_main
 * @param {Boolean}  pack
 * @param {String[]} sandboxed_modules
 * @param {Object}   [coverage_options]
 *
 * @returns {String}
 */
LmdBuilder.prototype.render = function (config, lmd_modules, lmd_main, pack, sandboxed_modules, coverage_options) {
    sandboxed_modules = JSON.stringify(sandboxed_modules || {});
    var lmd_js = fs.readFileSync(LMD_JS_SRC_PATH + 'lmd.js', 'utf8'),
        result;

    // Apply patch if LMD package in cache Mode
    lmd_js = this.patchLmdSource(lmd_js, config);
    lmd_modules = '{\n' + lmd_modules.join(',\n') + '\n}';

    result = this.template({
        lmd_js: lmd_js,
        global: config.global || 'this',
        lmd_main: lmd_main,
        lmd_modules: lmd_modules,
        sandboxed_modules: sandboxed_modules,
        coverage_options: coverage_options ? JSON.stringify(coverage_options) : false,
        // if version passed -> module will be cached
        version: config.cache ? JSON.stringify(config.version) : false
    });

    if (pack) {
        result = this.compress(result);
    }

    return result;
};

/**
 * Patches lmd source
 *
 * @param {String}  lmd_js
 * @param {Object} config
 *
 * @returns {String}
 */
LmdBuilder.prototype.patchLmdSource = function (lmd_js, config) {
    var optionNames,
        flagName;

    /**
     * Applies or removes block from lmd_js
     *
     * @param {String} optionName block name eg $P.CACHE
     * @param isApply  apply or remove block
     * @param isInline block is inline (based on block comment)
     *
     * @returns {Boolean} true if block was found, false - not found
     */
    var preProcessBlock = function (optionName, isApply, isInline) {
        // /*if ($P.CSS || $P.JS || $P.ASYNC) {*/
        var inlinePreprocessorBlock = isInline ? '/*if (' + optionName + ') {*/' : 'if (' + optionName + ') {',
            bracesCounter = 0,

            startIndex = lmd_js.indexOf(inlinePreprocessorBlock),
            startLength = inlinePreprocessorBlock.length,

            endIndex = startIndex + inlinePreprocessorBlock.length,
            endLength = isInline ? 5 : 1;

        if (startIndex === -1) {
            return false;
        }

        // lookup for own }
        while (lmd_js.length > endIndex) {
            if (lmd_js[endIndex] === '{') {
                bracesCounter++;
            }
            if (lmd_js[endIndex] === '}') {
                bracesCounter--;
            }
            
            // found!
            if (bracesCounter === -1) {
                if (isInline) {
                    // step back
                    endIndex -= 2;
                } else {
                    // remove leading spaces from open part
                    while (startIndex) {
                        startIndex--;
                        startLength++;
                        if (lmd_js[startIndex] !== '\t' && lmd_js[startIndex] !== ' ') {
                            startIndex++;
                            startLength--;
                            break;
                        }
                    }

                    // remove leading spaces from close part
                    while (endIndex) {
                        endIndex--;
                        endLength++;
                        if (lmd_js[endIndex] !== '\t' && lmd_js[endIndex] !== ' ') {
                            endIndex++;
                            endLength--;
                            break;
                        }
                    }
                    // add front \n
                    endLength++;
                    startLength++;
                }

                if (isApply) {
                    // wipe preprocessor blocks only
                    // open
                    lmd_js = lmd_js.substr(0, startIndex) + lmd_js.substr(startIndex + startLength);

                    // close
                    lmd_js = lmd_js.substr(0, endIndex - startLength) + lmd_js.substr(endIndex + endLength - startLength);

                    if (!isInline) {
                        // indent block back
                        var blockForIndent = lmd_js.substr(startIndex, endIndex - startLength - startIndex);

                        blockForIndent = blockForIndent
                            .split('\n')
                            .map(function (line) {
                                return line.replace(/^\s{4}/, '');
                            })
                            .join('\n');

                        lmd_js = lmd_js.substr(0, startIndex) + blockForIndent + lmd_js.substr(endIndex - startLength);
                    }
                } else {
                    // wipe all
                    lmd_js = lmd_js.substr(0, startIndex) + lmd_js.substr(endIndex + endLength);
                }
                break;
            }
            endIndex++;
        }

        return true;
    };

    // Add plugins
    for (flagName in this.flagToOptionNameMap) {
        optionNames = this.flagToOptionNameMap[flagName];

        optionNames.forEach(function (optionName) {
            /*if ($P.STATS) include('stats.js');*/
            var includePattern = new RegExp('\\/\\*\\if \\(' + optionName.replace(/\$/g, '\\$') + '\\)\\s+include\\(\'([a-z-\\/_\\.]+)\'\\);?\\s*\\*\\/', ''),
                patchContent = '',
                match;

            // Add plugin
            while (true) {
                if (config[flagName]) {
                    // apply: remove left & right side

                    match = lmd_js.match(includePattern);
                    if (match && match[1]) {
                        patchContent = fs.readFileSync(LMD_JS_SRC_PATH + 'plugin/' + match[1]);
                    } else {
                        break;
                    }
                } else {
                    break;
                }
                lmd_js = lmd_js.replace(includePattern, patchContent);
            }
        });
    }

    // Apply IF statements
    for (flagName in this.flagToOptionNameMap) {
        optionNames = this.flagToOptionNameMap[flagName];

        // first are inline
        optionNames.forEach(function (optionName) {
            // apply all blocks
            if (config[flagName]) {
                // 1. inline
                while (preProcessBlock(optionName, true, true));
                // 2. blocks
                while (preProcessBlock(optionName, true, false));
            }
        });
    }

    // Wipe IF statements
    for (flagName in this.flagToOptionNameMap) {
        optionNames = this.flagToOptionNameMap[flagName];

        // first are inline
        optionNames.forEach(function (optionName) {
            // wipe all blocks
            if (!config[flagName]) {
                // 1. inline
                while (preProcessBlock(optionName, false, true));
                // 2. blocks
                while (preProcessBlock(optionName, false, false));
            }
        });
    }

    return lmd_js;
};

/**
 * Performs configuration
 */
LmdBuilder.prototype.configure = function () {
    if (!this.configFile) {
        console.log('lmd usage:\n\t    lmd config.lmd.json [output.lmd.js]');
        return false;
    }
    return true;
};

/**
 * Collecting sandboxed modules using merged config
 *
 * @param modulesStruct
 *
 * @returns {Object}
 */
LmdBuilder.prototype.getSandboxedModules = function (modulesStruct, config) {
    // TODO(azproduction) Backward capability
    var result = config.sandbox || {};
    for (var moduleName in modulesStruct) {
        if (modulesStruct[moduleName].is_sandbox) {
            result[moduleName] = true;
        }
    }

    return result;
};

/**
 * Watch the module files, rebuilding when a change is detected
 */
LmdBuilder.prototype.fsWatch = function () {
    var self = this,
        watchedModulesCount = 0,
        config = assembleLmdConfig(this.configFile, Object.keys(this.flagToOptionNameMap));

    for (var i = 0, c = config.errors.length; i < c; i++) {
        this.warn(config.errors[i]);
    }

    var module,
        modules,
        watchBuilder = function (stat, filename) {
            if (self.isLog) {
                filename = filename.split(CROSS_PLATFORM_PATH_SPLITTER).pop();
                if (stat && filename) {
                    process.stdout.write('\033[40mlmd\033[0m\tChange detected in \033[34m' + filename + '\033[0m at ' + stat.mtime);
                } else if (stat) {
                    process.stdout.write('\033[40mlmd\033[0m\tChange detected at ' + stat.mtime);
                } else {
                    process.stdout.write('\033[40mlmd\033[0m\tChange detected');
                }
                process.stdout.write(' \033[32mRebuilding...\033[0m');
                self.build(function () {
                    process.stdout.write(' \033[32m\033[1mDone!\033[0m\033[0m\n');
                });
            } else {
                self.build();
            }
        },
        watch = function (event, filename) {
            if (event === 'change') {
                if (filename) {
                    watchBuilder(fs.stat(filename), filename);
                } else {
                    watchBuilder();
                }
            }
        },
        watchFile = function (curr, prev, filename) {
            if (curr.mtime > prev.mtime) {
                watchBuilder(curr, filename);
            }
        };

    if (config.modules) {
        modules = config.modules;
        for (var index in modules) {
            module = modules[index];
            try {
                // a mess....
                fs.watchFile(module.path, { interval: 1000 }, function (curr, prev) {
                    watchFile(curr, prev, this);
                }.bind(module.path));
            } catch (e) {
                fs.watch(module.path, watch);
            }
            watchedModulesCount++;
        }

        if (this.isLog) {
            console.log('\033[40mlmd\033[0m\tNow watching \033[37m%d\033[0m module files. Ctrl+C to stop', watchedModulesCount);
        }
    }
};

/**
 * Formats log message
 *
 * @param text
 * @return {*}
 */
LmdBuilder.prototype.formatLog = function (text) {
    return text.replace(/\*\*/g, function bold() {
        bold.odd_even = !bold.odd_even;
        return bold.odd_even ? '\033[32m' : '\033[0m';
    });
};

/**
 * Formats and prints an error
 *
 * @param {String} text simple markdown syntax
 *
 * @example
 *     Pewpew **ololo** - ololo will be green
 */
LmdBuilder.prototype.error = function (text) {
    text = this.formatLog(text);
    console.error('\033[40mlmd\033[0m \033[31m\033[40mERROR:\033[0m ' + text);
};

/**
 * Formats and prints an warning
 *
 * @param {String} text simple markdown syntax
 *
 * @example
 *     Pewpew **ololo** - ololo will be green
 */
LmdBuilder.prototype.warn = function (text) {
    if (this.isWarn) {
        text = this.formatLog(text);
        console.log('\033[40mlmd\033[0m \033[31mWarning:\033[0m ' + text);
    }
};

/**
 * Using JsHint, it checks for direct global vars access
 *
 * @param {String} moduleName
 * @param {String} moduleCode
 */
LmdBuilder.prototype.checkForDirectGlobalsAccess = function (moduleName, moduleCode) {
    new JsHint(moduleCode, JSHINT_CONFIG, JSHINT_GLOBALS);
    var globalsObjects = [];
    for (var i = 0, c = JsHint.errors.length, error; i < c; i++) {
        error = JsHint.errors[i];
        if (error.raw === '\'{a}\' is not defined.') {
            if (globalsObjects.indexOf(error.a) === -1) {
                globalsObjects.push(error.a);
            }
        }
    }

    return globalsObjects;
};

/**
 * Main builder
 *
 * @param [callback] {Function}
 */
LmdBuilder.prototype.build = function (callback) {
    var config = assembleLmdConfig(this.configFile, Object.keys(this.flagToOptionNameMap));

    for (var i = 0, c = config.errors.length; i < c; i++) {
        this.warn(config.errors[i]);
    }

    var lazy = config.lazy || false,
        mainModuleName = config.main,
        pack = lazy ? true : typeof config.pack === "undefined" ? true : config.pack,
        moduleContent,
        lmdModules = [],
        sandbox,
        lmdMain,
        lmdFile,
        isJson,
        isModule,
        isPlainModule,
        coverageResult,
        globalsObjects,
        coverageOptions = {},
        is_using_shortcuts = false,
        module,
        modules;

    if (typeof config.ie === "undefined") {
        config.ie = true;
    }

    if (!config.cache && config.cache_async) {
        this.warn('This package was configured with flag **cache_async: true**, but without flag **cache**; ' +
            'cache_async cant work independently. Flag cache_async is disabled! Please switch on **cache**.');
        config.cache_async = false;
    }

    if (config.cache && typeof config.version === "undefined") {
        this.warn('This package was configured with flag **cache: true**, but without flag **version** parameter. ' +
            'Please define **version** to enable cache.');
    }

    if (config.modules) {
        modules = config.modules;
        // build modules string
        for (var index in modules) {
            module = modules[index];
            if (module.is_shortcut) {
                is_using_shortcuts = true;
                if (module.name === mainModuleName) {
                    this.warn('Main module can not be a shortcut. Your app will throw an error.')
                } else {
                    lmdModules.push(this.escape(module.name) + ': ' + this.escape(module.path));
                }
                continue;
            }
            moduleContent = fs.readFileSync(module.path, 'utf8');

            try {
                JSON.parse(moduleContent);
                isJson = true;
            } catch (e) {
                isJson = false;
            }

            if (!isJson) {
                isPlainModule = false;
                try {
                    isPlainModule = this.isPlainModule(moduleContent);
                    isModule = true
                } catch(e) {
                    isModule = false;
                }

                // #12 Warn if parse error in .js file
                if (!isModule && /.js$/.test(module.path)) {
                    this.warn('File "**' + module.path + '**" has extension **.js** and LMD detect an parse error. ' +
                              'This module will be string. Please check the source.');
                }

                if (isModule) {
                    if (module.is_third_party) {
                        // create lmd module from non-lmd module
                        moduleContent = this.wrapNonLmdModule(moduleContent, module.extra_exports, module.extra_require);
                        if (module.extra_require && module.is_sandbox) {
                            this.error('Your module "**' + module.path + '**" have to require() some deps, but it sandboxed. ' +
                                      'Remove sandbox flag to allow module require().');
                        }
                    } else if (isPlainModule) {
                        // wrap plain module
                        moduleContent = this.wrapPlainModule(moduleContent);
                    }
                }

                // #26 Code coverage
                if (isModule && module.is_coverage) {
                    coverageResult = lmdCoverage.interpret(module.name, module.path, moduleContent, isPlainModule ? 0 : 1);
                    coverageOptions[module.name] = coverageResult.options;
                    moduleContent = coverageResult.code;

                    // Check for different require name (first argument)
                    globalsObjects = this.checkForDirectGlobalsAccess(module.path, moduleContent);
                    if (globalsObjects.indexOf('require') !== -1) {
                        this.error("In module **" + module.path + "** you are using different 'require' name. " +
                                   "You must declare first argument of your module-function as 'require' to use coverage!");
                    }
                }

                // #14 Check direct access of globals in lazy modules
                if (this.isWarn && isModule && module.is_lazy) {
                    globalsObjects = this.checkForDirectGlobalsAccess(module.path, moduleContent);

                    if (globalsObjects.length) {
                         this.warn("Lazy module **" + module.path + "** uses some globals directly (" + globalsObjects.join(', ') +  "). " +
                                   "Replace them with require('" + globalsObjects[0] + "') etc");
                    }
                }

                if (isModule && (module.is_lazy || pack)) {
                    moduleContent = this.compress(moduleContent);
                }
            }

            if (module.name === mainModuleName) {
                lmdMain = moduleContent;
            } else {
                if (isModule && !isJson && module.is_lazy) {
                    moduleContent = moduleContent.replace(/^function[^\(]*/, 'function');
                    if (moduleContent.indexOf('(function(') !== 0) {
                        moduleContent = '(' + moduleContent + ')';
                    }
                    moduleContent = this.escape(moduleContent);
                } else if (!isModule) {
                    moduleContent = this.escape(moduleContent);
                }

                lmdModules.push(this.escape(module.name) + ': ' + moduleContent);
            }
        }

        if (is_using_shortcuts && !config.shortcuts) {
            this.warn('Some of your modules are shortcuts, but config flag **shortcuts** is undefined or falsy. ' +
                      'Enable that flag for proper work.');
        }

        if (!is_using_shortcuts && config.shortcuts) {
            this.warn('Config flag **shortcuts** is enabled, but there is no shortcuts in your package. ' +
                      'Disable that flag to optimize your package.');
        }

        if (config.stats_coverage && (config.cache || config.cache_async)) {
            this.warn('LMD will cache your modules under code coverage.');
        }

        if (config.async_plain && config.async_plainonly) {
            this.warn('You are using both config flags `async_plain` and `async_plainonly`. Disable one to optimise your source.');
        }

        if (!config.stats_coverage && config.stats_coverage_async) {
            this.warn('You are using `stats_coverage_async` without `stats_coverage`. Enable `stats_coverage` flag.');
        }

        if (!config.async && config.stats_coverage_async) {
            this.warn('You are using `stats_coverage_async` but not using `async`. Disable `stats_coverage_async` flag.');
        }

        sandbox = this.getSandboxedModules(modules, config);
        lmdFile = this.render(config, lmdModules, lmdMain, pack, sandbox, config.stats_coverage ? coverageOptions : void 0);

        if (this.outputFile) {
            fs.writeFileSync(this.outputFile, lmdFile,'utf8')
        } else {
            process.stdout.write(lmdFile);
        }
    }

    // callback must be called anyway
    if (typeof callback === 'function') {
        callback();
    }
};

module.exports = LmdBuilder;