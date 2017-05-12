// Overlay.js - Styles

var style = AUR.import("aur-styles");

AUR.onLoaded("../style-defs", function() {
  var styleDefs = AUR.import("../style-defs");
  var defMntAnim = styleDefs.defMntAnim;
  
  style.styleBlock(`
    .aur-lo-overlay-main {
      z-index: 10000;
      position: fixed;
      left: 0px;
      top: 0px;
      right: 0px;
      bottom: 0px;
      background: #000;
      opacity: 0;
      // background: rgba(0, 0, 0, 0);
    }
    
    .aur-lo-overlay-main.aur-lo-clickthru {
      pointer-events: none;
    }
    
    .aur-lo-overlay-main.aur-lo-active-anim {
      transition: opacity ${ defMntAnim };
    }
  `);
});
