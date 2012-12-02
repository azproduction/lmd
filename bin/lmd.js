/**
 * LMD
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */

// Supress path.existsSync is now called `fs.existsSync`.
require('path').existsSync = require('fs').existsSync;

var fs = require('fs'),
    cli = require(__dirname + '/cli_messages.js');

require('colors');

var allowedActions = {
    init: 'Initializes LMD for project',
    create: 'To create new LMD config',
    update: 'Updates existed LMD config',
    list: 'To see LMD packages list',
    build: 'To build LMD package',
    watch: 'To start/stop LMD package watcher',
    server: 'To start/stop LMD stats server',
    info: 'To see LMD extended package/build info'
};

var actionsAliases = {
    'init': 'init',

    'create': 'create',
    'new': 'create',

    'update': 'update',
    'up': 'update',

    'list': 'list',
    'ls': 'list',

    'build': 'build',
    'make': 'build',

    'watch': 'watch',

    'server': 'server',
    'serv': 'server',
    'stats': 'server',

    'info': 'info',
    'dry': 'info',
    'dry-run': 'info'
};

function printHelp(cli, errorMessage) {
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

function init(stdout, argv, cwd) {
    var options = require('optimist').parse(argv),
        action = argv[2],
        logWriter = new cli.LogWriter(stdout);

    if (argv.length === 3 && options.v || options.version) {
        stdout.write(require(__dirname + '/../package.json').version + '\n');

    } else if (!actionsAliases.hasOwnProperty(action)) {
        if (argv.length >= 4) {
            require(__dirname + '/lmd_actions/old.js')(logWriter, argv.slice(2), cwd);
        } else {
            printHelp(logWriter);
        }

    } else {
        require(__dirname + '/lmd_actions/' + actionsAliases[action] + '.js')(logWriter, argv.slice(2), cwd);

    }
}
exports.init = init;

// if !main
if (!module.parent || (module.parent && module.parent.filename.match(/\/lmd\/bin\/lmd$/))) {
    init(process.stdout, process.argv, process.cwd());
}