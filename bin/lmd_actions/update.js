require('colors');

var fs = require('fs'),
    path = require('path'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js'),
    info = require(__dirname + '/info.js'),
    common = require(__dirname + '/../../lib/lmd_common.js'),
    resolveName = common.getModuleFileByShortName;

var optimist = require('optimist');

function printHelp(cli, errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd update ' + '<build_name>'.blue + ' ' + '<flags>'.green,
        '',

        'Example:'.bold.white.underline,
        '',

        '  lmd update ' + 'development'.blue + ' --no-pack --async --js --css'.green,
        '  lmd update ' + 'development'.blue + ' --modules.name=path.js'.green,
        ''
    ];

    cli.help(help, errorMessage);
}

function template(json, options) {
    if (options) {
        json = common.deepDestructableMerge(json, options);
    }

    return JSON.stringify(json, null, '    ');
}

function updateBuild(cwd, buildFile, options) {
    var lmdConfig = path.join(cwd, '.lmd', buildFile),
        json = common.readConfig(lmdConfig);

    fs.writeFileSync(lmdConfig, template(json, options), 'utf8');
}

module.exports = function (cli, argv, cwd) {
    argv = optimist.parse(argv);

    var status,
        buildName = argv._[1];

    delete argv._;
    delete argv.$0;

    if (!init.check(cli, cwd)) {
        return;
    }

    if (!buildName) {
        printHelp(cli);
        return;
    }

    status = create.checkFile(cwd, buildName);

    if (status !== true) {
        printHelp(cli, status === false ? 'build `' + buildName + '` is not exists' : status);
        return;
    }

    var extraFlags = Object.keys(argv),
        lmdDir = path.join(cwd, '.lmd'),
        buildFile = resolveName(lmdDir, buildName);

    if (extraFlags.length) {
        updateBuild(cwd, buildFile, argv);

        cli.ok('');
        cli.ok('Build `' + buildName.green + '` (' + path.join('.lmd', buildFile).green + ') updated');
        cli.ok('');

        cli.ok('These options are changed'.cyan.bold + ':');
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
    } else {
        printHelp(cli);
    }
};

module.exports.completion = function (cli, argv, cwd, completionOptions) {
    // module name completion
    if (completionOptions.index === 1) {
        var builds = info.getBuilds(cwd);

        return cli.log(builds.join('\n'));
    }

    // <flags> & <options>
    if (completionOptions.index > 1) {
        var flagsOptions = info.getCompletionOptions({});

        return cli.log(flagsOptions.join('\n'));
    }
};
