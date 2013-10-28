/**
 * LMD
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */
var path = require('path');

// Supress path.existsSync is now called `fs.existsSync`.
path.existsSync = require('fs').existsSync;
path.exists = require('fs').exists;

var fs = require('fs'),
    cli = require(__dirname + '/cli_messages.js'),
    actions = require(__dirname + '/lmd_actions.js');

require('colors');

var allowedActions = actions.actions;
var actionsAliases = actions.aliases;

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

    if (argv.length === 3 && (options.v || options.version)) {
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
if (!module.parent || (module.parent && module.parent.filename.match(/\/lmd\/bin\/lmd$|\\lmd\\bin\\lmd$/))) {
    init(process.stdout, process.argv, process.cwd());
}