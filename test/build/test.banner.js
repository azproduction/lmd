/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var path = require('path'),
    Stream = require('stream'),
    vow = require('vow'),
    expect = require('chai').expect;

// disable colors
require('colors').mode = 'none';

var Builder = require('../..');

var fixtures = path.join(__dirname, 'fixtures', 'banner');

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

    describe('banner', function() {
        it('prints default banner that consists of config file and mixins', function (done) {
            var build = new Builder(cfgPath('default'));
            var banner = '// This file was automatically generated from "default.lmd.json" using mixins "mixin.lmd.json"';

            readStream(build)
                .then(function (code) {
                    expect(code.split('\n')[0]).to.be.eql(banner);
                })
                .then(done, done);
        });

        it('prints warning and uses default banner if `banner` property is not a string', function (done) {
            var build = new Builder(cfgPath('non-string'));
            var banner = '// This file was automatically generated from "non-string.lmd.json"';
            var warning = '`banner` should be a string';

            vow.all({
                    code: readStream(build),
                    log: readStream(build.log)
                })
                .then(function (data) {
                    expect(data.code.split('\n')[0]).to.be.eql(banner);
                    expect(data.log).to.have.string(warning);
                })
                .then(done, done);
        });

        it('can use `__dirname` and `__filename` variables', function (done) {
            var build = new Builder(cfgPath('dirname-filename'));
            var banner = '// /dirname-filename.lmd.json';

            readStream(build)
                .then(function (code) {
                    expect(code.split('\n')[0]).to.be.eql(banner);
                })
                .then(done, done);
        });

        it('should warn if `banner` contains any JavaScript but print `banner` as is', function (done) {
            var build = new Builder(cfgPath('javascript'));
            var banner = 'console.log(\'banner\');';
            var warning = '`banner` should be a JavaScript comment. Please remove any executable JavaScript from `banner`.';

            vow.all({
                    code: readStream(build),
                    log: readStream(build.log)
                })
                .then(function (data) {
                    expect(data.code.split('\n')[0]).to.be.eql(banner);
                    expect(data.log).to.have.string(warning);
                })
                .then(done, done);
        });

        it('is inherited by bundles', function (done) {
            var build = new Builder(cfgPath('bundle-inherits-banner'));
            var banner = '//inherits';

            readStream(build.bundles.test)
                .then(function (code) {
                    expect(code.split('\n')[0]).to.be.eql(banner);
                })
                .then(done, done);
        });
    });

});
