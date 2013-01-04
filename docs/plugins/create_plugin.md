## Plugins and extending LMD

Starts from 1.8.0 LMD rewritten it plugin system from Patch-Based to Event-Based Context Share (extended version of pub/sub pattern).
Now you have event listeners and triggers `lmd_on` and `lmd_trigger` private functions. The idea is simple: subscriber
can return some value to context in which it was called.

Example: you have a plugin which provides indexOf polyfill for IE.

**Your plugin: indexof_for_ie.js**
```javascript
(function (sb) {

    function indexOf(item) {
        for (var i = this.length; i --> 0;) {
            if (this[i] === item) {
                return i;
            }
        }
        return -1;
    }

    // Subscribe
    sb.on('request-for-indexOf', function (defaultIndexOf) {
        // Check for real indexof
        if (typeof defaultIndexOf === "function") {
            return [defaultIndexOf];
        }

        return [indexOf]; // Share context! Return our indexof.
    });
}(sandbox));
```

**Your other plugin that uses indexof_for_ie.js**
```javascript
(function (sb) {
    // trigger event and send part of our context
    var sharedOrDefaultIndexOf = sb.trigger('request-for-indexOf', Array.prototype.indexOf)[0];
    if (!sharedOrDefaultIndexOf) {
        throw new Error('No Array#indexOf');
    }

    var index = sharedOrDefaultIndexOf.call([1, 2, 3, 4], 5);
}(sandbox));
```

If plugin `indexof_for_ie.js` is not included (no event listeners for `request-for-indexOf` event) `sb.trigger` will return
arguments as-is eg `[Array.prototype.indexOf]` in our case. `sb.trigger` will also return arguments as-is if all subscribers
returns undefined (or returns nothing).

### Optimisations

  1. LMD highly optimises plugins source code and indexes all publishers and subscribers. If no subscribers (in our case
plugin `indexof_for_ie.js` is not included) LMD will replace useless `sb.trigger` function call with array-expression.

**Your other plugin that uses indexof_for_ie.js (optimized version)**
```javascript
(function (sb) {
    // trigger event and send part of our context
    var sharedOrDefaultIndexOf = [Array.prototype.indexOf][0];      // <<<
    if (!sharedOrDefaultIndexOf) {
        throw new Error('No Array#indexOf');
    }

    var index = sharedOrDefaultIndexOf.call([1, 2, 3, 4], 5);
}(sandbox));
```

  2. If no publishers (no `sb.trigger` calls) LMD will remove all subscribers associated with that event name.
  3. If no publishers nor subscribers at all LMD will wipe all related functions and objects.
  4. LMD will also replace event names with corresponding event index (event name is not passed to listener).
  5. LMD brakes sandbox: replaces all `sb.*` with names without dot operator (that code will be better compressed).
  eg `sb.on(..) -> lmd_on(...)` `sb.document -> global_document` etc @see /src/lmd.js for details

### Basic plugin code

```javascript
(function (sb) {

    // Subscribe
    sb.on('async:require-environment-file', function (moduleName, a) {
        // Trigger
        var sharedContext = sb.trigger('your:stuff', a);

        return [moduleName, a * 2]; // Context share
    });
}(sandbox));
```

Where `sandbox` is

```javascript
var sandbox = {
    global: global,                     // window, this or ... - depend on config
    modules: modules,                   // map of modules content
    sandboxed: sandboxed_modules,       // map of sandboxed modules module_name: true|false

    eval: global_eval,                  // window.eval
    register: register_module,          // register module function
    require: require,                   // require module function
    initialized: initialized_modules,   // map of initializd modules module_name: 0|1

    noop: global_noop,                  // function () {}           if $P.CSS || $P.JS || $P.ASYNC
    document: global_document,          // window.document          if $P.CSS || $P.JS || $P.STATS_SENDTO
    lmd: lmd,                           // lmd function itself      if $P.CACHE
    main: main,                         // main module code         if $P.CACHE
    version: version,                   // module version           if $P.CACHE
    stats_host: stats_host,             // stats host               if $P.STATS_AUTO
    coverage_options: coverage_options, // ...                      if $P.STATS_COVERAGE

    on: lmd_on,                         // lmd_on
    trigger: lmd_trigger,               // lmd_trigger

    undefined: local_undefined          // void 0
};
```

### Declare and use plugin

 1. Add record to `/src/lmd_plugins.json` file:

```javascript
    "your_plugin_name": {                // !!!
        "require": "your_plugin_code.js" // may be an array of files
    }
```

 2. Put your plugin code `your_plugin_code.js` into the plugins dir `/src/plugin`
 3. Add `"your_plugin_name": true` record to your .lmd.json config file

```javascript
{
    "root": "../modules/",
    "modules": {
        "*": "*.js"
    },

    "your_plugin_name": true        // <<<
}
```
