var fs = require('fs'),
    path = require('path');

function checkLmdDir(cwd) {
    var lmdDir = cwd + '/.lmd';
    if (fs.existsSync(lmdDir)) {
        if (fs.statSync(lmdDir).isDirectory()) {
            return true;
        }
        return '.lmd is not a dir';
    }

    return false;
}

function createLmdStructure(cwd) {
    var lmdDir = path.join(cwd, '.lmd');
    fs.mkdirSync(lmdDir);
}

function printHelp(cli, errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd init',
        ''
    ];

    cli.help(help, errorMessage);
}

module.exports = function (cli, argv, cwd) {
    var status = checkLmdDir(cwd);
    if (status) {
        printHelp(cli, status === true ? '.lmd is already initialised' : status);
        return;
    }

    createLmdStructure(cwd);
    cli.ok('');
    cli.ok('.lmd initialised');
    cli.ok('');
};

module.exports.check = function (cli, cwd) {
    var status = checkLmdDir(cwd);
    if (status !== true) {
        printHelp(cli, status ? status : 'run `lmd init` to initialise LMD in ' + cwd);
        return false;
    }

    return true;
};