# Ember.js + LMD TodoMVC Example

All sources of this example were taken from original [Ember.js TodoMVC](https://github.com/tastejs/todomvc/tree/gh-pages/architecture-examples/emberjs) example.

## Install and Build

This application is already compiled, but if you want to update it `lmd` and `bower` are required to rebuild this example.

```bash
$ npm i lmd bower -g
$ cd examples/demos/emberjs_lmd

$ bower i
$ lmd build index
```

## Run

Simply `open index.html` or browse [live example](http://lmdjs.org/examples/demos/emberjs_lmd/).

## Key things

Ember.js + LMD TodoMVC Example overrides Ember's `DefaultResolver` methods in order to use lazy `require()`.
Custom resolver can be found at `examples/demos/emberjs_lmd/js/resolver.js`.

## Licence

Everything in directory is MIT License unless otherwise specified.

MIT © Addy Osmani, Sindre Sorhus, Pascal Hartig, Stephen Sawchuk, Mikhail Davydov.
