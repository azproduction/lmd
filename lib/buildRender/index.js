var BundleRender = require('../bundleRender'),
    LmdSourceRender = require('../lmdSourceRender');

/**
 *
 * @param {Build} build
 * @constructor
 */
var BuildRenderer = function (build) {
    this.build = build;
    this.bundleRender = new BundleRender(build.bundle, this.build.config.main);
    this.lmdSourceRender = new LmdSourceRender(build.lmdSource);
};
module.exports = BuildRenderer;

/**
 * @returns {String}
 */
BuildRenderer.prototype.render = function () {
    var modulesAndConfig  = this.bundleRender.render(),
        lmdSource = this.lmdSourceRender.render();

    return lmdSource + modulesAndConfig;
};
