var Ember = require('ember');

module.exports = Ember.View.extend({
    focusInput: function () {
        this.$('#new-todo').focus();
    }.on('didInsertElement')
});
