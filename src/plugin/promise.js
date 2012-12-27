/**
 * @name sandbox
 */
(function (sb) {

    var promisePath = sb.options.promise,
        error = 'Bad deferred ' + sb.options.promise,
        deferredFunction,
        name;

    if (typeof promisePath !== "string") {
        throw new Error(error);
    }

    promisePath = promisePath.split('.');
    deferredFunction = sb.require(promisePath[0]);

    while (promisePath.length) {
        name = promisePath.shift();
        if (typeof deferredFunction[name] !== "undefined") {
            deferredFunction = deferredFunction[name];
        }
    }

    if (typeof deferredFunction !== "function") {
        throw new Error(error);
    }

    /**
     * @event *:create-promise creates promise
     */
sb.on('*:create-promise', function () {
    var dfd = deferredFunction(),
        callback = function (argument) {
            if (typeof argument === "undefined") {
                dfd.reject();
            } else {
                dfd.resolve(/*if ($P.PARALLEL) {*/arguments.length === 1 ? /*}*/argument/*if ($P.PARALLEL) {*/ : Array.prototype.slice.call(arguments)/*}*/);
            }
        };

    return [callback, typeof dfd.promise === "function" ? dfd.promise() : dfd.promise];
});

}(sandbox));