This example covers

  * mixins

With LMD you can easily build and manage multiply builds using mixins.
If you have few locales and few environments:

```bash
$ lmd ls
info:
info:    Available builds
info:
info:    index  Mixin example. Default lang=en environment=dev
info:    prod   MIXIN: production environment
info:    ru     MIXIN: ru locale
info:    test   MIXIN: test environment
info:
```

You can just run build with mixins to override default build settings:

```bash
$ lmd build index+prod+ru --output=index-prod.ru.js
$ lmd build index+test+ru --output=index-test.ru.js
```

  * interpolation

See [demo](http://lmdjs.org/examples/features/interpolation/), [code](https://github.com/azproduction/lmd/tree/master/examples/features/interpolation/)
