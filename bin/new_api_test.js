var path = require('path'),
    Build = require('../lib/build'),
    BuildRender = require('../lib/buildRender'),
    Logger = require('../lib/logger'),
    stringify = require('json-stringify-safe');

var fileName = path.join(__dirname, '../examples/demos/getting_started/.lmd/index.lmd.json');

var logger = new Logger(0);
logger.log1('Init build %id file %file', 'index', fileName);

var build = new Build('index', fileName);
build.withLogger(logger)
    .load()
    .then(function (build) {
        var code = new BuildRender(build).render();
        console.log(code);

        console.log(stringify(build, null, 4));
    }, function (error) {
        console.log(error.stack);
    });
