// This file was automatically generated from "index.lmd.json"
(function(global,main,modules,modules_options,options){var initialized_modules={},global_eval=function(code){return global.Function("return "+code)()},global_document=global.document,local_undefined,register_module=function(moduleName,module){var output={exports:{}};initialized_modules[moduleName]=1;modules[moduleName]=output.exports;if(!module){module=module||global[moduleName]}else if(typeof module==="function"){var module_require=lmd_require;if(modules_options[moduleName]&&modules_options[moduleName].sandbox&&typeof module_require==="function"){module_require=local_undefined}module=module(module_require,output.exports,output)||output.exports}module=module;return modules[moduleName]=module},lmd_require=function(moduleName){var module=modules[moduleName];var replacement=[moduleName,module];if(replacement){moduleName=replacement[0];module=replacement[1]}if(initialized_modules[moduleName]&&module){return module}if(typeof module==="string"&&module.indexOf("(function(")===0){module=global_eval(module)}return register_module(moduleName,module)},output={exports:{}};for(var moduleName in modules){initialized_modules[moduleName]=0}main(lmd_require,output.exports,output)})
(this,(function (require, exports, module) { /* wrapped by builder */
var $ = require('jquery'),
    Backbone = require('backbone');

console.log($().plugin(), $().plugin2(), $.plugin3());
console.dir(Backbone);


}),{
"jquery": (function (require) { /* wrapped by builder */
var jQuery = (function () {
    var jQuery = function () {
        if (this instanceof jQuery) {
            return;
        }
        return new jQuery();
    };

    jQuery.fn = jQuery.prototype;

    return jQuery;
})();

/* joined by builder */
jQuery.plugin3 = function () {
    return 'plugin3';
};

/* joined by builder */
jQuery.fn.plugin = function () {
    return 'plugin';
};

/* joined by builder */
jQuery.fn.plugin2 = function () {
    return 'plugin2';
};


/* added by builder */
return jQuery;
}),
"backbone": (function (require, exports, module) { /* wrapped by builder */
var Backbone = {};

module.exports = Backbone;

/* joined by builder */
Backbone.Plugin1 = function () {
    return 'Plugin1';
};

/* joined by builder */
Backbone.Plugin2 = function () {
    return 'Plugin2';
};

})
},{},{});
