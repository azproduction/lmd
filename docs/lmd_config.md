## LMD Config file

**You can set all config parameters using lmd cli**

**Full version**

```javascript
{
    "name": "Your build name",
    "description": "This string can contain long description even with \nnew lines",

    "path": "../modules/", // if starts with "/" it is absolute path else path will be relative to the config file
    "root": "../modules/", // alias to path

    // # Inheritance
    "extends": "./parent_index.lmd.js",           // Parent lmd config
    "mixins": ["./mix.lmd.js", "./debug.lmd.js"], // Mixins configs

    "version": "1.0.1-rc3",

    "output": "../index.lmd-<%= version %>.js",     // LMD will print build result there. Relative path to the root param
                                                    // This field uses string interpolation
                                                    // "../index.lmd-1.0.1-rc3.js"

    "sourcemap": "../index.lmd.map", // Relative path to the source map result file
    "sourcemap_inline": true,        // Adds inline Source Map include statement
    "sourcemap_www": "",             // Relative source map www location

    "www_root": "../../../",         // Relative path of the www root (where your index.html located)

    "warn": true,                    // Print lmd build warnings [default=true]
    "log": true,                     // Print build/watch/whatever log [default=true]

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

        // 3-party modules
        "third_party_module": {
            "path": "vendors/other_module.js",
            "sandbox": true, // add sandbox
            "exports": {
                "pewpew": "pewpew",
                "ololo": "ololo",
                "someVariable": "someVariable"
            }
        },

        "jquery": {
            "path": "vendors/jquery.min.js",
            "exports": "require('$').noConflict(true)"
        },

        "module_with_depends": {
            "path": "vendors/jquery.min.js",
            "depends": "*.lmd.json" // With mask -> vendors/jquery.min.lmd.json
                                    // Or direct config name jquery.lmd.json
        },

        // string template
        "template": "templates/template.html"

        "i18n": "i18n.ru.json",

        // shortcuts for require.async("abstract_name") or .js() or .css()
        "abstract_name": "@/path/to/real-file.js"
    },
    "main": "main",         // a main module - content of that module will be called on start (no reason to eval)
    "global": "this",       // name of global object, passed to the lmd [default="this"]

    // # Depends
    "depends": true,        // module depends mask [default=false]
                            // Can be true value or mask string. Default mask for true is '*.lmd.json'
                            // For each module in config lmd builder will use mask to find config with module depends
                            // eg: module_name.js + *.lmd.json lmd will looking for module_name.lmd.json etc

    // # Modules output format
    "optimize": false,      // if true - LMD will optimize itself source, but not pack [default=false]
    "lazy": false,          // if true - all modules will be evaled on demand [default=false]
    "pack": false,          // if true - module will be packed using uglifyjs [default=false]
    "pack_options": {},     // object with UglifyJS pack options @see UglifyJS documents or
                            // /test/qunit/cfgs/test.lmd.json for details [default={}]

    // # Plugins @see Plugins paragraph

    // ## Off-package LMD module loader
    "async": true,
    "async_plain": true,
    "async_plainonly":true,

    // ## Cache
    "cache": true,
    "cache_async": true,

    // ## Non-LMD modules loader
    "js": true,
    "css": true,

    // ## Environment optimizations
    "worker": true,
    "node": true,
    "ie": true,
    "opera_mobile": true,

    // ## Loaders features and optimizations
    "race": true,
    "parallel": true,

    // ## Extra module types
    "shortcuts": true,
    "amd": true,

    // ## Stats and Code coverage
    "stats": true,
    "stats_coverage": true,
    "stats_coverage_async": true,
    "stats_sendto": true,
    "stats_auto": true            // stats host url (eg "http://yourhost:port") or true;
                                  // true=default url -> 'http://' + location.hostname + ':8081'
}
```

**Note**

 - You can extend config file with another using `"extends": "path/to/file.lmd.json"` parameter
 - You can also specify module depends by adding `"depends"` options see Modules depends
 - You can use string interpolation (templates in config string _.template style) like `../index.lmd-<%= version %>.js`. See [code](https://github.com/azproduction/lmd/tree/master/examples/features/interpolation/)
