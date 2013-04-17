var template = require('lodash-template'),
    fs = require('fs');

module.exports = function (templateName) {
    var content = fs.readFileSync(__dirname + '/' + templateName + '.tpl', 'utf8');

    return template(content);
};
