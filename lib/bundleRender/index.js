/**
 *
 * @param {Bundle} bundle
 * @param {String} mainModuleId
 * @constructor
 */
var BundleRender = function (bundle, mainModuleId) {
    this.bundle = bundle;
    this.mainModuleId = mainModuleId;
};
module.exports = BundleRender;

/**
 * @returns {String}
 */
BundleRender.prototype.render = function () {
    var self = this,
        modules = this.bundle.modulesCollection.modules;

    var mainModule = 'function(){}'; // default
    var modulesCode = modules.reduce(function (modulesCode, moduleObject) {
        var moduleCode = moduleObject.render(),
            moduleId = moduleObject.id;

        // grab main module
        if (moduleId === self.mainModuleId) {
            mainModule = moduleCode;
            return modulesCode;
        }

        modulesCode.push(JSON.stringify(moduleId) + ': ' + moduleCode);
        return modulesCode;
    }, []).join(',\n');
    var pluginsOptions = '';

    return '(' + mainModule + ',\n{\n' + modulesCode + '\n},\n{' + pluginsOptions + '\n})';
};
