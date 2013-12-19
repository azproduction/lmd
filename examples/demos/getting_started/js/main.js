var i18n = require('i18n'),
    link = require('tpls/link');

var login = prompt('Twitter login', 'twitter') || 'twitter', html;

html = link.replace(/{login}/g, login);
html = i18n.message.replace(/{link}/g, html);
document.getElementById('link').innerHTML = html;
