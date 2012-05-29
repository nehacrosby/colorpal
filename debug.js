Debug = {
  
  // Records the floodfill process in an object like this. It can be replayed
  // to fill out the image exactly with the colors below.
  // [{ x: 280, y: 324, color: "rgb(255, 0, 0)", components: ["rgb(255, 0, 0)"] },
  //  { x: 280, y: 324, color: "rgb(255, 127, 0)", components: ["rgb(255, 0, 0)"] }]
  recordData : [],
  isRecording : false,
  
  onStartRecordButtonClick: function() {
    Debug.isRecording = true;
  },
  
  onStopRecordButtonClick: function() {
    Debug.isRecording = false;
    // var backToJS = JSON.parse(jsonRecordData); 
    var jsonRecordData = JSON.stringify(Debug.recordData)
    console.log("Recorded data:");
    console.log(jsonRecordData);
    Debug.recordData = [];
  },
  
  // The original image should only have black
  // boundary. This method maintains a map of
  // all the colors in the original image and
  // dumps it out to console.log().
  originalImageColors: function(pixelData, canvasHeight, canvasWidth) {
    var colorMap = {};
    // for (var y = 0; y < canvasHeight; ++y) {
    //   for (var x = 0; x < canvasWidth; ++x) {
    //     var offset = pixelOffset(x, y, canvasWidth);
    //     var rgbString = "rgb(" + pixelData[offset] + "," +  pixelData[offset + 1] + "," + pixelData[offset + 2] + ")";
    //     if (rgbString in colorMap)
    //       colorMap[rgbString] = true;
    //       
    //   }
    },
    
    // Attempt to do RYB color-mixing.
    // function returnMixedColorHSL(dragged_color) {
    //       if (mixingAreaColorList.length == 0) {
    //          mixingAreaColorList.push($.xcolor.test(dragged_color));
    //          return dragged_color;
    //        }
    // 
    //        // Do appropriate color mixing.
    //        mixingAreaColorList.push($.xcolor.test(dragged_color));
    //        var h = s = l = 0;
    //        for (var i = 0; i < mixingAreaColorList.length; i++) {
    //              h = h + mixingAreaColorList[i].getHSL()["h"];
    //              s = s + mixingAreaColorList[i].getHSL()["s"];
    //              l = l + mixingAreaColorList[i].getHSL()["l"];
    //          }
    // 
    //         h = Math.floor(h / mixingAreaColorList.length);
    //         s = Math.floor(s / mixingAreaColorList.length);
    //         l = Math.floor(l / mixingAreaColorList.length);
    // 
    //         return $.xcolor.test("hsl(" + h + "," + s + "," + l + ")").getCSS();
    //     }
}