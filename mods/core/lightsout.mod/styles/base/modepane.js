// Modepane.js - Styles

var style = AUR.import("aur-styles");

AUR.onLoaded("../style-defs", function() {
  var styleDefs = AUR.import("../style-defs");
  
  var defZInd = styleDefs.defZInd;
  var defVisibleAnim = styleDefs.defVisibleAnim;
  
  style.styleBlock(`
    .aur-lo-modepane {
      z-index: ${ defZInd };
      position: fixed;
      top: 100%;
      left: 0px;
      width: 100%;
      height: 100%;
      opacity: 1;
      transition: opacity ${ defVisibleAnim };
    }
    
    .aur-lo-modepane.aur-lo-disabled {
      opacity: 0;
      pointer-events: none;
    }
    
    .aur-lo-modepane-view {
      position: absolute;
      left: -200%;
      bottom: 100%;
      width: 100%;
      opacity: 0;
      transform: translate(0px, 50px);
    }
    
    .aur-lo-modepane-view.aur-lo-active {
      left: 0%;
      opacity: 1;
      transform: translate(0px, 0px);
    }
    
    .aur-lo-modepane-view.aur-lo-animated {
      transition: opacity ${ defVisibleAnim }, transform ${ defVisibleAnim }, left 0ms linear 360ms;
    }
    
    .aur-lo-modepane-view.aur-lo-active.aur-lo-animated {
      transition: opacity ${ defVisibleAnim }, transform ${ defVisibleAnim }, left 0ms linear 0ms;
    }
  `);
});
