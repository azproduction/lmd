### List of events

#### *:before-init

 calls when module is goint to eval or call

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ no

#### *:coverage-apply

 applies code coverage for module

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ yes

#### *:is-plain-module

 code type check request: plain or lmd-module

  * `{String}` moduleName
  * `{String}` module
  * `{String}` isPlainCode default value

_Listener returns context:_ yes

#### *:request-error

 module load error

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ no

#### *:request-indexof

 requests indexOf polifill

  * `{Function|undefined}` arrayIndexOf default indexOf value

_Listener returns context:_ yes

#### *:request-json

 requests JSON polifill with only stringify function!

  * `{Object|undefined}` JSON default JSON value

_Listener returns context:_ yes

#### *:request-parallel

 parallel module request for require.async(['a', 'b', 'c']) etc

  * `{Array}`    moduleNames list of modules to init
  * `{Function}` callback    this callback will be called when module inited
  * `{Function}` method      method to call for init

_Listener returns context:_ yes empty environment

#### *:request-race

 race module request eg for cases when some async modules are required simultaneously

  * `{String}`   moduleName race for module name
  * `{Function}` callback   this callback will be called when module inited

_Listener returns context:_ yes returns callback if race is empty or only 1 item in it

#### *:rewrite-shortcut

 fires before stats plugin counts require same as *:rewrite-shortcut but without triggering shortcuts:before-resolve event

  * `{String}` moduleName race for module name
  * `{String}` module     this callback will be called when module inited

_Listener returns context:_ yes returns modified moduleName and module itself

#### *:rewrite-shortcut

 request for shortcut rewrite

  * `{String}` moduleName race for module name
  * `{String}` module     this callback will be called when module inited

_Listener returns context:_ yes returns modified moduleName and module itself

#### *:stats-coverage

 adds module parameters for statistics

  * `{String}` moduleName
  * `{Object}` moduleOption preprocessed data for lines, conditions and functions

_Listener returns context:_ no

#### *:stats-get

 somethins is request raw module stats

  * `{String}` moduleName
  * `{Object}` result    default stats

_Listener returns context:_ yes

#### *:stats-results

 somethins is request processed module stats

  * `{String}` moduleName
  * `{Object}` result     default stats

_Listener returns context:_ yes

#### *:stats-type

 something tells stats to overwrite module type

  * `{String}` moduleName
  * `{String}` packageType

_Listener returns context:_ no

#### *:wrap-module

 Module wrap request

  * `{String}` moduleName
  * `{String}` module this module will be wrapped
  * `{String}` contentTypeOrExtension file content type or extension to avoid wrapping json file

_Listener returns context:_ yes

#### async:before-callback

 when async.js require is going to return module, uses for cache async module

  * `{String}` moduleName
  * `{String}` module     module content

_Listener returns context:_ no

#### async:before-check

 before module cache check in async()

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ no

#### async:require-environment-file

 requests file register using some environment functions non XHR

  * `{String}`   moduleName
  * `{String}`   module
  * `{Function}` callback   this callback will be called when module inited

_Listener returns context:_ no

#### css:before-check

 before module cache check in css()

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ no

#### js:before-check

 before module cache check in js()

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ no

#### js:request-environment-module

 js.js plugin requests for enviroment-based module init (importScripts or node require)

  * `{String}`   moduleName
  * `{String}`   module

_Listener returns context:_ yes

#### lmd-register:after-register

 after module register event

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ no

#### lmd-register:before-register

 before module register event

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ no

#### lmd-register:decorate-require

 request for fake require

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ yes wraps require

#### lmd-require:before-check

 before module cache check

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ no

#### shortcuts:before-resolve

 moduleName is shortcut and its goint to resolve with actual name

  * `{String}` moduleName
  * `{Object}` module

_Listener returns context:_ no

#### stats:before-return-stats

 stats is going to return stats data this event can modify that data

  * `{String|undefined}` moduleName
  * `{Object}`           stats_results default stats

_Listener returns context:_ yes depend on moduleName value returns empty array or replaces stats_results
