LMD_BUILD = ../../bin/lmd.js
LMD_STATS = ../../bin/lmd_stats.js

all:
	node $(LMD_BUILD) -m main -c ./js/lmd/index.lmd.json -o ./js/lmd/index.lmd.js -l
	node $(LMD_BUILD) -m main -c ./js/lmd_cache/index.lmd.json -o ./js/lmd_cache/index.lmd.js -l

run_stats:
	mkdir -p logs
	node $(LMD_STATS) -address 0.0.0.0 -port 8081 -config ./js/lmd/index.lmd.json -log ./logs/ -www ./

help:
	@echo "USAGE:\n\tmake\n\tmake run_stats"