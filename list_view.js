// This library contains the handling of the list view that lets
// the user browse the image gallery.

ListView = {
  init: function() {
    this.enabled = true;
    
    if (Debug.showListView) {
      this.showImageLibrary();
    }    
  },
  
  // If you completed a level and hit "List View" then list view doesn't
  // know that it has to make new level available.
  showImageLibrary: function() {
    $("#transitionScreen").hide();
    $("#drawingScreen").hide();
    $("#videoScreen").hide();
    $("#listScreen").show();

    // Re-build the image gallery from scratch.
    $('#listScreen').html('');
    
    var currentLevel = 0;
    if (Util.isLibraryComplete()) {
      currentLevel = ImageLibrary.length + 1;
    } else {
      // If the currentLevel is complete then undo the
      // next level.
      while (Util.isLevelComplete(currentLevel)) {
        currentLevel++;
      }
    } 
    
    var completedImages = UserPrefs.getColoredImages();    
    // Only make images from the currentLevel available.
    for (var i = 0; i < ImageLibrary.length; ++i) {
      // Pick a randomly picked rotated tile as background.
      var rand = Math.floor(Math.random() * 5);
      if (ImageLibrary[i].type == "image") {
        var class_tag;
        var backgroundImg;
        var imageDone = false;
        if (completedImages[ImageLibrary[i].filename]) {
          imageDone = true;
          class_tag = '<div class="drawing-frame drawing-frame-done">'
          backgroundImg = 'url(images/locked_tile_' + rand + '.png)';
        } else if (ImageLibrary[i].level == currentLevel) {
          var q = 'url(images/plain_tile_' + rand + '.png)';
          class_tag = '<div class="drawing-frame drawing-frame-todo">'
          backgroundImg = 'url(images/plain_tile_' + rand + '.png)';
        } else {
          // Image is of a level higher than the currentLevel.
          class_tag = '<div class="drawing-frame drawing-frame-unavailable"> <img src="images/lock.png" class="lock"/>'
          backgroundImg = 'url(images/locked_tile_' + rand + '.png)';
        }
        var imageFilename;
        if (imageDone) { 
          imageFilename = Util.getColoredDrawingFilename(ImageLibrary[i].filename);
        } else {
          imageFilename = Util.getDrawingTodoFilename(ImageLibrary[i].filename);
        }
        var newElement = $(class_tag + '<img src="' + imageFilename + '"/></div>');
        newElement.css('background-image', backgroundImg);
        $('#listScreen').append(newElement);
      } else {
        // It's a tutorial video.
        if (ImageLibrary[i].level <= currentLevel) {
          var newElement = $('<div class="drawing-frame video-watch"></div>');
          newElement.attr("filename", ImageLibrary[i].filename);
          $('#listScreen').append(newElement);
        } else {
          // The video is not yet available to be watched.
          $('#listScreen').append('<div class="drawing-frame video-watch-unavailable"><img src="images/lock.png" class="lock"/></div>');
        }
      }
    }
     $('#listScreen').append('<br style="clear:both">');
     $(".drawing-frame-todo").click(jQuery.proxy(this.onImageClick, this));
     // Ask phil how to pass the video filename to play video tutorial.
     $(".video-watch").click(jQuery.proxy(Video.onVideoClick, Video));
     
     this.enabled = true;
  },
  
  onImageClick: function(event) {
    this.enabled = false;
    $("#listScreen").hide();
    $("#drawingScreen").show();
    App.loadImage(Util.getImageNameFromImageFilename($(event.currentTarget).find('img').attr('src')));
  }
}