LMD: Lazy (and synchronous) Module Declaration
==============================================

Big JavaScript application cause huge startup latency. A 1Mb of JavaScript initializes about ~600-3000ms! without touching any part of DOM. LMD is inspired by AMD and provides similar module interface. It evals module only when they are required.

Features
--------

1. Modules are similar to AMD: there is a require, but no define (all defined on startup)
2. LMD does not create globals
3. LMD is standalone, tiny and flexible (minimal only 288bytes! and up to 1.5Kb all-in-one)
4. All in-package modules are loaded at startup
5. Each function-module is initialized (evaled) on demand
6. LMD module is as easy to debug as normal JavaScript file
7. Build system compresses JavaScript files using uglifyjs (or any other)
8. LMD module can define object via return or module.exports/exports as CommonJS Module
9. Module can be wrapped automatically in builder so you can write your modules as node.js modules (see Usage and Asynchronous module require)
10. Starting from version 1.5.2 LMD can require off-package modules `"async": true` (see Asynchronous module require)
11. From version 1.6.0 LMD can cache all in-package modules in localStorage `"cache": true` (see Local Storage cache)
12. From version 1.6.2 LMD can include off-package css `css: true` and js-files `js: true`(for jsonp, cross-origin JS or non LMD modules)

Installing
----------

`npm install lmd` or global `npm install lmd -g`

LMD Modules
-----------

**1\.1\. Module - functions**

*main.js - module as function declaration*

```javascript
function main(require) {
    var print = require('depA'),
        i18n = require('i18n'),
        $ = require('$'); // grab module from globals: LMD version 1.2.0

    var text = i18n.hello +  ', lmd';

    print(text);

    $(function () {
        $('#log').text(text);
    });
}
```

*depA.js - module as function expression*

```javascript
(function (require/*, exports, module*/) {
    var escape = require('depB');
    return function(message) {
        console.log(escape(message));
    }
})
```

*depB.js - module as plain code like Node.js*

```javascript
// @globals require module exports
// CommonJS Module exports
// or exports.feature = function () {}
module.exports = function(message) {
    return message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
```

**Note**: plain module will be wrapped by builder `(function (require, exports, module) {\n%code%\n})`

**1\.2\. Module - objects (for config, i18n and other resources)**

*i18n.ru.json*

```javascript
{
    "hello": "Привет"
}
```

**1\.3\. Module - string (for templates)**

```html
<i class="b-template">${content}</i>
```

Config file
-----------

**index.production.lmd.json**

```javascript
{
    "path": "../modules/", // if starts with "/" it is absolute path else path will be relative to the config file
    "modules": {
        // basic module descriptor -- only path
        "main": "main.js",     // "module_pseudonym": "module_file"
        "depA": "depA.js",     // require("module_pseudonym").doModuleStuff()

        // extended module descriptor
        "depB": {
            "path": "depB.js",
            "sandbox": true,    // module is sandboxed - can't require
            "lazy": false,      // overloading of global lazy flag, for the purpose of load optimizing
                                // dont work with global cache flag
        },

        // string template
        "template": "templates/template.html"
        
        "i18n": "i18n.ru.json"
    },
    "main": "main",     // a main module - content of that module will be called on start (no reason to eval)
    "lazy": false,      // if true - all modules will be evaled on demand [default=true]
    "pack": false,      // if true - module will be packed using uglifyjs [default=true]
    "global": "this",   // name of global object, passed to the lmd [default="this"]
    "async": true,      // if modules uses off-package module set this to true [default=false]
    "cache": true,      // store all application lmd itself + all modules in localStorage
                        // this flag will force all modules to be lazy [default=false]
    "js": true,         // if you are going to load non LMD modules set this flag to true [default=false]
    "css": true         // enables css-loader feature `require.css` [default=false]
}
```

**index.development.lmd.json**

```javascript
{
    "path": "../modules/",
    "modules": {
        "depB": {              // extended module descriptor
            "path": "depB.js",
            "sandbox": true    // module is sandboxed
        },
        "*": "*.js",           // use wildcards or specify regex string to grep 
        "i18n": "i18n.ru.json" // similar files (no dir wildcards supported by now)
    },
    "main": "main",
    "lazy": false,
    "pack": false,
    "async": true,
    "js": true,
    "css": true
}
```

Build
-----

`lmd example/cfgs/index.development.lmd.json example/out/index.development.lmd.js` or `node ./lmd/bin/lmd.js ... `

Or print to `STDOUT`

`lmd example/cfgs/index.development.lmd.json`

Use
---

**index.development.lmd.js**

```javascript
(function (window) {
    /* ... LMD content ... */
}(window))({
"depA": function depA(require){
    return function(message) {
        console.log(message);
    }
}
})(function main(require) {
    var depA = require('depA');
    depA('ololo');
})
```

**index.production.lmd.js**

```javascript
(function(a){/* ... LMD content ... */})(window)
({depA:"(function(a){return function(a){console.log(a)}})"})
(function(b){var c=b("depA");c("ololo")})
```

Asynchronous module require `async`
-----------------------------------

You can build async LMD package.  (Disabled by default)

Then your packages can require off-package modules from http server.
Build LMD package using `async: true` flag. LMD loader now can require javascript FunctionsExpressions,
JSON or template strings asynchronously. LMD parses file content depend on `Content-type` header.
You must work online using HTTP server for correct headers, if you work offline (using `file:` protocol)
then `Content-type` header will be INVALID so all modules will be strings.

**Notice**
 - If you use `file:` protocol then all modules will be strings
 - LMD loader uses simple RegExp `/script$|json$/` with `Content-type` to determine the kind of content
and eval it (if json or javascript) or return as string
 - Your off-package module MUST be an FunctionsExpression wrapped in parentheses
 - If all you modules are in-package then set `async` flag to false (300 bytes less)
 - If async require fails (status code will be >= 400) loader will return `undefined`
   (LMD doesn't re-request on error)

```javascript
// Valid
(function (require, exports, module) {
    /* Module content */
})

// Invalid! - parse error in loader's eval
function (require, exports, module) {
    /* Module content */
}

// Bad but valid: module name will leak in global variables
function module(require, exports, module) {
    /* Module content */
}
```

**Example**

```javascript
(function main(require) {

    // async require of off-package module
    require.async('/css/_engine.css', function (css) {
        console.log('1', css.length); // result

        // require of module loaded async (already registered)
        console.log('2', require('/css/_engine.css').length);

        // require of in-package module
        console.log('3', require('pewpew'));
    });

    // async require of in-package module
    require.async('pewpew', function (pewpew) {
        console.log('4', pewpew);
    });
})
```

See `example/modules/main.js` near `async_template.html` for real life example

Local Storage cache `cache` and `version`
-----------------------------------------

You can store all your in-package modules and lmd itself in localStorage. (Disabled by default)

1. Set config flag `cache: true` and add `version: your_current_build_version` property to your
config file then build your LMD package - it will be created in cache mode. If no version - LMD package will run
in default mode - without dumping modules
2. Remove script tag `<script src="out/index.production.lmd.js" id="source"></script>` with LMD initializer:

```html
<script id="lmd-initializer"
        src="../src/lmd_initializer.min.js"
        data-src="out/index.production.lmd.js"
        data-version="1.6.0"
        data-key="lmd"></script>
```

 - `id` - always lmd-initializer (do not change it)
 - `src` - path to `lmd_initializer.js`
 - `data-key` - localStorage key where all lmd code stored (do not change it)
 - `data-version` - content in localStorage must match this version
 - `data-src` - fallback if version do not match or no localStorage or error or no content

See `example/cfgs/index.prodoction.lmd.json` and `example/index.html` for details

**Note**: `version` property from config and from `data-version` attribute must match to use code from localStorage!
Yep! Each time you have to change config file and your html file!

Loading CSS and JavaScript files `js` and `css`
-----------------------------------------------

You can enable flags `css: true` and `js: true` to use css and js loader as all loaders do. (Disabled by default)

```javascript
// require some off-package javascript file - not a lmd module. Config flag: `js: true`
require.js('./vendors/jquery.someplugin.js', function (scriptTag) {
    console.log(typeof scriptTag === "undefined" ? 'error' : 'js loaded');
});

// require some off-package css file. Config flag: `css: true`
require.css('./css/b-template.css', function (linkTag) {
    console.log(typeof linkTag === "undefined" ? 'error' : 'css loaded');
})
```

Watch mode
----------

During development its not very convenient to rebuild the LMD-package each time. You can run LMD package in watch mode
and LMD builder can rebuild your package automatically.

**Run LMD package in watch mode**

old style `lmd watch config.lmd.json output.js`

new style `lmd -m watch -c config.lmd.json -o output.js -l` the `-l` flag for verbose stdout log

or new style with long names `lmd -mode watch -config config.lmd.json -output output.js -log`

LMD CLI
--------------

old style `lmd [mode] config [output]`

new style `lmd [-m mode] -c config [-o output] [-l]`

**Arguments**

 - `-m` `-mode` lmd run mode `main` (default) or `watch`
 - `-c` `-config` lmd package config file
 - `-o` `-output` lmd output file - default STDOUT
 - `-l` `-log` print work log - default false

Major versions changelog
---------

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

  - Config extends (now config can extend common config file) see example/cfgs/*
  - Headless module without function wrapper like Node.js module
  - Possible to specify LMD.js version for build - `lmd_min` (old one) or `lmd_tiny`
  - Per module lazy flag `"Module": {"path": "Module.js", "lazy": false}`
  - Sandbox flag is moved to module descriptor. `{"sandbox": {...}}` is deprecated
  - Modified LmdBuilder constructor
  - Lots of comments in LmdBuilder

**v1.5.x**

  - Watch mode see "Watch mode" in this README
  - New version of argv params see "LMD CLI" in this README
  - String module
  - LMD async - loader of off-package modules see "Asynchronous module require" in this README

**v1.6.x**

  - Local Storage cache - config flag `cache: true` see "Local Storage cache" in this README
  - argv flag `-v`/`-version` is deprecated - use config flag `async: true` for `lmd_async.js` or false for `lmd_tiny.js` (default)
  - Created development version of example app without cache and production with cache=on
  - LMD can include off-package css `css: true` and js-files `js: true`(for jsonp, cross-origin JS or non LMD modules)

Licence
-------

(The MIT License)

Copyright (c) 2011 Mikhail Davydov &lt;azazel.private@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.