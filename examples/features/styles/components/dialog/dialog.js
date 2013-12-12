var template = require('components/dialog/template');

function Dialog($content) {
    this.$el = $(template).hide();
    this.$content = this.$el.find('*:contains("{content}")');

    this.$content.html($content);

    this.$el.appendTo('body');
}

Dialog.prototype.show = function () {
    var self = this;
    var dfd = $.Deferred();

    this.$content.one('click', function () {
        dfd.resolve();
        self.hide();
    });
    this.$el.fadeIn();

    return dfd.promise();
};

Dialog.prototype.hide = function () {
    this.$el.fadeOut();
};

module.exports = Dialog;
