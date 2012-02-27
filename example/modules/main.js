function main(require) {
    // Common Worker or Browser
    var i18n = require('i18n'),
        text = i18n.hello +  ', lmd',
        $, print, Worker, worker, cfg;


    if (typeof window !== "undefined") {
        // Browser
        print = require('depA');
        Worker = require('Worker'); // grab from globals
        cfg = require('config');

        $ = require('$'); // grab module from globals: LMD version 1.2.0

        $(function () {
            $('#log').text(text);
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