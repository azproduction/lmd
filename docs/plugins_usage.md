## Plugins usage

### Asynchronous module require

 - Flags: `async`, `race`, `cache_async`, `async_plain`, `async_plainonly`

You can build async LMD package.  (Disabled by default)

Then your packages can require off-package modules from http server.
Build LMD package using `async: true` flag. LMD loader now can require javascript FunctionsExpressions,
JSON or template strings asynchronously. LMD parses file content depend on `Content-type` header.
You must work online using HTTP server for correct headers, if you work offline (using `file:` protocol)
then `Content-type` header will be INVALID so all modules will be strings.

**Notice**

 - See "[Web Worker and Node.js](#web-worker-and-nodejs)" if your package will run as worker or node script
 - If you use `file:` protocol then all modules will be strings
 - LMD loader uses simple RegExp `/script$|json$/` with `Content-type` to determine the kind of content
and eval it (if json or javascript) or return as string
 - If all you modules are in-package then set `async` flag to false (300 bytes less)
 - If async require fails (status code will be >= 400) loader will return `undefined`
   (LMD doesn't re-request on error)
 - If you are performing parallel loading of the same resource add `race: true` (Disabled by default)
   flag to prevent duplication of requests.
 - You can set both flags `cache` and `cache_async` to true to enable localStorage cache for `require.async()`
   (see [Local Storage cache](#local-storage-cache))
 - You can require plain off-package modules by declaring one of flags `async_plain` or `async_plainonly`

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

See [example/basic/modules/main.js](/azproduction/lmd/blob/master/examples/basic/modules/main.js#L24) for real life example

### Local Storage cache

 - Flags: `cache`, `cache_async`, Property: `version`

You can store all your in-package modules and lmd itself in localStorage. (Disabled by default)

1. Set config flag `cache: true` and add `version: your_current_build_version` property to your
config file then build your LMD package - it will be created in cache mode. If no version - LMD package will run
in default mode - without dumping modules
2. Set config flag `cache_async: true` to cache `require.async()` requests in localStorage too
3. Remove script tag `<script src="out/index.production.lmd.js" id="source"></script>` with LMD initializer:

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

See [examples/basic/cfgs/index.prodoction.lmd.json](/azproduction/lmd/blob/master/examples/basic/cfgs/index.prodoction.lmd.json)
and [examples/basic/index.html](/azproduction/lmd/blob/master/examples/basic/index.html) for details

**Note**: `version` property from config and from `data-version` attribute must match to use code from localStorage!
Yep! Each time you have to change config file and your html file!

### Loading CSS and JavaScript files

 - Flags: `js`, `css`, `race`

You can enable flags `css: true` and `js: true` to use css and js loader as all loaders do. (Disabled by default)

**Note**

 - See "[Web Worker and Node.js](#web-worker-and-nodejs)" if your package will run as worker or node script
 - If you are performing parallel loading of the same resource add `race: true` (Disabled by default)
   flag to prevent duplication of requests.

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

### Web Worker and Node.js

 - Flags: `node`, `worker`

You can use LMD in-package modules (`require()`) in worker and run it as node script without any config changes.
But if you are going to use `require.async()` or `require.js()` you should add `worker: true` or/and `node: true` config
flags. `require.css()` in node or worker environment acts like `require()`

 - `require.async()` in Worker environment works exactly the same as in browser environment
 - `require.async()` in Node uses `fs.readFile()` to read file and evals/returns file content depend on file extension
 - `require.js()` in Worker acts like `importScripts()` and call back an empty object `{}`
 - `require.js()` in Node acts like Node.js `GLOBALS.require()` and returns `module.exports` object from node module
 - `require.css()` in both environments acts like LMD `require()`

Run tests or see [examples/basic/modules/main.js](/azproduction/lmd/blob/master/examples/basic/modules/main.js#L60) and
[examples/basic/modules/workerDepA.js](/azproduction/lmd/blob/master/examples/basic/modules/workerDepA.js) for details

### Browsers support

 - Flags: `ie`, `opera_mobile`

LMD works in all modern browsers and in older IE. If LMD package will run only in modern browsers turn off `ie: false`
config flag to optimise lmd source for modern browsers (removes few IE hacks)

Tested on Opera 11.63, Chrome 17, Safari 5, IE 6+, Firefox 12, iOS Safari 5, to be updated...

### Shortcuts

 - Flag `shortcuts`

You can define flag `shortcuts: true` to enable shortcuts in LMD package. Then you can use short names instead of full paths.
Symbol `@` indicates that module content is shortcut.

```javascript
{
    "modules": {
        "some-json": "@/path/to/file.json",
        "jquery": "@http://yandex.st/jquery/1.7.1/jquery.min.js",
    }
}
```

```javascript
// old way...
require.async("/path/to/file.json", function () {});

// its the same as above, but much abstract and short
require.async("some-json", function (data) {
    console.log('data');
});

require.js("jquery", function () {
    require('$').ready(function () {
        // do your stuff
    });
});
```

### AMD modules (RequireJS)

 - Flag `amd`

If your project is using AMD (RequireJS) modules and you want to play with LMD - you can just enable flag `amd` and use your
AMD modules without any changes!

#### Example

  * This is your RequireJS config

```javascript
requirejs.config({
    paths: {
        main: 'path/to/main',
        jquery: 'path/to/third-party/jquery.min',
        underscore: 'path/to/third-party/underscore.min',
        backbone: 'path/to/third-party/backbone.min',
    }
});
```

  * First transform it to LMD `config.json`. Do not forget to add `.js` tail to your paths.

`"main"` module will be called first.

```javascript
{
    "root": "path/to/",
    "modules": {
        "main": "main.js",
        "jquery": "third-party/jquery.min.js",
        "underscore": "third-party/underscore.min.js",
        "backbone": "third-party/backbone.min.js"
    },

    "amd": true
}
```

  * Than build lmd package `lmd config.json result.js`

  * Yahoo! - now you can use all LMD features (code coverage, stats) with your AMD modules!

see [examples/mock_chat/js/amd](/azproduction/lmd/tree/master/examples/mock_chat/js/amd) for real example

#### Limitations

  1. All your AMD modules and depends should be declared in `modules` section (only in-package AMD modules are allowed)
  2. Name parameter in `define('name')` is ignored (anonymous defines only)
  3. All your modules files should contain only one `define()` (last one will be declared)
