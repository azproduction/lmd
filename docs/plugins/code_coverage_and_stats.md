## LMD Statistics and Code Coverage

### Application statistics. Require, load, eval, call statistics

 - Flag: `stats`

You can dump your application/package statistics to analise numbers: load+eval+call time and requires count

```javascript
var $ = require('$');

// You can check one module statistics
require.async('module_shortcut', function (Module) { // module_shortcut: module.js
    require.stats('module.js');
    /*
    {
        name: 'module.js',
        initTime: 31, // init time: load+eval+call
        accessTimes: [10], // list of module access times, 10 ms from app start
        shortcuts: ['module_shortcut'] // list of shortcuts [optional]
    }
    */
});

// Or for example dump all application module statistics

// 1. Get usage stats
var stats = require.stats();
/*
{
    "$": {
        name : "$",
        initTime: 0,
        accessTime: [3]
    },
    'module.js': {
        name: 'module.js',
        initTime: 31, // init time: load+eval+call
        accessTimes: [10], // list of module access times, 10 ms from app start
        shortcuts: ['module_shortcut'] // list of shortcuts pointed to this module [optional]
    },
    'module_shortcut': { // === same object as 'module.js'
        name: 'module.js',
        initTime: 31, // init time: load+eval+call
        accessTimes: [10], // list of module access times, 10 ms from app start
        shortcuts: ['module_shortcut'] // list of shortcuts pointed to this module [optional]
    }
}
*/

// 2. Push stats to server
$.post('/lmd-stats', JSON.stringify(stats));

// Or enable `stats_sendto` to post to stats server
require.stats.sendTo('http://localhost:8081'); // you may specify report_name too
```

### Code coverage

 - Flag: `stats`, `stats_coverage`, `stats_sendto`, `stats_coverage_async`, `stats_auto`

Add `stats_coverage` flag to your config file or use list of module names to cover only them. Rebuild your package.
Now you can see coverage report in `require.stats()` object. See [src/plugin/stats.js#L46](/azproduction/lmd/blob/master/src/plugin/stats.js#L46) for more information.

You can enable `stats_sendto` flag to push your reports to the Stats Server.
You can set `stats_auto` flag/property to enable automatic push your reports to specified Stats Server.
`stats_auto: true` will automatically send your reports to `'http://' + location.hostname + ':8081'`
you may also define your own stats host url (eg `stats_auto: "http://yourhost:12345"`)
You may also enable `stats_coverage_async` to profile all your async modules without processing them on server. All async modules
will be parsed and processed on client.

```javascript
require.stats.sendTo('http://localhost:8081'); // you may specify report_name too
```

*How it work*
 1. LMD patches your source files with coverage functions
 2. User is running application and script executes coverage functions to calculate coverage
 3. Your source executes `require.stats.sendTo(your_lmd_stats_server_server)` and send report to the server
 4. Then you open Stats Server Admin interface to see reports

**Note**

 - sandboxed module under CC will accept an object as require with coverage functions instead of undefined
 - `stats_coverage_async` is VERLY LARGE `plugin` +50Bb and it may take a LOT of time to parse and patch your sources

### Stats server

Stats server provides simple coverage and usage reports

![](https://raw.github.com/azproduction/lmd/master/images/coverage_package.png)

![](https://raw.github.com/azproduction/lmd/master/images/coverage_module.png)

*Prepare config*

First you have to add this parameters to tour module config

```
    "www_root": "../../../",
```

*Starting server*

`lmd server your_config`

see [CLI lmd server](https://github.com/azproduction/lmd/blob/master/docs/building/cli.md#lmd-server) for more information

see [examples/mock_chat](/azproduction/lmd/tree/master/examples/demos/mock_chat) for real example

