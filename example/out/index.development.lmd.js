(function (window, sandboxed_modules) {
    var modules = {},
        initialized_modules = {},
        require = function (moduleName) {
            var module = modules[moduleName],
                output;

            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }

            // Lazy LMD module
            if (typeof module === "string") {
                module = (0, window.eval)(module);
            }

            // Predefine in case of recursive require
            output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                module = window[moduleName];
            } else if (typeof module === "function") {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                module = module(sandboxed_modules[moduleName] ? null : require, output.exports, output) || output.exports;
            }

            return modules[moduleName] = module;
        },
        lmd = function (misc) {
            var output = {exports: {}};
            switch (typeof misc) {
                case "function":
                    misc(require, output.exports, output);
                    break;
                case "object":
                    for (var moduleName in misc) {
                        // reset module init flag in case of overwriting
                        initialized_modules[moduleName] = 0;
                        modules[moduleName] = misc[moduleName];
                    }
                    break;
            }
            return lmd;
        };
    return lmd;
})(this,{"depB":true})({
"depA": function depA(require){
    var escape = require('depB');
    return function(message) {
        console.log(escape(message));
    }
},
"depB": function depB(sandboxed/*module is sandboxed(see cfgs) - it cannot require*/, exports, module){
    // CommonJS Module exports
    // or exports.feature = function () {}
    // This module is common for worker and browser
    module.exports = function(message) {
        return message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
},
"workerDepA": function workerDepA(require){
    var escape = require('depB'), // shared module
        postMessage = require('postMessage'); // grab from global

    return function(message) {
        postMessage(escape(message));
    }
},
"i18n": {
    "hello": "Привет"
},
"config": {
    "worker": "./out/index.development.lmd.js"
}
})(function main(require) {
    // Common Worker or Browser
    var i18n = require('i18n'),
        text = i18n.hello +  ', lmd',
        $, print, Worker, worker, cfg;


    if (typeof window !== "undefined") {
        // Browser
        print = require('depA');
        Worker = require('Worker'); // grab from globals
        cfg = require('config');

        $ = require('$'); // grab module from globals: LMD version 1.2.0

        $(function () {
            $('#log').text(text);
        });

        if (Worker) { // test if browser support workers
            worker = new Worker(cfg.worker);
            worker.addEventListener('message', function (event) {
                print("Received some data from worker: " + event.data);
            }, false);
        }
    } else {
        // Worker
        print = require('workerDepA');
    }


    // Common Worker or Browser
    print(text);
})