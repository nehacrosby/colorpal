// This library contains all the utility/helper methods that
// do not deal with CSS and dom directly.

Util = {
  getRgbString: function(r, g, b, a) {
    return "rgba(" + r + "," + g + ","+ b + ","+ a + ")";
  },
  
  getRgbAlphaFromImageData: function(imageDataAlpha) {
    // Alpha value grabbed from canvas imageData 
    // is in the range [0, 255] while the RGB alpha
    // value is in range [0, 1]. 
    return Math.floor(imageDataAlpha / 255);
  },
  
  getImageDataAlphaFromRgb: function(a) {
     // Alpha value grabbed from canvas imageData 
     // is in the range [0, 255] while the RGB alpha
     // value is in range [0, 1]. 
     return Math.floor(a * 255);
   },
  
  returnMixedColorRGB: function(dragged_color) {
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
    return Util.getRgbString(r, g, b, 1);
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
    var pixelColor = Util.getRgbString(
                       pixelData[offset], 
                       pixelData[offset + 1],
                       pixelData[offset + 2], 
                       this.getRgbAlphaFromImageData(pixelData[offset + 3]));

    var previewOffset = Util.pixelOffset(x, y, previewCanvasWidth);
    var correctColor = Util.getRgbString(
                         previewPixelData[offset], 
                         previewPixelData[offset + 1], 
                         pixelData[offset + 2], 
                         this.getRgbAlphaFromImageData(pixelData[offset + 3]));
    if (pixelColor == correctColor) {
      UserPrefs.updateCurrentScore(50);
    }
  },

  floodFill: function(x, y, canvasContext, forPaletteSetUp, fillColorTuple) { 
    // forPaletteSetUp is set to true if the floodfill is being done
    // for setting up the palette. The main difference is the stopping
    // condition for the floodfill. While carrying out floodfill on the 
    // drawing, we stop if we hit the boundary. For the palette, we
    // continue until we hit a pixel that is not the same color as the
    // original (x, y) pixel since the boundary may not be black
    // such as, for the mixing area).
    if (Debug.isRecording) {
      Debug.recordData.push({ x: x, y: y, color: fillColorTuple.getCSS()});
    }

    var canvasWidth = canvasContext.canvas.width;
    var canvasHeight = canvasContext.canvas.height;
    var imageData = canvasContext.getImageData(0, 0, canvasWidth, canvasHeight);    
    var pixelData = imageData.data;
    
    // Never run flood-fill on the boundary or
    // if the pixelColor is already the chosen color.
    if (this.isBoundaryOrSameColor(x, y, pixelData, canvasWidth, canvasHeight, fillColorTuple)) return;
    
    // Get the current pixel color and floodfill all adjacent
    // pixels of the same color.
    var offset = this.pixelOffset(x, y, canvasWidth);
    var origColor =  Util.getRgbString(
                     pixelData[offset], 
                     pixelData[offset + 1],
                     pixelData[offset + 2],
                     this.getRgbAlphaFromImageData(pixelData[offset + 3]));
                     
    // Stack stores the (x, y) coordinates of the pixel to color.
    floodfillStack = [];
    this.fillPixel(x, y, pixelData, canvasWidth, canvasHeight, origColor, fillColorTuple, forPaletteSetUp);
    
    var i = 0
    var continueFloodFill = true;
    while(floodfillStack.length > 0) {
      toFill = floodfillStack.pop();
      continueFloodFill = this.fillPixel(toFill[0], toFill[1], pixelData, canvasWidth, canvasHeight, origColor, fillColorTuple, forPaletteSetUp);
      if (!continueFloodFill) break;
      i = i + 1
      //if (i >= 5) break;
    }
    if (continueFloodFill) {
      canvasContext.putImageData(imageData, 0, 0);
    }
  },

  fillPixel: function(x, y, pixelData, canvasWidth, canvasHeight, origColor, fillColorTuple, forPaletteSetUp) {
    if (forPaletteSetUp) {
      if(this.sameAsOrigPixelColor(x, y, pixelData, canvasWidth, canvasHeight, origColor))
        this.fill(x, y, pixelData, canvasWidth, fillColorTuple);
    
      // Update the floodfill stack.
      if(this.sameAsOrigPixelColor(x, y - 1, pixelData, canvasWidth, canvasHeight, origColor)) floodfillStack.push([x, y - 1]);
      if(this.sameAsOrigPixelColor(x + 1, y, pixelData, canvasWidth, canvasHeight, origColor)) floodfillStack.push([x + 1, y]);
      if(this.sameAsOrigPixelColor(x, y + 1, pixelData, canvasWidth, canvasHeight, origColor)) floodfillStack.push([x, y + 1]);
      if(this.sameAsOrigPixelColor(x - 1, y, pixelData, canvasWidth, canvasHeight, origColor)) floodfillStack.push([x - 1, y]);
    } else {
        if(!this.isBoundaryOrSameColor(x, y, pixelData, canvasWidth, canvasHeight, fillColorTuple)) {
          if (!this.fill(x, y, pixelData, canvasWidth, fillColorTuple)) return false;  // abort abort!
        }

        // Update the floodfill stack.
        if(!this.isBoundaryOrSameColor(x, y - 1, pixelData, canvasWidth, canvasHeight, fillColorTuple)) floodfillStack.push([x, y - 1]);
        if(!this.isBoundaryOrSameColor(x + 1, y, pixelData, canvasWidth, canvasHeight, fillColorTuple)) floodfillStack.push([x + 1, y]);
        if(!this.isBoundaryOrSameColor(x, y + 1, pixelData, canvasWidth, canvasHeight, fillColorTuple)) floodfillStack.push([x, y + 1]);
        if(!this.isBoundaryOrSameColor(x - 1, y, pixelData, canvasWidth, canvasHeight, fillColorTuple)) floodfillStack.push([x - 1, y]);
    }
    
    return true;
  },

  fill: function(x, y, pixelData, canvasWidth, fillColorTuple) {    
    // Helper method that changes the color of pixel 'x, y' to
    // whatever App.paletteColorTuple is set to. Returns false
    // if the entire floodfill should be aborted because 'x, y'
    // is outside the bounds.
    if (x == ImageLibrary[App.imageIndex].outsideRegion.x &&
        y == ImageLibrary[App.imageIndex].outsideRegion.y) {
        // abort abort!
        return false;
    }
    
    var offset = this.pixelOffset(x, y, canvasWidth);
    pixelData[offset] = fillColorTuple.r;
    pixelData[offset + 1] = fillColorTuple.g;
    pixelData[offset + 2] = fillColorTuple.b;
    pixelData[offset + 3] = this.getImageDataAlphaFromRgb(fillColorTuple.a);  // alpha value.
    
    return true;
  },

  pixelOffset: function(x, y, canvasWidth) { return (y * canvasWidth + x) * 4; },

  sameAsOrigPixelColor: function(x, y, pixelData, canvasWidth, canvasHeight, origColor) {
    var offset = this.pixelOffset(x, y, canvasWidth);
    var pixelColor =  Util.getRgbString(
                        pixelData[offset], 
                        pixelData[offset + 1],
                        pixelData[offset + 2],
                        this.getRgbAlphaFromImageData(pixelData[offset + 3]));
    return (pixelColor == origColor);
   },
  
  isBoundaryOrSameColor: function(x, y, pixelData, canvasWidth, canvasHeight, fillColorTuple) {
    // Returns ture if the x, y coordinates are boundary pixels
    // or pixels of the same color as the fill color or we've reached
    // the end of the canvas.
    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) return true;
    var offset = this.pixelOffset(x, y, canvasWidth);

    // 255 corresponds to alpha value 1 or fully opaque.
    return ((pixelData[offset] == App.boundaryColor.r &&
             pixelData[offset + 1] == App.boundaryColor.g &&
             pixelData[offset + 2] == App.boundaryColor.b &&
             this.getRgbAlphaFromImageData(pixelData[offset + 3]) == App.boundaryColor.a) ||
            (pixelData[offset] == fillColorTuple.r &&
             pixelData[offset + 1] == fillColorTuple.g &&
             pixelData[offset + 2] == fillColorTuple.b &&
             this.getRgbAlphaFromImageData(pixelData[offset + 3]) == fillColorTuple.a));		
  },
  
  isLevelComplete: function(currentLevel) {
    var completedImages = UserPrefs.getColoredImages();
    
    if (jQuery.isEmptyObject(completedImages)) return false;
    
    for (var i = 0; i < ImageLibrary.length; ++i) {
      if (!completedImages[ImageLibrary[i].filename] 
          && ImageLibrary[i].level == currentLevel) return false;
      }
    return true;
  },
  
  isLibraryComplete: function() {
    var completedImages = UserPrefs.getColoredImages();
    for (var i = 0; i < ImageLibrary.length; ++i) {
      if (!completedImages[ImageLibrary[i].filename]) return false;
    }
    return true;
  },

  getImageIndexInImageLibrary: function(imageFilename) {
    // This method is O(n). Runtime can be improved by storing a hash_map
    // from imageFilename to index. However, I do not expect the number of
    // images to be very large.
    for (var i = 0; i < ImageLibrary.length; ++i) {
      if (ImageLibrary[i].filename == imageFilename) {
        return i;
      }
    }
    return -1;
  },
  
  findNextToDoInImageLibraryHelper: function(completedImages, 
                                             imageIndex,
                                             currentLevel) {  
    var i = imageIndex + 1;    
    for (; i < ImageLibrary.length; ++i) {
      if (ImageLibrary[i].level < currentLevel) continue;
      
      if (ImageLibrary[i].level > currentLevel) break;
      
      // Return the index of the first image not
      // completed in the same level.
      if (!completedImages[ImageLibrary[i].filename] 
          && ImageLibrary[i].level == currentLevel) return i;
    }
    
    return i;
  },
  
  findNextToDoInImageLibrary: function(imageIndex) {
    // No more images left to color.
    if (this.isLibraryComplete()) return ImageLibrary.length + 1;
    
    var currentLevel = ImageLibrary[imageIndex].level;
    // Finds the next image or video available to color
    // or watch after imageIndex.
    // If it reaches the end of the level/imageLibrary, then it wraps
    // around to the first undone image of that level.
    var completedImages = UserPrefs.getColoredImages();
    var nextIndex = this.findNextToDoInImageLibraryHelper(completedImages, imageIndex, currentLevel);
    
    // nextIndex can be at a different level.
    if (nextIndex >= ImageLibrary.length
        || ImageLibrary[nextIndex].level == currentLevel + 1) {
      // Try from the beginning of the current level.
      nextIndex = this.findNextToDoInImageLibraryHelper(completedImages, -1, currentLevel);
    }
    
    // It can still be greater than length of array or image/video
    // from the next level. So the callee needs to handle that
    // accordingly.
    return nextIndex;
  }
};