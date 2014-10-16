debug.time('Start Up');
var EIS = window.EIS || {};

(function ($, _, Modernizr, less, debug, d3) {
  'use strict';

// ----- NEW CODE HERE --------------------------------------------------------

EIS.icicle = {

  colors: [
    ['#084594','#2171b5','#4292c6','#6baed6','#9ecae1','#c6dbef','#eff3ff'],
    ['#99000d','#cb181d','#ef3b2c','#fb6a4a','#fc9272','#fcbba1','#fee5d9'],
    ['#005a32','#238b45','#41ab5d','#74c476','#a1d99b','#c7e9c0','#edf8e9'],
    ['#8c2d04','#d94801','#f16913','#fd8d3c','#fdae6b','#fdd0a2','#feedde'],
    ['#4a1486','#6a51a3','#807dba','#9e9ac8','#bcbddc','#dadaeb','#f2f0f7'],
    ['#91003f','#ce1256','#e7298a','#df65b0','#c994c7','#d4b9da','#f1eef6']
  ],

  topColor: '#969696',

  // Dumb Icicle Chart Builder
  Chart: function() {
    // Configurable Options
    var width = 800;
    var height = 200;
    var padding = 100;
    var colors = EIS.icicle.colors;
    var topColor = EIS.icicle.topColor;
    var partitionFunction = function(d) { return d.value; };
    var sortFunction = function(a, b) {
      var compare = a.x - b.x;
      if(compare === 0) {
        compare = a.y - b. y;
      }

      return compare;
    };
    var data = {};
    var labels = ['', '', ''];
    var duration = 750;

    // Local Variables
    var el;
    var nextColor = 0;
    var nextColors = [ 1, 1, 1, 1, 1, 1];
    var x = d3.scale.linear().range([padding, width]);
    var dx = d3.scale.linear().range([0, width-padding]);
    var y = d3.scale.linear().range([0, height]);
    var partition = d3.layout.partition().value(partitionFunction);
    var svg;
    var rect;

    // Main Function
    function my(icicle) {
      el = icicle;
      svg = icicle.html('')
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMidYMin')
        .attr('width', '100%')
        .attr('height', '100%');

      rect = svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .classed({ 'clickable': true })
        .attr('x', function(d) { return x(d.x); })
        .attr('y', function(d) { return y(d.y); })
        .attr('width', function(d) { return dx(d.dx); })
        .attr('height', function(d) { return y(d.dy); })
        .attr('fill', function(d, i) {
          if(d.depth === 0) {
            d.color = topColor;
          } else if(d.depth === 1) {
            d.colorIndex = nextColor;
            d.parentColorIndex = nextColor;
            d.color = colors[d.colorIndex][0];
            nextColor = (nextColor + 1) % colors.length;
          } else {
            var parentIndex = d.parent.parentColorIndex;
            d.colorIndex = nextColors[parentIndex];
            d.parentColorIndex = parentIndex;
            d.color = colors[parentIndex][d.colorIndex];
            nextColors[parentIndex] = (nextColors[parentIndex] + 1) % colors[parentIndex].length;
          }

          return d.color;
        })
      .on('click', function(d) { $(icicle).trigger('click', d); });

      var d = data[0];
      if(d.x === 0 && d.y === 0) {
        svg.append('text')
        .attr('x', x(0.5))
        .attr('y', y(0.125) + 10)
        .classed({'icicle-text': true})
        .text(d.name);
      }

      svg.append('rect').classed({'labels': true})
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 100)
        .attr('height', height);
      svg.append('text')
        .attr('x', 0)
        .attr('y', y(0.125) + 10)
        .classed({'icicle-labels': true, 'depth-0': true})
        .text(labels[0]);
      svg.append('text')
        .attr('x', 0)
        .attr('y', y(0.375) + 10)
        .classed({'icicle-labels': true, 'depth-1': true})
        .text(labels[1]);
      svg.append('text')
        .attr('x', 0)
        .attr('y', y(0.625) + 10)
        .classed({'icicle-labels': true, 'depth-2': true})
        .text(labels[2]);
    }

    // Other Functions
    my.update = function(d) {
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, 1]).range([d.y ? 20 : 0, height]);

      rect.transition()
        .duration(duration)
        .attr('x', function(d) { return x(d.x); })
        .attr('y', function(d) { return y(d.y); })
        .attr('width', function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr('height', function(d) { return y(d.y + d.dy) - y(d.y); })
        .each(function(d1) {
          var selected = d;
          var current = d1;
          var label = svg.select('.depth-' + current.depth);

          label.classed({'hide':
            current.depth < selected.depth - 1 ||
            (current.depth > selected.depth && !selected.children)});

            var divisor = current.depth === selected.depth -1 ? 1 : 2;
            label.transition().duration(duration)
              .attr('y', y(d1.y + (d1.dy / divisor)));
        });

        var text = el.select('.icicle-text');
        text.text(d.name);
        if(d.depth === 0) {
          text.transition()
            .duration(duration)
            .attr('y', y(0.125) + 10);
        } else {
          text.transition()
            .duration(duration)
            .attr('y', y(d.y + 0.125) + 10);
        }
    };

    // Getters/Setters
    my.width = function(value) {
      if(!arguments.length) return width;
      width = value;
      return my;
    };

    my.height = function(value) {
      if(!arguments.length) return height;
      height = value;
      return my;
    };

    my.padding = function(value) {
      if(!arguments.length) return padding;
      padding = value;
      return my;
    };

    my.colors = function(value) {
      if(!arguments.length) return colors;
      colors = value;
      return my;
    };

    my.topColor = function(value) {
      if(!arguments.length) return topColor;
      topColor = value;
      return my;
    };

    my.partitionFunction = function(value) {
      if(!arguments.length) return partitionFunction;
      partitionFunction = value;
      return my;
    };

    my.sortFunction = function(value) {
      if(!arguments.length) return sortFunction;
      sortFunction = value;
      return my;
    };

    my.data = function(value) {
      if(!arguments.length) return data;
      data = partition(value).sort(sortFunction);
      rollUpData(data); // TODO: Remove this once using new JSON file
      return my;
    };

    my.labels = function(value) {
      if(!arguments.length) return labels;
      labels = value;
      return my;
    };

    my.duration = function(value) {
      if(!arguments.length) return duration;
      duration = value;
      return my;
    };

    return my;
  },

  // Dumb Icicle Legend Builder
  Legend: function() {
    // Configurable Options
    var colors = EIS.icicle.colors;
    var topColor = EIS.icicle.topColor;
    var data = {};

    // Local Variables
    var el;
    var legendItem;
    var nextColor = 0;
    var nextColors = [ 1, 1, 1, 1, 1, 1];

    // Main Function
    function my(legend) {
      el = legend;
      legendItem = legend
        .selectAll('li');
      legendItem = legendItem
        .data(data)
        .enter()
        .append('li');

      legendItem
        .attr('class', function(d) { return 'depth-' + d.depth; })
        .on('click', function(d) { $(legend).trigger('click', d); })
        .append('span')
        .classed({'swatch': true})
        .style('background-color', function(d) { return d.color; });

      legendItem.append('span')
        .classed({'swatch-label': true})
        .text(function(d) { return d.name; });
    }

    // Other Functions
    my.update = function(d) {

    };

    // Getters/Setters
    my.colors = function(value) {
      if(!arguments.length) return colors;
      colors = value;
      return my;
    };

    my.topColor = function(value) {
      if(!arguments.length) return topColor;
      topColor = value;
      return my;
    };

    my.data = function(value) {
      if(!arguments.length) return data;
      data = value;
      return my;
    };

    return my;
  },

  // Dumb Icicle Table Builder
  Tables: function() {
    // Configurable Variables
    var colors = EIS.icicle.colors;
    var topColor = EIS.icicle.topColor;
    var formatPercent = d3.format('.1%');
    var formatDollar = d3.format('$,.2f');
    var data = {};

    // Local Variables
    var nextColor = 0;
    var nextColors = [ 1, 1, 1, 1, 1, 1];

    // Main Function
    function my(table) {

    }

    // Other Functions
    my.update = function(d) {

    };

    // Getters/Setters
    my.colors = function(value) {
      if(!arguments.length) return colors;
      colors = value;
      return my;
    };

    my.topColor = function(value) {
      if(!arguments.length) return topColor;
      topColor = value;
      return my;
    };

    my.formatPercent = function(value) {
      if(!arguments.length) return formatPercent;
      formatPercent = value;
      return my;
    };

    my.formatDollar = function(value) {
      if(!arguments.length) return formatDollar;
      formatDollar = value;
      return my;
    };

    my.data = function(value) {
      if(!arguments.length) return data;
      data = value;
      return my;
    };

    return my;
  }
};

// Intelligent Function that sets up the Account Summary Page items
EIS.AccountSummaryBuilder = function() {
  // Configurable Options
  var colors = EIS.icicle.colors;
  var topColor = EIS.icicle.topColor;
  var labels = ['', '', ''];

  //Local Variables
  var icicleEl;
  var legendEl;
  var tableEl;
  var icicle;
  var legend;
  var table;

  // Main Function
  function my(data) {
    icicleEl = d3.select('#icicle');
    legendEl = d3.select('#icicle-legend');
    tableEl = d3.select('#icicle-table');

    icicle = EIS.icicle.Chart()
      .data(data)
      .colors(colors)
      .topColor(topColor)
      .labels(labels);
    icicleEl.call(icicle);
    $(icicleEl).click(update);

    legend = EIS.icicle.Legend()
      .data(icicle.data())
      .colors(colors)
      .topColor(topColor);
    legendEl.call(legend);
    $(legendEl).click(update);

    table = EIS.icicle.Tables()
      .data(icicle.data())
      .colors(colors)
      .topColor(topColor);
    tableEl.call(table);
    $(tableEl).click(update);
  }

  // Other Functions
  function update(e, d) {
    icicle.update(d);
    legend.update(d);
    table.update(d);
  }

  my.loadByFund = function(obj) {

  };

  my.loadBySource = function(obj) {

  };

  // Getters/Setters
  my.colors = function(value) {
    if(!arguments.length) return colors;
    colors = value;
    return my;
  };

  my.topColor = function(value) {
    if(!arguments.length) return topColor;
    topColor = value;
    return my;
  };

  my.labels = function(value) {
    if(!arguments.length) return labels;
    labels = value;
    return my;
  };

  return my;
};

// ----- END NEW CODE ---------------------------------------------------------

  function getData() {
    var isJsFiddle = /^fiddle[.]jshell[.]net$/.test(location.host) || location.host === 'jsfiddle.net';
    var promise;

    if(isJsFiddle) {
      promise = $.ajax({
        url: '/gh/get/response.json/sskeller/jsfiddles-eis-icicle/tree/master/demo/',
        type: 'post',
        dataType: 'json',
        data: { 'delay': 1 }
      });
    } else {
      promise = $.getJSON('demo/demo.response.json');
    }

    return promise;
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

    var legend = d3.select('#legend-old');
    var legendItem = legend.selectAll('li');

    var buildLegend = function() {
      legendItem = legendItem.data(data)
        .enter().append('li');
      legendItem
        .attr('class', function(d) { return 'depth-' + d.depth; })
        .on('click', elementClicked)
        .append('span')
        .classed({'swatch': true})
        .style('background-color', function(d) { return d.color; });
      legendItem.append('span')
        .classed({'swatch-label': true})
        .text(function(d) { return d.name; });
    };

    var buildTable = function() {
      var totalTable = d3.select('#total-table-old');
      var itemTable = d3.select('#item-table-old');
      var row;
      var root = data[0];
      totalTable.select('caption .swatch').style('background', root.color);
      totalTable.select('caption .text').text(root.name);
      row = totalTable.select('tbody tr');
      row.append('td').text(formatDollar(root.value));
      row.append('td').text(formatDollar(root.vested));
      row.append('td').text(formatPercent(root.vested / root.value));

      _.each(root.children, function(d) {
        row = itemTable.select('tbody').append('tr');
        row.append('td').append('span')
          .classed({'swatch': true})
          .style('background', d.color);
        row.append('td').text(d.name);
        row.append('td').text(formatDollar(d.value));
        row.append('td').text(formatDollar(d.vested));
        row.append('td').text(formatPercent(d.vested / d.value));
        row.on('click', function() { elementClicked(d); });
      });
    };

    var elementClicked = function(d) {
      updateIcicle(d);
      updateLegend(d);
      updateTable(d);
    };

    var updateLegend = function(d) {
        legendItem.style('display', function(d1) {
            var shouldDisplay = d === d1;
            shouldDisplay = shouldDisplay || d.parent && d.parent === d1;
            shouldDisplay = shouldDisplay || d1.parent && d1.parent === d;
            shouldDisplay = shouldDisplay || d1.parent && d1.parent.parent && d1.parent.parent === d;
            shouldDisplay = shouldDisplay || d1.parent && d1.parent.parent && d1.parent.parent.parent && d1.parent.parent.parent === d;

            if(shouldDisplay) {
              return 'block';
            } else {
              return 'none';
            }
          });
    };

    var updateTable = function(d) {
      var totalTable = d3.select('#total-table-old');
      var itemTable = d3.select('#item-table-old');
      itemTable.classed({'table': true, 'table-striped': true});
      var header = itemTable.select('.col-title');
      var row;

      var caption = totalTable.select('caption');
      caption.on('click', function() {
        elementClicked(d.parent ? d.parent : d);
      });
      caption.select('.swatch').style('background', d.color);
      caption.select('.text').text(d.name);
      row = totalTable.select('tbody tr');
      row.html('');
      row.append('td').text(formatDollar(d.value));
      row.append('td').text(formatDollar(d.vested));
      row.append('td').text(formatPercent(d.vested / d.value));

      if(d.depth === 0) {
        header.text('Sources');
      } else if(d.depth === 1) {
        header.text('Funds / IPMs');
      } else {
        header.text('Funds');
      }

      if(d.children) {
        itemTable.select('tbody').html('');
        _.each(d.children, function(d1) {
          row = itemTable.select('tbody').append('tr');
          row.append('td').append('span')
            .classed({'swatch': true})
            .style('background', d1.color);
          row.append('td').text(d1.name);
          row.append('td').text(formatDollar(d1.value));
          row.append('td').text(formatDollar(d1.vested));
          row.append('td').text(formatPercent(d1.vested / d1.value));
          row.on('click', function() { elementClicked(d1); });
        });

        itemTable.classed({'hide': false});
      } else {
        itemTable.classed({'hide': true});
      }
    };

    getData().done(function(response) {
      var builder = EIS.AccountSummaryBuilder().labels(['Plan', 'Source(s)', 'Fund(s)']);
      builder(response);
    });

    debug.timeEnd('Start Up');
  });

})(jQuery, _, Modernizr, less, debug, d3);
