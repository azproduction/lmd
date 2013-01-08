/**
 * LMD require.async()+"async_plainonly" example
 */

$(function () {
    var $button = $('.b-button'),
        $result = $('.b-result'),
        $input = $('.b-input');

    function calculateMd5(md5) {
        $result.val(md5($input.val()));
    }

    $button.click(function () {
        // using shortcuts
        // md5 -> js/md5.js
        require.async("md5", calculateMd5);
    });
});