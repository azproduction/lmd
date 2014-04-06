console.log('[OK] main module executed');

function renderButton(text) {
    return require.bundle('bundle-button').pipe(function () {
        return require('buttonView')(text);
    });
}

function renderTextarea() {
    return require.bundle('bundle-textarea').pipe(function () {
        return require('textareaView')();
    });
}

renderButton('Create textarea!')
.then(function (html) {
    var $body = $('body'),
        $el = $(html);

    $el.click(function () {
        renderTextarea().then(function (html) {
            $(html).appendTo('body');
        });
    });

    $body.html($el);
});

require.bundle('/undefined.js').then($.noop, function () {
    console.log('[OK] undefined-bundle is failed to load');
});

