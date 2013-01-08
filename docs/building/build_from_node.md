## Build LMD package from Node.js

`Lmd` is **Readable Stream**. It also provides `log` readable stream.

```javascript
// Example: Print result to STDOUT, ignore logs
var Lmd = require('lmd');

new Lmd("path/to/lmd.json", {
    warn: false // disable warnings?
});
.pipe(process.stdout);
```

```javascript
// Example: Print result file, log to STDOUT
var Lmd = require('lmd'),
    fs = require('fs');

var lmdModule = new Lmd("path/to/lmd.json");

// default ws options are {flags: 'w', encoding: null, mode: 0666}
var fileStream = fs.createWriteStream("path/to/result/lmd.js");

// write result to file stream
lmdModule.pipe(fileStream);
lmdModule.log.pipe(process.stdout);
lmdModule.on('end', function () {
    console.log('Build done!');
});
```

`Lmd.watch` is non readable nor writable Stream, but it provides `log` too too.

```javascript
// Example: Run watch mode
var Lmd = require('lmd');

new Lmd.watch("path/to/lmd.json")
.log.pipe(process.stdout); // redirect watch and build logs to STDOUT
```
