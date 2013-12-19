require('colors');

var LogWriter = function (stream) {
    this.stream = stream;
};

LogWriter.prototype.log = function (message) {
    this.stream.write(message + '\n');
};

LogWriter.prototype.ok = function (message) {
    this.log('info'.green + ':    ' + message);
};

LogWriter.prototype.warn = function (message) {
    this.log('warn'.yellow + ':    ' + message);
};

LogWriter.prototype.error = function (message) {
    this.log('ERRO'.red.inverse + ':    ' + message);
};

LogWriter.prototype.help = function (content, errorMessage) {
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

    this.log(help);
};

exports.LogWriter = LogWriter;
