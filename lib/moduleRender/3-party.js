/**
 * @param {AdoptedModule} moduleData
 */
module.exports = function (moduleData) {
    var exports = [],
        requires = [],
        bind = [],
        extraExports = moduleData.extraExports,
        extraRequire = moduleData.extraRequire,
        extraBind = moduleData.extraBind,
        code = moduleData.originalCode,
        exportCode,
        bindModuleName;

    // add exports to the module end
    // extraExports = {name: code, name: code}
    if (typeof extraExports === "object") {
        Object.keys(extraExports).forEach(function (exportName) {
            exportCode = extraExports[exportName];
            exports.push('    ' + JSON.stringify(exportName) + ': ' + exportCode);
        });
        code += '\n\n/* added by builder */\nreturn {\n' + exports.join(',\n') + '\n};';
    } else if (extraExports) {
        // extraExports = string
        code += '\n\n/* added by builder */\nreturn ' + extraExports + ';';
    }

    // change context of module (this)
    // and proxy return value
    // return function(){}.call({name: require('name')});
    if (typeof extraBind === "object") {
        Object.keys(extraBind).forEach(function (bindName) {
            bindModuleName = extraBind[bindName];
            bind.push('    ' + JSON.stringify(bindName) + ': require(' + JSON.stringify(bindModuleName) + ')');
        });
        code = '\nreturn function(){\n\n' + code + '\n}.call({\n' + bind.join(',\n') + '\n});';
    } else if (extraBind) {
        // return function(){}.call(require('name'));
        code = '\nreturn function(){\n\n' + code + '\n}.call(require(' + JSON.stringify(extraBind) + '));';
    }

    // add require to the module start
    if (typeof extraRequire === "object") {
        // extraRequire = [name, name, name]
        if (extraRequire instanceof Array) {
            for (var i = 0, c = extraRequire.length, moduleName; i < c; i++) {
                moduleName = extraRequire[i];
                requires.push('require(' + JSON.stringify(moduleName) + ');');
            }
            code = '/* added by builder */\n' + requires.join('\n') + '\n\n' + code;
        } else {
            // extraRequire = {name: name, name: name}
            Object.keys(extraRequire).forEach(function (localName) {
                moduleName = extraRequire[localName];
                requires.push(localName + ' = require(' + JSON.stringify(moduleName) + ')');
            });
            code = '/* added by builder */\nvar ' + requires.join(',\n    ') + ';\n\n' + code;
        }
    } else if (extraRequire) {
        // extraRequire = string
        code = '/* added by builder */\nrequire(' + JSON.stringify(extraRequire) + ');\n\n' + code;
    }

    return '(function (require) { /* wrapped by builder */\n' + code + '\n})';
};
