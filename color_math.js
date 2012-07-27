// This library contains methods that modify the dom.

App = {
  init: function() {
    this.imageIndex = 0;
    this.mixingAreaColorList = [];
    // Hard-coded black boundary color.
    this.boundaryColor = $.xcolor.test("rgba(0,0,0,1)");
    this.paletteColorTuple = $.xcolor.test("rgba(255, 0, 0, 1)"); // Red.
    this.eventEnabled = true;
    
    // Add all the click handlers.    
    $("#primary-palette-squares .palette-square").click(jQuery.proxy(this.onPaletteClick, this));
    $("#secondary-palette-squares .secondary-palette-square").click(jQuery.proxy(this.onPaletteClick, this));
  	$('#tutorial').click(jQuery.proxy(this.onCanvasClick, this));
  	$("#clear-mixing-area").click(jQuery.proxy(this.onClearButtonClick, this));
  	$("#drawingScreen .list-button").click(jQuery.proxy(ListView.showImageLibrary, ListView));  
    
  	if (Debug.showColorScreen) {
  	  $("#listScreen").hide();
      $("#drawingScreen").show();
      this.loadImage("images/pig.png");
    }
  },
  
  onPaletteClick: function(event) {
    if (!this.eventEnabled) return;
    
    // Pick up the color.
    var paletteCanvas = $(event.target);
    this.paletteColorTuple = $.xcolor.test($(paletteCanvas).attr("color"));
    
    // Toggle the state of all palette squares to only
    // show the clicked one in the clicked state.
    $("#palette .clicked").hide();
    $("#palette .unclicked").show();
    $(event.currentTarget).find(".unclicked").hide();
    $(event.currentTarget).find(".clicked").show();
  },
  
  onCanvasClick: function(event) {
    console.log("inside canvas click");
    if (!this.eventEnabled) return;
    
    var canvas = $('#tutorial')[0];
  	var imagePreview = $('#image-preview')[0];

  	// Draw the drawing to color as well as the preview.
  	var ctx = canvas.getContext('2d');
  	var canvasPreviewCtx = imagePreview.getContext('2d');

    // Start flood-fill of the color from where the mouse click event
    // happened.
  	position = this.getMouseClickCoordinates(event);
  	if (Debug.isRecording) {
      Debug.recordData.push({ x: position.x, y: position.y, color: Util.getRgbString(this.paletteColorTuple.r, this.paletteColorTuple.g, this.paletteColorTuple.b ,1)});
    }
    // Update the score.
   	var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  	var previewImageData = canvasPreviewCtx.getImageData(0, 0, canvasPreviewCtx.canvas.width, canvasPreviewCtx.canvas.height);
  	
  	// Return if the click happened outside the region that can be colored.
  	if (Util.isOutsideRegion(position.x, position.y, previewImageData.data, canvasPreviewCtx.canvas.width)) {
  	  console.log("Outside region click!");
  	  return;
  	}
  	
   	Util.updateCurrentScore(position.x, position.y,
   	                        previewImageData.data, canvasPreviewCtx.canvas.width, 
   	                        imageData.data, ctx.canvas.width);
  	Util.floodFill(position.x, position.y, ctx, false /* forPaletteSetUp */, this.paletteColorTuple);
  	// Get the updated imageData.
    var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
   	// Update the score display.
   	$("#current-score").html("Score: " + UserPrefs.getCurrentScore());

   	// Check if the user is done coloring the entire image.                   
  	// if (DrawingPreview.isSameAsPreviewImage(
  	//         imageData.data, ctx.canvas.width, ImageLibrary[App.imageIndex].jsonRecordedData)) {
  	//        UserPrefs.saveCompletedImage(ImageLibrary[App.imageIndex].filename); 
  	//        Transition.handleCompletionAnimation();
  	//     }
  },
  
  onClearButtonClick: function() {
    if (!this.eventEnabled) return;
    
    // Clear the mixing area.
    var mixedColorRgb = "rgba(255, 255, 255)";
    var mixedColorTuple = $.xcolor.test(mixedColorRgb);
    App.dragAndDropFloodFillHelper("#mixing-area-square canvas.deactivated", mixedColorRgb, mixedColorTuple);
    App.dragAndDropFloodFillHelper("#mixing-area-square canvas.activated", mixedColorRgb, mixedColorTuple);    
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
  
  // Clears all state and prepares the new drawing to be colored.
  resetPage: function() {
    this.mixingAreaColorList = [];
    this.paletteColorTuple = $.xcolor.test("rgba(255, 0, 0, 1)"); // Red.
    // Set the red swatch to be clicked.
    
    // Clear all the canvases.
    var canvasList = $('canvas');
    for (var i = 0; i < canvasList.length; i++) {
      Util.clearCanvas(canvasList[i]);
    }
    
    // Now show the required dom elements from the
    // drawing screen.
    $('#palette').show();
    $('#image-preview-container').show();
    $('#current-score').show();
  },

  loadImage: function(imageFilename) {  
    console.log("inside load image");
    // Prepare the drawing screen by clearing previous
    // state.
    this.resetPage();
    console.log("after reset");
    
    var image = new Image();
  	image.src = imageFilename;
  	image.onload = jQuery.proxy(function() { this.setupCanvases(image) }, this);
  },
  
  setupCanvases: function(image) {
    console.log("setting up canvases");
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
  	console.log("calling displaypreviewmsg");
    DrawingPreview.displayPreviewImage(ImageLibrary[App.imageIndex].jsonRecordedData, canvasPreviewCtx);
    console.log("after calling displaypreviewmsg");
  	
    this.paletteColorTuple = $.xcolor.test("rgba(255, 0, 0, 1)"); // Red.
        
    // Set up palette canvases.
    this.setupPaletteCanvases();
  },
  
  randomlyPickBlobImage: function() {
    if ((Math.random()*1) <= 0.5) {
      return {"unclicked" : "styles/blob1.png",
              "clicked" : "styles/blob1_selected.png",
              "dragged" : "styles/blob1_dragging.png"};
    } else {
       return {"unclicked" : "styles/blob2.png",
                "clicked" : "styles/blob2_selected.png",
                "dragged" : "styles/blob2_dragging.png"};
    }
  },
  
  setupSecondaryPaletteHelper: function(canvasId) {
    var imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgba(255, 255, 255, 0)", canvasId + " canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgba(255, 255, 255, 0)", canvasId + " canvas.clicked", imageFiles["clicked"]);
    this.setupSinglePalette("rgba(255, 255, 255, 0)", canvasId + " canvas.activated", imageFiles["dragged"]);
  },
  
  setupPaletteCanvases: function() {
    console.log("Inside setup plalette canvases");
    
    // Secondary Palette Squares
    this.setupSecondaryPaletteHelper("#first");
    this.setupSecondaryPaletteHelper("#second");
    this.setupSecondaryPaletteHelper("#third");
    this.setupSecondaryPaletteHelper("#fourth");
    this.setupSecondaryPaletteHelper("#fifth");
    this.setupSecondaryPaletteHelper("#sixth");
    this.setupSecondaryPaletteHelper("#seventh");

    // Primary Palette Squares
    var imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgba(0, 0, 255, 1)", "#blue canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgba(0, 0, 255, 1)", "#blue canvas.clicked", imageFiles["clicked"]);

    imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgba(255, 0, 0, 1)", "#red canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgba(255, 0, 0, 1)", "#red canvas.clicked", imageFiles["clicked"]);

    imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgba(255, 255, 0, 1)", "#yellow canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgba(255, 255, 0, 1)", "#yellow canvas.clicked", imageFiles["clicked"]);

    imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgba(0, 255, 0, 1)", "#green canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgba(0, 255, 0, 1)", "#green canvas.clicked", imageFiles["clicked"]);

    imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgba(255, 255, 255, 1)", "#white canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgba(255, 255, 255, 1)", "#white canvas.clicked", imageFiles["clicked"]);

    /* Keep it different from boundary color */
    imageFiles = this.randomlyPickBlobImage();
    this.setupSinglePalette("rgba(1, 1, 1, 1)", "#black canvas.unclicked", imageFiles["unclicked"]);
    this.setupSinglePalette("rgba(1, 1, 1, 1)", "#black canvas.clicked", imageFiles["clicked"]);

    // Mixing Area
    this.setupSinglePalette("", "#mixing-area-square canvas.deactivated", "styles/mixing_area.png");
    this.setupSinglePalette("", "#mixing-area-square canvas.activated", "styles/mixing_area_dragging.png");
    
    // Now mark the red one clicked.
    $("#palette .clicked").hide();
    $("#palette .unclicked").show();
    $("#palette #red canvas.unclicked").hide();
    $("#palette #red canvas.clicked").show();
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
  	$('.palette-square').draggable({
  		  cursor: 'move',
  		  helper: this.draggedPrimaryClone,
  		});

  	// Droppable properties of the mixing area.
  	// It *only* accepts primary colors.
  	$('#mixing-area-square').droppable({
  	  accept: '.palette-square',
  	  drop: this.handleMixingAreaDropEvent,
  	  activate: this.handleMixingAreaActivateEvent, 
  	  deactivate: this.handleMixingAreaDeactivateEvent, 
  	});

  	// Draggable properties of the mixing area.
  	// Mixing area colors can *only* be dragged onto
  	// secondary color swatches.
  	$('#mixing-area-square').draggable({
    	  start: function(element, ui) {
          $(this).data('draggable').offset.click.left = ui.helper.width() / 2;
          $(this).data('draggable').offset.click.left = ui.helper.height() / 2;
    	  },
  		  cursor: 'move',
  		  helper: this.createMixingAreaDragHelper,
  		});

  	// Droppable properties of the secondary colors.
  	// It *only* accepts color from the mixing area.
  	$('.secondary-palette-square').droppable({
  	  accept: '#mixing-area-square',
  	  drop: this.handleSecondarySwatchDropEvent,
  	  activate: this.handleSecondarySwatchActivateEvent,
    	deactivate: this.handleSecondarySwatchDeactivateEvent,
  	});
  },
  
  draggedPrimaryClone: function(event) {
    var cloneCanvas = event.target.cloneNode();
    // Mark this primary palette as clicked.
    App.onPaletteClick(event);
      
    // copy contents
    var sourceContext = event.target.getContext("2d");    
    var imageData = sourceContext.getImageData(0, 0, sourceContext.canvas.width, sourceContext.canvas.height);
    var cloneContext = cloneCanvas.getContext("2d");
    cloneContext.putImageData(imageData, 0, 0);	
    return cloneCanvas;
  },
  
  // In the event that the primary swatch was clicked:
  // (1) Unsuccessful secondary drop preserves state.
  // (2) Sucessful secondary drop should toggle state in
  //     handleSecondarySwatchDropEvent and Deactivate should preserve that.
  //
  // Event that secondary swatch was already clicked:
  // (1) Activate should keep it clicked.
  // (2) Successful secondary drop should toggle and deactivate should preserve.
  // (3) Unsuccessful secondary drop should have deactivate keep state from (1). 
  handleSecondarySwatchActivateEvent: function(event, ui) { 
    var swatch = $(event.target);  
    swatch.find(".unclicked").hide();
    // If I wasn't already clicked then show me as activated.
    if (swatch.find(".clicked").css("display") == "none") {
      swatch.find(".activated").show();
     }
  },

  handleSecondarySwatchDeactivateEvent: function(event, ui) {
    var swatch = $(event.target);    
    // If I am already clicked, keep me clicked.
    if (swatch.find(".clicked").css("display") == "none") {
      swatch.find(".unclicked").show();
    }
    swatch.find(".activated").hide();
  },

  handleSecondarySwatchDropEvent: function(event, ui) {      
    if ((App.mixingAreaColorList).length == 0) return;
    
    draggable = ui.draggable;
    var swatch = $(event.target); 
    
    // Change the swatch color to be the same as the 
    // mixing area color dropped on to it.
    var draggedColorRgb = draggable.find("canvas").attr("color");
    var draggedColorTuple =  $.xcolor.test(draggedColorRgb);
        
    // Flood-fill all 3 versions of the swatch.
    App.dragAndDropFloodFillHelper(swatch.find("canvas.unclicked"), draggedColorRgb, draggedColorTuple);
    App.dragAndDropFloodFillHelper(swatch.find("canvas.clicked"), draggedColorRgb, draggedColorTuple);
    App.dragAndDropFloodFillHelper(swatch.find("canvas.activated"), draggedColorRgb, draggedColorTuple);
    
    // Mark this secondary palette as clicked.
    // TODO(Neha): Why doesn't this work. Seems like we need event.target
    // instead of currentTarget.
    // App.onPaletteClick(event);
    App.paletteColorTuple = $.xcolor.test(draggedColorRgb);
    $("#palette .clicked").hide();
    $("#palette .unclicked").show();
    swatch.find(".clicked").show();
    swatch.find(".unclicked").hide();
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
    draggable = ui.draggable;

    // Floodfill both activated and deactivated mixing
    // area.
    var draggedColor = draggable.find("canvas").attr("color");
    var mixedColorRgb = Util.returnMixedColorRGB(draggedColor);
    var mixedColorTuple = $.xcolor.test(mixedColorRgb);
    
    // Store the mixed color as an attribute.
    App.dragAndDropFloodFillHelper("#mixing-area-square canvas.deactivated", mixedColorRgb, mixedColorTuple);
    App.dragAndDropFloodFillHelper("#mixing-area-square canvas.activated", mixedColorRgb, mixedColorTuple);
  },
  
  createMixingAreaDragHelper: function(event, ui) {
    var canvas = $(event.currentTarget).find("canvas")[0];
    var mixingAreaClone = event.currentTarget.cloneNode(true);
    $(mixingAreaClone).addClass('smaller-mixing-area');

    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    image.addEventListener("load", function() {
      var cloneContext = $(mixingAreaClone).find("canvas")[0].getContext("2d");
      cloneContext.drawImage(image, 0, 0, $(mixingAreaClone).width(), $(mixingAreaClone).height());
    }, false);

    return mixingAreaClone;
  },
  
  dragAndDropFloodFillHelper: function(canvasId, colorRgb, colorRgbTuple) {
    // Flood fills the canvas with colorRgb. Also stores
    // the colorRgb value as the "color" attribute of the
    // canvas element.
    $(canvasId).attr("color", colorRgb);
    palCanvas = $(canvasId)[0];
    palCtx = palCanvas.getContext('2d'); 
    Util.floodFill(40, 40, palCtx, true /* forPaletteSetUp */,  colorRgbTuple);
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