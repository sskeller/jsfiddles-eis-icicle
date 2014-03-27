(function ($, _, Modernizr, less, debug) {
  "use strict";

  var EIS = {};

  _.extend(EIS, {
  });

  $(function() {
    debug.time("Start Up");

    /*---------- Shim to treat CSS panel as Less ----------*/
    $('head style[type="text/css"]').attr('type', 'text/less');
    less.refreshStyles();
    /*---------- End Shim ----------*/

    debug.timeEnd("Start Up");
  });

})(jQuery, _, Modernizr, less, debug);
