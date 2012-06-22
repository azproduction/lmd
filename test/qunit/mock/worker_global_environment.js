var worker_global_environment = {
    importScripts: function (name) {
        if (!/non_lmd_module\.js/.test(name)) {
            throw new Error('NETWORK_ERROR');
        }
        // Emulate loading of non_lmd_module.js
        worker_global_environment.some_function = function () {
            return true;
        };
    },
    eval: this.eval,
    XMLHttpRequest: this.XMLHttpRequest,
    Date: this.Date,
    Function: this.Function,
    worker_some_global_var: true,

    // QUnit methods
    test: this.test,
    asyncTest: this.asyncTest,
    deepEqual: this.deepEqual,
    start: this.start,
    module: this.module,
    ok: this.ok,
    expect: this.expect,
    $: this.$,
    raises: this.raises
};