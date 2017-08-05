var Rx = require('rxjs/Rx');
var $ = require("jquery");

// TODO: re-insert controls after change to manual and back

// duration in the form "hh:mm:ss" to seconds
// alternate forms allowed: hh:mm, mm
// with an arbitrary amount of zeroes before a pair of digits
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

// returns an observable event stream for the duration inserted
// storeF is a function that gets passed the produced even stream
function createInputStream(storeF, inputElem) {
  var eventStream = Rx.Observable.fromEvent(inputElem, "change")
    // filter for convertable formats looking somewhat like hh:mm:ss or hh:mm or mm
    .filter((event) => event.target.value.match(/^\s*(0*[0-9]{0,2}:){0,2}(0*[0-9]{0,2})?\s*$/g))
    // map to seconds
    .map((event) => durToSec(event.target.value))
    // realistic time bounds
    .filter((sec) => sec > 0 && sec < 259200);

    eventStream.subscribe((input) => console.log("input " + input))

    // store the stream somewhere
    storeF(eventStream);
    return eventStream;
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

  var inputStream = null;

  // insert controls & initialize inputStream
  $(".Timer__timer .DateTimeDurationPopdown__popdown > div")
    .append(createControls(createInputStream.bind(null, (stream) => inputStream = stream)));

  // log time
  var timer_duration = $(".Timer__duration");
  if (timer_duration.length > 0) {

    // creates a stream of Toggl timer ticks from the dom

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
          else { throw "Can't parse Toggl timer from the DOM" }
        }
      );

    var notifyObs = timeObs.combineLatest(inputStream)
      .filter((inputs) => {
        console.log("lala?", inputs);
        return (inputs[0] > inputs[1]);
      });

    timeObs.subscribe((time) => console.log(time));
    notifyObs.subscribe((time) => console.log("staph it!"));
  }
}


$(document).ready(
  function() {
    setTimeout(getData, 3500);
  }
);
