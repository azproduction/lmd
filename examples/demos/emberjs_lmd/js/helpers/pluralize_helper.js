var Ember = require('ember');

module.exports = function (singular, count) {
    /* From Ember-Data */
    var inflector = Ember.Inflector.inflector;

    return count === 1 ? singular : inflector.pluralize(singular);
};
