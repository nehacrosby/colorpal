// This library contains all the data that needs to be 
// stored across multiple user sessions as well as the logic for 
// reading/writing cookies.

UserPrefs = {
  // Private data structure not to be accessed directly
  // outside this library.
  userData: {
    // Map from image/video filename that the user has 
    // colored/watched already to boolean (true). 
    coloredImages: {}, 
    // User's total score so far across all images.
    totalScore: 0,
    // User's current score for this image.
    currentScore: 0
  },
  
  init: function() {
    // Cookie name
    this.name = 'user_progress';
    // Sometime far into the future.
    this.expiration_days = 365 * 20;
    // entire domain
    this.path = '/';
    
    // Always start from the beginning.
    this.resetCurrentScore();
   },  
  
  // Public API. Used to update coloredImages.
  saveCompletedImage: function(imageFilename) {
    this.loadUserData();
    this.userData.coloredImages[imageFilename] = true;
    this.saveUserData();
  },
  
  // Public API. Used to get coloredImages.
  getColoredImages: function() {
    this.loadUserData();
    return this.userData.coloredImages;
  },
  
  // Public API. 
  updateCurrentScore: function(incrementByNumber) {
    this.loadUserData();
    this.userData.currentScore += incrementByNumber;
    this.saveUserData();
  },
  
  // Public API. 
  updateTotalScore: function(incrementByNumber) {
    this.loadUserData();
    this.userData.totalScore += incrementByNumber;
    this.saveUserData();
  },
  
  // Public API. 
  getTotalScore: function() {
    this.loadUserData();
    return this.userData.totalScore;
  },
  
  // Public API. 
  getCurrentScore: function() {
    this.loadUserData();
    return this.userData.currentScore;
  },
  
  // // Public API. Reset current score.
  resetCurrentScore: function() {
    this.loadUserData();
    this.userData.currentScore = 0;
    this.saveUserData();
  },
  
  // Private: Helper method not to be called from outside
  // this library.
  saveUserData: function (path) { 
    var data = escape(JSON.stringify(this.userData));
    $.cookie(this.name, data, { expires: this.expiration_days, path: this.path });
  },
  
  // Private: Helper method not to be called from outside
  // this library.
  loadUserData: function () {
    var data = $.cookie(this.name);
    if (data) {
      this.userData = JSON.parse(unescape(data));
    } 
  },
}