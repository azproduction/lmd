require('ok')(true, "plain module must be called once");

module.exports = function () {
    return true;
};