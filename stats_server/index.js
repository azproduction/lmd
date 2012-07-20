/**
 * LMD Stats Server
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */
var fs = require('fs'),
    express = require("express"),
    common = require(__dirname + '/../lib/lmd_common.js'),
    /*tryExtend = common.tryExtend,
    collectModules = common.collectModules,*/
    assembleLmdConfig = common.assembleLmdConfig,
    flagToOptionNameMap = JSON.parse(fs.readFileSync('../../src/lmd_flags.json'));

var CROSS_PLATFORM_PATH_SPLITTER = common.PATH_SPLITTER;

/**
 *
 * @constructor
 *
 * @example
 *
 * new LmdStatsServer({
 *    address: '0.0.0.0',
 *    port: 8081,
 *    config: '../examples/mock_chat/js/lmd/index.lmd.json',
 *    log: './logs/',
 *    www: '../examples/mock_chat/'
 * });
 */
function LmdStatsServer(data) {
    var args = this.parseData(data);

    this.address = args.address || args.a || '0.0.0.0';
    this.port = args.port || args.p || 8081;

    this.adminAddress = args['admin-address'] || args.aa || this.address;
    this.adminPort = args['admin-port'] || args.ap || this.port;

    this.isSameAdresses = this.address === this.adminAddress &&
                          this.port === this.adminPort;

    this.configFile = args.config || args.c;
    this.logDir = args.log || args.l;
    this.wwwDir = args.www || args.wd;

    if (!this.logDir || !this.wwwDir) {
        throw new Error('Log dir and www dir must be specified');
    }

    if (!this.configFile) {
        throw new Error('Config file is required');
    }

    this.logDir = fs.realpathSync(this.logDir);

    this.wwwDir = fs.realpathSync(this.wwwDir);

    this.configFile = fs.realpathSync(this.configFile);

    this.configDir = fs.realpathSync(this.configFile);
    this.configDir = this.configDir.split(CROSS_PLATFORM_PATH_SPLITTER);
    this.configDir.pop();
    this.configDir = this.configDir.join('/');

    this.config = assembleLmdConfig(this.configFile, Object.keys(flagToOptionNameMap));

    this.modules = this.config.modules;

    this.app = express.createServer();

    if (this.isSameAdresses) {
        this.adminApp = this.app;
        this.app.use(express.bodyParser());
        console.log('Admin and log server are on ' + this.address + ':' + this.port);
    } else {
        this.app.use(express.bodyParser());
        this.adminApp = express.createServer();
        this.adminApp.use(express.bodyParser());
        this.adminApp.listen(this.adminPort, this.adminAddress);
        console.log('Admin server is on ' + this.adminAddress + ':' + this.adminPort);
        console.log('Log server is on ' + this.address + ':' + this.port);
    }

    console.log('Logs dir: ' + this.logDir);
    console.log('Www dir: ' + this.wwwDir);
    console.log('LMD config: ' + this.configFile);

    this.app.listen(this.port, this.address);
    require('./lib/admin.js').attachTo(this.adminApp, this.logDir, this.wwwDir, this.config, this.modules);
    require('./lib/log.js').attachTo(this.app, this.logDir);

    console.log('Hit Ctrl+C to stop');
}

/**
 * Simple argv parser
 *
 * @see https://gist.github.com/1497865
 *
 * @param {String} a an argv string
 *
 * @returns {Object}
 */
LmdStatsServer.prototype.parseArgv = function (a,b,c,d) {
    c={};for(a=a.split(/\s*\B[-]+([\w-]+)[\s=]*/),d=1;b=a[d++];c[b]=a[d++]||!0);return c
};

/**
 * @param {String|Object} data
 * @return {Object}
 */
LmdStatsServer.prototype.parseData = function (data) {
    if (typeof data === "object") {
        return data;
    }

    return this.parseArgv(data);
};

module.exports = LmdStatsServer;

