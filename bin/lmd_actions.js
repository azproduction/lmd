var shell = process.env.SHELL && process.env.SHELL.match(/\/([^\/]+)$/)[1] || 'bash';

exports.actions = {
    init: 'Initializes LMD for project',
    create: 'To create new LMD config',
    update: 'Updates existed LMD config',
    list: 'To see LMD packages list',
    build: 'To build LMD package',
    watch: 'To start/stop LMD package watcher',
    server: 'To start/stop LMD stats server',
    info: 'To see LMD extended package/build info',
    completion: '$ lmd completion >> ~/.' + shell + 'rc'
};

exports.aliases = {
    'init': 'init',

    'create': 'create',
    'new': 'create',

    'update': 'update',
    'up': 'update',

    'list': 'list',
    'ls': 'list',

    'build': 'build',
    'make': 'build',

    'watch': 'watch',

    'server': 'server',
    'serv': 'server',
    'stats': 'server',

    'info': 'info',
    'dry': 'info',
    'dry-run': 'info',

    'completion': 'completion'
};
