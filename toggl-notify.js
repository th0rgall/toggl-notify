var Rx = require('rxjs/Rx');
var $ = require("jquery");

// TODO: re-insert controls after change to manual and back

// global var
// the timer duration in seconds after which a notification should pop up
var timerSecs = 0;

// duration in the form "hh:mm:ss" to seconds
// alternate forms allowed: hh:mm, mm
// with an arbitrary amount of zeroes before a pair of digits
// TODO: might need better input validation
function durToSec(hhmmss) {
  var tokens = hhmmss.split(":");
  // parse functions
  var pHour = (hour) => +(hour) * 3600;
  var pMin = (min) => +(min) * 60;
  var pSec = (sec) => +(sec);
  // convert tokens to time
  if (tokens.length > 0) {
    if (tokens.length == 1) {
      return pMin(tokens[0]);
    }
    else if (tokens.length >= 2) {
      return pHour(tokens[0]) + pMin(tokens[1]) + (tokens.length == 3 ? pSec(tokens[2]) : 0);
    }
  }
}

// creates the HTML controls element
// f is a function that will be passed the <input> tag so an event handler can be bound
function createControls(f) {

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
  // add event listener
  f(inputCtrl);
  controlContainer.append(inputCtrl);

  return controlContainer;
}

// returns an observable for expected time amounts00
function createInputChange(inputElem) {
  return Rx.Observable.fromEvent(inputElem, "change")
    // filter for convertable formats looking somewhat like hh:mm:ss or hh:mm or mm
    .filter((event) => event.target.value.match(/^\s*(0*[1-9]{0,2}:){0,2}(0*[1-9]{0,2})?\s*$/g))
    // map to seconds
    .map((event) => durToSec(event.target.value))
    // realistic time bounds
    .filter((sec) => sec > 0 && sec < 259200);
}

// checks new time values (every second) and triggers a notification to the background page if necessary
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
    .append(createControls(createInputChange));

  // log time
  var timer_duration = $(".Timer__duration");
  if (timer_duration.length > 0) {

    var timeObs = Rx.Observable.fromEvent(timer_duration[0], "DOMNodeRemoved")
      // two text nodes get removed and added again every second
      // so bundle these
      .bufferCount(2,2)
      // every second counted by Toggl, get the new value
      .map(() => {
          var timerWrapper = $(".Timer__duration .time-format-utils__duration");
          if (timerWrapper) {
            return durToSec(timerWrapper[0].innerText);
          }
          else { throw "Can't parse time from Toggl" }
        }
      );

    timeObs.subscribe((time) => console.log(time));
  }
}


$(document).ready(
  function() {
    setTimeout(getData, 3500);
  }
);
