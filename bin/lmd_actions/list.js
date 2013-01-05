require('colors');

var fs = require('fs'),
    path = require('path'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js'),
    common = require(__dirname + '/../../lib/lmd_common.js');

function printHelp(cli, errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd list',
        ''
    ];

    cli.help(help, errorMessage);
}

function listOfFiles(cli, cwd) {
    var lmdDir = path.join(cwd, '.lmd');

    var files = fs.readdirSync(lmdDir)
        .filter(function (name) {
            return fs.statSync(path.join(lmdDir, name)).isFile() && /\.lmd\.json$/.test(name);
        });

    if (!files.length) {
        cli.ok('');
        cli.ok('No LMD builds. Type lmd create for more info');
        cli.ok('');
        return;
    }

    cli.ok('');
    cli.ok('Available builds'.white.bold.underline);
    cli.ok('');

    var longestName = files.reduce(function (max, current) {
        return current.length > max ? current.length : max;
    }, 0);

    files.forEach(function (name) {
        var extraSpaces = new Array(longestName - name.length + 3).join(' '),
            buildName = common.readConfig(lmdDir, name).name || '';

        name = name.replace(/\.lmd\.json$/, '');
        cli.ok(name.cyan + extraSpaces + buildName);
    });
    cli.ok('');
}

module.exports = function (cli, argv, cwd) {
    if (!init.check(cli, cwd)) {
        return;
    }

    listOfFiles(cli, cwd);
};