LMD_BUILD = ../../bin/lmd.js

all: development production

development:
	node $(LMD_BUILD) -m main -c ./cfgs/index.development.lmd.json -o ./out/index.development.lmd.js -l

production:
	node $(LMD_BUILD) -m main -c ./cfgs/index.production.lmd.json -o ./out/index.production.lmd.js -l

help:
	@echo "USAGE:\n\tmake\n\tmake development\n\tmake production"