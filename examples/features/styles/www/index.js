// This file was automatically generated from "index.lmd.json" using mixins "textarea.lmd.json"
(function(global,main,modules,modules_options,options){var initialized_modules={},global_eval=function(code){return global.Function("return "+code)()},global_document=global.document,local_undefined,register_module=function(moduleName,module){var output={exports:{}};initialized_modules[moduleName]=1;modules[moduleName]=output.exports;if(!module){module=module||global[moduleName]}else if(typeof module==="function"){var module_require=lmd_require;if(modules_options[moduleName]&&modules_options[moduleName].sandbox&&typeof module_require==="function"){module_require=local_undefined}module=module(module_require,output.exports,output)||output.exports}module=module;return modules[moduleName]=module},lmd_require=function(moduleName){var module=modules[moduleName];var replacement=[moduleName,module];if(replacement){moduleName=replacement[0];module=replacement[1]}if(initialized_modules[moduleName]&&module){return module}if(typeof module==="string"&&module.indexOf("(function(")===0){module=global_eval(module)}return register_module(moduleName,module)},output={exports:{}};for(var moduleName in modules){initialized_modules[moduleName]=0}(function(){var inPackageModules=modules;lmd_require.match=function(regExp){if(!(regExp instanceof RegExp)){return null}var result={};for(var moduleName in inPackageModules){if(regExp.test(moduleName)){result[moduleName]=lmd_require(moduleName)}}return result}})();main(lmd_require,output.exports,output)})
(this,(function (require, exports, module) { /* wrapped by builder */
$(function () {
    var launch = require('launch');
    launch.declareAll();
    launch.init(document);
});

}),{
"components/button": (function (require, exports, module) { /* wrapped by builder */
function Button($el) {
    $el.on('mouseenter mouseleave', function (event) {
        $el.toggleClass('_state_hover', event.type === 'mouseenter');
    });
}

module.exports = Button;

}),
"launch": (function (require, exports, module) { /* wrapped by builder */
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

})
},{},{});
