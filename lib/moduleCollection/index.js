var Q = require('q'),
    moduleFactory = require('../module');

/**
 * @param {Array} array
 *
 * @returns {Array}
 */
function arrayUnique(array) {
    return array.filter(function(item, index, array) {
        return array.indexOf(item, index + 1) < 0;
    });
}

/**
 * @param {Object} modulesOptions
 *
 * @constructor
 */
var ModuleCollection = function (modulesOptions) {
    var self = this;

    // this.modulesOptions = modulesOptions;
    this.modules = [];

    Object.keys(modulesOptions).forEach(function (id) {
        self.modules.push(moduleFactory(id, modulesOptions[id]));
    });

    this.deferred = Q.defer();
    this.promise = this.deferred.promise;
};
module.exports = ModuleCollection;

/**
 * Loads all modules
 */
ModuleCollection.prototype.load = function () {
    if (this.deferred.isResolved()) {
        return this.promise;
    }

    var promises = this.modules.map(function (moduleObject) {
        return moduleObject.load();
    });

    Q.when(promises).then(this.deferred.resolve, this.deferred.reject);

    return this.promise;
};

ModuleCollection.prototype.collect = function (name) {
    return this.modules.reduce(function (collection, moduleObject) {
        collection.concat(moduleObject[name]);

        return collection;
    }, []);
};

ModuleCollection.prototype.collectUnique = function (name) {
    return arrayUnique(this.collect(name));
};

/**
 * @returns {Object}
 */
ModuleCollection.prototype.groupWarningsByModuleId = function () {
    return this.modules.reduce(function (collection, moduleObject) {
        collection[moduleObject.id] = moduleObject.warnings;

        return collection;
    }, {});
};

/**
 * @returns {Array}
 */
ModuleCollection.prototype.collectPlugins = function () {
    return this.collectUnique('plugins');
};

/**
 * @returns {Array}
 */
ModuleCollection.prototype.collectDepends = function () {
    return this.collectUnique('depends');
};
