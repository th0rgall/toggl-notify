
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request && request.type) {
      switch (request.type) {
        case "notify":
          //timerNotification(); TODO: shouldn't be necessary anymore
          sendResponse({message: "Bacgkround notified"});
          break;
        case "startTimer": // params: {currentTime: ..., timerGoal: ... }
          startTogglTimer(request.params.currentTime, request.params.timerGoal);
          sendResponse({message: "Background started timer: " + JSON.stringify(request.params)});
          break;
        case "getTimer":
          // STUB TODO: needed to initialize when tab was closed
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

// TODO: stub

currentTimer = null;

// params: {currentTime: int (in sec), timerGoal: int (in sec)}
function startTogglTimer(currentTime, timerGoal) {
  if (timerGoal > currentTime) {
    startAlarm(timerGoal - currentTime);
  }
}

function startAlarm(sec) {
  stopAlarm();
  currentTimer = setTimeout(timerNotification, sec * 1000);
}

function stopAlarm() {
  if ( currentTimer ) {
    clearTimeout(currentTimer);
  }
}
