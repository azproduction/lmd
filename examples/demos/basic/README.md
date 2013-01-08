All-in-on-example
-----------------

1. `cfgs/` - config build files
2. `css/` - stylesheets, loaded dynamically using `require.css()`
3. `modules/` - LMD modules, both in-package and off-package (functions, objects, strings), loaded using `require()` and `require.async()`
4. `vendors/` - **non-LMD modules** (lmd cant work with them directly), loaded dynamically using `require.js()`
5. `out/` - build results. See `out/index.development.lmd.js` (it is sufficiently debuggable)
6. `index.html` - production/testing version with enabled `cache` flag, javascripts packed
7. `index_development.html` - development version without `cache` flag, javascripts unpacked

Run `make` to build project

