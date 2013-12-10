var declarations = [];

function init(root) {
    for (var i = 0, c = declarations.length, declaration; i < c; i++) {
        declaration = declarations[i];

        $(root || document).find(declaration.selector).each(function () {
            var $el = $(this);
            if ($el.data('instance')) {
                return;
            }
            $el.data('instance', new declaration.Constructor($el));
        });
    }
}

function declare(selector, Constructor) {
    declarations.push({
        selector: selector,
        Constructor: Constructor
    });
}

function declareAll() {
    var modules = require.match(/components\/(.+)/);

    for (var moduleName in modules) {
        declare(moduleName.replace('components/', '.'),  modules[moduleName]);
    }
}

exports.init = init;
exports.declare = declare;
exports.declareAll = declareAll;
