// Note! This is PhantomJS environemt!

module.exports = {
    afterEnd: function (reporter) {
        var result = reporter.page.evaluate(new Function(
            'var variable = window.__coverage__;' +
            'return typeof variable === "object" ? JSON.stringify(variable) : variable;'
        ));

        if (!result) {
            return;
        }

        var id = Math.random().toString(16).replace('0.', '');
        require('fs').write('./test/coverage-' + id + '.json', result);
    }
};
