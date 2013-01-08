This example covers

  * lmd config string interpolation feature (_.template style)

index.lmd.json

```javascript
{
    "name": "Config interpolation example: v${version}, ie=<%= ie %>",
    "disclaimer": "lang is a user defined property it is not inheritable",
    "lang": "ru",
    "output": "../index.lmd-<%= version %><%= lang === 'ru' ? '-ru_RU' : '' %>.js",
    "version": "0.0.1",
    "ie": false
}
```

will be interpolated to

```javascript
{
    "name": "Config interpolation example: v0.0.1, ie=false",
    "output": "../index.lmd-0.0.1-ru_RU.js",
    "version": "0.0.1",
    "ie": false
}
```

note that `lang` and `disclaimer` are user fields, they will be lost

  * `cache` - localStorage cache
  * 3-party modules
