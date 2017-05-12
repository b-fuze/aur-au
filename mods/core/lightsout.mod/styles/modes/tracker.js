// Scale-corner.js - Styles

var style = AUR.import("aur-styles");

AUR.onLoaded("../style-defs", function() {
  var styleDefs = AUR.import("../style-defs");
  
  var epTrackerWidth = styleDefs.epTrackerWidth;
  var epTrackerCardWidth = styleDefs.epTrackerCardWidth;
  var epTrackerCardHeight = styleDefs.epTrackerCardHeight;
  var epTrackerCardCapHeight = styleDefs.epTrackerCardCapHeight;
  var epTrackerCardInnerRadius = styleDefs.epTrackerCardInnerRadius;
  var epTrackerMaxDistance = styleDefs.epTrackerMaxDistance;
  var defShadeBG = styleDefs.defShadeBG;
  var defShadeBorder = styleDefs.defShadeBorder;
  var defShadeBorderLight = styleDefs.defShadeBorderLight;
  
  style.styleBlock(`
    // EPISODE TRACKER
    
    .aur-lo-episode-tracker-main {
      box-sizing: border-box;
      border-right: ${ defShadeBorderLight };
      
      text-align: left;
    }
    
    .aur-lo-eptracker-title {
      position: relative;
      padding: 25px 15px;
      padding-bottom: 35px;
      margin: 0px;
      margin-bottom: 0px;
      
      line-height: 30px;
      font-family: Roboto, Arial;
      font-size: 25px;
      font-weight: normal;
      color: rgba(255, 255, 255, 0.75);
    }
    
    // Close tracker button
    .aur-lo-eptracker-title .aur-lo-eptracker-close {
      position: absolute;
      width: 30px;
      height: 30px;
      top: 0px;
      bottom: 0px;
      right: 25px;
      margin: auto 0px;
      
      opacity: 0.5;
      cursor: pointer;
    }
    
    .aur-lo-eptracker-title .aur-lo-eptracker-close:hover {
      opacity: 0.75;
    }
    
    .aur-lo-eptracker-title .aur-lo-eptracker-close svg path {
      fill: #fff;
    }
    
    // Bulk actions tip
    .aur-lo-eptracker-title .aur-lo-tip {
      position: absolute;
      left: 15px;
      bottom: 20px;
      height: 15px;
      
      line-height: 15px;
      font-size: 12px;
      font-family: Arial;
      font-style: italic;
      color: #fff;
      opacity: 0.4;
    }
    
    .aur-lo-eptracker-input {
      position: relative;
      height: 50px;
      padding: 0px 5px;
      margin-left: 1px;
      margin-bottom: 10px;
      overflow: hidden;
      
      font-size: 0px;
      line-height: 50px;
      border-top: ${ defShadeBorderLight };
      border-bottom: ${ defShadeBorderLight };
      text-align: right;
    }
    
    .aur-lo-eptracker-input-separator {
      display: inline-block;
      vertical-align: middle;
      margin: 0px 5px;
      width: 0px;
      height: 100%;
      border-left: ${ defShadeBorderLight };
      opacity: 0.65;
    }
    
    .aur-lo-eptracker-input button {
      vertical-align: middle;
      margin: 0px 5px;
      padding: 5px 10px;
      border-radius: 3px;
      border: ${ defShadeBorderLight };
      
      font-family: Arial;
      font-size: 15px;
      color: rgba(255, 255, 255, 0.75);
      background: rgba(255, 255, 255, 0.05);
      
      transition: color 150ms ease-out, background 150ms ease-out;
      cursor: pointer;
    }
    
    .aur-lo-eptracker-input button:hover {
      color: rgba(255, 255, 255, 1);
      background: rgba(255, 255, 255, 0.15);
    }
    
    .aur-lo-eptracker-input .aur-lo-episode-caption {
      position: absolute;
      top: 0px;
      left: 15px;
      
      font-size: 18px;
      line-height: 50px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    // TRACKER CARD GROUPS
    .aur-lo-eptracker-card-render-group {
      display: inline;
    }
    
    // TRACKER CARDS
    
    .aur-lo-eptracker-cards-scroll {
      position: absolute;
      top: 132px;
      left: 0px;
      right: 0px;
      bottom: 0px;
    }
    
    .aur-lo-eptracker-cards-scroll.aur-lo-eptracker-loading::before {
      content: "";
      position: absolute;
      width: 48px;
      height: 48px;
      left: 0px;
      top: 0px;
      right: 0px;
      bottom: 0px;
      margin: auto;
      display: block;
      
      background: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024.000001%2024.000001%22%3E%3Cpath%20d%3D%22M6.83%205.906C5.038%207.424%204.003%209.652%204%2012c0%204.418%203.582%208%208%208s8-3.582%208-8c0-2.346-1.03-4.574-2.818-6.094%22%20fill%3D%22none%22%20stroke%3D%22%2320bfff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22square%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M17.367%204.992a1.5%201.5%200%200%200-.797-1.306C15.193%202.928%2013.627%202.5%2012%202.5h-.002c-1.624.002-3.185.43-4.56%201.186a1.5%201.5%200%201%200%201.447%202.628C9.838%205.79%2010.902%205.502%2012%205.5h.002c1.1%200%202.168.29%203.123.814a1.5%201.5%200%200%200%202.242-1.322z%22%20style%3D%22line-height%3Anormal%3Btext-indent%3A0%3Btext-align%3Astart%3Btext-decoration-line%3Anone%3Btext-decoration-style%3Asolid%3Btext-decoration-color%3A%23000000%3Btext-transform%3Anone%3Bblock-progression%3Atb%3Bisolation%3Aauto%3Bmix-blend-mode%3Anormal%22%20color%3D%22%23000%22%20font-family%3D%22sans-serif%22%20white-space%3D%22normal%22%20overflow%3D%22visible%22%20solid-color%3D%22%23000000%22%20fill%3D%22%23fff%22%2F%3E%3C%2Fsvg%3E') no-repeat;
      background-size: 100% 100%;
      background-position: 50% 50%;
      
      animation-duration: 1.5s;
      animation-name: aur-lo-eptracker-loader;
      animation-iteration-count: infinite;
      animation-timing-function: cubic-bezier(.31,.26,.26,.8);
    }
    
    @keyframes aur-lo-eptracker-loader {
      0% {
        transform: scale(0.5, 0.5) rotate(0deg);
      }
      
      55% {
        transform: scale(1, 1) rotate(360deg);
      }
      
      100% {
        transform: scale(0.5, 0.5) rotate(720deg);
      }
    }
    
    .aur-lo-eptracker-cards-wrap {
      position: absolute;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      padding: 15px;
      
      text-align: left;
    }
    
    .aur-lo-eptracker-card-placeholder {
      display: inline-block;
      overflow: hidden;
      margin: 15px;
      width: ${ epTrackerCardWidth }px;
      height: ${ epTrackerCardHeight }px;
      
      border-radius: 10px;
      background: #0D0D0D;
      border: 2px solid #0D0D0D;
    }
    
    .aur-lo-eptracker-card-placeholder.aur-lo-selected {
      border-color: #20BFFF;
    }
    
    .aur-lo-eptracker-card-placeholder::before {
      content: attr(data-ep-num);
      display: block;
      margin: 35px 0px 0px 8px;
      
      font-size: 67px;
      font-family: "Trebuchet MS";
      color: rgba(255, 255, 255, 0.6);
    }
    
    .aur-lo-eptracker-card-placeholder.aur-lo-current::before {
      color: #20BFFF;
    }
    
    .aur-lo-eptracker-card-wrap {
      position: relative;
      display: inline-block;
      margin: 15px 15px;
      width: ${ epTrackerCardWidth }px;
      height: ${ epTrackerCardHeight }px;
      
      border-radius: 10px;
      border: 2px solid #2E2E2E;
      
      overflow: hidden;
      cursor: pointer;
    }
    
    .aur-lo-eptracker-card-wrap.aur-lo-selected {
      // border-color: #ddd;
      border-color: #20BFFF;
    }
    
    .aur-lo-eptracker-card-inner {
      position: relative;
      display: inline-block;
      box-sizing: border-box;
      width: ${ epTrackerCardWidth }px;
      height: ${ epTrackerCardHeight }px;
      
      border-radius: 0px;
      border: 0px solid #2E2E2E;
      background: #2E2E2E;
      
      overflow: hidden;
    }
    
    .aur-lo-eptracker-card-ep-number {
      position: relative;
      height: ${ epTrackerCardCapHeight }%;
      width: 100%;
      
      // background: rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.65);
      border-top-left-radius: ${ epTrackerCardInnerRadius }px;
      border-top-right-radius: ${ epTrackerCardInnerRadius }px;
    }
    
    .aur-lo-eptracker-card-ep-number-inner {
      position: absolute;
      left: 8px;
      bottom: -2px;
      
      font-size: 67px;
      font-family: "Trebuchet MS";
      color: rgba(255, 255, 255, 0.6);
    }
    
    .aur-lo-eptracker-card-ep-number-inner.aur-lo-small-letters {
      left: 9px;
      bottom: 3px;
      font-size: 37px;
    }
    
    .aur-lo-eptracker-card-wrap.aur-lo-current .aur-lo-eptracker-card-ep-number-inner {
      color: #20BFFF;
    }
    
    .aur-lo-eptracker-card-ep-stats-wrap {
      position: relative;
      height: ${ 100 - epTrackerCardCapHeight }%;
      width: 100%;
    }
    
    .aur-lo-eptracker-card-ep-stats {
      position: absolute;
      right: 0px;
      bottom: 0px;
      left: 0px;
      top: 2px;
      
      // background: rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.85);
      border-bottom-left-radius: ${ epTrackerCardInnerRadius }px;
      border-bottom-right-radius: ${ epTrackerCardInnerRadius }px;
    }
    
    .aur-lo-eptracker-card-ep-stats-progress {
      width: 100%;
      height: 5px;
      
      background: #808080;
      opacity: 0.5;
    }
    
    .aur-lo-eptracker-card-wrap:hover .aur-lo-eptracker-card-ep-stats-progress,
    .aur-lo-eptracker-card-wrap.aur-lo-selected .aur-lo-eptracker-card-ep-stats-progress {
      opacity: 1;
    }
    
    .aur-lo-eptracker-card-ep-stats-progress-bar {
      height: 100%;
      width: 28%;
      
      background: #20BFFF;
    }
    
    .aur-lo-eptracker-card-ep-stats-status-wrap {
      position: absolute;
      top: 50%;
      left: 0px;
      right: 0px;
      margin-top: 2px;
      
      text-align: center;
    }
    
    .aur-lo-eptracker-card-ep-stats-status {
      display: inline-block;
      // left: 50%;
      
      transform: translate(0px, -50%);
      text-transform: uppercase;
      font-size: 15px;
      letter-spacing: 0.1em;
      // font-weight: bold;
      // color: rgba(255, 255, 255, 0.45);
      color: #fff;
      opacity: 0.45;
    }
    
    .aur-lo-eptracker-card-wrap.aur-lo-selected .aur-lo-eptracker-card-ep-stats-status {
      // color: #20BFFF;
      // color: rgba(255, 255, 255, 0.65); // TODO: Check this
      opacity: 0.65;
    }
    
    .aur-lo-eptracker-card-ep-stats-status.aur-lo-hilite {
      color: #20BFFF;
    }
    
    .aur-lo-eptracker-card-ep-number-watch-ep-wrap {
      position: absolute;
      top: 17px;
      left: 0px;
      right: 0px;
      
      font-size: 1px;
      text-align: center;
    }
    
    .aur-ui-root .aur-lo-eptracker-card-ep-number-watch-ep {
      position: relative;
      z-index: 50;
      display: inline-block;
      // left: 50%;
      padding: 10px 7px;
      
      border-radius: 4px;
      background: #404040;
      color: #eee !important;
      font-size: 11.5em;
      
      box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.5);
      opacity: 0;
      transform: translate(0px, -5px);
      transition: opacity 150ms cubic-bezier(.33,.04,.14,.99), transform 150ms cubic-bezier(.33,.04,.14,.99);
    }
    
    .aur-lo-eptracker-card-wrap:hover .aur-lo-eptracker-card-ep-number-watch-ep {
      opacity: 0.75;
      transform: translate(0px, 0px);
    }
    
    .aur-lo-eptracker-card-wrap:hover .aur-lo-eptracker-card-ep-number-watch-ep:hover {
      opacity: 1;
    }
    
    .aur-lo-eptracker-card-ep-number-watch-ep::before {
      content: "WATCH EPISODE";
    }
    
    // TRACKER SCROLLBAR
    .aur-lo-eptracker-cards-scroll.aur-ui-root .lces-scrollbar-trough {
      width: 13px;
      background: rgba(255, 255, 255, 0.1);
      opacity: 0.75;
    }
    
    .aur-lo-eptracker-cards-scroll.aur-ui-root .lces-scrollbar-trough:hover,
    .aur-ui-root .lces-scrollbar-trough.active {
      width: 13px;
      opacity: 1;
    }
    
    .aur-lo-eptracker-cards-scroll.aur-ui-root .lces-scrollbar {
      background: #545659;
    }
  `);
});
