var a = '123',
    b;

function test(a) {
    return a;
}

if (typeof true === "boolean") {
    b = test(1);
} else {
    b = test(2); // not
}