/**
 * LMD require.async()+"promise" example
 */

function loadMd5() {
    // md5    -> /js/md5.js    | CommonJS Module (plain)
    return require.async('md5');
}

function loadSha512() {
    // sha512 -> /js/sha512.js | LMD module
    return require.async('sha512');
}

function decorateInputs() {
    return require.css('css/b-input.css');
}

$(function () {
    var $button = $('.b-button'),
        $result = $('.b-result'),
        $input = $('.b-input');

    function calculateSha512OfMd5() {
        var value = $input.val();
        loadSha512().then(function (sha512) {
            value = sha512(value);
            return loadMd5();
        })
        .then(function (md5) {
            value = md5(value);
            return decorateInputs();
        })
        .then(function () {
            $result.val(value);
        }, function () {
            console.log('Failed to load CSS!');
        });
    }

    $button.click(calculateSha512OfMd5);
});
