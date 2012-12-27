LMD_BUILD = ../../bin/lmd.js

all: test

test: build_test
	@node ./test/qunit/run-test.js

build_test:
	@cd test/qunit; node $(LMD_BUILD) build test
	@cd test/qunit; node $(LMD_BUILD) build node_test
	@cd test/qunit; node $(LMD_BUILD) build worker_test
	@cd test/qunit; node $(LMD_BUILD) build promise_test

build_stats:
	@cd test/qunit; node $(LMD_BUILD) build test --stats_auto --stats --stats_sendto
	@cd test/qunit; node $(LMD_BUILD) build node_test
	@cd test/qunit; node $(LMD_BUILD) build worker_test
	@cd test/qunit; node $(LMD_BUILD) build promise_test

coverage: build_test
	rm -rf coverage/*
	jscoverage --exclude=modules --exclude=vendors --exclude=mock ./test/qunit ./test/coverage
	cp -R ./test/qunit/modules ./test/coverage
	cp -R ./test/qunit/mock ./test/coverage
	cp -R ./test/qunit/vendors ./test/coverage

run_qunit:
	http-server ./test/qunit/

run_coverage:
	http-server ./test/coverage/

run_stats:
	@cd test/qunit; node $(LMD_BUILD) server test

help:
	@echo "USAGE:\n\tmake\n\tmake test\ntmake coverage\n\tmake run_qunit\n\tmake run_coverage"

.PHONY: all test clean