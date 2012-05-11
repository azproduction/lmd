LMD_BUILD = ../bin/lmd.js

all: test

test:
	node $(LMD_BUILD) -m main -c ./qunit/cfgs/test.lmd.json -o ./qunit/out/test.lmd.js -l
	node $(LMD_BUILD) -m main -c ./qunit/cfgs/node_test.lmd.json -o ./qunit/out/node_test.lmd.js -l
	node $(LMD_BUILD) -m main -c ./qunit/cfgs/worker_test.lmd.json -o ./qunit/out/worker_test.lmd.js -l

coverage: test
	rm -rf coverage/*
	jscoverage --exclude=modules --exclude=vendors --exclude=mock qunit coverage
	cp -R qunit/modules coverage/modules
	cp -R qunit/mock coverage/mock
	cp -R qunit/vendors coverage/vendors

run_qunit:
	cd qunit && http-server

run_coverage:
	cd coverage && http-server

help:
	@echo "USAGE:\n\tmake\n\tmake test\n\t\make coverage\n\tmake run_qunit\n\tmake run_coverage"