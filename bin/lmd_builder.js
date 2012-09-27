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
    Stream = require('stream'),
    uglifyCompress = require("uglify-js"),
    colors = require('colors'),
    parser = uglifyCompress.parser,
    uglify = uglifyCompress.uglify,
    JsHint = require('jshint').JSHINT,
    lmdCoverage = require(__dirname + '/../lib/coverage_apply.js'),
    common = require(__dirname + '/../lib/lmd_common.js'),
    assembleLmdConfig = common.assembleLmdConfig;

var CROSS_PLATFORM_PATH_SPLITTER = common.PATH_SPLITTER;

/**
 * LmdBuilder
 *
 * LmdBuilder is readable stream
 * 
 * @constructor
 *
 * @inherits Stream
 *
 * @param {Object|String} data               lmd options or argv string
 *
 * If data is {Object}:
 * @param {Object}        data.config               path to config file
 * @param {Object}        [data.mode='stream']      stream, watch or main
 * @param {Object}        [data.output]             result file or STDOUT
 * @param {Object}        [data.version='lmd_tiny'] lmd version
 * @param {Boolean}       [data.log=false]          log?
 *
 *
 * @example
 *      // pass and object
 *      new LmdBuilder({
 *          config: "config.json",
 *          output: "result.js" // optional
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


/**
 *
 * @param {String} configFile
 * @param {Object} [options]
 * @param {Object} [options.noWarn = false]
 *
 * @constructor
 */
var LmdBuilder = function (configFile, options) {
    options = options || {};
    var //args = this.parseData(data),
        self = this;

    // apply config
    // this.mode = args.mode || 'main';
    this.configFile = configFile;
    // this.outputFile = args.output;
    // this.isLog = args.log || false;
    this.isWarn = !options.noWarn;

    /*if (LmdBuilder.availableModes.indexOf(this.mode) === -1) {
        throw new Error(('No such LMD run mode - ' + this.mode).red);
    }*/

    /*if (!this.outputFile) {
        if (this.mode === "watch") {
            throw new Error('Watch mode requires output file name: -output path/to/output/lmd.js'.red);
        }
        this.isLog = false;
        this.isWarn = false;
    }*/

    this.init();

    // Let return instance before build
    process.nextTick(function () {
        if (configFile) {
            self.emit('data', self.build());
        } else {
            self.log.emit('data', 'lmd usage:\n\t    ' + 'lmd'.blue + ' ' + 'config.lmd.json'.green + ' [output.lmd.js]\n');
        }
        process.exit();
    });
};

/**
 * @constructor
 *
 * @param configFile
 * @param outputFile
 * @param options
 */
LmdBuilder.watch = function (configFile, outputFile, options) {
    options = options || {};
    var self = this;

    this.configFile = configFile;
    this.outputFile = outputFile;
    this.isWarn = !options.noWarn;

    this.init();
    this.log.writeable = true;
    this.readable = false;

    // Let return instance before build
    process.nextTick(function () {
        if (configFile && outputFile) {
            self.fsWatch();
        } else {
            self.log.emit('data', 'lmd watcher usage:\n\t    ' + 'lmd watch'.blue + ' ' + 'config.lmd.json'.green + ' ' + 'output.lmd.js'.green + '\n');
            process.exit();
        }
    });
};

LmdBuilder.watch.prototype =
LmdBuilder.prototype = new Stream();

LmdBuilder.prototype.init = function () {
    var self = this;
    this.configDir = fs.realpathSync(this.configFile);
    this.configDir = this.configDir.split(CROSS_PLATFORM_PATH_SPLITTER);
    this.flagToOptionNameMap = JSON.parse(fs.readFileSync(LMD_JS_SRC_PATH + 'lmd_plugins.json', 'utf8'));
    this.configDir.pop();
    this.configDir = this.configDir.join('/');

    this.log = new Stream();
    this.log.readable = true;

    // LmdBuilder is readable stream
    this.readable = true;
    process.on('exit', function () {
        self.emit('end');
        self.readable = false;

        self.log.emit('end');
        self.log.readable = false;
    });
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
 * @param {Array}   lmd_modules
 * @param {String}  lmd_main
 * @param {Boolean} pack
 * @parma {Object}  pack_options
 * @param {Array}   sandboxed_modules
 * @param {Object}  [coverage_options]
 *
 * @returns {String}
 */
LmdBuilder.prototype.render = function (config, lmd_modules, lmd_main, pack, pack_options, sandboxed_modules, coverage_options) {
    sandboxed_modules = JSON.stringify(sandboxed_modules || {});
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
        sandboxed_modules: sandboxed_modules,
        coverage_options: coverage_options ? JSON.stringify(coverage_options) : false,
        // if version passed -> module will be cached
        version: config.cache ? JSON.stringify(config.version) : false
    });

    if (pack) {
        result = this.compress(result, pack_options);
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
            filename = filename.split(CROSS_PLATFORM_PATH_SPLITTER).pop();
            if (stat && filename) {
                self.log.emit('data', 'lmd'.inverse + ' Change detected in ' + filename.toString().green + ' at ' + stat.mtime.toString().blue);
            } else if (stat) {
                self.log.emit('data', 'lmd'.inverse + ' Change detected at ' + stat.mtime.toString().blue);
            } else {
                self.log.emit('data', 'lmd'.inverse + ' Change detected');
            }

            self.log.emit('data', ' ' + 'Rebuilding...'.green);

            if (self.isWarn) {
                self.log.emit('data', '\n');
            }

            fs.writeFileSync(self.outputFile, self.build(), 'utf8');

            if (!self.isWarn) {
                self.log.emit('data', ' ' + 'Done!'.green + '\n');
            } else {
                self.log.emit('data', 'lmd'.inverse + ' Rebuilding done!'.green + '\n');
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
            if (module.path.charAt(0) === '@') continue;
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

        this.log.emit('data', 'lmd'.inverse + ' Now watching ' + watchedModulesCount.toString().green + ' module files. Ctrl+C to stop\n');
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
    this.log.emit('data', 'lmd'.inverse + ' ' + 'ERROR'.inverse.red + ' ' + text + '\n');
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
        this.log.emit('data', 'lmd'.inverse + ' ' + 'Warning'.red + ' ' + text + '\n');
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
 * @returns {String}
 */
LmdBuilder.prototype.build = function () {
    var config = assembleLmdConfig(this.configFile, Object.keys(this.flagToOptionNameMap));

    for (var i = 0, c = config.errors.length; i < c; i++) {
        this.warn(config.errors[i]);
    }

    var lazy = config.lazy || false,
        mainModuleName = config.main,
        pack = lazy ? true : (config.pack || false),
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
                    } else {
                        if (isPlainModule) {
                            // wrap plain module
                            moduleContent = this.wrapPlainModule(moduleContent);
                        } else {
                            // wipe tail ;
                            moduleContent = this.removeTailSemicolons(moduleContent);
                        }
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
        lmdFile = this.render(config, lmdModules, lmdMain, pack, config.pack_options, sandbox, config.stats_coverage ? coverageOptions : void 0);

        return lmdFile;
    }
};

module.exports = LmdBuilder;