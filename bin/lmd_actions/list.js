require('colors');

var fs = require('fs'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js');

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
    var lmdDir = cwd + '/.lmd';

    var files = fs.readdirSync(lmdDir)
        .filter(function (name) {
            return fs.statSync(lmdDir + '/' + name).isFile() && /\.lmd\.json$/.test(name);
        })
        .map(function (name) {
            return name.replace(/\.lmd\.json$/, '');
        });

    if (!files.length) {
        cli.ok('');
        cli.ok('No LMD builds. Type lmd create for more info');
        cli.ok('');
        return;
    }

    cli.ok('');
    cli.ok('Available builds:'.cyan.bold);
    cli.ok('');
    files.forEach(function (name) {
        cli.ok('  ' + name);
    });
    cli.ok('');
}

module.exports = function (cli, argv, cwd) {
    if (!init.check(cli, cwd)) {
        return;
    }

    listOfFiles(cli, cwd);
};