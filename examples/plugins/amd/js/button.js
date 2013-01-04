define('ignored-module-name', ['$'], function ($) {

    function Button(text) {
        return $('<button/>').text(text);
    }

    return Button;
});
