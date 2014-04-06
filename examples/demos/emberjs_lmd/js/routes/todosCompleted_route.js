var Ember = require('ember');

module.exports = Ember.Route.extend({
    setupController: function () {
        var todos = this.store.filter('todo', function (todo) {
            return todo.get('isCompleted');
        });

        this.controllerFor('todos').set('filteredTodos', todos);
    }
});
