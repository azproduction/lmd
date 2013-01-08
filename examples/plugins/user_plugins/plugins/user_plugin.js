/**
 * User plugin
 */

/**
 * @name sandbox
 * @see /docs/plugins/user_plugins.md
 */
(function (sb) {

    sb.require.user_plugin_feature = function () {
        return 'Hello from user plugin!';
    };

}(sandbox));
