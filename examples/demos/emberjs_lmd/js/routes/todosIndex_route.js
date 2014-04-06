var Ember = require('ember');

module.exports = Ember.Route.extend({
    setupController: function () {
        this.controllerFor('todos').set('filteredTodos', this.modelFor('todos'));
    }
});
