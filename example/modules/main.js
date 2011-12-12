function main(require) {
    var depA = require('depA'),
        i18n = require('i18n');
    depA(i18n.hello + ' ololo');
}