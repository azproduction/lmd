var Ember = require('ember');
var DS = require('ds');

var Todos = Ember.Application.create({
    Resolver: require('resolver')
});

Todos.ApplicationAdapter = DS.LSAdapter.extend({
	namespace: 'todos-emberjs'
});

// Activate router
Todos.Router.map(require('router'));

// Activate helpers
var helpers = require.match(/_helper$/);
Object.keys(helpers).forEach(function (moduleName) {
    var helper = moduleName.replace(/_helper$/, '');
    Ember.Handlebars.helper(helper, helpers[moduleName]);
});

window.Todos = Todos;
