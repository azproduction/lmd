## User-made plugins

You can create your own plugin for your needs.

Start with this code:

```javascript
(function (sb) {

    sb.require.user_plugin_feature = function () {
        return 'Hello from user plugin!';
    };

}(sandbox));
```

Important thing - you have to wrap your plugin with IIFE.

Put your plugin somshere and declate it in the .lmd.json config file:

```javascript
{
    "root": "../",
    "output": "index.lmd.js",
    "modules": {
        "main": "js/main.js"
    },
    "main": "main",
    "plugins": {
        "user_plugin": "plugins/user_plugin.js"
    }
}
```

If your plugin required some config you may provede them to your plugin.

```javascript
{
    "root": "../",
    "output": "index.lmd.js",
    "modules": {
        "main": "js/main.js"
    },
    "main": "main",
    "plugins": {
        "user_plugin": {
            "path": "plugins/user_plugin.js",
            "options": {
                "pewpew": "ololo"
            }
        }
    }
}
```

Plugin with config

```javascript
(function (sb) {

    sb.require.user_plugin_feature = function () {
        return sb.options.user_plugin; // {"pewpew": "ololo"}
    };

}(sandbox));
```

You may also listen to all plugins events. See `docs/plugins/plugins_events.md`

For detailed information please see `docs/plugins/create_plugin.md` see also `examples/plugins/user_plugins` for example

