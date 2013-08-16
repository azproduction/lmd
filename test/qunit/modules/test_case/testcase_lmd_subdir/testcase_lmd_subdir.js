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

    module('LMD subdir @ ' + ENV_NAME);

    test('subdir contains reversed path from root to module dir', function () {
        expect(1);
        ok(require('subdir_b/c/d/e') === true, 'Should be reversed array');
    });

    test('subdir.toString() returns a string - path from config root to file', function () {
        expect(2);
        ok(require('subdir_a/b/c/d') === true, 'Should add final slash');
        ok(require('subdir_c') === true, 'Should not add final slash if path is ./');
    });
})