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

var fixtures = path.join(__dirname, 'fixtures', 'type_hint');

function cfgPath(name) {
    return path.join(fixtures, '.lmd', name + '.lmd.json');
}

describe('lmd', function() {

    describe('type_hint', function() {
        it('overrides module type using module `type` property if possible', function (done) {
            var build = new Builder(cfgPath('valid_type'));

            readStream(build)
                .then(function (code) {
                    expect(code).to.match(/var define = require\.define;/);
                })
                .then(done, done);
        });

        it('ignores module type hint if `type` property if unexpected', function (done) {
            var build = new Builder(cfgPath('invalid_type'));

            readStream(build.log)
                .then(function (log) {
                    expect(log).to.match(/Unexpected module type/);
                })
                .then(done, done);
        });
    });

});
