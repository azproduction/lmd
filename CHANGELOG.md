**v1.11.x**

  - changelog reversed
  - `styles` - styles builder. See [demo](http://lmdjs.org/examples/features/styles/), [code](examples/features/styles/)
  - default bundle separator changed from `-bundle-` to `.`
  - empty styles and scripts will not be printed into file
  - lmd-info(1) ✘ and warn become yellow
  - lmd-info(1) prints bundles info include missing bundles
  - lmd-info(1) prints styles info
  - Remove strict warnings on dependencies
  - Do not stream styles and scripts If they are not defined
  - `banner` property. See [code](examples/features/banner/)
  - Bugfix #169 If no bundles lmd should not print "bundle" in options

**v1.10.x**

  - `image` - image loader plugin. See [demo](http://lmdjs.org/examples/plugins/image/), [code](examples/plugins/image/)
  - `promise` - promise interface plugin. See [demo](http://lmdjs.org/examples/plugins/promise/), [code](examples/plugins/promise/)
  - `optimize` - a tweak flag enables special LMD optimisations without minification
  - Now you can use `name` and `description` fields
  - User custom plugins. See [demo](http://lmdjs.org/examples/plugins/user_plugins/), [code](examples/plugins/user_plugins/)
  - Config string interpolation/templates. See [demo](http://lmdjs.org/examples/features/interpolation/), [code](examples/features/interpolation/)
  - Glob - you can specify glob pattern (eg `"${name}": "js/**/*.js"`) to match multiply files. See [demo](http://lmdjs.org/examples/features/glob/), [code](examples/features/glob/)
  - lmd-build(1) and lmd-info(1) are prints version parameter if defined
  - [Plugin demos](examples/plugins/)
  - Bugfixes #83 #81 #79 #78 #66
  - bash zsh autocomplete
  - Examples for "depends", "extends", "sandbox"
  - Docs are located on GH Wiki
  - `preload` - this plugins is simmilar to `async`, it only caches modules without executing them. See [demo](http://lmdjs.org/examples/plugins/preload/), [code](examples/plugins/preload/)
  - http://lmdjs.org/
  - adaptation example. See [demo](http://lmdjs.org/examples/features/adaptation/), [code](examples/features/adaptation/)
  - require.preload plugin. See [demo](http://lmdjs.org/examples/plugins/preload/), [code](examples/plugins/preload/)
  - optimize flag. See [demo](http://lmdjs.org/examples/features/optimize/), [code](examples/features/optimize/)
  - build info in the build.js file
  - ThisBinding of 3-party module "bind" or "this" property
  - `bundles` - basic part
  - `file_protocol` - tweaks for `file://`
  - `lmdjs_configs` - you can write config files in JavaScript. See [demo](http://lmdjs.org/examples/features/lmdjs_configs/), [code](examples/features/lmdjs_configs/)
  - `match` - enables `require.match(RegExp): Object` requires every matched module name. See [demo](http://lmdjs.org/examples/plugins/match/), [code](examples/plugins/match/)`
  - `multi_module` - feature allows you to use multiply files as one module. Eg jquery+plugins. See [demo](http://lmdjs.org/examples/features/multi_module/), [code](examples/features/multi_module/)
  - Google Closure Compile is ADVANCED mode
  - #137 Custom localStorage key for LMD cache plugin
  - #138 lmd watch fix for node 0.10.x
  - #144 `ignore_module` feature. See [demo](http://lmdjs.org/examples/features/ignore_module/), [code](examples/features/ignore_module/)
  - #147 `sourcemap_url` config property. See [Wiki page about Source Map](https://github.com/azproduction/lmd/wiki/SourceMap)

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
  - `"stats_auto": true` automatic statistics push
  - plugins depends

**v1.8.x**

  - Plugins interface are totally rewritten
  - Test runner via `npm test` or `make test`
  - Tail semicolons cleanup
  - Lmd is Readable Stream
  - Lmd Watch upstart rebuild, watch for lmd.json
  - AMD module adaptor `amd` flag
  - Source Map

**v1.7.x**

  - **Note** in sandboxed module require can be an object (`{coverage_line, coverage_function, coverage_condition}`) if sandboxed module is under code coverage
  - `require.async()` can load plain modules flags `async_plain`, `async_plainonly`
  - `require.stats()` shows modules usage and code coverage. Flags `stats`, `stats_coverage`, `stats_sendto`
  - in-package Code coverage. Flag `stats_coverage`
  - Stats server
  - LMD module from non-lmd module
  - `config.lazy=false` by default now
  - Local Storage cache in Opera Mobile is disabled (OM cant Function#toString...)
  - `root` alias to `path`
  - Module depends
  - off-package Code coverage. Flag `stats_coverage_async`
  - Phantom JS and Travis CI integration
  - Improved Stats Server: require timeline, require graph
  - Pack options UglifyJS `pack_options` issue #41 parameter

**v1.6.x**

  - Local Storage cache - config flag `cache: true`
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

**v1.5.x**

  - Watch mode
  - New version of argv params
  - String module
  - LMD async - loader of off-package modules see "Asynchronous module require" in this README

**v1.4.x**

  - Config extends (now config can extend common config file)
  - Headless module without function wrapper like Node.js module
  - Possible to specify LMD.js version for build - `lmd_min` (old one) or `lmd_tiny`
  - Per module lazy flag `"Module": {"path": "Module.js", "lazy": false}`
  - Sandbox flag is moved to module descriptor. `{"sandbox": {...}}` is deprecated
  - Modified LmdBuilder constructor
  - Lots of comments in LmdBuilder

**v1.3.x**

 - Modules sandboxing
 - Named global object (default this)
 - Updated example - added worker part and config file with environment-specific data

**v1.2.x**

 - LMD can grab modules from globals (jQuery, Ext, Backbone, Underscore) if module is not found in package
 - Wildcard build bugfixes
 - Makefile for example

**v1.1.x**

 - Recursive module inclusion and wildcards in descriptors
