require('colors');

var fs = require('fs'),
    cli = require(__dirname + '/../cli_messages.js'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js'),
    common = require(__dirname + '/../../lib/lmd_common.js'),
    lmdPackage = require(__dirname + '/../lmd_builder.js');

var optimist = require('optimist');

function printHelp(errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd build ' + '<build_name>'.blue + ' [' + '<flags>'.green + ']',
        '',

        'Example:'.bold.white.underline,
        '',

        '  lmd build ' + 'development'.blue,
        '  lmd build ' + 'development'.blue + ' --no-pack --async --js --css'.green,
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

module.exports = function () {
    var cwd = process.cwd(),
        status;

    var argv = optimist.argv,
        buildName = argv._[1];

    delete argv._;
    delete argv.$0;

    if (!init.check()) {
        return;
    }

    if (!buildName) {
        printHelp();
        return;
    }

    status = create.checkFile(cwd, buildName);

    if (status !== true) {
        printHelp(status === false ? 'build `' + buildName + '` is not exists' : status);
        return;
    }

    var lmdFile =  cwd + '/.lmd/' + buildName + '.lmd.json';

    var buildResult = new lmdPackage(lmdFile, argv),
        buildConfig = buildResult.buildConfig;

    if (buildConfig.sourcemap) {
        buildResult.sourceMap.pipe(createWritableFile(buildConfig.sourcemap));
    }

    if (buildConfig.output) {
        buildResult.pipe(createWritableFile(buildConfig.output));
        if (buildConfig.log) {
            buildResult.log.pipe(process.stdout);
        }
    } else {
        buildResult.pipe(process.stdout);
    }

};