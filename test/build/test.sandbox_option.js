/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var path = require('path'),
    Stream = require('stream'),
    vow = require('vow'),
    expect = require('chai').expect;

// disable colors
require('colors').mode = 'none';

var Builder = require('../..');

var fixtures = path.join(__dirname, 'fixtures', 'sandbox_option');

function cfgPath(name) {
    return path.join(fixtures, '.lmd', name + '.lmd.json');
}

function readStream(stream) {
    var promise = vow.promise(),
        body = '';

    if (!stream.readable) {
        promise.reject(new Error('stream is not readable'));
        return promise;
    }

    stream.on('data', function (chunk) {
        body += chunk;
    });

    stream.on('end', function () {
        promise.fulfill(body);
    });

    stream.on('error', function (error) {
        promise.reject(error);
    });

    return promise;
}

describe('lmd', function() {

    describe('sandbox option', function() {
        it("shouldn't generate warning if 'bind' object is empty", function (done) {
            var build = new Builder(cfgPath('empty_bind_object'));
            var warningRe = /^warn:.+sandbox.*$/m;

            readStream(build.log)
                .then(function (log) {
                    expect(log).to.not.match(warningRe);
                })
                .then(done, done);
        });
    });

});
