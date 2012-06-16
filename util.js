// This library contains all the utility/helper methods that
// do not deal with CSS and dom directly.

Util = {
  getRgbString: function(r, g, b) {
    return "rgb(" + r + "," + g + ","+ b + ")";
  },
  
  returnMixedColorRGB: function(dragged_color) {
    console.log(dragged_color);
    if (App.mixingAreaColorList.length == 0) {
      App.mixingAreaColorList.push($.xcolor.test(dragged_color));
      return dragged_color;
    }

    App.mixingAreaColorList.push($.xcolor.test(dragged_color));
    var r = g = b = 0;
    for (var i = 0; i < App.mixingAreaColorList.length; i++) {
      r = r + App.mixingAreaColorList[i]["r"];
      g = g + App.mixingAreaColorList[i]["g"];
      b = b + App.mixingAreaColorList[i]["b"];
    }

    r = Math.floor(r / App.mixingAreaColorList.length);
    g = Math.floor(g / App.mixingAreaColorList.length);
    b = Math.floor(b / App.mixingAreaColorList.length);
    return Util.getRgbString(r, g, b);
  },
  
  clearCanvas: function(canvasElement) {
    var context = canvasElement.getContext('2d');
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  },
  
  clearPaletteAndMixingArea: function() {
     App.onClearButtonClick();
     var secondaryPalette = $('.secondary-palette-square');
     for(var i = 0; i < secondaryPalette.length; i++) {
       $(secondaryPalette[i]).css("background-color", ""); 
       $(secondaryPalette[i]).removeClass("solid-black-border"); 
     }
  },
  
  updateCurrentScore: function(x, y, previewPixelData, previewCanvasWidth, pixelData, canvasWidth) {
    // An image is divided into different regions that are colored using flood-fill
    // algorithm. If there are 'n' such regions, then the max score one can earn
    // is 50 * n.
    var offset = Util.pixelOffset(x, y, canvasWidth);
    var pixelColor = Util.getRgbString(pixelData[offset], pixelData[offset + 1], pixelData[offset + 2]); 

    var previewOffset = Util.pixelOffset(x, y, previewCanvasWidth);
    var correctColor = Util.getRgbString(previewPixelData[offset], previewPixelData[offset + 1], pixelData[offset + 2]); 
    if (pixelColor == correctColor) {
      UserPrefs.updateCurrentScore(50);
    }
    console.log("Score: " + UserPrefs.getCurrentScore());
  },

  floodFill: function(x, y, canvasContext) {
    if (Debug.isRecording) {
      Debug.recordData.push({ x: x, y: y, color: App.paletteColorTuple.getCSS()});
    }

    var canvasWidth = canvasContext.canvas.width;
    var canvasHeight = canvasContext.canvas.height;
    var imageData = canvasContext.getImageData(0, 0, canvasWidth, canvasHeight);

    // Stack stores the (x, y) coordinates of the pixel to color.
    floodfillStack = [];
    console.log("starting floodfill " + x + "," + y);     
    this.fillPixel(x, y, imageData.data, canvasWidth, canvasHeight);
    while(floodfillStack.length > 0) {
      toFill = floodfillStack.pop();
      this.fillPixel(toFill[0], toFill[1], imageData.data, canvasWidth, canvasHeight);
    }
    canvasContext.putImageData(imageData, 0, 0);
  },

  fillPixel: function(x, y, pixelData, canvasWidth, canvasHeight) {
    if(!this.isBoundary(x, y, pixelData, canvasWidth, canvasHeight)) this.fill(x, y, pixelData, canvasWidth);
    
    // Update the floodfill stack.
    if(!this.isBoundary(x, y - 1, pixelData, canvasWidth, canvasHeight)) floodfillStack.push([x, y - 1]);
    if(!this.isBoundary(x + 1, y, pixelData, canvasWidth, canvasHeight)) floodfillStack.push([x + 1, y]);
    if(!this.isBoundary(x, y + 1, pixelData, canvasWidth, canvasHeight)) floodfillStack.push([x, y + 1]);
    if(!this.isBoundary(x - 1, y, pixelData, canvasWidth, canvasHeight)) floodfillStack.push([x - 1, y]);
  },

  fill: function(x, y, pixelData, canvasWidth, canvasHeight) {
    // Helper method that changes the color of pixel 'x, y' to
    // whatever App.paletteColorTuple is set to.
    var offset = this.pixelOffset(x, y, canvasWidth);
    pixelData[offset] = App.paletteColorTuple.r;
    pixelData[offset + 1] = App.paletteColorTuple.g;
    pixelData[offset + 2] = App.paletteColorTuple.b;
  },

  pixelOffset: function(x, y, canvasWidth) { return (y * canvasWidth + x) * 4; },

  isBoundary: function(x, y, pixelData, canvasWidth, canvasHeight) {
    // Returns ture if the x, y coordinates are boundary pixels
    // or pixels of the same color as the fill color or we've reached
    // the end of the canvas.
    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) return true;

    var offset = this.pixelOffset(x, y, canvasWidth);

    return ((pixelData[offset] == App.boundaryColor.r &&
             pixelData[offset + 1] == App.boundaryColor.g &&
             pixelData[offset + 2] == App.boundaryColor.b) ||
            (pixelData[offset] == App.paletteColorTuple.r &&
             pixelData[offset + 1] == App.paletteColorTuple.g &&
             pixelData[offset + 2] == App.paletteColorTuple.b));		
  },
  
  getImageIndexInImageLibrary: function(imageFilename) {
    // This method is O(n). Runtime can be improved by storing a hash_map
    // from imageFilename to index. However, I do not expect the number of
    // images to be very large.
    for (var i = 0; i < ImageLibrary.length; ++i) {
      console.log("Comparing " + ImageLibrary[i].filename + " and " + imageFilename);
      if (ImageLibrary[i].filename == imageFilename) {
        return i;
      }
    }
    return -1;
  },
  
  findNextToDoInImageLibraryHelper: function(completedImages, imageIndex) {  
    console.log("Inside helper");
    console.log("completedImages array: ");
    console.log(completedImages);
    var i = imageIndex + 1;
    for (; i < ImageLibrary.length; ++i) {
      if (!completedImages[ImageLibrary[i].filename]) return i;
    }
    return i;
  },
  
  findNextToDoInImageLibrary: function(imageIndex) {
    console.log("finding index after: " + imageIndex);
    // Finds the next image or video available to color
    // or watch after imageIndex.
    // If it reaches the end of the level/imageLibrary, then it wraps
    // around to the first undone image of that level.
    var completedImages = UserPrefs.getColoredImages();
    var nextIndex = this.findNextToDoInImageLibraryHelper(completedImages, imageIndex);
    console.log("Helper returned " + nextIndex);
    if (nextIndex >= ImageLibrary.length) {
      // Try from beginning.
      console.log("Trying from beginning");
      nextIndex = this.findNextToDoInImageLibraryHelper(completedImages, -1);
      console.log("Helper returned " + nextIndex + " this time");
    }
    // It can still be greater than length of array. So
    // the callee needs to check for its validity.
    return nextIndex;
  }
};