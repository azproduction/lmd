define(['$', 'listItem'], function ($, ListItem) {

    function List() {
        var $list = $('<ul/>');

        $list.on('item', function (e, item) {
            new ListItem(item.value).appendTo($list);
        });

        return $list;
    }

    return List;
});