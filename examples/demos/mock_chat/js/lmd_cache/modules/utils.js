(function (require, exports) {
    
var document = require('document');

exports.$ = function (string, relativeTo) {
    return (relativeTo || document).querySelector(string);
};

})