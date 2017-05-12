// Actionbar.js - Styles

var style = AUR.import("aur-styles");

AUR.onLoaded("../style-defs", function() {
  var styleDefs = AUR.import("../style-defs");
  
  var defZInd = styleDefs.defZInd;
  var defMntAnim = styleDefs.defMntAnim;
  
  var defBG = styleDefs.defBG;
  var defCol = styleDefs.defCol;
  var defColLight = styleDefs.defColLight;
  var defColLighter = styleDefs.defColLighter;
  var defColNone = styleDefs.defColNone;
  
  var defABCapOff = styleDefs.defABCapOff;
  var defABRad = styleDefs.defABRad;
  var defABAnim = styleDefs.defABAnim;
  var defABAnimSemiSlow = styleDefs.defABAnimSemiSlow;
  var defABAnimSlow = styleDefs.defABAnimSlow;
  var defABBtnWidth = styleDefs.defABBtnWidth;
  
  // Actionbar
  var defABBtnToggle = styleDefs.defABBtnToggle;
  var defABBtnTextToggle = styleDefs.defABBtnTextToggle;
  
  var defVisibleAnim = styleDefs.defVisibleAnim;
  var defVisibleAnimSlow = styleDefs.defVisibleAnimSlow;
  
  style.styleBlock(`
    .aur-lo-actionbar-capture {
      padding-left: ${ defABCapOff };
      margin-top: 100px !important;
      margin-bottom: 100px !important;
    }
    
    .aur-lo-actionbar-capture,
    .aur-lo-actionbar,
    .aur-lo-actbar-button-titles {
      z-index: ${ defZInd };
      position: fixed;
      right: 0px;
      top: 0px;
      bottom: 0px;
      margin-top: auto;
      margin-bottom: auto;
    }
    
    .aur-lo-actionbar-capture.aur-lo-disabled,
    .aur-lo-actionbar.aur-lo-disabled {
      pointer-events: none;
    }
    
    .aur-lo-actionbar-proxy {
      position: absolute;
      height: 100%;
      width: 100%;
      
      transform: translate(50%, 0%);
      transition: transform ${ defVisibleAnimSlow } 50ms;
    }
    
    .aur-lo-actionbar.aur-lo-visible .aur-lo-actionbar-proxy {
      transform: translate(0%, 0%);
    }
    
    .aur-lo-actionbar {
      border-top-left-radius: ${ defABRad };
      border-bottom-left-radius: ${ defABRad };
      
      background: ${ defBG };
      border: 0px;
      border-left: 1px solid ${ defCol };
      border-top: 1px solid ${ defCol };
      border-bottom: 1px solid ${ defCol };
      
      opacity: 0;
      overflow: hidden;
      transform: translate(100%, 0%);
      transition: opacity ${ defVisibleAnim }, transform ${ defVisibleAnim }, height ${ defABAnim };
    }
    
    .aur-lo-actionbar.aur-lo-visible {
      transform: translate(0%, 0%);
      opacity: 1;
    }
    
    .aur-lo-actbar-wrap {
      position: absolute;
      right: 0px;
      top: 50%; /* To maintain the coolness in the transition */
      transform: translate(100%, -50%);
      transition: transform ${ defABAnim };
    }
    
    .aur-lo-actbar-wrap.aur-lo-visible {
      transform: translate(0%, -50%);
    }
    
    .aur-lo-actbar-wrap.aur-lo-slideout {
      transform: translate(-100%, -50%) !important;
    }
    
    .aur-lo-actbar-wrap.aur-lo-default {
      transition: transform 0ms linear !important;
      transform: translate(100%, -50%) !important;
    }
    
    // Buttons
    
    .aur-lo-actbar-button.aur-lo-actbar-button-logo svg {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(0.75, 0.75) !important;
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button {
      position: relative;
      margin-bottom: 1px; /* For border effect */
      user-select: none;
      -webkit-user-select: none;
      opacity: 1;
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button.aur-lo-actbar-button-disable-anim {
      transition: background 150ms ease-out, height 0ms linear, opacity 0ms linear !important;
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button.aur-lo-actbar-button-hidden {
      opacity: 0 !important;
      height: 0px !important;
      margin-bottom: 0px !important;
      pointer-events: none !important;
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button-input {
      cursor: pointer;
      background: ${ defColNone };
      transition: background 150ms ease-out, height ${ defABAnim }, opacity ${ defABAnim };
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button-input.aur-lo-actbar-button-disabled:not(.aur-lo-actbar-button-hidden) {
      opacity: 0.65 !important;
      background: ${ defColNone } !important;
      cursor: default !important;
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button-inner-wrap {
      position: absolute;
      top: 0px;
      right: 0px;
      bottom: 0px;
      left: 0px;
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button-input * {
      cursor: pointer !important;
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button-input.aur-lo-actbar-button-disabled:not(.aur-lo-actbar-button-hidden) * {
      cursor: default !important;
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button-input:hover {
      background: ${ defColLighter };
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button.disabled .aur-lo-actbar-button-content {
      opacity: 0.35;
      pointer-events: none;
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button .aur-lo-actbar-button-content {
      position: absolute;
      top: 50%;
      left: 50%;
      
      transform: translate(-50%, -50%);
    }
    
    // Button SVG type
    .aur-lo-actbar-wrap .aur-lo-actbar-button svg path.aur-lo-svg-toggle {
      transition: fill ${ defABAnimSlow };
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button.aur-lo-actbar-button-active svg path.aur-lo-svg-toggle {
      fill: ${ defABBtnToggle } !important;
    }
    
    // Button text type
    .aur-lo-actbar-wrap .aur-lo-actbar-button .aur-lo-actbar-button-text {
      display: inline-block;
      color: ${ defCol };
      
      letter-spacing: 0.1em;
      font-family: Arial;
      font-size: 11px;
      font-weight: bold;
      cursor: default;
      
      transition: color ${ defABAnimSlow };
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button.aur-lo-actbar-button-active .aur-lo-actbar-button-text {
      color: ${ defABBtnTextToggle };
    }
    
    // Bottom button border
    .aur-lo-actbar-wrap .aur-lo-actbar-button::after {
      content: "";
      position: absolute;
      right: 0px;
      bottom: -1px;
      height: 1px;
      width: ${ defABBtnWidth };
      background: ${ defColLight };
    }
    
    // Last button
    .aur-lo-actbar-wrap .aur-lo-actbar-button:last-child {
      margin-bottom: 0px;
    }
    
    .aur-lo-actbar-wrap .aur-lo-actbar-button:last-child::after {
      content: unset !important;
    }
    
    // BUTTON TITLES
    
    .aur-lo-actbar-button-titles {
      width: 100%;
      height: 0px;
      pointer-events: none;
    }
    
    .aur-lo-actbar-button-titles .aur-lo-actbar-button-title {
      position: absolute;
      display: block;
      right: 0px;
      height: 35px;
      padding: 0px 7px;
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
      width: auto;
      
      font-size: 16px;
      border-left: 1px solid rgba(255, 255, 255, 0.5);
      background: rgba(0, 0, 0, 0.65);
      color: rgba(255, 255, 255, 0.85);
      line-height: 35px;
      opacity: 0;
      transform: translate(-25px, -50%);
      pointer-events: none;
      text-align: left;
      
      transition: opacity ${ defVisibleAnim }, transform ${ defVisibleAnim };
    }
    
    .aur-lo-actbar-button-titles .aur-lo-actbar-button-title.aur-lo-visible {
      opacity: 0.95;
      transform: translate(-10px, -50%);
    }
  `);
});
