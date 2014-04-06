var DS = require('ds');

module.exports = DS.Model.extend({
    title: DS.attr('string'),
    isCompleted: DS.attr('boolean')
});
