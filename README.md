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
    "modules": {
        "main": "modules/main.js",
        "depA": "modules/depA.js"
    },
    "main": "main",
    "lazy": false,
    "pack": false
}
```

3. Build

`lmd ../example/index.development.lmd.json ../example/out/index.development.lmd.js`

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