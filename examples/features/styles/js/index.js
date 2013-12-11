function loadDialog() {
    return $.when(require.css('@index.dialog.css'), require.bundle('@index.dialog.js')).pipe(function () {
        return require('components/dialog');
    });
}

$(function () {
    var declare = require('declare');
    declare.defineAll();
    declare.init(document);

    $(document).one('click', function () {
        loadDialog().pipe(function (Dialog) {
                return new Dialog('Click me to close.').show();
            })
            .pipe(function () {
                console.log('User has closed window');
            });
    });
});
