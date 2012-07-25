var system = require('system'),
	page = require('webpage').create(),
    path = system.args[1];

page.onConsoleMessage = function (msg) {
	console.log(msg);
	if (/^Tests completed in/.test(msg) || /^\s+Assertion failed/.test(msg)) {
		phantom.exit(page.evaluate(function () {
			if (window.QUnit && QUnit.config && QUnit.config.stats) {
				return QUnit.config.stats.bad || 0;
			}
			return 1;
		}));
	}
};

page.open(path, function (status) {
	if (status !== 'success') {
		console.log('FAIL to load the address');
		phantom.exit(1);
	}
});