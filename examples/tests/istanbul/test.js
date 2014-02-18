// LMD test runner

var glob = require('glob').sync,
    basename = require('path').basename,
    join = require('path').join,
    relative = require('path').relative,
    spawn = require('child_process').spawn,
    async = require('async'),
    exists = require('fs').existsSync,
    unlink = require('fs').unlinkSync,
    LmdPackage = require('lmd'),
    LmdWriter = LmdPackage.Writer,
    Cli = LmdPackage.Cli.LogWriter;

var isCoverage = process.argv[2] === '--coverage',
    testDir = join(__dirname, 'test'),
    libDir = join(__dirname, 'lib'),
    libCovDir = join(__dirname, 'lib-cov'),
    lmdDir = join(testDir, '.lmd'),
    commonLmdFile = join(lmdDir, 'test.lmd.js'),
    coverageFiles = join(testDir, 'coverage*.json'),
    testsFiles = join(testDir, 'test.*.js'),
    dumpCoverageHook = join(testDir, 'hooks', 'dump_coverage.js');

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
    var args = ['--hooks', dumpCoverageHook, __dirname + '/test/common/index.html'];
    var options = {
        stdio: 'inherit',
        cwd: __dirname
    };

    spawn(runner, args, options).on('close', cb);
}

function coverageInstrument(cb) {
    var istanbul = __dirname + '/node_modules/.bin/istanbul';
    var args = ['instrument', '--output', libCovDir, '--no-compact', '--variable', '__coverage__', libDir];
    var options = {
        stdio: 'inherit',
        cwd: __dirname
    };

    spawn(istanbul, args, options).on('close', cb);
}

function coverageReport(type) {
    var istanbul = __dirname + '/node_modules/.bin/istanbul';
    var args = ['report', type, coverageFiles];
    var options = {
        stdio: 'inherit',
        cwd: __dirname
    };

    return function (cb) {
        spawn(istanbul, args, options).on('close', cb);
    };
}

function cleanupCoverageFiles(cb) {
    glob(coverageFiles).forEach(unlink);
    cb();
}

function buildAndRunTests(cb) {
    var tests = glob(testsFiles).filter(function (file) {
        return !/\.lmd\.js$/.test(file);
    });

    async.eachSeries(tests, function (mainFile, cb) {
        buildTestFor(relative(lmdDir, mainFile), function (err) {
            if (err) {
                return cb(err);
            }
            runCurrentTest(cb);
        });
    }, cb);
}

async.series(
    isCoverage ? [
        coverageInstrument,
        buildAndRunTests,
        coverageReport('text-summary'),
        coverageReport('html'),
        cleanupCoverageFiles
    ] : [
        buildAndRunTests
    ]
);
