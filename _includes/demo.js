debug.time("Start Up");
var EIS = window.EIS || {};

(function ($, _, Modernizr, less, debug) {
  "use strict";

  _.extend(EIS, {
  });

  var width = 945;
  var height = 300;
  var x = d3.scale.linear().range([0, width]);
  var y = d3.scale.linear().range([0, height]);
  var color = d3.scale.category20c();
  var partition = d3.layout.partition();

  var svg = d3.select("#icicle").append("svg")
    .attr("width", width)
    .attr("height", height);

  var rect = svg.selectAll("rect");
  var isJsFiddle = /jsfiddle[.]jshell[.]net$/.test(location.host);
  var jsonURL = isJsFiddle ? "http://sskeller.github.io/jsfiddles-eis-icicle/json/icicle.json" : "json/icicle.json";

  alert(jsonURL);

  $(function() {

    /*---------- Shim to treat CSS panel as Less ----------*/
    $('head style[type="text/css"]').attr('type', 'text/less');
    less.refreshStyles();
    /*---------- End Shim ----------*/

    debug.timeEnd("Start Up");
  });

})(jQuery, _, Modernizr, less, debug);
