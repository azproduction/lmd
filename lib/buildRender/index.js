var BundleRender = require('../bundleRender');

/**
 *
 * @param {Build} build
 * @constructor
 */
var BuildRenderer = function (build) {
    this.build = build;
    this.bundleRender = new BundleRender(build.bundle);
};
module.exports = BuildRenderer;

/**
 * @returns {String}
 */
BuildRenderer.prototype.render = function () {
    var modulesAndConfig  = this.bundleRender.render(this.build.config.main);

    return modulesAndConfig;
};
