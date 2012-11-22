require('colors');

var fs = require('fs'),
    cli = require(__dirname + '/../cli_messages.js'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js');

function printHelp(errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd list',
        ''
    ];

    cli.help(help, errorMessage);
}

function listOfFiles(cwd) {
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

module.exports = function () {
    var cwd = process.cwd();

    if (!init.check()) {
        return;
    }

    listOfFiles(cwd);
};