LMD: Lazy (and synchronous) Module Declaration
==============================================

Big JavaScript application cause huge startup latency. A 1Mb of JavaScript initializes about ~600-3000ms! without touching any part of DOM. LMD is inspired by AMD and provides similar module interface. It evals module only when they are required.

1. Modules are similar to AMD: there is a require, but no define (all defined on startup)
2. LMD does not create globals
3. LMD is standalone and tiny - only +300 extra bytes
4. All modules are loaded at startup
5. Each function-module is initialized (evaled) on demand
6. LMD module is as easy to debug as normal JavaScript file
7. Build system compresses JavaScript files using uglifyjs (or any other)
8. LMD module can define object via return or module.exports/exports as CommonJS Module
9. Module can be wrapped automatically in builder so you can write your modules as node.js modules (see Usage)

Installing
----------

`npm install lmd` or global `npm install lmd -g`

Usage
-----

1\. Create modules

1\.1\. Module - functions

**main.js - module as function declaration**

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

**depA.js - module as function expression**

```javascript
(function (require/*, exports, module*/) {
    var escape = require('depB');
    return function(message) {
        console.log(escape(message));
    }
})
```

**depB.js - module as plain code like Node.js**

```javascript
// @globals require module exports
// CommonJS Module exports
// or exports.feature = function () {}
module.exports = function(message) {
    return message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
```

**Note**: code will be wrapped by builder `(function (require, exports, module) {\n%code%\n})`

1\.2\. Module - objects (for config, i18n and other resources)

**i18n.ru.json**

```javascript
{
    "hello": "Привет"
}
```

1\.3\. Module - string (for templates)

```html
<i class="b-template">${content}</i>
```

2\. Write a config file

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
            "template": "templates/template.html" // string template
        },
        "i18n": "i18n.ru.json"
    },
    "main": "main",     // a main module - content of that module will be called on start (no reason to eval)
    "lazy": false,      // if true - all modules will be evaled on demand [default=true]
    "pack": false,      // if true - module will be packed using uglifyjs [default=true]
    "global": "this"  // optional, default="this" name of global object, passed to the lmd
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
    "pack": false
}
```

3\. Build

`lmd example/cfgs/index.development.lmd.json example/out/index.development.lmd.js` or `node ./lmd/bin/lmd.js ... `

Or print to `STDOUT`

`lmd example/cfgs/index.development.lmd.json`

3\.1 Build using special LMD version

`lmd example/cfgs/index.development.lmd.json example/out/index.development.lmd.js lmd_min` or `... lmd_tiny` see `src/`
for details


4\. Use

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

old style `lmd [mode] config [output] [version]`

new style `lmd [-m mode] -c config [-o output] [-v version] [-l]`

**Arguments**

 - `-m` `-mode` lmd run mode `main` (default) or `watch`
 - `-c` `-config` lmd package config file
 - `-o` `-output` lmd output file - default STDOUT
 - `-v` `-version` lmd version `lmd_tiny` (default) or `lmd_min`
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