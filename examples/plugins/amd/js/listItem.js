define(function (require, exports, module) {
    var $ = require('$');

    function ListItem(text) {
        var $listItem = $('<li/>').text(text);

        $listItem.click(function () {
            $(this).css('color', 'green');
        });

        return $listItem;
    }

    module.exports = ListItem;
});
