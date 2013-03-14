var fs = require('fs'),
    Stream = require('stream'),
    path = require('path'),
    LogWriter = require(__dirname + '/../bin/cli_messages.js').LogWriter;

var LmdWriter = function (buildResult) {
    this.source = buildResult;
    this.cwd = process.cwd();
    this.cli = new LogWriter(process.stdout);
};

module.exports = LmdWriter;

/**
 * Changes current work dir
 *
 * @param {String} cwd
 *
 * @return {LmdWriter}
 */
LmdWriter.prototype.relativeTo = function (cwd) {
    this.cwd = cwd;

    return this;
};

/**
 * Changes current log interface
 *
 * @param {LogWriter} cli
 *
 * @return {LmdWriter}
 */
LmdWriter.prototype.logTo = function (cli) {
    if (!(cli instanceof LogWriter)) {
        throw new TypeError('cli should be instance of LogWriter');
    }

    this.cli = cli;

    return this;
};

/**
 * Resolves paths relative to cwd
 *
 * @param {Object} buildConfig
 * @private
 */
LmdWriter.prototype._resolvePaths = function (buildConfig) {
    var cwd = this.cwd,
        configs = path.join(cwd, '.lmd'),
        root = path.join(configs, buildConfig.root || ""),
        sourceMap = buildConfig.sourcemap ? path.join(root, buildConfig.sourcemap) : null,
        source = buildConfig.output ? path.join(root, buildConfig.output) : null;

    return {
        configs: configs,
        root: root,
        sourceMap: sourceMap,
        source: source
    };
};

LmdWriter.prototype._isCanWriteStream = function (stream, fileName) {
    return fileName && stream && stream.readable;
};

LmdWriter.prototype._pipeStreamToFile = function (stream, fileName) {
    if (this._isCanWriteStream(stream, fileName)) {
        stream.pipe(fs.createWriteStream(fileName, {
            flags: "w",
            encoding: "utf8",
            mode: 0666
        }));
    }
};

LmdWriter.prototype._logResult = function (stream, fileName, resourceName) {
    var cli = this.cli;

    if (this._isCanWriteStream(stream, fileName)) {
        stream.on('end', function () {
            cli.ok('Writing ' + resourceName + ' to ' + fileName.green);
        });
    }
};

LmdWriter.prototype._writeStreamsTo = function (stream, paths, resourceName) {
    this._logResult(stream, paths.source, 'LMD ' + resourceName);
    this._pipeStreamToFile(stream, paths.source);

    this._logResult(stream.sourceMap, paths.sourceMap, 'Source Map of ' + resourceName);
    this._pipeStreamToFile(stream.sourceMap, paths.sourceMap);
};

LmdWriter.prototype._onAllEnd = function (callback) {
    var counter = 0,
        bundles = this.source.bundles;

    var complete = function () {
        counter--;
        if (counter <= 0) {
            process.nextTick(callback);
        }
    };

    Object.keys(bundles)
        .map(function (bundleName) {
            return bundles[bundleName];
        })
        .concat([this.source, this.source.log])
        .forEach(function (stream) {
            if (!stream.readable) {
                return;
            }

            counter++;
            stream.on('end', complete);
        });
};

/**
 * Writes all build data
 */
LmdWriter.prototype.writeAll = function (callback) {
    var cli = this.cli,
        self = this,
        source = this.source,

        buildConfig = this.source.buildConfig,
        configFile = this.source.configFile,
        buildName = path.basename(configFile).split('.lmd')[0],

        paths = this._resolvePaths(buildConfig),

        isPrintToStdout = paths.source === null,
        isCanLog = buildConfig.log && !isPrintToStdout;

    // fatal error
    if (source.readable === false && isCanLog) {
        source.log.pipe(cli.stream);
        callback('fatal');
        return;
    }

    if (isPrintToStdout) {
        source.pipe(cli.stream);
        callback(null);
        return;
    }

    this._onAllEnd(callback);

    if (isCanLog) {
        var versionString = buildConfig.version ? ' - version ' + buildConfig.version.toString().cyan : '';
        cli.ok('Building `' + buildName.green +  '` (' + ('.lmd/' + buildName + '.lmd.js(on)').green + ')' + versionString);
        if (buildConfig.mixins && buildConfig.mixins.length) {
            cli.ok('Extra mixins ' + buildConfig.mixins.map(function (mixinName) {
                return mixinName.green
            }).join(', '));
        }
    }

    // Print package
    this._writeStreamsTo(source, paths, 'Package');

    // Print bundles
    var bundles = buildConfig.bundles;
    Object.keys(bundles).forEach(function (bundleName) {
        var stream = source.bundles[bundleName],
            paths = self._resolvePaths(bundles[bundleName]);

        self._writeStreamsTo(stream, paths, 'Bundle ' + bundleName.green);
    });

    // Print warnings log
    if (isCanLog) {
        source.log.pipe(cli.stream);
    }
};
