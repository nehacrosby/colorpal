Debug = {
  // Records the floodfill process in an object like this. It can be replayed
  // to fill out the image exactly with the colors below.
  // [{ x: 280, y: 324, color: "rgb(255, 0, 0)", components: ["rgb(255, 0, 0)"] },
  //  { x: 280, y: 324, color: "rgb(255, 127, 0)", components: ["rgb(255, 0, 0)"] }]
  recordData : [],
  isRecording : false,
  showListView: true,
  
  init: function() {
    this.eventEnabled = true;
      
    // Debug handlers.
    $("button[name=start-recording-action]").click(jQuery.proxy(this.onStartRecordButtonClick, this));
    $("button[name=stop-recording-action]").click(jQuery.proxy(this.onStopRecordButtonClick, this));
  },
  
  onStartRecordButtonClick: function() {
    if (!this.eventEnabled) return;
    
    Debug.isRecording = true;
  },
  
  onStopRecordButtonClick: function() {
    if (!this.eventEnabled) return;
    
    Debug.isRecording = false;
    var jsonRecordData = JSON.stringify(Debug.recordData)
    console.log("Recorded data:");
    console.log(jsonRecordData);
    Debug.recordData = [];
  },

}