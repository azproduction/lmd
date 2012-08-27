$(function () {
    if (!$(".b-require-graph").length) {
        return;
    }

    var packages = {

        // Lazily construct the package hierarchy from class names.
        root: function(classes) {
            var map = {};

            function find(name, data) {
                var node = map[name], i;
                if (!node) {
                    node = map[name] = data || {name: name, children: []};
                    if (name.length) {
                        node.parent = find("");
                        node.parent.children.push(node);
                        node.name = name;
                        node.key = escapeId(name);
                    }
                }
                return node;
            }

            classes.forEach(function(d) {
                find(d.name, d);
            });

            return map[""];
        },

        // Return a list of imports for the given array of nodes.
        imports:function (nodes) {
            var map = {},
                imports = [];

            // Compute a map from name to node.
            nodes.forEach(function (d) {
                map[d.name] = d;
            });

            // For each import, construct a link from the source to target node.
            nodes.forEach(function (d) {
                if (d.imports) d.imports.forEach(function (i) {
                    imports.push({
                        source: map[d.name],
                        target: map[i]
                    });
                });
            });

            return imports;
        }

    };

    var w = 800,
        h = 800,
        rx = w / 2,
        ry = h / 2,
        m0,
        rotate = 0;

    var splines = [];

    var cluster = d3.layout.cluster()
        .size([360, ry - 150])
        .sort(function(a, b) { return d3.ascending(a.key, b.key); });

    var bundle = d3.layout.bundle();

    var line = d3.svg.line.radial()
        .interpolate("bundle")
        .tension(.85)
        .radius(function(d) {
            return d.y;
        })
        .angle(function(d) {
            return d.x / 180 * Math.PI;
        });

    // Chrome 15 bug: <http://code.google.com/p/chromium/issues/detail?id=98951>
    var div = d3.select(".b-require-graph");

    var svg_wrapper = div.append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    var svg = svg_wrapper.append("svg:g")
        .attr("transform", "translate(" + rx + "," + (ry - 100) + ")");

    var legend = svg_wrapper.append('svg:g')
        .attr("transform", "translate(" + 0 + "," + 10 + ")");

    legend.append('svg:line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 30)
        .attr('y2', 0)
        .attr("class", "link source");

    legend.append("svg:text")
        .attr("dx", 35)
        .attr("dy", 3)
        .text("requires");

    legend.append('svg:line')
        .attr('x1', 0)
        .attr('y1', 15)
        .attr('x2', 30)
        .attr('y2', 15)
        .attr("class", "link target");

    legend.append("svg:text")
        .attr("dx", 35)
        .attr("dy", 18)
        .text("required by");

    // <line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2"/>

    svg.append("svg:path")
        .attr("class", "arc")
        .attr("d", d3.svg.arc().outerRadius(ry - 120).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))
        .on("mousedown", mousedown);

    (function (classes) {
        var nodes = cluster.nodes(packages.root(classes)),
            links = packages.imports(nodes),
            splines = bundle(links);

        var path = svg.selectAll("path.link")
            .data(links)
            .enter().append("svg:path")

            .attr("class", function (d) {
                return "link source-" + d.source.key + " target-" + d.target.key;
            })
            .attr("d", function (d, i) {
                return line(splines[i]);
            });

        svg.selectAll("g.node")
            .data(nodes.filter(function (n) {
                return !n.children;
            }))
            .enter().append("svg:g")
            .attr("class", "node")
            .attr("id", function (d) {
                return "node-" + d.key;
            })
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            })
            .append("svg:text")
            .attr("dx", function (d) {
                return d.x < 180 ? 8 : -8;
            })
            .attr("dy", ".31em")
            .attr("text-anchor", function (d) {
                return d.x < 180 ? "start" : "end";
            })
            .attr("transform", function (d) {
                return d.x < 180 ? null : "rotate(180)";
            })
            .text(function (d) {
                return d.name;
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        d3.select("input[type=range]").on("change", function () {
            line.tension(this.value / 100);
            path.attr("d", function (d, i) {
                return line(splines[i]);
            });
        });
    }(window.importsReportData));

    d3.select(window)
        .on("mousemove", mousemove)
        .on("mouseup", mouseup);

    function escapeId(name) {
        return name.replace(/\/|\./g, '__');
    }

    function mouse(e) {
        return [e.pageX - rx, e.pageY - ry];
    }

    function mousedown() {
        m0 = mouse(d3.event);
        d3.event.preventDefault();
    }

    function mousemove() {
        if (m0) {
            var m1 = mouse(d3.event),
                dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
            div.style("transform", "translate3d(0," + (ry - rx) + "px,0)rotate3d(0,0,0," + dm + "deg)translate3d(0," + (rx - ry) + "px,0)");
        }
    }

    function mouseup() {
        if (m0) {
            var m1 = mouse(d3.event),
                dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;

            rotate += dm;
            if (rotate > 360) rotate -= 360;
            else if (rotate < 0) rotate += 360;
            m0 = null;

            div.style("transform", "rotate3d(0,0,0,0deg)");

            svg
                .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
                .selectAll("g.node text")
                .attr("dx", function (d) {
                    return (d.x + rotate) % 360 < 180 ? 8 : -8;
                })
                .attr("text-anchor", function (d) {
                    return (d.x + rotate) % 360 < 180 ? "start" : "end";
                })
                .attr("transform", function (d) {
                    return (d.x + rotate) % 360 < 180 ? null : "rotate(180)";
                });
        }
    }

    function mouseover(d) {
        svg.selectAll("path.link.target-" + d.key)
            .classed("target", true)
            .each(updateNodes("source", true));

        svg.selectAll("path.link.source-" + d.key)
            .classed("source", true)
            .each(updateNodes("target", true));
    }

    function mouseout(d) {
        svg.selectAll("path.link.source-" + d.key)
            .classed("source", false)
            .each(updateNodes("target", false));

        svg.selectAll("path.link.target-" + d.key)
            .classed("target", false)
            .each(updateNodes("source", false));
    }

    function updateNodes(name, value) {
        return function (d) {
            if (value) this.parentNode.appendChild(this);
            svg.select("#node-" + d[name].key).classed(name, value);
        };
    }

    function cross(a, b) {
        return a[0] * b[1] - a[1] * b[0];
    }

    function dot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }
});