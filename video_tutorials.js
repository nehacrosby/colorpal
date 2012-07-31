// This library contains the handling of playing a video
// tutorial.
Video = {
  init: function() {    
    $('video').bind('ended', jQuery.proxy(this.playTutorialDone, this));
    
    if (Debug.showVideoScreen) {
  	  $("#listScreen").hide();
      $("#drawingScreen").hide();
      this.playTutorial("tutorials/level2_tutorial.m4v");
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
    $('#videoScreen video').attr('src', filename);
    $('#videoScreen video')[0].play();
    UserPrefs.saveCompletedImage(filename); 
  },
  
  playTutorialDone: function(event) {
    // The below gymnast is to get around Safari bug where the
    // "ended" event fires the first time on the video tag but
    // not on subsequent plays. See:
    // http://stackoverflow.com/questions/5738855/mobile-safari-html5-video-event-listener-ended-does-not-fire-the-2nd-time
    // So we just remove the video tag and add its clone
    // back alongwith the event handler.
    var cloneVideo = $(event.target).clone();
    $(event.target).parent().append(cloneVideo);
    $(event.target).remove();
    $('video').bind('ended', jQuery.proxy(this.playTutorialDone, this));
    
    ListView.showImageLibrary();
  },
}