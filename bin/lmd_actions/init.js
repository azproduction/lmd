var fs = require('fs'),
    cli = require(__dirname + '/../cli_messages.js');

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
    var lmdDir = cwd + '/.lmd';
    fs.mkdirSync(lmdDir);
}

function printHelp(errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd init',
        ''
    ];

    cli.help(help, errorMessage);
}

module.exports = function (argv) {
    var cwd = process.cwd();

    var status = checkLmdDir(cwd);
    if (status) {
        printHelp(status === true ? '.lmd is already initialised' : status);
        return;
    }

    createLmdStructure(cwd);
    cli.ok('');
    cli.ok('.lmd initialised');
    cli.ok('');
};

module.exports.check = function () {
    var cwd = process.cwd();

    var status = checkLmdDir(cwd);
    if (status !== true) {
        printHelp(status ? status : 'run `lmd init` to initialise LMD in ' + cwd);
        return false;
    }

    return true;
};