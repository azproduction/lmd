var path = require('path'),
    Q = require('q'),
    BundleRender = require('../bundleRender'),
    LmdSourceRender = require('../lmdSourceRender');

/**
 *
 * @param {Build} build
 * @constructor
 */
var BuildRenderer = function (build) {
    this.build = build;
    this.bundleRender = new BundleRender(build.bundle);
    this.lmdSourceRender = new LmdSourceRender(build.lmdSource);
};
module.exports = BuildRenderer;

/**
 * @returns {Promise}
 */
BuildRenderer.prototype.render = function () {
    var content = [
        this.renderBanner(),
        this.lmdSourceRender.render(),
        this.bundleRender.render()
    ];

    return Q.spread(content, function (banner, lmdSource, modulesAndConfig) {
        return banner + '\n' + lmdSource + '\n' + modulesAndConfig;
    });
};

/**
 * @returns {String} build banner
 */
BuildRenderer.prototype.renderBanner = function () {
    var lmdConfigBasename = path.basename(this.build.configFile);
    return '// This file was automatically generated from "' + lmdConfigBasename + '"';
};
