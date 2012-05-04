(function (global, document, scriptId, prefix, getAttribute) {
    var globalEval = global.eval,
        scriptElement = document.getElementById(scriptId),
        actualVersion = scriptElement[getAttribute](prefix + 'version'),
        storageKey = scriptElement[getAttribute](prefix + 'key'),
        fallbackUrl = scriptElement[getAttribute](prefix + 'src'),

        script, json, head, item;

    if (global.localStorage) { // if localStorage then JSON too
        item = global.localStorage[storageKey];
        if (item) {
            try {
                json = global.JSON.parse(item);
                if (json && json.version === actualVersion) {
                    // exec cached app
                    // Note: do not pass version!
                    globalEval(json.lmd)(global, globalEval(json.main), json.modules, json.sandboxed);
                    return;
                }
            } catch (e) {}
            // if error or version do not match - wipe cache
            global.localStorage.removeItem(storageKey);
        }
    }

    // fallback
    head = document.getElementsByTagName('head')[0];
    script = document.createElement('script');
    script.setAttribute('src', fallbackUrl);
    head.insertBefore(script, head.firstChild);
}(this, this.document, 'lmd-initializer', 'data-', 'getAttribute'));