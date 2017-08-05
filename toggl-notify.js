/*

*/


var Rx = require('rxjs/Rx');
var $ = require("jquery");

// TODO: re-insert controls after change to manual and back

/**
@param hhmmss duration in the form "hh:mm:ss" to seconds
              alternate forms allowed: "hh:mm", "mm"
              with an arbitrary amount of zeroes before a pair of digits
@return the amount of seconds that the input duration specifies
*/
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

/**creates the HTML controls element
@param f a function that will be passed the <input> tag so an event handler can be bound
@param tval is the default input (time) value when creating the control
@return a HTML Element representation of the controls
*/
function createControls(f, tval) {

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
    value: tval,
    style: "padding: 0.3em 0 0.5em 0;"
  });
  // add event listener
  f(inputCtrl);
  controlContainer.append(inputCtrl);

  return controlContainer;
}

/**
  @param storeF a function that gets passed the produced even stream
  @param inputElem the HTML element which changes when a new timer is set
  @return an observable event stream input with timer input changes
*/
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

/**
  Triggers a notification to the background page.
*/
function sendNotification() {
  chrome.extension.sendRequest({msg: "Sup?"}, function(response) {
      console.log(response.returnMsg);
  });
};

/**
  @return the current Toggl timer duration text in the form "hh:mm:ss"
  @throws an error when it couldn't be parsed
*/
function getDOMDuration() {
  var timerWrapper = $(".Timer__duration .time-format-utils__duration");
  if (timerWrapper) {
    return timerWrapper[0].innerText;
  }
  else { throw "Can't parse Toggl timer from the DOM" }
}

/**
  main injection function
  */
function getData() {

  var inputStream = null;

  // insert controls & initialize inputStream
  $(".Timer__timer .DateTimeDurationPopdown__popdown > div")
    .append(createControls(createInputStream.bind(null, (stream) => inputStream = stream), getDOMDuration()));

  // log time
  var timer_duration = $(".Timer__duration");
  if (timer_duration.length > 0) {

    // creates a stream of Toggl timer ticks from the DOM
    var timeObs = Rx.Observable.fromEvent(timer_duration[0], "DOMNodeRemoved")
      // two text nodes get removed and added again every second
      // so bundle these
      .bufferCount(2,2)
      // every second counted by Toggl, get the new value
      .map(() => durToSec(getDOMDuration()));

    // creates a stream of events where notifications should be sent
    var notifyObs = timeObs
      // combine latest time tick with latest input
      .combineLatest(inputStream)
      // check whether the timer has exceeded the input
      .filter((inputs) => {
        // 0 has the timer, 1 the input strea
        return (inputs[0] > inputs[1]);
      })
      // bundle every two successive events, starting with 0
      .startWith(0)
      .bufferCount(2,1)
      // now compare to the previous event
      // only notify when a different input was given
      .filter( (arr) => arr[0][1] != arr[1][1]);


    notifyObs.subscribe((time) => {
      sendNotification();
    });
  }
}

$(document).ready(
  function() {
    // TODO: timeout needed to let the page load
    // find a safer way to do this
    setTimeout(getData, 3500);
  }
);
