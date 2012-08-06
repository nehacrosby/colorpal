// This library contains the handling of playing a video
// tutorial.
Video = {
  init: function() {    
    $('video').bind('ended', jQuery.proxy(this.playTutorialDone, this));
    $('video').bind('timeupdate', jQuery.proxy(this.showTips, this));
    
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
  
  showTips: function(event) {
    var imageIndex = Util.getImageIndexInImageLibrary($('#videoScreen video').attr('src'));    
    // Time into the video. 
    // console.log("Have played: " + event.target.currentTime);
    var message = this.findNextMessageToShow(event.target.currentTime, ImageLibrary[imageIndex].messageData);
    var oldMessage = $("#videoScreen #video-message").html();
    if (message && oldMessage != message) {
      $("#videoScreen #video-message").hide();
      $("#videoScreen #video-message").html(message);
      $("#videoScreen #video-message").show(200);
    }
  },

  findNextMessageToShow: function(currentTime, messageData) {
    // Method returns the next tip to show on the video tutorial.
    for (i = messageData.length - 1; i >= 0; --i) {
      if (messageData[i].t < currentTime) {
        return messageData[i].message;
      }
    }
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
    $('video').bind('timeupdate', jQuery.proxy(this.showTips, this));
    
    ListView.showImageLibrary();
  },
}