var cov = process.argv[2] === '--coverage' ? '-cov' : '';
module.exports = {
    description: 'dependencies for test.sum.js test',
    root: '../lib' + cov,
    modules: {
        'sum': 'sum.js'
    }
};
