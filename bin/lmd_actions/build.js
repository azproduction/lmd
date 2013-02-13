require('colors');

var fs = require('fs'),
    path = require('path'),
    optimist = require('optimist'),
    init = require(__dirname + '/init.js'),
    info = require(__dirname + '/info.js'),
    create = require(__dirname + '/create.js'),
    lmdPackage = require(__dirname + '/../lmd_builder.js');

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

    var buildResult = new lmdPackage(lmdFile, argv),
        buildConfig = buildResult.buildConfig;

    // fatal error
    if (buildResult.readable === false && buildConfig.log && buildConfig.output) {
        console.log(buildResult.readable, buildConfig.log, buildConfig.output);
        buildResult.log.pipe(cli.stream);
        return;
    }

    if (buildConfig.log && buildConfig.output) {
        var versionString = buildConfig.version ? ' - version ' + buildConfig.version.toString().cyan : '';
        cli.ok('Building `' + buildName.green +  '` (' + ('.lmd/' + buildName + '.lmd.json').green + ')' + versionString);
        if (mixinBuilds.length) {
            cli.ok('Extra mixins ' + mixinBuilds);
        }
    }

    var configDir = path.join(path.dirname(fs.realpathSync(lmdFile)), buildConfig.root || "");

    if (buildConfig.sourcemap) {
        var lmdSourceMapFile = path.join(configDir, buildConfig.sourcemap);
        buildResult.sourceMap.pipe(createWritableFile(lmdSourceMapFile));

        if (buildConfig.log && buildConfig.output) {
            buildResult.sourceMap.on('end', function () {
                cli.ok('Writing Source Map to ' + lmdSourceMapFile.green);
            });
        }
    }

    if (buildConfig.output && buildConfig.output) {
        var lmdOutputFile = path.join(configDir, buildConfig.output);
        buildResult.pipe(createWritableFile(lmdOutputFile));
        if (buildConfig.log) {
            buildResult.log.pipe(cli.stream);
            buildResult.on('end', function () {
                cli.ok('Writing LMD Package to ' + lmdOutputFile.green);
            });
        }
    } else {
        buildResult.pipe(cli.stream);
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
