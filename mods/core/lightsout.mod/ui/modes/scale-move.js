// Scale-move.js

var sett = AUR.import("aur-settings");
var ui = AUR.import("aur-ui");

reg.interface = function InitLightsOutScaleMove(main, scalingMoveMode, buttons, options) {
  var actbar = main.actionBar;
  
  // Get buttons
  var scaleMoveBtn            = buttons.scaleMoveBtn;
  var scaleMoveMoveBtn        = buttons.scaleMoveMoveBtn;
  var scaleMoveScaleBtn       = buttons.scaleMoveScaleBtn;
  var scaleMoveScaleGuidesBtn = buttons.scaleMoveScaleGuidesBtn;
  
  // RectScaleGuide(LightsOutOverlay loInstance, number scale)
  //
  // scale: 0 - 100
  function RectScaleGuide(loInstance, scale) {
    var that = this;
    
    loInstance.rectScaleGuides.push(this);
    
    // dom-element: Main rectangle
    var clickBoxes = [
      jSh.d(".aur-lo-scale-rect-guide-cbox.aur-lo-scale-right.aur-lo-scale-top.aur-lo-scale-h"),
      jSh.d(".aur-lo-scale-rect-guide-cbox.aur-lo-scale-right.aur-lo-scale-bottom.aur-lo-scale-v"),
      jSh.d(".aur-lo-scale-rect-guide-cbox.aur-lo-scale-left.aur-lo-scale-top.aur-lo-scale-v"),
      jSh.d(".aur-lo-scale-rect-guide-cbox.aur-lo-scale-left.aur-lo-scale-bottom.aur-lo-scale-h"),
    ];
    
    var mainBody = jSh.d(".aur-lo-scale-rect-guide" + (scaleMoveScaleGuidesBtn.toggle ? "" : ".aur-lo-scalemove-disabled"), null, clickBoxes);
    
    this.mainBody   = mainBody;
    this.scale      = scale;
    this.clickBoxes = {
      t: clickBoxes[0], // Top
      r: clickBoxes[1], // Right
      l: clickBoxes[2], // Left
      b: clickBoxes[3]  // Bottom
    };
    
    function onPlayerAnimated(animated) {
      var mainBody = that.mainBody;
      
      if (animated) {
        mainBody.classList.add("aur-lo-rect-animated");
      } else {
        mainBody.classList.remove("aur-lo-rect-animated");
      }
    }
    
    this.onPlayerAnimated = onPlayerAnimated;
    loInstance.addStateListener("playerAnimated", onPlayerAnimated);
    
    // Apply width/height to clickboxes
    var CSSScale         = scale + "%";
    var clickBoxesMapped = this.clickBoxes;
    
    clickBoxesMapped.t.style.width = CSSScale;
    clickBoxesMapped.r.style.height = CSSScale;
    clickBoxesMapped.l.style.height = CSSScale;
    clickBoxesMapped.b.style.width = CSSScale;
    
    // Add caption
    clickBoxesMapped.r.setAttribute("data-rect-scale", CSSScale);
    
    // Dimension properties
    this.maxTranslate = 100 - scale;
    
    this.x = 0;
    this.y = 0;
    
    // Events
    function onRectClick() {
      loInstance.playerAnimated = true;
      
      loInstance.playerPos = {
        x: jSh.numOp(that.x / (100 - scale), 0) * 100,
        y: jSh.numOp(that.y / (100 - scale), 0) * 100
      };
      
      loInstance.playerScale = {
        x: scale,
        y: scale
      };
    }
    
    clickBoxes.forEach(cb => {
      cb.addEventListener("click", onRectClick);
    });
    
    // Quickly remove rectGuide
    this.remove = function() {
      var clickBoxes = this.clickBoxes;
      var mainBody   = this.mainBody;
      
      for (var i=0,l=clickBoxes.length; i<l; i++) {
        var rect = clickBoxes[i]
        
        mainBody.removeChild(rect);
        rect.removeEventListener("click", onRectClick); // TODO: Make this work from the parent `mainBody` instead
      }
      
      if (mainBody.parentNode)
        mainBody.parentNode.removeChild(mainBody);
      
      this.clickBoxes = null;
      var rectIndex = loInstance.rectScaleGuides.indexOf(this);
      loInstance.rectScaleGuides.splice(rectIndex, 1);
      
      loInstance.removeStateListener("playerAnimated", this.onPlayerAnimated);
      this.onPlayerAnimated = null;
    }
  }

  function PlayerPosHandle(loInstance) {
    var buttonTray = jSh.d(".aur-lo-pos-handle-button-tray");
    var mainBody   = jSh.d(".aur-lo-pos-handle", null, buttonTray);
    
    this.mainBody = mainBody;
    loInstance.playerPosHandle = this;
    
    // Add buttons
    buttonTray.appendChild([
      jSh.c("button", {
        sel: ".aur-lo-pos-handle-button",
        text: "Center",
        events: {
          click() {
            main.playerAnimated = true;
            
            loInstance.playerPos = {
              x: 50,
              y: 50
            };
          }
        }
      }),
      
      jSh.c("button", {
        sel: ".aur-lo-pos-handle-button",
        text: "Save",
        events: {
          click() {
            actbar.mode = null;
          }
        }
      }),
      
      jSh.c("button", {
        sel: ".aur-lo-pos-handle-button",
        text: "Reset",
        events: {
          click() {
            loInstance.playerDimReset();
          }
        }
      }),
      
      jSh.c("button", {
        sel: ".aur-lo-pos-handle-button",
        text: "Disable",
        events: {
          click() {
            loInstance.playerFixed = false;
            actbar.mode = null;
          }
        }
      }),
    ]);
    
    // Pretty animations
    main.addStateListener("playerAnimated", function(animated) {
      if (animated) {
        mainBody.classList.add("aur-lo-pos-handle-animated");
      } else {
        mainBody.classList.remove("aur-lo-pos-handle-animated");
      }
    });
    
    scaleMoveMoveBtn.addStateListener("toggle", function(toggle) {
      mainBody.classList[toggle ? "remove" : "add"]("aur-lo-scalemove-disabled");
    });
    
    var clientX = 0;
    var clientY = 0;
    var posX    = 0;
    var posY    = 0;
    var maxX    = 0;
    var maxY    = 0;
    var maxXP   = 0;
    var maxYP   = 0;
    
    function onMouseMove(e) {
      var distX = e.clientX - clientX;
      var distY = e.clientY - clientY;
      
      loInstance.playerPos = {
        x: Math.min(Math.max(posX + (jSh.numOp(distX / maxX, 0) * 100), 0), 100),
        y: Math.min(Math.max(posY + (jSh.numOp(distY / maxY, 0) * 100), 0), 100)
      };
    }
    
    mainBody.addEventListener("mousedown", function(e) {
      if (!scaleMoveMoveBtn.toggle)
        return false;
      
      var target      = e.target;
      var playerPos   = loInstance.playerPos;
      var playerScale = loInstance.playerScale;
      
      // Make sure not clicking on a button
      if (target.tagName === "BUTTON")
        return false;
      
      clientX = e.clientX;
      clientY = e.clientY;
      posX    = playerPos.x;
      posY    = playerPos.y;
      maxX    = innerWidth * (1 - (playerScale.x / 100));
      maxY    = innerHeight * (1 - (playerScale.y / 100));
      
      // Show mouse grabbing thingy
      scalingMoveMode.mainBody.classList.add("aur-lo-grabbing");
      
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", function onMUp() {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMUp);
        
        // Enough mouse grabbing thingy
        scalingMoveMode.mainBody.classList.remove("aur-lo-grabbing");
      });
    });
  }

  function ScalingCorners(loInstance) {
    loInstance.playerScalingCorners = this;
    
    var perCornerTransformFactor = {
      nw: {
        x: 1,
        y: 1,
        w: 0,
        h: 0
      },
      
      ne: {
        x: 0,
        y: 1,
        w: 1,
        h: 0
      },
      
      sw: {
        x: 1,
        y: 0,
        w: 0,
        h: 1
      },
      
      se: {
        x: 0,
        y: 0,
        w: 1,
        h: 1
      }
    };
    
    // Make DOM elements
    var mainBody   = jSh.d(".aur-lo-scaling-corners-wrap");
    var domCorners = {
      nw: jSh.d(".aur-lo-scaling-corner.aur-lo-scaling-corner-left.aur-lo-scaling-corner-top"),
      ne: jSh.d(".aur-lo-scaling-corner.aur-lo-scaling-corner-right.aur-lo-scaling-corner-top"),
      sw: jSh.d(".aur-lo-scaling-corner.aur-lo-scaling-corner-left.aur-lo-scaling-corner-bottom"),
      se: jSh.d(".aur-lo-scaling-corner.aur-lo-scaling-corner-right.aur-lo-scaling-corner-bottom")
    };
    
    // CSS for pointer hover
    domCorners.nw.style.cursor = "nw-resize";
    domCorners.ne.style.cursor = "ne-resize";
    domCorners.sw.style.cursor = "sw-resize";
    domCorners.se.style.cursor = "se-resize";
    
    // Make array for easier handling
    var domCornersArray = ["ne", "nw", "sw", "se"].map(corner => {
      var dom = domCorners[corner];
      dom.setAttribute("data-lo-scaling-corner", corner);
      
      return dom;
    });
    
    mainBody.appendChild(domCornersArray);
    
    this.domCorners = domCorners;
    this.mainBody   = mainBody;
    
    // Events
    
    // Setting vars
    var playerMaxWidthPx  = 450;
    var playerMaxHeightPx = 220;
    
    // Transform vars
    var corner  = null;
    var clientX = null;
    var clientY = null;
    
    var playerXPx         = null;
    var playerYPX         = null;
    var playerXMaxPx      = null;
    var playerYMaxPX      = null;
    var playerWidthPx     = null;
    var playerHeightPx    = null;
    var playerWidthMaxPx  = null;
    var playerHeightMaxPx = null;
    var innerWidthPx      = null;
    var innerHeightPx     = null;
    
    // Stateful vars
    var posHandle   = null;
    var scaleGuides = null;
    
    function onCornerMMove(e) {
      e.preventDefault();
      
      var xDiff = e.clientX - clientX;
      var yDiff = e.clientY - clientY;
      
      var newWidthPx;
      var newHeightPx;
      var newPosXPx;
      var newPosYPx;
      
      var newWidth;
      var newHeight;
      
      // Scaling contraints
      if (corner.w) {
        newWidthPx = Math.max(playerWidthPx + xDiff, playerMaxWidthPx);
      } else {
        newWidthPx = Math.max(playerWidthPx - xDiff, playerMaxWidthPx);
      }
      
      if (corner.h) {
        newHeightPx = Math.max(playerHeightPx + yDiff, playerMaxHeightPx);
      } else {
        newHeightPx = Math.max(playerHeightPx - yDiff, playerMaxHeightPx);
      }
      
      // Translation contraints
      if (corner.x) {
        newPosXPx = Math.min(playerXPx + xDiff, playerXMaxPx);
      } else {
        newPosXPx = playerXPx;
      }
      
      if (corner.y) {
        newPosYPx = Math.min(playerYPx + yDiff, playerYMaxPX);
      } else {
        newPosYPx = playerYPx;
      }
      
      if (corner.x)
        newWidth = Math.min(playerWidthMaxPx, newWidthPx, innerWidthPx - newPosXPx) / innerWidthPx;
      else
        newWidth = Math.min(newWidthPx, innerWidthPx - newPosXPx) / innerWidthPx;
      
      if (corner.y)
        newHeight = Math.min(playerHeightMaxPx, newHeightPx, innerHeightPx - newPosYPx) / innerHeightPx;
      else
        newHeight = Math.min(newHeightPx, innerHeightPx - newPosYPx) / innerHeightPx;
      
      loInstance.playerScale = {
        x: newWidth * 100,
        y: newHeight * 100
      };
      
      loInstance.playerPos = {
        x: Math.max(jSh.numOp(newPosXPx / Math.max(innerWidthPx - newWidthPx, Math.max(newPosXPx, 0)), 0) * 100, 0),
        y: Math.max(jSh.numOp(newPosYPx / Math.max(innerHeightPx - newHeightPx, Math.max(newPosYPx, 0)), 0) * 100, 0)
      };
    }
    
    function onCornerMDown(e) {
      e.preventDefault();
      cornerScaling = true;
      
      var target = e.target;
      corner = perCornerTransformFactor[target.getAttribute("data-lo-scaling-corner")];
      
      var playerPos   = loInstance.playerPos;
      var playerScale = loInstance.playerScale;
      
      // Setup some important vars
      clientX = e.clientX;
      clientY = e.clientY;
      
      innerWidthPx      = innerWidth;
      innerHeightPx     = innerHeight;
      playerWidthPx     = (playerScale.x / 100) * innerWidthPx;
      playerHeightPx    = (playerScale.y / 100) * innerHeightPx;
      playerXPx         = (innerWidthPx - playerWidthPx) * (playerPos.x / 100);
      playerYPx         = (innerHeightPx - playerHeightPx) * (playerPos.y / 100);
      playerWidthMaxPx  = playerXPx + playerWidthPx;
      playerHeightMaxPx = playerYPx + playerHeightPx;
      playerXMaxPx      = innerWidthPx - (innerWidthPx - (playerXPx + playerWidthPx) + playerMaxWidthPx);
      playerYMaxPX      = innerHeightPx - (innerHeightPx - (playerYPx + playerHeightPx) + playerMaxHeightPx);
      
      // Hide annoying shit
      posHandle   = scaleMoveMoveBtn.toggle;
      scaleGuides = scaleMoveScaleBtn.toggle;
      
      scaleMoveMoveBtn.toggle  = false;
      scaleMoveScaleBtn.toggle = false;
      
      window.addEventListener("mousemove", onCornerMMove);
      window.addEventListener("mouseup", function onMUp() {
        window.removeEventListener("mousemove", onCornerMMove);
        window.removeEventListener("mouseup", onMUp);
        
        // Reveal annoying shit
        scaleMoveMoveBtn.toggle  = posHandle;
        scaleMoveScaleBtn.toggle = scaleGuides;
        
        // Change stuff now
        cornerScaling = false;
      });
    }
    
    // Add event to corners
    mainBody.addEventListener("mousedown", onCornerMDown);
    
    // Hide corners when scaling disabled
    var cornerScaling = false;
    scaleMoveScaleBtn.addStateListener("toggle", function(toggle) {
      if (!cornerScaling) {
        if (toggle)
          mainBody.classList.remove("aur-lo-scalecorners-disabled");
        else
          mainBody.classList.add("aur-lo-scalecorners-disabled");
      }
    });
    
    loInstance.addStateListener("playerAnimated", function(animated) {
      if (animated) {
        mainBody.classList.add("aur-lo-corners-animated");
      } else {
        mainBody.classList.remove("aur-lo-corners-animated");
      }
    });
  }

  // Make stuff
  main.rectScaleGuides = [];

  function onDimensionsChange() {
    var playerPos       = main.playerPos;
    var playerScale     = main.playerScale;
    var rectScaleGuides = main.rectScaleGuides;
    
    if (!(playerPos && playerScale))
      return false;
    
    var playerCenterX = (playerPos.x * ((100 - playerScale.x) / 100)) + (playerScale.x / 2);
    var playerCenterY = (playerPos.y * ((100 - playerScale.y) / 100)) + (playerScale.y / 2);
    var playerScaleX  = playerScale.x;
    var playerScaleY  = playerScale.y;
    
    var captionRight  = playerPos.x <= 50;
    
    for (let i=0,l=rectScaleGuides.length; i<l; i++) {
      let rect      = rectScaleGuides[i];
      var rectBoxes = rect.clickBoxes;
      let rectScale = rect.scale;
      let halfScale = (rectScale / 2);
      let mainBody  = rect.mainBody;
      
      let x = 50 + ((1 - jSh.numOp(Math.max(rectScale - playerScaleX, 0) / (100 - playerScaleX), 1)) * (playerCenterX - 50)) - halfScale;
      rect.x = Math.max(Math.min(x, rect.maxTranslate), 0);
      
      let y = 50 + ((1 - jSh.numOp(Math.max(rectScale - playerScaleY, 0) / (100 - playerScaleY), 1)) * (playerCenterY - 50)) - halfScale;
      rect.y = Math.max(Math.min(y, rect.maxTranslate), 0);
      
      rectBoxes.t.style.left = rect.x + "%";
      rectBoxes.t.style.top  = rect.y + "%";
      
      rectBoxes.r.style.left = (rect.x + rectScale) + "%";
      rectBoxes.r.style.top  = rect.y + "%";
      
      rectBoxes.b.style.left = rect.x + "%";
      rectBoxes.b.style.top  = (rect.y + rectScale) + "%";
      
      rectBoxes.l.style.left = rect.x + "%";
      rectBoxes.l.style.top  = rect.y + "%";
      
      // Update caption placement
      if (captionRight) {
        rectBoxes.l.removeAttribute("data-rect-scale");
        rectBoxes.r.setAttribute("data-rect-scale", rectScale + "%");
      } else {
        rectBoxes.r.removeAttribute("data-rect-scale");
        rectBoxes.l.setAttribute("data-rect-scale", rectScale + "%");
      }
    }
    
    var playerPosHandle = main.playerPosHandle;
    if (playerPosHandle) {
      var posMainBody = playerPosHandle.mainBody;
      
      if (playerScaleX === 100)
        posMainBody.style.left = "0%";
      else
        posMainBody.style.left = (playerCenterX - (playerScale.x / 2)) + "%";
      
      if (playerScaleY === 100)
        posMainBody.style.top = "0%";
      else
        posMainBody.style.top = (playerCenterY - (playerScale.y / 2)) + "%";
      
      posMainBody.style.width  = playerScaleX + "%";
      posMainBody.style.height = playerScaleY + "%";
    }
    
    var playerScalingCorners = main.playerScalingCorners;
    if (playerScalingCorners) {
      var domCorners = playerScalingCorners.domCorners;
      
      var cNW = domCorners.nw;
      var cNE = domCorners.ne;
      var cSW = domCorners.sw;
      var cSE = domCorners.se;
      
      var cornerLeft   = (playerCenterX - (playerScale.x / 2)) + "%";
      var cornerRight  = (parseFloat(cornerLeft) + playerScale.x) + "%";
      var cornerTop    = (playerCenterY - (playerScale.y / 2)) + "%";
      var cornerBottom = (parseFloat(cornerTop) + playerScale.y) + "%";
      
      cNW.style.left = cornerLeft;
      cNW.style.top = cornerTop;
      
      cNE.style.left = cornerRight;
      cNE.style.top = cornerTop;
      
      cSW.style.left = cornerLeft;
      cSW.style.top = cornerBottom;
      
      cSE.style.left = cornerRight;
      cSE.style.top = cornerBottom;
    }
  }

  main.addStateListener("playerPos", onDimensionsChange);
  main.addStateListener("playerScale", onDimensionsChange);

  // Make guides and gang
  var scalingCornersInstance = new ScalingCorners(main).mainBody;
  scalingMoveMode.mainBody.appendChild([
    new PlayerPosHandle(main).mainBody,
    
    // new RectScaleGuide(main, 100).mainBody,
    // new RectScaleGuide(main, 90).mainBody,
    // new RectScaleGuide(main, 75).mainBody,
    // new RectScaleGuide(main, 50).mainBody,
    
    scalingCornersInstance
  ]);
  
  var oldRectGuides = [];
  function addRectGuides(spec) {
    var smmBody = scalingMoveMode.mainBody;
    var specArr = spec.split(/\s*,\s*/g);
    var specMap = {};
    var specNum = [];
    
    for (var i=0,l=oldRectGuides.length; i<l; i++) {
      oldRectGuides[i].remove();
    }
    
    // Empty old rectGuides
    oldRectGuides = [];
    
    for (var i=0,l=specArr.length; i<l; i++) {
      var size = parseInt(specArr[i], 10);
      
      if (!isNaN(size) && size > 19 && !specMap[size]) {
        // Prevent duplicates
        specMap[size] = 1;
        
        specNum.push(size);
      }
    }
    
    // Add 100% if not added already
    if (!specMap[100])
      specNum.push(100);
    
    for (var i=0,l=specNum.length; i<l; i++) {
      var rectGuide = new RectScaleGuide(main, specNum[i]);
      oldRectGuides.push(rectGuide);
      
      smmBody.insertBefore(rectGuide.mainBody, scalingCornersInstance);
    }
    
    // Update positions
    onDimensionsChange();
  }
  
  // Add rectGuides
  addRectGuides(sett.get("lightsout.scaleGuideSizes"));
  
  if (options.scaleMoveConfig) {
    sett.on("lightsout.scaleGuideSizes", function(e) {
      addRectGuides(e.value);
    });
  }
  
  scalingMoveMode.mainBody.classList.add("aur-lo-scalemove-mode");
  scalingMoveMode.mainBody.css({
    width: "100%",
    height: "100%",
    bottom: "100%"
  });

  var smPrefsVisible   = ui.prefs.visible;
  var smShadeLevel     = main.shadeLevel;
  var smShadeClickThru = main.shadeClickThru;
  scalingMoveMode.addStateListener("active", function(active) {
    if (active) {
      main.playerFixed = true;
      
      smPrefsVisible   = ui.prefs.visible;
      smShadeLevel     = main.shadeLevel;
      smShadeClickThru = main.shadeClickThru;
      
      ui.prefs.visible    = false;
      main.shadeLevel     = Math.max(0.85, smShadeLevel);
      main.shadeClickThru = false;
      
      main.player.style.outline = "1px solid rgba(255, 255, 255, 0.75)";
    } else {
      ui.prefs.visible    = smPrefsVisible;
      main.shadeLevel     = smShadeLevel;
      main.shadeClickThru = smShadeClickThru;
      
      main.player.style.outline = "0px";
    }
  });
  
  // Add config if enabled
  if (options.scaleMoveConfig) {
    var scaleMoveConfigUI = options.scaleMoveConfigUI || options.generalConfigUI;
    var uiConfig = scaleMoveConfigUI && typeof scaleMoveConfigUI.prop === "function" && typeof scaleMoveConfigUI.inputTextProp === "function" ? scaleMoveConfigUI : reg.ui;
    
    uiConfig.prop({
      link: "lightsout.scaleGuideSizes",
      width: 5,
      align: "right"
    });
  }
}
