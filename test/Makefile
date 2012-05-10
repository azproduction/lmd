LMD_BUILD = ../bin/lmd.js

all: test

test:
	node $(LMD_BUILD) -m main -c ./qunit/cfgs/test.lmd.json -o ./qunit/out/test.lmd.js -l

run:
	cd qunit && http-server

help:
	@echo "USAGE:\n\tmake\n\tmake test"