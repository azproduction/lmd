require('colors');

var fs = require('fs'),
    path = require('path'),
    init = require(__dirname + '/init.js'),
    create = require(__dirname + '/create.js'),
    common = require(__dirname + '/../../lib/lmd_common.js'),
    assembleLmdConfig = common.assembleLmdConfig,
    flagToOptionNameMap = common.LMD_PLUGINS;

var optimist = require('optimist')
    .alias('sort', 'order-by')
    .describe('sort', 'Sorts modules by that row')
    .default('sort', 'undefined')

    .describe('deep', 'Prints deep module analytics')
    .boolean('deep')
    .default('deep', true)
    ;

var YES = '✔'.green,
    NO = '✘'.red,
    NO_YES = [NO, YES];

function printHelp(cli, errorMessage) {
    var help = [
        'Usage:'.bold.white.underline,
        '',

        '  lmd info ' + '<build_name>'.blue + '[' + '+<mixin>...+<mixin>'.cyan + ']' + ' [' + '<flags>'.green + ']' + ' [' + '<options>'.yellow + ']',
        '',

        'Example:'.bold.white.underline,
        '',

        '  lmd info ' + 'development'.blue,
        '  lmd info ' + 'development'.blue + ' --sort=coverage'.yellow,
        '  lmd info ' + 'development'.blue + '+corp'.cyan,
        '  lmd info ' + 'development'.blue + '+en+corp'.cyan,
        '  lmd info ' + 'development'.blue + '+sourcemap'.cyan,
        '  lmd info ' + 'development'.blue + '+sourcemap'.cyan + ' --no-pack --async --js --css'.green,
        '  lmd info ' + 'development'.blue + ' --modules.name=path.js'.green,
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

function printModules(cli, config, deepModulesInfo, sortColumnName) {
    var modules = config.modules || {};

    var modulesNames = Object.keys(modules);

    if (!modulesNames.length) {
        return;
    }

    cli.ok(('Modules (' + modulesNames.length + ')').white.bold.underline);
    cli.ok('');

    var headers = ['name', 'depends', 'type', 'lazy', 'greedy', 'coverage', 'sandbox'];

    var columnLengths = headers.map(function (item) {
        return item.length;
    });

    var moduleRows = modulesNames.map(function (moduleName) {
        var module = modules[moduleName],
            moduleExtra = deepModulesInfo[moduleName];

        if (moduleName.length > columnLengths[0]) {
            columnLengths[0] = moduleName.length;
        }

        if (module.depends && module.depends.length > columnLengths[1]) {
            columnLengths[1] = module.depends.length;
        }

        if (moduleExtra.type && moduleExtra.type.length > columnLengths[2]) {
            columnLengths[2] = moduleExtra.type.length;
        }

        return [
            moduleName,
            module.depends ? module.depends : false,
            moduleExtra.type,
            !!module.is_lazy,
            !!module.is_greedy,
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
        var rowString = '',
            isError = false;

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

            // type=not-found
            if (index === 2 && item === "not-exists") {
                item = item.red;
                isError = true;
            } else if (index) {
                item = printValue(item);
            }

            rowString += item + (maxColumnLength > length ? new Array(maxColumnLength - length).join(' ') : '  ');
        });

        if (isError) {
            cli.error(rowString);
        } else {
            cli.ok(rowString);
        }
    });

    cli.ok('');
}

function printFlags(cli, config, availableFlags) {
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
            printValue(value) +
            (config.plugins_depends[flag] ? ' (depend of ' + config.plugins_depends[flag].join(', ').cyan + ')' : '')
        );
    });

    cli.ok('');
}

function printModulePathsAndDepends(cli, config, deepModulesInfo, isDeepAnalytics) {
    var modules = config.modules || {},
        modulesNames = Object.keys(modules),
        globalsNames = common.getGlobals(config);

    if (!modulesNames.length) {
        return;
    }

    cli.ok('Module Paths, Depends and Features'.white.bold.underline);
    cli.ok('');

    var longestName = modulesNames.reduce(function (max, name) {
        return max < name.length ? name.length : max;
    }, 0);

    modulesNames.forEach(function (name) {
        var moduleInfo = name.cyan + new Array(longestName - name.length + 2).join(' ') + ' <- ';

        if (modules[name].is_exists) {
            moduleInfo += modules[name].path.green;
            cli.ok(moduleInfo);
        } else {
            moduleInfo += modules[name].path.red + ' (not exists)';
            cli.error(moduleInfo);
        }
        if (!isDeepAnalytics) {
            return;
        }
        var depends = deepModulesInfo[name].depends;
        if (depends.length) {
            depends.forEach(function (name) {
                var moduleType = common.discoverModuleType(name, modulesNames, globalsNames);
                switch (moduleType) {
                    case 'in-package':
                        cli.ok(' +-' + name.toString().cyan);
                        break;
                    case 'global':
                        cli.ok(' +-' + name.toString().cyan + ' (' + moduleType + ')');
                        break;
                    default:
                        cli.ok(' +-' + name.toString().yellow + ' (' + moduleType + ')');
                }
            });

            cli.ok('');
        }
        var features = Object.keys(deepModulesInfo[name].features);
        if (features.length) {
            cli.ok('  ' + 'Uses'.green + ': ' + features.join(', '));
            cli.ok('');
        }
    });

    cli.ok('');
}

module.exports = function (cli, argv, cwd) {
    argv = optimist.parse(argv);

    var buildName,
        status,
        mixinBuilds = argv._[1],
        sortOrder = argv.sort,
        isDeepAnalytics = argv.deep;

    if (mixinBuilds) {
        mixinBuilds = mixinBuilds.split('+');

        buildName = mixinBuilds.shift();
    }

    // Clear CLI options
    delete argv.sort;
    delete argv.deep;
    delete argv['order-by'];
    delete argv._;
    delete argv.$0;

    if (!init.check(cli, cwd)) {
        return;
    }

    if (!buildName) {
        printHelp(cli);
        return;
    }

    status = create.checkFile(cwd, buildName);

    if (status !== true) {
        printHelp(cli, status === false ? 'build `' + buildName + '` is not exists' : status);
        return;
    }

    // Check mixins
    if (mixinBuilds.length) {
        var isCanContinue = mixinBuilds.every(function (buildName) {
            status = create.checkFile(cwd, buildName);

            if (status !== true) {
                printHelp(cli, status === false ? 'mixin build `' + buildName + '` is not exists' : status);
                return false;
            }
            return true;
        });

        if (!isCanContinue) {
            return;
        }
    }

    mixinBuilds = mixinBuilds.map(function (build) {
        return './' + build + '.lmd.json';
    });

    if (mixinBuilds.length) {
        argv.mixins = mixinBuilds;
    }

    var lmdFile = path.join(cwd, '.lmd', buildName + '.lmd.json');

    var rawConfig = common.readConfig(lmdFile),
        flags = Object.keys(flagToOptionNameMap),
        extraFlags = ["warn", "log", "pack", "lazy"],
        config = assembleLmdConfig(lmdFile, flags, argv),
        root = fs.realpathSync(cwd + '/.lmd/' + config.root),
        output = config.output ? path.join(root, config.output) : 'STDOUT'.yellow,
        sourcemap = config.sourcemap ? fs.realpathSync(root + '/' + config.sourcemap) : false,
        www = config.www_root ? fs.realpathSync(cwd + '/.lmd/' + config.www_root + '/') : false;

    cli.ok('');
    cli.ok('LMD Package `' + buildName.green + '` (' + ('.lmd/' + buildName + '.lmd.json').green + ')');
    cli.ok('');

    if (rawConfig.extends) {
        cli.ok('Extends LMD Package `' + (rawConfig.extends + '').green + '`');
        cli.ok('');
    }

    if (rawConfig.mixins) {
        cli.ok('Mixins LMD Package `' + (rawConfig.mixins + '').green + '`');
        cli.ok('');
    }

    var deepModulesInfo = common.collectModulesInfo(config);
    printModules(cli, config, deepModulesInfo, sortOrder);
    printModulePathsAndDepends(cli, config, deepModulesInfo, isDeepAnalytics);
    printFlags(cli, config, flags.concat(extraFlags));

    cli.ok('Paths'.white.bold.underline);
    cli.ok('');
    cli.ok('root'.cyan + '      ' + printValue(root));
    cli.ok('output'.cyan + '    ' + printValue(output));
    cli.ok('www_root'.cyan + '  ' + printValue(www));

    if (sourcemap) {
        cli.ok('');
        cli.ok('Source Map'.white.bold.underline);
        cli.ok('');

        cli.ok('sourcemap'.cyan + '         ' + printValue(sourcemap));
        cli.ok('sourcemap_www'.cyan + '     ' + printValue(config.sourcemap_www || '/'));
        cli.ok('sourcemap_inline'.cyan + '  ' + printValue(config.sourcemap_inline));
    }

    var errors = config.errors;

    // pipe warnings
    for (var noduleName in deepModulesInfo) {
        deepModulesInfo[noduleName].warns.forEach(function (warning) {
            errors.push(warning);
        });
    }

    errors = errors.concat(common.collectFlagsWarnings(config, deepModulesInfo));

    if (errors && errors.length) {
        cli.warn('');
        cli.warn('Warnings'.red.bold.underline);
        cli.warn('');
        errors.forEach(function (error) {
            cli.warn(error);
        });
    }

    common.collectFlagsNotifications(config).forEach(function (notification) {
        cli.ok(notification);
    });

    cli.ok('');
};