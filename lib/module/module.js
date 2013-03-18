var Q = require('q'),
    fs = require('fs'),
    util = require('util'),
    parser = require("uglify-js").parser,
    AbstractModule = require('./abstractModule'),
    moduleAnalyzer = require('../moduleAnalyzer');

var readFile = Q.nfbind(fs.readFile),
    realPath  = Q.nfbind(fs.realpath);

var reModuleIsJavaScript = /.js$/;

/**
 * Module
 *
 * @param {String} id
 * @param {*}      lmdModuleConfig
 *
 * @constructor
 *
 * @augments AbstractModule
 */
var Module = function (id, lmdModuleConfig) {
    AbstractModule.call(this, id, lmdModuleConfig);

    this.ast = null;

    this.code = '';
    this.originalCode = '';
    this.lines = 0;

    this.originalFileName = '';
    this.fileName = '';

    this.isPack = false;
    this.isLazy = false;
    this.isGreedy = false;
    this.isCoverage = false;
    this.isSandbox = false;
};

/**
 * @param {*} lmdModuleConfig
 * @returns {Boolean}
 */
Module.is = function (lmdModuleConfig) {
    return !!lmdModuleConfig;
};

util.inherits(Module, AbstractModule);
module.exports = Module;

/**
 *
 */
Module.prototype._load = function () {
    var self = this;

    this._configure();

    realPath(this.originalFileName)
        // Check file exists
        .then(function (fileName) {
            self.fileName = fileName;
            self.isExists = true;

            return readFile(fileName, 'utf8');
        })
        // Load file & detect type & count lines
        .then(function (originalCode) {
            self.originalCode = originalCode;
            self.lines = self.calculateModuleLines(originalCode);
            self.type = self.resolveModuleType();

            self.resolvePluginsAndDepends();
        })
        .then(this.deferred.resolve, this.deferred.reject);
};

Module.prototype._configure = function () {
    var config = this.config;

    if (typeof config !== "object") {
        this.originalFileName = config + '';
        return;
    }

    this.originalFileName = config.path || '';
    this.isLazy = config.isLazy || false;
    this.isPack = this.isLazy ? true : (config.isPack || false);

    this.isGreedy = config.isGreedy || false;
    this.isCoverage = config.isCoverage || false;
    this.isSandbox = config.isSandbox || false;
};

/**
 *
 */
Module.prototype.resolvePluginsAndDepends = function () {
    var self = this;

    if (this.type === 'amd') {
        this.addPluginDepends('amd');
    }

    var moduleAnalytics = moduleAnalyzer(this);

    moduleAnalytics.plugins.forEach(function (pluginName) {
        self.addPluginDepends(pluginName);
    });

    moduleAnalytics.depends.forEach(function (moduleName) {
        self.addModuleDepends(moduleName);
    });
};

/**
 *
 * @param {String} source
 *
 * @return {Number}
 */
Module.prototype.calculateModuleLines = function (source) {
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
 * @returns {String}
 */
Module.prototype.resolveModuleType = function () {
    if (this.type) {
        return this.type;
    }
    var code = self.originalCode;

    try {
        JSON.parse(code);
        return "json";
    } catch (e) {}

    try {
        this.ast = parser.parse(code);
        return this.detectModuleTypeByAst(this.ast);
    } catch (e) {
        if (reModuleIsJavaScript.test(self.fileName)) {
            this.addWarning(
                'File "' + this.originalFileName.green + '" has extension ' + '.js'.green +
                ' and LMD detect an parse error. \n' +
                e.toString().red +
                '\nThis module will be string. Please check the source.'
            );
        }

        return "string";
    }
};

/**
 * @param {Object} ast UglifyJS 1.x AST
 *
 * @returns {String}
 */
Module.prototype.detectModuleTypeByAst = function (ast) {
    // Empty module
    if (ast.length === 2 && !ast[1].length && ast[0] === 'toplevel') {
        return "plain";
    }

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
