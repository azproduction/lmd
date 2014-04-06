// This file was automatically generated from "test.lmd.js" using mixins "test.sum.lmd.js"
(function (global, main, modules, modules_options, options) {
    var initialized_modules = {},
        global_eval = function (code) {
            return global.Function('return ' + code)();
        },
        
        global_document = global.document,
        local_undefined,
        /**
         * @param {String} moduleName module name or path to file
         * @param {*}      module module content
         *
         * @returns {*}
         */
        register_module = function (moduleName, module) {
            lmd_trigger('lmd-register:before-register', moduleName, module);
            // Predefine in case of recursive require
            var output = {'exports': {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                // or load modules from nodejs/worker environment
                module = lmd_trigger('js:request-environment-module', moduleName, module)[1] || global[moduleName];
            } else if (typeof module === 'function') {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                var module_require = lmd_trigger('lmd-register:decorate-require', moduleName, lmd_require)[1];

                // Make sure that sandboxed modules cant require
                if (modules_options[moduleName] &&
                    modules_options[moduleName].sandbox &&
                    typeof module_require === 'function') {

                    module_require = local_undefined;
                }

                module = module(module_require, output.exports, output) || output.exports;
            }

            module = lmd_trigger('lmd-register:after-register', moduleName, module)[1];
            return modules[moduleName] = module;
        },
        /**
         * List of All lmd Events
         *
         * @important Do not rename it!
         */
        lmd_events = {},
        /**
         * LMD event trigger function
         *
         * @important Do not rename it!
         */
        lmd_trigger = function (event, data, data2, data3) {
            var list = lmd_events[event],
                result;

            if (list) {
                for (var i = 0, c = list.length; i < c; i++) {
                    result = list[i](data, data2, data3) || result;
                    if (result) {
                        // enable decoration
                        data = result[0] || data;
                        data2 = result[1] || data2;
                        data3 = result[2] || data3;
                    }
                }
            }
            return result || [data, data2, data3];
        },
        /**
         * LMD event register function
         *
         * @important Do not rename it!
         */
        lmd_on = function (event, callback) {
            if (!lmd_events[event]) {
                lmd_events[event] = [];
            }
            lmd_events[event].push(callback);
        },
        /**
         * @param {String} moduleName module name or path to file
         *
         * @returns {*}
         */
        lmd_require = function (moduleName) {
            var module = modules[moduleName];

            var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }

            lmd_trigger('*:before-check', moduleName, module);
            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }

            lmd_trigger('*:before-init', moduleName, module);

            // Lazy LMD module not a string
            if (typeof module === 'string' && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {'exports': {}},

        /**
         * Sandbox object for plugins
         *
         * @important Do not rename it!
         */
        sandbox = {
            'global': global,
            'modules': modules,
            'modules_options': modules_options,
            'options': options,

            'eval': global_eval,
            'register': register_module,
            'require': lmd_require,
            'initialized': initialized_modules,

            
            'document': global_document,
            
            

            'on': lmd_on,
            'trigger': lmd_trigger,
            'undefined': local_undefined
        };

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }



    main(lmd_trigger('lmd-register:decorate-require', 'main', lmd_require)[1], output.exports, output);
})/*DO NOT ADD ; !*/
(this,(function (require, exports, module) { /* wrapped by builder */
/*global describe, it, beforeEach, afterEach, expect*/
/*jshint expr:true*/

var sum = require('sum');

describe('sum', function () {

    it('calculates sum of two numbers', function () {
        expect(sum(1, 1)).to.eql(2);
    });

    it('sums only first two arguments', function () {
        expect(sum(1, 1, 1)).to.eql(2);
    });

    it('throws TypeError exception if one of arguments is not a number', function () {
        expect(function () {
            sum('', 1);
        }).to.throw(TypeError, /a and b should be numbers/);

        expect(function () {
            sum('', '');
        }).to.throw(TypeError, /a and b should be numbers/);

        expect(function () {
            sum(1, '');
        }).to.throw(TypeError, /a and b should be numbers/);
    });

});

}),{
"sum": (function (require, exports, module) { /* wrapped by builder */
if (typeof __coverage__ === 'undefined') { __coverage__ = {}; }
if (!__coverage__['/Users/azproduction/Documents/my/lmd/examples/tests/istanbul/lib/sum.js']) {
   __coverage__['/Users/azproduction/Documents/my/lmd/examples/tests/istanbul/lib/sum.js'] = {"path":"/Users/azproduction/Documents/my/lmd/examples/tests/istanbul/lib/sum.js","s":{"1":0,"2":0,"3":0,"4":0},"b":{"1":[0,0],"2":[0,0,0,0]},"f":{"1":0},"fnMap":{"1":{"name":"(anonymous_1)","line":1,"loc":{"start":{"line":1,"column":17},"end":{"line":1,"column":33}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":6,"column":2}},"2":{"start":{"line":2,"column":4},"end":{"line":4,"column":5}},"3":{"start":{"line":3,"column":8},"end":{"line":3,"column":57}},"4":{"start":{"line":5,"column":4},"end":{"line":5,"column":17}}},"branchMap":{"1":{"line":2,"type":"if","locations":[{"start":{"line":2,"column":4},"end":{"line":2,"column":4}},{"start":{"line":2,"column":4},"end":{"line":2,"column":4}}]},"2":{"line":2,"type":"binary-expr","locations":[{"start":{"line":2,"column":8},"end":{"line":2,"column":16}},{"start":{"line":2,"column":20},"end":{"line":2,"column":41}},{"start":{"line":2,"column":45},"end":{"line":2,"column":53}},{"start":{"line":2,"column":57},"end":{"line":2,"column":78}}]}}};
}
var __cov_lUPduInBuAM$Og2g4eYgKg = __coverage__['/Users/azproduction/Documents/my/lmd/examples/tests/istanbul/lib/sum.js'];
__cov_lUPduInBuAM$Og2g4eYgKg.s['1']++;
module.exports = function (a, b) {
    __cov_lUPduInBuAM$Og2g4eYgKg.f['1']++;
    __cov_lUPduInBuAM$Og2g4eYgKg.s['2']++;
    if ((__cov_lUPduInBuAM$Og2g4eYgKg.b['2'][0]++, isNaN(a)) || (__cov_lUPduInBuAM$Og2g4eYgKg.b['2'][1]++, typeof a !== 'number') || (__cov_lUPduInBuAM$Og2g4eYgKg.b['2'][2]++, isNaN(b)) || (__cov_lUPduInBuAM$Og2g4eYgKg.b['2'][3]++, typeof b !== 'number')) {
        __cov_lUPduInBuAM$Og2g4eYgKg.b['1'][0]++;
        __cov_lUPduInBuAM$Og2g4eYgKg.s['3']++;
        throw new TypeError('a and b should be numbers');
    } else {
        __cov_lUPduInBuAM$Og2g4eYgKg.b['1'][1]++;
    }
    __cov_lUPduInBuAM$Og2g4eYgKg.s['4']++;
    return a + b;
};

})
},{},{});
