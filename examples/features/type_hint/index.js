// This file was automatically generated from "index.lmd.json"
(function(global,main,modules,modules_options,options){var initialized_modules={},global_eval=function(code){return global.Function("return "+code)()},global_document=global.document,local_undefined,register_module=function(moduleName,module){var output={exports:{}};initialized_modules[moduleName]=1;modules[moduleName]=output.exports;if(!module){module=module||global[moduleName]}else if(typeof module==="function"){var module_require=lmd_trigger(2,moduleName,lmd_require)[1];if(modules_options[moduleName]&&modules_options[moduleName].sandbox&&typeof module_require==="function"){module_require=local_undefined}module=module(module_require,output.exports,output)||output.exports}module=lmd_trigger(3,moduleName,module)[1];return modules[moduleName]=module},lmd_events={},lmd_trigger=function(event,data,data2,data3){var list=lmd_events[event],result;if(list){for(var i=0,c=list.length;i<c;i++){result=list[i](data,data2,data3)||result;if(result){data=result[0]||data;data2=result[1]||data2;data3=result[2]||data3}}}return result||[data,data2,data3]},lmd_on=function(event,callback){if(!lmd_events[event]){lmd_events[event]=[]}lmd_events[event].push(callback)},lmd_require=function(moduleName){var module=modules[moduleName];var replacement=[moduleName,module];if(replacement){moduleName=replacement[0];module=replacement[1]}if(initialized_modules[moduleName]&&module){return module}if(typeof module==="string"&&module.indexOf("(function(")===0){module=global_eval(module)}return register_module(moduleName,module)},output={exports:{}};for(var moduleName in modules){initialized_modules[moduleName]=0}(function(){var amdModules={},currentModule,currentRequire;var define=function(name,deps,module){switch(arguments.length){case 1:module=name;deps=name=local_undefined;break;case 2:module=deps;deps=name;name=local_undefined;break;case 3:}if(typeof module!=="function"){amdModules[currentModule]=module;return}var output={exports:{}};if(!deps){deps=["require","exports","module"]}for(var i=0,c=deps.length;i<c;i++){switch(deps[i]){case"require":deps[i]=currentRequire;break;case"module":deps[i]=output;break;case"exports":deps[i]=output.exports;break;default:deps[i]=currentRequire&&currentRequire(deps[i])}}module=module.apply(this,deps)||output.exports;amdModules[currentModule]=module};lmd_require.define=define;lmd_on(2,function(moduleName,require){var options=modules_options[moduleName]||{};currentModule=moduleName;if(options.sandbox){currentRequire=local_undefined;if(typeof require==="function"){require={}}require.define=define}else{currentRequire=require}return[moduleName,require]});lmd_on(3,function(moduleName,module){if(amdModules.hasOwnProperty(currentModule)){module=amdModules[currentModule];delete amdModules[currentModule];return[moduleName,module]}})})();main(lmd_trigger(2,"main",lmd_require)[1],output.exports,output)})
(this,(function (require, exports, module) { /* wrapped by builder */
var $ = require('jquery'),
    Backbone = require('backbone'),
    Ember = require('ember');

console.log($().plugin());
console.dir(Backbone);
console.dir(Ember);

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
jQuery.fn.plugin = function () {
    return 'plugin';
};


/* added by builder */
return jQuery;
}),
"backbone": (function (require) { /* wrapped by builder */
var define = require.define;
if (typeof define === 'function') {
    define(function () {
        return {
            Model: function () {

            }
        };
    });
}

}),
"ember": "module.exports = {};\n"
},{},{});
