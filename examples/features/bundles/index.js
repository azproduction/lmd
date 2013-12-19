// This file was automatically generated from "index.lmd.json"
(function(global,main,modules,modules_options,options){var initialized_modules={},global_eval=function(code){return global.Function("return "+code)()},global_noop=function(){},global_document=global.document,local_undefined,register_module=function(moduleName,module){var output={exports:{}};initialized_modules[moduleName]=1;modules[moduleName]=output.exports;if(!module){module=module||global[moduleName]}else if(typeof module==="function"){var module_require=lmd_require;if(modules_options[moduleName]&&modules_options[moduleName].sandbox&&typeof module_require==="function"){module_require=local_undefined}module=module(module_require,output.exports,output)||output.exports}module=module;return modules[moduleName]=module},lmd_events={},lmd_trigger=function(event,data,data2,data3){var list=lmd_events[event],result;if(list){for(var i=0,c=list.length;i<c;i++){result=list[i](data,data2,data3)||result;if(result){data=result[0]||data;data2=result[1]||data2;data3=result[2]||data3}}}return result||[data,data2,data3]},lmd_on=function(event,callback){if(!lmd_events[event]){lmd_events[event]=[]}lmd_events[event].push(callback)},lmd_require=function(moduleName){var module=modules[moduleName];var replacement=lmd_trigger(4,moduleName,module);if(replacement){moduleName=replacement[0];module=replacement[1]}if(initialized_modules[moduleName]&&module){return module}if(typeof module==="string"&&module.indexOf("(function(")===0){module=global_eval(module)}return register_module(moduleName,module)},output={exports:{}};for(var moduleName in modules){initialized_modules[moduleName]=0}(function(){function is_shortcut(moduleName,moduleContent){return!initialized_modules[moduleName]&&typeof moduleContent==="string"&&moduleContent.charAt(0)=="@"}function rewrite_shortcut(moduleName,module){if(is_shortcut(moduleName,module)){moduleName=module.replace("@","");var newModule=modules[moduleName];module=newModule===module?local_undefined:newModule}return[moduleName,module]}lmd_on(4,rewrite_shortcut);})();(function(){var promisePath=options.promise,error="Bad deferred "+options.promise,deferredFunction,name;if(typeof promisePath!=="string"){throw new Error(error)}promisePath=promisePath.split(".");deferredFunction=lmd_require(promisePath[0]);while(promisePath.length){name=promisePath.shift();if(typeof deferredFunction[name]!=="undefined"){deferredFunction=deferredFunction[name]}}if(typeof deferredFunction!=="function"){throw new Error(error)}lmd_on(9,function(){var dfd=deferredFunction(),callback=function(argument){if(typeof argument==="undefined"){dfd.reject()}else{dfd.resolve(argument)}};return[callback,typeof dfd.promise==="function"?dfd.promise():dfd.promise]})})();(function(){lmd_on(10,function(moduleName,callback){var readyState="readyState",isNotLoaded=1,head;var script=global_document.createElement("script");global.setTimeout(script.onreadystatechange=script.onload=function(e){e=e||global.event;if(isNotLoaded&&(!e||!script[readyState]||script[readyState]=="loaded"||script[readyState]=="complete")){isNotLoaded=0;if(!e){}callback(e?register_module(moduleName,script):head.removeChild(script)&&local_undefined)}},3e3,0);script.src=moduleName;head=global_document.getElementsByTagName("head")[0];head.insertBefore(script,head.firstChild);return[moduleName,callback]})})();(function(){var domOnlyLoaders={css:true,image:true};var reEvalable=/(java|ecma)script|json/,reJson=/json/;lmd_on(13,function(moduleName,callback,type){var createPromiseResult=lmd_trigger(9);var returnResult=createPromiseResult[1]||lmd_require;callback=createPromiseResult[0]||callback||global_noop;if(typeof moduleName!=="string"){callback=[moduleName,callback,lmd_require[type]][1];if(!callback){return[[returnResult,moduleName,module,true],callback,type]}}var module=modules[moduleName];var replacement=lmd_trigger(4,moduleName,module);if(replacement){moduleName=replacement[0];module=replacement[1]}if(module||domOnlyLoaders[type]&&!global_document){callback(type==="preload"?moduleName:initialized_modules[moduleName]?module:lmd_require(moduleName));return[[returnResult,moduleName,module,true],callback,type]}callback=callback;if(!callback){return[[returnResult,moduleName,module,true],callback,type]}return[[returnResult,moduleName,module,false],callback,type]})})();(function(){var callbackName=options.bundle,pendingBundlesLength=0;var processBundleJSONP=function(_main,_modules,_modules_options){if(typeof _main==="object"){_modules_options=_modules;_modules=_main}for(var moduleName in _modules){if(moduleName in modules){continue}modules[moduleName]=_modules[moduleName];initialized_modules[moduleName]=0;if(_modules_options&&moduleName in _modules_options){modules_options[moduleName]=_modules_options[moduleName]}}if(typeof _main==="function"){var output={exports:{}};_main(lmd_require,output.exports,output)}};var trap=function(){pendingBundlesLength++;global[callbackName]=processBundleJSONP};var cleanup=function(callback,scriptTag){setTimeout(function(){pendingBundlesLength--;if(!pendingBundlesLength){global[callbackName]=local_undefined}callback(scriptTag)},10)};lmd_require.bundle=function(bundleSrc,callback){var replacement=lmd_trigger(13,bundleSrc,callback,"image"),returnResult=replacement[0][0];if(replacement[0][3]){return returnResult}callback=replacement[1];bundleSrc=replacement[0][1];trap();lmd_trigger(10,bundleSrc,function(scriptTag){cleanup(callback,scriptTag)});return returnResult}})();main(lmd_require,output.exports,output)})
(this,(function (require, exports, module) { /* wrapped by builder */
console.log('[OK] main module executed');

function renderButton(text) {
    return require.bundle('bundle-button').pipe(function () {
        return require('buttonView')(text);
    });
}

function renderTextarea() {
    return require.bundle('bundle-textarea').pipe(function () {
        return require('textareaView')();
    });
}

renderButton('Create textarea!')
.then(function (html) {
    var $body = $('body'),
        $el = $(html);

    $el.click(function () {
        renderTextarea().then(function (html) {
            $(html).appendTo('body');
        });
    });

    $body.html($el);
});

require.bundle('/undefined.js').then($.noop, function () {
    console.log('[OK] undefined-bundle is failed to load');
});


}),{
"template": "<!DOCTYPE html>\n<html>\n<head>\n    <title></title>\n</head>\n<body>\n\n</body>\n</html>",
"bundle-button": "@index.button.js?0.064e3e03",
"bundle-textarea": "@index.textarea.js?0.064e3e03"
},{},{"promise":"$.Deferred","bundle":"_b195a7fb"});
