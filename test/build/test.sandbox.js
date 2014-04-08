/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var path = require('path'),
    Stream = require('stream'),
    vow = require('vow'),
    expect = require('chai').expect,
    readStream = require('./lib/read_stream');

// disable colors
require('colors').mode = 'none';

var Builder = require('../..');

var fixtures = path.join(__dirname, 'fixtures', 'sandbox');

function cfgPath(name) {
    return path.join(fixtures, '.lmd', name + '.lmd.json');
}

describe('lmd', function() {

    describe('sandbox', function() {
        var warningRe = /^warn:.+sandbox.*$/m;

        function shouldContainWarning(log) {
            expect(log).to.match(warningRe);
        }

        function shouldNotContainWarning(log) {
            expect(log).to.not.match(warningRe);
        }

        it('should not warn if `bind` property of module is empty', function (done) {
            var build = new Builder(cfgPath('empty_bind_object'));

            readStream(build.log)
                .then(shouldNotContainWarning)
                .then(done, done);
        });

        it('should warn if `bind` property of module is a string', function (done) {
            var build = new Builder(cfgPath('string_bind_object'));

            readStream(build.log)
                .then(shouldContainWarning)
                .then(done, done);
        });

        it('should warn if `bind` property of module is a not an empty object', function (done) {
            var build = new Builder(cfgPath('filled_bind_object'));

            readStream(build.log)
                .then(shouldContainWarning)
                .then(done, done);
        });

        it('should warn if `require` property of module is a not an empty object', function (done) {
            var build = new Builder(cfgPath('require_object'));

            readStream(build.log)
                .then(shouldContainWarning)
                .then(done, done);
        });
    });

});
