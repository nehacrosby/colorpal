// This library contains methods that deal with the clipart image preview on the canvas.

DrawingPreview = {
  displayPreviewImage: function(jsonRecordedData, canvasPreviewCtx) {
    for (var i = 0; i < jsonRecordedData.length; i++) {
      var colorToFill = jsonRecordedData[i]; 
      App.paletteColorTuple = $.xcolor.test(colorToFill.color);
      Util.floodFill(colorToFill.x, colorToFill.y, canvasPreviewCtx);
    }
  },

  // Returns true if the canvas image has the same colors
  // as the preview image in which case the user is done!
  isSameAsPreviewImage: function(pixelData, canvasWidth, jsonRecordedData) {
    var isDone = true;
    for (var i = 0; i < jsonRecordedData.length; i++) {
      var recordedColor = jsonRecordedData[i]; 
      var offset = Util.pixelOffset(recordedColor.x, recordedColor.y, canvasWidth);
      var pixelColor = Util.getRgbString(pixelData[offset], pixelData[offset + 1], pixelData[offset + 2]); 

      if (pixelColor != recordedColor.color) {
        isDone = false;
        break;
      }
    }   
    return isDone;
  },
};
