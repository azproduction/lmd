(function (require) {
    var escape = require('depB');
    return function(message) {
        console.log(escape(message));
    }
})