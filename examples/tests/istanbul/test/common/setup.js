// В phantomjs <2.0 нет Function.prototype.bind
// См. https://github.com/ariya/phantomjs/issues/10522
(function () {
    if (!Function.prototype.bind) {
        var slice = Array.prototype.slice;
        Function.prototype.bind = function (ctx) {
            var fn = this;
            var args = slice.call(arguments, 1);
            return function () {
                return fn.apply(ctx, args.concat(slice.call(arguments)));
            };
        };
    }
}());

var expect = chai.expect;

mocha.setup('bdd');
mocha.checkLeaks();
mocha.globals(['jQuery*']);
chai.Assertion.includeStack = true;

setTimeout(function () {
    if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
    } else {
        mocha.run();
    }
}, 0);