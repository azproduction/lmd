var path = require('path'),
    Build = require('../lib/build'),
    BuildRender = require('../lib/buildRender'),
    stringify = require('json-stringify-safe');

var fileName = path.join(__dirname, '../examples/demos/getting_started/.lmd/index.lmd.json');

var build = new Build('index', fileName);
build.load()
    .then(function (build) {
        // TODO a way to render sub-bundles
        new BuildRender(build).render().then(function (code) {
            console.log(code);
        });

        console.log(stringify(build, null, 4));
    }, function (error) {
        console.log(error.stack);
    });
