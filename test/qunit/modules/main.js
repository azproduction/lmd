(function (require) {
    // common for BOM Node and Worker Envs
    require('testcase_lmd_basic_features');

    // common for BOM and Worker Envs
    // Node uses testcase_lmd_async_require.node.js
    require('testcase_lmd_async_require');

    // BOM uses testcase_lmd_loader.js,
    // Worker - lmd_loader.worker.js
    // Node - testcase_lmd_loader._node.js
    require('testcase_lmd_loader');

    // Cache
    require('testcase_lmd_cache');

    // Coverage
    require('testcase_lmd_coverage');

    // AMD Modules
    require('testcase_lmd_amd');

    // User Plugins
    require('testcase_lmd_user_plugins');

    // Ignore Modules
    require('testcase_lmd_ignore_module');

    // Subdir Module template variable
    require('testcase_lmd_subdir');
});