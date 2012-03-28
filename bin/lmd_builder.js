/**
 * LMD
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */

var LMD_JS = __dirname + '/../src/lmd_min.js',
    fs = require('fs'),
    parser = require("uglify-js").parser,
    uglify = require("uglify-js").uglify;

var LmdBuilder = function (argv) {
    this.configFile = argv[2];
    this.outputFile = argv[3];
    this.configDir = fs.realpathSync(this.configFile);
    this.configDir = this.configDir.split('/');
    this.configDir.pop();
    this.configDir = this.configDir.join('/');
    if (this.configure()) {
        this.build();
    }
};

LmdBuilder.prototype.compress = function (code) {
    var ast = parser.parse(code);
    ast = uglify.ast_mangle(ast);
    ast = uglify.ast_squeeze(ast);

    return uglify.gen_code(ast);
};

LmdBuilder.prototype.tryWrap = function (code) {
    try {
        var ast = parser.parse(code);
    } catch (e) {
        console.log('parse error on ' + code);
        process.exit(1);
        return;
    }

    // ["toplevel",[["defun","depA",["require"],[]]]]
    if (ast && ast.length === 2 &&
        ast[1] && ast[1].length === 1 &&
        ast[1][0][0] === "defun"
        ) {
        return code;
    }

    // ["toplevel",[["stat",["function",null,["require"],[]]]]]
    if (ast && ast.length === 2 &&
        ast[1] && ast[1].length === 1 &&
        ast[1][0][0] === "stat" &&
        ast[1][0][1] &&
        ast[1][0][1][0] === "function"
        ) {
        return code;
    }

    return '(function (require, exports, module) { /* wrapped by builder */\n' + code + '\n})';
};

LmdBuilder.prototype.escape = function (file) {
    return JSON.stringify(file);
};

LmdBuilder.prototype.render = function (lmd_modules, lmd_main, pack, globalObject, sandboxedModules) {
    globalObject = globalObject || 'this';
    sandboxedModules = JSON.stringify(sandboxedModules || {});
    var lmd_js = fs.readFileSync(LMD_JS, 'utf8'),
        result;

    lmd_modules = '{\n' + lmd_modules.join(',\n') + '\n}';
    result = lmd_js + '(' + globalObject + ',' + sandboxedModules + ')(' + lmd_modules + ')(' + lmd_main + ')';

    if (pack) {
        result = this.compress(result);
    }

    return result;
};

LmdBuilder.prototype.configure = function () {
    if (!this.configFile) {
        console.log('lmd usage:\n\t    lmd config.lmd.json [output.lmd.js]');
        return false;
    }
    return true;
};

LmdBuilder.prototype.extract = function (file) {
    file = file.split('/');
    return {
        file: file.pop(),
        path: (file.length ? file.join('/') + '/' : '')
    };
};

LmdBuilder.prototype.deepDestructableMerge = function (left, right) {
    for (var prop in right) {
        if (right.hasOwnProperty(prop))  {
            if (typeof left[prop] === "object") {
                this.deepDestructableMerge(left[prop], right[prop]);
            } else {
                left[prop] = right[prop];
            }
        }
    }
    return left;
};

LmdBuilder.prototype.tryExtend = function (config) {
    config = config || {};
    if (typeof config.extends !== "string") {
        return config;
    }
    var parentConfig = this.tryExtend(JSON.parse(fs.readFileSync(this.configDir + '/' + config.extends, 'utf8')));

    return this.deepDestructableMerge(parentConfig, config);
};

LmdBuilder.prototype.build = function () {
    var config = this.tryExtend(JSON.parse(fs.readFileSync(this.configFile, 'utf8'))),
        lazy = typeof config.lazy === "undefined" ? true : config.lazy,
        mainModuleName = config.main,
        pack = lazy ? true : typeof config.pack === "undefined" ? true : config.pack,
        path =  config.path || '',
        moduleContent,
        modulePath,
        lmdModules = [],
        lmdMain,
        lmdFile,
        isJson,
        modules = {},
        moduleName,
        IS_HAS_WILD_CARD = /\*/,
        wildcard_regex,
        descriptor;

    if (config.modules) {
        if (path[0] !== '/') { // non-absolute
            path = this.configDir + '/' + path;
        }

        // grep paths
        for (moduleName in config.modules) {
            modulePath = config.modules[moduleName];
            // its a wildcard
            // "*": "*.js" or "*_pewpew": "*.ru.json" or "ololo": "*.js"
            if (IS_HAS_WILD_CARD.test(modulePath)) {
                descriptor = this.extract(modulePath);
                wildcard_regex = new RegExp("^" + descriptor.file.replace(/\*/g, "(\\w+)") + "$");
                fs.readdirSync(path + descriptor.path).forEach(function (fileName) {
                    var match = fileName.match(wildcard_regex),
                        newModuleName;

                    if (match) {
                        match.shift();

                        // Modify a module name
                        match.forEach(function (replacement) {
                            newModuleName = moduleName.replace('*', replacement);
                        });
                        modules[newModuleName] = fs.realpathSync(path + descriptor.path + fileName);
                    }
                });
            } else {
                // normal name
                // "name": "name.js"
                modules[moduleName] = fs.realpathSync(path + modulePath);
            }
        }

        for (moduleName in modules) {
            moduleContent = fs.readFileSync(modules[moduleName], 'utf8');

            try {
                JSON.parse(moduleContent);
                isJson = true;
            } catch (e) {
                isJson = false;
            }

            if (!isJson) {
                moduleContent = this.tryWrap(moduleContent);
            }

            if (!isJson && pack) {
                moduleContent = this.compress(moduleContent);
            }

            if (moduleName === mainModuleName) {
                lmdMain = moduleContent;
            } else {
                if (!isJson && lazy) {
                    moduleContent = this.escape('(' + moduleContent.replace(/^function[^\(]*/, 'function') + ')' );
                }
                lmdModules.push(this.escape(moduleName) + ': ' + moduleContent);
            }
        }

        lmdFile = this.render(lmdModules, lmdMain, pack, config.global, config.sandbox);

        if (this.outputFile) {
            fs.writeFileSync(this.outputFile, lmdFile,'utf8')
        } else {
            process.stdout.write(lmdFile);
        }
    }
};

module.exports = LmdBuilder;