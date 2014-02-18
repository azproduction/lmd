# Istanbul example

Code coverage with istanbul and testing lmd build with mocha and mocha-phantomjs

[Live example](http://lmdjs.org/examples/tests/istanbul/) [Coverage report example](http://lmdjs.org/examples/tests/istanbul/coverage/)

## Run tests

```bash
$ npm i
$ npm coverage
```

## Note

  - `npm coverage` will generate 2 folders, both of them you can add to your `.gitignore`:
    - `lib-cov` - instrumented `lib`s
    - `coverage` - coverage report for all tests
  - `test` dir should be writable to write temporary `coverage-*.json` files
  - each `.lmd.js` file should change `root` directory to `../lib-cov` in coverage mode (`process.argv[2] === '--coverage'`)
