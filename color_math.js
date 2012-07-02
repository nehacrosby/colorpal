// This library contains methods that modify the dom.

App = {
  init: function() {
    this.imageIndex = 0;
    this.mixingAreaColorList = [];
    // Hard-coded black boundary color.
    this.boundaryColor = $.xcolor.test("rgba(0, 0, 0, 1)");
    this.paletteColorTuple = $.xcolor.test("rgb(255, 255, 255)"); // White
    this.eventEnabled = true;
    
    // Add all the click handlers.    
    $("#primary-palette-squares .palette-square").click(jQuery.proxy(this.onPaletteClick, this));
  	$("div.secondary-palette-square").click(jQuery.proxy(this.onPaletteClick, this));
  	$('#tutorial').click(jQuery.proxy(this.onCanvasClick, this));
  	$("button[name=clear-mixing-area]").click(jQuery.proxy(this.onClearButtonClick, this));
  	
  	if (Debug.showColorScreen) {
  	  $("#listScreen").hide();
      $("#drawingScreen").show();
      this.loadImage("images/duckling-17737.png");
      // this.loadImage("styles/mixing_area.png");
    }
  },
  
  onPaletteClick: function(event) {
    if (!this.eventEnabled) return;
    
    // Pick up the color.
    var paletteCanvas = $(event.target);
    this.paletteColorTuple = $.xcolor.test($(paletteCanvas).attr("color"));
    
    // Toggle the state of all palette squares to only
    // show the clicked on in the clicked state.
    $("#palette .clicked").css("display", "none");
    $("#palette .unclicked").css("display", "");
    $(event.currentTarget).find(".unclicked").css("display", "none");
    $(event.currentTarget).find(".clicked").css("display", "");
  },
  
  onCanvasClick: function(event) {
    if (!this.eventEnabled) return;
    
    var canvas = $('#tutorial')[0];
  	var imagePreview = $('#image-preview')[0];

  	// Draw the drawing to color as well as the preview.
  	var ctx = canvas.getContext('2d');
  	var canvasPreviewCtx = imagePreview.getContext('2d');

    // Start flood-fill of the color from where the mouse click event
    // happened.
  	position = this.getMouseClickCoordinates(event);
  	console.log("mouse click " + position.x + " y: " + position.y);
  	Util.floodFill(position.x, position.y, ctx, false /* forPaletteSetUp */, this.paletteColorTuple);

   	// Update the score.
   	var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  	var previewImageData = canvasPreviewCtx.getImageData(0, 0, canvasPreviewCtx.canvas.width, canvasPreviewCtx.canvas.height);
   	Util.updateCurrentScore(position.x, position.y,
   	                        previewImageData.data, canvasPreviewCtx.canvas.width, 
   	                        imageData.data, ctx.canvas.width);

   	// Check if the user is done coloring the entire image.                   
  	if (DrawingPreview.isSameAsPreviewImage(
        imageData.data, ctx.canvas.width, ImageLibrary[App.imageIndex].jsonRecordedData)) {
       UserPrefs.saveCompletedImage(ImageLibrary[App.imageIndex].filename); 
  	   Transition.handleCompletionAnimation();
  	}
  },
  
  onClearButtonClick: function() {
    if (!this.eventEnabled) return;
    
    // Clear the mixing area.
    $("div.mixing-area").css("background-color", "");
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
    // Set up the drawing canvases.
    var canvas = $('#tutorial')[0];
  	var imagePreview = $('#image-preview')[0];

  	if (!canvas.getContext)
  	  return;

  	// Draw the drawing to color as well as the preview.
  	var ctx = canvas.getContext('2d');    
  	var canvasPreviewCtx = imagePreview.getContext('2d');

  	this.drawShapes(image, ctx);
  	this.drawShapes(image, canvasPreviewCtx);
  	App.imageIndex = Util.getImageIndexInImageLibrary($(image).attr("src"));
    // DrawingPreview.displayPreviewImage(ImageLibrary[App.imageIndex].jsonRecordedData, canvasPreviewCtx);
    this.paletteColorTuple = $.xcolor.test("rgb(255, 255, 255)");
    
    // Set up palette canvases.
    this.setupPaletteCanvases();
  },
  
  randomlyPickBlobImage: function() {
    // TODO(Neha): Fix the dragging images.
    if ((Math.random()*1) <= 0.5) {
      return {"unclicked" : "styles/blob1.png",
              "clicked" : "styles/blob1_selected.png"};
    } else {
       return {"unclicked" : "styles/blob2.png",
                "clicked" : "styles/blob2_selected.png"};
    }
  },
  
  setupPaletteCanvases: function() {
    var imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgb(0, 0, 255)", "#blue canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgb(0, 0, 255)", "#blue canvas.clicked", imageFiles["clicked"]);
    
    imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgb(255, 0, 0)", "#red canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgb(255, 0, 0)", "#red canvas.clicked", imageFiles["clicked"]);
    
    imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgb(255, 255, 0)", "#yellow canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgb(255, 255, 0)", "#yellow canvas.clicked", imageFiles["clicked"]);
    
    imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgb(0, 255, 0)", "#green canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgb(0, 255, 0)", "#green canvas.clicked", imageFiles["clicked"]);
    
    imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgb(255, 255, 255)", "#white canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgb(255, 255, 255)", "#white canvas.clicked", imageFiles["clicked"]);
    
    /* Keep it different from boundary color */
    imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgb(1, 1, 1)", "#black canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgb(1, 1, 1)", "#black canvas.clicked", imageFiles["clicked"]);
    
    // Set up mixing area palette.
    this.setupSinglePalette("", "#mixing-area-square canvas.deactivated", "styles/mixing_area.png");
    this.setupSinglePalette("", "#mixing-area-square canvas.activated", "styles/mixing_area_dragging.png");
  },
  
  // TODO(Neha): Add rotation.
  setupSinglePalette: function(fillColor, canvasId, imageFile) {
    var palCanvas = $(canvasId)[0];
    var palCtx = palCanvas.getContext('2d');   
    var image = new Image();
    image.onload = function () { 
      palCtx.drawImage(image, 0, 0); 
      if (fillColor != "") {
        $(canvasId).attr("color", fillColor);
        Util.floodFill(40, 40, palCtx, true, $.xcolor.test(fillColor));
      }
    }     
    image.src = imageFile;
  },
  
  drawShapes: function(image, canvasContext) {
    // Picks a drawing image and draws it and its preview on canvas.
  	// Fill the background with black with 0 alpha then draw an image on top.
  	canvasContext.fillStyle = "rgba(0, 0, 0, 0)";
    canvasContext.fillRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);	
    
    // Center the image on Canvas and draw it.
    var widthOffset = Math.floor((canvasContext.canvas.width - image.width) / 2);
    var heightOffset = Math.floor((canvasContext.canvas.height - image.height) / 2);
  	canvasContext.drawImage(image, widthOffset, heightOffset);
  },
  
  initDragAndDrop: function() {
  	// Draggable properties for primary colors.
  	// Primary colors can be dragged onto the mixing
  	// area.
  	$('.palette-square').draggable( {
  		  cursor: 'move',
  		  helper: this.draggedPrimaryClone,
  		});

  	// Droppable properties of the mixing area.
  	// It *only* accepts primary colors.
  	$('#mixing-area-square').droppable( {
  	  accept: '.palette-square',
  	  drop: this.handleMixingAreaDropEvent,
  	  activate: this.handleMixingAreaActivateEvent, 
  	  deactivate: this.handleMixingAreaDeactivateEvent, 
  	});

  	// Draggable properties of the mixing area.
  	// Mixing area colors can *only* be dragged onto
  	// secondary color swatches.
  	$('.mixing-area').draggable( {
  		  containment: 'parent',
  		  cursor: 'move',
  		  helper: 'clone'
  		});

  	// Droppable properties of the secondary colors.
  	// It *only* accepts color from the mixing area.
  	$('.secondary-palette-square').droppable( {
  	  accept: 'div.mixing-area',
  	  drop: this.handleSecondarySwatchDropEvent,
  	  activate: this.handleSecondarySwatchActivateEvent,
    	deactivate: this.handleSecondarySwatchDeactivateEvent,
  	});
  },
  
  draggedPrimaryClone: function(event) {
    var cloneCanvas = event.target.cloneNode();
    // copy contents
    var sourceContext = event.target.getContext("2d");    
    var imageData = sourceContext.getImageData(0, 0, sourceContext.canvas.width, sourceContext.canvas.height);
    var cloneContext = cloneCanvas.getContext("2d");
    cloneContext.putImageData(imageData, 0, 0);	
    return cloneCanvas;
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
    $(event.target).find(".deactivated").css("display", "none");
    $(event.target).find(".activated").css("display", "");      
  },

  handleMixingAreaDeactivateEvent: function(event, ui) {
    $(event.target).find(".activated").css("display", "none");
    $(event.target).find(".deactivated").css("display", "");
  },

  handleMixingAreaDropEvent: function(event, ui) {
    var swatch = $(event.target);
    draggable = ui.draggable;

    // Floodfill both activated and deactivated mixing
    // area.
    var draggedColor = draggable.find("canvas").attr("color");
    var mixedColorTuple = $.xcolor.test(Util.returnMixedColorRGB(draggedColor));
    var palCanvas = $("#mixing-area-square canvas.deactivated")[0];
    var palCtx = palCanvas.getContext('2d'); 
    Util.floodFill(40, 40, palCtx, true /* forPaletteSetUp */, mixedColorTuple);
        
    palCanvas = $("#mixing-area-square canvas.activated")[0];
    palCtx = palCanvas.getContext('2d'); 
    Util.floodFill(40, 40, palCtx, true /* forPaletteSetUp */,  mixedColorTuple);  
  },
};

$(document).ready(function() {
  // The order of init methods matters.
  UserPrefs.init();
  App.init();
  DrawingPreview.init();
  Video.init();
  ListView.init();
  Transition.init();
  Debug.init();
	
	// Set up drag n drop handlers.
	App.initDragAndDrop();
});