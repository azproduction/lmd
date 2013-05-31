require('colors');

var fs = require('fs'),
    path = require('path'),
    optimist = require('optimist'),
    init = require(__dirname + '/init.js'),
    info = require(__dirname + '/info.js'),
    create = require(__dirname + '/create.js'),
    common = require(__dirname + '/../../lib/lmd_common.js'),
    resolveName = common.getModuleFileByShortName,
    lmdPackage = require(__dirname + '/../lmd_builder.js'),
    LmdWriter = lmdPackage.Writer;

function printHelp(cli, errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd build ' + '<build_name>'.blue + '[' + '+<mixin>...+<mixin>'.cyan + ']' + ' [' + '<flags>'.green + ']',
        '',

        'Example:'.bold.white.underline,
        '',

        '  lmd build ' + 'development'.blue,
        '  lmd build ' + 'development'.blue + '+corp'.cyan,
        '  lmd build ' + 'development'.blue + '+en+corp'.cyan,
        '  lmd build ' + 'development'.blue + '+sourcemap'.cyan,
        '  lmd build ' + 'development'.blue + '+sourcemap'.cyan + ' --no-pack --async --js --css'.green,
        '  lmd build ' + 'development'.blue + ' --modules.name=path.js'.green,
        ''
    ];

    cli.help(help, errorMessage);
}

var createWritableFile = function (fileName) {
    return fs.createWriteStream(fileName, {
        flags: "w",
        encoding: "utf8",
        mode: 0666
    });
};

module.exports = function (cli, argv, cwd) {
    argv = optimist.parse(argv);

    var status,
        buildName,
        mixinBuilds = argv._[1],
        lmdDir = path.join(cwd, '.lmd');

    if (mixinBuilds) {
        mixinBuilds = mixinBuilds.split('+');

        buildName = mixinBuilds.shift();
    }

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

    // Check mixins
    if (mixinBuilds.length) {
        var isCanContinue = mixinBuilds.every(function (buildName) {
            status = create.checkFile(cwd, buildName);

            if (status !== true) {
                printHelp(cli, status === false ? 'mixin build `' + buildName + '` is not exists' : status);
                return false;
            }
            return true;
        });

        if (!isCanContinue) {
            return;
        }
    }

    mixinBuilds = mixinBuilds.map(function (mixinName) {
        return resolveName(lmdDir, mixinName);
    });

    if (mixinBuilds.length) {
        argv.mixins = mixinBuilds;
    }

    var lmdFile = path.join(lmdDir, resolveName(lmdDir, buildName)),
        buildResult = new lmdPackage(lmdFile, argv);

    new LmdWriter(buildResult)
        .relativeTo(cwd)
        .logTo(cli)
        .writeAll(function (err) {
            if (!buildResult.buildConfig.output) {
                return;
            }
            if (err) {
                cli.error('Build failed');
            } else {
                cli.ok('Build complete'.green);
            }
        });
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
