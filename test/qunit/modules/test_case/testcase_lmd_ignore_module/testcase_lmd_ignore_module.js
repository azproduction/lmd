(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),
        ls = require('localStorage'),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    if (!ls) {
        return;
    }

    module('LMD ignore_module @ ' + ENV_NAME);

    test('LMD can ignore modules', function () {
        expect(2);
        ok(typeof require('ignore_module_ignored_module') === 'undefined', 'Should ignore modules from extends');
        ok(typeof require('ignore_module_ignored_module2') === 'undefined', 'Should ignore modules from mixins');
    });
})