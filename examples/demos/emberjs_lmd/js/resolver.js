var Ember = require('ember');

var TEMPLATES = Ember.TEMPLATES;

/**
 * @param {Object} parsedName
 * @param {String} parsedName.name
 * @param {String} parsedName.type
 */
function toModuleName(parsedName) {
    return parsedName.name + '_' + parsedName.type;
}

/**
 * @param {Object} parsedName
 * @param {String} parsedName.name
 * @param {String} parsedName.type
 */
function resolveDefault(parsedName) {
    return require(toModuleName(parsedName));
}

module.exports = Ember.DefaultResolver.extend({
    resolveRoute: resolveDefault,
    resolveModel: resolveDefault,
    resolveController: resolveDefault,

    /**
     * @param {Object} parsedName
     * @param {String} parsedName.name
     * @param {String} parsedName.type
     * @param {String} parsedName.fullNameWithoutType
     */
    resolveTemplate: function (parsedName) {
        var templateName = parsedName.fullNameWithoutType.replace(/\./g, '/'),
            templateString;

        if (!TEMPLATES[templateName]) {
            templateString = require(toModuleName(parsedName));
            if (typeof templateString === 'string') {
                TEMPLATES[templateName] = Ember.Handlebars.compile(templateString);
            }
        }

        return TEMPLATES[templateName];
    }
});
