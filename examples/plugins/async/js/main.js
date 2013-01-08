/**
 * LMD require.async() example
 */

$(function () {
    var $button = $('.b-button'),
        $result = $('.b-result'),
        $input = $('.b-input');

    function calculateSha512(sha512) {
        $result.val(sha512($input.val()));
    }

    $button.click(function () {
        // using shortcuts
        // sha512 -> js/sha512.js
        require.async("sha512", calculateSha512);
    });
});