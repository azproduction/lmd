/**
 *
 * @param {Bundle} bundle
 * @constructor
 */
var BundleRender = function (bundle) {
    this.bundle = bundle;
};
module.exports = BundleRender;

/**
 * @param {String} mainModuleId
 *
 * @returns {String}
 */
BundleRender.prototype.render = function (mainModuleId) {
    var modules = this.bundle.modulesCollection.modules;

    var mainModule = 'function(){}'; // default
    var modulesCode = modules.reduce(function (modulesCode, moduleObject) {
        var moduleCode = moduleObject.render(),
            moduleId = moduleObject.id;

        // grab main module
        if (moduleId === mainModuleId) {
            mainModule = moduleCode;
            return modulesCode;
        }

        modulesCode.push(JSON.stringify(moduleId) + ': ' + moduleCode);
        return modulesCode;
    }, []).join(',\n');
    var pluginsOptions = '';

    return '(' + mainModule + ',\n{\n' + modulesCode + '\n},\n{' + pluginsOptions + '\n})';
};
