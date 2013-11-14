var Q = require('q'),
    diff = require('diff').diffLines,
    path = require('path'),
    child_process = require('child_process'),
    Build = require('../lib/build'),
    BuildRender = require('../lib/buildRender'),
    stringify = require('json-stringify-safe'),
    colors = require('colors');

var argv = require('optimist').argv;
var fileName = argv.file;

var testBuilds = [
    path.join(__dirname, '../examples/demos/getting_started/.lmd/index.lmd.json')
];

function buildAndPrintToConsole(fileName) {
    var build = new Build('index', fileName);
    build.load()
        .then(function (build) {
            // TODO a way to render sub-bundles
            new BuildRender(build).render().then(function (code) {
                console.log(code);
            });

            // console.log(stringify(build, null, 4));
        }, function (error) {
            console.log(error.stack);
        });
}

function exec(command, options) {
    var deferred = Q.defer();

    child_process.exec(command, options || {}, function(err, stdout, stderr) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(stdout);
        }
    });

    return deferred.promise;
}

function doDiff(diffArray, fileName) {
    var diffString = '';

    diffArray.forEach(function (diffObject) {
        var sign = diffObject.added ? '+'.green : diffObject.removed ? '-'.red : '';
        if (!sign) {
            return;
        }
        diffString += diffObject.value
            .split('\n')
            .map(function (line) {
                return sign + ' ' + line;
            })
            .join('\n');
    });

    if (diffString) {
        throw new Error(('Diff in file: ' + fileName).red + '\n' + diffString);
    }
}

function diffBuildResults(fileName) {
    var buildName = path.basename(fileName).split('.lmd')[0];
    var cwd = path.join(path.dirname(fileName), '..');

    var options = {
        cwd: cwd
    };

    var oldBuild = exec('lmd build ' + buildName + ' --no-output --no-pack --no-optimize', options);
    var newBuild = exec('node ' + __filename + ' --file=' + fileName, options);

    return Q.all([oldBuild, newBuild]).spread(diff).then(function (diffArray) {
        return doDiff(diffArray, fileName);
    });
}

if (fileName) {
    buildAndPrintToConsole(fileName);
} else {
    (function step(index) {
        var fileName = testBuilds[index];
        if (!fileName) {
            return;
        }

        diffBuildResults(fileName)
            .then(function () {
                step(index += 1);
            }, function (error) {
                console.log(error.message);
            });
    })(0);
}
