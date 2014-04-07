/**
 * LMD Builder
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */

var fs = require('fs'),
    inherits = require('util').inherits,
    path = require('path'),
    uglifyCompress = require("uglify-js"),
    csso = require('csso'),
    SourceMapGenerator = require('source-map').SourceMapGenerator,
    colors = require('colors'),
    parser = uglifyCompress.parser,
    uglify = uglifyCompress.uglify,
    DataStream = require(__dirname + '/../lib/data_stream.js'),
    lmdCoverage = require(__dirname + '/../lib/coverage_apply.js'),
    common = require(__dirname + '/../lib/lmd_common.js'),
    Writer = require(__dirname + '/../lib/lmd_writer.js'),
    Cli = require(__dirname + '/cli_messages.js'),
    assembleLmdConfig = common.assembleLmdConfig;

var LMD_JS_SRC_PATH = common.LMD_JS_SRC_PATH;
var LMD_PLUGINS = common.LMD_PLUGINS;

/**
 * LmdBuilder LMD Package Builder
 *
 * LmdBuilder is readable stream
 * 
 * @constructor
 *
 * @inherits Stream
 *
 * @param {String} configFile
 * @param {Object} [options]
 *
 * @example
 *
 *      new LmdBuilder("config.json", {
 *          warn: true
 *      })
 *      .pipe(process.stdout);
 */
var LmdBuilder = function (configFile, options) {
    DataStream.call(this);
    this.options = options || {};
    var self = this;

    // apply config
    this.configFile = configFile;

    this.init();

    // Bundles streams
    this.bundles = {};

    // Let return instance before build
    this.buildConfig = this.compileConfig(configFile, self.options);

    this.makeEmptyStreamsUnreadable(this.buildConfig);

    var isFatalErrors = !this.isAllModulesExists(this.buildConfig);
    if (isFatalErrors) {
        this.readable = false;
        this.style.readable = false;
        this.sourceMap.readable = false;
    } else {
        this._initBundlesStreams(this.buildConfig.bundles);
    }
    process.nextTick(function () {
        if (!isFatalErrors) {
            if (configFile) {
                var buildResult = self.build(self.buildConfig);

                self.write(buildResult.source);
                self.style.write(buildResult.style);
                self.sourceMap.write(buildResult.sourceMap.toString());
                self._streamBundles(buildResult.bundles);
            } else {
                self.log.write('lmd usage:\n\t    ' + 'lmd'.blue + ' ' + 'config.lmd.js(on)'.green + ' [output.lmd.js]\n');
            }
        } else {
            self.printFatalErrors(self.buildConfig);
        }
        self.closeStreams();
    });
};

/**
 * LMD Package Watcher
 *
 * @constructor
 *
 * @inherits Stream
 *
 * @param {String} configFile
 * @param {Object} [options]
 *
 * @example
 *
 *      new LmdBuilder.watch("config.json", {
 *          warn: true
 *      })
 *      .log.pipe(process.stdout);
 */
LmdBuilder.watch = function (configFile, options) {
    DataStream.call(this);
    this.options = options || {};
    var self = this;

    this.configFile = configFile;

    this.init();
    this.sourceMap.readable = false;
    this.readable = false;

    // Let return instance before build
    this.watchConfig = this.compileConfig(self.configFile, self.options);

    this.makeEmptyStreamsUnreadable(this.watchConfig);

    var isFatalErrors = !this.isAllModulesExists(this.watchConfig);
    if (isFatalErrors) {
        this.readable = false;
    }
    process.nextTick(function () {
        if (!isFatalErrors) {
            if (!configFile) {
                return;
            }

            if (typeof self.watchConfig.output === 'string') {
                self.fsWatch(self.watchConfig);
                return;
            } else {
                self.log.write('ERRO'.red.inverse + ':' + '    Check your config file. "output" parameter should be a {String} eg "../path"'.red + '\n');
                return;
            }
        } else {
            self.printFatalErrors(self.watchConfig);
        }
        self.closeStreams();
    });
};

inherits(LmdBuilder, DataStream);
// Share prototype
LmdBuilder.watch.prototype = LmdBuilder.prototype;

/**
 * Applies defaults
 *
 * @param {Object} options
 *
 * @return {Object}
 */
LmdBuilder.prototype.defaults = function (options) {
    options = options || {};

    if (typeof options.warn === "undefined") {
        options.warn = true;
    }

    if (typeof options.log === "undefined") {
        options.log = true;
    }

    if (typeof options.output === 'undefined') {
        options.output = false;
    }

    if (typeof options.styles_output === 'undefined' && typeof options.output === 'string') {
        options.styles_output = path.join(
            path.dirname(options.output),
            path.basename(options.output, path.extname(options.output)) + '.css'
        );
    }

    if (typeof options.bundles_callback === 'undefined') {
        options.bundles_callback = '_' + Math.round(Math.random() * 0xFFFFFFFF).toString(16);
    }

    Object.keys(options.bundles || {}).forEach(function (name) {
        options.bundles[name].bundles_callback = options.bundles_callback;
    });

    return options;
};

/**
 * Common init for LmdBuilder and LmdBuilder.watch
 */
LmdBuilder.prototype.init = function () {
    this._closeStreams = this.closeStreams.bind(this);

    this.configDir = path.dirname(this.configFile);
    this.flagToOptionNameMap = LMD_PLUGINS;

    /**
     * Build log
     *
     * @type {Stream}
     */
    this.log = new DataStream();

    /**
     * Source Map
     *
     * @type {Stream}
     */
    this.sourceMap = new DataStream();

    /**
     * Style
     *
     * @type {Stream}
     */
    this.style = new DataStream();

    process.once('exit', this._closeStreams);
};

/**
 * Makes empty streams unreadable
 * @param config
 */
LmdBuilder.prototype.makeEmptyStreamsUnreadable = function (config) {
    // modules
    this.readable = this._has(config, 'modules');

    // source map
    this.sourceMap.readable = this._has(config, 'modules');

    // styles
    this.style.readable = this._has(config, 'styles');
};

/**
 *
 * @param configFile
 * @param options
 */
LmdBuilder.prototype.compileConfig = function (configFile, options) {
    return this.defaults(assembleLmdConfig(configFile, Object.keys(this.flagToOptionNameMap), options));
};

/**
 *
 * @param buildConfig
 * @return {Boolean}
 */
LmdBuilder.prototype.isAllModulesExists = function (buildConfig) {
    var self = this;
    var modules = buildConfig.modules || {},
        bundles = buildConfig.bundles || {},
        styles = buildConfig.styles || [],
        bundle;

    for (var moduleName in modules) {
        if (!modules[moduleName].is_exists) {
            return false;
        }
    }

    for (var i = 0, c = styles.length; i < c; i++) {
        if (!styles[i].is_exists) {
            return false;
        }
    }

    // Check bundles and sub-bundles
    for (var bundleName in bundles) {
        bundle = bundles[bundleName];
        if (bundle instanceof Error) {
            return false;
        }

        var isModulesExists = Object.keys(bundles).every(function (bundleName) {
            return self.isAllModulesExists(bundles[bundleName]);
        });

        if (!isModulesExists) {
            return false;
        }
    }

    return true;
};

/**
 *
 * @param buildConfig
 */
LmdBuilder.prototype.printFatalErrors = function (buildConfig) {
    var modules = buildConfig.modules || {},
        bundles = buildConfig.bundles || {},
        styles = buildConfig.styles || {},
        bundle,
        projectRoot = buildConfig.path || buildConfig.root,
        errorMessage;

    for (var moduleName in modules) {
        if (!modules[moduleName].is_exists) {
            errorMessage = 'Module "' + moduleName.cyan + '": "' +
                modules[moduleName].originalPath.toString().red;
            errorMessage += '" (';
            // check multi path modules
            errorMessage += [].concat(modules[moduleName].path).map(function (path) {
                return String(path)[fs.existsSync(path) ? 'green' : 'red'];
            }).join(', ');
            errorMessage += ') is not exists. Project root: "' + String(projectRoot).green + '". ';

            this.error(errorMessage);
        }
    }

    for (var i = 0, c = styles.length; i < c; i++) {
        if (!styles[i].is_exists) {
            errorMessage = 'Style (' +
                styles[i].path.toString().red + ') is not exists. ' +
                'Project root: "' + String(projectRoot).green + '". ';

            this.error(errorMessage);
        }
    }

    // Check bundles and sub-bundles
    for (var bundleName in bundles) {
        bundle = bundles[bundleName];
        if (bundle instanceof Error) {
            errorMessage = 'Bundle "' + bundleName.cyan + '": (' +
                bundle.message.red + ') is not exists. ' +
                'Project root: "' + String(projectRoot).green + '". ';

            this.error(errorMessage);
        } else {
            // check modules of bundle
            this.printFatalErrors(bundle);
        }
    }
};

/**
 * Closes all streams and make it unreadable
 */
LmdBuilder.prototype.closeStreams = function () {
    this.end();
    this.log.end();
    this.style.end();
    this.sourceMap.end();

    this._closeBundleStreams();
    process.removeListener('exit', this._closeStreams);
};

/**
 * LMD template
 * 
 * @param {Object} data
 */
LmdBuilder.prototype.templatePackage = function (data) {
    return (data.build_info ? data.build_info + '\n' : '') +
    data.lmd_js +
    '\n(' +
        data.global + ',' +
        data.lmd_main + ',' +
        data.lmd_modules + ',' +
        data.modules_options + ',' +
        data.options +
    ');\n';
};

/**
 * LMD template
 *
 * @param {Object} data
 * @param {Object} data.bundles_callback
 * @param {Object} data.build_info
 * @param {Object} data.lmd_main
 * @param {Object} data.lmd_modules
 * @param {Object} data.modules_options
 */
LmdBuilder.prototype.templateBundle = function (data) {
    return (data.build_info ? data.build_info + '\n' : '') +
    data.bundles_callback + '(' +
        (data.lmd_main ? data.lmd_main + ',' : '') +
        data.lmd_modules + ',' +
        data.modules_options +
    ');\n';
};

/**
 * Compress code using UglifyJS
 * 
 * @param {String}  code
 * @param {Object}  pack_options
 * @param {Boolean} pack_options.strict_semicolons
 * @param {Object}  pack_options.mangle_options
 * @param {Object}  pack_options.squeeze_options
 * @param {Object}  pack_options.gen_options
 *
 * @returns {String} compressed code
 */
LmdBuilder.prototype.compress = function (code, pack_options) {
    pack_options = typeof pack_options === "object" ? pack_options : {};
    return uglifyCompress(code, pack_options);
};

/**
 * Optimizes lmd code
 *
 * @param {String} lmd_js_code
 *
 * @returns {String}
 */
LmdBuilder.prototype.optimizeLmdSource = function (lmd_js_code) {
    var walker = uglify.ast_walker();

    /**
     * Uses variable sandbox for create replacement map
     *
     * @param {Object} ast toplevel AST
     *
     * @return {Object} {name: replaceName} map
     */
    function getSandboxMap(ast) {
        var map = {};

        walker.with_walkers({
            // looking for first var with sandbox item;
            "var" : function (vars) {
                for (var i = 0, c = vars.length, varItem; i < c; i++) {
                    varItem = vars[i];
                    if (varItem[0] === 'sandbox') {
                        varItem[1][1].forEach(function (objectVar) {
                            map[objectVar[0]] = objectVar[1][1];
                        });
                        throw 0;
                    }
                }
            }
        }, function () {
            try {
                return walker.walk(ast);
            } catch (e) {}
        });

        return map;
    }

    /**
     * Brakes sendbox in one module
     *
     * @param {Object} ast
     * @param {Object} replaceMap
     *
     * @return {Object} call AST
     */
    function breakSandbox(ast, replaceMap) {
        var sandboxName = ast[2][0] || 'sb';

        var newAst = walker.with_walkers({
            // lookup for dot
            // looking for this pattern
            // ["dot", ["name", "sb"], "require"] -> ["name", map["require"]]
            "dot" : function () {
                if (this[1] && this[1][0] === "name" && this[1][1] === sandboxName) {
                    var sourceName = this[2];
                    return ["name", replaceMap[sourceName]];
                }
            }
        }, function () {
            return walker.walk(ast);
        });

        // remove IEFE's `sb` or whatever argument
        newAst[1][2] = [];

        return newAst;
    }

    /**
     * Brake sandbox: Using UglifyJS AST and sandbox variable in lmd.js file
     * replace all sb.smth with actual value of sandbox[smth]
     * than delete sandbox variable from lmd.js and all modules
     *
     * @param {Object} ast
     *
     * @returns {Object} toplevel AST
     */
    function brakeSandboxes(ast) {
        var map = getSandboxMap(ast),
            isSandboxVariableWiped = false;

        return walker.with_walkers({
            // lookup for modules
            // looking for this pattern
            // [ 'call',
            //  [ 'function', null, [ 'sb' ], [ [Object] ] ],
            //  [ [ 'name', 'sandbox' ] ] ]
            "call" : function (content) {
                if (this[2] &&
                    this[2].length > 0 &&
                    this[2][0][0] === "name" &&
                    this[2][0][1] === "sandbox" &&
                    this[1] &&
                    this[1][0] === "function"
                    ) {
                    // 1. remove sandbox argument
                    this[2] = [];
                    // 2. break sandbox in each module
                    return breakSandbox(this, map);
                }
            },
            // wipe sandobx variable
            "var": function () {
                if (isSandboxVariableWiped) {
                    return;
                }

                for (var i = 0, c = this[1].length, varItem; i < c; i++) {
                    varItem = this[1][i];
                    if (varItem[0] === 'sandbox') {
                        isSandboxVariableWiped = true;
                        this[1].splice(i, 1);

                        return this;
                    }
                }
            }
        }, function () {
            return walker.walk(ast);
        });
    }

    /**
     * Collects all plugins events with usage and event index
     *
     *  {
     *      eventIndex: 3, // relative event index
     *      on: 1,         // number of listeners
     *      trigger: 2     // number of triggers
     *  }
     *
     * @param {Object} ast toplevel AST
     *
     * @return {Object} toplevel AST
     */
    function getEvents(ast) {
        var usage = {},
            eventIndex = 0;

        walker.with_walkers({
            // looking for first var with sandbox item;
            "call" : function () {
                if (this[1] && this[2][0]) {
                    var functionName = this[1][1];
                    switch (functionName) {
                        case "lmd_on":
                        case "lmd_trigger":
                            var eventName = this[2][0][1];
                            if (!usage[eventName]) {
                                usage[eventName] = {
                                    on: 0,
                                    trigger: 0,
                                    eventIndex: eventIndex
                                };
                                eventIndex++;
                            }
                            if (functionName === "lmd_on") {
                                usage[eventName].on++;
                            } else {
                                usage[eventName].trigger++;
                            }
                            break;
                    }
                }
            }
        }, function () {
            return walker.walk(ast);
        });

        return usage;
    }

    /**
     * Wipes lmd_on, lmd_trigger, lmd_events variables from source
     *
     * @param {Object} ast
     *
     * @return {Object} modified ast
     */
    function wipeLmdEvents(ast) {
        var itemsToWipe = ['lmd_on', 'lmd_trigger', 'lmd_events'];

        return walker.with_walkers({
            // wipe lmdEvents variables
            "var": function () {
                if (!itemsToWipe.length) {
                    return;
                }

                for (var i = 0, c = this[1].length, varItem; i < c; i++) {
                    varItem = this[1][i];
                    if (varItem) {
                        var itemIndex = itemsToWipe.indexOf(varItem[0]);
                        if (itemIndex !== -1) {
                            itemsToWipe.splice(itemIndex, 1);
                            this[1].splice(i, 1);
                            i--;
                        }
                    }
                }
            }
        }, function () {
            return walker.walk(ast);
        });
    }

    /**
     * Optimizes number of lmd_{on|trigger} calls
     *
     * @param {Object} ast toplevel AST
     *
     * @return {Object} loplevel AST
     */
    function reduceAndShortenLmdEvents(ast) {
        var events = getEvents(ast),
            isWipeLmdEvents = true;

        for (var eventName in events) {
            if (isWipeLmdEvents) {
                if (events[eventName].on !== 0 && events[eventName].trigger !== 0) {
                    // something is calling events
                    isWipeLmdEvents = false;
                }
            }
        }

        // If no lmd_trigger and lmd_on calls
        // than delete them plus lmd_events from lmd.js code
        if (isWipeLmdEvents) {
            ast = wipeLmdEvents(ast);
        }

        ast = walker.with_walkers({
            // looking for first var with sandbox item;
            "call" : function () {
                if (this[1] && this[2][0]) {
                    var functionName = this[1][1],
                        eventName,
                        eventDescriptor;

                    switch (functionName) {
                        case "lmd_on":
                            eventName = this[2][0][1];
                            eventDescriptor = events[eventName];

                            // if no event triggers (no lmd_trigger(event_name,...))
                            // delete all lmd_on(event_name,...) statements
                            if (eventDescriptor.trigger === 0) {
                                return ["stat"]; // wipe statement = return empty statement - ;
                            }

                            // Shorten event names: Using UglifyJS AST find all event names
                            // from lmd_trigger and lmd_on and replace them with corresponding numbers
                            //console.log(this);
                            this[2][0] = ["num", eventDescriptor.eventIndex];
                            break;

                        case "lmd_trigger":
                            eventName = this[2][0][1];
                            eventDescriptor = events[eventName];

                            // if no event listeners (no lmd_on(event_name,...))
                            // replace all lmd_trigger(event_name, argument, argument)
                            // expressions with array [argument, argument]
                            if (eventDescriptor.on === 0) {
                                // if parent is statement -> return void
                                // to prevent loony arrays eg ["pewpew", "ololo"];
                                if (walker.parent()[0] === "stat") {
                                    return ["stat"]; // wipe statement = return empty statement - ;
                                }

                                /*
                                [
                                    "call",
                                    ["name", "lmd_trigger"],
                                    [
                                        ["string", "lmd-register:call-sandboxed-module"],
                                        ["name", "moduleName"],
                                        ["name", "require"]
                                    ]
                                ]

                                  --->

                                [
                                    "array",
                                    [
                                        ["name", "moduleName"],
                                        ["name", "require"]
                                    ]
                                ]
                                */
                                return ["array", this[2].slice(1)];
                            }

                            // Shorten event names: Using UglifyJS AST find all event names
                            // from lmd_trigger and lmd_on and replace them with corresponding numbers
                            this[2][0] = ["num", eventDescriptor.eventIndex];
                            break;
                    }
                }
            }
        }, function () {
            return walker.walk(ast);
        });

        // #52 optimise constant expressions like [main][0]
        ast = walker.with_walkers({
            "sub": function () {
                // Looking for this pattern
                // [ 'sub', [ 'array', [ [Object], [Object] ] ], [ 'num', 1 ] ]
                if (this[1][0] === "array" && this[2][0] === "num") {

                    var isConstantArray = this[1][1].every(function (item) {
                        return item[0] === "num" ||
                               item[0] === "string" ||
                               item[0] === "name" ||
                               item[0] === "array" ||
                               item[0] === "object";
                    });

                    if (isConstantArray) {
                        var index = this[2][1];

                        /*
                         [main][0]

                          --->

                         main
                        */

                        return this[1][1][index];
                    }
                }
            }
        }, function () {
            return walker.walk(ast);
        });

        return ast;
    }

    var ast = parser.parse(lmd_js_code);
    ast = brakeSandboxes(ast);
    ast = reduceAndShortenLmdEvents(ast);

    var code =  uglify.gen_code(ast);

    // wipe tail ;
    code = this.removeTailSemicolons(code);
    return code;
};

/**
 * Removes tail semicolons
 *
 * @param {String} code
 *
 * @return {String}
 */
LmdBuilder.prototype.removeTailSemicolons = function (code) {
    return code.replace(/\n*;$/, '');
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
 * @param {Array}   config
 * @param {Object}  modulesBundle
 * @param {String}  modulesBundle.main
 * @param {Array}   modulesBundle.modules
 * @param {Object}  modulesBundle.options
 * @param {Boolean} isOptimizeLmd
 *
 * @returns {String}
 */
LmdBuilder.prototype.renderLmdPackage = function (config, modulesBundle, isOptimizeLmd) {
    var lmd_js = fs.readFileSync(path.join(LMD_JS_SRC_PATH, 'lmd.js'), 'utf8'),
        lmd_main = modulesBundle.main,
        lmd_modules = modulesBundle.modules,
        modules_options = modulesBundle.options,
        result;

    // Apply patch if LMD package in cache Mode
    lmd_js = this.patchLmdSource(lmd_js, config);
    if (isOptimizeLmd) {
        lmd_js = this.optimizeLmdSource(lmd_js);
    }
    lmd_modules = '{\n' + lmd_modules.join(',\n') + '\n}';

    var options = {},
        version = config.cache ? config.version : false,
        stats_host = config.stats_auto || false,
        promise = config.promise || false,
        bundle = config.bundle ? config.bundles_callback : false;

    // if version passed -> module will be cached
    if (version) {
        options.version = version;
    }

    if (stats_host) {
        options.stats_host = stats_host;
    }

    if (promise) {
        options.promise = promise;
    }

    if (bundle) {
        options.bundle = bundle;
    }

    var userPlugin;

    for (var userPluginName in config.plugins) {
        userPlugin = config.plugins[userPluginName];
        if (userPlugin.isOk && userPlugin.options && !options[userPlugin.name]) {
            options[userPlugin.name] = userPlugin.options;
        }
    }

    options = JSON.stringify(options);

    result = this.templatePackage({
        build_info: this._getBundleBanner(config),
        lmd_js: lmd_js,
        global: config.global || 'this',
        lmd_main: lmd_main || 'function(){}',
        lmd_modules: lmd_modules,
        modules_options: JSON.stringify(modules_options),
        options: options
    });

    return result;
};

/**
 * Styles renderer
 *
 * @param {Array}   styles
 * @param {Boolean} isOptimizeCss
 *
 * @returns {String}
 */
LmdBuilder.prototype.renderStyles = function (styles, isOptimizeCss) {
    if (!styles || !styles.length) {
        return '';
    }

    var allCss = styles
        .filter(function (style) {
            return style.is_exists;
        })
        .map(function (style) {
            return fs.readFileSync(style.path, 'utf8');
        })
        .join('\n');

    return isOptimizeCss ? csso.justDoIt(allCss, true) : allCss;
};

/**
 * Module code renderer
 *
 * @param {Array}   config
 * @param {Object}  modulesBundle
 * @param {String}  modulesBundle.main
 * @param {Array}   modulesBundle.modules
 * @param {Object}  modulesBundle.options
 *
 * @returns {String}
 */
LmdBuilder.prototype.renderLmdBundle = function (config, modulesBundle) {
    return this.templateBundle({
        lmd_main: modulesBundle.main,
        bundles_callback: config.bundles_callback,
        build_info: this._getBundleBanner(config),
        lmd_modules: '{\n' + modulesBundle.modules.join(',\n') + '\n}',
        modules_options: JSON.stringify(modulesBundle.options)
    });
};

LmdBuilder.prototype._getBundleBanner = function (config) {
    // If exists return
    if (typeof config.banner === 'string') {
        return config.banner;
    }

    // Else create default
    var configFile = path.basename(this.configFile),
        mixinFiles = (config.mixins || []).map(function (mixin) {
            return path.basename(mixin);
        });

    return '// This file was automatically generated from "' + configFile + '"' +
            (mixinFiles.length ? ' using mixins "' + mixinFiles.join('", "') + '"' : '');
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
    var pluginsRequireList = {},
        pluginsCode = '';

    // Collect plugins code
    for (flagName in this.flagToOptionNameMap) {
        var plugins = this.flagToOptionNameMap[flagName].require;

        if (typeof plugins !== "undefined") {
            if (typeof plugins === "string") {
                plugins = [plugins];
            }

            plugins.forEach(function (pluginName) {
                // require once
                if (config[flagName] && !pluginsRequireList[pluginName]) {
                    pluginsCode += fs.readFileSync(path.join(LMD_JS_SRC_PATH, 'plugin', pluginName), 'utf8') + "\n\n";
                    pluginsRequireList[pluginName] = true;
                }
            });
        }
    }
    // Collect user plugins
    var userPlugin;
    for (var userPluginName in config.plugins) {
        userPlugin = config.plugins[userPluginName];
        if (userPlugin.isOk) {
            pluginsCode += userPlugin.code + "\n\n";
        }
    }

    // Apply plugins code
    lmd_js = lmd_js.replace("/*{{LMD_PLUGINS_LOCATION}}*/", pluginsCode);

    // Add includes
    for (flagName in this.flagToOptionNameMap) {
        optionNames = this.flagToOptionNameMap[flagName].preprocess || [];

        optionNames.forEach(function (optionName) {
            /*if ($P.STATS) include('stats.js');*/
            var includePattern = new RegExp('\\/\\*\\if \\(' + optionName.replace(/\$/g, '\\$').replace(/\|/g, '\\|') + '\\)\\s+include\\(\'([a-z-\\/_\\.]+)\'\\);?\\s*\\*\\/', ''),
                patchContent = '',
                match;

            // Add plugin
            while (true) {
                if (config[flagName]) {
                    // apply: remove left & right side

                    match = lmd_js.match(includePattern);
                    if (match && match[1]) {
                        patchContent = fs.readFileSync(path.join(LMD_JS_SRC_PATH, 'plugin', match[1]), 'utf8');
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
        optionNames = this.flagToOptionNameMap[flagName].preprocess || [];

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
        optionNames = this.flagToOptionNameMap[flagName].preprocess || [];

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
        this.log.write('lmd usage:\n\t    lmd config.lmd.js(on) [output.lmd.js]\n');
        return false;
    }
    return true;
};

/**
 * Collecting sandboxed modules using merged config
 *
 * @param modulesStruct
 *
 * @returns {Array}
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
LmdBuilder.prototype.fsWatch = function (config) {
    var self = this;

    for (var i = 0, c = config.errors.length; i < c; i++) {
        this.warn(config.errors[i], config.warn);
    }

    var log = function (test) {
            self.log.write(test);
        },
        rebuild = function (stat, filename) {
            if (stat && filename) {
                log('info'.green + ':    Change detected in ' + path.basename(filename).toString().green + ' at ' + stat.mtime.toString().blue);
            } else if (stat) {
                log('info'.green + ':    Change detected at ' + stat.mtime.toString().blue);
            } else {
                log('info'.green + ':   ');
            }

            log(' Rebuilding...\n');

            var buildResult = new LmdBuilder(self.configFile, self.options);

            new Writer(buildResult)
                .writeAll(function (err) {
                    if (!buildResult.buildConfig.output) {
                        return;
                    }
                    if (err) {
                        log('info'.red + ':    Build failed'.red + '\n');
                    } else {
                        log('info'.green + ':    Build complete'.green + '\n');
                    }
                });

        },
        watch = function (event, filename) {
            if (event === 'change') {
                if (filename) {
                    rebuild(fs.stat(filename), filename);
                } else {
                    rebuild();
                }
            }
        },
        watchFile = function (curr, prev, filename) {
            if (curr.mtime > prev.mtime) {
                rebuild(curr, filename);
            }
        },
        addWatcherFor = function (modulePath) {
            try {
                // a mess....
                fs.watchFile(modulePath, { interval: 1000 }, function (curr, prev) {
                    watchFile(curr, prev, modulePath);
                });
            } catch (e) {
                fs.watch(modulePath, watch);
            }
        },
        collectModuleNames = function (config) {
            var names = [],
                module,
                bundle,
                modules = config.modules,
                styles = config.styles,
                bundles = config.bundles;

            // Collect modules
            for (var moduleName in modules) {
                module = modules[moduleName];

                if (Array.isArray(module.path)) {
                    names = names.concat(module.path);
                } else {
                    // Skip shortcuts
                    if (module.path.charAt(0) === '@') continue;
                    names.push(module.path);
                }
            }

            for (var i = 0, c = styles.length; i < c; i++) {
                names.push(styles[i].path);
            }

            // Collect modules from bundles
            for (var bundleName in bundles) {
                bundle = bundles[bundleName];

                if (!(bundle instanceof Error)) {
                    collectModuleNames(bundle).forEach(function (moduleName) {
                        // uniq only
                        if (names.indexOf(moduleName) === -1) {
                            names.push(moduleName);
                        }
                    });
                }
            }

            return names;
        };

    var modules = collectModuleNames(config),
        watchedModulesCount = modules.length;

    // is there any modules?
    if (watchedModulesCount) {
        // add all modules
        modules.forEach(function (modulePath) {
            addWatcherFor(modulePath);
        });

        // add lmd.json too
        addWatcherFor(this.configFile);
        log('info'.green + ':    Now watching ' + watchedModulesCount.toString().green + ' files. Ctrl+C to stop\n');

        // Rebuild at startup
        rebuild();
    }
};

/**
 * Formats log message
 *
 * @param text
 * @return {*}
 */
LmdBuilder.prototype.formatLog = function (text) {
    return text.replace(/\*\*([^\*]*)\*\*/g, function (str) {
        return str.replace(/^\*\*|\*\*$/g, '').green;
    });
};

/**
 * text\ntext + info: -> info:    text
 *                    -> info:    text
 *
 * @param {String} padding
 * @param {String} text
 * @return {String}
 */
LmdBuilder.prototype.addPaddingToText = function (padding, text) {
    return text.split('\n').map(function (line) {
        return padding + ':    ' + line;
    }).join('\n') + '\n';
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
    this.log.write(this.addPaddingToText('ERRO'.red.inverse, text));
};

/**
 * Formats and prints an warning
 *
 * @param {String} text simple markdown syntax
 *
 * @example
 *     Pewpew **ololo** - ololo will be green
 */
LmdBuilder.prototype.warn = function (text, isWarn) {
    if (isWarn) {
        text = this.formatLog(text);
        this.log.write(this.addPaddingToText('warn'.yellow, text));
    }
};

/**
 * Formats and prints an info
 *
 * @param {String} text simple markdown syntax
 *
 * @example
 *     Pewpew **ololo** - ololo will be green
 */
LmdBuilder.prototype.info = function (text) {
    text = this.formatLog(text);
    this.log.write(this.addPaddingToText('info'.green, text));
};

/**
 * Generates module token
 *
 * @param {String} modulePath
 */
LmdBuilder.prototype.createToken = function (modulePath) {
    // issue 178 String modules getting corrupted on Windows when using source map.
    // replace \ with / in order to fix JSON.stringify escaping issue
    modulePath = modulePath.replace(/\\/g, '/');
    return '/**[[LMD_TOKEN]]:' + modulePath + '**/';
};

/**
 * Calculates module offset relative to source file
 *
 * @param {String} source     result source with tokens
 * @param {Number} tokenIndex module offset
 *
 * @return {Object} {column, line}
 */
LmdBuilder.prototype.getModuleOffset = function (source, tokenIndex) {
    var cols = 0,
        rows = 1;

    for (var i = 0, symbol; i < tokenIndex; i++) {
        symbol = source[i];

        if (symbol === '\n') {
            rows++;
            cols = 0;
        } else {
            cols++;
        }
    }

    return {
        column: cols,
        line: rows
    };
};

/**
 * Generates source map, removes source map tokens
 *
 * @param {Object}  modules          in package modules
 * @param {String}  sourceWithTokens source with sourcemap tokens
 * @param {String}  config          module config
 *
 * @return {Object} {source: cleanSource, sourceMap: sourceMap}
 */
LmdBuilder.prototype.createSourceMap = function (modules, sourceWithTokens, config) {
    var configRoot = String(config.root || config.path || ''),
        configOutput = String(config.output || ''),
        configWwwRoot = String(config.www_root || ''),
        // #174 apply default value only for non-strings
        configSourcemapWww = typeof config.sourcemap_www === 'string' ? config.sourcemap_www : '/',
        configSourcemap = String(config.sourcemap || ''),
        configSourceMappingURL = String(config.sourcemap_url || '');

    var generatedFile = path.resolve(this.configDir, configRoot, configOutput),
        root = path.resolve(this.configDir, configRoot, configWwwRoot),
        sourceMapFile = path.resolve(this.configDir, configRoot, configSourcemap),
        isInline = config.sourcemap_inline || false,
        isWarn = config.warn;

    var self = this,
        module,
        sourceMapsApplied = 0,
        sourceMapSkipped = [];

    root = fs.realpathSync(root);

    var sourceMap = new SourceMapGenerator({
        file: path.relative(root, generatedFile),
        sourceRoot: configSourcemapWww
    });

    for (var moduleName in modules) {
        module = modules[moduleName];
        if (this.isModuleCanBeUnderSourceMap(module)) {
            var token = self.createToken(module.path),
                tokenIndex = sourceWithTokens.indexOf(token);

            if (tokenIndex === -1) {
                continue;
            }

            var offset = self.getModuleOffset(sourceWithTokens, tokenIndex),
                // #174 replace back slashes with front slashes
                source = path.relative(root, module.path).replace(/\\/g, '/');

            // add mapping for each line
            for (var i = 0; i < module.lines; i++) {
                sourceMap.addMapping({
                    generated: {
                        // only first line can be with column offset
                        column: i ? 0 : offset.column,
                        line: offset.line + i
                    },
                    original: {
                        column: 0,
                        line: i + 1
                    },
                    source: source
                });
            }

            // remove token
            sourceWithTokens = sourceWithTokens.replace(token, '');
            sourceMapsApplied++;
        } else {
            if (!module.is_shortcut) {
                sourceMapSkipped.push(moduleName);
            }
        }
    }

    if (sourceMapsApplied === 0) {
        this.warn('There is no modules under Source Map!', isWarn);
    } else if (sourceMapSkipped.length) {
        this.warn('Source Map is not applied for these modules: **' + sourceMapSkipped.join('**, **') + '**', isWarn);
    }

    configSourceMappingURL = configSourceMappingURL || '/' + path.relative(root, sourceMapFile) + '?' + Math.random();

    if (isInline && sourceMapsApplied !== 0) {
        // append helper
        sourceWithTokens += '\n\n//@ sourceMappingURL=' + configSourceMappingURL + '\n';
    }

    return {
        source: sourceWithTokens,
        sourceMap: sourceMap
    };
};

/**
 *
 * @param {String} source
 *
 * @return {Number}
 */
LmdBuilder.prototype.calculateModuleLines = function (source) {
    var lines = 1;
    for (var i = 0, c = source.length; i < c; i++) {
         if (source[i] === "\n") {
            lines++;
         }
    }

    return lines;
};

/**
 *
 * @param {Object} moduleDescriptor
 *
 * @return {Boolean}
 */
LmdBuilder.prototype.isModuleCanBeUnderSourceMap = function (moduleDescriptor) {
    return !moduleDescriptor.is_shortcut &&
           !moduleDescriptor.is_coverage &&
           !moduleDescriptor.is_lazy &&
           !moduleDescriptor.is_multi_path_module;
};

LmdBuilder.prototype.applySourceMap = function (module, moduleInfo) {
    if (this.isModuleCanBeUnderSourceMap(module)) {
        var originalCodeWithToken = this.createToken(module.path) + moduleInfo.originalCode;
        // reapply wrapper
        moduleInfo.code = common.wrapModule(originalCodeWithToken, module, moduleInfo.type);
        module.lines = this.calculateModuleLines(moduleInfo.code);
    }
};

/**
 * Format one module
 *
 * @param moduleInfo
 *
 * @return {*}
 */
LmdBuilder.prototype.formatModule = function (module, moduleInfo, modulesBundle, config, isPack) {
    var mainModuleName = config.main;

    switch (moduleInfo.type) {
        case "amd":
        case "fd":
        case "fe":
        case "plain":
        case "3-party":
            // #26 Code coverage
            if (module.is_coverage) {
                var skipLines = ({
                    fd: 1,
                    fe: 1,
                    plain: 0,
                    amd: -1
                })[moduleInfo.type];

                var coverageResult = lmdCoverage.interpret(module.name, module.path, moduleInfo.code, skipLines);
                modulesBundle.options[module.name] = coverageResult.options;
                modulesBundle.options[module.name].coverage = 1;
                moduleInfo.code = coverageResult.code;
            }

            if (module.is_lazy || isPack) {
                moduleInfo.code = this.compress(moduleInfo.code, config.pack_options);
            }

            if (module.name !== mainModuleName && module.is_lazy) {
                moduleInfo.code = moduleInfo.code.replace(/^function[^\(]*/, 'function');
                if (moduleInfo.code.indexOf('(function(') !== 0) {
                    moduleInfo.code = '(' + moduleInfo.code + ')';
                }
                moduleInfo.code = this.escape(moduleInfo.code);
            }
            break;
        case "string":
            moduleInfo.code = this.escape(moduleInfo.code);
            break;
    }
};

/**
 * Format Modules
 *
 * @param config
 *
 * @returns {Object} {main: 'string', modules: ['"name": moduleContent'], options: {"name": {}}}
 */
LmdBuilder.prototype.formatModules = function (modules, modulesInfo, config, isPack) {
    var self = this;
    var modulesBundle = {
        main: '',
        modules: [],
        options: {}
    };

    if (!config.modules) {
        return modulesBundle;
    }

    var mainModuleName = config.main;

    // build modules string
    for (var index in modules) {
        var module = modules[index],
            moduleInfo = modulesInfo[index];

        // pipe warnings to errors
        moduleInfo.warns.forEach(function (warning) {
            self.warn(warning, config.warn);
        });

        if (moduleInfo.type === "shortcut") {
            if (module.name === mainModuleName) {
                this.warn('Main module can not be a shortcut. Your app will throw an error.', config.warn);
            } else {
                modulesBundle.modules.push(this.escape(module.name) + ': ' + this.escape(module.path));
            }
            continue;
        }

        if (config.sourcemap) {
            this.applySourceMap(module, moduleInfo);
        }
        this.formatModule(module, moduleInfo, modulesBundle, config, isPack);

        if (module.name === mainModuleName) {
            modulesBundle.main = moduleInfo.code;
        } else {
            modulesBundle.modules.push(this.escape(module.name) + ': ' + moduleInfo.code);
        }
    }

    var sandboxedModules = this.getSandboxedModules(modules, config);
    for (var moduleName in sandboxedModules) {
        if (!modulesBundle.options[moduleName]) {
            modulesBundle.options[moduleName] = {};
        }
        modulesBundle.options[moduleName].sandbox = 1;
    }

    return modulesBundle;
};

LmdBuilder.prototype._build = function (config, isBundle) {
    isBundle = isBundle || false;

    var self = this,
        lazy = config.lazy || false,
        cache = config.cache || false,
        pack = (lazy || cache) ? true : (config.pack || false),
        isOptimizeLmd = pack || config.optimize || false;

    var result;

    if (config.modules) {
        var modules = config.modules,
            modulesInfo = common.collectModulesInfo(config);

        if (config.warn) {
            common.collectFlagsWarnings(config, modulesInfo).forEach(function (warning) {
                self.warn(warning, config.warn);
            });
        }

        common.collectFlagsNotifications(config).forEach(function (notification) {
            self.info(notification);
        });

        var modulesBundle = this.formatModules(modules, modulesInfo[common.ROOT_BUNDLE_ID], config, pack),
            sourceMap = '',
            lmdFile;

        if (isBundle) {
            lmdFile = this.renderLmdBundle(config, modulesBundle);
        } else {
            lmdFile = this.renderLmdPackage(config, modulesBundle, isOptimizeLmd);
        }

        if (config.sourcemap) {
            var sourceMapResult = this.createSourceMap(modules, lmdFile, config);

            lmdFile = sourceMapResult.source;
            sourceMap = sourceMapResult.sourceMap;
        }

        if (pack) {
            // TODO(azproduction) Add sourceMap to it
            lmdFile = this.compress(lmdFile, config.pack_options);
        }

        result = result || {};
        result.source = lmdFile;
        result.sourceMap =  sourceMap;
    }

    if (config.styles) {
        var style = this.renderStyles(config.styles, isOptimizeLmd);
        result = result || {};
        result.style = style;
    }

    if (config.bundles) {
        var bundles = config.bundles;
        for (var bundleName in bundles) {
            bundles[bundleName] = this._build(bundles[bundleName], true);
        }

        result = result || {};
        result.bundles = bundles;
    }

    return result;
};

LmdBuilder.prototype._has = function (config, what) {
    return !!(config && config[what] && Object.keys(config[what]).length);
};

LmdBuilder.prototype._initBundlesStreams = function (bundles) {
    var self = this;

    Object.keys(bundles).forEach(function (bundleName) {
        var stream = new DataStream();
        stream.readable = self._has(bundles[bundleName], 'modules');

        self.bundles[bundleName] = stream;

        stream.sourceMap = new DataStream();
        stream.sourceMap.readable = self._has(bundles[bundleName], 'modules');

        stream.style = new DataStream();
        stream.style.readable = self._has(bundles[bundleName], 'styles');
    });
};

/**
 *
 * @param bundles
 * @return {*}
 * @private
 */
LmdBuilder.prototype._streamBundles = function (bundles) {
    var self = this;

    Object.keys(bundles).forEach(function (bundleName) {
        var bundle = bundles[bundleName],
            stream = self.bundles[bundleName];

        stream.write(bundle.source);
        stream.style.write(bundle.style);
        stream.sourceMap.write(bundle.sourceMap.toString());
    });
};

/**
 * @private
 */
LmdBuilder.prototype._closeBundleStreams = function () {
    var self = this;

    if (!self.bundles) {
        return;
    }

    Object.keys(self.bundles).forEach(function (bundleName) {
        var stream = self.bundles[bundleName];
        stream.end();
        stream.style.end();
        stream.sourceMap.end();
    });
};

/**
 * Main builder
 *
 * @returns {Object} {source: cleanSource, sourceMap: sourceMap}
 */
LmdBuilder.prototype.build = function (config) {
    // TODO TEST BUNDLES!!!!
    for (var i = 0, c = config.errors.length; i < c; i++) {
        this.warn(config.errors[i], config.warn);
    }

    if (typeof config.ie === "undefined") {
        config.ie = true;
    }

    if (!config.cache && config.cache_async) {
        this.warn('This package was configured with flag **cache_async: true**, but without flag **cache**; ' +
            'cache_async cant work independently. Flag cache_async is disabled! Please switch on **cache**.', config.warn);
        config.cache_async = false;
    }

    if (config.cache && typeof config.version === "undefined") {
        this.warn('This package was configured with flag **cache: true**, but without flag **version** parameter. ' +
            'Please define **version** to enable cache.', config.warn);
    }

    return this._build(config);
};

module.exports = LmdBuilder;
module.exports.Writer = Writer;
module.exports.Cli = Cli;
