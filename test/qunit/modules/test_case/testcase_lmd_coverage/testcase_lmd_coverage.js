(function (require) {
    var test = require('test'),
        asyncTest = require('asyncTest'),
        deepEqual = require('asyncTest'),
        start = require('start'),
        module = require('module'),
        ok = require('ok'),
        expect = require('expect'),
        $ = require('$'),
        raises = require('raises'),

        rnd = '?' + Math.random(),

        ENV_NAME = require('worker_some_global_var') ? 'Worker' : require('node_some_global_var') ? 'Node' : 'DOM';

    module('LMD Stats coverage @ ' + ENV_NAME);

    test("Coverage", function () {
        expect(6);

        require("coverage_fully_covered");
        require("coverage_not_conditions");
        require("coverage_not_functions");
        require("coverage_not_statements");
        // do not call "coverage_not_covered"

        var stats = require.stats(),
            report;

        report = stats.modules["coverage_fully_covered"].coverage.report;

        for (var i in report) {
            if (report.hasOwnProperty(i)) {
                ok(false, "should be fully covered!");
            }
        }

        report = stats.modules["coverage_not_conditions"].coverage.report;
        ok(report[2].conditions, "coverage_not_conditions: not 1 line");
        ok(report[3].lines === false, "coverage_not_conditions: not 2 line");

        report = stats.modules["coverage_not_functions"].coverage.report;
        ok(report[3].functions[0] === "test", "coverage_not_functions: not 2 line");
        ok(report[4].lines === false, "coverage_not_functions: not 3 line");

        report = stats.modules["coverage_not_statements"].coverage.report;
        ok(report[11].lines === false, "coverage_not_statements: not 11 line");

        report = stats.modules["coverage_not_covered"].coverage.report;
        ok(report[1] && report[2] && report[3] && report[6] && report[7], "coverage_not_covered: not covered");
    });

    asyncTest("Coverage - Async: stats_coverage_async", function () {
        expect(2);

        require.async(['coverage_fully_covered_async', 'coverage_not_functions_async'], function () {
            var stats = require.stats(),
                report;

            report = stats.modules["coverage_fully_covered_async"].coverage.report;

            for (var i in report) {
                if (report.hasOwnProperty(i)) {
                    ok(false, "should be fully covered!");
                }
            }

            report = stats.modules["coverage_not_functions_async"].coverage.report;
            ok(report[3].functions[0] === "test", "coverage_not_functions: not 2 line");
            ok(report[4].lines === false, "coverage_not_functions: not 3 line");

            start();
        });
    });
})