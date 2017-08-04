var Rx = require('rxjs/Rx');
var $ = require("jquery");


// global var
// the timer duration in seconds after which a notification should pop up
var timerSecs = 0;

// duration in the form "hh:mm:ss" to seconds
// TODO: might need better input validation
function durToSec(hhmmss) {
  var tokens = hhmmss.split(":");
  return +( (+tokens[0]) * 3600 + (+tokens[1]) * 60 + (+tokens[2]) );
}

// creates the HTML controls element
function createControls() {

  var controlContainer = $("<div>", {
    class: "DateTimeDurationPopdown__header",
    id: "notify-controls"
  });

  // inseart header text
  controlContainer.append('<span class="DateTimeDurationPopdown__timeLabel"><span>Notify me after</span></span>');

  // insert input
  var inputCtrl = $("<input>", {
    type: "text",
    class: "DateTimeDurationPopdown__duration",
    value: "0:00:00",
    style: "padding: 0.3em 0 0.5em 0;"
  });
  // add event listener to change
  inputCtrl.change(function(event) {
        timerSecs = durToSec(event.target.value);
      });
  controlContainer.append(inputCtrl);

  return controlContainer;
}

function checkNotify(currentSecs) {
  if (timerSecs > 0 && currentSecs > timerSecs) {
    console.log("STAPH IT!!!");
  }
}

// main injection function
function getData() {

  // $(".Timer__duration .time-format-utils__duration")[0].innerText

  // insert controls
  $(".Timer__timer .DateTimeDurationPopdown__popdown > div")
    .append(createControls());

  // log time
  var timer_duration = $(".Timer__duration");
  if (timer_duration.length > 0) {

    var timeObs = Rx.Observable.fromEvent(timer_duration[0], "DOMNodeRemoved")
      .bufferCount(2,2);

    timeObs.subscribe(() => console.log("helalaaaa!"));

    timeObs.subscribe(() => {
      var newDuration = $(".Timer__duration .time-format-utils__duration")[0].innerText;
      checkNotify(durToSec(newDuration));
    })
  }
}


$(document).ready(
  function() {
    setTimeout(getData, 3500);
  }
);
