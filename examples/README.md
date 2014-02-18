# LMD: Lazy Module Declaration Examples

New to LMD? See [Getting Started](https://github.com/azproduction/lmd/wiki/Getting-started) or
[Wiki](https://github.com/azproduction/lmd/wiki/).

## Demo applications

 - [Backbone LMD](demos/backbone_lmd/) - TodoMVC application based on Backbone.js with LMD as application assembler. [Run](http://azproduction.github.io/lmd/examples/demos/backbone_lmd/)
 - [Mock Chat](demos/mock_chat/) - Part of [loaders benchmark](https://github.com/azproduction/loader-test/), than measures LMD performance. [Run](http://azproduction.github.io/lmd/examples/demos/mock_chat/). [Run using cache](http://azproduction.github.io/lmd/examples/demos/mock_chat/index_cache.html)
 - [Getting Started](demos/getting_started/) - Example from [Getting Started wiki page](https://github.com/azproduction/lmd/wiki/Getting-started). [Run](http://azproduction.github.io/lmd/examples/demos/getting_started/)
 - [And more...](demos/)

## Examples that covers all LMD features

 - [Adaptation](features/adaptation/) - Adapting non-modules. Plain JavaScript, AMD, etc
 - [Sandbox](features/sandbox/) - 3-party modules isolation example
 - [Glob](features/glob/) - Declare many similar modules with only 1 expression!
 - [And more...](features/)

## Examples that covers all LMD plugins

 - [Cache](plugins/cache) - transparent localStorage cache for all modules
 - [Promise](plugins/promise) - using Promises instead of callback to handle module loading
 - [Match](plugins/) - use `require.match(/Pattern/)` to grep all modules that you need
 - [And more...](plugins/)

## Test examples

 - [Mocha](tests/mocha) - testing lmd build with mocha and mocha-phantomjs
 - [Istanbul](tests/istanbul) - code coverage with istanbul and testing lmd build with mocha and mocha-phantomjs

**Hint** You can try all examples live! Just add `http://lmdjs.org/` to example path `examples/demos/backbone_lmd/` = [http://lmdjs.org/examples/demos/backbone_lmd/](http://lmdjs.org/examples/demos/backbone_lmd/)
