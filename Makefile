LMD_BUILD = ./bin/lmd.js

all: test

test:
	node $(LMD_BUILD) -m main -c ./test/qunit/cfgs/test.lmd.json -o ./test/qunit/out/test.lmd.js -l
	node $(LMD_BUILD) -m main -c ./test/qunit/cfgs/node_test.lmd.json -o ./test/qunit/out/node_test.lmd.js -l
	node $(LMD_BUILD) -m main -c ./test/qunit/cfgs/worker_test.lmd.json -o ./test/qunit/out/worker_test.lmd.js -l

coverage: test
	rm -rf coverage/*
	jscoverage --exclude=modules --exclude=vendors --exclude=mock ./test/qunit ./test/coverage
	cp -R ./test/qunit/modules ./test/coverage/modules
	cp -R ./test/qunit/mock ./test/coverage/mock
	cp -R ./test/qunit/vendors ./test/coverage/vendors

run_qunit:
	http-server ./test/qunit/

run_coverage:
	http-server ./test/coverage/

help:
	@echo "USAGE:\n\tmake\n\tmake test\ntmake coverage\n\tmake run_qunit\n\tmake run_coverage"

.PHONY: all test clean