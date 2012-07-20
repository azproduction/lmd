/**
 * This code was originally made by Fabio Crisci and distributed under MIT licence
 *
 * Copyright (c) 2012 Fabio Crisci <fabio.crisci@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var fs = require("fs"),
    express = require('express');

exports.attachTo = function (app, logDir, wwwDir, lmdConfig, lmdModules) {
	app.set("view engine", "jade");
	app.set("view options", {
		layout: false
	});

	app.set("views", __dirname + "/../views");
	app.use(express.static(__dirname + "/../views/statics"));

    // list all coverage reports
	app.get("/", function (req, res) {
		fs.readdir(logDir, function (err, files) {
			if (err) {
				res.send("Error while reading directory " + logDir, 404);
			} else {
				var reports = [];
				files.forEach(function (file) {
					reports.push({
						id : file,
						date : fs.statSync(logDir + '/' + file).ctime + ''
					});
				});
				reports.sort(function (first, second) {
					var timeOne = first.time;
					var timeTwo = second.time;
					if (timeOne == timeTwo) {
						// rly ?
						return 0;
					}
					return timeOne < timeTwo ? 1 : -1;
				});
                res.render("admin", {
                    reports : reports
                });
			}
		});
	});

	app.get("/report/:report", function (req, res) {
		readReport(req.params.report, sendReport.bind(this, req, res));
	});

	app.get("/report/:report/module/:moduleName", function (req, res) {
		var moduleName = req.params.moduleName,
            fileName;
        // lmd module name -> path|shortcut
        if (lmdModules[moduleName]) {
            fileName = lmdModules[moduleName].path;
        } else {
            // www_path -> path
            fileName = wwwDir + moduleName;
        }

        // shortcut -> path
        if (fileName.charAt(0) === '@') {
            fileName = wwwDir + fileName.replace('@', '');
        }
		readReport(req.params.report, function (err, report) {
			if (err) {
				res.send(500);
			} else {
                var code = getCode(moduleName),
                    lines = code.split('\n');

                res.render("file", {
                    name: req.params.report,
                    module: moduleName,
                    report: report.modules[moduleName],
                    code: code,
                    lines: lines.length,
                    options: {
                        highlight: 'idea'
                    }
                });
			}
		});
	});

    function getCode(moduleName) {
        var fileName;
        // lmd module name -> path|shortcut
        if (lmdModules[moduleName]) {
            fileName = lmdModules[moduleName].path;
        } else {
            // www_path -> path
            fileName = wwwDir + '/' + moduleName;
        }

        // shortcut -> path
        if (fileName.charAt(0) === '@') {
            fileName = wwwDir + '/' + fileName.replace('@', '');
        }

        return fs.readFileSync(fileName, 'utf8');
    }

	function readReport (report, callback) {
		fs.readFile(logDir + "/" + report, function (err, data) {
			if (err) {
				console.error(err);
				callback.call(null, err);
			} else {
				try {
					var result = JSON.parse(data);
					callback.call(null, false, result);
				} catch (ex) {
					console.error(ex);
					callback.call(null, ex);
				}
			}
		});
	};

	function sendReport(req, res, err, report, name) {
		if (err) {
			res.send(500);
		} else {
            res.render("report", {
                name : name || req.params.report,
                report : report
            });
		}
	};

	function readMultipleReports (reports, callback) {
		var howMany = reports.length;
		var result = [];
		if (howMany == 0) {
			return callback.call(this, "No reports to read");
		}
		reports.forEach(function (report) {
			readReport(report, function (err, data) {
				if (err) {
					callback.call(this, err);
				} else {
					result.push(data);
					howMany -= 1;
					if (howMany < 1) {
						callback.call(this, null, result);
					}
				}
			});
		});
	}
};