if (typeof require !== "function") {
    console.log('[OK] Evil module cant require');
    console.log('[OK] require is ' + typeof require);
}

module.exports = function () {
    console.log('[OK] But it can provide some resources');
};
