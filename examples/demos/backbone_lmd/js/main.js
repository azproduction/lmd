var $ = require('$'),
    AppView = require('appView'),
    Workspace = require('workspaceRouter'),
    backbone = require('backbone');

$(function () {
    // Initialize routing and start backbone.history()
    new Workspace();
    backbone.history.start();

    // Initialize the application view
    new AppView();
});
