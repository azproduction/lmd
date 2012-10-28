require('colors');

var fs = require('fs'),
    cli = require(__dirname + '/../cli_messages.js'),
    init = require(__dirname + '/init.js'),
    common = require(__dirname + '/../../lib/lmd_common.js');

var optimist = require('optimist');

function printHelp(errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd create ' + '<build_name>'.blue + ' [' + '<parent_build_name>'.cyan + '] [' + '<flags>'.green + ']',
        '',

        'Example:'.bold.white.underline,
        '',

        '  lmd create ' + 'development'.blue,
        '  lmd create ' + 'development'.blue + ' --no-pack --async --js --css'.green,
        '  lmd create ' + 'production'.blue + ' development'.cyan + ' --pack --ie'.green,
        '  lmd create ' + 'testing'.blue + ' production'.cyan,
        ''
    ];

    cli.help(help, errorMessage);
}

function checkFile(cwd, name) {
    var isGoodFileName = !!name.match(/\/|\\|^\./);
    if (isGoodFileName) {
        return 'bad build name `' + name + '`';
    }
    var lmdConfig = cwd + '/.lmd/' + name + '.lmd.json';
    if (fs.existsSync(lmdConfig)) {
        if (fs.statSync(lmdConfig).isFile()) {
            // already exists
            return true;
        }
        return lmdConfig + ' is a dir';
    }

    // not exists
    return false;
}

function template(buildName, parentConfig, options) {
    var json = {};
    json.root = "../";
    json.output = buildName + ".lmd.js";
    if (parentConfig) {
        json.extends = parentConfig;
    }
    json.modules = {};

    json.main = "main";

    if (options) {
        json = common.deepDestructableMerge(json, options);
    }

    return JSON.stringify(json, null, '    ');
}

function createBuild(cwd, buildName, parentBuild, options) {
    var lmdConfig = cwd + '/.lmd/' + buildName + '.lmd.json',
        parentConfig = parentBuild ? parentBuild + '.lmd.json' : null;

    fs.writeFileSync(lmdConfig, template(buildName, parentConfig, options), 'utf8');
}

module.exports = function () {
    var cwd = process.cwd(),
        status;

    var argv = optimist.argv,
        buildName = argv._[1],
        parentBuild = argv._[2];

    delete argv._;
    delete argv.$0;

    if (!init.check()) {
        return;
    }

    if (!buildName) {
        printHelp();
        return;
    }

    status = checkFile(cwd, buildName);

    if (status) {
        printHelp(status === true ? 'build `' + buildName + '` is already exists' : status);
        return;
    }

    if (parentBuild) {
        status = checkFile(cwd, parentBuild);

        if (status !== true) {
            printHelp(status === false ? 'parent build `' + parentBuild + '` is not exists' : status);
            return;
        }
    }

    cli.ok('');
    cli.ok('Build `' + buildName +  '` (.lmd/' + buildName + '.lmd.json) created');
    cli.ok('');

    var extraFlags = Object.keys(argv);

    if (extraFlags.length) {
        cli.ok('These options are also added'.cyan.bold + ':');
        cli.ok('');

        var offset = extraFlags.reduce(function (longest, current) {
            return current.length > longest ? current.length : longest;
        }, 0);

        offset += 3;

        extraFlags.forEach(function (flagName) {
            var spaces = new Array(offset - flagName.length).join(' ');

            cli.ok('  ' + flagName.green + spaces + JSON.stringify(argv[flagName]));
        });
        cli.ok('');
    }

    createBuild(cwd, buildName, parentBuild, argv);
};

module.exports.checkFile = checkFile;