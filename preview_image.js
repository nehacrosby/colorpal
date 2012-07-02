// This library contains methods that deal with the clipart image preview on the canvas.

DrawingPreview = {
  init: function() {
    this.eventEnabled = true;
    
    // Add all the click handlers.
    $('#image-preview').click(jQuery.proxy(this.onImagePreviewClick, this));
  },
  
  displayPreviewImage: function(jsonRecordedData, canvasPreviewCtx) {
    for (var i = 0; i < jsonRecordedData.length; i++) {
      var colorToFill = jsonRecordedData[i]; 
      App.paletteColorTuple = $.xcolor.test(colorToFill.color);
      Util.floodFill(colorToFill.x, colorToFill.y, canvasPreviewCtx, false /* forPaletteSetUp */, App.paletteColorTuple);
    }
  },

  onImagePreviewClick: function(event) {
    if (!this.eventEnabled) return;
        
    // Disable all the event handlers for the main drawing
    // and the preview until the animation is done.
    App.eventEnabled = false;
    Debug.eventEnabled = false;
    this.eventEnabled = false;
    
    // Expand the preview drawing.
    $('#image-preview').animate({
      zoom: '100%',
    }, 1000, function() {
      // Animation complete.
    });
    
    // Shrink the main drawing.
    $('#tutorial').animate({
      zoom: '25%',
     }, 1000, jQuery.proxy(this.onImagePreviewAnimationComplete, this));
     
     $('#image-preview-container .expand-icon').hide();
     // Fade out the palette screen.
     $('#palette').hide(500);
     $('#debug').hide(500);
  },

  onImagePreviewAnimationComplete: function() {
    $('#tutorial-container > .expand-icon').show();    
    $('#tutorial').bind('click', jQuery.proxy(DrawingPreview.onShrunkDrawingClick, DrawingPreview));
    this.eventEnabled = true;
  },
  
  onShrunkDrawingClick: function(event) {
    if (!this.eventEnabled) return;
        
    // Disable all the event handlers for the main drawing
    // and the preview until the animation is done.
    App.eventEnabled = false;
    this.eventEnabled = false;
    Debug.eventEnabled = false;
        
     // Expand the drawing.
     $('#tutorial').animate({
       zoom: '100%',
     }, 1000, function() {
       // Animation complete.
     });

     // Shrink the preview drawing.
     $('#image-preview').animate({
       zoom: '25%',
      }, 1000, jQuery.proxy(this.onShrunkDrawingClickComplete, this));

     $('#tutorial-container > .expand-icon').hide();  
      // Show the palette screen.
      $('#palette').show(1000);
      $('#debug').show(1000);
   },

   onShrunkDrawingClickComplete: function() {
     $('#image-preview-container .expand-icon').show();
     // Unbind the click handler so we don't respond to it
     // while the drawing is fully expanded.
     $('#tutorial').unbind('click', jQuery.proxy(DrawingPreview.onShrunkDrawingClick, DrawingPreview));
     
     // Re-enable all other event handlers on the main drawing
     // and the preview.
     App.eventEnabled = true;
     this.eventEnabled = true;
     Debug.eventEnabled = true;
   },
  
  isSameAsPreviewImage: function(pixelData, canvasWidth, jsonRecordedData) {
    // Returns true if the canvas image has the same colors
    // as the preview image in which case the user is done!
    var isDone = true;
    for (var i = 0; i < jsonRecordedData.length; i++) {
      var recordedColor = jsonRecordedData[i]; 
      var offset = Util.pixelOffset(recordedColor.x, recordedColor.y, canvasWidth);
      var pixelColor = Util.getRgbString(
                         pixelData[offset],
                         pixelData[offset + 1], 
                         pixelData[offset + 2],
                         Util.getRgbAlphaFromImageData(pixelData[offset + 3])); 

      if (pixelColor != recordedColor.color) {
        isDone = false;
        break;
      }
    }   
    return isDone;
  },
    
};
