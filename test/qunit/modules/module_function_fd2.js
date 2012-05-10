function fd2(require, exports, module) {
    require('ok')(true, "fd2 should be called once");

    return function () {
        return true;
    }
}