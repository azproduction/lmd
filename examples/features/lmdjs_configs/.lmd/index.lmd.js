var fs = require('fs'),
    path = require('path');

var projectRoot = "../js",
    inPackageModules = {};

// you can define modules
inPackageModules['../lmdjs_configs/js/test/test.js'] = 'test/test.js';

// the same as "<%= file %><%= dir[0][0].toUpperCase() %><%= dir[0].slice(1, -1) %>": "{collections,helpers,models,routers,templates,views}/**/*.{js,html}"
'collections,helpers,models,routers,templates,views'.split(',').forEach(function (dir) {
    var suffix = dir[0].toUpperCase() + dir.slice(1, -1),
        dirName = path.join(__dirname, projectRoot, dir);

    fs.readdirSync(dirName).forEach(function (fileName) {
        var moduleName = fileName.split('.')[0] + suffix;

        inPackageModules[moduleName] = path.join(dir, fileName);
    });
});

// or allow lmd to glob them
inPackageModules['*'] = "*.js";

module.exports = {
    name: ".lmd.js example, you dynamically define config files",
    description: "Write JS instead of JSON!",

    root: projectRoot,
    output: "../index.lmd.js",
    www_root: "../",
    modules: inPackageModules,
    main: "main",
    ie: false
};
