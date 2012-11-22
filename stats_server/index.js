/**
 * LMD Stats Server
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */
var fs = require('fs'),
    path = require('path'),
    express = require("express"),
    common = require(__dirname + '/../lib/lmd_common.js'),
    assembleLmdConfig = common.assembleLmdConfig,
    flagToOptionNameMap = common.LMD_PLUGINS;

require('colors');

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
    this.configDir = path.dirname(this.configFile);

    this.config = assembleLmdConfig(this.configFile, Object.keys(flagToOptionNameMap));

    this.modules = this.config.modules;

    // 2.0 -> 3.0 migration
    this.app = typeof express === "function" ? express() : express.createServer();

    if (this.isSameAdresses) {
        this.adminApp = this.app;
        this.app.use(express.bodyParser());
        console.log('info'.green +  ':    Admin and log server are on ' + this.address.green + ':' + this.port.toString().green);
    } else {
        this.app.use(express.bodyParser());
        // 2.0 -> 3.0 migration
        this.adminApp = typeof express === "function" ? express() : express.createServer();
        this.adminApp.use(express.bodyParser());
        this.adminApp.listen(this.adminPort, this.adminAddress);
        console.log('info'.green +  ':    Admin server is on ' + this.adminAddress.green + ':' + this.adminPort.toString().green);
        console.log('info'.green +  ':    Log server is on ' + this.address.green + ':' + this.port.toString().green);
    }

    console.log('info'.green +  ':    Logs dir: ' + this.logDir.green);
    console.log('info'.green +  ':    Package root dir: ' + this.wwwDir.green);
    console.log('info'.green +  ':    LMD Config: ' + this.configFile.green);

    this.app.listen(this.port, this.address);
    require(__dirname + '/lib/admin.js').attachTo(this.adminApp, this.logDir, this.wwwDir, this.config, this.modules);
    require(__dirname + '/lib/log.js').attachTo(this.app, this.logDir);

    console.log('info'.green +  ':    Hit Ctrl+C to stop');
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

