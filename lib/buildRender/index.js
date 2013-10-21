var Q = require('q'),
    BundleRender = require('../bundleRender'),
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
 * @returns {Promise}
 */
BuildRenderer.prototype.render = function () {
    var content = [
        this.lmdSourceRender.render(),
        this.bundleRender.render()
    ];

    return Q.spread(content, function (lmdSource, modulesAndConfig) {
        return lmdSource + modulesAndConfig;
    });
};
