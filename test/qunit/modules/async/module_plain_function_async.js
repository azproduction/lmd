require('ok')(true, "async plain function should be called once");

module.exports.some_function = function () {
    return true;
};