require('colors');

var fs = require('fs'),
    path = require('path'),
    cli = require(__dirname + '/../cli_messages.js'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js'),
    common = require(__dirname + '/../../lib/lmd_common.js'),
    lmdPackage = require(__dirname + '/../lmd_builder.js');

var optimist = require('optimist');

function printHelp(cli, errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd watch ' + '<build_name>'.blue + '[' + '+<mixin>...+<mixin>'.cyan + ']' + ' [' + '<flags>'.green + ']',
        '',

        'Example:'.bold.white.underline,
        '',

        '  lmd watch ' + 'development'.blue,
        '  lmd watch ' + 'development'.blue + '+corp'.cyan,
        '  lmd watch ' + 'development'.blue + '+en+corp'.cyan,
        '  lmd watch ' + 'development'.blue + '+sourcemap'.cyan,
        '  lmd watch ' + 'development'.blue + '+sourcemap'.cyan + ' --no-pack --async --js --css'.green,
        '  lmd watch ' + 'development'.blue + ' --modules.name=path.js'.green,
        ''
    ];

    cli.help(help, errorMessage);
}

module.exports = function (cli, argv, cwd) {
    argv = optimist.parse(argv);

    var status,
        buildName,
        mixinBuilds = argv._[1];

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

    mixinBuilds = mixinBuilds.map(function (build) {
        return './' + build + '.lmd.json';
    });

    if (mixinBuilds.length) {
        argv.mixins = mixinBuilds;
    }

    var lmdFile =  path.join(cwd, '.lmd', buildName + '.lmd.json');

    var watchResult = new lmdPackage.watch(lmdFile, argv),
        watchConfig = watchResult.watchConfig;

    if (watchConfig.log) {
        watchResult.log.pipe(cli.stream);
    }

};