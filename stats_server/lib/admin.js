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
    path = require('path'),
    util = require("util"),
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
						date : fs.statSync(path.join(logDir, file)).ctime + ''
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
            fileName = path.join(wwwDir, moduleName);
        }

        // shortcut -> path
        if (fileName.charAt(0) === '@') {
            fileName = path.join(wwwDir, fileName.replace('@', ''));
        }
		readReport(req.params.report, function (err, report) {
			if (err) {
				res.send(500);
			} else {
                var module_report = report.modules[moduleName];

                if (module_report.type !== "global") {
                    var code = getCode(moduleName),
                        lines = code.split('\n');
                }

                res.render("file", {
                    name: req.params.report,
                    module: moduleName,
                    report: module_report,
                    full_report: report,
                    code: code,
                    lines: lines && lines.length,
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
            fileName = path.join(wwwDir, moduleName);
        }

        // shortcut -> path
        if (fileName.charAt(0) === '@') {
            fileName = path.join(wwwDir, fileName.replace('@', ''));
        }

        return fs.readFileSync(fileName, 'utf8');
    }

	function readReport(report, callback) {
		fs.readFile(path.join(logDir, report), function (err, data) {
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
	}

    function getSuggestions(report) {
        var moduleReport,
            byModuleReport,
            lmdModuleOptions,
            realModuleName,
            realByModuleName,
            suggestions = [];

        for (var moduleName in report.modules) {
            moduleReport = report.modules[moduleName];
            lmdModuleOptions = lmdConfig.modules[moduleName];
            realModuleName = moduleReport && moduleReport.shortcuts && moduleReport.shortcuts.length ? moduleReport.shortcuts.join(', ') : moduleName;

            // config exists and module is not a shortcut
            if (moduleReport && moduleName === moduleReport.name && moduleName !== "main") {
                // #1 If module lazy and it is requires on start add Suggestion
                if (lmdModuleOptions &&
                    lmdModuleOptions.is_lazy &&
                    moduleReport.accessTimes &&
                    moduleReport.accessTimes.length &&
                    moduleReport.accessTimes[0] < 1000) {

                    suggestions.push(util.format(
                        'Module "%s" is lazy, but it accessed at application start (%d ms) you can make it not lazy to reduce a bit startup latency',
                        realModuleName, moduleReport.accessTimes[0]
                    ));
                }

                // #4 If module starts after 5000ms and not lazy - suggest to make it lazy
                if (lmdModuleOptions &&
                    !lmdModuleOptions.is_lazy &&
                    moduleReport.accessTimes &&
                    moduleReport.accessTimes.length &&
                    moduleReport.accessTimes[0] > 5000) {

                    suggestions.push(util.format(
                        'Module "%s" is not lazy, but it runs lazily in your application (%d ms) you can make it lazy to reduce a bit startup latency',
                        realModuleName, moduleReport.accessTimes[0]
                    ));
                }

                // #2 If some module includes other module more than 2 times
                if (moduleReport.moduleAccessTimes) {
                    for (var byModuleName in moduleReport.moduleAccessTimes) {
                        byModuleReport = report.modules[byModuleName];
                        realByModuleName = byModuleReport && byModuleReport.shortcuts && byModuleReport.shortcuts.length ? byModuleReport.shortcuts.join(', ') : byModuleName;

                        if (moduleReport.moduleAccessTimes[byModuleName].length > 1) {
                            suggestions.push(util.format(
                                'Module "%s" is required by module "%s" %d times',
                                realModuleName, realByModuleName, moduleReport.moduleAccessTimes[byModuleName].length
                            ));
                        }
                    }
                }

                // #3 Suggest to create shortcuts instead of using urls
                if (moduleReport.type === "off-package" && moduleReport && moduleReport.shortcuts && moduleReport.shortcuts.length === 0) {
                    suggestions.push(util.format(
                        'You can give shortcut name to your off-package module "%s" like "some_name": "@%s"',
                        realModuleName, realModuleName
                    ));
                }

                // #5 Mark unused module (Module in not used?)
                if (lmdModuleOptions && moduleReport.accessTimes && moduleReport.accessTimes.length === 0) {
                    suggestions.push(util.format(
                        'Module "%s" is not used. You can make it off-package to reduce file size',
                        realModuleName
                    ));
                }
            }
        }

        return suggestions;
    }

	function sendReport(req, res, err, report, name) {
		if (err) {
			res.send(500);
		} else {
            var imports = [],
                rawImports = {};

            for (var moduleName in report.modules) {
                var moduleStats = report.modules[moduleName];
                if (moduleStats.name === moduleName) {
                    if (!rawImports[moduleName]) {
                        rawImports[moduleName] = {
                            "name": moduleName,
                            "size": 0,
                            "imports": []
                        };
                        imports.push(rawImports[moduleName]);
                    }
                    for (var ownerModuleName in moduleStats.moduleAccessTimes) {
                        if (!rawImports[ownerModuleName]) {
                            rawImports[ownerModuleName] = {
                                "name": ownerModuleName,
                                "size": 0,
                                "imports": []
                            };
                            imports.push(rawImports[ownerModuleName]);
                        }
                        rawImports[ownerModuleName].size++;
                        rawImports[ownerModuleName].imports.push(moduleName);
                    }
                }
            }

            res.render("report", {
                name : name || req.params.report,
                report : report,
                imports_report_data: JSON.stringify(imports),
                suggestions: getSuggestions(report)
            });
		}
	}
};