
$(document).ready(
  function() {

    setTimeout(getData, 3500);

    function getData() {
      var timer_duration = $(".Timer__duration");
      if (timer_duration.length > 0) {
        timer_duration[0].addEventListener("DOMNodeRemoved", function(event) {
          console.log("helala" + event.target);}
        );
      }
    }

  }
)
