function fd(require, exports, module) {
    require('ok')(true, "fd should be called once");

    return function () {
        return true;
    }
}