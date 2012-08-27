$(function () {
    var $el = $('.b-suggestions');
    $el.find('.js-suggestions-more').click(function () {
        $el.find('.i-hidden').removeClass('i-hidden');
        $(this).remove();
        return false;
    });
});