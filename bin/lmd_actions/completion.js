var fs = require('fs'),
    path = require('path');

function dumpScript() {
    console.log(fs.readFileSync(path.join(__dirname, '..', 'lmd_completion.sh'), 'utf8'));
}

module.exports = function (cli, argv, cwd) {

    if (typeof process.env.COMP_CWORD === "undefined" ||
        typeof process.env.COMP_LINE === "undefined" ||
        typeof process.env.COMP_POINT === "undefined" ||
        argv.length === 1 && argv[0] === "completion" ) {

        return dumpScript();
    }

    var index = --process.env.COMP_CWORD,
        args = argv.slice(3),
        action = args[0];

    var actions = require(path.join(__dirname, '..', 'lmd_actions.js'));

    if (index === 0) {
        cli.log(Object.keys(actions.actions).join('\n'));
    } else if (args[0] !== "completion") {
        var module = require(path.join(__dirname , actions.aliases[action] + '.js'));

        if (typeof module.completion === "function") {
            module.completion(cli, argv, cwd, {
                index: index,
                args: args,
                action: action,
                word: args[index]
            });
        }
    }
};
