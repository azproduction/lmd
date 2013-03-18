var Q = require('q');

/**
 * @param {AbstractModule} moduleData
 */
module.exports = function (moduleData) {
    var render;

    try {
        render = require('./' + moduleData.type);
    } catch (e) {
        return Q.reject('Module render "' + moduleData.type + '" is not exists');
    }

    return Q.resolve(render(moduleData));
};
