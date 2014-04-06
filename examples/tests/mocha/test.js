// LMD test runner

var glob = require('glob').sync,
    basename = require('path').basename,
    join = require('path').join,
    relative = require('path').relative,
    spawn = require('child_process').spawn,
    async = require('async'),
    exists = require('fs').existsSync,
    LmdPackage = require('lmd'),
    LmdWriter = LmdPackage.Writer,
    Cli = LmdPackage.Cli.LogWriter;

var testDir = join(__dirname, 'test'),
    lmdDir = join(testDir, '.lmd'),
    commonLmdFile = join(lmdDir, 'test.lmd.js');

function buildTestFor(main, cb) {
    var options = {
        modules: {
            main: main
        },
        log: true,
        warn: true
    };

    var dependencies = join(testDir, basename(main, '.js') + '.lmd.js');

    if (exists(dependencies)) {
        options.mixins = [relative(lmdDir, dependencies)];
    }

    new LmdWriter(new LmdPackage(commonLmdFile, options))
        .logTo(new Cli(process.stdout))
        .relativeTo(testDir)
        .writeAll(cb);
}

function runCurrentTest(cb) {
    var runner = __dirname + '/node_modules/.bin/mocha-phantomjs';
    var args = [__dirname +'/test/common/index.html'];
    var options = {
        stdio: 'inherit'
    };

    spawn(runner, args, options).on('close', cb);
}

var tests = glob(join(testDir, 'test.*.js')).filter(function (file) {
    return !/\.lmd\.js$/.test(file);
});

async.eachSeries(tests, function (mainFile, cb) {
    buildTestFor(relative(lmdDir, mainFile), function (err) {
        if (err) {
            return cb(err);
        }
        runCurrentTest(cb);
    });
});
