
(function () {

if ($P.ASYNC_PLAIN) {

    /**
     * @param code
     * @return {Boolean} true if it is a plain LMD module
     */
    var async_is_plain_code = function (code) {
        // remove comments (bad rx - I know it, but it works for that case), spaces and ;
        code = code.replace(/\/\*.*?\*\/|\/\/.*(?=[\n\r])|\s|\;/g, '');

        // simple FD/FE parser
        if (/\(function\(|function[a-z0-9_]+\(/.test(code)) {
            var index = 0,
                length = code.length,
                is_can_return = false,
                string = false,
                parentheses = 0,
                braces = 0;

            while (index < length) {
                switch (code.charAt(index)) {
                    // count braces if not in string
                    case '{':
                        if (!string) {
                            is_can_return = true;
                            braces++
                        }
                        break;
                    case '}':
                        if (!string) braces--;
                        break;

                    case '(':
                        if (!string) parentheses++;
                        break;
                    case ')':
                        if (!string) parentheses--;
                        break;

                    case '\\':
                        if (string) index++; // skip next char in in string
                        break;

                    case "'":
                        if (string === "'") {
                            string = false; // close string
                        } else if (string === false) {
                            string = "'"; // open string
                        }
                        break;

                    case '"':
                        if (string === '"') {
                            string = false; // close string
                        } else if (string === false) {
                            string = '"'; // open string
                        }
                        break;
                }
                index++;

                if (is_can_return && !parentheses && !braces) {
                    return index !== length;
                }
            }
        }
        return true;
    };
}

var async_plain = function (module, contentTypeOrExtension) {
    // its NOT a JSON ant its a plain code
    if (!(/json$/).test(contentTypeOrExtension)/*if ($P.ASYNC_PLAIN) {*/ && async_is_plain_code(module)/*}*/) {
        // its not a JSON and its a Plain LMD module - wrap it
        module = '(function(require,exports,module){\n' + module + '\n})';
    }
    return module;
};

lmd_on('*:wrap-module', function (event, moduleName, module, contentTypeOrExtension) {
    module = async_plain(module, contentTypeOrExtension);
    return [moduleName, module, contentTypeOrExtension];
});

lmd_on('*:is-plain-module', function (event, moduleName, module) {
    if (typeof async_is_plain_code === "function") {
        return [moduleName, module, async_is_plain_code(module)];
    }
});

}());