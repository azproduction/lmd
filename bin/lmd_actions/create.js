require('colors');

var fs = require('fs'),
    path = require('path'),
    optimist = require('optimist'),
    info = require(__dirname + '/info.js'),
    init = require(__dirname + '/init.js'),
    common = require(__dirname + '/../../lib/lmd_common.js'),
    resolveName = common.getModuleFileByShortName;

function printHelp(cli, errorMessage) {
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
    //var lmdConfig = path.join(cwd, '.lmd', name + '.lmd.json');
    var lmdDir = path.join(cwd, '.lmd'),
        lmdFile = resolveName(lmdDir, name);

    if (!lmdFile) {
        return false;
    }
    var lmdConfig = path.join(lmdDir, lmdFile);
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
    json.name = buildName + " build";
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
    var lmdDir = path.join(cwd, '.lmd'),
        lmdFile = buildName + '.lmd.json',
        lmdConfig = path.join(lmdDir, lmdFile),

        parentConfig = parentBuild ? resolveName(lmdDir, parentBuild) : null;

    fs.writeFileSync(lmdConfig, template(buildName, parentConfig, options), 'utf8');
}

module.exports = function (cli, argv, cwd) {
    argv = optimist.parse(argv);

    var status,
        buildName = argv._[1],
        parentBuild = argv._[2];

    delete argv._;
    delete argv.$0;

    if (!init.check(cli, cwd)) {
        return;
    }

    if (!buildName) {
        printHelp(cli);
        return;
    }

    status = checkFile(cwd, buildName);

    if (status) {
        printHelp(cli, status === true ? 'build `' + buildName + '` is already exists' : status);
        return;
    }

    if (parentBuild) {
        status = checkFile(cwd, parentBuild);

        if (status !== true) {
            printHelp(cli, status === false ? 'parent build `' + parentBuild + '` is not exists' : status);
            return;
        }
    }

    cli.ok('');
    cli.ok('Build `' + buildName.green +  '` (' + ('.lmd/' + buildName + '.lmd.json').green + ') created');
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

module.exports.completion = function (cli, argv, cwd, completionOptions) {
    // module name completion
    if (completionOptions.index === 1) {
        return;
    }

    // <flags> & <options>
    if (completionOptions.index > 1) {
        var flagsOptions = info.getCompletionOptions({});

        return cli.log(flagsOptions.join('\n'));
    }
};
