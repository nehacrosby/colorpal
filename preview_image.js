// This library contains methods that deal with the clipart image previews on the canvas.

ImageLibrary = 
[
{filename: "images/heart.png", jsonRecordedData: [{"x":240,"y":301,"color":"rgb(255,0,0)"}]},
{filename: "images/chick-head-1.png", jsonRecordedData: [{"x":132,"y":399,"color":"rgb(255,255,0)"},{"x":214,"y":324,"color":"rgb(255,127,0)"},{"x":204,"y":367,"color":"rgb(255,127,0)"}]},
{filename: "images/duckling-17737.png", jsonRecordedData: [{"x":94,"y":423,"color":"rgb(0,0,255)"},{"x":219,"y":301,"color":"rgb(255,255,0)"},{"x":392,"y":143,"color":"rgb(255,127,0)"}]},
{filename: "images/circus-tent-23135.png", jsonRecordedData: [{"x":82,"y":289,"color":"rgb(255,0,0)"},{"x":154,"y":278,"color":"rgb(255,0,0)"},{"x":225,"y":254,"color":"rgb(255,0,0)"},{"x":297,"y":235,"color":"rgb(255,0,0)"},{"x":352,"y":239,"color":"rgb(255,0,0)"},{"x":422,"y":240,"color":"rgb(255,0,0)"},{"x":152,"y":148,"color":"rgb(255,0,0)"},{"x":237,"y":148,"color":"rgb(255,0,0)"},{"x":321,"y":150,"color":"rgb(255,0,0)"},{"x":263,"y":34,"color":"rgb(255,0,0)"},{"x":197,"y":158,"color":"rgb(255,255,127)"},{"x":279,"y":161,"color":"rgb(255,255,127)"},{"x":356,"y":158,"color":"rgb(255,255,127)"},{"x":118,"y":294,"color":"rgb(255,255,127)"},{"x":188,"y":279,"color":"rgb(255,255,127)"},{"x":251,"y":222,"color":"rgb(255,255,127)"},{"x":317,"y":228,"color":"rgb(255,255,127)"},{"x":393,"y":241,"color":"rgb(255,255,127)"},{"x":137,"y":194,"color":"rgb(255,0,0)"}]},                                                                                               
]

function displayPreviewImage(jsonRecordedData, canvasPreviewCtx) {
  for (var i = 0; i < jsonRecordedData.length; i++) {
       var colorToFill = jsonRecordedData[i]; 
       paletteColorTuple = $.xcolor.test(colorToFill.color);
       floodFill(colorToFill.x, colorToFill.y, canvasPreviewCtx);
  }
}

// Returns true if the canvas image has the same colors
// as the preview image in which case the user is done!
function isSameAsPreviewImage(pixelData, canvasWidth, jsonRecordedData) {
   var isDone = true;
   for (var i = 0; i < jsonRecordedData.length; i++) {
     var recordedColor = jsonRecordedData[i]; 
     var offset = pixelOffset(recordedColor.x, recordedColor.y, canvasWidth);
     var pixelColor = getRgbString(pixelData[offset], pixelData[offset + 1], pixelData[offset + 2]); 

     if (pixelColor != recordedColor.color) {
       isDone = false;
       break;
     }
   }   
   return isDone;
}

// Make the image bigger in case the user clicks on it.
function onImagePreviewClick(event) {
  var previewCanvas = $('image-preview')[0];
  
}

// An image is divided into different regions that are colored using flood-fill
// algorithm. If there are 'n' such regions, then the max score one can earn
// is 50 * n. TODO(Neha): Ask Phil if this feature is worth exposing.
function updateCurrentScore(x, y, previewPixelData, previewCanvasWidth, pixelData, canvasWidth) {
  var offset = pixelOffset(x, y, canvasWidth);
  var pixelColor = getRgbString(pixelData[offset], pixelData[offset + 1], pixelData[offset + 2]); 
  
  var previewOffset = pixelOffset(x, y, previewCanvasWidth);
  var correctColor = getRgbString(previewPixelData[offset], previewPixelData[offset + 1], pixelData[offset + 2]); 
  if (pixelColor == correctColor) {
    Debug.currentScore += 50;
  }
  console.log("Score: " + Debug.currentScore);
}
