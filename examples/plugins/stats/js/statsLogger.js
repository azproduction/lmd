var $log = $('.b-log');

$('.b-stats-button').click(function () {
    var modulesStats = require.stats();

    console.log(modulesStats);
    $log.empty();
    $(
        '<tr>' +
            '<th>name</th>' +
            '<th>type</th>' +
            '<th>initialization time</th>' +
            '<th>module required at</th>' +
            '<th>module required by</th>' +
        '</tr>'
    ).appendTo($log);

    for (var moduleName in modulesStats) {
        var module = modulesStats[moduleName];
        $(
            '<tr>' +
                '<td><strong>' + moduleName + '</strong>' + (moduleName !== module.name ? ' -> ' + module.name : '') + '</td>' +
                '<td>' + module.type + '</td>' +
                '<td>' + module.initTime + 'ms</td>' +
                '<td>' + module.accessTimes.join('ms, ') + 'ms</td>' +
                '<td>' + Object.keys(module.moduleAccessTimes) + '</td>' +
            '</tr>'
        ).appendTo($log);
    }
});