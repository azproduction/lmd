## Getting started with LMD

```bash
# Your dir structure is
+-gettring_started/
  +-i18n/
  | +-en.json
  +-js/
  | +-main.js
  +-tpls/
  | +-name.html
  +-index.html

# 0. install LMD
npm install lmd -g

# 1. List all files
$ cat index.html
<!DOCTYPE html>
<html>
    <head>
        <title>Getting started with LMD</title>
    </head>
    <body>
        <div id="name"></div>
        <script src="index.lmd.js"></script>
    </body>
</html>

$ cat js/main.js
var i18n = require('i18n'),
    name = require('name');

document.getElementById('name').innerHTML = name.replace('#{name}', i18n.name.replace('#', prompt('Your name', '')));

$ cat i18n/en.json
{
    "name": "My name is #"
}

# 2. Setup lmd
$ lmd init
info:
info:    .lmd initialised
info:
$ ls -a
.lmd       i18n       index.html js         tpls

# 3. Create build config
$ lmd create index
info:
info:    Build `index` (.lmd/index.lmd.json) created
info:
$ cat .lmd/index.lmd.json
{
    "root": "../",
    "output": "index.lmd.js",
    "modules": {},
    "main": "main"
}

# 4. Lets add our modules
$ lmd up index --modules.main=js/main.js --modules.i18n=i18n/en.json --modules.name=tpls/name.html
info:
info:    Build `index` (.lmd/index.lmd.json) updated
info:
info:    These options are changed:
info:
info:      modules  {"main":"js/main.js","i18n":"i18n/en.json","template":"tpls/name.html"}
info:

# 5. Lets tweak a bit: desable ie optimisations, enable, verbose logs, warnings and module compression
$ lmd up index --no-ie --warn --log --pack --no-lazy
info:
info:    Build `index` (.lmd/index.lmd.json) updated
info:
info:    These options are changed:
info:
info:      ie    false
info:      warn  true
info:      log   true
info:      pack  true
info:      lazy  false
info:

# 6. Time to build LMD Package!
$ lmd build index
info:    Building `index` (.lmd/index.lmd.json)
info:    Writing LMD Package to index.lmd.js

# 7. Lets start HTTP server and see results
$ http-server
Starting up http-server, serving ./ on port: 8080
http-server successfully started: http://localhost:8080
Hit CTRL-C to stop the server

# 8. Lets start LMD Watcher
$ lmd watch index
info:    Now watching 4 module files. Ctrl+C to stop
info:    Rebuilding...
info:    Writing LMD Package to index.lmd.js

# 9. Change i18n/en.json a bit...

# 10. And wuala! LMD Watcher automatically rebuilds your index.lmd.js file
info:    Change detected in en.json at Thu Oct 25 2012 22:11:19 GMT+0600 (ALMT) Rebuilding...
info:    Writing LMD Package to index.lmd.js

# 11. You can use mixins to create multiply builds with only few configs
$ cat .lmd/ru.lmd.json
{
    "root": "../i18n/",
    "modules": {
        "i18n": "ru.json"
    }
}

$ cat i18n/ru.json
{
    "name": "Ваше имя #"
}

# Just add +mixin+another_mixin... and change output
$ lmd build index+ru --output=index-ru.lmd.js
info:    Building `index` (.lmd/index.lmd.json)
info:    Extra mixins ./ru.lmd.json
info:    Writing LMD Package to index-ru.lmd.js

# 12. If you doubt the result of a build - you can make dry build with lmd info
$ lmd info index+ru --output=index-ru.lmd.js

# 13. You can run watch with mixins too
```

Browse examples/getting_started for that project.
