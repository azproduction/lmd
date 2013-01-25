/**
 * LMD "node" plugin example
 */

// this require is lmd_require->node_require proxy in node environment
var md5 = require('md5');

if (typeof md5 === "undefined") {
    console.log('[OK] This is DOM environment!', 'No md5 module in this build.');
} else {
    console.log('[OK] This is Node environment!', md5('42'));
}
