var Q = require('q');

/**
 * @param {AbstractModule} moduleData
 *
 * @returns {String}
 */
module.exports = function (moduleData) {
    var render;
    render = require('./' + moduleData.type);
    try {

    } catch (e) {
        throw new Error('Module render "' + moduleData.type + '" is not exists');
    }

    return render(moduleData);
};
