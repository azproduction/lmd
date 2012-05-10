function lazy_fd(require, exports, module) {
    require('ok')(true, "lazy function must be evaled and called once");

    return function () {
        return true;
    }
}