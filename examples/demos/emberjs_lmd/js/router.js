module.exports = function () {
    this.resource('todos', { path: '/' }, function () {
        this.route('active');
        this.route('completed');
    });
};
