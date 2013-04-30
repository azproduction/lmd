var path = require('path');

var LMD_ROOT = path.join(__dirname, '..', '..');
var DEFAULT_DEPENDS_MASK = '*.lmd.json';

// lmd/src/lmd_plugins.json
var LMD_SRC_DIR = path.join(LMD_ROOT, 'src');
var LMD_SOURCE_FILE = path.join(LMD_SRC_DIR, 'lmd.js');
var LMD_PLUGIN_DIR = path.join(LMD_SRC_DIR, 'plugin');

var LMD_PLUGINS = require(path.join(LMD_SRC_DIR, 'lmd_plugins.json'));
var LMD_PLUGINS_NAMES = Object.keys(LMD_PLUGINS);

var SOURCE_TWEAK_FIELDS = ['warn', 'log', 'pack', 'lazy', 'optimize'];
var INHERITABLE_FIELDS = SOURCE_TWEAK_FIELDS.concat([
    'version', 'main', 'global', 'pack_options',
    'mixins', 'bundles_callback'
]);
var ALL_KNOWN_FIELDS = INHERITABLE_FIELDS.concat([
    'output', 'path', 'root', 'sourcemap', 'sourcemap_inline',
    'sourcemap_www', 'www_root', 'name', 'description'
]);

var FILED_ALIASES = {"path": "root"};

exports.LMD_ROOT = LMD_ROOT;
exports.LMD_SRC_DIR = LMD_SRC_DIR;
exports.LMD_PLUGIN_DIR = LMD_PLUGIN_DIR;
exports.LMD_SOURCE_FILE = LMD_SOURCE_FILE;

exports.LMD_PLUGINS = LMD_PLUGINS;
exports.LMD_PLUGINS_NAMES = LMD_PLUGINS_NAMES;

exports.DEFAULT_DEPENDS_MASK = DEFAULT_DEPENDS_MASK;

exports.SOURCE_TWEAK_FIELDS = SOURCE_TWEAK_FIELDS;
exports.INHERITABLE_FIELDS = INHERITABLE_FIELDS;
exports.ALL_KNOWN_FIELDS = ALL_KNOWN_FIELDS;
exports.FILED_ALIASES = FILED_ALIASES;
