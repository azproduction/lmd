var $ = require('$'), // == window.$
    Backbone = require('backbone'),
    _ = require('underscore'),
    musketeers = require('musketeers'), // file is adopted js/data/musketeers.js

    ListCollection = require('listCollection'),
    ListItemView = require('listItemView'),
    ListItemModel = require('listItemModel');

var items = new ListCollection();

_.each(musketeers, function (musketeer) {
    var item = new ListItemModel(musketeer),
        view = new ListItemView({model: item});

    items.add(item);

    view.render().$el.appendTo('.b-list');
});
