(function (require, exports, module) {
    require('ok')(true, "async function should be called once");

    module.exports.some_function = function () {
        return true;
    };
})