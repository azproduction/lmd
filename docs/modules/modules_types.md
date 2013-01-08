## LMD Modules types

### Module - functions

#### Module as function declaration

```javascript
function main(require) {
    var print = require('depA'),
        i18n = require('i18n'),
        $ = require('$'); // grab module from globals: LMD version 1.2.0

    var text = i18n.hello +  ', lmd';

    print(text);

    $(function () {
        $('#log').text(text);
    });
}
```

#### Module as function expression

```javascript
(function (require/*, exports, module*/) {
    var escape = require('depB');
    return function(message) {
        console.log(escape(message));
    }
})
```

#### Module as plain code like Node.js

```javascript
// @globals require module exports
// CommonJS Module exports
// or exports.feature = function () {}
module.exports = function(message) {
    return message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
```

**Note**:

 - plain module will be wrapped by builder `(function (require, exports, module) {\n%code%\n})`
 - you can require plain off-package modules by declaring one of flags `async_plain` or `async_plainonly`

### Module - objects

For config, i18n and other resources

```javascript
{
    "hello": "Привет"
}
```

### Module - string

For templates

```html
<i class="b-template">${content}</i>
```

### Module - shortcuts

See [Shortcuts](https://github.com/azproduction/lmd/blob/master/docs/plugins_usage.md#shortcuts)

### AMD modules

See [AMD Modules and RequireJS](https://github.com/azproduction/lmd/blob/master/docs/plugins_usage.md#amd-modules-requirejs)
