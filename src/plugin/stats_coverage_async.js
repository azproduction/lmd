/**
 * Coverage for off-package LMD modules
 *
 * Flag "stats_coverage_async"
 *
 * This plugin provides a bunch of private functions
 *
 * This plugin is HUGE - it includes all UglifyJs code
 */

/**
 * @name sandbox
 */
(function (sb) {

var coverage_apply = (function () {
var mock_exports = {},
    mock_modules = {};

var mock_require = function (name) {
    return mock_modules[name];
};

mock_modules["./squeeze-more"] = {};

mock_modules["./parse-js"] = (function () {
var exports = {};
//#JSCOVERAGE_IF 0
/*if ($P.STATS_COVERAGE_ASYNC) include('../vendors/parse-js.js');*/
//#JSCOVERAGE_ENDIF
return exports;
}());

mock_modules["./process"] = (function (require) {
var exports = {};
//#JSCOVERAGE_IF 0
/*if ($P.STATS_COVERAGE_ASYNC) include('../vendors/process.js');*/
//#JSCOVERAGE_ENDIF
return exports;
}(mock_require));

mock_modules["uglify-js"] = {
    parser: mock_modules["./parse-js"],
    uglify: mock_modules["./process"]
};

(function (require, exports) {
//#JSCOVERAGE_IF 0
/*if ($P.STATS_COVERAGE_ASYNC) include('../../lib/coverage_apply.js');*/
//#JSCOVERAGE_ENDIF
} (mock_require, mock_exports));

var interpret = mock_exports.interpret;
return function (moduleName, file, content, isPlainModule) {
    var coverageResult = interpret(moduleName, file, content, isPlainModule ? 0 : 1),
        moduleOption = coverageResult.options;

    sb.trigger('*:stats-coverage', moduleName, moduleOption);
    return coverageResult.code;
};

} ());

    /**
     * @event *:coverage-apply applies code coverage for module
     *
     * @param {String} moduleName
     * @param {Object} module
     *
     * @retuns yes
     */
sb.on('*:coverage-apply', function (moduleName, module) {
    var isPlainModule = sb.trigger('*:is-plain-module', moduleName, module, false)[2];
    module = coverage_apply(moduleName, moduleName, module, isPlainModule);

    return [moduleName, module];
});

}(sandbox));