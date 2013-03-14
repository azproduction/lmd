require('colors');

var fs = require('fs'),
    path = require('path'),
    cli = require(__dirname + '/../cli_messages.js'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js'),
    info = require(__dirname + '/info.js'),
    common = require(__dirname + '/../../lib/lmd_common.js'),
    resolveName = common.getModuleFileByShortName,
    LmdStatsServer = require(__dirname + '/../../stats_server/index.js'),
    assembleLmdConfig = common.assembleLmdConfig,
    flagToOptionNameMap = common.LMD_PLUGINS;

var options = {
    'address': {
        'describe': 'Client stats server address. Log receiver',
        'alias': 'a',
        'default': '0.0.0.0'
    },
    'port': {
        'describe': 'Client stats server port',
        'alias': 'p',
        'default': '8081'
    },
    'admin-address': {
        'describe': 'Admin interface server address. Default same as `address`',
        'alias': 'aa'
    },
    'admin-port': {
        'describe': 'Admin interface server port. Default same as `port`',
        'alias': 'ap'
    }
};

var optimist = require('optimist');

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
    for (var optionName in options) {
        optimist.options(optionName, options[optionName]);
    }
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
    var lmdDir = path.join(cwd, '.lmd'),
        buildFile = resolveName(lmdDir, buildName),
        lmdFile = path.join(lmdDir, buildFile);

    var config = assembleLmdConfig(lmdFile, Object.keys(flagToOptionNameMap)),
        logsDir = path.join(cwd, '.lmd', 'logs'),
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

module.exports.completion = function (cli, argv, cwd, completionOptions) {
    // module name completion
    if (completionOptions.index === 1) {
        var builds = info.getBuilds(cwd);

        return cli.log(builds.join('\n'));
    }

    // <flags> & <options>
    if (completionOptions.index > 1) {
        var flagsOptions = info.getCompletionOptions(options);

        return cli.log(flagsOptions.join('\n'));
    }
};