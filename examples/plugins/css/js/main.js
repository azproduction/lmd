/**
 * LMD require.css() example
 */

$(function () {
    $('body').on('click', '.b-button', function () {
        var $button = $(this);
        $button.text('Loading...');

        require.css('css/b-button.css', function (status) {
            console.log(status ? 'css loaded or taken from cache' : 'Fail to load');
            $button.text('Click me');
            $('.b-button').first().clone().appendTo('body');
        });
    });
});