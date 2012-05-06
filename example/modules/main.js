function main(require) {
    // Common Worker or Browser
    var i18n = require('i18n'),
        text = i18n.hello +  ', lmd',
        $, print, Worker, worker, cfg, tpl, escape;


    if (typeof window !== "undefined") {
        // Browser
        print = require('depA');
        escape = require('depB');
        Worker = require('Worker'); // grab from globals
        cfg = require('config');
        tpl = require('template'); // template string

        $ = require('$'); // grab module from globals: LMD version 1.2.0

        $(function () {
            // require off-package module config. Config flag: `async: true`
            // LMD parses content of module depend on Content-type header!
            // *** You must work on you HTTP server for correct headers,
            // *** if you work offline (using file:// protocol) then
            // *** Content-type header will be INVALID so all modules will be strings
            require.async('./modules/templates/async_template.html', function (async_template) {
                $('#log').html(
                    // use template to render text
                    typeof async_template !== "undefined" ?
                        async_template.replace('${content}', tpl.replace('${content}', escape(text))) :
                        tpl.replace('${content}', escape(text))
                );
            });

            // require some off-package javascript file - not a lmd module. Config flag: `js: true`
            require.js('./vendors/jquery.someplugin.js', function (scriptTag) {
                if (typeof scriptTag !== "undefined") {
                    print($.somePlugin());
                } else {
                    print('fail to load: ./vendors/jquery.someplugin.js');
                }
            });

            // require some off-package css file. Config flag: `css: true`
            require.css('./css/b-template.css', function (linkTag) {
                if (typeof linkTag !== "undefined") {
                    print('CSS - OK!');
                } else {
                    print('fail to load: ./css/b-template.css');
                }
            })
        });

        if (Worker) { // test if browser support workers
            worker = new Worker(cfg.worker);
            worker.addEventListener('message', function (event) {
                print("Received some data from worker: " + event.data);
            }, false);
        }
    } else {
        // Worker
        print = require('workerDepA');
    }


    // Common Worker or Browser
    print(text);
}