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

  var width = 1000;
  var height = 300;
  var x = d3.scale.linear().range([100, width]);
  var dx = d3.scale.linear().range([0, width-100]);
  var y = d3.scale.linear().range([0, height]);
  var partition = d3.layout.partition()
    .value(function(d) { return d.value; });
  var isJsFiddle = /^fiddle[.]jshell[.]net$/.test(location.host) || location.host === "jsfiddle.net";
  var formatPercent = d3.format(".1%");
  var formatDollar = d3.format("$,.2f");

  function icicleSort(a,b) {
    var compare = a.x - b.x;
    if(compare === 0) {
      compare = a.y - b.y;
    }
    return compare;
  }

  function rollUpData(data) {
    data.reverse();
    _.each(data, function(node) {
      if(node.children) {
        var sum = 0;
        _.each(node.children, function(child) {
          sum += child.vested;
        });
        node.vested = sum;
      }
    });
    data.reverse();
  }

  $(function() {

    /*---------- Shim to treat CSS panel as Less ----------*/
    $('head style[type="text/css"]').attr('type', 'text/less');
    less.refreshStyles();
    /*---------- End Shim ----------*/

    var data = {};

    var svg = d3.select("#icicle").append("svg")
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMin");

    var rect = svg.selectAll("rect");

    var buildIcicles = function(root) {
      data = partition(root).sort(icicleSort);
      rollUpData(data);

      rect = rect.data(data)
        .enter().append("rect")
        .classed({"clickable": true})
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return dx(d.dx); })
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
        .on("click", elementClicked);

        var d = data[0];
        if(d.x === 0 && d.y === 0) {
          d3.select("#icicle svg")
            .append("text")
            .attr("x", x(0.5))
            .attr("y", y(0.125) + 10)
            .classed({"icicle-text": true})
            .text(d.name);
        }

        svg.append("rect").classed({"labels": true})
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 100)
          .attr("height", height);
        svg.append("text")
          .attr("x", 0)
          .attr("y", y(0.125) + 10)
          .classed({"icicle-labels": true, "depth-0": true})
          .text("Plan");
        svg.append("text")
          .attr("x", 0)
          .attr("y", y(0.375) + 10)
          .classed({"icicle-labels": true, "depth-1": true})
          .text("Source");
        svg.append("text")
          .attr("x", 0)
          .attr("y", y(0.625) + 10)
          .classed({"icicle-labels": true, "depth-2": true})
          .text("Fund");
        svg.append("text")
          .attr("x", 0)
          .attr("y", y(0.875) + 10)
          .classed({"icicle-labels": true, "depth-3": true})
          .text("Fund");

    };

    var legend = d3.select("#legend");
    var legendItem = legend.selectAll("li");

    var buildLegend = function() {
      legendItem = legendItem.data(data)
        .enter().append("li");
      legendItem
        .attr("class", function(d) { return "depth-" + d.depth; })
        .on("click", elementClicked)
        .append("span")
        .classed({"swatch": true})
        .style("background-color", function(d) { return d.color; });
      legendItem.append("span")
        .classed({"swatch-label": true})
        .text(function(d) { return d.name; });
    };

    var buildTable = function() {
      var totalTable = d3.select("#total-table");
      var itemTable = d3.select("#item-table");
      var row;
      var root = data[0];
      totalTable.select("caption .swatch").style("background", root.color);
      totalTable.select("caption .text").text(root.name);
      row = totalTable.select("tbody tr");
      row.append("td").text(formatDollar(root.value));
      row.append("td").text(formatDollar(root.vested));
      row.append("td").text(formatPercent(root.vested / root.value));

      _.each(root.children, function(d) {
        row = itemTable.select("tbody").append("tr");
        row.append("td").append("span")
          .classed({"swatch": true})
          .style("background", d.color);
        row.append("td").text(d.name);
        row.append("td").text(formatDollar(d.value));
        row.append("td").text(formatDollar(d.vested));
        row.append("td").text(formatPercent(d.vested / d.value));
        row.on("click", function() { elementClicked(d); });
      });
    };

    var elementClicked = function(d) {
      updateIcicle(d);
      updateLegend(d);
      updateTable(d);
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
          var selected = d;
          var current = d1;
          var label = svg.select(".depth-" + current.depth);

          if(current.depth < selected.depth -1) {
            label.classed({"hide": true});
          } else if(current.depth > selected.depth && !selected.children) {
            label.classed({"hide": true});
          } else {
            label.classed({"hide": false});
          }

          var divisor = current.depth === selected.depth - 1 ? 1 : 2;
          label.transition().duration(750)
            .attr("y", y(d1.y + (d1.dy / divisor)));
        });

        var text = d3.select("#icicle .icicle-text");
          text.text(d.name);
        if(d.depth === 0) {
          text.transition()
            .duration(750)
            .attr("y", y(0.125) + 10);
        } else {
          text.transition()
            .duration(750)
            .attr("y", y(d.y + 0.125) + 10);
        }
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

    var updateTable = function(d) {
      var totalTable = d3.select("#total-table");
      var itemTable = d3.select("#item-table");
      itemTable.classed({"table": true, "table-striped": true});
      var header = itemTable.select(".col-title");
      var row;

      var caption = totalTable.select("caption");
      caption.on("click", function() {
        elementClicked(d.parent ? d.parent : d);
      });
      caption.select(".swatch").style("background", d.color);
      caption.select(".text").text(d.name);
      row = totalTable.select("tbody tr");
      row.html("");
      row.append("td").text(formatDollar(d.value));
      row.append("td").text(formatDollar(d.vested));
      row.append("td").text(formatPercent(d.vested / d.value));

      if(d.depth === 0) {
        header.text("Sources");
      } else if(d.depth === 1) {
        header.text("Funds / IPMs");
      } else {
        header.text("Funds");
      }

      if(d.children) {
        itemTable.select("tbody").html("");
        _.each(d.children, function(d1) {
          row = itemTable.select("tbody").append("tr");
          row.append("td").append("span")
            .classed({"swatch": true})
            .style("background", d1.color);
          row.append("td").text(d1.name);
          row.append("td").text(formatDollar(d1.value));
          row.append("td").text(formatDollar(d1.vested));
          row.append("td").text(formatPercent(d1.vested / d1.value));
          row.on("click", function() { elementClicked(d1); });
        });

        itemTable.classed({"hide": false});
      } else {
        itemTable.classed({"hide": true});
      }
    };

    if(isJsFiddle) {
      $.ajax({
        url: "/gh/get/response.json/sskeller/jsfiddles-eis-icicle/tree/master/demo/",
        type: "post",
        dataType: "json",
        data: { 'delay': 1 },
        success: function(response) {
          buildIcicles(response);
          buildLegend();
          buildTable();
        }
      });
    } else {
      d3.json("demo/demo.response.json", function(error, root) {
        buildIcicles(root);
        buildLegend();
        buildTable();
      });
    }

    debug.timeEnd("Start Up");
  });

})(jQuery, _, Modernizr, less, debug, d3);
