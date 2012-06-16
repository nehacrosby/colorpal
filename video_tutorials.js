// This library contains the handling of playing a video
// tutorial.

// TODO(Neha): Figure out why the video isn't always clickable.
Video = {
  init: function() {    
    // Add all the click handlers.
    $(".video-watch").click(jQuery.proxy(this.onVideoClick, this)); 
  },
  
  onVideoClick: function(event) {
    console.log($(event.currentTarget).find('img').attr('src'));
    this.playTutorial($(event.currentTarget).find('img').attr('src'));  
  },
  
  playTutorial: function(filename) {
    $("#listScreen").hide();
    $("#videoScreen").show();
    console.log("I've watched the video"); 
    console.log(ImageLibrary[App.imageIndex].filename);  
    UserPrefs.saveCompletedImage(filename); 
  }
}