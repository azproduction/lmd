var Backbone = require('backbone'),
    _ = require('_');

module.exports = Backbone.View.extend({
    tagName: "li",
    className: "b-list__item",

    template: _.template('<%= name %> the <%= job %>'),
    initialize: function() {
        this.listenTo(this.model, "change", this.render);
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});
