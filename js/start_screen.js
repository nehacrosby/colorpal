// The startScreen landing page that the user
// comes to when they first visit the app.
Start = {
  init: function() {    
    // Add all the click handlers.
    $("#startScreen #start-button").click(jQuery.proxy(ListView.showImageLibrary, ListView));
  
    if (Debug.showStartScreen) {
      $("#startScreen").show(); 
  	  $("#listScreen").hide();
  	  $("#transitionScreen").hide();
      $("#drawingScreen").hide();
      $("#videoScreen").hide();
    }
  },
};

$(document).ready(function() {
  // The app only works for webkit browsers.
  var ua = $.browser;
  if (!ua.webkit) {
    $('#page').hide();
  }
  
  // The order of init methods matters.
  Debug.init();
  ListView.init();
  Start.init();
  UserPrefs.init();
  App.init();
  DrawingPreview.init();
  Video.init();
  Transition.init();
  End.init();

	// Set up drag n drop handlers.
	App.initDragAndDrop();
});