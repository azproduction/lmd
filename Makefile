LMD_BUILD = ../../bin/lmd.js
BIN = ./node_modules/.bin
MOCHA = $(BIN)/mocha

all: test

test: build_test
	$(MOCHA) -u bdd -R spec --recursive test/build
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

build_examples:
	@cd examples/features/glob; node ../$(LMD_BUILD) build index
	@cd examples/features/interpolation; node ../$(LMD_BUILD) build index
	@cd examples/features/mixins; node ../$(LMD_BUILD) build index
	@cd examples/plugins/amd; node ../$(LMD_BUILD) build index
	@cd examples/plugins/async; node ../$(LMD_BUILD) build index
	@cd examples/plugins/async_plainonly; node ../$(LMD_BUILD) build index
	@cd examples/plugins/cache; node ../$(LMD_BUILD) build index
	@cd examples/plugins/cache_async; node ../$(LMD_BUILD) build index
	@cd examples/plugins/css; node ../$(LMD_BUILD) build index
	@cd examples/plugins/image; node ../$(LMD_BUILD) build index
	@cd examples/plugins/js; node ../$(LMD_BUILD) build index
	@cd examples/plugins/parallel; node ../$(LMD_BUILD) build index
	@cd examples/plugins/promise; node ../$(LMD_BUILD) build index
	@cd examples/plugins/stats; node ../$(LMD_BUILD) build index
	@cd examples/plugins/stats_coverage; node ../$(LMD_BUILD) build index
	@cd examples/plugins/user_plugins; node ../$(LMD_BUILD) build index

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

.PHONY: all test clean test_builder