// This library contains the handling of playing a video
// tutorial.
Video = {
  init: function() {    
    // Add all the click handlers.
    $("#videoScreen .next-button").click(jQuery.proxy(Transition.showNextImage, Transition));
    $("#videoScreen .list-button").click(jQuery.proxy(ListView.showImageLibrary, ListView));
    
    if (Debug.showVideoScreen) {
  	  $("#listScreen").hide();
      $("#drawingScreen").hide();
      this.playTutorial("tutorials/capture_trial.m4v");
    }
  },
  
  onVideoClick: function(event) {
    this.playTutorial($(event.currentTarget).attr('filename'));  
  },
  
  playTutorial: function(filename) {
    $("#listScreen").hide();
    $("#transitionScreen").hide();
    $("#drawingScreen").hide();
    $("#videoScreen").show();
    console.log("I've watched the video, saving " + filename); 
    $('#videoScreen video').attr('src', filename);
    UserPrefs.saveCompletedImage(filename); 
  }
}