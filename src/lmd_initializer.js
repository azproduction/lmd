(function (global, document, scriptId, prefix, getAttribute, removeItem) {
    var globalEval = global.eval,
        scriptElement = document.getElementById(scriptId),
        actualVersion = scriptElement[getAttribute](prefix + 'version'),
        storageKey = scriptElement[getAttribute](prefix + 'key'),
        fallbackUrl = scriptElement[getAttribute](prefix + 'src'),
        ls = global.localStorage,
        // lmd:%version%:%module_name%
        rx = /^lmd:([^:]+):(.*)$/,

        script, json, head, item, main, lmd, match;

    if (ls) { // if localStorage then JSON too
        item = ls[storageKey];
        if (item) {
            try {
                json = global.JSON.parse(item);
                if (json && json.version === actualVersion) {
                    // exec cached app
                    // Note: do not pass version!
                    main = globalEval(json.main);
                    lmd = globalEval(json.lmd);
                }

                // cache async modules
                for (storageKey in ls) {
                    match = storageKey.match(rx);
                    // version match
                    if (match) {
                        // version match?
                        if (match[1] === actualVersion) {
                            // module_name = module_value
                            json.modules[match[2]] = global.JSON.parse(ls[storageKey]);
                        } else {
                            ls[removeItem](storageKey);
                        }
                    }
                }
            } catch (e) {}
            if (lmd && main) {
                // do not catch module's errors
                lmd(global, main, json.modules, json.sandboxed);
                return;
            }
            // if error or version do not match - wipe cache
            ls[removeItem](storageKey);
            for (storageKey in ls) {
                if (rx.test(storageKey)) {
                    ls[removeItem](storageKey);
                }
            }
        }
    }

    // fallback
    head = document.getElementsByTagName('head')[0];
    script = document.createElement('script');
    script.setAttribute('src', fallbackUrl);
    head.insertBefore(script, head.firstChild);
}(this, this.document, 'lmd-initializer', 'data-', 'getAttribute' , 'removeItem'));