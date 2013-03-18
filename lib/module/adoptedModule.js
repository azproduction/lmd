var Q = require('q'),
    fs = require('fs'),
    util = require('util'),
    Module = require('./module');

/**
 * Module
 *
 * @param {String} id
 * @param {*}      lmdModuleConfig
 *
 * @constructor
 *
 * @augments Module
 */
var AdoptedModule = function (id, lmdModuleConfig) {
    Module.call(this, id, lmdModuleConfig);

    this.extraExports = lmdModuleConfig.exports;
    this.extraExports = lmdModuleConfig.require;
    this.extraBind = lmdModuleConfig.bind || lmdModuleConfig['this'];
    this.type = '3-party';
};

/**
 * @param {String} lmdModuleConfig
 * @returns {Boolean}
 */
AdoptedModule.is = function (lmdModuleConfig) {
    return !!lmdModuleConfig.exports || !!lmdModuleConfig.require ||
           !!lmdModuleConfig.bind || !!lmdModuleConfig['this'];
};

util.inherits(AdoptedModule, Module);
module.exports = AdoptedModule;
