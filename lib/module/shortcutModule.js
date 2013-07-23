var Q = require('q'),
    fs = require('fs'),
    util = require('util'),
    AbstractModule = require('./abstractModule');

var reModuleIsShortcut = /^@/;

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
var ShortcutModule = function (id, lmdModuleConfig) {
    AbstractModule.call(this, id, lmdModuleConfig);

    this.type = 'shortcuts';
    this.shortcutName = '';
    this.addRequiredPlugin('shortcut');
};

/**
 * @param {String} lmdModuleConfig
 * @returns {Boolean}
 */
ShortcutModule.is = function (lmdModuleConfig) {
    return typeof lmdModuleConfig === "string" && reModuleIsShortcut.test(lmdModuleConfig);
};

util.inherits(ShortcutModule, AbstractModule);
module.exports = ShortcutModule;

/**
 */
ShortcutModule.prototype._load = function () {
    this.isExists = true;
    this.shortcutName = this.config;

    return Q.resolve();
};
