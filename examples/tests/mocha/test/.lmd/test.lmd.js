module.exports = {
    'name': 'test build',
    'root': '../lib',
    'output': '../common/test.js',

    'modules': {
        '${subdir}${file}': '**/*.js'
//      'main' module will be defined in build time, see ../Makefile
    },
    'main': 'main',

    'ie': false
};
