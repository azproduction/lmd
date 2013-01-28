var $ = require('$'),
    backbone = require('backbone'),
    todos = require('todosCollection'),
    common = require('common');

var Workspace = backbone.Router.extend({
    routes:{
        '*filter': 'setFilter'
    },

    setFilter: function( param ) {
        // Set the current filter to be used
        common.TodoFilter = param.trim() || '';

        // Trigger a collection filter event, causing hiding/unhiding
        // of the Todo view items
        todos.trigger('filter');
    }
});

module.exports = Workspace;
