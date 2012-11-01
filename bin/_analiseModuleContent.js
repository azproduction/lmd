var common = require('../lib/lmd_common.js');

var config = common.assembleLmdConfig(__dirname + '/../test/qunit/.lmd/node_test.lmd.json');

//var module = common.analiseModuleContent(config.modules.module_function_fd2);
var module = common.analiseModuleContent(config.modules.amd_amd_string);

//console.log(JSON.stringify(module.ast, null, '    '));