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
    $("button[name=list-button]").click(jQuery.proxy(this.showImageLibrary, this));  
  },
  
  // If you completed a level and hit "List View" then list view doesn't
  // know that it has to make new level available.
  
  showImageLibrary: function() {
    console.log("inside show image library");
    
    $("#transitionScreen").hide();
    $("#drawingScreen").hide();
    $("#videoScreen").hide();
    $("#listScreen").show();

    // Re-build the image gallery from scratch.
    $('#listScreen').html('');
    
    var currentLevel = 0;
    if (App.imageIndex < ImageLibrary.length) {
      currentLevel = ImageLibrary[App.imageIndex].level;
      console.log("currentLevel: " + currentLevel);
      // If the currentLevel is complete then undo the
      // next level.
      if (Util.isLevelComplete(currentLevel)) {
        alert("show image library level complete!");
        currentLevel++;
      }
    } 
    
    console.log("currentLevel: " + currentLevel);
    var completedImages = UserPrefs.getColoredImages();
    console.log(completedImages);
    
    // Only make images from the currentLevel available.
    for (var i = 0; i < ImageLibrary.length; ++i) {
      if (ImageLibrary[i].type == "image") {
        console.log("analyzing image: " + ImageLibrary[i].filename);
        var class_tag;
        if (completedImages[ImageLibrary[i].filename]) {
          // TODO(Neha): "done" images should be colored.
          console.log("image is done");
          class_tag = '<div class="drawing-frame drawing-frame-done">'
        } else if (ImageLibrary[i].level == currentLevel) {
          console.log("image is not done");
          class_tag = '<div class="drawing-frame drawing-frame-todo">'
        } else {
          // Image is of a level higher than the currentLevel. We show
          // it as done. TODO(Neha): Update this to something like 
          // "not-available".
          console.log("image at higher level");
          class_tag = '<div class="drawing-frame drawing-frame-done">'
        }
        $('#listScreen').append(class_tag + '<img src="' + ImageLibrary[i].filename + '"/></div>');
      } else {
        // It's a tutorial video.
        $('#listScreen').append('<div class="drawing-frame video-watch"><img src="' + ImageLibrary[i].filename + '"/></div>');
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
    console.log(event);
    App.loadImage($(event.currentTarget).find('img').attr('src'));  
  }
}