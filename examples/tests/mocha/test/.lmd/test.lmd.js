console.log(process.env);
module.exports = {
    'name': 'test build',
    'root': '../lib',
    'output': '../common/test.js',

    'modules': {
//      'main' module will be defined in build time, see ../Makefile
    },
    'main': 'main',

    'ie': false
};
