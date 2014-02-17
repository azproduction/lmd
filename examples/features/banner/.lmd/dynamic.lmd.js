var read = require('fs').readFileSync;

var banner = '/*!\n * ' + read(__dirname + '/../LICENCE', 'utf8').replace(/\n/g, '\n * ') + '\n */';

module.exports = {
    name: 'dynamic banner example',
    banner: banner,
    root: '../js',
    output: '../dynamic.js',
    modules: {
        main: 'main.js'
    },
    main: 'main',
    ie: false
};
