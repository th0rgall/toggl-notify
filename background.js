
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request && request.type) {
      switch (request.type) {
        case "notify":
          //timerNotification(); TODO: shouldn't be necessary anymore
          sendResponse({message: "Background notified"});
          break;
        case "startTimer": // params: {currentTime: ..., timerGoal: ... }
          startTimer(request.params.currentTime, request.params.timerGoal);
          sendResponse({message: "Background started timer: " + JSON.stringify(request.params)});
          console.log("Started timer: " + getTimer());
          break;
        case "getTimer":
          console.log("getTimer: " + JSON.stringify(getTimer()));
          sendResponse(getTimer());
          break;
        default:
          sendResponse({message: "Can't handle request."}); // optional response
      }
    }
    sendResponse({message: "Can't handle request."}); // optional response
});

function timerNotification() {
  chrome.notifications.create("id", {
    type: "basic",
    title: "Time's up!",
    message: "The timer you set went off... try to stop now.",
    iconUrl: "images/logo.png"
  });

  setTimeout(function(){ chrome.notifications.clear("id"); }, 7000);
}

// Timer: {alarm: , timeStarted: }

var currentTimer = null;


// params: {currentTime: int (in sec), timerGoal: int (in sec)}
function startTimer(currentTime, timerGoal) {
  clearTimer();
  currentTimer = {timerGoal: timerGoal, durationStarted: currentTime, timeStarted: Date.now()};
  if (timerGoal > currentTime) {
    startAlarm(timerGoal - currentTime);
  }
}

function clearTimer() {
  currentTimer = null;
}

/**
  @return null if there is no active timer
  @return {timerGoal: int, runningTime: int, durationStarted: int} if there is an active timer,
*/
function getTimer() {
  if (currentTimer) {
    var runningTime = (Date.now() - currentTimer.timeStarted) / 1000;
    return {timerGoal: currentTimer.timerGoal,
      runningTime: runningTime,
      durationStarted: currentTimer.durationStarted};
  }
  else {
    return null;
  }
}

var currentAlarm = null;

function startAlarm(sec) {
  var alarmId = setTimeout(() => {
    timerNotification();
    stopAlarm();
  }, sec * 1000);
}

function stopAlarm() {
  if ( currentAlarm ) {
    clearTimeout(currentAlarm);
    currentAlarm = null;
  }
  clearTimer();
}
