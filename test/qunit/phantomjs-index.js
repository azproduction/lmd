var system = require('system'),
	page = require('webpage').create(),
    path = system.args[1];

page.onConsoleMessage = function (msg) {
	console.log(msg);
    if (/^\s+Assertion failed/.test(msg)) {
        phantom.exit(1);
    }

	if (/^Tests completed in/.test(msg)) {
        phantom.exit(0);
	}
};

page.open(path, function (status) {
	if (status !== 'success') {
		console.log('FAIL to load the address');
		phantom.exit(1);
	}
});