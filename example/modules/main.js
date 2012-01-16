function main(require) {
    var print = require('depA'),
        i18n = require('i18n');

    print(i18n.hello +  ', lmd');
}