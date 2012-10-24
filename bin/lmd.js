/**
 * LMD
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */

var fs = require('fs'),
    cli = require(__dirname + '/cli_messages.js');

require('colors');

var argv = require('optimist').argv;

// lmd init
var action = process.argv[2];

var allowedActions = {
    init: 'Initializes LMD for project',
    create: 'To create new LMD config',
    update: 'Updates existed LMD config',
    list: 'To see LMD packages list',
    build: 'To build LMD package'/*,
    watch: 'To start LMD package watcher',
    info: 'To see LMD package(s) list and info',
    unwatch: 'To stop LMD package watcher',
    server: 'To start LMD stats server'*/
};

function printHelp(errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd <action> <argument> <param1> <param2> ...',
        '',

        'Actions:'.bold.white.underline,
        ''
    ];

    var actions_help = Object.keys(allowedActions).reduce(function (result, action) {
        return result.concat([allowedActions[action].cyan, '  lmd ' + action, '']);
    }, []);

    help = help.concat(actions_help);

    cli.help(help, errorMessage);
}

if (!allowedActions.hasOwnProperty(action)) {
    if (process.argv.length >= 4) {
        require('./lmd_actions/old.js')(process.argv);
    } else {
        printHelp();
    }
} else {
    require('./lmd_actions/' + action + '.js')(process.argv);
}