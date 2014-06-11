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

    debug.timeEnd("Start Up");
  });

})(jQuery, _, Modernizr, less, debug);
