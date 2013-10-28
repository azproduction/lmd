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
    if (sb.global.localStorage && sb.options.version/*if ($P.OPERA_MOBILE) {*/ && /_/.test(function(){_()}) /*}*/) {
        (function () {
            var scriptElement = sb.document.getElementById('lmd-initializer'),
                storageKey = scriptElement ? scriptElement.getAttribute('data-key') : 'lmd';

            try {
                sb.global.localStorage[storageKey] = sb.global.JSON.stringify({
                    modules: sb.modules,
                    // main module function
                    main: '(' + sb.main + ')',
                    // lmd function === arguments.callee
                    lmd: '(' + sb.lmd + ')',
                    modules_options: sb.modules_options,
                    options: sb.options
                });
            } catch(e) {}
        }());
    }

}(sandbox));