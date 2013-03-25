// This file was automatically generated from "index.lmd.json"
(function(global,main,modules,modules_options,options){var initialized_modules={},global_eval=function(code){return global.Function("return "+code)()},global_document=global.document,local_undefined,register_module=function(moduleName,module){var output={exports:{}};initialized_modules[moduleName]=1;modules[moduleName]=output.exports;if(!module){module=module||global[moduleName]}else if(typeof module==="function"){var module_require=lmd_require;if(modules_options[moduleName]&&modules_options[moduleName].sandbox&&typeof module_require==="function"){module_require=local_undefined}module=module(module_require,output.exports,output)||output.exports}module=module;return modules[moduleName]=module},lmd_require=function(moduleName){var module=modules[moduleName];var replacement=[moduleName,module];if(replacement){moduleName=replacement[0];module=replacement[1]}if(initialized_modules[moduleName]&&module){return module}if(typeof module==="string"&&module.indexOf("(function(")===0){module=global_eval(module)}return register_module(moduleName,module)},output={exports:{}};for(var moduleName in modules){initialized_modules[moduleName]=0}(function(){var inPackageModules=modules;lmd_require.match=function(regExp){if(!(regExp instanceof RegExp)){return null}var result={};for(var moduleName in inPackageModules){if(regExp.test(moduleName)){result[moduleName]=lmd_require(moduleName)}}return result}})();main(lmd_require,output.exports,output)})
(this,(function (require, exports, module) { /* wrapped by builder */
/**
 * LMD match example
 */

var templates = require.match(/Template$/);

console.log(templates);

}),{
"appTemplate": "<!--\nhis is empty file just to demonstrate glob matching\nsee .lmd/index.lmd.json\n-->\n\n",
"itemTemplate": "<!--\nhis is empty file just to demonstrate glob matching\nsee .lmd/index.lmd.json\n-->\n\n",
"itemsTemplate": "<!--\nThis is empty file just to demonstrate glob matching\nsee .lmd/index.lmd.json\n-->\n\n",
"userTemplate": "<!--\nThis is empty file just to demonstrate glob matching\nsee .lmd/index.lmd.json\n-->\n\n",
"usersTemplate": "<!--\nThis is empty file just to demonstrate glob matching\nsee .lmd/index.lmd.json\n-->\n\n"
},{},{});
