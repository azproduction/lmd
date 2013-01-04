var $log = $('.b-log'),
    $coverage = $('.b-coverage');

$('.b-stats-button').click(function () {

    var stats = require.stats(),
        globalCoverage = stats.global,
        modulesStats = stats.modules;

    console.log(stats);

    $coverage.text(
        'Global coverage\n' +
        'Conditions: ' + globalCoverage.conditions.percentage.toFixed(2) + '%\n' +
        'Functions: ' + globalCoverage.functions.percentage.toFixed(2) + '%\n' +
        'Statements: ' + globalCoverage.lines.percentage.toFixed(2) + '%'
    );

    $log.empty();
    $(
        '<tr>' +
            '<th>name</th>' +
            '<th>type</th>' +
            '<th>initialization time</th>' +
            '<th>module required at</th>' +
            '<th>module required by</th>' +
            '<th>Conditions</th>' +
            '<th>Functions</th>' +
            '<th>Statements</th>' +
        '</tr>'
    ).appendTo($log);

    for (var moduleName in modulesStats) {
        var module = modulesStats[moduleName];
        $(
            '<tr>' +
                '<td><strong>' + moduleName + '</strong>' + (moduleName !== module.name ? ' -> ' + module.name : '') + '</td>' +
                '<td>' + module.type + '</td>' +
                (module.initTime < 0 ? moduleName == "main" ? '<td>0ms</td>' : '<td>[not inited]</td>' : '<td>' + module.initTime + 'ms</td>') +
                '<td>' + (module.accessTimes.join('ms, ') || 0) + 'ms</td>' +
                '<td>' + Object.keys(module.moduleAccessTimes) + '</td>' +
                (module.coverage ?
                '<td>' + module.coverage.conditions.percentage.toFixed(2) + '%</td>' +
                '<td>' + module.coverage.functions.percentage.toFixed(2) + '%</td>' +
                '<td>' + module.coverage.lines.percentage.toFixed(2) + '%</td>'
                : '<td>[no info]</td><td>[no info]</td><td>[no info]</td>') +
            '</tr>'
        ).appendTo($log);
    }
});