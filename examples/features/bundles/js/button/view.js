var template = require('buttonTemplate');

module.exports = function (text) {
    return template.replace('$1', text);
};
