(function (require, exports, module) {
    require('ok')(true, "fe should be called once");

    return function () {
        return true;
    }
})