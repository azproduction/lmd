function Button($el) {
    $el.on('mouseenter mouseleave', function (event) {
        $el.toggleClass('_state_hover', event.type === 'mouseenter');
    });
}

module.exports = Button;
