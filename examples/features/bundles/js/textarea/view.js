var template = require('textareaTemplate'),
    i18n = require('textareaI18n');

var id = 0;

module.exports = function () {
    return template.replace('$1', i18n.placeholder + ' (' + (++id) + ')');
};
