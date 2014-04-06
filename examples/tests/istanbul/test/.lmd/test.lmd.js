var cov = process.argv[2] === '--coverage' ? '-cov' : '';
module.exports = {
    'name': 'test build',
    'root': '../lib' + cov,
    'output': '../common/test.js',

    'modules': {
//      'main' module will be defined in build time, see ../Makefile
    },
    'main': 'main',

    'ie': false
};
