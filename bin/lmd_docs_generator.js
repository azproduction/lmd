var fs = require('fs'),
    path = require('path'),
    common = require(__dirname + '/../lib/lmd_common.js');

/**
 *
 * @see https://gist.github.com/3713940
 *
 * @param code
 * @param [_blocks]
 * @param [_expressions]
 *
 * @return {Array}
 */
function parseJsdoc(code, _blocks, _expressions) {
    _blocks = [];
    // Find JSDoc blocks
    code.replace(/\/\*\*[\s\S]+?\*\//g, function (block) {
        _expressions = {};
        // Find @-expressions in each block
        block.replace(/@\S+[^@]+/g, function (expression) {
            expression = expression.replace(/\s*\*\/|\s+\*\s+/g, ' ').replace(/\s+$/, '').match(/@(\S+)\s+([\s\S]+)/);
            if (!expression) {
                return;
            }
            _expressions[expression[1]] = _expressions[expression[1]] || [];
            _expressions[expression[1]].push(expression[2].replace(/\s+\*$/g, ''));
        });
        _blocks.push(_expressions);
    });
    return _blocks;
}

var LMD_JS_SRC_PATH = common.LMD_JS_SRC_PATH;

var LMD_PLUGINS = common.LMD_PLUGINS;

var pluginsRequireList = {},
    pluginsCode = '';

// Collect plugins code
for (var flagName in LMD_PLUGINS) {
    var plugins = LMD_PLUGINS[flagName].require;

    if (typeof plugins !== "undefined") {
        if (typeof plugins === "string") {
            plugins = [plugins];
        }

        plugins.forEach(function (pluginName) {
            // require once
            if (!pluginsRequireList[pluginName]) {
                pluginsCode += fs.readFileSync(path.join(LMD_JS_SRC_PATH, 'plugin', pluginName), 'utf8') + "\n\n";
                pluginsRequireList[pluginName] = true;
            }
        });
    }
}

parseJsdoc(pluginsCode)
    .filter(function(element) {
        return typeof element.event !== "undefined";
    })
    .sort(function (a, b) {
        if (a.event[0] === b.event[0]) {
            return 0;
        }

        return a.event[0] > b.event[0] ? 1 : -1;
    })
    .forEach(function (element) {
        var eventName = element.event[0].split(' '),
            eventParams = [],
            returnsContext = element.retuns || element.return;

        eventName[0] = "#### " + eventName[0] + "\n\n";
        eventName = eventName.join(' ');
        if (element.param) {
            element.param.forEach(function (param, index) {
                eventParams.push('  * ' + param.replace(/\{/g, '`{').replace(/\}/g, '}`'));
            });
        }
        eventParams = eventParams.length ? eventParams.join('\n') : 'no';
        returnsContext = returnsContext ? returnsContext : 'no';

        console.log(eventName);
        console.log();
        console.log(eventParams);
        console.log();
        console.log('_Listener returns context:_ ' + returnsContext);
        console.log();
    });