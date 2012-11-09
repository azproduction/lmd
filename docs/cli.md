## LMD CLI

Start from version 1.9.0 LMD provides extended CLI interface

### lmd init

Initializes LMD for project. Lmd will create `.lmd` dir in current working directory.

`lmd init`

### lmd create

To create new LMD config

`lmd create <build_name> [<parent_build_name>] [<flags>]`

**Example**

```
lmd create development
lmd create development --no-pack --async --js --css
lmd create production development --pack --ie
lmd create testing production
```

### lmd update

Updates existed LMD config

`lmd update <build_name> <flags>`

**Example**

```
lmd update development --no-pack --async --js --css
lmd update development --modules.name=path.js
```

### lmd list

To see LMD packages/builds list

`lmd list`

### lmd build

To build LMD package

`lmd build <build_name>[+<mixin>...+<mixin>] [<flags>]`

**Example**

```
lmd build development
lmd build development+corp
lmd build development+en+corp
lmd build development+sourcemap
lmd build development+sourcemap --no-pack --async --js --css
lmd build development --modules.name=path.js
```

### lmd watch

To start/stop LMD package watcher

`lmd watch <build_name>[+<mixin>...+<mixin>] [<flags>]`

**Example**

```
lmd watch development
lmd watch development+corp
lmd watch development+en+corp
lmd watch development+sourcemap
lmd watch development+sourcemap --no-pack --async --js --css
lmd watch development --modules.name=path.js
```

### lmd server

To start/stop LMD stats server

`lmd server <build_name> [<server_options>]`

**Options**

```
--address, -a          Client stats server address. Log receiver               [default: "0.0.0.0"]
--port, -p             Client stats server port                                [default: "8081"]
--admin-address, --aa  Admin interface server address. Default same as `port`
--admin-port, --ap     Admin interface server port. Default same as `address`
```

**Example**

```
lmd server development
lmd server development --a localhost --p 8080
```

### lmd info

To see LMD extended package/build info

`lmd info <build_name>[+<mixin>...+<mixin>] [<flags>] [<options>]`

**Options**

```
--sort, --order-by  Sorts modules by that row     [default: "undefined"]
--deep              Prints deep module analytics  [boolean]  [default: true]
```

**Example**

```
lmd info development
lmd info development --sort=coverage
lmd info development+corp
lmd info development+en+corp
lmd info development+sourcemap
lmd info development+sourcemap --no-pack --async --js --css
lmd info development --modules.name=path.js
```

**Info result example**

```bash
info:
info:    LMD Package `index` (.lmd/index.lmd.json)
info:
info:    Modules (6)
info:
info:    name            depends type     lazy greedy coverage sandbox
info:    main            ✘       plain    ✘    ✘      ✔        ✘
info:    b-roster        ✘       plain    ✘    ✘      ✔        ✘
info:    undefined       ✘       fe       ✘    ✘      ✔        ✘
info:    b-unused-module ✘       plain    ✘    ✘      ✔        ✘
info:    b-dialog        ✘       shortcut ✘    ✘      ✔        ✘
info:    b-talk          ✘       shortcut ✘    ✘      ✔        ✘
info:
info:    Module Paths, Depends and Features
info:
info:    main             <- /Users/azproduction/Documents/my/lmd/examples/mock_chat/js/lmd/modules/index.js
info:     +-b-roster
info:
info:    b-roster         <- /Users/azproduction/Documents/my/lmd/examples/mock_chat/js/lmd/modules/b-roster.js
info:     +-b-dialog
info:     +-b-talk
info:
info:      Uses: async, parallel, stats_sendto
info:
info:    undefined        <- /Users/azproduction/Documents/my/lmd/examples/mock_chat/js/lmd/modules/utils.js
info:     +-document (global?)
info:
info:    b-unused-module  <- /Users/azproduction/Documents/my/lmd/examples/mock_chat/js/lmd/modules/b-unused-module.js
info:    b-dialog         <- @js/lmd/modules/b-dialog.js
info:    b-talk           <- @js/lmd/modules/b-talk.js
info:
info:    Flags
info:
info:    async                 ✔
info:    ie                    ✘
info:    parallel              ✔
info:    shortcuts             ✔
info:    stats                 ✔
info:    stats_coverage        ✔
info:    stats_coverage_async  ✘
info:    stats_sendto          ✔
info:    warn                  ✔
info:    log                   ✔
info:    pack                  ✘
info:    lazy                  ✘
info:
info:    Paths
info:
info:    root      /Users/azproduction/Documents/my/lmd/examples/mock_chat/js/lmd/modules
info:    output    /Users/azproduction/Documents/my/lmd/examples/mock_chat/js/lmd/modules/../index.lmd.js
info:    www_root  /Users/azproduction/Documents/my/lmd/examples/mock_chat
info:
info:    Source Map
info:
info:    sourcemap         /Users/azproduction/Documents/my/lmd/examples/mock_chat/js/lmd/index.lmd.map
info:    sourcemap_www     /
info:    sourcemap_inline  ✔
info:
```
