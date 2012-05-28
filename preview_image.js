// This library shows the clipart image preview on the canvas.

// heart.png
var heart = [{ x: 280, y: 324, color: "rgb(255, 0, 0)", components: ["rgb(255, 0, 0)"] },
             { x: 280, y: 324, color: "rgb(255, 127, 0)", components: ["rgb(255, 0, 0)"] }]


function displayPreviewImage(image, canvasPreviewCtx) {
  for (var i = 0; i < image.length; i++) {
       var colorToFill = image[i];
       paletteColorTuple = $.xcolor.test(colorToFill.color);
       floodFill(colorToFill.x, colorToFill.y, canvasPreviewCtx);
  }
}