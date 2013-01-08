/**
 * LMD require.js() and shortcuts example
 */

function drawImageOnCanvas(img) {
    var ctx = $('canvas')[0].getContext('2d');

    ctx.drawImage(img, 0, 0);
    ctx.rotate(-Math.PI / 12);
    ctx.translate(0, 150);
}

$(function () {
    var $button = $('.b-button');

    $button.click(function () {
        require.image("images/html5.png", function (img) {
            !img && console.log('Fail to load');
            drawImageOnCanvas(img);
        });
    });
});