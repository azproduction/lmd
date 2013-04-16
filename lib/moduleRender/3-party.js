/**
 * @param {String}        code
 * @param {Object|String} extraExports
 *
 * @return {String} modified code
 */
function decorateWithExports(code, extraExports) {
    if (typeof extraExports === "object") {
        Object.keys(extraExports).forEach(function (exportName) {
            var exportCode = extraExports[exportName];
            exports.push('    ' + JSON.stringify(exportName) + ': ' + exportCode);
        });
        return code + '\n\n/* added by builder */\nreturn {\n' + exports.join(',\n') + '\n};';
    } else if (extraExports) {
        // extraExports = string
        return code + '\n\n/* added by builder */\nreturn ' + extraExports + ';';
    }

    return code;
}

/**
 * @param {String}        code
 * @param {Object|String} extraBind
 *
 * @return {String} modified code
 */
function decorateWithBind(code, extraBind) {
    var bind = [],
        bindModuleName;

    if (typeof extraBind === "object") {
        Object.keys(extraBind).forEach(function (bindName) {
            bindModuleName = extraBind[bindName];
            bind.push('    ' + JSON.stringify(bindName) + ': require(' + JSON.stringify(bindModuleName) + ')');
        });
        return '\nreturn function(){\n\n' + code + '\n}.call({\n' + bind.join(',\n') + '\n});';
    } else if (extraBind) {
        // return function(){}.call(require('name'));
        return '\nreturn function(){\n\n' + code + '\n}.call(require(' + JSON.stringify(extraBind) + '));';
    }

    return code;
}

/**
 * @param {String}              code
 * @param {Object|String|Array} extraRequire
 *
 * @return {String} modified code
 */
function decorateWithRequire(code, extraRequire) {
    var requires = [];

    if (typeof extraRequire === "object") {

        // extraRequire = {name: name, name: name}
        if (!Array.isArray(extraRequire)) {
            Object.keys(extraRequire).forEach(function (localName) {
                moduleName = extraRequire[localName];
                requires.push(localName + ' = require(' + JSON.stringify(moduleName) + ')');
            });
            return '/* added by builder */\nvar ' + requires.join(',\n    ') + ';\n\n' + code;

        }

        // extraRequire = [name, name, name]
        for (var i = 0, c = extraRequire.length, moduleName; i < c; i++) {
            moduleName = extraRequire[i];
            requires.push('require(' + JSON.stringify(moduleName) + ');');
        }
        return '/* added by builder */\n' + requires.join('\n') + '\n\n' + code;

    } else if (extraRequire) {
        // extraRequire = string
        return '/* added by builder */\nrequire(' + JSON.stringify(extraRequire) + ');\n\n' + code;
    }

    return code;
}

/**
 * @param {AdoptedModule} moduleData
 */
module.exports = function (moduleData) {
    var extraExports = moduleData.extraExports,
        extraRequire = moduleData.extraRequire,
        extraBind = moduleData.extraBind,
        code = moduleData.originalCode;

    // add exports to the module end
    // extraExports = {name: code, name: code}
    code = decorateWithExports(code, extraExports);

    // change context of module (this)
    // and proxy return value
    // return function(){}.call({name: require('name')});
    code = decorateWithBind(code, extraBind);

    // add require to the module start
    code = decorateWithRequire(code, extraRequire);

    return '(function (require) { /* wrapped by builder */\n' + code + '\n})';
};
