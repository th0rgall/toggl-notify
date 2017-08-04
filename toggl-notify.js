var Rx = require('rxjs/Rx');
var $ = require("jquery");

$(document).ready(
  function() {

    setTimeout(getData, 3500);

    function createControls() {
      return $('<div>', {
        class: "DateTimeDurationPopdown__header",
        id: "notify-controls"
      });
    }

    function getData() {

      // insert controls
      $(".Timer__timer .DateTimeDurationPopdown__popdown > div")
        .append(createControls());

      // log time
      var timer_duration = $(".Timer__duration");
      if (timer_duration.length > 0) {

        var timeObs = Rx.Observable.fromEvent(timer_duration[0], "DOMNodeRemoved")
          .bufferCount(2,2);

        timeObs.subscribe(() => console.log("helalaaaa!"));
      }
    }

  }
);
