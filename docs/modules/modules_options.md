## Module features

### LMD module form third-party modules

 - Module parameters: exports, require

If you are using jquery as in-package module or any other module without exports. LMD can easily convert it to LMD format.
You may add `"exports"` and/or `"require"` to your module descriptor to notify LMD that this module should be converted to LMD format.
The design of non-lmd2lmd patching is close to require.js shim

**Example**

You have one 3-party module and you have to include it to the LMD-package.
```javascript
function pewpew () {

}

function ololo() {

}

var someVariable = "string";
```

It easy, just add `"exports"` to your module descriptor, add "require" to start module deps:
```javascript
"third_party_module_b": {
    "path": "vendors/other_module.js",
    "exports": {
        "pewpew": "pewpew",
        "ololo": "ololo",
        "someVariable": "someVariable"
    } // return ALL THE SUFF!!!
}
```

Or return just one exports, and some deps
```javascript
"third_party_module_b": {
    "path": "vendors/other_module.js",
    "exports": "pewpew || ololo", // or var name "pewpew"

    // Modules may have some deps
    "require": {
        "third_party_module_b": "third_party_module_b-dep",
        "someGlobal": "Function"
    }
}
```

LMD will make a LMD module from you code (while building LMD-package)

```javascript
(function (require) { // << added
var third_party_module_b = require("third_party_module_b-dep"), // << added
    someGlobal = require("Function"); // << added

function pewpew () {

}

function ololo() {

}

var someVariable = "string";

return pewpew || ololo; // << added
}) // << added
```

`"exports"` should be valid JavaScript code or object of valid JavaScript

You may use more complex exports as `"exports": "require('$').noConflict(true)"` if you are exporting jQuery.

**Note** Try not to use complex expressions!

### Modules sandbox

 - Module parameters: sandbox

If you are using some untrusted 3-party modules or your modules cant `require()` by design you can apply sandbox on that
module by adding `"sandbox": true` to your module declaration. Now this module can't require and use require sub-functions.
`undefined` or `Object` (if module under Code Coverage) will passed as require. Sandboxed module can export all module stuff.

```javascript
"third_party_module_b": {
    "path": "vendors/other_module.js",
    "sandbox": true,
    "exports": {
        "pewpew": "pewpew",
        "ololo": "ololo",
        "someVariable": "someVariable"
    }
}
```

### Modules depends

 - Module Property/Flag: `depends`
 - Property/Flag: `depends`

Modules may have dependencies that you can put in a separate file. This file has the same format as any lmd.json file.
In that file can specify a list of required features and modules.
Each module can have only one config file with dependencies. All dependant configs may also have depends.

In other words, each configuration defines a subtree of the file system and the features that it needs to work.
The main config file assembles all subtrees and list of features into one big tree and features list.

**Example**

*FS Tree*

```
cfgs/
    index.lmd.json           | Main config
modules/                     |
    some_module/             |
        some_module_deps.js  |
    main.js                  |
    some_module.lmd.json     | Depends config of some_module.js
    some_module.js           |
    some_other_module.js     |
```

*index.lmd.json*

```javascript
{
    "root": "../modules/", // or "path":

    "modules": {
        "main": "modules/main.js",
        "some_module": "modules/some_module.js",
        "some_other_module": "modules/some_other_module.js"
    },

    "depends": true // or mask "*.lmd.json",

    "cache": false
}
```

You may also use per module depends:

```javascript
{
    "some_module": {
        "path": "modules/some_module.js",
        "depends": "some_module.lmd.json"
    }
}
```

*modules/some_module.lmd.json*

```javascript
{
    "root": "./some_module/", // or "path":

    "modules": {
        "some_module_deps": "some_module_deps.js"
    },

    "js": true,
    "async": true,

    "cache": true
}
```

`$ lmd index.lmd.json index.js`

Result js file will contain all module deps:

```javascript
{
    "modules": {
        "main": "modules/main.js",
        "some_module": "modules/some_module.js",
        "some_other_module": "modules/some_other_module.js"
        "some_module_deps": "some_module_deps.js"
    },

    "js": true,    // from some_module.lmd.json
    "async": true,

    "cache": false // overwritten by master config index.lmd.json
}
```

See [test/qunit/cfgs/test.lmd.json](/azproduction/lmd/tree/master/test/qunit/cfgs/test.lmd.json) for config example

**Note:**

 - LMD will warn if some config declares exists module name
 - "main" module from each depends module will be excluded
 - master config may overwrite flags by setting `"flag": false`
