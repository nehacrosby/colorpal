App = {
  init: function() {
    this.imageIndex = 0;
    this.mixingAreaColorList = new Array();
    // Hard-coded black boundary color.
    this.boundaryColor = $.xcolor.test("rgb(0, 0, 0)");
    this.paletteColorTuple = $.xcolor.test("rgb(255, 255, 255)");
  },
  
  onPaletteClick: function(event) {
    // Pick up the color.
    var paletteDiv = $(event.target);
    this.paletteColorTuple = $.xcolor.test(paletteDiv.css("background-color"));
  },
  
  onCanvasClick: function(event) {
    var canvas = $('#tutorial')[0];
  	var imagePreview = $('#image-preview')[0];

  	// Draw the drawing to color as well as the preview.
  	var ctx = canvas.getContext('2d');
  	var canvasPreviewCtx = imagePreview.getContext('2d');

    // Start flood-fill of the color from where the mouse click event
    // happened.
  	position = this.getMouseClickCoordinates(event);
  	floodFill(position.x, position.y, ctx);

   	// Update the score.
   	var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  	var previewImageData = canvasPreviewCtx.getImageData(0, 0, canvasPreviewCtx.canvas.width, canvasPreviewCtx.canvas.height);
   	updateCurrentScore(position.x, position.y,
   	                   previewImageData.data, canvasPreviewCtx.canvas.width, 
   	                   imageData.data, ctx.canvas.width);

   	// Check if the user is done coloring the entire image.                   
  	if (isSameAsPreviewImage(imageData.data, 
  	                         ctx.canvas.width, 
                        	   ImageLibrary[App.imageIndex].jsonRecordedData)) {
  	   onDrawingComplete();
  	}
  },
  
  onClearButtonClick: function() {
    // Clear the mixing area.
    // TODO(Neha): Ask Phil why this doesn't work.
    // $("div.mixing-area").addClass("clear");
    $("div.mixing-area").css("background-color", "#FFFFFF");
    this.mixingAreaColorList = new Array();
  },
  
  getMouseClickCoordinates: function(event) {
    // Get x, y coordinates of the mouse-click.
    // Taken from:
    // http://stackoverflow.com/questions/1114465/getting-mouse-location-in-canvas
     var targ = event.target;
     var x = event.pageX - $(targ).offset().left;
     var y = event.pageY - $(targ).offset().top;
     return {"x": x, "y": y};
  },
  
  loadImage: function(imageFilename) {
    var image = new Image();
  	image.src = imageFilename;
  	image.onload = jQuery.proxy(function() { this.setupCanvases(image) }, this);
  },
  
  setupCanvases: function(image) {
    var canvas = $('#tutorial')[0];
  	var imagePreview = $('#image-preview')[0];

  	if (!canvas.getContext)
  	  return;

  	// Draw the drawing to color as well as the preview.
  	var ctx = canvas.getContext('2d');
  	var canvasPreviewCtx = imagePreview.getContext('2d');

  	this.drawShapes(image, ctx);
  	this.drawShapes(image, canvasPreviewCtx);
    displayPreviewImage(ImageLibrary[App.imageIndex].jsonRecordedData, canvasPreviewCtx);
  },
  
  drawShapes: function(image, canvasContext) {
    // Picks an image and draws it and its preview on canvas.
  	// Fill the background with white then draw an image on top.
  	canvasContext.fillStyle = "rgb(255, 255, 255)";
  	canvasContext.fillRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);	
  	canvasContext.drawImage(image, 0, 0);
  },
  
  initDragAndDrop: function() {
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
  	  drop: this.handleMixingAreaDropEvent,
  	  activate: this.handleMixingAreaActivateEvent,
  	  deactivate: this.handleMixingAreaDeactivateEvent,
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
  	  drop: this.handleSecondarySwatchDropEvent,
  	  activate: this.handleSecondarySwatchActivateEvent,
    	deactivate: this.handleSecondarySwatchDeactivateEvent,
  	});
  },
  
  handleSecondarySwatchActivateEvent: function(event, ui) {
    var swatch = $(event.target);
    swatch.removeClass("dotted-black-border");
    swatch.addClass("dotted-red-border");
  },

  handleSecondarySwatchDeactivateEvent: function(event, ui) {
    var swatch = $(event.target);
    swatch.removeClass("dotted-red-border");
    swatch.addClass("dotted-black-border");
  },

  handleSecondarySwatchDropEvent: function(event, ui) {
    var swatch = $(event.target);
    draggable = ui.draggable;

    // Change the swatch color to be the same as the 
    // mixing area color dropped on to it.
    swatch.css("background-color", 
        ui.draggable.css("background-color"));
    swatch.addClass("solid-black-border");
  },

  handleMixingAreaActivateEvent: function(event, ui) {
    var swatch = $(event.target);
    swatch.removeClass("solid-black-border");
    swatch.addClass("dotted-red-border");
  },

  handleMixingAreaDeactivateEvent: function(event, ui) {
    var swatch = $(event.target);
    swatch.removeClass("dotted-red-border");
    swatch.addClass("solid-black-border");
  },

  handleMixingAreaDropEvent: function(event, ui) {
    var swatch = $(event.target);
    draggable = ui.draggable;

    // Change the mixing area color to be the color
    // of the palette-square dropped on to it +
    // the color that may already be present.
    swatch.css("background-color", 
          returnMixedColorRGB(
               ui.draggable.css("background-color")));

  },
};

$(document).ready(function() {
  App.init();
	// Add all the click handlers.
  $("div.primary-palette-square").click(jQuery.proxy(App.onPaletteClick, App));
	$("div.secondary-palette-square").click(jQuery.proxy(App.onPaletteClick, App));
	$('#tutorial').click(jQuery.proxy(App.onCanvasClick, App));
	$("button[name=clear-mixing-area]").click(jQuery.proxy(App.onClearButtonClick));
	// $('#image-preview').click(onImagePreviewClick);

  // Debug handlers.
  $("button[name=start-recording-action]").click(Debug.onStartRecordButtonClick);
  $("button[name=stop-recording-action]").click(Debug.onStopRecordButtonClick);

	// Draw the shape.
	App.loadImage(ImageLibrary[App.imageIndex].filename);
	
	// Set up drag n drop handlers.
	App.initDragAndDrop();
});

// Returns the rgb string as "rgb(r,g,b)" from the
// r, g, b values passed in as arguments.
function getRgbString(r, g, b) {
  return "rgb(" + r + "," + g + ","+ b + ")";
}

// Returns the mixed color as rgb string by mixing dragged_color
// with the list of colors already added to the mixing area.
function returnMixedColorRGB(dragged_color) {
  if (App.mixingAreaColorList.length == 0) {
    App.mixingAreaColorList.push($.xcolor.test(dragged_color));
    return dragged_color;
  }

  // Do appropriate color mixing.
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
  return getRgbString(r, g, b);
}

function onDrawingComplete() {
  if (App.imageIndex == ImageLibrary.length - 1) App.imageIndex = 0
  else App.imageIndex++;
  
  loadImage(ImageLibrary[App.imageIndex].filename);
  Debug.currentScore = 0;
}

function floodFill(x, y, canvasContext) {
  if (Debug.isRecording) {
    Debug.recordData.push({ x: x, y: y, color: App.paletteColorTuple.getCSS()});
  }
  
  var canvasWidth = canvasContext.canvas.width;
  var canvasHeight = canvasContext.canvas.height;
	// Create an ImageData object.
	var imageData = canvasContext.getImageData(0, 0, canvasWidth, canvasHeight);

	// Stack stores the (x, y) coordinates of the pixel to color.
	floodfillStack = [];
	// TODO: Handle the case when pallete color is not defined.
	console.log("starting floodfill " + x + "," + y);     
	fillPixel(x, y, imageData.data, canvasWidth, canvasHeight);
  var duration = time(function() {
    while(floodfillStack.length > 0) {
      toFill = floodfillStack.pop();
      fillPixel(toFill[0], toFill[1], imageData.data, canvasWidth, canvasHeight);
    }
  });
  console.log("flood fill took", duration, "ms");
	canvasContext.putImageData(imageData, 0, 0);
}

// Fills the pixel with paletteColor if it is not boundary pixel.
function fillPixel(x, y, pixelData, canvasWidth, canvasHeight) {
	if(!isBoundary(x, y, pixelData, canvasWidth, canvasHeight)) fill(x, y, pixelData, canvasWidth);

	if(!isBoundary(x, y - 1, pixelData, canvasWidth, canvasHeight)) floodfillStack.push([x, y - 1]);
	if(!isBoundary(x + 1, y, pixelData, canvasWidth, canvasHeight)) floodfillStack.push([x + 1, y]);
	if(!isBoundary(x, y + 1, pixelData, canvasWidth, canvasHeight)) floodfillStack.push([x, y + 1]);
	if(!isBoundary(x - 1, y, pixelData, canvasWidth, canvasHeight)) floodfillStack.push([x - 1, y]);
}

// Helper method that changes the color of pixel 'x, y' to
// whatever App.paletteColorTuple is set to.
function fill(x, y, pixelData, canvasWidth, canvasHeight) {
	var offset = pixelOffset(x, y, canvasWidth);
	pixelData[offset] = App.paletteColorTuple.r;
	pixelData[offset + 1] = App.paletteColorTuple.g;
	pixelData[offset + 2] = App.paletteColorTuple.b;
}

// Returns the index of pixel at (x,y) into the pixel array returned by getImageData().
function pixelOffset(x, y, canvasWidth) { return (y * canvasWidth + x) * 4; }

// Returns ture if the x, y coordinates are boundary pixels
// or pixels of the same color as the fill color or we've reached
// the end of the canvas.
function isBoundary(x, y, pixelData, canvasWidth, canvasHeight) {
  if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) return true;
  
	var offset = pixelOffset(x, y, canvasWidth);

	return ((pixelData[offset] == App.boundaryColor.r &&
		pixelData[offset + 1] == App.boundaryColor.g &&
		pixelData[offset + 2] == App.boundaryColor.b) ||
		(pixelData[offset] == App.paletteColorTuple.r &&
			pixelData[offset + 1] == App.paletteColorTuple.g &&
			pixelData[offset + 2] == App.paletteColorTuple.b));		
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
