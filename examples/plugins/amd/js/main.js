define(['$', 'button', 'list'], function ($, Button, List) {

    $(function () {
        var $list = new List();
        var $button = new Button('Click me');

        $button.appendTo('body')
            .on('click', function () {
                $list.trigger('item', {
                    value: "Item with random value " + Math.random()
                });
            });

        $list.appendTo('body')
    });
});
