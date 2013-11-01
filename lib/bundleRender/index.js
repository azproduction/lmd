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
    if (this.bundle.isMain) {
        return this._renderMainBundle();
    }

    // TODO render sub bundle
    return '';
};

/**
 * Renders main lmd bundle
 *
 * @returns {string}
 * @private
 */
BundleRender.prototype._renderMainBundle = function () {
    var lmdArguments = []
        .concat(this._renderGlobalObject())
        .concat(this._renderModules())
        .concat(this._renderModulesOptions())
        .concat(this._renderPluginsOptions());

    return '(' + lmdArguments.join(',') + ');';
};

/**
 * Renders main module and then list of modules [main, list]
 *
 * @returns {Array.<string>}
 * @private
 */
BundleRender.prototype._renderModules = function () {
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

    return [mainModule, '{\n' + modulesCode + '\n}'];
};

/**
 * Renders global object name
 *
 * @returns {string}
 * @private
 */
BundleRender.prototype._renderGlobalObject = function () {
    return this.bundle.config.global;
};

/**
 * Renders list of modules options
 *
 * @returns {string}
 * @private
 */
BundleRender.prototype._renderModulesOptions = function () {
    // TODO collect modules options
    return JSON.stringify({});
};

/**
 * Renders list of plugin options
 *
 * @returns {string}
 * @private
 */
BundleRender.prototype._renderPluginsOptions = function () {
    var lmdConfig = this.bundle.config;

    var propertyToOptionMap = {
         // if version passed -> module will be cached
        version: lmdConfig.cache ? lmdConfig.version : false,
        stats_host: lmdConfig.stats_auto || false,
        promise: lmdConfig.promise || false,
        bundle: lmdConfig.bundles_callback || false
    };

    var options = Object.keys(propertyToOptionMap).reduce(function (options, name) {
        var value = propertyToOptionMap[name];

        if (value) {
            options[name] = value;
        }

        return options;
    }, {});

    // TODO add use plugins
    /*for (var userPluginName in lmdConfig.plugins) {
        userPlugin = lmdConfig.plugins[userPluginName];
        if (userPlugin.isOk && userPlugin.options && !options[userPlugin.name]) {
            options[userPlugin.name] = userPlugin.options;
        }
    }*/

    return JSON.stringify(options);
};
