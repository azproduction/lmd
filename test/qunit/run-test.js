var httpServer = require('http-server'),
    childProcess = require('child_process');

var port = 8080,
    host = '127.0.0.1',
    phantomJsIndex = __dirname + "/phantomjs-index.js";

function startHttpServer(port, host, callback) {
    var options = {
        root: __dirname,
        autoIndex: true,
        cache: true
    };

    function onListening() {
        console.log('Starting up http-server, serving ' + server.root + ' on port: ' + port.toString());
        callback();
    }

    var server = httpServer.createServer(options);
    server.listen(port, host, onListening);

    if (process.platform !== 'win32') {
        //
        // Signal handlers don't work on Windows.
        //
        process.on('SIGINT', function () {
            console.warn('Http-server stopped.');
            process.exit(1);
        });
    }

    return server;
}

function runTestInPhantomJsEnvironment(runner, url, callback) {
    console.log('Starting up phantomjs, with runner ' + runner + ' and url ' + url);

    var ps = childProcess.spawn('phantomjs', [runner, url]);

    ps.stdout.on('data', function(buffer) {
        // Proxy data
        return process.stdout.write(buffer.toString('utf8'));
    });

    ps.stderr.on('data', function(buffer) {
        return console.warn(buffer.toString('utf8'));
    });

    ps.on('exit', callback);
}

var server = startHttpServer(port, host, function () {
    var url = "http://" + host + ":" + port + "/index.html";

    runTestInPhantomJsEnvironment(phantomJsIndex, url, function (code) {
        console.log('Stopping http-server');
        server.close();
        if (code === 127) {
            console.log('NOTE: phantomjs bin required to tun this test!');
        }
        console.log('Exit process with code ' + code);
        process.exit(code);
    });
});