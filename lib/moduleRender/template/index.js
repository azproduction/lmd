var template = require('lodash-template'),
    fs = require('fs');

module.exports = function (templateName) {
    var content = fs.readFileSync('./' + templateName + '.tpl');

    return template(content);
};
