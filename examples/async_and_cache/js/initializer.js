/**
 * This file is not part of lmd.js.
 *
 * This is localStorage loader with script fallback.
 *
 * @see /README.md near "Local Storage cache" for more info
 * @see live example /lmd/examples/mock_chat/index_cache.html near "lmd-initializer"
 *
 * How it works:
 *
 *   - if browser not support localStorage - it loads fallback script
 *   - if support localStorage and cache exists
 *     - and version is not expired - it start application from cache
 *     - version expired - it wipes cache and it loads fallback script
 *   - if no cache - it loads fallback script
 */
(function (global, document, scriptId, prefix, getAttribute, removeItem) {
    var globalEval = function (code) {
            return global.Function('return ' + code)();
        },
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
                lmd(global, main, json.modules, json.options, {stats_host: json.host});
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