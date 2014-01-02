/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var path = require('path'),
    Stream = require('stream'),
    vow = require('vow'),
    expect = require('chai').expect;

var Builder = require('../..');

var fixtures = path.join(__dirname, 'fixtures', 'license_header');

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

    describe('license header', function() {
        it('is disabled by default', function (done) {
            var build = new Builder(cfgPath('default'));

            readStream(build)
                .then(function (body) {
                    expect(body).to.match(/^\/\/ This file was/);
                })
                .then(done, done);
        });
        it('could be enabled', function (done) {
            var build = new Builder(cfgPath('enabled'));

            readStream(build)
                .then(function (body) {
                    expect(body).to.match(/^\/\*! .+? MIT License/);
                })
                .then(done, done);
        });
        it('could be disabled', function (done) {
            var build = new Builder(cfgPath('disabled'));

            readStream(build)
                .then(function (body) {
                    expect(body).to.match(/^\/\/ This file was/);
                })
                .then(done, done);
        });

    });
});
