// Shadebar.js - Styles

var style = AUR.import("aur-styles");

AUR.onLoaded("../style-defs", function() {
  var styleDefs = AUR.import("../style-defs");
  
  var shadeBarTextInputWidth = styleDefs.shadeBarTextInputWidth;
  var shadeBarTextInputOffset = styleDefs.shadeBarTextInputOffset;
  var defShadeBG = styleDefs.defShadeBG;
  var defShadeBorder = styleDefs.defShadeBorder;
  var defShadeBorderLight = styleDefs.defShadeBorderLight;
  
  style.styleBlock(`
    .aur-lo-shade-bar {
      position: absolute;
      left: 0px;
      right: ${ shadeBarTextInputOffset + shadeBarTextInputWidth + 2 }px;
      margin: 0px auto;
      bottom: 100px;
      // Width is dynamic, and computer above
    }
    
    .aur-lo-shade-bar-trough .aur-lo-shade-bar-scrubber {
      position: absolute;
      top: 0px;
      left: 0px;
      // Height and width dynamic, and computed above
      background: #fff;
      opacity: 0.75;
    }
    
    .aur-lo-shade-bar-trough,
    .aur-lo-shade-bar-text-input {
      display: inline-block;
      vertical-align: top;
    }
    
    .aur-lo-shade-bar-trough {
      position: relative;
      margin-right: ${ shadeBarTextInputOffset }px;
      // Height and width dynamic, and computed above
      background: ${ defShadeBG };
      border: ${ defShadeBorder };
    }
    
    .aur-lo-shade-bar-trough .aur-lo-shade-bar-start,
    .aur-lo-shade-bar-trough .aur-lo-shade-bar-end {
      position: absolute;
      top: 0px;
      bottom: 0px;
      
      color: rgba(255, 255, 255, 0.25);
      font-size: 16px;
      font-family: Arial;
      text-align: center;
      // line-height dynamic and computed above
      // opacity: 0.25;
      text-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5);
      
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
    }
    
    .aur-lo-shade-bar-trough .aur-lo-shade-bar-start {
      left: 25px;
    }
    
    .aur-lo-shade-bar-trough .aur-lo-shade-bar-end {
      right: 25px;
    }
    
    .aur-lo-shade-bar-text-input {
      position: absolute;
      bottom: 0px;
      left: 100%;
      margin-left: ${ shadeBarTextInputOffset }px;
    }
    
    .aur-lo-shade-bar-text-input input.lces.lces-numberfield {
      width: ${ shadeBarTextInputWidth }px !important;
      // Height dynamic and computed above
      box-sizing: border-box;
      border-radius: 0px;
      
      font-size: 27px;
      font-weight: normal;
      color: rgba(255, 255, 255, 0.75);
      line-height: 80px;
      text-align: center;
      background: ${ defShadeBG };
      border: ${ defShadeBorder };
    }
  `);
});
