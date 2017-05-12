// Scale-corner.js - Styles

var style = AUR.import("aur-styles");

AUR.onLoaded("../style-defs", function() {
  var styleDefs = AUR.import("../style-defs");
  
  var scalingCornerSize = styleDefs.scalingCornerSize;
  var scalingCornerPadding = styleDefs.scalingCornerPadding;
  var scalingCornerLineWidth = styleDefs.scalingCornerLineWidth;
  var scalingCornerColor = styleDefs.scalingCornerColor;
  
  style.styleBlock(`
    // CORNER RESIZING
    
    // Animated stuff
    .aur-lo-scaling-corners-wrap.aur-lo-corners-animated .aur-lo-scaling-corner {
      transition: opacity 150ms ease-out, left 250ms cubic-bezier(.33,.04,.14,.99), top 250ms cubic-bezier(.33,.04,.14,.99);
    }
    
    .aur-lo-scaling-corners-wrap.aur-lo-scalecorners-disabled .aur-lo-scaling-corner {
      opacity: 0 !important;
      pointer-events: none !important;
    }
    
    .aur-lo-scaling-corner {
      position: absolute;
      width: ${ scalingCornerSize }px;
      height: ${ scalingCornerSize }px;
      transition: opacity 150ms ease-out;
      box-sizing: content-box;
    }
    
    .aur-lo-scaling-corner::before,
    .aur-lo-scaling-corner::after {
      content: "";
      position: absolute;
      background: #FF5F20;
    }
    
    .aur-lo-scaling-corner.aur-lo-scaling-corner-left {
      margin-left: -${ scalingCornerPadding }px;
      padding-left: ${ scalingCornerPadding }px;
    }
    
    .aur-lo-scaling-corner.aur-lo-scaling-corner-right {
      margin-left: -${ scalingCornerSize }px;
      padding-right: ${ scalingCornerPadding }px;
    }
    
    .aur-lo-scaling-corner.aur-lo-scaling-corner-top {
      margin-top: -${ scalingCornerPadding }px;
      padding-top: ${ scalingCornerPadding }px;
    }
    
    .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom {
      margin-top: -${ scalingCornerSize }px;
      padding-bottom: ${ scalingCornerPadding }px;
    }
    
    .aur-lo-scaling-corner.aur-lo-scaling-corner-left::before,
    .aur-lo-scaling-corner.aur-lo-scaling-corner-left::after {
      left: ${ scalingCornerPadding }px;
    }
    
    .aur-lo-scaling-corner.aur-lo-scaling-corner-top::before,
    .aur-lo-scaling-corner.aur-lo-scaling-corner-top::after {
      top: ${ scalingCornerPadding }px;
    }
    
    .aur-lo-scaling-corner.aur-lo-scaling-corner-right::before,
    .aur-lo-scaling-corner.aur-lo-scaling-corner-right::after {
      right: ${ scalingCornerPadding }px;
    }
    
    .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom::before,
    .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom::after {
      bottom: ${ scalingCornerPadding }px;
    }
    
    .aur-lo-scaling-corner.aur-lo-scaling-corner-top::before,
    .aur-lo-scaling-corner.aur-lo-scaling-corner-top::after {
      top: ${ scalingCornerPadding }px;
    }
    
    // Top left-right corner
    .aur-lo-scaling-corner.aur-lo-scaling-corner-top.aur-lo-scaling-corner-left::before,
    .aur-lo-scaling-corner.aur-lo-scaling-corner-top.aur-lo-scaling-corner-right::before {
      width: ${ scalingCornerLineWidth }px;
      bottom: 0px;
    }
    
    // Bottom left-right corners
    .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom.aur-lo-scaling-corner-left::before,
    .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom.aur-lo-scaling-corner-right::before {
      width: ${ scalingCornerLineWidth }px;
      top: 0px;
    }
    
    // Left top-bottom corners
    .aur-lo-scaling-corner.aur-lo-scaling-corner-top.aur-lo-scaling-corner-left::after,
    .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom.aur-lo-scaling-corner-left::after {
      height: ${ scalingCornerLineWidth }px;
      right: 0px;
    }
    
    // Right top-bottom corners
    .aur-lo-scaling-corner.aur-lo-scaling-corner-top.aur-lo-scaling-corner-right::after,
    .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom.aur-lo-scaling-corner-right::after {
      height: ${ scalingCornerLineWidth }px;
      left: 0px;
    }
  `);
});
