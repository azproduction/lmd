/**
 * LMD require.preload() example
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
        // js/md5.js               | CommonJS Module (plain)
        // LMD will figure out type of each module using `preload_plain`
        require.preload(["sha512", "js/md5.js"], function (sha512, md5) {
            sha512 = require(sha512);
            md5 = require(md5);

            calculateSha512ofMd5(sha512, md5);
        });
    });
});
