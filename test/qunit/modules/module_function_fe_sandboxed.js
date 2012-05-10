(function (require, exports, module) {
    if (require !== null) {
        throw 'require should be null';
    }

    exports.some_function = function () {
        return true;
    };
})