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

module.exports = function () {
    var cwd = process.cwd(),
        status;

    var argv = optimist.argv,
        buildName,
        mixinBuilds = argv._[1];

    if (mixinBuilds) {
        mixinBuilds = mixinBuilds.split('+');

        buildName = mixinBuilds.shift();
    }

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

    // Check mixins
    if (mixinBuilds.length) {
        var isCanContinue = mixinBuilds.every(function (buildName) {
            status = create.checkFile(cwd, buildName);

            if (status !== true) {
                printHelp(status === false ? 'mixin build `' + buildName + '` is not exists' : status);
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

    var lmdFile =  cwd + '/.lmd/' + buildName + '.lmd.json';

    var buildResult = new lmdPackage(lmdFile, argv),
        buildConfig = buildResult.buildConfig;

    if (buildConfig.log && buildConfig.output) {
        cli.ok('Building `' + buildName +  '` (.lmd/' + buildName + '.lmd.json)');
        if (mixinBuilds.length) {
            cli.ok('Extra mixins ' + mixinBuilds);
        }
    }

    var configDir = fs.realpathSync(lmdFile);
    configDir = configDir.split(common.PATH_SPLITTER);
    configDir.pop();
    configDir = configDir.join('/') + '/' + (buildConfig.root || "");

    if (buildConfig.sourcemap) {
        buildResult.sourceMap.pipe(createWritableFile(configDir + buildConfig.sourcemap));

        if (buildConfig.log && buildConfig.output) {
            buildResult.sourceMap.on('end', function () {
                cli.ok('Writing Source Map to ' + buildConfig.sourcemap.green);
            });
        }
    }

    if (buildConfig.output && buildConfig.output) {
        buildResult.pipe(createWritableFile(configDir + buildConfig.output));
        if (buildConfig.log) {
            buildResult.log.pipe(process.stdout);
            buildResult.on('end', function () {
                cli.ok('Writing LMD Package to ' + buildConfig.output.green);
            });
        }
    } else {
        buildResult.pipe(process.stdout);
    }

};