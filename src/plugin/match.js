/**
 * Matches in-package modules
 *
 * Flag "match"
 *
 * This plugin provides require.match() function
 */

/**
 * @name sandbox
 */
(function (sb) {
    var inPackageModules = sb.modules;

    /**
     * Matches in-package modules
     *
     * @param {RegExp} regExp
     *
     * @returns {Object} {module_name: module_content}
     */
    sb.require.match = function (regExp) {
        if (!(regExp instanceof RegExp)) {
            return null;
        }
        var result = {};

        for (var moduleName in inPackageModules) {
            if (regExp.test(moduleName)) {
                result[moduleName] = sb.require(moduleName);
            }
        }

        return result;
    };

}(sandbox));