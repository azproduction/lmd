var path = require('path'),
    Build = require('../lib/build');

var fileName = path.join(__dirname, '../examples/demos/getting_started/.lmd/index.lmd.json');

var build = new Build('index', fileName);

build.load().then(function (build) {
    console.log(build.bundle.modulesCollection);
}, function (error) {
    console.log(error.stack);
});
