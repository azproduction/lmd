/*global describe, it, beforeEach, afterEach, expect*/
/*jshint expr:true*/

var sum = require('sum');

describe('sum', function () {

    it('calculates sum of two numbers', function () {
        expect(sum(1, 1)).to.eql(2);
    });

    it('sums only first two arguments', function () {
        expect(sum(1, 1, 1)).to.eql(2);
    });

    it('throws TypeError exception if one of arguments is not a number', function () {
        expect(function () {
            sum('', 1);
        }).to.throw(TypeError, /a and b should be numbers/);

        expect(function () {
            sum('', '');
        }).to.throw(TypeError, /a and b should be numbers/);

        expect(function () {
            sum(1, '');
        }).to.throw(TypeError, /a and b should be numbers/);
    });

});
