LMD: Lazy (and synchronous) Module Declaration
==============================================

Big JavaScript application cause huge startup latency. A 1Mb of JavaScript initializes about ~600-3000ms! without touching any part of DOM.
LMD is inspired by AMD and provides similar module interface. It evals module only when they are required.

Installing
----------

`npm install lmd` or global `npm install lmd -g`

Usage
-----

1. Create modules

```javascript
function main(require) { // passes only require
    var depA = require('depA');
    depA('ololo');
}
```

```javascript
function depA(require){
    return function(message) {
        console.log(message);
    }
}
```

2. Write config file

**index.development.lmd.json**

```javascript
{
    "path": "../modules/",
    "modules": {
        "main": "main.js",
        "depA": "depA.js"
    },
    "main": "main",
    "lazy": false,
    "pack": false
}
```

3. Build

`lmd example/cfgs/index.development.lmd.json example/out/index.development.lmd.js` or `node ./lmd/bin/lmd.js ... `

Or print to `STDOUT`

`lmd example/cfgs/index.development.lmd.json`

4. Results

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
({depA:"function depA(a){return function(a){console.log(a)}}"})
(function(b){var c=b("depA");c("ololo")})
```

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