LMD_BUILD = ../../../../bin/lmd.js

all:
	@cd ./js/lmd; node $(LMD_BUILD) build index
	@cd ./js/lmd_cache; node $(LMD_BUILD) build index
	@cd ./js/amd; node $(LMD_BUILD) build index

run_stats:
	@cd ./js/lmd; node $(LMD_BUILD) server index

run_stats_amd:
	@cd ./js/amd; node $(LMD_BUILD) server index

help:
	@echo "USAGE:\n\tmake\n\tmake run_stats"