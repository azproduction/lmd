/**
 * Coverage for off-package LMD modules
 *
 * Flag "stats_sendto"
 *
 * This plugin provides sendTo private function and require.stats.sendTo() public function
 *
 * This plugin depends on stats
 */
/**
 * @name sandbox
 */
(function (sb) {

/**
  * XDomain post
  *
  * @param {String} host
  * @param {String} method
  * @param {Object} data
  * @param {String} [reportName]
  *
  */
var sendTo = function () {
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

    /**
     * @return {HTMLIFrameElement}
     */
    return function (host, method, data, reportName) {
        var JSON = sb.trigger('*:request-json', sb.global.JSON)[0];

        // Add the iframe with a unique name
        var iframe = sb.document.createElement("iframe"),
            uniqueString = sb.global.Math.random();

        sb.document.body.appendChild(iframe);
        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.left = "-1000px";
        iframe.style.top = "-1000px";
        iframe.contentWindow.name = uniqueString;

        // construct a form with hidden inputs, targeting the iframe
        var form = sb.document.createElement("form");
        form.target = uniqueString;
        form.action = host + "/" + method + '/' + (reportName || runId).replace(/\/|\\|\./g, '_');
        form.method = "POST";
        form.setAttribute('accept-charset', 'utf-8');

        // repeat for each parameter
        var input = sb.document.createElement("input");
        input.type = "hidden";
        input.name = "json";
        input.value = JSON.stringify(data);
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();

        return iframe;
    }
}();

sb.require.stats.sendTo = function (host) {
    return sendTo(host, "stats", sb.require.stats());
};

}(sandbox));