/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var path = require('path'),
    Stream = require('stream'),
    vow = require('vow'),
    parser = require('uglify-js').parser,
    expect = require('chai').expect;

var Builder = require('../..'),
    SUB_BUNDLE_SEPARATOR = require('../../lib/lmd_common').SUB_BUNDLE_SEPARATOR;

var fixtures = path.join(__dirname, 'fixtures', 'bundles');

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

    describe('bundles', function() {
        it('can be defined as array of bundles', function () {
            var build = new Builder(cfgPath('array')),
                bundles = build.buildConfig.bundles;

            expect(bundles).to.have.ownProperty('0');
            expect(bundles).to.have.ownProperty('1');
            expect(bundles).to.not.have.ownProperty('2');
        });

        it('can be defined as hash of bundles', function () {
            var build = new Builder(cfgPath('hash')),
                bundles = build.buildConfig.bundles;

            expect(bundles).to.have.ownProperty('a');
            expect(bundles).to.have.ownProperty('b');
        });

        it('inline bundle should inherit root', function () {
            var build = new Builder(cfgPath('inline')),
                bundles = build.buildConfig.bundles;

            expect(bundles).to.have.deep.property('a.root', build.buildConfig.root);
        });

        it('link to bundle should inherit root', function () {
            var build = new Builder(cfgPath('link')),
                bundles = build.buildConfig.bundles;

            expect(bundles).to.have.deep.property('a.root', build.buildConfig.root);
        });

        it('inherits warn, log, lazy, pack, pack_options, optimize from main config', function () {
            var build = new Builder(cfgPath('inherits')),
                bundles = build.buildConfig.bundles;

            ['warn', 'log', 'lazy', 'pack', 'pack_options', 'optimize'].forEach(function (prop) {
                ['a', 'b'].forEach(function (bundle) {
                    expect(bundles).to.have.deep.property(bundle + '.' + prop, build.buildConfig[prop]);
                });
            });
        });

        it('constructs output path based on main output path', function () {
            var build = new Builder(cfgPath('merge')),
                bundles = build.buildConfig.bundles;

            Object.keys(bundles).forEach(function (bundle) {
                expect(bundles[bundle]).to.have.property('output', build.buildConfig.output.replace('.js', '.' + bundle + '.js'));
            });
        });

        it('merges bundles from different sources', function () {
            var build = new Builder(cfgPath('merge')),
                bundles = build.buildConfig.bundles;

            expect(bundles).to.have.ownProperty('b');
            expect(bundles).to.have.ownProperty('c');
        });

        it('merges bundles with the same name from different sources', function () {
            var build = new Builder(cfgPath('merge-bundle')),
                bundles = build.buildConfig.bundles;

            expect(bundles).to.have.deep.property('b.modules.b');
            expect(bundles).to.have.deep.property('b.modules.c');
        });

        it('flattens sub-bundles', function () {
            var build = new Builder(cfgPath('flatten')),
                bundles = build.buildConfig.bundles;

            expect(bundles).to.have.deep.property('a');
            expect(bundles).to.not.have.deep.property('a.bundles');
            expect(bundles).to.have.deep.property('a' + SUB_BUNDLE_SEPARATOR + 'b');
        });

        it('constructs output using host bundle output name', function () {
            var build = new Builder(cfgPath('flatten')),
                bundles = build.buildConfig.bundles;

            expect(bundles).to.have.deep.property('a' + SUB_BUNDLE_SEPARATOR + 'b.output', bundles.a.output.replace('.js', '.b.js'));
        });

        it('passes all plugins to main bundle', function () {
            var build = new Builder(cfgPath('plugins')),
                config = build.buildConfig;

            expect(config).to.have.property('match', true);
            expect(config).to.have.property('ie', true);
        });

        it('enables bundle plugin if some bundles are defined', function () {
            var build = new Builder(cfgPath('plugins')),
                config = build.buildConfig;

            expect(config).to.have.property('bundle', true);
        });

        it('stops build if some modules are missing', function () {
            var build = new Builder(cfgPath('missing'));

            expect(build).to.have.property('readable', false);
            expect(build.bundles).to.be.empty;
        });

        it('makes bundle stream unreadable if no modules are listed', function () {
            var build = new Builder(cfgPath('no-modules'));

            expect(build).to.have.deep.property('bundles.b.readable', false);
        });

        it('streams all bundles content include sub-bundles', function () {
            var build = new Builder(cfgPath('stream'));

            expect(build).to.have.deep.property('bundles.b.readable', true);
            expect(build.bundles.b).to.be.instanceOf(Stream);

            expect(build).to.have.deep.property('bundles.c.readable', true);
            expect(build.bundles.c).to.be.instanceOf(Stream);

            expect(build).to.have.deep.property('bundles.c' + SUB_BUNDLE_SEPARATOR + 'd.readable', true);
            expect(build.bundles['c' + SUB_BUNDLE_SEPARATOR + 'd']).to.be.instanceOf(Stream);
        });

        it('streams all bundles source map include sub-bundles', function () {
            var build = new Builder(cfgPath('stream-sourcemap'));

            expect(build).to.have.deep.property('bundles.b.sourceMap.readable', true);
            expect(build.bundles.b.sourceMap).to.be.instanceOf(Stream);

            expect(build).to.have.deep.property('bundles.c.sourceMap.readable', true);
            expect(build.bundles.c.sourceMap).to.be.instanceOf(Stream);

            expect(build).to.have.deep.property('bundles.c' + SUB_BUNDLE_SEPARATOR + 'd.sourceMap.readable', true);
            expect(build.bundles['c' + SUB_BUNDLE_SEPARATOR + 'd'].sourceMap).to.be.instanceOf(Stream);
        });

        it('bundle content is jsonp with bundles_callback as function name', function (done) {
            var build = new Builder(cfgPath('content'));

            readStream(build.bundles.b)
                .then(function (content) {
                    var expectedAst = ["toplevel",[[
                        "stat", [
                            "call", ["name", build.buildConfig.bundles_callback], [
                                ["object", [[
                                    "b", ["function", null, ["require", "exports", "module"],
                                        [["stat", [
                                            "assign",
                                            true,
                                            ["dot", ["name", "module"], "exports"],
                                            ["name", "true"]
                                        ]]]
                                    ]
                                ]]],
                                ["object", []]
                            ]
                        ]
                    ]]];
                    var ast = parser.parse(content);

                    expect(ast).to.eql(expectedAst);
                })
                .then(done, done);
        });
    });

    describe('bundles_callback', function() {
        it('inherits bundles_callback property from main bundle', function () {
            var build = new Builder(cfgPath('content'));

            expect(build.buildConfig.bundles_callback).to.eql(build.buildConfig.bundles.b.bundles_callback);
        });

        it('it is random name leaded by _ by default', function () {
            var build = new Builder(cfgPath('content'));

            expect(build.buildConfig.bundles_callback).to.match(/^_[0-9a-f]+/);
        });
    });
});
