(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        equal = require('equal'),
        $ = require('$'),
        raises = require('raises'),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    module('LMD AMD module adaptor @ ' + ENV_NAME);

    test("AMD object and strings", function () {
        expect(6);

        var amd_object = require('amd_amd_object'),
            amd_string = require('amd_amd_string');

        equal('amd_string', amd_string, 'Should define strings');
        /*{
            "string": "1",
            "function": function () {
                return true;
            },
            "object": {}
        }*/
        equal("object", typeof amd_object, 'Should define objects');
        equal("object", typeof amd_object.object, 'Should define objects in object');
        equal(true, amd_object.function(), 'Should define functions in object');
        equal("1", amd_object.string, 'Should define strings in object');
        equal(amd_object, require('amd_amd_object'), 'Should init once');
    });

    test("AMD depends", function () {
        expect(4);
        var amd_function_deps = require('amd_amd_function_deps');

        /*{
            amd_string: require("amd_string"),
            amd_object: amd_object
        }*/
        equal("object", typeof amd_function_deps, 'Should be an object');
        equal('amd_string', amd_function_deps.amd_string, 'Should require directly');
        equal('object', typeof amd_function_deps.amd_object, 'Should require using deps');
        equal(amd_function_deps.amd_object, require('amd_amd_object'), 'Should init once');
    });

    test("AMD no depends", function () {
        expect(4);
        var amd_function_nodeps = require('amd_amd_function_nodeps');

        /*{
            amd_string: require('amd_amd_function_deps').amd_string,
            some_extra_number: 1,
            typeof_exports: typeof exports,
            typeof_module: typeof module
        }*/
        equal("string", typeof amd_function_nodeps.amd_string, 'Can require');
        equal('object', amd_function_nodeps.typeof_exports, 'Should pass exports');
        equal('object', amd_function_nodeps.typeof_module, 'Should pass module');
        equal(true, amd_function_nodeps.module_eq_module_exports, 'module.exports = exports');

    });

    test("AMD module name", function () {
        expect(5);
        var amd_function_name = require('amd_amd_function_name');

        /*{
            amd_string: require("amd_string"),
            amd_object: amd_object
        }*/
        equal("object", typeof amd_function_name, 'Should be an object');
        equal('amd_string', amd_function_name.amd_string, 'Should require directly');
        equal('object', typeof amd_function_name.amd_object, 'Should require using deps');
        equal(amd_function_name.amd_object, require('amd_amd_object'), 'Should init once');
        equal("undefined", typeof require("amd_function_name!!!"), "Should not define objects using define(name)");
    });

    test("AMD multi define", function () {
        var amd_multi_define = require('amd_amd_multi_define');

        equal("ok", amd_multi_define, "Should overwrite defines in one module");
    });

    test("AMD require LMD module", function () {
        var amd_require_lmd_module = require('amd_amd_require_lmd_module');

        /*{
            lmd_fe: require('lmd_fe'),
            lmd_fd: require('lmd_fd'),
            lmd_json: require('lmd_json'),
            lmd_string: require('lmd_string')
        }*/
        equal(require('amd_lmd_fe'), amd_require_lmd_module.lmd_fe, 'Should require LMD FE');
        equal(require('amd_lmd_fd'), amd_require_lmd_module.lmd_fd, 'Should require LMD FD');
        equal(require('amd_lmd_json'), amd_require_lmd_module.lmd_json, 'Should require LMD JSON');
        equal(require('amd_lmd_string'), amd_require_lmd_module.lmd_string, 'Should require LMD String');
    });

    test("AMD shortcuts", function () {
        var amd_shortcut = require('amd_amd_shortcut');

        equal(require("amd_amd_string"), amd_shortcut.amd_shortcut, "Should follow shortcut by deps");
        equal(require("amd_amd_string"), amd_shortcut.require_amd_shortcut, "Should follow shortcut by require");
    });

    test("AMD sandbox", function () {
        var amd_sandbox = require('amd_amd_sandbox');

        equal(true, amd_sandbox, "Should be sandboxed");
    });

});