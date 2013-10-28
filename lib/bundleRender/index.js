/**
 *
 * @param {Bundle} bundle
 * @constructor
 */
var BundleRender = function (bundle) {
    this.bundle = bundle;
    this.mainModuleId = bundle.config.main;
};
module.exports = BundleRender;

/**
 * @returns {String}
 */
BundleRender.prototype.render = function () {
    var self = this,
        modules = this.bundle.modulesCollection.modules,
        globalObject = this.bundle.isMain ? this.bundle.config.global : void 0;

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

    return '(' + (globalObject ? globalObject + ',' : '') + mainModule + ',{\n' + modulesCode + '\n},{' + pluginsOptions + '},{});';
};
