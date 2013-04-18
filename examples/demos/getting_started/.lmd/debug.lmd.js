var fs = require('fs'),
    path = require('path');

var bundlePrefix = 'lmd-debug-bundle-',
    buildName = 'index',
    cfgFile = './' + buildName + '.lmd.json',
    cfg = require(cfgFile),
    debugMainName = 'debug-main',
    debugConfigName = 'lmd-config';

// create bundles from modules
cfg.bundles = Object.keys(cfg.modules).reduce(function (bundles, moduleName) {
    if (moduleName === debugMainName || moduleName === debugConfigName) {
        return bundles;
    }
    var bundleName = bundlePrefix + moduleName,
        bundleOutput = bundleName + '.js',
        bundleModules = {};

    // copy module
    bundleModules[moduleName] = cfg.modules[moduleName];

    bundles[bundleName] = {
        output: bundleOutput,
        modules: bundleModules
    };

    // delete module
    delete cfg.modules[moduleName];
    return bundles;
}, cfg.bundles || {});

cfg.modules[debugMainName] = '.lmd/' + debugMainName + '.js';
cfg.modules[debugConfigName] = '.lmd/' + cfgFile;
cfg.main = debugMainName;
cfg.pack = false;
cfg.cache = false;
cfg.optimize = true;

module.exports = cfg;
