require('colors');

var fs = require('fs'),
    path = require('path'),
    cli = require(__dirname + '/../cli_messages.js'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js'),
    common = require(__dirname + '/../../lib/lmd_common.js'),
    LmdStatsServer = require(__dirname + '/../../stats_server/index.js'),
    assembleLmdConfig = common.assembleLmdConfig,
    flagToOptionNameMap = common.LMD_PLUGINS;

var optimist = require('optimist')
    .alias('address', 'a')
    .default('address', '0.0.0.0')
    .describe('address', 'Client stats server address. Log receiver')

    .alias('port', 'p')
    .default('port', '8081')
    .describe('port', 'Client stats server port')

    .alias('admin-address', 'aa')
    .describe('admin-address', 'Admin interface server address. Default same as `port`')

    .alias('admin-port', 'ap')
    .describe('admin-port', 'Admin interface server port. Default same as `address`')
    ;

function printHelp(cli, errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd server ' + '<build_name>'.blue + ' [' + '<options>'.yellow + ']',
        '',

        'Example:'.bold.white.underline,
        '',

        '  lmd server ' + 'development'.blue,
        '  lmd server ' + 'development'.blue + ' --a localhost --p 8080'.yellow,
        ''
    ];

    var options = optimist.help().split('\n');
    options.unshift(options[0].bold.white.underline);
    options[1] = '';

    help = help.concat(options);

    cli.help(help, errorMessage);
}

function ensureDirExists(path) {
    if (fs.existsSync(path)) {
        if (!fs.statSync(path).isDirectory()) {
            printHelp('Required directory is file ' + path);
            return false;
        }
    } else {
        fs.mkdirSync(path);
    }

    return true;
}

module.exports = function (cli, argv, cwd) {
    argv = optimist.parse(argv);

    var status,
        buildName = argv._[1];

    if (!init.check(cli, cwd)) {
        return;
    }

    if (!buildName) {
        printHelp(cli);
        return;
    }

    status = create.checkFile(cwd, buildName);

    if (status !== true) {
        if (status !== false) {
            printHelp(cli, status);
        } else if (buildName.indexOf('+') !== -1) {
            // Warn if mixins
            printHelp(cli, 'mixins `' + buildName + '` are not allowed with server action');
        } else {
            printHelp(cli, 'build `' + buildName + '` is not exists');
        }
        return;
    }

    var lmdFile =  path.join(cwd, '.lmd', buildName + '.lmd.json');

    var config = assembleLmdConfig(lmdFile, Object.keys(flagToOptionNameMap)),
        logsDir = path.join(cwd, '.lmd/logs'),
        currentLogDir = path.join(logsDir, buildName),
        wwwDir = path.join(cwd, '.lmd', config.www_root);

    if (!config.www_root) {
        printHelp(cli, "Build configured without required parameter `www_root`");
        return;
    }

    if (!config.stats) {
        printHelp(cli, "Build configured without `stats` flag");
        return;
    }

    if (!ensureDirExists(logsDir)) {
        return;
    }

    if (!ensureDirExists(currentLogDir)) {
        return;
    }

    new LmdStatsServer({
        address: argv.address,
        port: +argv.port,
        'admin-address': argv['admin-address'] || argv.address,
        'admin-port': +(argv['admin-address'] || argv.port),
        config: lmdFile,
        log: currentLogDir,
        www: wwwDir
    });

};