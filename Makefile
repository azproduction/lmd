LMD_BUILD = ../../bin/lmd.js
BIN = ./node_modules/.bin
MOCHA = $(BIN)/mocha

all: test

test: test_plugins test_builder build_examples

# Build time tests
test_builder:
	@echo 'travis_fold:start:test_builder'
	$(MOCHA) -u bdd -R spec --recursive test/build
	@echo 'travis_fold:end:test_builder'

# Client-side tests of all plugins
test_plugins: build_test
	@echo 'travis_fold:start:test_plugins'
	@node ./test/qunit/run-test.js
	@echo 'travis_fold:end:test_plugins'

build_test:
	@echo 'travis_fold:start:build_test'
	@cd test/qunit; node $(LMD_BUILD) build test
	@cd test/qunit; node $(LMD_BUILD) build node_test
	@cd test/qunit; node $(LMD_BUILD) build worker_test
	@cd test/qunit; node $(LMD_BUILD) build promise_test
	@cd test/qunit; node $(LMD_BUILD) build bundles_test
	@echo 'travis_fold:end:build_test'

build_stats:
	@cd test/qunit; node $(LMD_BUILD) build test --stats_auto --stats --stats_sendto
	@cd test/qunit; node $(LMD_BUILD) build node_test
	@cd test/qunit; node $(LMD_BUILD) build worker_test
	@cd test/qunit; node $(LMD_BUILD) build promise_test

# Smoke tests for all examples
build_examples:
	@echo 'travis_fold:start:smoke'
	# Features
	@cd examples/features/adaptation; node ../$(LMD_BUILD) build index
	@cd examples/features/bundles; node ../$(LMD_BUILD) build index
	@cd examples/features/depends; node ../$(LMD_BUILD) build index
	@cd examples/features/extends; node ../$(LMD_BUILD) build dev
	@cd examples/features/glob; node ../$(LMD_BUILD) build index
	@cd examples/features/ignore_module; node ../$(LMD_BUILD) build ignoring
	@cd examples/features/interpolation; node ../$(LMD_BUILD) build index
	@cd examples/features/lmdjs_configs; node ../$(LMD_BUILD) build index
	@cd examples/features/mixins; node ../$(LMD_BUILD) build index+prod+ru --output=index-prod.ru.js
	@cd examples/features/multi_module; node ../$(LMD_BUILD) build index
	@cd examples/features/optimize; node ../$(LMD_BUILD) build index
	@cd examples/features/sandbox; node ../$(LMD_BUILD) build index
	@cd examples/features/styles; node ../$(LMD_BUILD) build index
	@cd examples/features/banner; node ../$(LMD_BUILD) build index
	@cd examples/features/banner; node ../$(LMD_BUILD) build dynamic

	# Plugins
	@cd examples/plugins/amd; node ../$(LMD_BUILD) build index
	@cd examples/plugins/async; node ../$(LMD_BUILD) build index
	@cd examples/plugins/async_plainonly; node ../$(LMD_BUILD) build index
	@cd examples/plugins/cache; node ../$(LMD_BUILD) build index
	@cd examples/plugins/cache_async; node ../$(LMD_BUILD) build index
	@cd examples/plugins/css; node ../$(LMD_BUILD) build index
	@cd examples/plugins/image; node ../$(LMD_BUILD) build index
	@cd examples/plugins/js; node ../$(LMD_BUILD) build index
	@cd examples/plugins/match; node ../$(LMD_BUILD) build index
	@cd examples/plugins/node; node ../$(LMD_BUILD) build index
	@cd examples/plugins/parallel; node ../$(LMD_BUILD) build index
	@cd examples/plugins/preload; node ../$(LMD_BUILD) build index
	@cd examples/plugins/promise; node ../$(LMD_BUILD) build index
	@cd examples/plugins/stats; node ../$(LMD_BUILD) build index
	@cd examples/plugins/stats_coverage; node ../$(LMD_BUILD) build index
	@cd examples/plugins/user_plugins; node ../$(LMD_BUILD) build index

	# Demos
	@cd examples/demos/backbone_lmd; node ../$(LMD_BUILD) build dev
	@cd examples/demos/backbone_lmd; node ../$(LMD_BUILD) build dev-cache
	@cd examples/demos/basic; node ../$(LMD_BUILD) build index.development
	@cd examples/demos/basic; node ../$(LMD_BUILD) build index.production
	@cd examples/demos/getting_started; node ../$(LMD_BUILD) build index
	@cd examples/demos/getting_started; node ../$(LMD_BUILD) build index+ru
	@cd examples/demos/mock_chat/js/amd; node ../../../$(LMD_BUILD) build index
	@cd examples/demos/mock_chat/js/lmd; node ../../../$(LMD_BUILD) build index
	@cd examples/demos/mock_chat/js/lmd_cache; node ../../../$(LMD_BUILD) build index
	@echo 'travis_fold:end:smoke'

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

.PHONY: all test clean test_builder test_plugins