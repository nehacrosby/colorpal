// https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
var paletteColorTuple = $.xcolor.test("rgb(255, 0, 0)"),
ctx = null,
canvasWidth = null,
swatchStartX = 18,
swatchStartY = 19,
swatchImageWidth = 93,
swatchImageHeight = 46,
swatchImage = new Image(),
mixingAreaColorList = new Array(),
colorRed = $.xcolor.test("rgb(255, 0, 0)"),
colorGreen = $.xcolor.test("rgb(0, 255, 0)"),
colorBlue = $.xcolor.test("rgb(0, 0, 255)"),
colorYellow = $.xcolor.test("rgb(255, 255, 0)");

// TODO: Fix the flood-fill for outside the boundary of image.
// TODO: Need to differentitate white from erase.
$(document).ready(function() {
	// Add all the click handlers.
	$("div.primary-palette-square").click(onPaletteClick);
	$("div.secondary-palette-square").click(onPaletteClick);
	$("button[name=clear-mixing-area]").click(onClearButtonClick);

	$('#tutorial').click(onCanvasClick);
	canvas = $('#tutorial')[0];

	if (canvas.getContext) {
		ctx = canvas.getContext('2d');
		canvasWidth = ctx.canvas.width;
		drawShapes();
	}
	
	$(initDragAndDrop);
});

function initDragAndDrop() {
	// Draggable properties for primary colors.
	// Primary colors can be dragged onto the mixing
	// area.
	$('div.primary-palette-square').draggable( {
		  containment: 'parent',
		  cursor: 'move',
		  helper: 'clone'
		});
	
	// Droppable properties of the mixing area.
	// It *only* accepts primary colors.
	$('div.mixing-area').droppable( {
	  accept: 'div.primary-palette-square',
	  drop: handleMixingAreaDropEvent,
	  activate: handleMixingAreaActivateEvent,
	  deactivate: handleMixingAreaDeactivateEvent,
	  // TODO(Neha): Ask Phil -- Why has hoverClass stopped working?
	  hoverClass: 'dotted-black-border'
	});
	
	// Draggable properties of the mixing area.
	// Mixing area colors can *only* be dragged onto
	// secondary color swatches.
	$('div.mixing-area').draggable( {
		  containment: 'parent',
		  cursor: 'move',
		  helper: 'clone'
		});
	
	// Droppable properties of the secondary colors.
	// It *only* accepts color from the mixing area.
	$('div.secondary-palette-square').droppable( {
	  accept: 'div.mixing-area',
	  drop: handleSecondarySwatchDropEvent,
	  activate: handleSecondarySwatchActivateEvent,
  	deactivate: handleSecondarySwatchDeactivateEvent,
  	hoverClass: 'dotted-black-border',
	});
}

function handleSecondarySwatchActivateEvent(event, ui) {
  $(this).removeClass("dotted-black-border");
  $(this).addClass("dotted-red-border");
}

function handleSecondarySwatchDeactivateEvent(event, ui) {
  $(this).removeClass("dotted-red-border");
  $(this).addClass("dotted-black-border");
}

function handleSecondarySwatchDropEvent(event, ui) {
  draggable = ui.draggable;
  
  // Change the swatch color to be the same as the 
  // mixing area color dropped on to it.
  $(this).css("background-color", 
      ui.draggable.css("background-color"));
  $(this).addClass("solid-black-border");
}

function handleMixingAreaActivateEvent(event, ui) {
  $(this).removeClass("solid-black-border");
  $(this).addClass("dotted-red-border");
}

function handleMixingAreaDeactivateEvent(event, ui) {
  $(this).removeClass("dotted-red-border");
  $(this).addClass("solid-black-border");
}

function handleMixingAreaDropEvent(event, ui) {
  draggable = ui.draggable;
  
  // Change the mixing area color to be the color
  // of the palette-square dropped on to it +
  // the color that may already be present.
  $(this).css("background-color", 
        returnMixedColorRGB(
             ui.draggable.css("background-color")));
    
}

// Returns the mixed color as rgb string by mixing dragged_color
// with the list of colors already added to the mixing area.
function returnMixedColorRGB(dragged_color) {
  if (mixingAreaColorList.length == 0) {
    mixingAreaColorList.push($.xcolor.test(dragged_color));
    return dragged_color;
  }

  // Do appropriate color mixing.
  mixingAreaColorList.push($.xcolor.test(dragged_color));
  var r = g = b = 0;
  for (var i = 0; i < mixingAreaColorList.length; i++) {
        r = r + mixingAreaColorList[i]["r"];
        g = g + mixingAreaColorList[i]["g"];
        b = b + mixingAreaColorList[i]["b"];
    }
    
  r = Math.floor(r / mixingAreaColorList.length);
  g = Math.floor(g / mixingAreaColorList.length);
  b = Math.floor(b / mixingAreaColorList.length);
  return "rgb(" + r + "," + g + ","+ b + ")";
}

function returnMixedColorHSL(dragged_color) {
  if (mixingAreaColorList.length == 0) {
     mixingAreaColorList.push($.xcolor.test(dragged_color));
     return dragged_color;
   }
   
   // Do appropriate color mixing.
   mixingAreaColorList.push($.xcolor.test(dragged_color));
   var h = s = l = 0;
   for (var i = 0; i < mixingAreaColorList.length; i++) {
         h = h + mixingAreaColorList[i].getHSL()["h"];
         s = s + mixingAreaColorList[i].getHSL()["s"];
         l = l + mixingAreaColorList[i].getHSL()["l"];
     }
     
    h = Math.floor(h / mixingAreaColorList.length);
    s = Math.floor(s / mixingAreaColorList.length);
    l = Math.floor(l / mixingAreaColorList.length);
    
    return $.xcolor.test("hsl(" + h + "," + s + "," + l + ")").getCSS();
}

// Picks an image and draws it on canvas.
function drawShapes() {
	// Fill the background with white then draw an image on top.
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	// Hard-coded black boundary color.
	boundaryColor = $.xcolor.test("rgb(0, 0, 0)");

	// Draw the shape now.
	var img = new Image();
	img.src = 'images/heart.png';
	//swatchImage.src = "images/paint-outline.png";
	img.onload = function(){
		ctx.drawImage(img, 0, 0);
	}
}

// Add click handlers.
// Pick up the color.
function onPaletteClick() {
	// Pick up the color and on next click use this color
	// to fill the region.
	paletteColorTuple = $.xcolor.test($(this).css("background-color"));
	console.log(paletteColorTuple);
}

// Clear the mixing area.
function onClearButtonClick() {
  // TODO(Neha): Ask Phil why this doesn't work.
  // $("div.mixing-area").addClass("clear");
  $("div.mixing-area").css("background-color", "#FFFFFF");
  mixingAreaColorList = new Array();
}

// Get x, y coordinates of the mouse-click
// and start flood-fill of the color from there.
function onCanvasClick(event) {
	var canvas = $('#tutorial')[0];
	x = event.pageX - canvas.offsetLeft,
	y = event.pageY - canvas.offsetTop;
	floodFill(x, y);
}

function floodFill(x, y) {
	// Create an ImageData object.
	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	// Stack stores the (x, y) coordinates of the pixel to color.
	floodfillStack = [];
	// TODO: Handle the case when pallete color is not defined.
	console.log("starting floodfill " + x + "," + y);     
	window.fillCalled = 0;
	window.isBoundaryCalled = 0;
	fillPixel(x, y, imageData.data);
	var duration = time(function() {
		while(floodfillStack.length > 0) {
			toFill = floodfillStack.pop();
			fillPixel(toFill[0], toFill[1], imageData.data);
		}
	});
	console.log("flood fill took", duration, "ms");
	console.log("filled:", window.fillCalled);
	console.log("isBoundary:", window.isBoundaryCalled);
	ctx.putImageData(imageData, 0, 0);
}

// Fills the pixel with paletteColor if it is not boundary pixel.
function fillPixel(x, y, pixelData) {
	if(!isBoundary(x, y, pixelData)) fill(x, y, pixelData);

	if(!isBoundary(x, y - 1, pixelData)) floodfillStack.push([x, y - 1]);
	if(!isBoundary(x + 1, y, pixelData)) floodfillStack.push([x + 1, y]);
	if(!isBoundary(x, y + 1, pixelData)) floodfillStack.push([x, y + 1]);
	if(!isBoundary(x - 1, y, pixelData)) floodfillStack.push([x - 1, y]);
}

// Helper method that changes the color of pixel 'x, y' to
// whatever paletteColorTuple is set to.
function fill(x, y, pixelData) {
	fillCalled++;
	var offset = pixelOffset(x, y);
	pixelData[offset] = paletteColorTuple.r;
	pixelData[offset + 1] = paletteColorTuple.g;
	pixelData[offset + 2] = paletteColorTuple.b;
}

// Returns the index of pixel at (x,y) into the pixel array returned by getImageData().
function pixelOffset(x, y) { return (y * canvasWidth + x) * 4; }

// Returns ture if the x, y coordinates are boundary pixels
// or pixels of the same color as the fill color or we've reached
// the end of the canvas.
function isBoundary(x, y, pixelData) {
	var offset = pixelOffset(x, y);
	return ((pixelData[offset] == boundaryColor.r &&
		pixelData[offset + 1] == boundaryColor.g &&
		pixelData[offset + 2] == boundaryColor.b) ||
		(pixelData[offset] == paletteColorTuple.r &&
			pixelData[offset + 1] == paletteColorTuple.g &&
			pixelData[offset + 2] == paletteColorTuple.b));
		}

		function time(fn) {
			var time = Date.now();
			fn();
			return Date.now() - time;
		}

		function benchmark(fn) {
			time(function() {
				for (var i = 0; i < 100000; i++)
				fn();
			});
		}
