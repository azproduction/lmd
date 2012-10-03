define(function (require, exports, module) {

    return {
        amd_string: require('amd_amd_function_deps').amd_string,
        some_extra_number: 1,
        typeof_exports: typeof exports,
        typeof_module: typeof module,
        module_eq_module_exports: module.exports === exports
    };
});