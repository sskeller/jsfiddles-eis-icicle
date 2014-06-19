debug.time("Start Up");
var EIS = window.EIS || {};

(function ($, _, Modernizr, less, debug, d3) {
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

    var data = {};

    var svg = d3.select("#icicle").append("svg")
      .attr("width", width)
      .attr("height", height);

    var rect = svg.selectAll("rect");

    var buildIcicles = function(root) {
      data = partition(root).sort(function(a, b) { return b.dollars - a.dollars; });
      rect = rect.data(data)
        .enter().append("rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.dx); })
        .attr("height", function(d) { return y(d.dy); })
        .attr("fill", function(d, i) {
          if(d.depth === 0) {
            d.color = "#969696";
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
        .each(function(d) {
          if(d.x === 0 && d.y === 0) {
            d3.select("#icicle svg")
              .append("text")
              .attr("x", x(0.5))
              .attr("y", y(0.125) + 10)
              .attr("class", "icicle-text")
              .text(d.name);
          }
        })
        .on("click", elementClicked);
    };

    var legend = d3.select("#legend");
    var legendItem = legend.selectAll("li");

    var buildLegend = function(root) {
      legendItem = legendItem.data(data)
        .enter().append("li");
      legendItem
        .attr("class", function(d) { return "depth-" + d.depth; })
        .on("click", elementClicked)
        .append("span")
        .attr("class", "swatch")
        .style("background-color", function(d) { return d.color; });
      legendItem.append("span")
        .attr("class", "swatch-label")
        .text(function(d) { return d.name; });
    };

    var elementClicked = function(d) {
      updateIcicle(d);
      updateLegend(d);
    };

    var updateIcicle = function(d) {
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, 1]).range([d.y ? 20 : 0, height]);

      rect.transition()
        .duration(750)
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
        .each(function(d1) {
          if(d1 === d) {
            var text = d3.select("#icicle .icicle-text");
              text.transition().delay(750).text(d1.name);
            if(d1.depth === 0) {
              text.transition()
                .duration(750)
                .attr("y", y(0.125) + 10);
            } else {
              text.transition()
                .duration(750)
                .attr("y", y(d1.y + 0.125) + 10);
            }
          }
        });
    };

    var updateLegend = function(d) {
        legendItem.style("display", function(d1) {
            var shouldDisplay = d === d1;
            shouldDisplay = shouldDisplay || d.parent && d.parent === d1;
            shouldDisplay = shouldDisplay || d1.parent && d1.parent === d;
            shouldDisplay = shouldDisplay || d1.parent && d1.parent.parent && d1.parent.parent === d;
            shouldDisplay = shouldDisplay || d1.parent && d1.parent.parent && d1.parent.parent.parent && d1.parent.parent.parent === d;

            if(shouldDisplay) {
              return "block";
            } else {
              return "none";
            }
          });
    };

    if(isJsFiddle) {
      $.ajax({
        url: "/gh/get/response.json/sskeller/jsfiddles-eis-icicle/tree/master/demo/",
        type: "post",
        dataType: "json",
        data: { 'delay': 1 },
        success: function(response) {
          buildIcicles(response);
          buildLegend(response);
        }
      });
    } else {
      d3.json("demo/demo.response.json", function(error, root) {
        buildIcicles(root);
        buildLegend(root);
      });
    }

    debug.timeEnd("Start Up");
  });

})(jQuery, _, Modernizr, less, debug, d3);
