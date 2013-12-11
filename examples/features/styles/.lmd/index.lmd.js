module.exports = {
    "name": "styles - styles assembler",
    "mixins": [
        "./textarea-mixin.lmd.json"
    ],

    "root": "../components",
    "output": "../www/index.js",
    "styles_output": "../www/index.css",

    "modules": {
        "components/*": "**/button.js",
        "main": "../js/index.js",
        "@index.dialog.css": "@www/index.dialog.css?<%= Math.random() %>",
        "@index.dialog.js": "@www/index.dialog.js?<%= Math.random() %>"
    },
    "depends": "*.lmd.json",

    "bundles": {
        "dialog": "./dialog-bundle.lmd.json",
        "ie": {
            "output": false,
            "optimize": true
        }
    },

    "main": "main",
    "optimize": true,
    "promise": "$.Deferred",
    "shortcuts": true,
    "css": true,

    "ie": false
};
