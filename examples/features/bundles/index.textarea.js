// This file was automatically generated from "index.lmd.json"
_b195a7fb((function (require, exports, module) { /* wrapped by builder */
console.log('[OK] bundle textarea loaded!');

}),{
"textareaTemplate": "<textarea cols=\"30\" rows=\"3\" placeholder=\"$1\"></textarea>",
"textareaView": (function (require, exports, module) { /* wrapped by builder */
var template = require('textareaTemplate'),
    i18n = require('textareaI18n');

var id = 0;

module.exports = function () {
    return template.replace('$1', i18n.placeholder + ' (' + (++id) + ')');
};

}),
"textareaI18n": {
    "placeholder": "Type something..."
}
},{});
