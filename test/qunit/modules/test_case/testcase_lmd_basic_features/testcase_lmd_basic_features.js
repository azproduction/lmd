(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        rnd = '?' + Math.random(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    module('LMD basic features @ ' + ENV_NAME);

    test("require() globals", function () {
        expect(4);

        ok(require('eval'), "should require globals as modules");
        ok(typeof require('some_undefined') === "undefined", "if no module nor global - return undefined");

        // stats
        ok(!!require.stats('eval'), "should count stats: globals");
        ok(!!require.stats('some_undefined'), "should count stats: undefineds");
    });

    test("require() module-functions", function () {
        expect(10);

        var fd = require('module_function_fd'),
            fe = require('module_function_fe'),
            plain = require('module_function_plain');

        ok(fd() === true, "can require function definitions");
        ok(fe() === true, "can require function expressions");
        ok(plain() === true, "can require plain modules");

        ok(fd === require('module_function_fd'), "require must return the same instance of fd");
        ok(fe === require('module_function_fe'), "require must return the same instance of fe");
        ok(plain === require('module_function_plain'), "require must return the same instance of plain module");

        ok(!!require.stats('module_function_fd'), "should count stats: in-package modules");
    });

    test("require() sandboxed module-functions", function () {
        expect(3);

        var fd = require('module_function_fd_sandboxed'),
            fe = require('module_function_fe_sandboxed'),
            plain = require('module_function_plain_sandboxed');

        ok(fd.some_function() === true, "can require sandboxed function definitions");
        ok(fe.some_function() === true, "can require sandboxed function expressions");
        ok(plain.some_function() === true, "can require sandboxed plain modules");
    });

    test("require() lazy module-functions", function () {
        expect(4);

        var lazy = require('module_function_lazy');

        ok(lazy() === true, "can require lazy function definitions");
        ok(typeof require('lazy_fd') === "undefined", "lazy function definition's name should not leak into globals");
        ok(lazy === require('module_function_lazy'), "require must return the same instance of lazy fd");
    });

    test("require() module-objects/json", function () {
        expect(3);

        var json = require('module_as_json');

        ok(typeof json === "object", "json module should be an object");
        ok(json.ok === true, "should return content");
        ok(json === require('module_as_json'), "require of json module should return the same instance");
    });

    test("require() module-strings", function () {
        expect(2);

        var string = require('module_as_string');

        ok(typeof string === "string", "string module should be an string");
        ok(string === require('module_as_string'), "require of string module should return the same instance");
    });

    test("require() shortcuts", function () {
        expect(3);

        var dateObject = require('sk_to_global_object');
        ok(dateObject.toString().replace(/\s|\n/g,'') === "functionDate(){[nativecode]}", "require() should follow shortcuts: require global by shortcut");

        var json = require('sk_to_module_as_json');
        ok(typeof json === "object" &&
           json.ok === true &&
           json === require('module_as_json'), "require() should follow shortcuts: require in-package module by shortcut");

        // #66
        var selfReferenceShortcut = require('setTimeout'); // "setTimeout": "@setTimeout"
        ok(typeof selfReferenceShortcut === "function", 'Shortcut self reference should be resolved as undefined->global name');
    });

    test("require() third party", function () {
        expect(2);

        var module = require('third_party_module_a'); // mock jquery
        ok(typeof module === "function", 'require() can load plain 3-party non-lmd modules, 1 exports');

        module = require('third_party_module_b'); // other plain module
        ok(typeof module === "object" &&
           typeof module.pewpew === "function" &&
           typeof module.ololo === "function" &&
           module.someVariable === "string", "require() can load plain 3-party non-lmd modules, N exports");
    });

    test("require() third party module with custom context (this)", function () {
        expect(1);

        var module = require('third_party_module_with_custom_this');
        ok(typeof module.someFunction === "function" &&
            module.someFunction() === "ok", '3-party modules can use custom context (this)');
    });

    test("require.match() requires every matched module name", function () {
        expect(1);

        var pattern = /^match_([a-z]+)Template$/,
            matchedModules = require.match(pattern),
            shouldMatch = ['app', 'item', 'items', 'user', 'users'],
            moduleNames = Object.keys(matchedModules);

        var isEveryModuleMatched = moduleNames.every(function (moduleName) {
            return shouldMatch.indexOf(moduleName.match(pattern)[1]) !== -1;
        });

        ok(isEveryModuleMatched && shouldMatch.length === moduleNames.length, 'should match only required modules');
    });

    test("require() multi-path module", function () {
        expect(1);

        var backbone = require('multi-third_party_module_backbone');
        ok(typeof backbone === "object" &&
           backbone.Plugin1() === "Plugin1" &&
           backbone.Plugin2() === "Plugin2", 'Modules can consists of multiply files');
    });

    test("require() 3-party multi-path module", function () {
        expect(1);

        var $ = require('multi-third_party_module_jquery');
        ok(typeof $ === "function" &&
            $().plugin() === 'plugin' &&
            $().plugin2() === 'plugin2' &&
            $.plugin3() === 'plugin3', '3-party modules can consists of multiply files');
    });

    if (ENV_NAME === "Node") {
        test("require() node.js npm, node, local modules", function () {
            expect(3);

            var module = require('npm_module_1');
            ok(typeof module === "object" &&
                typeof module.some_function === "function", 'require() + node:true can load nodejs npm modules');

            module = require('./path/to/non_lmd_module.js');
            ok(typeof module === "object" &&
                typeof module.some_function === "function", 'require() + node:true can load node.js modules from local fs');

            var fs = require('fs');
            ok(typeof fs === "object" &&
                typeof fs.readFile === "function", 'require() + node:true can load embedded node.js modules');
        });
    }
})