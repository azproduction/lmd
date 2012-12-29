(function (require) {
    var test = require('test'),
        ok = require('ok'),
        expect = require('expect'),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    module('LMD User Plugins @ ' + ENV_NAME);

    test("plugins", function () {
        expect(1);
        ok(require.user_plugin_feature() === 'Hello from user plugin!', 'can use user_plugin_feature()');
    });

    test("plugins with options", function () {
        expect(1);
        ok(require.user_plugin_with_options_feature().pewpew === "ololo", 'user plugin can use custom config');
    });

})
