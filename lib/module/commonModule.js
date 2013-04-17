var Q = require('q'),
    fs = require('fs'),
    util = require('util'),
    path = require('path'),
    glob = require('glob'),
    parser = require("uglify-js").parser,
    AbstractModule = require('./abstractModule'),
    File = require('../file'),
    moduleAnalyzer = require('../moduleAnalyzer');

var reModuleIsJavaScript = /.js$/,
    reGlobPattern = /\*|\{|\}/;

var multiFilesJoiner = '\n';

/**
 * CommonModule
 *
 * @param {String} id
 * @param {*}      lmdModuleConfig
 *
 * @constructor
 *
 * @augments AbstractModule
 */
var CommonModule = function (id, lmdModuleConfig) {
    AbstractModule.call(this, id, lmdModuleConfig);

    this.ast = null;
    this.code = null;
    this.lines = 0;
    this.fileNames = [];
    this.files = [];

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
CommonModule.is = function (lmdModuleConfig) {
    return !!lmdModuleConfig;
};

util.inherits(CommonModule, AbstractModule);
module.exports = CommonModule;

/**
 *
 */
CommonModule.prototype._load = function (modulesRoot) {
    var self = this;

    this._configure();

    return this.resolveGlobedFiles(modulesRoot)
        .then(function (allFiles) {
            self.files = allFiles.map(function (fileName) {
                return new File(fileName);
            });

            var promises = self.files.map(function (file) {
                return file.load(modulesRoot);
            });

            return Q.all(promises);
        })
        .then(function () {
            self.isExists = true;

            self._joinFilesAndCountLines();
            self.type = self._resolveModuleType();
            self._resolvePluginsAndDepends();
        }, function () {
            self.isExists = false;
        });
};

CommonModule.prototype._configure = function () {
    var config = this.config;

    if (typeof config !== 'object') {
        this.fileNames = [config + ''];
        return;
    }

    this.fileNames = [].concat(config.path);
    this.isLazy = config.isLazy || false;
    this.isPack = this.isLazy ? true : (config.isPack || false);

    this.isGreedy = config.isGreedy || false;
    this.isCoverage = config.isCoverage || false;
    this.isSandbox = config.isSandbox || false;
};

/**
 *
 * @private
 */
CommonModule.prototype._joinFilesAndCountLines = function () {
    var self = this;
    // include \n in join
    this.lines = 0;
    this.code = this.files.map(function (file) {
            self.lines += file.lines;
            return file.content;
        })
        .join(multiFilesJoiner);
};

/**
 * Expands glob pattern to file name
 *
 * @param {String} modulesRoot
 *
 * @returns {Promise}
 */
CommonModule.prototype.resolveGlobedFiles = function (modulesRoot) {
    var allFiles = this.fileNames.reduce(function (paths, modulePath) {
        if (reGlobPattern.test(modulePath)) {
            modulePath = glob.sync(modulePath, {
                cwd: modulesRoot,
                nosort: true
            }) || [];
        }

        return paths.concat(modulePath);
    }, []);

    return Q.resolve(allFiles);
};

/**
 * Returns depends config file of this module
 *
 * @param {String} fileName
 * @param {String} dependsMask
 *
 * @return {String}
 */
AbstractModule.prototype.getDependsConfigOf = function (fileName, dependsMask) {
    fileName = fileName.replace(/^.*\/|\.[a-z0-9]+$/g, '');

    return path.join(path.dirname(fileName), dependsMask.replace('*', fileName));
};

/**
 * Finds modules depends
 *
 * @param {String} defaultDependsMask
 *
 * @returns {Array}
 */
AbstractModule.prototype.resolveModulesDepends = function (defaultDependsMask) {
    var self = this;
    var dependsMask = typeof this.config.depends === 'undefined' ? defaultDependsMask : this.config.depends;

    if (typeof dependsMask === 'undefined') {
        return [];
    }

    return this.files.reduce(function (depends, file) {
        if (file.isExists) {
            depends.push(self.getDependsConfigOf(file.name, dependsMask));
        }
        return depends;
    }, []);
};

/**
 *
 */
CommonModule.prototype._resolvePluginsAndDepends = function () {
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
 * @returns {String}
 */
CommonModule.prototype._resolveModuleType = function () {
    if (this.type) {
        return this.type;
    }

    try {
        JSON.parse(this.code);
        return "json";
    } catch (e) {}

    try {
        this.ast = parser.parse(this.code);
        return this.detectModuleTypeByAst(this.ast);
    } catch (e) {
        if (reModuleIsJavaScript.test(this.files[0].name)) {
            this.addWarning(
                'File "' + this.files[0].originalName.green + '" has extension ' + '.js'.green +
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
CommonModule.prototype.detectModuleTypeByAst = function (ast) {
    // Empty module
    if (this._isPlainModule(ast)) {
        return 'plain';
    }

    // ["toplevel",[["defun","depA",["require"],[]]]]
    if (this._isFdModule(ast)) {
        return 'fd';
    }

    // ["toplevel",[["stat",["function",null,["require"],[]]]]]
    if (this._isFeModule(ast)) {
        return 'fe';
    }

    if (this._isAmdModule(ast)) {
        return 'amd';
    }

    return 'plain';
};

/**
 * @param {Object} ast UglifyJS 1.x AST
 *
 * @returns {Boolean}
 */
CommonModule.prototype._isPlainModule = function (ast) {
    return ast.length === 2 && !ast[1].length && ast[0] === 'toplevel';
};

/**
 * @param {Object} ast UglifyJS 1.x AST
 *
 * @returns {Boolean}
 */
CommonModule.prototype._isFdModule = function (ast) {
    return ast && ast.length === 2 &&
           ast[1] && ast[1].length === 1 &&
           ast[1][0][0] === 'defun';
};

/**
 * @param {Object} ast UglifyJS 1.x AST
 *
 * @returns {Boolean}
 */
CommonModule.prototype._isFeModule = function (ast) {
    return ast && ast.length === 2 &&
           ast[1] && ast[1].length === 1 &&
           ast[1][0][0] === 'stat' &&
           ast[1][0][1] &&
           ast[1][0][1][0] === 'function';
};

/**
 * @param {Object} ast UglifyJS 1.x AST
 *
 * @returns {Boolean}
 */
CommonModule.prototype._isAmdModule = function (ast) {
    return ast[1].every(function (ast) {
        return ast[0] === "stat" &&
            ast[1][0] === "call" &&
            ast[1][1][0] === "name" &&
            ast[1][1][1] === "define";
    });
};
