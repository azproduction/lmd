$(function () {
    $('.b-notes').find('.b-notes__more')
        .click(function () {
            $(this)
                .siblings('.b-notes__tags_type_more')
                .show()
                .end()
                .replaceWith(', ')
                ;

            return false;
        });
});
