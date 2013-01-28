var $ = require('$'),
    _ = require('_'),
    backbone = require('backbone'),
    todos = require('todosCollection'),
    TodoView = require('todosView'),
    statsTemplate = require('statsTemplate'),
    common = require('common');

var AppView = backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: '#todoapp',

    // Compile our stats template
    template: _.template(statsTemplate),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
        'keypress #new-todo':		'createOnEnter',
        'click #clear-completed':	'clearCompleted',
        'click #toggle-all':		'toggleAllComplete'
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {
        this.input = this.$('#new-todo');
        this.allCheckbox = this.$('#toggle-all')[0];
        this.$footer = this.$('#footer');
        this.$main = this.$('#main');

        todos.on( 'add', this.addOne, this );
        todos.on( 'reset', this.addAll, this );
        todos.on( 'change:completed', this.filterOne, this );
        todos.on( "filter", this.filterAll, this);
        todos.on( 'all', this.render, this );

        todos.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
        var completed = todos.completed().length;
        var remaining = todos.remaining().length;

        if (todos.length) {
            this.$main.show();
            this.$footer.show();

            this.$footer.html(this.template({
                completed: completed,
                remaining: remaining
            }));

            this.$('#filters li a')
                .removeClass('selected')
                .filter( '[href="#/' + ( common.TodoFilter || '' ) + '"]' )
                .addClass('selected');
        } else {
            this.$main.hide();
            this.$footer.hide();
        }

        this.allCheckbox.checked = !remaining;
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function( todo ) {
        var view = new TodoView({ model: todo });
        $('#todo-list').append( view.render().el );
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
        this.$('#todo-list').html('');
        todos.each(this.addOne, this);
    },

    filterOne : function (todo) {
        todo.trigger("visible");
    },

    filterAll : function () {
        todos.each(this.filterOne, this);
    },

    // Generate the attributes for a new Todo item.
    newAttributes: function() {
        return {
            title: this.input.val().trim(),
            order: todos.nextOrder(),
            completed: false
        };
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter: function( e ) {
        if ( e.which !== common.ENTER_KEY || !this.input.val().trim() ) {
            return;
        }

        todos.create( this.newAttributes() );
        this.input.val('');
    },

    // Clear all completed todo items, destroying their models.
    clearCompleted: function() {
        _.each( todos.completed(), function( todo ) {
            todo.destroy();
        });

        return false;
    },

    toggleAllComplete: function() {
        var completed = this.allCheckbox.checked;

        todos.each(function( todo ) {
            todo.save({
                'completed': completed
            });
        });
    }
});

module.exports = AppView;
