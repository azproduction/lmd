LMD_BUILD = ../bin/lmd.js

all: development production

development:
	node $(LMD_BUILD) ./cfgs/index.development.lmd.json ./out/index.development.lmd.js

production:
	node $(LMD_BUILD) ./cfgs/index.production.lmd.json ./out/index.production.lmd.js

help:
	@echo "USAGE:\n\tmake\n\tmake development\n\tmake production"