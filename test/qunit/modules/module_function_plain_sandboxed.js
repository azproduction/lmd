if (typeof require === "function") {
//#JSCOVERAGE_IF 0
    throw 'require should not be a function';
//#JSCOVERAGE_ENDIF
}

exports.some_function = function () {
    return true;
};