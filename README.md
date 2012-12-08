# LMD: Lazy Module Declaration [![Build Status](https://secure.travis-ci.org/azproduction/lmd.png?branch=master)](http://travis-ci.org/azproduction/lmd)

Big JavaScript application cause huge startup latency. A 1Mb of JavaScript initializes about ~600-3000ms! without
touching any part of DOM. It evals module only when they are required.
LMD is inspired by AMD and provides similar module interface

## Why LMD? Why not AMD (RequireJS)?

 - Module design is similar to Node.js
   - Actually LMD can work with any JavaScript modules
   - There is no define wrapper!
   - You can use node modules without dirty hacks like `typeof exports ? :`
   - But you can use old-school function-wrapped-modules. Like IIFE? - Good!
   - You can use strings as string without any "template" plugins
   - You can use JSON file as Object
 - Total and honest isolation
   - LMD package is fully-zero-isolated from globals (globals cant access LMD-pacakge, but LMD can)
   - Modules are isolated from LMD and from each module
   - Modules can be sandboxed (3-party modules, can exports only)
   - Plugins are isolated from LMD and from each module
 - Lazy interpretation and load
   - LMD can load off-package modules (all loaders can do it =)
   - It can interpret(eval) modules when they are required
 - List of depends are located in separate .json file
   - Well... list of 2 deps in file are ok, but 5+ are headache
   - Module is isolated from file system
   - You have to edit only 1 file if module path changes
   - Possible to use dynamic require()
 - Config inheritance
   - Easy to setup development, testing and production builds
 - Build watcher
   - Watcher detects changes in your files and performs rebuild
 - Flexible source
   - Minimal only 288bytes
   - High optimized own code
   - LMD builder performs build-time optimisations
 - Integrated code-coverage and source analytics tool
   - Its easy to enable believe me!
   - No extra servers or movements are required for off-package modules Code-Coverage
 - Transparent localStorage cache
   - Change config and html a bit and voila!
 - require() is not overloaded
   - Overloaded require is the way to mess in source
   - require.css() for css
   - require.js() for js (non LMD-modules)
   - require.async() for async LMD-modules (objects, strings, modules)
 - More
   - Can load CSS
   - Can work with Node.js and Worker environment


## What's on the board

  * All builders/loaders stuff bla-bla-bla
  * Build Analyzer (1-click code coverage, depends, startup perfomance)

![](https://raw.github.com/azproduction/lmd/master/images/coverage_package.png)

  * Smart and simple CLI tool

![](https://raw.github.com/azproduction/lmd/master/images/lmd_cli.png)

  * GUI for LMD (in development)

![](https://raw.github.com/azproduction/lmd/master/images/lmd_gui_prototype.png)

## Other features

1. Modules are similar to AMD: there is a require, but no define
2. LMD does not create globals
3. LMD is standalone, tiny and flexible (minimal only 288bytes!)
4. Each function-module can be initialized/evaled on demand (`lazy: true`)
5. LMD module is as easy to debug as normal JavaScript file
6. Build system compresses JavaScript files using UglifyJs
7. LMD module can define object via `return` or `module.exports` or `exports` as CommonJS Module
8. Module can be wrapped automatically in builder so you can write your modules as node.js modules
([Asynchronous module require](https://github.com/azproduction/lmd/blob/master/docs/plugins_usage.md#asynchronous-module-require))
9. Starting from version 1.5.2 LMD can require off-package modules `"async": true`
(see [Asynchronous module require](https://github.com/azproduction/lmd/blob/master/docs/plugins_usage.md#asynchronous-module-require))
10. From version 1.6.0 LMD can cache all in-package modules in localStorage `"cache": true`
(see [Local Storage cache](https://github.com/azproduction/lmd/blob/master/docs/plugins_usage.md#local-storage-cache))
11. From version 1.6.2 LMD can include off-package css `css: true` and js-files `js: true`(for jsonp, cross-origin JS or non LMD modules)
12. LMD package is possible to run as Web Worker or execute as Node.js script
(see [Web Worker and Node.js](https://github.com/azproduction/lmd/blob/master/docs/plugins_usage.md#web-worker-and-nodejs))
13. LMD works in all modern browsers and in older IE
(see [Browsers support](https://github.com/azproduction/lmd/blob/master/docs/plugins_usage.md#browsers-support))
14. LMD can convert non-LMD modules to LMD to use jquery or any other as in-package LMD module
(see [LMD module form third-party modules](https://github.com/azproduction/lmd/blob/master/docs/modules_options.md#lmd-module-form-third-party-modules))
15. LMD can protect your code from 3-party modules (see [Modules sandbox](https://github.com/azproduction/lmd/blob/master/docs/modules_options.md#modules-sandbox))
16. Code Coverage? - Easy! (see [Code coverage](https://github.com/azproduction/lmd/blob/master/docs/code_coverage_and_stats.md))
17. Ready for production - `lmd.js` is 100% covered by unit tests see [test/README.md](/azproduction/lmd/tree/master/test) for details
18. SourceMap for all LMD modules (see [Source map](https://github.com/azproduction/lmd/blob/master/docs/source_map.md))
19. Reach CLI interface

## Installing

`npm install lmd -g` global is prefered for LMD CLI comands.

## Getting started with LMD

See [Getting Started](https://github.com/azproduction/lmd/blob/master/docs/getting_started.md) and
[Project structure](https://github.com/azproduction/lmd/blob/master/docs/project_structure.md)
and [Docs](https://github.com/azproduction/lmd/tree/master/docs)

## LMD Config file

**Minimal**

```javascript
{
    "root": "../modules/",
    "output": "../module.lmd.js", // Path are relative to the root parameter
    "modules": {
        "*": "*.js" // use wildcards or specify regex string to grep
    }
}
```

See [LMD Config](https://github.com/azproduction/lmd/blob/master/docs/lmd_config.md) for more information

**Note**

 - You can extend config file with another using `"extends": "path/to/file.lmd.json"` parameter
 - You can also specify module depends by adding `"depends"` options see [Modules depends](https://github.com/azproduction/lmd/blob/master/docs/modules_options.md#modules-depends)

## Build LMD package from Console

`lmd build your_buiild_name`

See [LMD CLI](https://github.com/azproduction/lmd/blob/master/docs/cli.md)

## Grunt integration and task

Install this grunt plugin next to your project's [grunt.js gruntfile](https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md) with: `npm install grunt-lmd`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-lmd');
```

See [grunt-lmd](https://github.com/azproduction/grunt-lmd) for details

## Running tests

`phantomjs` is required to run test via `npm test` see [test](/azproduction/lmd/tree/master/test) for details

--

If you like LMD - ★ it via `npm star lmd`
