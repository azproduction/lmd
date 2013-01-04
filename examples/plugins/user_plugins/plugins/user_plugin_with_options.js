/**
 * User plugin
 */

/**
 * @name sandbox
 * @see /docs/plugins/user_plugins.md
 */
(function (sb) {

    sb.require.user_plugin_with_options_feature = function () {
        return sb.options['user_plugin_with_options'];
    };

}(sandbox));
