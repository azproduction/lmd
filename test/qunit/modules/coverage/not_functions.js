(function (require) {
    var a = '123';
    function test() { // not
        return a; // not
    }

    if (typeof true === "boolean") {
        var b = a;
    }
})