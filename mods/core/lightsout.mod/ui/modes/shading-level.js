// Shading-level.js

var sett = AUR.import("aur-settings");
var style = AUR.import("aur-styles");

function ShadingLevelUI(main, shadingMode, options) {
  // Add Shading Mode UI
  var shadingTextInput = lces.new("numberfield");

  shadingTextInput.min = 0;
  shadingTextInput.max = 100;
  shadingTextInput.value = 0;

  var shadeBarWidth = sett.get("lightsout.shadeBar.width");
  var shadeBarScrubberWidth = sett.get("lightsout.shadeBar.scrubberWidth");
  var shadeBarMaxScrubDist = shadeBarWidth - shadeBarScrubberWidth;

  // dom-element: Shade Bar
  var shadingBarWrap = jSh.d(".aur-lo-shade-bar", null, [
    jSh.d(".aur-lo-shade-bar-trough", null, [
      jSh.d(".aur-lo-shade-bar-scrubber"),
      jSh.d(".aur-lo-shade-bar-start", "0%"),
      jSh.d(".aur-lo-shade-bar-end", "100%")
    ]),
    
    jSh.d(".aur-lo-shade-bar-text-input", null, [
      shadingTextInput.element
    ])
  ]);

  var shadingBarTrough   = shadingBarWrap.jSh(".aur-lo-shade-bar-trough")[0];
  var shadingBarScrubber = shadingBarWrap.jSh(".aur-lo-shade-bar-scrubber")[0];

  shadingBarTrough.addEventListener("mousedown", function(e) {
    var target = e.target;
    
    // Prevent default browser behaviour
    e.preventDefault();
    
    // Client Rects
    var troughClientRect   = this.getBoundingClientRect();
    var scrubberClientRect = shadingBarScrubber.getBoundingClientRect();
    
    if (target === this || /aur-lo-shade-bar-(start|end)/.test(target.className)) {
      shadingScrubberUpdateShade(e.clientX - (troughClientRect.left + 1) - (shadeBarScrubberWidth / 2));
      window.addEventListener("mousemove", shadingScrubberMMove);
      window.addEventListener("mouseup", shadingScrubberMUp);
      
      shadeBarMScrubOffset = e.clientX;
      shadeBarOldScrubDist = shadeBarScrubDist;
    } else {
      window.addEventListener("mousemove", shadingScrubberMMove);
      window.addEventListener("mouseup", shadingScrubberMUp);
      
      shadeBarMScrubOffset = e.clientX;
      shadeBarOldScrubDist = shadeBarScrubDist;
    }
  });

  // dom-event: mousemove
  var shadeBarOldScrubDist = 0;
  var shadeBarScrubDist    = 0;
  var shadeBarMScrubOffset = 0;
  function shadingScrubberMMove(e) {
    e.preventDefault();
    
    shadingScrubberUpdateShade((e.clientX - shadeBarMScrubOffset) + shadeBarOldScrubDist);
  }

  // dom-event: mouseup
  function shadingScrubberMUp() {
    window.removeEventListener("mousemove", shadingScrubberMMove);
    window.removeEventListener("mouseup", shadingScrubberMUp);
  }

  function shadingScrubberUpdateShade(distance) {
    var shadeLevel  = Math.max(Math.min(distance / shadeBarMaxScrubDist, 1), 0);
    main.shadeLevel = Math.round(shadeLevel * 100) / 100;
  }

  var shadeBarTimeout = null;
  function shadeBarOnShadeLevelChange(shadeLevel) {
    clearTimeout(shadeBarTimeout);
    
    shadeBarScrubDist = jSh.numOp(shadeLevel * shadeBarMaxScrubDist, 0);
    
    // Update scrubber
    shadeBarTimeout = setTimeout(function() {
      shadingBarScrubber.style.transform = `translate(${ shadeBarScrubDist }px, 0px)`;
    }, 1);
    
    // Update text input
    shadingTextInput.value = parseInt(shadeLevel * 100, 10);
  }

  main.addStateListener("shadeLevel", shadeBarOnShadeLevelChange);

  shadingTextInput.addStateListener("value", function(value) {
    main.shadeLevel = parseInt(value, 10) / 100;
  });

  shadingMode.mainBody.appendChild(shadingBarWrap);

  // Styles
  var shadingBarStyles = style.styleBlock("");

  function updateShadeBarStyles() {
    shadeBarWidth         = sett.get("lightsout.shadeBar.width");
    shadeBarScrubberWidth = sett.get("lightsout.shadeBar.scrubberWidth");
    shadeBarMaxScrubDist  = shadeBarWidth - shadeBarScrubberWidth;
    var height            = sett.get("lightsout.shadeBar.height") + "px";
    
    shadingBarStyles.src = `
      .aur-lo-shade-bar {
        width: ${ shadeBarWidth + 2 }px;
      }
      
      .aur-lo-shade-bar-trough .aur-lo-shade-bar-scrubber {
        height: ${ height };
        width: ${ shadeBarScrubberWidth }px;
      }
      
      .aur-lo-shade-bar-trough {
        width: ${ shadeBarWidth }px;
        height: ${ height };
      }
      
      .aur-lo-shade-bar-trough .aur-lo-shade-bar-start,
      .aur-lo-shade-bar-trough .aur-lo-shade-bar-end {
        line-height: ${ height };
      }
      
      .aur-lo-shade-bar-text-input input.lces.lces-numberfield {
        height: ${ height };
      }
    `;
    
    // Update scrollbar
    shadeBarOnShadeLevelChange(main.shadeLevel);
  }

  updateShadeBarStyles();

  sett.on("lightsout.shadeBar.scrubberWidth", updateShadeBarStyles);
  sett.on("lightsout.shadeBar.width", updateShadeBarStyles);
  sett.on("lightsout.shadeBar.height", updateShadeBarStyles);
  
  if (options.shadingLevelConfig) {
    var shadingLevelConfigUI = options.shadingLevelConfigUI || options.generalConfigUI;
    var uiConfig = shadingLevelConfigUI && typeof shadingLevelConfigUI.prop === "function" && typeof shadingLevelConfigUI.inputNumProp === "function" ? shadingLevelConfigUI : reg.ui;
    
    // Add LO UI TAB OPTIONS (TEMPORARILY)
    uiConfig.prop({
      link: "lightsout.shadeBar.width",
      width: 7,
      align: "right",
      min: 200,
      max: 1000,
      integer: true
    });

    uiConfig.prop({
      link: "lightsout.shadeBar.height",
      width: 7,
      align: "right",
      min: 25,
      max: 200,
      integer: true
    });

    uiConfig.prop({
      link: "lightsout.shadeBar.scrubberWidth",
      width: 7,
      align: "right",
      min: 50,
      max: 250,
      integer: true
    });
  }
}

reg.interface = ShadingLevelUI;
