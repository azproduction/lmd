var template = require('./template'),
    adopted = template('3-party'),
    exportsTemplate = template('3-party__exports'),
    bindTemplate = template('3-party__bind'),
    requireTemplate = template('3-party__bind');

/**
 * @param {String}        code
 * @param {Object|String} extraExports
 *
 * @return {String} modified code
 */
function decorateWithExports(code, extraExports) {
    if (typeof extraExports === "object") {
        extraExports = Object.keys(extraExports).map(function (exportName) {
                var exportCode = extraExports[exportName];
                return '    ' + JSON.stringify(exportName) + ': ' + exportCode;
            })
            .join(',\n');

        extraExports = '{\n' + extraExports + '\n};';
    }

    return exportsTemplate({
        code: code,
        extraExports: extraExports
    });
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

    if (!extraBind) {
        return code;
    }

    if (typeof extraBind === "object") {
        Object.keys(extraBind).forEach(function (bindName) {
            bindModuleName = extraBind[bindName];
            bind.push('    ' + JSON.stringify(bindName) + ': require(' + JSON.stringify(bindModuleName) + ')');
        });
        extraBind = '{\n' + bind.join(',\n') + '\n}';
    } else {
        extraBind = 'require(' + JSON.stringify(extraBind) + ')';
    }

    return bindTemplate({
        code: code,
        extraBind: extraBind
    });
}

/**
 * @param {String}              code
 * @param {Object|String|Array} extraRequire
 *
 * @return {String} modified code
 */
function decorateWithRequire(code, extraRequire) {
    var requires = [];

    if (!extraRequire) {
        return code;
    }

    if (Array.isArray(extraRequire)) {

        // extraRequire = [name, name, name]
        for (var i = 0, c = extraRequire.length, moduleName; i < c; i++) {
            moduleName = extraRequire[i];
            requires.push('require(' + JSON.stringify(moduleName) + ');');
        }

        extraRequire = requires.join('\n');
    } else if (typeof extraRequire === "object") {

        // extraRequire = {name: name, name: name}
        Object.keys(extraRequire).forEach(function (localName) {
            moduleName = extraRequire[localName];
            requires.push(localName + ' = require(' + JSON.stringify(moduleName) + ')');
        });

        extraRequire = 'var ' + requires.join(',\n    ') + ';';
    } else {
        // extraRequire = string
        extraRequire = 'require(' + JSON.stringify(extraRequire) + ');';
    }

    return requireTemplate({
        code: code,
        extraRequire: extraRequire
    });
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

    return adopted({
        code: code
    });
};
