var definitions = [];

function init(root) {
    for (var i = 0, c = definitions.length, definition; i < c; i++) {
        definition = definitions[i];

        $(root || document).find(definition.selector).each(function () {
            var $el = $(this);
            if ($el.data('instance')) {
                return;
            }
            $el.data('instance', new definition.Constructor($el));
        });
    }
}

function define(selector, Constructor) {
    definitions.push({
        selector: selector,
        Constructor: Constructor
    });
}

function defineAll() {
    var modules = require.match(/^components\/([^\/]+)$/);

    for (var moduleName in modules) {
        define(moduleName.replace('components/', '.'),  modules[moduleName]);
    }
}

exports.init = init;
exports.define = define;
exports.defineAll = defineAll;
