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
8. lmd module can define object via return or module.exports/exports as CommonJS Module

Installing
----------

`npm install lmd` or global `npm install lmd -g`

Usage
-----

1\. Create modules

1\.1\. Module - functions

**main.js**

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

**depA.js**

```javascript
function depA(require/*, exports, module*/){
    var escape = require('depB');
    return function(message) {
        console.log(escape(message));
    }
}
```

**depB.js**

```javascript
function depB(require, exports, module){
    // CommonJS Module exports
    // or exports.feature = function () {}
    module.exports = function(message) {
        return message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
}
```

1\.2\. Module - objects (for config, i18n and other resources)

**i18n.ru.json**

```javascript
{
    "hello": "Привет"
}
```

2\. Write a config file

**index.production.lmd.json**

```javascript
{
    "path": "../modules/", // if starts with "/" it is absolute path else path will be relative to the config file
    "modules": {
        "main": "main.js",     // "module_pseudonym": "module_file"
        "depA": "depA.js",     // require("module_pseudonym").doModuleStuff()
        "depB": "depB.js",
        "i18n": "i18n.ru.json"
    },
    "main": "main",     // a main module - content of that module will be called on start (no reason to eval)
    "lazy": false,      // if true - all modules will be evaled on demand [default=true]
    "pack": false,      // if true - module will be packed using uglifyjs [default=true]
    "sandbox": {        // optional, list of modules that can't require (null passed)
        "depB": true
    },
    "global": "this"  // optional, default="this" name of global object, passed to the lmd
}
```

**index.development.lmd.json**

```javascript
{
    "path": "../modules/",
    "modules": {
        "*": "*.js",           // use wildcards or specify regex string to grep 
        "i18n": "i18n.ru.json" // similar files (no dir wildcards supported by now)
    },
    "main": "main",
    "lazy": false,
    "pack": false,
    "sandbox": {
        "depB": true
    }
}
```

3\. Build

`lmd example/cfgs/index.development.lmd.json example/out/index.development.lmd.js` or `node ./lmd/bin/lmd.js ... `

Or print to `STDOUT`

`lmd example/cfgs/index.development.lmd.json`

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