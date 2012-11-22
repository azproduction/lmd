**v1.1.x**

 - Recursive module inclusion and wildcards in descriptors

**v1.2.x**

 - LMD can grab modules from globals (jQuery, Ext, Backbone, Underscore) if module is not found in package
 - Wildcard build bugfixes
 - Makefile for example

**v1.3.x**

 - Modules sandboxing
 - Named global object (default this)
 - Updated example - added worker part and config file with environment-specific data

**v1.4.x**

  - Config extends (now config can extend common config file) see [examples/basic/cfgs](/azproduction/lmd/tree/master/examples/basic/cfgs)
  - Headless module without function wrapper like Node.js module
  - Possible to specify LMD.js version for build - `lmd_min` (old one) or `lmd_tiny`
  - Per module lazy flag `"Module": {"path": "Module.js", "lazy": false}`
  - Sandbox flag is moved to module descriptor. `{"sandbox": {...}}` is deprecated
  - Modified LmdBuilder constructor
  - Lots of comments in LmdBuilder

**v1.5.x**

  - Watch mode see "[Watch mode](#watch-mode)" in this README
  - New version of argv params see "[LMD CLI](#lmd-cli)" in this README
  - String module
  - LMD async - loader of off-package modules see "Asynchronous module require" in this README

**v1.6.x**

  - Local Storage cache - config flag `cache: true` see "[Local Storage cache](#local-storage-cache)" in this README
  - argv flag `-v`/`-version` is deprecated - use config flag `async: true` for `lmd_async.js` or false for `lmd_tiny.js` (default)
  - Created development version of example app without cache and production with cache=on
  - LMD can include off-package css `css: true` and js-files `js: true`(for jsonp, cross-origin JS or non LMD modules)
  - Unit tests and code coverage
  - Worker (`worker: true`) and Node.js (`node: true`) environments for require.css, require.js and require.async
  - Older IE support `ie: true` flag
  - Sandboxed module now accepts require arg as undefined (was null)
  - Callback argument in require.js .css .async now optional. Each of them returns require for chaining
  - Firefox 13 setTimeout callback poisoning bug
  - LMD Warnings for: Parse error, more to come...
  - Prevent requiring same sources while they are loading from server (`race` flag)
  - `require.async()` cache (`cache_async` flag)
  - LMD checks for direct globals access in lazy modules
  - Shortcuts `"shortcut": "@/path/to/real-file.js"` for `require.async("shortcut")` `.js()` or `.css()`
  - window.eval replaced with Function eval, removed IE eval hack
  - added `require.stats([moduleName])` flag `stats: false`
  - replaced old preprocessor with readable one

**v1.7.x**

  - **Note** in sandboxed module require can be an object (`{coverage_line, coverage_function, coverage_condition}`) if sandboxed module is under code coverage
  - `require.async()` can load plain modules flags `async_plain`, `async_plainonly`
  - `require.stats()` shows modules usage and code coverage. Flags `stats`, `stats_coverage`, `stats_sendto`
  - in-package Code coverage. Flag `stats_coverage`
  - Stats server
  - LMD module from non-lmd module (see [LMD module form third-party modules](#lmd-module-form-third-party-modules))
  - `config.lazy=false` by default now
  - Local Storage cache in Opera Mobile is disabled (OM cant Function#toString...)
  - `root` alias to `path`
  - Module depends
  - off-package Code coverage. Flag `stats_coverage_async`
  - Phantom JS and Travis CI integration
  - Improved Stats Server: require timeline, require graph
  - Pack options UglifyJS `pack_options` issue #41 parameter

**v1.8.x**

  - Plugins interface are totally rewritten
  - Test runner via `npm test` or `make test` [Running tests](#running-tests)
  - Tail semicolons cleanup
  - Lmd is Readable Stream
  - Lmd Watch upstart rebuild, watch for lmd.json
  - AMD module adaptor `amd` flag
  - Source Map

**v1.9.x**

  - Better LMD CLI
  - lmd info CLI command
  - mixins config option
  - mixins for lmd info, lmd build, lmd watch
  - `config.lazy=false` by default now
  - better `lmd info`: deep static analytics with depends, new `lmd info` flag `[--deep=true]`
  - content-based warnings in `lmd info` and `lmd build` for:
    - js
    - css
    - async
    - parallel
    - amd
    - shortcuts
  - Grunt.js integration section
  - finally `lmd -v`
  - `log` and `warn` are true by default
  - global check of lazy modules is deisabled
  - info of unused modules, suspicious globals and off-package modules paths
