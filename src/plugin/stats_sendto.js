/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

/**
  * XDomain post
  *
  * @param {String} host
  * @param {String} method
  * @param {Object} data
  * @param {String} [reportName]
  *
  * @return {HTMLIFrameElement}
  */
var sendTo = function () {
    if ($P.IE) {
        // Simple JSON stringify
        function stringify(object) {
            var properties = [];
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    properties.push(quote(key) + ':' + getValue(object[key]));
                }
            }
            return "{" + properties.join(",") + "}";
        }

        function getValue(value) {
            if (typeof value === "string") {
                return quote(value);
            } else if (typeof value === "boolean") {
                return "" + value;
            } else if (value.join) {
                if (value.length == 0) {
                    return "[]";
                } else {
                    var flat = [];
                    for (var i = 0, len = value.length; i < len; i += 1) {
                        flat.push(getValue(value[i]));
                    }
                    return '[' + flat.join(",") + ']';
                }
            } else if (typeof value === "number") {
                return value;
            } else {
                return stringify(value);
            }
        }

        function pad(s) {
            return '0000'.substr(s.length) + s;
        }

        function replacer(c) {
            switch (c) {
                case '\b': return '\\b';
                case '\f': return '\\f';
                case '\n': return '\\n';
                case '\r': return '\\r';
                case '\t': return '\\t';
                case '"': return '\\"';
                case '\\': return '\\\\';
                default: return '\\u' + pad(c.charCodeAt(0).toString(16));
            }
        }

        function quote(s) {
            return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, replacer) + '"';
        }
    }

    var runId = function () {
            var userAgent = navigator.userAgent,
                rchrome = /(chrome)[ \/]([\w.]+)/i,
                rwebkit = /(webkit)[ \/]([\w.]+)/i,
                ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/i,
                rmsie = /(msie) ([\w.]+)/i,
                rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/i;

            userAgent = (userAgent.match(rchrome) ||
                userAgent.match(rwebkit) ||
                userAgent.match(ropera) ||
                userAgent.match(rmsie) ||
                userAgent.match(rmozilla)
            );

            return (userAgent ? userAgent.slice(1).join('-') : 'undefined-0') + '-' +
                   (new Date+'').split(' ').slice(1, 5).join('_') + '-' +
                   Math.random();
        }();

    return function (host, method, data, reportName) {
        var JSON = require('JSON')/*if ($P.IE) {*/ || {stringify: stringify}/*}*/;

        // Add the iframe with a unique name
        var iframe = global_document.createElement("iframe"),
            uniqueString = global.Math.random();

        global_document.body.appendChild(iframe);
        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.left = "-1000px";
        iframe.style.top = "-1000px";
        iframe.contentWindow.name = uniqueString;

        // construct a form with hidden inputs, targeting the iframe
        var form = global_document.createElement("form");
        form.target = uniqueString;
        form.action = host + "/" + method + '/' + (reportName || runId).replace(/\/|\\|\./g, '_');
        form.method = "POST";

        // repeat for each parameter
        var input = global_document.createElement("input");
        input.type = "hidden";
        input.name = "json";
        input.value = JSON.stringify(data);
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();

        return iframe;
    }
}();