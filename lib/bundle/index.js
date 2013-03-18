var Q = require('q');

/**
 * @param {String} id
 *
 * @param {Object} lmdConfigObject
 *
 * @constructor
 */
var Bundle = function (id, lmdConfigObject) {
    var self = this;

    this.id = id;
    this.isMain = id === '.';
    this.config = lmdConfigObject;

    var bundles = this.config.bundles || {};
    this.bundles = Object.keys(bundles).map(function (bundleName) {
        var bundleObject = new Bundle(bundleName, bundles[bundleName]);

        bundleObject.inheritFromMainBundle(self);

        return bundleObject;
    });

    this.deferred = Q.defer();
    this.promise = this.deferred.promise;
};
module.exports = Bundle;

/**
 *
 */
Bundle.prototype.load = function () {
    if (this.deferred.isResolved()) {
        return this.promise;
    }

    return this.promise;
};

/**
 *
 * @param {Bundle} mainBundle
 */
Bundle.prototype.inheritFromMainBundle = function (mainBundle) {

};
