// This library contains the handling of the list view that lets
// the user browse the image gallery.

ListView = {
  init: function() {
    this.enabled = true;
    
    if (Debug.showListView) {
      this.showImageLibrary();
    }
    
    // Add all the click handlers.
    $(".drawing-frame-todo").click(jQuery.proxy(this.onImageClick, this));
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
    if (App.imageIndex < ImageLibrary.length) {
      currentLevel = ImageLibrary[App.imageIndex].level;
      // If the currentLevel is complete then undo the
      // next level.
      if (Util.isLevelComplete(currentLevel)) {
        alert("show image library level complete!");
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
        if (completedImages[ImageLibrary[i].filename]) {
          // TODO(Neha): "done" images should be colored.
          console.log("image is done");
          class_tag = '<div class="drawing-frame drawing-frame-done">'
          backgroundImg = 'url(styles/locked_tile.png)';
        } else if (ImageLibrary[i].level == currentLevel) {
          class_tag = '<div class="drawing-frame drawing-frame-todo">'
          backgroundImg = 'url(styles/plain_tile_' + rand + '.png)';
        } else {
          // Image is of a level higher than the currentLevel.
          class_tag = '<div class="drawing-frame drawing-frame-unavailable"> <img src="styles/lock.png" class="lock"/>'
          backgroundImg = 'url(styles/locked_tile_' + rand + '.png)';
        }
        var newElement = $(class_tag + '<img src="' + ImageLibrary[i].filename + '"/></div>');
        newElement.css('background-image', backgroundImg);
        $('#listScreen').append(newElement);
      } else {
        // It's a tutorial video.
        $('#listScreen').append('<div class="drawing-frame video-watch"></div>');
      }
    }
     $('#listScreen').append('<br style="clear:both">');
     $(".drawing-frame-todo").click(jQuery.proxy(this.onImageClick, this));
     $(".video-watch").click(jQuery.proxy(Video.onVideoClick, Video));
     
     this.enabled = true;
  },
  
  onImageClick: function(event) {
    this.enabled = false;
    $("#listScreen").hide();
    $("#drawingScreen").show();
    App.loadImage($(event.currentTarget).find('img').attr('src'));  
  }
}