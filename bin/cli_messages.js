exports.help = function (content, errorMessage) {
    var help = [
        '',
        'LMD Builder',
        ''
    ];

    help = help.concat(content);

    if (errorMessage) {
        help = help.concat([errorMessage.red, '']);
    }

    help = help.map(function (line) {
        return 'help'.cyan + ':    ' + line;
    }).join('\n');

    console.log(help);
};

exports.ok = function (message) {
    console.log('info'.green + ':    ' + message);
};