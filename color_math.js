// This library contains methods that modify the dom.

App = {
  init: function() {
    this.ImageLibrary = 
    [
    {filename: "images/heart.png", jsonRecordedData: [{"x":240,"y":301,"color":"rgb(255,0,0)"}]},
    {filename: "images/chick-head-1.png", jsonRecordedData: [{"x":132,"y":399,"color":"rgb(255,255,0)"},{"x":214,"y":324,"color":"rgb(255,127,0)"},{"x":204,"y":367,"color":"rgb(255,127,0)"}]},
    {filename: "images/duckling-17737.png", jsonRecordedData: [{"x":94,"y":423,"color":"rgb(0,0,255)"},{"x":219,"y":301,"color":"rgb(255,255,0)"},{"x":392,"y":143,"color":"rgb(255,127,0)"}]},
    {filename: "images/circus-tent-23135.png", jsonRecordedData: [{"x":82,"y":289,"color":"rgb(255,0,0)"},{"x":154,"y":278,"color":"rgb(255,0,0)"},{"x":225,"y":254,"color":"rgb(255,0,0)"},{"x":297,"y":235,"color":"rgb(255,0,0)"},{"x":352,"y":239,"color":"rgb(255,0,0)"},{"x":422,"y":240,"color":"rgb(255,0,0)"},{"x":152,"y":148,"color":"rgb(255,0,0)"},{"x":237,"y":148,"color":"rgb(255,0,0)"},{"x":321,"y":150,"color":"rgb(255,0,0)"},{"x":263,"y":34,"color":"rgb(255,0,0)"},{"x":197,"y":158,"color":"rgb(255,255,127)"},{"x":279,"y":161,"color":"rgb(255,255,127)"},{"x":356,"y":158,"color":"rgb(255,255,127)"},{"x":118,"y":294,"color":"rgb(255,255,127)"},{"x":188,"y":279,"color":"rgb(255,255,127)"},{"x":251,"y":222,"color":"rgb(255,255,127)"},{"x":317,"y":228,"color":"rgb(255,255,127)"},{"x":393,"y":241,"color":"rgb(255,255,127)"},{"x":137,"y":194,"color":"rgb(255,0,0)"}]},                                                                                               
    ];
    this.imageIndex = 0;
    this.mixingAreaColorList = [];
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
  	Util.floodFill(position.x, position.y, ctx);

   	// Update the score.
   	var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  	var previewImageData = canvasPreviewCtx.getImageData(0, 0, canvasPreviewCtx.canvas.width, canvasPreviewCtx.canvas.height);
   	Util.updateCurrentScore(position.x, position.y,
   	                        previewImageData.data, canvasPreviewCtx.canvas.width, 
   	                        imageData.data, ctx.canvas.width);

   	// Check if the user is done coloring the entire image.                   
  	if (DrawingPreview.isSameAsPreviewImage(
        imageData.data, ctx.canvas.width, this.ImageLibrary[App.imageIndex].jsonRecordedData)) {
  	   Transition.handleCompletionAnimation();
  	}
  },
  
  onClearButtonClick: function() {
    // Clear the mixing area.
    // TODO(Neha): Ask Phil why this doesn't work.
    // $("div.mixing-area").addClass("clear");
    $("div.mixing-area").css("background-color", "#FFFFFF");
    this.mixingAreaColorList = [];
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
    DrawingPreview.displayPreviewImage(this.ImageLibrary[App.imageIndex].jsonRecordedData, canvasPreviewCtx);
    this.paletteColorTuple = $.xcolor.test("rgb(255, 255, 255)");
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
          Util.returnMixedColorRGB(
               ui.draggable.css("background-color")));

  },
};

$(document).ready(function() {
  App.init();
	// Add all the click handlers.
  $("div.primary-palette-square").click(jQuery.proxy(App.onPaletteClick, App));
	$("div.secondary-palette-square").click(jQuery.proxy(App.onPaletteClick, App));
	$('#tutorial').click(jQuery.proxy(App.onCanvasClick, App));
	$("button[name=clear-mixing-area]").click(jQuery.proxy(App.onClearButtonClick, App));
	$("button[name=next-button]").click(jQuery.proxy(Transition.showNextImage, Transition));

	// $('#image-preview').click(onImagePreviewClick);

  // Debug handlers.
  $("button[name=start-recording-action]").click(Debug.onStartRecordButtonClick);
  $("button[name=stop-recording-action]").click(Debug.onStopRecordButtonClick);

	// Draw the shape.
	App.loadImage(App.ImageLibrary[App.imageIndex].filename);
	
	// Set up drag n drop handlers.
	App.initDragAndDrop();
});