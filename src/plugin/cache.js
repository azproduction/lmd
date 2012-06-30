/**
 * @name global
 * @name lmd
 * @name sandboxed_modules
 * @name modules
 * @name main
 * @name version
 */

    // If possible to dump and version passed (fallback mode)
    // then dump application source
    if (global.localStorage && version/*if ($P.OPERA_MOBILE) {*/ && /_/.test(function(_){}) /*}*/) {
        (function () {
            try {
                global.localStorage['lmd'] = global.JSON.stringify({
                    version: version,
                    modules: modules,
                    // main module function
                    main: '(' + main + ')',
                    // lmd function === arguments.callee
                    lmd: '(' + lmd + ')',
                    sandboxed: sandboxed_modules
                });
            } catch(e) {}
        }());
    }