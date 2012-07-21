// This library contains the handling of the transition page from
// one image to the next.
Transition = {
  init: function() {
    // Total time (in ms) that the entire running score animation should take.
    this.scoreAnimationTime = 2000;
    
    $("#transitionScreen .next-button").click(jQuery.proxy(this.showNextImage, this));
    $("#transitionScreen .list-button").click(jQuery.proxy(ListView.showImageLibrary, this));    
    
    if (Debug.showTransitionScreen) {
      this.showScoreScreen();
    }
  },
  
  handleCompletionAnimation: function() {
    // TODO(Neha): find out why this doesn't work.
    // $('#completion-image').show("explode", { pieces: 16 }, 1000);
    $('#completion-image').hide("bounce", { direction:'up', times:8 }, 200, jQuery.proxy(this.showScoreScreen, this));    
  },
  
  handleScoreAnimation: function() {
    var totalScoreBeforeUpdate = UserPrefs.getTotalScore();
    var incrementScoreBy = UserPrefs.getCurrentScore();
    var timeout = this.calculateTimeout(incrementScoreBy);
    this.scoreAnimationHelper(totalScoreBeforeUpdate + incrementScoreBy, totalScoreBeforeUpdate, timeout);
    
    // Update the user data stored in the cookie.
    UserPrefs.updateTotalScore(incrementScoreBy);
    UserPrefs.resetCurrentScore();
  },
  
  calculateTimeout: function(incrementScoreBy) {
    return Math.floor(this.scoreAnimationTime / incrementScoreBy);
  },
  
  scoreAnimationHelper: function(targetVal, current, timeout) {
    current = current || 0;
    if (current == targetVal) return;
    current++;
    $('#transitionScreen .score').text("Total Score: " + current);
    setTimeout(jQuery.proxy(function() { this.scoreAnimationHelper(targetVal, current, timeout) }, this), timeout);
  },
  
  showScoreScreen: function() {
    // Can only get here from the drawing screen. Clear the drawing
    // screen, secondary palette and the mixing area.
    Util.clearPaletteAndMixingArea();
    $('#palette').hide();
    $('#image-preview-container').hide();
    $('#current-score').hide();
    
    // Update the total score.  
    $("#transitionScreen").show("slide", { direction: "right" }, 1000);
    
    // Update the total score and show the score animation.
    this.handleScoreAnimation();
  },  
  
  showNextImage: function() {
    $("#transitionScreen").hide();
    $("#videoScreen").hide();
    $("#drawingScreen").show();

    if (App.imageIndex >= ImageLibrary.length) {
      alert("YOU ARE DONE!!");
      ListView.showImageLibrary();
    } else {
      var currentLevel = ImageLibrary[App.imageIndex].level;
      App.imageIndex = Util.findNextToDoInImageLibrary(App.imageIndex);

      if (App.imageIndex >= ImageLibrary.length) {
        alert("YOU ARE DONE!!");
        ListView.showImageLibrary();
      } else {
        if (ImageLibrary[App.imageIndex].level == currentLevel + 1) alert("Level complete!");
        
        // Check if its a video.
        if (ImageLibrary[App.imageIndex].type == "video") {
          Video.playTutorial(ImageLibrary[App.imageIndex].filename);
        } else {
          App.loadImage(ImageLibrary[App.imageIndex].filename);
          Debug.currentScore = 0;
          App.paletteColorTuple = $.xcolor.test("rgb(255, 255, 255)");
        }
      }
    }
  },
}
