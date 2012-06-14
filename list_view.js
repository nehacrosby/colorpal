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
  
  showImageLibrary: function() {
    $("#transitionScreen").hide();
    $("#drawingScreen").hide();
    $("#videoScreen").hide();
    $("#listScreen").show();

    // Re-build the image gallery from scratch.
    $('#listScreen').html('');
    var completedImages = UserPrefs.getColoredImages();
    console.log("inside show image library");

    for (var i = 0; i < ImageLibrary.length; ++i) {
      if (ImageLibrary[i].type == "image") {
        var class_tag;
        if (completedImages[ImageLibrary[i].filename]) {
          class_tag = '<div class="drawing-frame drawing-frame-done">'
        } else {
          class_tag = '<div class="drawing-frame drawing-frame-todo">'
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