var a = '123'; // not 1
function test() { // not 2
    return a; // not 3
}

if (typeof true === "boolean") { // not 6
    var b = test(); // not 7
}