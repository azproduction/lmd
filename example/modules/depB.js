function depB(require, exports, module){
    // CommonJS Module exports
    // or exports.feature = function () {}
    module.exports = function(message) {
        return message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
}