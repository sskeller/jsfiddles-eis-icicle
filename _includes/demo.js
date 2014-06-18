debug.time("Start Up");
var EIS = window.EIS || {};

(function ($, _, Modernizr, less, debug) {
  "use strict";

  _.extend(EIS, {
  });

  $(function() {

    /*---------- Shim to treat CSS panel as Less ----------*/
    $('head style[type="text/css"]').attr('type', 'text/less');
    less.refreshStyles();
    /*---------- End Shim ----------*/

    var width = 945;
    var height = 300;
    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.linear().range([0, height]);
    var color = d3.scale.category20c();
    var partition = d3.layout.partition()
      .value(function(d) { return d.dollars; });

    var svg = d3.select("#icicle").append("svg")
      .attr("width", width)
      .attr("height", height);

    var rect = svg.selectAll("rect");
    var isJsFiddle = /^fiddle[.]jshell[.]net$/.test(location.host);
    var jsonURL = isJsFiddle ? "http://sskeller.github.io/jsfiddles-eis-icicle/json/icicle.json" : "json/icicle.json";

    d3.json(jsonURL, function(error, root) {
      rect = rect.data(partition(root))
        .enter().append("rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.dx); })
        .attr("height", function(d) { return y(d.dy); })
        .attr("fill", function(d, i) {
          d.color = color(d.x + d.depth);
          return d.color;
        })
        .on("click", icicleClicked);
    });

    var icicleClicked = function(d) {
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, 1]).range([d.y ? 20 : 0, height]);

      rect.transition()
        .duration(750)
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
    };

    debug.timeEnd("Start Up");
  });

})(jQuery, _, Modernizr, less, debug);
