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

var parser = require("uglify-js").parser;
var uglify = require("uglify-js").uglify;

function generateCode (tree) {
	return uglify.gen_code(tree, {beautify : true});
};

/**
 * This is the main function of this module (it's the only one exported)
 * Given a file path and content returns the instrumented file
 * It won't instrument files that are already instrumented
 *
 * options allow to enable/disable coverage metrics
 *    "function" enable function coverage
 *    "condition" enable condition coverage
 */
exports.interpret = function (moduleName, file, content, lineOffset, options) {
	options = options || {
		"function" : true,
		"condition" : true
	};

	try {
		var tree = parser.parse(content, false, true);
	} catch (e) {
		return {
            error: "Error instrumentig file " + file + " " + e.message
        }
	}

	var walker = uglify.ast_walker();
	// this is the list of nodes being analyzed by the walker
	// without this, w.walk(this) would re-enter the newly generated code with infinite recursion
	var analyzing = [];
	// list of all lines' id encounterd in this file
	var lines = [];
	// list of all conditions' id encounterd in this file
	var allConditions = [];
	// list of all functions' id encounterd in this file
	var allFunctions = [];
	// anonymous function takes the name of their var definition
	var candidateFunctionName = null;

    var isFirstFunction = true,
        isFirstLine = true;

	/**
	 * A statement was found in the file, remember its id.
	 */
	function rememberStatement (id) {
		lines.push(id);
	};

	/**
	 * A function was found in the file, remember its id.
	 */
	function rememberFunction (id) {
		allFunctions.push(id);
	};

	/**
	 * Generic function for counting a line.
	 * It generates a lineId from the line number and the block name (in minified files there
	 * are more logical lines on the same file line) and adds a function call before the actual
	 * line of code.
	 *
	 * 'this' is any node in the AST
	 */
	function countLine() {
		var ret;
        // skip first line
        if (isFirstLine) {
            isFirstLine = false;
            return ret;
        }
		if (this[0].start && analyzing.indexOf(this) < 0) {
			giveNameToAnonymousFunction.call(this);
			var lineId = this[0].start.line + lineOffset + ''; //this[0].name + ':' + this[0].start.line + ":" + this[0].start.pos;
			rememberStatement(lineId);

			analyzing.push(this);
			ret = [ "splice",
				[
					[ "stat",
						[ "call",
                            ["dot", ["name", "require"], "coverage_line"],
							[
								[ "string", moduleName],
								[ "string", lineId]
							]
						]
					],
					walker.walk(this)
				]
			];
			analyzing.pop(this);
		}
		return ret;
	};

	/**
	 * Walker for 'if' nodes. It overrides countLine because we want to instrument conditions.
	 *
	 * 'this' is an if node, so
	 *    'this[0]' is the node descriptor
	 *    'this[1]' is the decision block
	 *    'this[2]' is the 'then' code block
	 *    'this[3]' is the 'else' code block
	 *
	 * Note that if/else if/else in AST are represented as nested if/else
	 */
	function countIf() {
		var self = this, ret;
		if (self[0].start && analyzing.indexOf(self) < 0) {
			var decision = self[1];
			var lineId = self[0].name + ':' + (self[0].start.line + lineOffset);

			self[1] = wrapCondition(decision, lineId);

			// We are adding new lines, make sure code blocks are actual blocks
			if (self[2] && self[2][0].start && self[2][0].start.value != "{") {
				self[2] = [ "block", [self[2]]];
			}

			if (self[3] && self[3][0].start && self[3][0].start.value != "{") {
				self[3] = [ "block", [self[3]]];
			}
		}

		ret = countLine.call(self);

		if (decision) {
			analyzing.pop(decision);
		}

		return ret;
	};

	/**
	 * This is the key function for condition coverage as it wraps every condition in
	 * a function call.
	 * The condition id is generated fron the lineId (@see countLine) plus the character
	 * position of the condition.
	 */
	function wrapCondition(decision, lineId, parentPos) {
		if (options.condition === false) {
			// condition coverage is disabled
			return decision;
		}

		if (isSingleCondition(decision)) {
			var pos = getPositionStart(decision, parentPos);
			var condId = lineId + ":" + pos;

			analyzing.push(decision);
			allConditions.push(condId);
			return ["call",
                ["dot", ["name", "require"], "coverage_condition"],
				[
					[ "string", moduleName ],
					[ "string", condId],
					decision
				]
			];
		} else {
			decision[2] = wrapCondition(decision[2], lineId, getPositionStart(decision, parentPos));
			decision[3] = wrapCondition(decision[3], lineId, getPositionEnd(decision, parentPos));

			return decision;
		}
	};

	/**
	 * Wheter or not the if decision has only one boolean condition
	 */
	function isSingleCondition(decision) {
		if (decision[0].start && decision[0].name != "binary") {
			return true;
		} else if (decision[1] == "&&" || decision[1] == "||") {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * Get the start position of a given condition, if it has a start it's a true condition
	 * so get the value, otherwise use a default value that is coming from an upper decision
	 */
	function getPositionStart (decision, defaultValue) {
		if (decision[0].start) {
			return decision[0].start.pos;
		} else {
			return defaultValue || "s";
		}
	};

	/**
	 * As for getPositionStart but returns end position. It allows to give different ids to
	 * math and binary operations in multiple conditions ifs.
	 */
	function getPositionEnd (decision, defaultValue) {
		if (decision[0].end) {
			return decision[0].end.pos;
		} else {
			return defaultValue || "e";
		}
	};

	/**
	 * Generic function for every node that needs to be wrapped in a block.
	 * For instance, the following code
	 *
	 *    for (a in b) doSomething(a)
	 *
	 * once converted in AST does not have a block but only a function call.
	 * Instrumentig this code would return
	 *
	 *    for (a in b) instrumentation()
	 *    doSomething(a)
	 *
	 * which clearly does not have the same behavior as the non instrumented code.
	 *
	 * This function generates a function that can be used by the walker to add
	 * blocks when they are missing depending on where the block is supposed to be
	 */
	function wrapBlock(position) {
		return function countFor() {
			var self = this;

			if (self[0].start && analyzing.indexOf(self) < 0) {
				if (self[0].start && analyzing.indexOf(self) < 0) {
					if (self[position] && self[position][0].name != "block") {
						self[position] = [ "block", [self[position]]];
					}
				}
			}

			return countLine.call(self);
		};
	};

	/**
	 * Label nodes need special treatment as well.
	 *
	 *    myLabel : for (;;) {
	 *	     //whateveer code here
	 *       continue myLabel
	 *    }
	 *
	 * Label can be wrapped by countLine, hovewer the subsequent for shouldn't be wrapped.
	 *
	 *    instrumentation("label");
	 *    mylabel : instrumentation("for")
	 *       for (;;) {}
	 *
	 * The above code would be wrong.
	 *
	 * This function makes sure that the 'for' after a label is not instrumented and that
	 * the 'for' content is wrapped in a block.
	 *
	 * I'm don't think it's reasonable to use labels with something that is not a 'for' block.
	 * In that case the instrumented code might easily break.
	 */
	function countLabel() {
		var ret;
		if (this[0].start && analyzing.indexOf(this) < 0) {
			var content = this[2];

			if (content[0].name == "for" && content[4] && content[4].name != "block") {
				content[4] = [ "block", [content[4]]];
			}
			analyzing.push(content);

			var ret = countLine.call(this);

			analyzing.pop(content);
		}
		return ret;
	};

	/**
	 * Instrumenting function strictly needed for statement coverage only in case of 'defun'
	 * (function definition), however the block 'function' does not correspond to a new statement.
	 * This method allows to track every function call (function coverage).
	 *
	 * As far as I can tell, 'function' is different from 'defun' for the fact that 'defun'
	 * refers to the global definition of a function
	 *    function something () {}    -> defun
	 *    something = function () {}  -> function
	 * 'function' doesn't need to be counted because the line is covered by 'name' or whatever
	 * other block.
	 *
	 * Strictly speaking full statement coverage does not imply function coverage only if there
	 * are empty function, which however are empty!
	 *
	 * The tracking for functions is also a bit different from countLine (except 'defun'). This
	 * method assigns every function a name and tracks the history of every call throughout the
	 * whole lifetime of the application, It's a sort of profiler.
	 *
	 *
	 * The structure of 'this' is
	 *    'this[0]' node descriptor
	 *    'this[1]' string, name of the function or null
	 *    'this[2]' array of arguments names (string)
	 *    'this[3]' block with the function's body
	 *
	 * As 'function' happens in the middle of a line, the instrumentation should be in the body.
	 */
	function countFunction () {
		var ret;
        if (isFirstLine) {
            isFirstLine = false;
            return ret;
        }
		if (this[0].start && analyzing.indexOf(this) < 0) {
			var defun = this[0].name === "defun";
			var lineId = this[0].start.line + lineOffset + ''; //this[0].name + ":" + this[0].start.line + ":" + this[0].start.pos;
			var fnName = this[1] || this[0].anonymousName || "(?)";
            var fnId = fnName + ':' + (this[0].start.line + lineOffset) + ":" + this[0].start.pos;
			var body = this[3];

			analyzing.push(this);

			// put a new function call inside the body, works also on empty functions
			if (options["function"]) {
				body.splice(0, 0, [ "stat",
					[ "call",
                        ["dot", ["name", "require"], "coverage_function"],
						[
							["string", moduleName],
							["string", fnId]
						]
					]
				]);
				// It would be great to instrument the 'exit' from a function
				// but it means tracking all return statements, maybe in the future...

				rememberFunction(fnId);
			}

			if (defun) {
				// 'defun' should also be remembered as statements
				rememberStatement(lineId);

				ret = [ "splice",
					[
						[ "stat",
							[ "call",
                                ["dot", ["name", "require"], "coverage_line"],
								[
									[ "string", moduleName],
									[ "string", lineId]
								]
							]
						],
						walker.walk(this)
					]
				];
			} else {
				ret = walker.walk(this);
			}

			analyzing.pop(this);

		}
		return ret;
	};

	/**
	 * This function tries to extract the name of anonymous functions depending on where they are
	 * defined.
	 *
	 * For instance
	 *    var something = function () {}
	 * the function itself is anonymous but we can use 'something' as its name
	 *
	 * 'node' is anything that gets counted, function are extracted from
	 *
	 * var
	 *   node[0] : node description
	 *   node[1] : array of assignments
	 *       node[x][0] : variable name
	 *       node[x][1] : value, node
	 *
	 * object  (when functions are properties of an object)
	 *   node[0] : node description
	 *   node[1] : array of attributes
	 *       node[x][0] : attribute name
	 *       node[x][1] : value, node
	 *
	 * assign  (things like object.name = function () {})
	 *   node[0] : node description
	 *   node[1] : type of assignment, 'true' if '=' or operand (like += |= and others)
	 *   node[2] : left value, object property or variable
	 *   node[3] : right value, node
	 *
	 *   in case of assign, node[2] can be
	 *      'name' if we assign to a variable
	 *          name[0] : node description
	 *          name[1] : variable's name
	 *      'dot' when we assign to an object's property
	 *          dot[0] : node description
	 *          dot[1] : container object
	 *          dot[2] : property
	 */
	function giveNameToAnonymousFunction () {
		var node = this;

		if (node[0].name == "var" || node[0].name == "object") {
			node[1].forEach(function (assignemt) {
				if (assignemt[1]) {
					if (assignemt[1][0].name === "function") {
						assignemt[1][0].anonymousName = assignemt[0];
					} else if (assignemt[1][0].name === "conditional") {
						if (assignemt[1][2][0] && assignemt[1][2][0].name === "function") {
							assignemt[1][2][0].anonymousName = assignemt[0];
						}
						if (assignemt[1][3][0] && assignemt[1][3][0].name === "function") {
							assignemt[1][3][0].anonymousName = assignemt[0];
						}
					}
				}
			});
		} else if (node[0].name == "assign" && node[1] === true) {
			if (node[3][0].name === "function") {
				node[3][0].anonymousName = getNameFromAssign(node);
			} else if (node[3][0] === "conditional") {
				if (node[3][2][0] && node[3][2][0].name === "function") {
					node[3][2][0].anonymousName = getNameFromAssign(node);
				}
				if (node[3][3][0] && node[3][3][0].name === "function") {
					node[3][3][0].anonymousName = getNameFromAssign(node);
				}
			}
		}
	};

	function getNameFromAssign (node) {
		if (node[2][0].name === "name") {
			return node[2][1];
		} else if (node[2][0].name === "dot") {
			return node[2][2];
		}
	}

	/**
	 * This function wraps ternary conditionals in order to have condition coverage
	 *
	 * 'this' is a node containing
	 *    'this[0]' node descriptor
	 *    'this[1]' decision block
	 *    'this[2]' first statement
	 *    'this[3]' second statement
	 */
	function wrapConditionals () {
		if (options.condition === false) {
			// condition coverage is disabled
			return;
		}

		var self = this, ret;
		if (self[0].start && analyzing.indexOf(self) < 0) {
			analyzing.push(self);
			var lineId = self[0].name + ':' + (self[0].start.line + lineOffset);

			self[1] = wrapCondition(self[1], lineId);

			self[2] = walker.walk(self[2]);
			self[3] = walker.walk(self[3]);

			analyzing.pop(self);

			return self;
		} else if (self[1]) {
			self[1] = wrapCondition(self[1], lineId);
		}
	};

    function createAstForArray(array) {
        // ["array",[["string","1"],["string","2"]]]
        var result = [];
        for (var i = 0, c = array.length, item; i < c; i++) {
            item = array[i];
            result.push(["string", item]);
        }

        return ["array", result];
    }

    function insertRequireFallback() {
        if (this[0].start) {
            var body = this[3];

            if (isFirstFunction) {
                isFirstFunction = false;
                // var require = arguments[0];
                body.splice(0, 0, ["var",[["require",["sub",["name","arguments"],["num",0]]]]]);
            }
        }
    }

	var instrumentedTree = walker.with_walkers({
		"stat"     : countLine,
		"label"    : countLabel,
		"break"    : countLine,
		"continue" : countLine,
		"debugger" : countLine,
		"var"      : countLine,
		"const"    : countLine,
		"return"   : countLine,
		"throw"    : countLine,
		"try"      : countLine,
		"defun"    : countFunction,
		"if"       : countIf,
		"while"    : wrapBlock(2),
		"do"       : wrapBlock(2),
		"for"      : wrapBlock(4),
		"for-in"   : wrapBlock(4),
		"switch"   : countLine,
		"with"     : countLine,
		"function" : countFunction,
		"assign"   : giveNameToAnonymousFunction,
		"object"   : giveNameToAnonymousFunction,
		"conditional": wrapConditionals
	}, function () {
		return walker.walk(tree);
	});

    instrumentedTree = walker.with_walkers({
        "function" : insertRequireFallback
    }, function () {
        return walker.walk(instrumentedTree);
    });

	var code = generateCode(instrumentedTree);
	return {
        code: code.replace(/;$/, ''),
        options: {
            lines: lines,
            conditions: allConditions,
            functions: allFunctions
        }
    };
};