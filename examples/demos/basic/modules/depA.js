(function (require) {
    var escape = require('depB'),
        console = require('console');
    return function(message) {
        console.log(escape(message));
    }
})