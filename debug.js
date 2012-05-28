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
    console.log("Recorded data:");
    console.log(Debug.recordData);
    Debug.recordData = [];
  },
}