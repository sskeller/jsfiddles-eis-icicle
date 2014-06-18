debug.time("Start Up");
var EIS = window.EIS || {};

(function ($, _, Modernizr, less, debug, Request) {
  "use strict";

  _.extend(EIS, {
    colors: [
      colorbrewer.Blues["6"].reverse(),
      colorbrewer.Reds["6"].reverse(),
      colorbrewer.Greens["6"].reverse(),
      colorbrewer.Oranges["6"].reverse(),
      colorbrewer.Purples["6"].reverse(),
      colorbrewer.PuRd["6"].reverse()
    ],
    nextColor: 0,
    nextColors: [ 1, 1, 1, 1, 1, 1 ]
  });

  var width = 945;
  var height = 300;
  var x = d3.scale.linear().range([0, width]);
  var y = d3.scale.linear().range([0, height]);
  var partition = d3.layout.partition()
    .value(function(d) { return d.dollars; });
  var isJsFiddle = /^fiddle[.]jshell[.]net$/.test(location.host) || location.host === "jsfiddle.net";

  $(function() {

    /*---------- Shim to treat CSS panel as Less ----------*/
    $('head style[type="text/css"]').attr('type', 'text/less');
    less.refreshStyles();
    /*---------- End Shim ----------*/


    var svg = d3.select("#icicle").append("svg")
      .attr("width", width)
      .attr("height", height);

    var rect = svg.selectAll("rect");

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

    var buildIcicles = function(root) {
      rect = rect.data(partition(root).sort(function(a, b) { return b.dollars - a.dollars; }))
        .enter().append("rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.dx); })
        .attr("height", function(d) { return y(d.dy); })
        .attr("fill", function(d, i) {
          if(d.depth === 0) {
            d.color = "#bdbdbd";
          } else if(d.children) {
            d.colorIndex = EIS.nextColor;
            d.color = EIS.colors[d.colorIndex][0];
            EIS.nextColor = (EIS.nextColor + 1) % EIS.colors.length;
          } else {
            var parentIndex = d.parent.colorIndex;
            d.colorIndex = EIS.nextColors[parentIndex];
            d.color = EIS.colors[parentIndex][d.colorIndex];
            EIS.nextColors[parentIndex] = (EIS.nextColors[parentIndex] + 1) % EIS.colors[parentIndex].length;
          }

          return d.color;
        })
        .on("click", icicleClicked);
    };

    if(isJsFiddle) {
      $.ajax({
        url: "/gh/get/response.json/sskeller/jsfiddles-eis-icicle/tree/master/demo/",
        type: "post",
        dataType: "json",
        data: { 'delay': 1 },
        success: function(response) {
          buildIcicles(response);
        }
      });
    } else {
      d3.json("demo/demo.response.json", function(error, root) {
        buildIcicles(root);
      });
    }

    debug.timeEnd("Start Up");
  });

})(jQuery, _, Modernizr, less, debug, (window.Request || { JSON: function(){ return; } }));
