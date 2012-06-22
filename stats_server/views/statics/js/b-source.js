$(function () {
    var $source = $('.b-source'),
        $oldTarget = $();

    $(window).on("hashchange", function () {
        if ($oldTarget.length) {
            $oldTarget.removeClass('b-source__line_focused_yes');
        }

        var hash = window.location.hash;
        if (hash && hash.length > 2) {
            hash = hash.charAt(0) === '#' ? hash : '#' + hash;
            $oldTarget = $source.find(hash);
            $oldTarget.addClass('b-source__line_focused_yes');
        }
    }).trigger("hashchange");

    $source.on('click', '.b-source__line__item_type_line', function () {
        window.location.hash = '#L' + $(this).text();
    });
});
