## Source map

LMD can generate source map for your modules.

**Example**

First add this parameters to tour module config

```
    "sourcemap": "../index.lmd.map",
    "sourcemap_inline": true,
    "sourcemap_www": "",

    "www_root": "../../../",
```

Than build your package `lmd build your_package`.

You can skip all thet extra options and add them to the CLI comand:

`lmd build your_package --sourcemap ../index.lmd.map --sourcemap_inline --sourcemap_www="" --www_root ../../../`

All paths are relative to the config file.

**Notes**

  * Shortcuts, modules under Code Coverage and Lazy modules can not be under Source Map now (will be implemented in future versions)
  * `pack: true` destroys source map now (will be implemented in future versions)

see [LMD CLI](https://github.com/azproduction/lmd/blob/master/docs/cli.md) for details
