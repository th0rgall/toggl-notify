
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    chrome.notifications.create("id", {
      type: "basic",
      title: "Time's up!",
      message: "The timer you set went off... try to stop now.",
      iconUrl: "images/logo.png"
    });

    setTimeout(function(){ chrome.notifications.clear("id"); }, 7000);
    sendResponse({returnMsg: "All good!"}); // optional response
});
