// Scale-rect-guide.js - Styles

var style = AUR.import("aur-styles");

style.styleBlock(`
  .aur-lo-scale-rect-guide {
    // Nothing here...
    box-sizing: content-box;
  }
  
  .aur-lo-scale-rect-guide-cbox {
    position: fixed;
    // z-index: 10000000000;
    
    opacity: 0.5;
    transition: opacity 150ms ease-out;
    cursor: pointer;
    box-sizing: content-box;
  }
  
  .aur-lo-scale-rect-guide:hover .aur-lo-scale-rect-guide-cbox {
    opacity: 1;
  }
  
  .aur-lo-scale-rect-guide.aur-lo-rect-animated .aur-lo-scale-rect-guide-cbox {
    transition: opacity 150ms ease-out, left 250ms cubic-bezier(.33,.04,.14,.99), top 250ms cubic-bezier(.33,.04,.14,.99);
  }
  
  .aur-lo-scale-rect-guide.aur-lo-scalemove-disabled .aur-lo-scale-rect-guide-cbox {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  
  .aur-lo-scale-rect-guide-cbox::before {
    content: "";
    position: absolute;
    background: #20BFFF;
  }
  
  .aur-lo-scale-h {
    // height: 8px;
    height: 16px;
    padding: 0px 7px;
  }
  
  .aur-lo-scale-v {
    width: 16px;
    padding: 7px 0px;
  }
  
  .aur-lo-scale-h.aur-lo-scale-top {
    margin-top: -7px;
    margin-left: -7px;
  }
  
  .aur-lo-scale-h.aur-lo-scale-bottom {
    margin-top: -9px;
    margin-left: -7px;
  }
  
  .aur-lo-scale-v.aur-lo-scale-left {
    margin-top: -7px;
    margin-left: -7px;
  }
  
  .aur-lo-scale-v.aur-lo-scale-right {
    margin-top: -7px;
    margin-left: -9px;
  }
  
  .aur-lo-scale-h::before {
    margin: 0px 9px;
    right: 0px;
    left: 0px;
    top: 7px;
    height: 2px;
  }
  
  .aur-lo-scale-v::before {
    margin: 7px 0px;
    top: 0px;
    bottom: 0px;
    left: 7px;
    width: 2px;
  }
  
  // Clickboxes Captions
  .aur-lo-scale-v::after {
    content: attr(data-rect-scale);
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 13px;
    height: 20px;
    margin: auto 0px;
    
    color: #20BFFF;
    font-size: 16px;
    font-weight: bold;
    line-height: 20px;
    text-align: right;
  }
  
  .aur-lo-scale-v.aur-lo-scale-left::after {
    right: auto;
    left: 13px;
  }
`);
