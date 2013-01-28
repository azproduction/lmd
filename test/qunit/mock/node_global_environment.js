var node_global_environment = {
    require: function (name) {
        if (name == "fs") {
            return {
                // emulate readFile using XMLHttpRequest
                readFile: function (filename, encoding, callback) {
                    // shouldnt require via http
                    if (/http(s)?:\/\//.test(filename)) {
                        callback(new Error('NETWORK_ERROR'));
                        return;
                    }

                    var xhr = new (window.XMLHttpRequest || window.ActiveXObject)("Microsoft.XMLHTTP");
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            // 3. Check for correct status 200 or 0 - OK?
                            if (xhr.status < 201) {
                                callback(null, xhr.responseText);
                            } else {
                                callback(new Error('NETWORK_ERROR'));
                            }
                        }
                    };
                    xhr.open('get', filename);
                    xhr.send();
                }
            };
        }
        if (!/non_lmd_module\.js/.test(name) && !/npm_module/.test(name)) {
            throw new Error('NETWORK_ERROR');
        }
        
        // Emulate loading of non_lmd_module.js
        return {
            some_function: function () {
                return true;
            }
        };
    },
    eval: this.eval,
    Date: this.Date,
    Function: this.Function,
    node_some_global_var: true,

    // QUnit methods
    test: this.test,
    asyncTest: this.asyncTest,
    deepEqual: this.deepEqual,
    start: this.start,
    module: this.module,
    ok: this.ok,
    equal: this.equal,
    expect: this.expect,
    $: this.$,
    raises: this.raises,

    setTimeout: this.setTimeout
};

var require = node_global_environment.require;
