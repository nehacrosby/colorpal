// This library contains methods that modify the dom.

App = {
  init: function() {
    this.imageIndex = 0;
    this.mixingAreaColorList = [];
    // Hard-coded black boundary color.
    this.boundaryColor = $.xcolor.test("rgba(0,0,0,1)");
    this.paletteColorTuple = $.xcolor.test("rgba(255, 0, 0, 1)"); // Red.
    this.eventEnabled = true;
    // This counter is incremented when each palette canvas is drawn.
    // We show the palette container only after all palettes are drawn.
    this.totalPalettesDrawn = 0;
    
    // Add all the click handlers.    
    $("#primary-palette-squares .palette-square").click(jQuery.proxy(this.onPaletteClick, this));
    $("#mixing-area-square").click(jQuery.proxy(this.onMixingAreaClick, this));
  	$('#tutorial').click(jQuery.proxy(this.onCanvasClick, this));
  	$("#clear-mixing-area").click(jQuery.proxy(this.onClearButtonClick, this));
  	$("#drawingScreen .list-button").click(jQuery.proxy(ListView.showImageLibrary, ListView));  
    
  	if (Debug.showColorScreen) {
  	  $("#listScreen").hide();
  	  $("#startScreen").hide(); 
      $("#drawingScreen").show();
      this.loadImage("ladybird");
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
  
  onMixingAreaClick: function(event, ui) {
    // If empty, then do not select the mixing area.
    if (this.mixingAreaColorList.length == 0) return;
    
    // Pick up the color.
    var paletteCanvas = $(event.target);
    this.paletteColorTuple = $.xcolor.test($(paletteCanvas).attr("color"));

    // Toggle the state of all palette squares to only
    // show the clicked one in the clicked state.
    $("#palette .clicked").hide();
    $("#palette .unclicked").show();
    $(event.currentTarget).find(".activated").hide();
    $(event.currentTarget).find(".unclicked").hide();
    $(event.currentTarget).find(".clicked").show();
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
    
  	if (Debug.isRecording) {
      Debug.recordData.push({ x: position.x, y: position.y, color: Util.getRgbString(this.paletteColorTuple.r, this.paletteColorTuple.g, this.paletteColorTuple.b ,1)});
    }
    // Update the score.
   	var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  	var previewImageData = canvasPreviewCtx.getImageData(0, 0, canvasPreviewCtx.canvas.width, canvasPreviewCtx.canvas.height);
  	
  	// !!! DEBUG -- Generate colored image thumbnail !!!
    // var imgSrc = imagePreview.toDataURL("image/png");
    // $('#colored-image').attr('src', imgSrc);
  	// !!! DEBUG !!!
  	
  	// Return if the click happened outside the region that can be colored.
    if (Util.isOutsideRegion(position.x, position.y, previewImageData.data, canvasPreviewCtx.canvas.width)) {
       return;
    }
  	
   	Util.updateCurrentScore(position.x, position.y,
   	                        previewImageData.data, canvasPreviewCtx.canvas.width, 
   	                        imageData.data, ctx.canvas.width);
  	Util.floodFill(position.x, position.y, ctx, false /* forPaletteSetUp */, this.paletteColorTuple);
  	// Get the updated imageData.
    var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);    
   	this.displayCurrentScore();

   	// Check if the user is done coloring the entire image.                   
    if (DrawingPreview.isSameAsPreviewImage(
                 imageData.data, ctx.canvas.width, ImageLibrary[App.imageIndex].jsonRecordedData)) {
         Transition.handleCompletionAnimation();
     }
  },
  
  onClearButtonClick: function() {
    if (!this.eventEnabled) return;
    
    // Clear the mixing area.
    var mixedColorRgb = "rgba(255, 255, 255)";
    var mixedColorTuple = $.xcolor.test(mixedColorRgb);
    App.dragAndDropFloodFillHelper("#mixing-area-square canvas.unclicked", mixedColorRgb, mixedColorTuple);
    App.dragAndDropFloodFillHelper("#mixing-area-square canvas.activated", mixedColorRgb, mixedColorTuple);    
    App.dragAndDropFloodFillHelper("#mixing-area-square canvas.clicked", mixedColorRgb, mixedColorTuple);    
    this.mixingAreaColorList = [];
    
    // If the mixing area was clicked then unclick it and 
    // select red as default like we do at the beginning of the game.
    if ($("#mixing-area-square canvas.clicked").css("display") != "none") {
      $("#mixing-area-square .clicked").hide();
      $("#mixing-area-square .unclicked").show();
      $("#palette #red canvas.unclicked").hide();
      $("#palette #red canvas.clicked").show();
      this.paletteColorTuple = $.xcolor.test("rgba(255, 0, 0, 1)"); // Red.
    }
  },
  
  getMouseClickCoordinates: function(event) {        
    // Get x, y coordinates of the mouse-click.
    // Taken from:
    // http://stackoverflow.com/questions/1114465/getting-mouse-location-in-canvas
    var targ = event.currentTarget;
    var x = Math.floor(event.pageX - $(targ).offset().left);
    var y = Math.floor(event.pageY - $(targ).offset().top);
    return {"x": x, "y": y};
  },
  
  // Clears all state and prepares the new drawing to be colored.
  resetPage: function() {
    // Hide the current-score until we are done resetting it and
    // re-calculating the new total score.
    $('#current-score').hide();
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
    this.totalPalettesDrawn = 0; // Show only after the palette canvases have been drawn.
    UserPrefs.resetCurrentScore();  // Reset the current score.
    $('#palette').hide();  
    $('#image-preview-container').show();
  },

  loadImage: function(imageName) {  
    // Prepare the drawing screen by clearing previous  
    // state.
    this.resetPage();    
    var image = new Image();
  	image.src = Util.getDrawingTodoFilename(imageName);
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
  	App.imageIndex = Util.getImageIndexInImageLibrary(Util.getImageNameFromImageFilename($(image).attr("src")));
    
    // Display the filled in preview image.
    DrawingPreview.displayPreviewImage(ImageLibrary[App.imageIndex].jsonRecordedData, canvasPreviewCtx);
    this.displayCurrentScore();
  	
  	// Initial selected color.
    this.paletteColorTuple = $.xcolor.test("rgba(255, 0, 0, 1)"); // Red.
        
    // Set up palette canvases.
    this.setupPaletteCanvases();
  },
  
  displayCurrentScore: function() {
    $("#current-score .score").html(UserPrefs.getCurrentScore());
    $("#current-score .max-score").html(Util.getMaxScoreForImage(App.imageIndex));
    $('#current-score').show();
  },
  
  randomlyPickBlobImage: function() {
    if ((Math.random()*1) <= 0.5) {
      return {"unclicked" : "images/blob1.png",
              "clicked" : "images/blob1_selected.png",
              "dragged" : "images/blob1_dragging.png"};
    } else {
       return {"unclicked" : "images/blob2.png",
                "clicked" : "images/blob2_selected.png",
                "dragged" : "images/blob2_dragging.png"};
    }
  },
  
  setupPaletteCanvases: function() {    
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
    this.setupSinglePalette("", "#mixing-area-square canvas.unclicked", "images/mixing_area.png");
    this.setupSinglePalette("", "#mixing-area-square canvas.activated", "images/mixing_area_dragging.png");
    this.setupSinglePalette("", "#mixing-area-square canvas.clicked", "images/mixing_area_selected.png");
    
    // Now mark the red one clicked.
    $("#palette .clicked").hide();
    $("#palette .unclicked").show();
    $("#palette #red canvas.unclicked").hide();
    $("#palette #red canvas.clicked").show();
  },
  
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
      App.paletteSquareDrawingComplete();
    }     
    image.src = imageFile;
  },
  
  paletteSquareDrawingComplete: function() {
    this.totalPalettesDrawn = this.totalPalettesDrawn + 1;
    
    if (this.totalPalettesDrawn >= 13) {
      $('#palette').show();
    }
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
  	// Once the color is dropped, the mixed
  	// color is ready to be used to fill the drawing image.
  	$('#mixing-area-square').droppable({
  	  accept: '.palette-square',
  	  drop: this.handleMixingAreaDropEvent,
  	  activate: this.handleMixingAreaActivateEvent, 
  	  deactivate: this.handleMixingAreaDeactivateEvent, 
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

  handleMixingAreaActivateEvent: function(event, ui) {      
    $(event.target).find(".unclicked").css("display", "none");
    $(event.target).find(".activated").css("display", "");      
  },

  handleMixingAreaDeactivateEvent: function(event, ui) {    
    $(event.target).find(".activated").css("display", "none");
    if ($(event.target).find(".clicked").css("display") == "none") {
      $(event.target).find(".unclicked").css("display", "");
    }
  },

  handleMixingAreaDropEvent: function(event, ui) {    
    draggable = ui.draggable;

    // Floodfill activated, unclicked and clicked mixing
    // areas.
    var draggedColor = draggable.find("canvas").attr("color");
    var mixedColorRgb = Util.returnMixedColorRGB(draggedColor);
    var mixedColorTuple = $.xcolor.test(mixedColorRgb);
    
    // Store the mixed color as an attribute.
    App.dragAndDropFloodFillHelper("#mixing-area-square canvas.unclicked", mixedColorRgb, mixedColorTuple);
    App.dragAndDropFloodFillHelper("#mixing-area-square canvas.activated", mixedColorRgb, mixedColorTuple);
    App.dragAndDropFloodFillHelper("#mixing-area-square canvas.clicked", mixedColorRgb, mixedColorTuple);
    
    // Mark this cell as clicked.
    App.paletteColorTuple = mixedColorTuple;
    $("#primary-palette-squares .clicked").hide();
    $("#primary-palette-squares .unclicked").show();
    $("#mixing-area-square .activated").hide();
    $("#mixing-area-square .unclicked").hide();
    $("#mixing-area-square .clicked").show();
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