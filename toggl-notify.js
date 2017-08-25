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

  if (!hhmmss) return(0);

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

function pad(s) {
  if (("" + s).length == 1) {
    return "0" + s;
  }
  else {
    return s;
  }
}

function secToDur(s) {
  if (!s) return("00:00:00");

  h = Math.floor(s/3600);
  s -= h * 3600;
  m = Math.floor(s/60);
  s -= m * 60;

  return `${pad(h)}:${pad(m)}:${pad(s)}`;

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
    id: "timer-input",
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
  @return an observable event stream with timer input changes (in seconds)
*/
function createInputStream(storeF, inputElem) {
  var eventStream = Rx.Observable.fromEvent(inputElem, "change")
    // filter for convertable formats looking somewhat like hh:mm:ss or hh:mm or mm
    .filter((event) => event.target.value.match(/^\s*(0*[0-9]{0,2}:){0,2}(0*[0-9]{0,2})?\s*$/g))
    // map to seconds
    .map((event) => durToSec(event.target.value))
    // realistic time bounds
    .filter((sec) => sec > 0 && sec < 259200);

    eventStream.subscribe((input) => console.log("input " + input));

    // store the stream somewhere
    storeF(eventStream);
    return eventStream;
}

/**
  Triggers a notification to the background page.
*/
function sendNotification() {
  chrome.extension.sendRequest({type: "notify"}, function(response) {
    if (response && response.message) console.log(response.message);
  });
};

function sendNewTimer(currentTime, timerGoal) {
  chrome.extension.sendRequest({type: "startTimer", params: {currentTime: currentTime, timerGoal: timerGoal}}, function(response) {
      if (response && response.message) console.log(response.message);
  });
}

/**
  Gets the current timer goal from the background
  returns null if there is none
  calls back with timerGoal in seconds
*/
function getTimerGoal(callback) {
  chrome.extension.sendRequest({type: "getTimer"}, function(response) {
      if (response && response.timerGoal) {
        callback(response.timerGoal);
      }
      else {
        callback(response);
      }
  });
}

function getInitialTimerGoal(callback) {
    getTimerGoal((goal) => {
      if (goal) {
        callback(secToDur(goal));
      }
      else {
        callback(getDuration());
      }
    });
}

/**
  Abstracts a pattern to handle individual elements retrieved with jQuery
  @param query jquery sring
  @param action function to execute jquery result, if existing
  @return the result of the action
*/
function queryAction(query, action) {
  var queryObject = $(query);
  if (queryObject && queryObject.length > 0) {
      return action(queryObject);
  }
  else {
    console.log("Query: '" + query + "' did not give a parseable result.");
  }
}

/**
  @return the current Toggl timer DOM duration text in the form "hh:mm:ss"
  @throws an error when it couldn't be parsed
*/
function getDuration() {
  return queryAction(".Timer__duration .time-format-utils__duration", function(timerWrapper) {
    return timerWrapper[0].innerText;
  });
}

/**
  (re)initialze the controls (remove & create them)
  calls back the generated inputStream
*/
function initializeControls(callback) {
  // init controls if needed
  if ($("#notify-controls").length == 0) {
    console.log("will check reinit");
    // insert controls & initialize inputStream
    // query checks for right page
    queryAction(".Timer__timer .DateTimeDurationPopdown__popdown > div", function(timerDuration) {
      console.log("doing reinit");
      getInitialTimerGoal((goal) =>
        timerDuration.append(
          createControls(createInputStream.bind(null, (stream) => callback(stream)), goal) ) );
    });
  }
}

/**
  main injection function
  */
function initialize() {

  var inputStream = null;

  initializeControls((stream) => {
    inputStream = stream;

    // log time
    // query to guard for getDuration()
    queryAction(".Timer__duration", function(timer_duration) {
      inputStream
      .map((sec) => [sec, durToSec(getDuration())])
      .filter((arr) => arr[0] > arr[1]) //
      .subscribe((arr) => sendNewTimer(arr[1], arr[0]));
    });
  });

  /* Set an interval to check when to (re)initialize the controls
     Disable periodical checking when the tab is hidden */
  var refreshId = null;

  function resetInterval() {
    if (refreshId) { clearInterval(refreshId);} // to be sure
    console.log("Visibility change:" + document.visibilityState);
    if (document.visibilityState == "visible") {
      refreshId = setInterval(initializeControls.bind(null, (stream) => inputStream = stream), 2500);
    }
  }

  resetInterval(); // first run
  document.addEventListener('visibilitychange', resetInterval);


}

$(document).ready(
  function() {
    // TODO: timeout needed to let the page load
    // find a safer way to do this
    setTimeout(initialize, 3500);
  }
);
