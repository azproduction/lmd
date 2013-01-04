/**
 * LMD cache example
 */

// sha512 is 3-party module adopted for LMD
var sha512 = require("sha512");

$(function () {
    var $button = $('.b-button'),
        $result = $('.b-result'),
        $input = $('.b-input');

    function calculateSha512() {
        $result.val(sha512($input.val()));
    }

    $button.click(calculateSha512);
});