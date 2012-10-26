require('colors');

var fs = require('fs'),
    cli = require(__dirname + '/../cli_messages.js'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js'),
    common = require(__dirname + '/../../lib/lmd_common.js'),
    LmdStatsServer = require(__dirname + '/../../stats_server/index.js'),
    assembleLmdConfig = common.assembleLmdConfig,
    flagToOptionNameMap = JSON.parse(fs.readFileSync(__dirname + '/../../src/lmd_plugins.json'));

var optimist = require('optimist')
    .alias('sort', 'order-by')
    .describe('sort', 'Sorts modules by that row')
    .default('sort', 'undefined')
    ;

var YES = '✔'.green,
    NO = '✘'.red,
    NO_YES = [NO, YES];

function printHelp(errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd info ' + '<build_name>'.blue,
        '',

        'Example:'.bold.white.underline,
        '',

        '  lmd info ' + 'development'.blue,
        ''
    ];

    var options = optimist.help().split('\n');
    options.unshift(options[0].bold.white.underline);
    options[1] = '';

    help = help.concat(options);

    cli.help(help, errorMessage);
}

function printValue(value) {
    switch (typeof value) {
        case "boolean":
        case "undefined":
            return NO_YES[+!!value];

        case "string":
            return value.green;

        case "object":
            return JSON.stringify(value, null, '    ').split('\n')
                .map(function (line, index) {
                    return '\n' + 'info'.green + ':    ' + line;
                }).join('');

        case "function":
            return 'Function'.blue;
    }

    return value;
}

function printModules(modules, sortColumnName) {
    modules = modules || {};

    var modulesNames = Object.keys(modules);

    if (!modulesNames.length) {
        return;
    }

    cli.ok(('Modules (' + modulesNames.length + ')').white.bold.underline);
    cli.ok('');

    var headers = ['name', 'depends', '3-party', 'x-exports', 'x-require', 'lazy', 'greedy', 'shortcut', 'coverage', 'sandbox'];

    var columnLengths = headers.map(function (item) {
        return item.length;
    });

    var moduleRows = modulesNames.map(function (moduleName) {
        var module = modules[moduleName];

        if (moduleName.length > columnLengths[0]) {
            columnLengths[0] = moduleName.length;
        }

        if (module.depends && module.depends.length > columnLengths[1]) {
            columnLengths[1] = module.depends.length;
        }

        return [
            moduleName,
            module.depends ? module.depends : false,
            !!module.is_third_party,
            !!module.extra_exports,
            !!module.extra_require,
            !!module.is_lazy,
            !!module.is_greedy,
            !!module.is_shortcut,
            !!module.is_coverage,
            !!module.is_sandbox
        ];
    });

    var sortColumnIndex = headers.indexOf(sortColumnName);

    if (sortColumnIndex != -1) {
        moduleRows = moduleRows.sort(function (a, b) {
            if (a[sortColumnIndex] > b[sortColumnIndex]) {
                return 1;
            }

            if (a[sortColumnIndex] < b[sortColumnIndex]) {
                return -1;
            }

            return 0;
        });
    }

    moduleRows.unshift(headers);

    moduleRows.forEach(function (row, rowIndex) {
        var rowString = '';

        row.forEach(function (item, index) {
            var length = item.length || 1,
                maxColumnLength = columnLengths[index] + 2;

            //item = typeof item === "boolean" ? NO_YES[+item] : item;

            if (!rowIndex) {
                item = item.white.bold.underline;
            }

            if (!index && rowIndex) {
                item = item.cyan;
            }

            if (index) {
                item = printValue(item);
            }

            rowString += item + (maxColumnLength > length ? new Array(maxColumnLength - length).join(' ') : '  ');
        });

        cli.ok(rowString);
    });

    cli.ok('');
}

function printFlags(config, availableFlags) {
    var longestName = availableFlags.reduce(function (max, current) {
        if (typeof config[current] === "undefined") {
            return max;
        }
        return current.length > max ? current.length : max;
    }, 0);

    if (!longestName) {
        return;
    }

    longestName += 3;

    cli.ok('Flags'.white.bold.underline);
    cli.ok('');

    availableFlags.forEach(function (flag) {
        var value = config[flag];
        if (typeof value === "undefined") {
            return;
        }

        cli.ok(
            flag.cyan +
            (longestName > flag.length ? new Array(longestName - flag.length).join(' ') : '  ') +
            printValue(value)
        );
    });

    cli.ok('');
}

module.exports = function () {
    var cwd = process.cwd(),
        status;

    var argv = optimist.argv,
        buildName = argv._[1];

    if (!init.check()) {
        return;
    }

    if (!buildName) {
        printHelp();
        return;
    }

    status = create.checkFile(cwd, buildName);

    if (status !== true) {
        printHelp(status === false ? 'build `' + buildName + '` is not exists' : status);
        return;
    }

    var lmdFile =  cwd + '/.lmd/' + buildName + '.lmd.json';

    var rawConfig = JSON.parse(fs.readFileSync(lmdFile)),
        flags = Object.keys(flagToOptionNameMap),
        extraFlags = ["warn", "log", "pack", "lazy"],
        config = assembleLmdConfig(lmdFile, flags),
        root = fs.realpathSync(cwd + '/.lmd/' + config.root),
        output = config.output ? fs.realpathSync(root + '/' + config.output) : false,
        sourcemap = config.sourcemap ? fs.realpathSync(root + '/' + config.sourcemap) : false,
        www = config.www_root ? fs.realpathSync(cwd + '/.lmd/' + config.www_root + '/') : false;

    cli.ok('');
    cli.ok('LMD Package `' + buildName.green + '` (' + ('.lmd/' + buildName + '.lmd.json').green + ')');
    cli.ok('');

    if (rawConfig.extends) {
        cli.ok('Extends LMD Package `' + rawConfig.extends.green + '`');
        cli.ok('');
    }

    printModules(config.modules, argv.sort);
    printFlags(config, flags.concat(extraFlags));

    cli.ok('Paths'.white.bold.underline);
    cli.ok('');
    cli.ok('Root path'.cyan + '    ' + printValue(root));
    cli.ok('Result file'.cyan + '  ' + printValue(output));
    cli.ok('Www root'.cyan + '     ' + printValue(www));

    if (sourcemap) {
        cli.ok('');
        cli.ok('Source Map'.white.bold.underline);
        cli.ok('');

        cli.ok('Result Source Map'.cyan + '  ' + printValue(sourcemap));
        cli.ok('Source Map www'.cyan + '     ' + printValue(config.sourcemap_www || '/'));
        cli.ok('Is inline'.cyan + '          ' + printValue(config.sourcemap_inline));
    }

    cli.ok('');
};