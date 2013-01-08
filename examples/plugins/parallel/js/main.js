/**
 * LMD require.async()+"parallel" example
 */

$(function () {
    var $button = $('.b-button'),
        $result = $('.b-result'),
        $input = $('.b-input');

    function calculateSha512ofMd5(sha512, md5) {
        $result.val(sha512(md5($input.val())));
    }

    $button.click(function () {
        // using shortcuts
        // sha512 -> /js/sha512.js | LMD module
        // md5    -> /js/md5.js    | CommonJS Module (plain)
        // LMD will figure out type of each module using `async_plain`
        require.async(["sha512", "md5"], calculateSha512ofMd5);
    });
});
