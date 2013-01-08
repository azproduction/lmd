/**
 * LMD require.stats()+"stats_coverage" example
 */

var sha512 = require('sha512');

function decorateInputs() {
    return require.css('css/b-input.css');
}

$(function () {
    var $button = $('.b-button'),
        $result = $('.b-result'),
        $input = $('.b-input');

    function calculateSha512OfMd5() {
        var md5 = require('md5');
        var value = $input.val();
        $result.val(sha512(md5(value)));
        decorateInputs();
    }

    $button.click(calculateSha512OfMd5);

    require('statsLogger');
});
