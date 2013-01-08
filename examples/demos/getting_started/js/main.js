var i18n = require('i18n'),
    name = require('name');

document.getElementById('name').innerHTML = name.replace('#{name}', i18n.name.replace('#', prompt('Your name', '')));
