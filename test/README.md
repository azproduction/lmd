LMD tests
=========

Tests requires `http-server` (`npm install http-server -g`) and `jscoverage` http://siliconforks.com/jscoverage/

Qunit test
----------

1. Build test via `make qunit`
2. Start via `make run_qunit` and browse http://localhost:8080

**Note** run qunit test on http server or "LMD loader" test will fail

Code coverage
-------------

1. Download and build/install jscoverage and `http-server`
2. Create tests via `make coverage`
3. Run coverage tests via `make run_coverage` and browse http://localhost:8080/jscoverage.html?u=index.html
4. Switch to "Summary" tab for results

Run test via PhantomJs
----------------------

1. Download and build/install phantomjs
2. Start http-server `http-server test/qunit -a 127.0.0.1 -p 8080`
3. Execute test using phantomjs: `phantomjs test/qunit/phantomjs-index.js "http://localhost:8080/index.html"`