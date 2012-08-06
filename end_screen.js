// The endScreen landing page that the user
// comes to when the are done coloring all the images!
End = {
  init: function() {    
    // Add all the click handlers.
    $("#endScreen #replay-button").click(jQuery.proxy(this.replayTheGame, this));
    $("#endScreen .list-button").click(jQuery.proxy(ListView.showImageLibrary, ListView));    
  
    if (Debug.showEndScreen) {
      $("#endScreen").show(); 
      $("#startScreen").hide(); 
  	  $("#listScreen").hide();
  	  $("#transitionScreen").hide();
      $("#drawingScreen").hide();
      $("#videoScreen").hide();
    }
  },
  
  replayTheGame: function() {
    // Reset user preferences and take the user to
    // the start screen.
    UserPrefs.resetUserPrefs();
    $("#endScreen").hide(); 
    $("#startScreen").show(); 
  }
};