/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var path = require('path'),
    Stream = require('stream'),
    vow = require('vow'),
    expect = require('chai').expect;

var Builder = require('../..'),
    SUB_BUNDLE_SEPARATOR = require('../../lib/lmd_common').SUB_BUNDLE_SEPARATOR;

var fixtures = path.join(__dirname, 'fixtures', 'styles');

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

    describe('styles', function() {
        it('uses root parameter as styles root', function () {
            var build = new Builder(cfgPath('root')),
                styles = build.buildConfig.styles,
                root = '../css',
                dir = build.configDir;

            expect(styles).to.have.deep.property('[0].path', path.join(dir, root, 'a.css'));
        });

        it('marks missed styles as non exists and present styles as exists', function () {
            var build = new Builder(cfgPath('non-exists')),
                styles = build.buildConfig.styles;

            expect(styles).to.have.deep.property('[0].is_exists', true);
            expect(styles).to.have.deep.property('[1].is_exists', false);
            expect(build.style).to.be.instanceOf(Stream);
            expect(build.style.readable).to.be.false;
        });

        it('handles glob patterns', function () {
            var build = new Builder(cfgPath('glob')),
                styles = build.buildConfig.styles;

            var styleNames = styles.map(function (style) {
                return path.basename(style.path);
            }).sort();

            expect(styleNames).to.eql(['a.css', 'b.css', 'c.css']);
        });

        it('ignores duplicates', function () {
            var build = new Builder(cfgPath('ignores')),
                styles = build.buildConfig.styles;

            var styleNames = styles.map(function (style) {
                return path.basename(style.path);
            }).sort();

            expect(styleNames).to.eql(['a.css', 'b.css', 'c.css']);
        });

        it('keeps order while ignores duplicates', function () {
            var build = new Builder(cfgPath('order')),
                styles = build.buildConfig.styles;

            var styleNames = styles.map(function (style) {
                return path.basename(style.path);
            });

            expect(styleNames).to.eql(['c.css', 'b.css', 'a.css']);
        });

        it('opens stream if all styles are present', function () {
            var build = new Builder(cfgPath('root'));

            expect(build.style).to.be.instanceOf(Stream);
            expect(build.style.readable).to.be.true;
        });

        it('closes stream if some styles are missed', function () {
            var build = new Builder(cfgPath('non-exists'));

            expect(build.style).to.be.instanceOf(Stream);
            expect(build.style.readable).to.be.false;
        });

        it('stream all styles from main', function (done) {
            var build = new Builder(cfgPath('stream-main'));

            readStream(build.style)
                .then(function (body) {
                    expect(body).to.eql(['.a { color: red; }', '.b { color: blue; }', '.c { color: green; }'].join('\n'));
                })
                .then(done, done);
        });

        it('optimizes styles with csso if config.optimise passed', function (done) {
            var build = new Builder(cfgPath('optimize'));

            readStream(build.style)
                .then(function (body) {
                    expect(body).to.eql(['.a{color:red}', '.b{color:#00f}', '.c{color:green}'].join(''));
                })
                .then(done, done);
        });

        it('do not optimizes styles with csso if config.optimise not passed', function (done) {
            var build = new Builder(cfgPath('not-optimize'));

            readStream(build.style)
                .then(function (body) {
                    expect(body).to.not.eql(['.a{color:red}', '.b{color:#00f}', '.c{color:green}'].join(''));
                })
                .then(done, done);
        });

        it('stream all styles from bundles', function (done) {
            var build = new Builder(cfgPath('bundles'));

            vow.all({
                    ie: readStream(build.bundles.ie.style),
                    ie8: readStream(build.bundles.ie8.style)
                })
                .then(function (bundles) {
                    expect(bundles.ie).to.eql('.a { color: red; }');
                    expect(bundles.ie8).to.eql('.b { color: blue; }');
                })
                .then(done, done);
        });

        it('stream all styles from sub-bundles', function (done) {
            var build = new Builder(cfgPath('bundles-sub'));

            vow.all({
                    sub_ie: readStream(build.bundles['sub' + SUB_BUNDLE_SEPARATOR + 'ie'].style),
                    sub_ie8: readStream(build.bundles['sub' + SUB_BUNDLE_SEPARATOR + 'ie8'].style)
                })
                .then(function (bundles) {
                    expect(bundles.sub_ie).to.eql('.a { color: red; }');
                    expect(bundles.sub_ie8).to.eql('.b { color: blue; }');
                })
                .then(done, done);
        });

        it('makes style stream unreadable if no styles defined', function () {
            var build = new Builder(cfgPath('bundles-sub'));

            expect(build.style).to.have.property('readable', false);
            expect(build.bundles.sub.style).to.have.property('readable', false);
        });
    });

    describe('styles_output', function() {
        it('uses output file to construct styles_output, if styles_output is undefined', function () {
            var build = new Builder(cfgPath('construct-styles_output')),
                styles_output = build.buildConfig.styles_output;

            expect(styles_output).to.be.eql('../index.css');
        });

        it('uses styles_output if passed', function () {
            var build = new Builder(cfgPath('passed-styles_output')),
                styles_output = build.buildConfig.styles_output;

            expect(styles_output).to.be.eql('../_index.ie.css');
        });

        it('ignores styles, if both output and styles_output are undefined', function () {
            var build = new Builder(cfgPath('undefined-styles_output')),
                styles_output = build.buildConfig.styles_output;

            expect(styles_output).to.be.undefined;
        });

        it('constructs bundle styles_output using styles_output if not passed', function () {
            var build = new Builder(cfgPath('bundle-styles_output'));
            var styles_output = build.buildConfig.bundles.ie.styles_output;

            expect(styles_output).to.be.eql('../index.ie.css');
        });
    });
});
