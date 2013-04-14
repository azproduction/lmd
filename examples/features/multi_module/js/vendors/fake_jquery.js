var jQuery = (function () {
    var jQuery = function () {
        if (this instanceof jQuery) {
            return;
        }
        return new jQuery();
    };

    jQuery.fn = jQuery.prototype;

    return jQuery;
})();
