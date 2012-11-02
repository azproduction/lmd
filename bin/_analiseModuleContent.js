var common = require('../lib/lmd_common.js');

var config = common.assembleLmdConfig(__dirname + '/../test/qunit/.lmd/node_test.lmd.json');

//var module = common.analiseModuleContent(config.modules.module_function_fd2);
//console.log('--');
//var module = common.analiseModuleContent(config.modules.testcase_lmd_basic_features);
var module = common.analiseModuleContent(config.modules.module_function_plain);
//

//console.log(JSON.stringify(module.ast, null, '    '));