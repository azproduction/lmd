function fd(require, exports, module) {
    if (typeof require !== "undefined") {
//#JSCOVERAGE_IF 0
        throw 'require should be null';
//#JSCOVERAGE_ENDIF
    }

    exports.some_function = function () {
        return true;
    };
}