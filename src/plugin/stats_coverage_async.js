/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 * @name coverage_options
 * @name coverage_module
 */

var coverage_apply = (function () {
var mock_exports = {},
    mock_modules = {};

var mock_require = function (name) {
    return mock_modules[name];
};

mock_modules["./squeeze-more"] = {};

mock_modules["./parse-js"] = (function () {
var exports = {};
/*if ($P.STATS_COVERAGE_ASYNC) include('../vendors/parse-js.js');*/
return exports;
}());

mock_modules["./process"] = (function (require) {
var exports = {};
/*if ($P.STATS_COVERAGE_ASYNC) include('../vendors/process.js');*/
return exports;
}(mock_require));

mock_modules["uglify-js"] = {
    parser: mock_modules["./parse-js"],
    uglify: mock_modules["./process"]
};

(function (require, exports) {
/*if ($P.STATS_COVERAGE_ASYNC) include('../../lib/coverage_apply.js');*/
} (mock_require, mock_exports));

var interpret = mock_exports.interpret;
return function (moduleName, file, content, isPlainModule) {
    var coverageResult = interpret(moduleName, file, content, isPlainModule ? 0 : 1),
        moduleOption = coverageResult.options;

    coverage_module(moduleName, moduleOption.lines, moduleOption.conditions, moduleOption.functions);
    return coverageResult.code;
};

} ());