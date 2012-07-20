Mock Chat: Part of loader test example
--------------------------------------

 - `index.html` - basic version without cache
 - `index_cahce.html` - version with localStorage cache enabled

This demo is the part of loader tests http://azproduction.github.com/loader-test/
There a huge amount of useless code in each module (for extra weight).

Run `make` to build project

Run example
-----------

```
$ npm install http-server -g
$ make
$ http-server
```

Run stats server
----------------

 1. First of all make and build this example
 2. Run example `$ http-server`
 3. Start stats server: `make run_stats` log and admin server will run on `0.0.0.0:8081`
 4. Browse your example `http://localhost:8080` when you click on roster the application will post log to the stats server
 5. Open stats server admin interface `http://localhost:8081` and see the results
 6. Click roster item again (to resend stats report) and refresh report to see updated results

You may also enable code coverage for async modules by adding "stats_coverage_async" flag to `js/lmd/index.lmd.json` file.
Warning "stats_coverage_async" flag is extreme lag source!

