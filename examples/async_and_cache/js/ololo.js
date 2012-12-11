console.log('ololo run');
var $ = require('$');
$('a').on('click', function (e) {
    e.preventDefault();
    var pewpew = require.async('pewpew', function (e) {
        e.pewpew('ololo');
    });
});