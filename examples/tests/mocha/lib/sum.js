module.exports = function (a, b) {
    if (isNaN(a) || typeof a !== 'number' || isNaN(b) || typeof b !== 'number') {
        throw new TypeError('a and b should be numbers');
    }
    return a + b;
};
