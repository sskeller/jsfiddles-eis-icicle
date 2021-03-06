debug.time('Start Up');
var EIS = window.EIS || {};

(function ($, _, Modernizr, less, debug, d3) {
  'use strict';

// ----- START ICICLE CHART ---------------------------------------------------

EIS.icicle = {

  colors : [['#084594', '#2171b5', '#4292c6', '#6baed6', '#9ecae1', '#c6dbef', '#eff3ff'],
    ['#99000d', '#cb181d', '#ef3b2c', '#fb6a4a', '#fc9272', '#fcbba1', '#fee5d9'],
    ['#005a32', '#238b45', '#41ab5d', '#74c476', '#a1d99b', '#c7e9c0', '#edf8e9'],
    ['#8c2d04', '#d94801', '#f16913', '#fd8d3c', '#fdae6b', '#fdd0a2', '#feedde'],
    ['#4a1486', '#6a51a3', '#807dba', '#9e9ac8', '#bcbddc', '#dadaeb', '#f2f0f7'],
    ['#91003f', '#ce1256', '#e7298a', '#df65b0', '#c994c7', '#d4b9da', '#f1eef6']],

  topColor : '#969696',

  // Icicle Chart Builder
  Chart : function() {
    // Configurable Options
    var width = 1000;
    var height = 300;
    var padding = 100;
    var colors = EIS.icicle.colors;
    var topColor = EIS.icicle.topColor;
    var partitionFunction = function(d) { return d.value; };
    var sortFunction = function(a, b) {
      var compare = a.x - b.x;
      if (compare === 0) {
        compare = a.y - b.y;
      }

      return compare;
    };
    var data = {};
    var labels = ['', '', ''];
    var duration = 750;

    // Local Variables
    var el;
    var nextColor = 0;
    var x = d3.scale.linear().range([padding, width]);
    var dx = d3.scale.linear().range([0, width - padding]);
    var y = d3.scale.linear().range([0, height]);
    var partition = d3.layout.partition().value(partitionFunction);
    var svg;
    var rect;

    // Main Function
    function my(icicle) {
      el = icicle;
      svg = icicle.html('').append('svg').attr('viewBox', '0 0 ' + width + ' ' + height).attr(
        'preserveAspectRatio', 'xMidYMin').attr('width', '100%').attr('height', '100%');

      rect = svg.selectAll('rect').data(data.filter(function(d) {
        return d.value !== 0;
      })).enter().append('rect').classed({
        'clickable' : true
      }).attr('x', function(d) {
        return x(d.x);
      }).attr('y', function(d) {
        return y(d.y);
      }).attr('width', function(d) {
        return dx(d.dx);
      }).attr('height', function(d) {
        return y(d.dy);
      }).attr('fill', function(d, i) {
        if (d.value === 0) {
          d.color = 'transparent';
        } else if (d.depth === 0) {
          d.color = topColor;
        } else if (d.depth === 1) {
          d.colorIndex = nextColor;
          d.parentColorIndex = nextColor;
          d.parentNextColor = 1;
          d.color = colors[d.colorIndex][0];
          nextColor = (nextColor + 1) % colors.length;
        } else {
          var parentIndex = d.parent.parentColorIndex;
          d.colorIndex = d.parent.parentNextColor;
          d.parentColorIndex = parentIndex;
          d.color = colors[parentIndex][d.colorIndex];
          d.parent.parentNextColor = (d.colorIndex + 1) % colors[parentIndex].length;
        }

        return d.color;
      });

      if(!data[0].isZero) {
        rect.on('click', function(d) {
          $(icicle).trigger('click', d);
        });
      }

      var d = data[0];
      if (d.x === 0 && d.y === 0) {
        svg.append('text').attr('x', x(0.5)).attr('y', y(0.166) + 10).classed({
          'icicle-text' : true
        }).text(d.name);
      }

      svg.append('rect').classed({
        'labels' : true
      }).attr('x', 0).attr('y', 0).attr('width', padding).attr('height', height);
      svg.append('text').attr('x', 0).attr('y', y(0.166) + 10).classed({
        'icicle-labels' : true,
        'depth-0' : true
      }).text(labels[0]);
      if(!d.isZero) {
        svg.append('text').attr('x', 0).attr('y', y(0.5) + 10).classed({
          'icicle-labels' : true,
          'depth-1' : true
        }).text(labels[1]);
        svg.append('text').attr('x', 0).attr('y', y(0.833) + 10).classed({
          'icicle-labels' : true,
          'depth-2' : true
        }).text(labels[2]);
      }
    }

    // Other Functions
    my.update = function(d) {
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, 1]).range([d.y ? 20 : 0, height]);

      rect.transition().duration(duration)
      .attr('x', function(d1) {
        //var _x = x(d1.x);
        //_x =  _x > width ? width : _x < 0 ? -width : _x;
        var _x = Math.max(Math.min(x(d1.x), width), -width);
        return _x;
      }).attr('y', function(d) {
        return y(d.y);
      }).attr('width', function(d) {
        return Math.min(x(d.x + d.dx) - x(d.x), 2 * width);
      }).attr('height', function(d) {
        return y(d.y + d.dy) - y(d.y);
      });

      rect.each(
        function(d1) {
          var selected = d;
          var current = d1;
          var label = svg.select('.depth-' + current.depth);

          label.classed({
            'hide' : (current.depth < selected.depth - 1)
              || ((current.depth > selected.depth) && !selected.children)
          });

          var divisor = current.depth === selected.depth - 1 ? 1 : 2;
          label.transition().duration(duration).attr('y', y(d1.y + (d1.dy / divisor)));
        });

      var text = el.select('.icicle-text');
      text.text(d.name);
      if (d.depth === 0) {
        text.transition().duration(duration).attr('y', y(0.166) + 10);
      } else {
        text.transition().duration(duration).attr('y', y(d.y + 0.166) + 10);
      }
    };

    // Getters/Setters
    my.width = function(value) {
      if (!arguments.length) {
        return width;
      }
      width = value;
      return my;
    };

    my.height = function(value) {
      if (!arguments.length) {
        return height;
      }
      height = value;
      return my;
    };

    my.padding = function(value) {
      if (!arguments.length) {
        return padding;
      }
      padding = value;
      return my;
    };

    my.colors = function(value) {
      if (!arguments.length) {
        return colors;
      }
      colors = value;
      return my;
    };

    my.topColor = function(value) {
      if (!arguments.length) {
        return topColor;
      }
      topColor = value;
      return my;
    };

    my.partitionFunction = function(value) {
      if (!arguments.length) {
        return partitionFunction;
      }
      partitionFunction = value;
      return my;
    };

    my.sortFunction = function(value) {
      if (!arguments.length) {
        return sortFunction;
      }
      sortFunction = value;
      return my;
    };

    my.data = function(value) {
      if (!arguments.length) {
        return data;
      }
      data = partition(value).sort(sortFunction);
      return my;
    };

    my.labels = function(value) {
      if (!arguments.length) {
        return labels;
      }
      labels = value;
      return my;
    };

    my.duration = function(value) {
      if (!arguments.length) {
        return duration;
      }
      duration = value;
      return my;
    };

    return my;
  },

  // Icicle Legend Builder
  Legend : function() {
    // Configurable Options
    var colors = EIS.icicle.colors;
    var topColor = EIS.icicle.topColor;
    var data = {};

    // Local Variables
    var el;
    var legendItem;

    // Main Function
    function my(legend) {
      el = legend;
      legendItem = legend.html('').selectAll('li');
      legendItem = legendItem.data(data.filter(function(d) {
        return d.value !== 0;
      })).enter().append('li');

      legendItem.attr('class', function(d) {
        return 'depth-' + d.depth;
      }).append('span').classed({
        'swatch' : true
      }).style('background-color', function(d) {
        return d.color;
      });

      if(!data[0].isZero) {
        legendItem.on('click', function(d) {
          $(legend).trigger('click', d);
        });
      }

      legendItem.append('span').classed({
        'swatch-label' : true
      }).text(function(d) {
        return d.name;
      });
    }

    // Other Functions
    my.update = function(d) {
      legendItem.style('display', function(d1) {
        var shouldDisplay = d === d1;
        shouldDisplay = shouldDisplay || (d.parent && d.parent === d1);
        shouldDisplay = shouldDisplay || (d.parent && d.parent.parent && d.parent.parent === d1);
        shouldDisplay = shouldDisplay || (d1.parent && d1.parent === d);
        shouldDisplay = shouldDisplay || (d1.parent && d1.parent.parent && d1.parent.parent === d);

        return shouldDisplay ? 'block' : 'none';
      });
    };

    // Getters/Setters
    my.colors = function(value) {
      if (!arguments.length) {
        return colors;
      }
      colors = value;
      return my;
    };

    my.topColor = function(value) {
      if (!arguments.length) {
        return topColor;
      }
      topColor = value;
      return my;
    };

    my.data = function(value) {
      if (!arguments.length) {
        return data;
      }
      data = value;
      return my;
    };

    return my;
  },

  // Icicle Table Builder
  Tables : function() {
    // Configurable Variables
    var colors = EIS.icicle.colors;
    var topColor = EIS.icicle.topColor;
    var data = {};
    var table1Labels = [];
    var table2Labels = [];
    var table3Labels = [];

    // Local Variables
    var el;
    var table1;
    var table2;
    var table3;
    var table2Wrap;
    var table3Wrap;

    // Main Function
    function my(tables) {
      el = tables;
      table1 = tables.select('#table-1').html('').classed({'depth-0': true});
      table2 = tables.select('#table-2').html('');
      table3 = tables.select('#table-3');
      table2Wrap = tables.select('#table-2-wrap');
      table3Wrap = tables.select('#table-3-wrap');
      var body, row, thead;
      var root = data[0];
      var caption = table1.append('caption');
      caption.append('span')
        .classed({'swatch': true})
        .style('background', root.color);
      caption.append('span')
        .classed({'text': true})
        .text(root.name);
      thead = table1.append('thead');
      _.each(table1Labels[root.depth], function(label) {
        thead.append('th').text(label);
      });
      row = table1.append('tbody').append('tr');
      _.each(root.table1Columns, function(i) {
        row.append('td').text(i);
      });

      thead = table2.append('thead');
      thead.append('th').text(' ');
      _.each(table2Labels[root.depth], function(label) {
        thead.append('th').text(label);
      });
      body = table2.append('tbody');

      if(root.isZero) {
        row = body.append('tr');
        row.append('td').text('');
        _.each(root.table2Columns, function(i) {
          row.append('td').text(i);
        });

      } else {
        _.each(root.children, function(d) {
          row = body.append('tr');
          row.append('td').append('span').classed({
            'swatch' : true
          }).style('background', d.color);
          _.each(d.table2Columns, function(i) {
            row.append('td').text(i);
          });
          if (d.value !== 0) {
            row.classed({
              'clickable' : true
            });
            row.on('click', function() {
              $(el).trigger('click', d);
            });
          }
        });
      }

      table3.append('thead');
      table3.append('tbody');
      table3Wrap.classed({ 'hide' : true });
      tables.classed({ 'hide' : false });
    }

    // Other Functions
    my.update = function(d) {
      var body, row, thead;
      var caption = table1.select('caption');
      caption.on('click', function() {
        $(el).trigger('click', d.parent ? d.parent : d);
      });
      caption.select('.swatch').style('background', d.color);
      caption.select('.text').text(d.name);

      table1.classed({
        'depth-0': false,
        'depth-1': false,
        'depth-2': false
      });

      table1.attr('class', function() {
        return 'table depth-' + d.depth;
      });

      thead = table1.select('thead').html('');
      _.each(table1Labels[d.depth], function(label) {
        thead.append('th').text(label);
      });
      row = table1.select('tbody tr');
      row.html('');
      _.each(d.table1Columns, function(i) {
        row.append('td').text(i);
      })

      if (d.children && d.children.length) {
        body = table2.select('tbody').html('');
        thead = table2.select('thead').html('');
        thead.append('th').text(' ');
        _.each(table2Labels[d.depth], function(label) {
          thead.append('th').text(label);
        });
        _.each(d.children, function(d1) {
          if (d1.value === 0)
            {
            return;
            }
          row = body.append('tr');
          row.append('td').append('span').classed({
            'swatch' : true
          }).style('background', d1.color);
          _.each(d1.table2Columns, function(i) {
            row.append('td').text(i);
          });

          if (d1.value !== 0) {
            row.classed({
              'clickable' : true
            });
            row.on('click', function() {
              $(el).trigger('click', d1);
            });
          }
        });

        table2Wrap.classed({ 'hide' : false });
      } else {
        table2Wrap.classed({ 'hide' : true });
      }

      if (d.tabledata && d.tabledata.length) {
        body = table3.select('tbody').html('');
        thead = table3.select('thead').html('');
        _.each(table3Labels[d.depth], function(label) {
          thead.append('th').text(label);
        });
        _.each(d.tabledata, function(d1) {
          row = body.append('tr');
          _.each(d1.table3Columns, function(i) {
            row.append('td').text(i);
          });
        });

        table3Wrap.classed({ 'hide' : false });
      } else {
        table3Wrap.classed({ 'hide' : true });
      }
    };

    // Getters/Setters
    my.colors = function(value) {
      if (!arguments.length) {
        return colors;
      }
      colors = value;
      return my;
    };

    my.topColor = function(value) {
      if (!arguments.length) {
        return topColor;
      }
      topColor = value;
      return my;
    };

    my.data = function(value) {
      if (!arguments.length) {
        return data;
      }
      data = value;
      return my;
    };

    my.table1Labels = function(value) {
      if (!arguments.length) {
        return table1Labels;
      }
      table1Labels = value;
      return my;
    };

    my.table2Labels = function(value) {
      if (!arguments.length) {
        return table2Labels;
      }
      table2Labels = value;
      return my;
    };

    my.table3Labels = function(value) {
      if (!arguments.length) {
        return table3Labels;
      }
      table3Labels = value;
      return my;
    };

    return my;
  }
};


// Account Summary Page Builder
EIS.AccountSummaryBuilder = function() {
  // Configurable Options
  var colors = EIS.icicle.colors;
  var topColor = EIS.icicle.topColor;
  var formatPercent = d3.format('.1%');
  var formatDollar = d3.format('$,.2f');
  var formatDecimal = d3.format(',');
  var icicleLabels = [];
  var table1Labels = [];
  var table2Labels = [];
  var table3Labels = [];

  // Local Variables
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
    tableEl = d3.select('#icicle-tables');

    icicle = EIS.icicle.Chart()
      .data(data)
      .colors(colors)
      .topColor(topColor)
      .labels(icicleLabels);
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
    .topColor(topColor)
    .table1Labels(table1Labels)
    .table2Labels(table2Labels)
    .table3Labels(table3Labels);
    tableEl.call(table);
    $(tableEl).click(update);
  }

  // Other Functions
  function update(e, d) {
    icicle.update(d);
    legend.update(d);
    table.update(d);
  }

  my.byFundConverter = function(name, obj) {
    var data = {
      'name': name,
      'type': 'plan',
      'value': obj.grandTotalValue ? obj.grandTotalValue : 1,
      'isZero': !obj.grandTotalValue,
      'table1Columns': [
        formatDollar(obj.grandTotalValue),
        formatDollar(obj.grandTotalVested)
      ],
      'children': []
    };

    if(data.isZero) {
      data.table2Columns = [
        '',
        formatDollar(0),
        formatDecimal(0),
        '',
        formatDollar(0)
      ];
    } else {
      _.each(obj.statementFunds, function(fund) {
        var child = {
          'name': fund.description,
          'type': 'fund',
          'value': fund.balance,
          'table1Columns': [
            formatDollar(fund.balance),
            formatDollar(fund.vestedValue),
            formatDollar(fund.price),
            formatDecimal(fund.shares),
            formatPercent(fund.electionPercent / 100.0)
          ],
          'table2Columns': [
            fund.description,
            formatDollar(fund.price),
            formatDecimal(fund.shares),
            formatPercent(fund.electionPercent / 100.0),
            formatDollar(fund.balance)
          ],
          'children': [],
          'tabledata': []
        };

        _.each(fund.fundSources, function(source) {
          var grandChild = {
            'name': source.description,
            'type': 'source',
            'value': source.value,
            'table1Columns': [
              formatDollar(source.price),
              formatDecimal(source.shares),
              formatDollar(source.value)
            ],
            'table2Columns': [
              source.description,
              formatDollar(source.price),
              formatDecimal(source.shares),
              formatDollar(source.value)
            ]
          };
          child.children.push(grandChild);
        });

        _.each(fund.ipmFundMap, function(ipm) {
          var ipmGrandChild = {
            'name': ipm.description,
            'type': 'ipm-fund',
            'table3Columns': [
              ipm.description,
              ipm.percentage,
              ipm.shares,
              formatDollar(ipm.balance)
            ]
          };
          child.tabledata.push(ipmGrandChild);
        });

        data.children.push(child);
      });
    }

    return data;
  };

  my.bySourceConverter = function(name, obj) {
    var data = {
      'name': name,
      'type': 'plan',
      'value': obj.grandTotalValue ? obj.grandTotalValue : 1,
      'isZero': !obj.grandTotalValue,
      'table1Columns': [
        formatDollar(obj.grandTotalValue),
        formatDollar(obj.grandTotalVested)
      ],
      'children': []
    };

    if(data.isZero) {
      data.table2Columns = [
        '',
        '',
        formatDollar(0),
        formatDollar(0)
      ];
    } else {
      _.each(obj.planInfo.sources, function(source) {
        var child = {
          'name': source.description,
          'type': 'source',
          'value': source.subTotalValue,
          'table1Columns': [
            formatDollar(source.subTotalValue),
            formatDollar(source.subTotalVested)
          ],
          'table2Columns': [
            source.description,
            formatPercent(source.subTotalValue ? source.subTotalVested / source.subTotalValue : 0),
            formatDollar(source.subTotalVested),
            formatDollar(source.subTotalValue)
          ],
          'children': []
        };

        _.each(source.funds, function(fund) {
          var grandChild = {
            'name': fund.description,
            'type': 'fund',
            'value': fund.balance,
            'table1Columns': [
              formatDollar(fund.price),
              formatDecimal(fund.shares),
              formatPercent(fund.electionPercent / 100.0),
              formatDollar(fund.balance)
            ],
            'table2Columns': [
              fund.description,
              formatDollar(fund.price),
              formatDecimal(fund.shares),
              formatPercent(fund.electionPercent / 100.0),
              formatDollar(fund.balance)
            ],
            'tabledata': []
          };

          _.each(fund.mapIPMFund, function(ipm) {
            var greatGrandChild = {
              'name': ipm.description,
              'type': 'ipm-fund',
              'table3Columns': [
                ipm.description,
                ipm.percentage,
                ipm.shares,
                formatDollar(ipm.balance)
              ]
            };
            grandChild.tabledata.push(greatGrandChild);
          });

          child.children.push(grandChild);
        });

        data.children.push(child);
      });
    }

    return data;
  };

  // Getters/Setters
  my.colors = function(value) {
    if (!arguments.length) {
      return colors;
    }
    colors = value;
    return my;
  };

  my.topColor = function(value) {
    if (!arguments.length) {
      return topColor;
    }
    topColor = value;
    return my;
  };

  my.formatPercent = function(value) {
    if (!arguments.length) {
      return formatPercent;
    }
    formatPercent = value;
    return my;
  };

  my.formatDollar = function(value) {
    if (!arguments.length) {
      return formatDollar;
    }
    formatDollar = value;
    return my;
  };

  my.formatDecimal = function(value) {
    if (!arguments.length) {
      return formatDecimal;
    }
    formatDecimal = value;
    return my;
  };

  my.icicleLabels = function(value) {
    if (!arguments.length) {
      return icicleLabels;
    }
    icicleLabels = value;
    return my;
  };

  my.table1Labels = function(value) {
    if (!arguments.length) {
      return table1Labels;
    }
    table1Labels = value;
    return my;
  };

  my.table2Labels = function(value) {
    if (!arguments.length) {
      return table2Labels;
    }
    table2Labels = value;
    return my;
  };

  my.table3Labels = function(value) {
    if (!arguments.length) {
      return table3Labels;
    }
    table3Labels = value;
    return my;
  };

  return my;
};

// ----- END ICICLE CHART -----------------------------------------------------

// ----- CODE FOR DEMO ONLY BELOW ---------------------------------------------

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

  function getFundData() {
    var promise;
    promise = $.getJSON('demo/byfund.response.json');
    return promise;
  }

  function getSourceData() {
    var promise;
    promise = $.getJSON('demo/bysource.response.json');
    return promise;
  }

  function switchToFunds() {
    getFundData().done(function(response) {
      var builder = EIS.AccountSummaryBuilder()
						.icicleLabels([
							"Plan",
							"Funds",
							"Sources"
						])
						.table1Labels([
							[
								"Total Balance",
								"Vested Balance"
							],
							[
								"Subtotal Value",
								"Subtotal Vested Balance",
								"Price",
								"Shares",
								"Current Election %"
							],
							[
								"Price",
								"Shares",
								"Total Balance"
							]
						])
						.table2Labels([
							[
								"Funds",
								"Price",
								"Shares",
								"Current Election %",
								"Total Balance"
							],
							[
								"Sources",
								"Price",
								"Shares",
								"Total Balance"
							]
						]).
						table3Labels([
							[],
							[
								"Funds",
								"Election Percent",
								"Shares",
								"Total Balance"
							],
							[]
						]);
      var parsedData = builder.byFundConverter('Sample 401(k) Plan', response);
      builder(parsedData);
    });
  }

  function switchToSources() {
    getSourceData().done(function(response) {
      var builder = EIS.AccountSummaryBuilder()
						.icicleLabels([
							"Plan",
							"Sources",
							"Funds"
						])
						.table1Labels([
							[
								"Total Balance",
								"Vested Balance"
							],
							[
								"Subtotal Value",
								"Subtotal Vested Balance"
							],
							[
								"Price",
								"Shares",
                "Current Election %",
								"Total Balance"
							]
						])
						.table2Labels([
							[
								"Sources",
								"Vested %",
								"Vested Balance",
								"Total Balance"
							],
							[
								"Funds",
								"Price",
								"Shares",
                "Current Election %",
								"Total Balance"
							]
						]).
						table3Labels([
							[],
							[
								"Funds",
								"Election Percent",
								"Shares",
								"Total Balance"
							],
							[]
						]);
      var parsedData = builder.bySourceConverter('Sample 401(k) Plan', response);
      builder(parsedData);
    });
  }

  $(function() {

    /*---------- Shim to treat CSS panel as Less ----------*/
    $('head style[type="text/css"]').attr('type', 'text/less');
    less.refreshStyles();
    /*---------- End Shim ----------*/

    switchToFunds();

    $('#toggle').change(function() {
      var $this = $(this);
      if($this.val() === 'View by Fund') {
        switchToFunds();
      } else if($this.val() === 'View by Source') {
        switchToSources();
      }
    });

    debug.timeEnd('Start Up');
  });

})(jQuery, _, Modernizr, less, debug, d3);
