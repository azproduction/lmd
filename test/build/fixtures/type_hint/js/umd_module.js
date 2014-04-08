(function (root, factory) {
    'use strict';
    if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        root.Queue = factory();
    }
})
(this, function () {
    return 'works';
});
