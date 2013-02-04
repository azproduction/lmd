var Backbone = require('backbone'),
    ListItemModel = require('listItemModel');

module.exports = Backbone.Collection.extend({
    model: ListItemModel
});
