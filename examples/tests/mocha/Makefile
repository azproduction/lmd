BIN = $(CURDIR)/node_modules/.bin

.PHONY: test
test:
	@(cd test && \
	find test.*.js | \
	xargs -I % sh -c '$(BIN)/lmd build test --modules.main ../%; $(BIN)/mocha-phantomjs common/index.html' \
	)
