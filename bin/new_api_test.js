var path = require('path'),
    Build = require('../lib/build'),
    BuildRender = require('../lib/buildRender');

var fileName = path.join(__dirname, '../examples/demos/getting_started/.lmd/index.lmd.json');

var build = new Build('index', fileName);

build.load().then(function (build) {
    var code = new BuildRender(build).render();
    console.log(code);
}, function (error) {
    console.log(error.stack);
});
