/**
 * This plugin dumps modules content to localStorage
 *
 * Flag "cache"
 */
/**
 * @name sandbox
 */
(function (sb) {

    // If possible to dump and version passed (fallback mode)
    // then dump application source
    if (sb.global.localStorage && version/*if ($P.OPERA_MOBILE) {*/ && /_/.test(function(_){}) /*}*/) {
        (function () {
            try {
                sb.global.localStorage['lmd'] = sb.global.JSON.stringify({
                    version: sb.version,
                    modules: sb.modules,
                    // main module function
                    main: '(' + sb.main + ')',
                    // lmd function === arguments.callee
                    lmd: '(' + sb.lmd + ')',
                    sandboxed: sb.sandboxed
                });
            } catch(e) {}
        }());
    }

}(sandbox));