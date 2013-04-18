// this Special debug module using with debug.lmd.js

var config = require('lmd-config');

var counter = 0;
var onLoad = function () {
    counter--;

    // when all bundles loaded
    if (counter <= 0) {
        // start true main module
        require(config.main);
    }
};

// load all bundles
for (var moduleName in config.modules) {
    var bundleName = 'lmd-debug-bundle-' + moduleName + '.js';

    counter++;
    require.bundle(bundleName, onLoad);
}
