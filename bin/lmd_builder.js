/**
 * LMD Builder
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */

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

var fs = require('fs'),
    Stream = require('stream'),
    uglifyCompress = require("uglify-js"),
    SourceMapGenerator = require('source-map').SourceMapGenerator,
    colors = require('colors'),
    parser = uglifyCompress.parser,
    uglify = uglifyCompress.uglify,
    JsHint = require('jshint').JSHINT,
    lmdCoverage = require(__dirname + '/../lib/coverage_apply.js'),
    common = require(__dirname + '/../lib/lmd_common.js'),
    assembleLmdConfig = common.assembleLmdConfig;

var JSHINT_GLOBALS = common.GLOBALS;
var CROSS_PLATFORM_PATH_SPLITTER = common.PATH_SPLITTER;
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
    this.options = options || {};
    var self = this;

    // apply config
    this.configFile = configFile;

    this.init();

    // Let return instance before build
    this.buildConfig = self.compileConfig(configFile, self.options);
    process.nextTick(function () {
        if (configFile) {
            var buildResult = self.build(self.buildConfig);

            self.emit('data', buildResult.source);
            self.sourceMap.emit('data', buildResult.sourceMap.toString());
        } else {
            self.log.emit('data', 'lmd usage:\n\t    ' + 'lmd'.blue + ' ' + 'config.lmd.json'.green + ' [output.lmd.js]\n');
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
    this.options = options || {};
    var self = this;

    this.configFile = configFile;

    this.init();
    this.sourceMap.readable = false;
    this.readable = false;

    // Let return instance before build
    self.watchConfig = self.compileConfig(self.configFile, self.options);
    process.nextTick(function () {

        if (configFile) {
            if (self.watchConfig.output) {
                self.fsWatch(self.watchConfig);
                return;
            }
        }

        self.log.emit('data', 'lmd watcher usage:\n\t    ' + 'lmd watch'.blue + ' ' + 'config.lmd.json'.green + ' ' + 'output.lmd.js'.green + '\n');
        self.closeStreams();
    });
};

// Share prototype
LmdBuilder.watch.prototype =
LmdBuilder.prototype = new Stream();

/**
 * Common init for LmdBuilder and LmdBuilder.watch
 */
LmdBuilder.prototype.init = function () {

    var self = this;

    this.configDir = fs.realpathSync(this.configFile);
    this.configDir = this.configDir.split(CROSS_PLATFORM_PATH_SPLITTER);
    this.flagToOptionNameMap = LMD_PLUGINS;
    this.configDir.pop();
    this.configDir = this.configDir.join('/');

    /**
     * Build log
     *
     * @type {Stream}
     */
    this.log = new Stream();
    this.log.readable = true;

    /**
     * Source Map
     *
     * @type {Stream}
     */
    this.sourceMap = new Stream();
    this.sourceMap.readable = true;

    // LmdBuilder is readable stream
    this.readable = true;
    process.on('exit', function () {
        self.closeStreams();
    });
};

/**
 *
 * @param configFile
 * @param options
 */
LmdBuilder.prototype.compileConfig = function (configFile, options) {
    return assembleLmdConfig(configFile, Object.keys(this.flagToOptionNameMap), options);
};

/**
 * Closes all streams and make it unreadable
 */
LmdBuilder.prototype.closeStreams = function () {
    if (this.readable) {
        this.emit('end');
        this.readable = false;
    }

    if (this.log.readable) {
        this.log.emit('end');
        this.log.readable = false;
    }

    if (this.sourceMap.readable) {
        this.sourceMap.emit('end');
        this.sourceMap.readable = false;
    }
};

/**
 * LMD template
 * 
 * @param {Object} data
 */
LmdBuilder.prototype.template = function (data) {
    return data.lmd_js + '(' + data.global + ',' + data.lmd_main + ',' + data.lmd_modules + ',' + data.modules_options +
        // if version passed
        (data.version ? ',' + data.version : '') +
    ')';
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

        return walker.with_walkers({
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
                                return ["name", "null"];
                            }

                            // Shorten event names: Using UglifyJS AST find all event names
                            // from lmd_trigger and lmd_on and replace them with corresponding numbers
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
                                    return ["name", "null"];
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
    }

    var ast = parser.parse(lmd_js_code);
    ast = brakeSandboxes(ast);
    ast = reduceAndShortenLmdEvents(ast);

    var code =  uglify.gen_code(ast, {beautify: true});

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
 * Checks if code is plain module
 *
 * @param code
 * @return {String} df|fe|plain|amd
 */
LmdBuilder.prototype.getModuleType = function (code) {
    var ast = parser.parse(code);

    // ["toplevel",[["defun","depA",["require"],[]]]]
    if (ast && ast.length === 2 &&
        ast[1] && ast[1].length === 1 &&
        ast[1][0][0] === "defun"
        ) {
        return "fd";
    }

    // ["toplevel",[["stat",["function",null,["require"],[]]]]]
    if (ast && ast.length === 2 &&
        ast[1] && ast[1].length === 1 &&
        ast[1][0][0] === "stat" &&
        ast[1][0][1] &&
        ast[1][0][1][0] === "function"
        ) {
        return "fe";
    }

    if (ast) {
        var isAmd = ast[1].every(function (ast) {
            return ast[0] === "stat" &&
                ast[1][0] === "call" &&
                ast[1][1][0] === "name" &&
                ast[1][1][1] === "define";
        });

        if (isAmd) {
            return "amd";
        }
    }

    return "plain";
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
 * Wrapper for AMD files
 *
 * @param {String} code
 *
 * @returns {String} wrapped code
 */
LmdBuilder.prototype.wrapAmdModule = function (code) {
    return '(function (require) { /* wrapped by builder */\nvar define = require.define;\n' + code + '\n})';
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
 * @param {Array}   lmd_modules
 * @param {String}  lmd_main
 * @param {Boolean} pack
 * @param {Object}  modules_options
 *
 * @returns {String}
 */
LmdBuilder.prototype.render = function (config, lmd_modules, lmd_main, pack, modules_options) {
    var lmd_js = fs.readFileSync(LMD_JS_SRC_PATH + 'lmd.js', 'utf8'),
        result;

    // Apply patch if LMD package in cache Mode
    lmd_js = this.patchLmdSource(lmd_js, config);
    if (pack) {
        lmd_js = this.optimizeLmdSource(lmd_js);
    }
    lmd_modules = '{\n' + lmd_modules.join(',\n') + '\n}';

    result = this.template({
        lmd_js: lmd_js,
        global: config.global || 'this',
        lmd_main: lmd_main,
        lmd_modules: lmd_modules,
        modules_options: JSON.stringify(modules_options),
        // if version passed -> module will be cached
        version: config.cache ? JSON.stringify(config.version) : false
    });

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
                    pluginsCode += fs.readFileSync(LMD_JS_SRC_PATH + 'plugin/' + pluginName, 'utf8') + "\n\n";
                    pluginsRequireList[pluginName] = true;
                }
            });
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
                        patchContent = fs.readFileSync(LMD_JS_SRC_PATH + 'plugin/' + match[1], 'utf8');
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
        this.log.emit('data', 'lmd usage:\n\t    lmd config.lmd.json [output.lmd.js]\n');
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
    var self = this,
        watchedModulesCount = 0;

    for (var i = 0, c = config.errors.length; i < c; i++) {
        this.warn(config.errors[i], config.warn);
    }

    var module,
        modules,
        log = function (test) {
            self.log.emit('data', test);
        },
        rebuild = function (stat, filename) {
            if (stat && filename) {
                filename = filename.split(CROSS_PLATFORM_PATH_SPLITTER).pop();
                log('info'.green + ':    Change detected in ' + filename.toString().green + ' at ' + stat.mtime.toString().blue);
            } else if (stat) {
                log('info'.green + ':    Change detected at ' + stat.mtime.toString().blue);
            } else {
                log('info'.green + ':   ');
            }

            log(' Rebuilding...\n');

            var buildResult = self.build(self.compileConfig(self.configFile, self.options)),
                lmdFile = self.configDir + '/' + config.root + '/' + config.output,
                lmdSourceMapFile = self.configDir + '/' + config.root + '/' + config.sourcemap;

            log('info'.green + ':    Writing LMD Package to ' + config.output.green + '\n');
            fs.writeFileSync(lmdFile, buildResult.source, 'utf8');

            if (config.sourcemap) {
                log('info'.green + ':    Writing Source Map to ' + config.sourcemap.green + '\n');
                fs.writeFileSync(lmdSourceMapFile, buildResult.sourceMap.toString(), 'utf8');
            }

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
            watchedModulesCount++;
        };

    if (config.modules) {
        modules = config.modules;
        for (var index in modules) {
            module = modules[index];
            if (module.path.charAt(0) === '@') continue;
            addWatcherFor(module.path);
        }
        // add lmd.json too
        addWatcherFor(this.configFile);

        log('info'.green + ':    Now watching ' + watchedModulesCount.toString().green + ' module files. Ctrl+C to stop\n');

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
 * Formats and prints an error
 *
 * @param {String} text simple markdown syntax
 *
 * @example
 *     Pewpew **ololo** - ololo will be green
 */
LmdBuilder.prototype.error = function (text) {
    text = this.formatLog(text);
    this.log.emit('data', 'ERRO'.red.inverse + ':    ' + text + '\n');
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
        this.log.emit('data', 'warn'.red + ':    ' + text + '\n');
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
 * Generates module token
 *
 * @param {String} modulePath
 */
LmdBuilder.prototype.createToken = function (modulePath) {
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
    var generatedFile = this.configDir + '/' + config.root + '/' + config.output,
        root = this.configDir + '/' + config.root + '/' + config.www_root,
        www = config.sourcemap_www,
        sourceMapFile = this.configDir + '/' + config.root + '/' + config.sourcemap,
        isInline = config.sourcemap_inline,
        isWarn = config.warn;

    var self = this,
        module,
        sourceMapsApplied = 0,
        sourceMapSkipped = [];

    root = fs.realpathSync(root);

    var sourceMap = new SourceMapGenerator({
        file: fs.realpathSync(generatedFile).replace(root, ''),
        sourceRoot: www || ""
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
                source = module.path.replace(root, '');

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

    sourceMapFile = fs.realpathSync(sourceMapFile).replace(root, '');

    if (isInline && sourceMapsApplied !== 0) {
        // append helper
        sourceWithTokens += '\n\n//@ sourceMappingURL=' + sourceMapFile + '?' + Math.random() + '\n';
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
           !moduleDescriptor.is_lazy;
};

/**
 * Main builder
 *
 * @returns {Object} {source: cleanSource, sourceMap: sourceMap}
 */
LmdBuilder.prototype.build = function (config) {
    for (var i = 0, c = config.errors.length; i < c; i++) {
        this.warn(config.errors[i], config.warn);
    }

    var lazy = config.lazy || false,
        mainModuleName = config.main,
        pack = lazy ? true : (config.pack || false),
        moduleContent,
        lmdModules = [],
        lmdMain,
        lmdFile,
        isJson,
        isModule,
        moduleType,
        coverageResult,
        globalsObjects,
        modulesOptions = {},
        is_using_shortcuts = false,
        is_using_amd = false,
        parseErrorText,
        module,
        modules;

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

    if (config.modules) {
        modules = config.modules;
        // build modules string
        for (var index in modules) {
            module = modules[index];
            if (module.is_shortcut) {
                is_using_shortcuts = true;
                if (module.name === mainModuleName) {
                    this.warn('Main module can not be a shortcut. Your app will throw an error.', config.warn);
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

            if (config.sourcemap) {
                if (this.isModuleCanBeUnderSourceMap(module)) {
                    moduleContent = this.createToken(module.path) + moduleContent;
                    module.lines = this.calculateModuleLines(moduleContent);
                }
            }

            if (!isJson) {
                moduleType = "plain";
                parseErrorText = '';
                try {
                    moduleType = this.getModuleType(moduleContent);
                    isModule = true
                } catch(e) {
                    parseErrorText = e.toString();
                    isModule = false;
                }

                // #12 Warn if parse error in .js file
                if (!isModule && /.js$/.test(module.path)) {
                    this.warn('File "**' + module.path + '**" has extension **.js** and LMD detect an parse error. \n' +
                              parseErrorText.red +
                              '\nThis module will be string. Please check the source.', config.warn);
                }

                if (isModule) {
                    if (module.is_third_party) {
                        // create lmd module from non-lmd module
                        moduleContent = this.wrapNonLmdModule(moduleContent, module.extra_exports, module.extra_require);
                        if (module.extra_require && module.is_sandbox) {
                            this.error('Your module "**' + module.path + '**" have to require() some deps, but it sandboxed. ' +
                                      'Remove sandbox flag to allow module require().');
                        }
                    } else {
                        switch (moduleType) {
                            case "plain":
                                // wrap plain module
                                moduleContent = this.wrapPlainModule(moduleContent);
                                break;

                            case "amd":
                                is_using_amd = true;
                                /*if (!modulesOptions[module.name]) {
                                    modulesOptions[module.name] = {};
                                }
                                modulesOptions[module.name].amd = 1;*/
                                moduleContent = this.wrapAmdModule(moduleContent);
                                break;

                            default:
                                // wipe tail ;
                                moduleContent = this.removeTailSemicolons(moduleContent);
                        }
                    }
                }

                // #26 Code coverage
                if (isModule && module.is_coverage) {
                    var skipLines = ({
                        fd: 1,
                        fe: 1,
                        plain: 0,
                        amd: -1
                    })[moduleType];

                    coverageResult = lmdCoverage.interpret(module.name, module.path, moduleContent, skipLines);
                    modulesOptions[module.name] = coverageResult.options;
                    modulesOptions[module.name].coverage = 1;
                    moduleContent = coverageResult.code;

                    // Check for different require name (first argument)
                    globalsObjects = this.checkForDirectGlobalsAccess(module.path, moduleContent);
                    if (globalsObjects.indexOf('require') !== -1) {
                        this.error("In module **" + module.path + "** you are using different 'require' name. " +
                                   "You must declare first argument of your module-function as 'require' to use coverage!");
                    }
                }

                // #14 Check direct access of globals in lazy modules
                if (config.warn && isModule && module.is_lazy) {
                    globalsObjects = this.checkForDirectGlobalsAccess(module.path, moduleContent);

                    if (globalsObjects.length) {
                         this.warn("Lazy module **" + module.path.split('/').slice(-2).join('/') + "** uses some globals directly (" + globalsObjects.join(', ') +  "). " +
                                   "Replace them with require('" + globalsObjects[0] + "') etc", config.warn);
                    }
                }

                if (isModule && (module.is_lazy || pack)) {
                    moduleContent = this.compress(moduleContent, config.pack_options);
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
                      'Enable that flag for proper work.', config.warn);
        }

        if (!is_using_shortcuts && config.shortcuts) {
            this.warn('Config flag **shortcuts** is enabled, but there is no shortcuts in your package. ' +
                      'Disable that flag to optimize your package.', config.warn);
        }

        if (is_using_amd && !config.amd) {
            this.warn('Some of your modules are AMD Modules, but config flag **amd** is undefined or falsy. ' +
                      'Enable that flag for proper work.', config.warn);
        }

        if (!is_using_amd && config.amd) {
            this.warn('Config flag **amd** is enabled, but there is no AMD Modules in your package. ' +
                      'Disable that flag to optimize your package.', config.warn);
        }

        if (config.stats_coverage && (config.cache || config.cache_async)) {
            this.warn('LMD will cache your modules under code coverage.', config.warn);
        }

        if (config.async_plain && config.async_plainonly) {
            this.warn('You are using both config flags `async_plain` and `async_plainonly`. Disable one to optimise your source.', config.warn);
        }

        if (!config.stats_coverage && config.stats_coverage_async) {
            this.warn('You are using `stats_coverage_async` without `stats_coverage`. Enable `stats_coverage` flag.', config.warn);
        }

        if (!config.async && config.stats_coverage_async) {
            this.warn('You are using `stats_coverage_async` but not using `async`. Disable `stats_coverage_async` flag.', config.warn);
        }

        var sandboxedModules = this.getSandboxedModules(modules, config);
        for (var moduleName in sandboxedModules) {
            if (!modulesOptions[moduleName]) {
                modulesOptions[moduleName] = {};
            }
            modulesOptions[moduleName].sandbox = 1;
        }
        lmdFile = this.render(config, lmdModules, lmdMain, pack, modulesOptions);

        var sourceMap = '';
        if (config.sourcemap) {
            var sourceMapResult = this.createSourceMap(modules, lmdFile, config);

            lmdFile = sourceMapResult.source;
            sourceMap = sourceMapResult.sourceMap;
        }

        if (pack) {
            // TODO(azproduction) Add sourceMap to it
            lmdFile = this.compress(lmdFile, config.pack_options);
        }

        return {
            source: lmdFile,
            sourceMap: sourceMap
        };
    }
};

module.exports = LmdBuilder;