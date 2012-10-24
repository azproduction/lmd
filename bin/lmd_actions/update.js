require('colors');

var fs = require('fs'),
    cli = require(__dirname + '/../cli_messages.js'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js'),
    common = require(__dirname + '/../../lib/lmd_common.js');

var optimist = require('optimist');

function printHelp(errorMessage) {
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

function updateBuild(cwd, buildName, options) {
    var lmdConfig = cwd + '/.lmd/' + buildName + '.lmd.json',
        json = JSON.parse(fs.readFileSync(lmdConfig, 'utf8'));

    fs.writeFileSync(lmdConfig, template(json, options), 'utf8');
}

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


    var extraFlags = Object.keys(argv);

    if (extraFlags.length) {
        cli.ok('');
        cli.ok('Build `' + buildName +  '` (.lmd/' + buildName + '.lmd.json) updated');
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

        updateBuild(cwd, buildName, argv);
    } else {
        printHelp();
    }
};