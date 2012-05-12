/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 */

    /**
     * Loads any CSS file
     *
     * Inspired by yepnope.css.js
     *
     * @see https://github.com/SlexAxton/yepnope.js/blob/master/plugins/yepnope.css.js
     *
     * @param {String}   moduleName path to css file
     * @param {Function} callback   callback(result) undefined on error HTMLLinkElement on success
     */
    require.css = function (moduleName, callback) {
        var module = modules[moduleName],
            isNotLoaded = 1,
            head;

        // If module exists or its a worker or node.js environment
        if (module || !global_document) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return;
        }

/*$IF WORKER_OR_NODE$*/
//#JSCOVERAGE_IF 0
/*$ENDIF WORKER_OR_NODE$*/

        // Create stylesheet link
        var link = global_document.createElement("link"),
            id = global.Math.random();

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        global.setTimeout(link.onload = function (e) {
            if (isNotLoaded) {
                isNotLoaded = 0;
                // register or cleanup
                link.removeAttribute('id');
                callback(e ? register_module(moduleName, link) : head.removeChild(link) && e); // e === undefined if error
            }
        }, 3000, head); // in that moment head === undefined

        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        (function poll() {
            if (isNotLoaded) {
                try {
                    var sheets = global_document.styleSheets;
                    for (var j = 0, k = sheets.length; j < k; j++) {
                        if(sheets[j].ownerNode.id == id && sheets[j].cssRules.length) {
//#JSCOVERAGE_IF 0
                            return link.onload(1);
//#JSCOVERAGE_ENDIF
                        }
                    }
                    // if we get here, its not in document.styleSheets (we never saw the ID)
                    throw 1;
                } catch(e) {
                    // Keep polling
                    global.setTimeout(poll, 20);
                }
            }
        }());
/*$IF WORKER_OR_NODE$*/
//#JSCOVERAGE_ENDIF
/*$ENDIF WORKER_OR_NODE$*/
    };