// Buttons.js

var ui = AUR.import("aur-ui");
var sett = AUR.import("aur-settings");
var aj = AUR.import("ajaxify");
var aurPrefs = AUR.import("aur-ui-prefs");

reg.interface = function LightsOutActionBarButtons(userInst, main, modes, lotab, options) {
  var actbar  = main.actionBar;
  var buttons = {};
  
  // Get modes
  var shadingMode      = modes.shadingMode;
  var extraOptionsMode = modes.extraOptionsMode;
  var nextEpisodeMode  = modes.nextEpisodeMode;
  var prevEpisodeMode  = modes.prevEpisodeMode;
  var epTrackerMode    = modes.epTrackerMode;
  var infoCaptionMode  = modes.infoCaptionMode;
  var scalingMoveMode  = modes.scalingMoveMode;
  var fullscreenMode   = modes.fullscreenMode;
  
  if (options.getEpisodeLinks) {
    // Add next episode button
    var nextEpBtn = main.addButton({
      title: "Next episode",
      button: jSh.svg(null, 52, 42, [
        // Border
        jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
        // Arrow
        jSh.path(".aur-lo-svg-toggle", "M25.984 9.484a1.5 1.5 0 0 0-1.045 2.577L33.88 21l-8.94 8.94a1.5 1.5 0 1 0 2.12 2.12L38.12 21 27.06 9.94a1.5 1.5 0 0 0-1.076-.456zM18.5 18a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z", "opacity:0.85;fill:#ffffff;stroke:none;")
      ]),
      buttonScale: 0.75,
      modeAction: nextEpisodeMode,
      activate() {
        actbar.mode = null;
      }
    });

    // Add prev episode button
    var prevEpBtn = main.addButton({
      title: "Previous episode",
      button: jSh.svg(null, 52, 42, [
        // Border
        jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
        // Arrow
        jSh.path(".aur-lo-svg-toggle", "M26.016 9.484a1.5 1.5 0 0 1 1.045 2.577L18.12 21l8.94 8.94a1.5 1.5 0 1 1-2.12 2.12L13.88 21 24.94 9.94a1.5 1.5 0 0 1 1.076-.456zM33.5 18a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z", "opacity:0.85;fill:#ffffff;stroke:none;")
      ]),
      buttonScale: 0.75,
      modeAction: prevEpisodeMode,
      activate() {
        actbar.mode = null;
      }
    });

    // Add ep navigation anchors
    var nextEpBtnAnchor = jSh.c("a", ".aur-lo-ep-nav-anchor");
    var prevEpBtnAnchor = jSh.c("a", ".aur-lo-ep-nav-anchor");

    // On sett change
    sett.on("lightsout.confirmEpisodeNav", function(e) {
      if (e.value) {
        nextEpBtn.buttonType = "mode";
        prevEpBtn.buttonType = "mode";
        
        // Hide anchors
        [
          nextEpBtnAnchor,
          prevEpBtnAnchor
        ].forEach(a => (a.style.display = "none"));
      } else {
        nextEpBtn.buttonType = "simple";
        prevEpBtn.buttonType = "simple";
        
        // Hide anchors
        [
          nextEpBtnAnchor,
          prevEpBtnAnchor
        ].forEach(a => (a.style.display = "block"));
      }
    }, true);

    nextEpBtn.buttonDOM.appendChild(nextEpBtnAnchor);
    prevEpBtn.buttonDOM.appendChild(prevEpBtnAnchor);
    
    // Add confirm buttons
    var nextEpConfirmBtn = nextEpisodeMode.addButton({
      title: "Go to next episode",
      button: "NEXT",
      activate() {
        actbar.mode = null;
      }
    });

    nextEpisodeMode.addButton({
      button: "CANCEL",
      activate() {
        actbar.mode = null;
      }
    });

    var prevEpConfirmBtn = prevEpisodeMode.addButton({
      title: "Go to previous episode",
      button: "PREV",
      activate() {
        actbar.mode = null;
      }
    });

    prevEpisodeMode.addButton({
      button: "CANCEL",
      activate() {
        actbar.mode = null;
      }
    });

    // Add ep navigation anchors
    var nextEpBtnAnchorConfirm = jSh.c("a", ".aur-lo-ep-nav-anchor");
    var prevEpBtnAnchorConfirm = jSh.c("a", ".aur-lo-ep-nav-anchor");

    var nextEpBtnAnchors = [
      nextEpBtnAnchor,
      nextEpBtnAnchorConfirm
    ];

    var prevEpBtnAnchors = [
      prevEpBtnAnchor,
      prevEpBtnAnchorConfirm
    ];

    nextEpConfirmBtn.buttonDOM.appendChild(nextEpBtnAnchorConfirm);
    prevEpConfirmBtn.buttonDOM.appendChild(prevEpBtnAnchorConfirm);
    
    // Update links when new links found
    main.on("episodelinks", function(e) {
      var epLink = main._metadata.episodelinks;
      
      var next = epLink.next;
      var prev = epLink.prev;
      
      nextEpBtn.visible = !!next;
      prevEpBtn.visible = !!prev;
      
      // Assign new
      nextEpBtnAnchors.forEach(a => (a.href = next));
      prevEpBtnAnchors.forEach(a => (a.href = prev));
    });
    
    if (main._metadata.episodelinks)
      main.triggerEvent("episodelinks", {});
    
    // Disable when transitioning
    aj.onEvent("trigger", /./, function(e) {
      nextEpBtn.disabled = true;
      prevEpBtn.disabled = true;
    });
    
    aj.onEvent("load", /./, function(e) {
      nextEpBtn.disabled = false;
      prevEpBtn.disabled = false;
    });
  }
  
  if (options.episodeTracker) {
    // Add episodes view/tracker button
    actbar.addButton({
      title: "Episode list/tracker",
      button: jSh.svg(null, 52, 42, [
        // Border
        jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
        // 1st/Play
        jSh.path(".aur-lo-svg-toggle", "M10 14c-1.662 0-3 1.338-3 3v8c0 1.662 1.338 3 3 3h8c1.662 0 3-1.338 3-3v-8c0-1.662-1.338-3-3-3h-8zm1.658 2.563L16.592 21l-4.934 4.438v-8.875z", "opacity:0.85;fill:#ffffff;stroke:none;"),
        // 2nd
        jSh.path(".aur-lo-svg-toggle", "M22 14c-.403 0-.786.082-1.137.225.7.72 1.137 1.698 1.137 2.775v8c0 1.077-.437 2.054-1.137 2.775.35.143.734.225 1.137.225h8c1.662 0 3-1.338 3-3v-8c0-1.662-1.338-3-3-3h-8zm3.273 2.426h1.522c1.134 0 1.7.603 1.7 1.81v2.07c0 1.208-.566 1.81-1.7 1.81h-1.11c-.075 0-.138.03-.193.085-.046.056-.068.12-.068.193v1.466h2.963v1.578h-4.72v-3.196c0-1.207.568-1.81 1.702-1.81h1.097c.073 0 .132-.03.178-.084.054-.055.082-.12.082-.192v-1.96c0-.074-.028-.14-.082-.194-.046-.055-.105-.082-.178-.082h-.81c-.074 0-.137.027-.192.082-.046.055-.07.12-.07.193v.7h-1.823v-.66c0-1.206.567-1.81 1.7-1.81z", "opacity:0.75;fill:#ffffff;stroke:none;"),
        // 3rd
        jSh.path(".aur-lo-svg-toggle", "M34 14c-.403 0-.786.082-1.137.225.7.72 1.137 1.698 1.137 2.775v8c0 1.077-.437 2.054-1.137 2.775.35.143.734.225 1.137.225h8c1.662 0 3-1.338 3-3v-8c0-1.662-1.338-3-3-3h-8zm3.273 2.426h1.454c1.134 0 1.7.603 1.7 1.81v1.18c0 .713-.187 1.206-.562 1.48.43.302.645.82.645 1.55v1.318c0 1.207-.567 1.81-1.7 1.81h-1.62c-1.133 0-1.7-.603-1.7-1.81v-.727h1.715v.81c0 .072.023.137.068.192.055.054.12.08.192.08h1.084c.072 0 .13-.026.177-.08.054-.056.082-.12.082-.194v-1.893c0-.073-.03-.136-.083-.19-.046-.056-.105-.083-.178-.083h-1.413v-1.483h1.33c.073 0 .132-.027.178-.082.054-.055.082-.118.082-.19v-1.73c0-.073-.028-.138-.082-.193-.046-.055-.105-.082-.178-.082h-.92c-.073 0-.137.027-.192.082-.045.055-.068.12-.068.193v.877h-1.715v-.836c0-1.207.567-1.81 1.7-1.81z", "opacity:0.65;fill:#ffffff;stroke:none;")
      ]),
      buttonScale: 0.75,
      modeAction: epTrackerMode,
      activate() {
        // Do some kinda magic crap here
      }
    });
  }
  
  if (options.fullscreen) {
    // More fullscreen button
    main.addButton({
      title: "Fullscreen",
      button: jSh.svg(null, 52, 42, [
        // Border
        jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
        // Arrow
        jSh.path(".aur-lo-svg-toggle", "M10 8c-1.108 0-2 .892-2 2v8L18 8h-8zm34 16L34 34h8c1.108 0 2-.892 2-2v-8z", "opacity:0.85;fill:#ffffff;stroke:none;")
      ]),
      buttonScale: 0.75,
      modeAction: fullscreenMode
    });
  }
  
  // More options button
  main.addButton({
    title: "More options",
    button: jSh.svg(null, 52, 42, [
      // Border
      jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
      // Arrow
      jSh.path(".aur-lo-svg-toggle", "M18 18c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm8 0c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm8 0c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z", "opacity:0.85;fill:#ffffff;stroke:none;")
    ]),
    buttonScale: 0.75,
    modeAction: extraOptionsMode
  });

  // Add scrollbar button
  var sbarBtn = extraOptionsMode.addButton({
    title: "Disable scrollbars",
    button: jSh.svg(null, 52, 42, [
      // Diagonal Pattern
      jSh.path(null, "M11.293 6L6 11.293v2.828L14.12 6h-2.827zm5.656 0L6 16.95v2.827L19.777 6H16.95zm5.655 0L6 22.605v2.83L25.434 6h-2.83zm5.66 0L6 28.262v2.828L31.092 6h-2.828zm5.655 0L6.04 33.88c.11.723.518 1.34 1.106 1.72L36.748 6H33.92zm5.656 0l-30 30h2.828l30-30h-2.828zM8.46 6.004c-1.353.022-2.434 1.103-2.456 2.455L8.46 6.003zm36.38.39L15.232 36h2.83l27.9-27.898c-.116-.72-.532-1.334-1.122-1.71zM46 10.888L20.89 36h2.83L46 13.717V10.89zm0 5.655L26.547 36h2.828L46 19.375v-2.83zm0 5.658L32.203 36h2.828L46 25.033v-2.83zm0 5.658L37.86 36h2.827L46 30.69v-2.83zm-.002 5.658l-2.48 2.48c1.37-.01 2.47-1.11 2.48-2.48z", "opacity:0.25;fill:#ffffff;stroke:none;"),
      // Border
      jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41H11v-3H8.5C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4h35C45.993 4 48 6.007 48 8.5v2.484h3V8.5C51 4.345 47.655 1 43.5 1h-35zM48 31.016V33.5c0 2.493-2.007 4.5-4.5 4.5h-2.484v3H43.5c4.155 0 7.5-3.345 7.5-7.5v-2.484h-3z", "opacity:0.5;fill:#ffffff;stroke:none;"),
      // Scrollbars
      jSh.path(".aur-lo-svg-toggle", "M48 13v16h3V13h-3zM13 38v3h26v-3H13z", "opacity:0.85;fill:#ffffff;stroke:none;")
    ]),
    buttonScale: 0.75,
    activate() {
      main.scrollbars = !main.scrollbars;
    },
    toggleState: !main.scrollbars
  });

  main.addStateListener("scrollbars", function(sbars) {
    sbarBtn.toggle = !sbars;
  });
  
  if (options.shadingLevelUI) {
    // Add shading mode button
    var shadeLevelBtn = extraOptionsMode.addButton({
      title: "Darkness shade level",
      modeAction: shadingMode,
      button: jSh.svg(null, 52, 42, [
        jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
        jSh.path(".aur-lo-svg-toggle", "M11 17c-1.108 0-2 .892-2 2v4c0 1.108.892 2 2 2h13v-2H11.5c-.277 0-.5-.223-.5-.5v-3c0-.277.223-.5.5-.5H24v-2H11zm27 0v2h2.5c.277 0 .5.223.5.5v3c0 .277-.223.5-.5.5H38v2h3c1.108 0 2-.892 2-2v-4c0-1.108-.892-2-2-2h-3z", "opacity:0.85;fill:#ffffff;stroke:none;"),
        jSh.path(".aur-lo-svg-toggle", "M28 16c-1.108 0-2 .892-2 2v6c0 1.108.892 2 2 2h6c1.108 0 2-.892 2-2v-6c0-1.108-.892-2-2-2h-6zm2 3h2c.554 0 1 .446 1 1v2c0 .554-.446 1-1 1h-2c-.554 0-1-.446-1-1v-2c0-.554.446-1 1-1z", "opacity:0.85;fill:#ffffff;stroke:none;")
      ]),
      buttonScale: 0.75
    });

    // Keep ActionBar bar visible
    shadingMode.addStateListener("active", function(active) {
      if (active) {
        main.actionBar.autohide = false;
        main.actionBar.visible  = true;
      } else {
        main.actionBar.autohide = true;
      }
    });

    shadingMode.addButton({
      title: "No darkness",
      button: "0%",
      activate() {
        main.shadeLevel = 0;
        actbar.mode = null;
      }
    });

    shadingMode.addButton({
      title: "Half darkness",
      button: "50%",
      activate() {
        main.shadeLevel = 0.5;
        actbar.mode = null;
      }
    });

    shadingMode.addButton({
      title: "Full darkness",
      button: "100%",
      activate() {
        main.shadeLevel = 1;
        actbar.mode = null;
      }
    });

    shadingMode.addButton({
      button: "DONE",
      activate() {
        actbar.mode = null;
      }
    });
  }
  
  if (options.scaleMove) {
    // Make move-scaling button
    var scaleMoveBtn = extraOptionsMode.addButton({
      title: "Move/resize video",
      modeAction: scalingMoveMode,
      button: jSh.svg(null, 52, 42, [
        jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
        jSh.path(".aur-lo-svg-toggle", "M13 8c-2.753 0-5 2.247-5 5v2.715c0 2.753 2.247 5 5 5h7c2.753 0 5-2.247 5-5V13c0-2.753-2.247-5-5-5h-7zm14 0v2h6.047c1.68 0 3 1.32 3 3v6h2v-6c0-2.753-2.247-5-5-5H27zm-14 2h7c1.68 0 3 1.32 3 3v2.715c0 1.68-1.32 3-3 3h-7c-1.68 0-3-1.32-3-3V13c0-1.68 1.32-3 3-3zm24 11l-3 3h2v2.27a2 2 0 0 1 1-.27 2 2 0 0 1 1 .27V24h2l-3-3zM8 23v1c0 2.753 2.247 5 5 5h15v-2H13c-1.68 0-3-1.32-3-3v-1H8zm25 2l-3 3 3 3v-2h2.27a2 2 0 0 1-.27-1 2 2 0 0 1 .27-1H33v-2zm8 0v2h-2.27a2 2 0 0 1 .27 1 2 2 0 0 1-.27 1H41v2l3-3-3-3zm-3 4.73a2 2 0 0 1-1 .27 2 2 0 0 1-1-.27V32h-2l3 3 3-3h-2v-2.27z", "opacity:0.85;fill:#ffffff;stroke:none;")
      ]),
      buttonScale: 0.75
    });

    main.addStateListener("playerTempDimensions", function(tempDimensions) {
      scaleMoveBtn.disabled  = tempDimensions;
      shadeLevelBtn.disabled = tempDimensions;
    });

    var scaleMoveMoveBtn = scalingMoveMode.addButton({
      title: "Show moving widget",
      button: "MOVE",
      toggleState: true,
      activate() {
        scaleMoveMoveBtn.toggle = !scaleMoveMoveBtn.toggle;
      }
    });

    var scaleMoveScaleBtn = scalingMoveMode.addButton({
      title: "Show resizing widgets",
      button: "SCALE",
      toggleState: true,
      activate() {
        scaleMoveScaleBtn.toggle = !scaleMoveScaleBtn.toggle;
      }
    });

    var scaleMoveScaleGuidesBtn = scalingMoveMode.addButton({
      title: "Show resizing guides",
      button: "GUIDES",
      toggleState: false,
      activate() {
        scaleMoveScaleGuidesBtn.toggle = !scaleMoveScaleGuidesBtn.toggle;
      }
    });
    
    if (options.userModName) {
      scalingMoveMode.addButton({
        title: "Change resizing guide sizes",
        button: "SIZES",
        toggleState: false,
        activate() {
          actbar.mode = null;
          
          ui.prefs.visible = true;
          aurPrefs.focusModule(options.userModName, aurPrefs.MOD_VIEW_CONFIG);
        }
      });
    }

    function toggleScaleGuideRects(toggle) {
      var rectGuides = main.rectScaleGuides;
      var method     = toggle ? "remove" : "add";
      
      for (let i=rectGuides.length-1; i>-1; i--) {
        rectGuides[i].mainBody.classList[method]("aur-lo-scalemove-disabled");
      }
    }

    scaleMoveScaleBtn.addStateListener("toggle", function(toggle) {
      if (scaleMoveScaleGuidesBtn.toggle) {
        toggleScaleGuideRects(toggle);
      }
      
      scaleMoveScaleGuidesBtn.disabled = !toggle;
    });

    scaleMoveScaleGuidesBtn.addStateListener("toggle", function(toggle) {
      if (scaleMoveScaleBtn.toggle) {
        toggleScaleGuideRects(toggle);
      }
    });

    scalingMoveMode.addButton({
      button: "DONE",
      activate() {
        actbar.mode = null;
      }
    });
    
    jSh.extendObj(buttons, {
      scaleMoveBtn,
      scaleMoveMoveBtn,
      scaleMoveScaleBtn,
      scaleMoveScaleGuidesBtn
    });
  }
  
  if (options.aurTab) {
    // Add prefs button
    var openPrefsButton = extraOptionsMode.addButton({
      title: "Lights Out Preferences",
      button: jSh.svg(null, 52, 42, [
        jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
        jSh.path(".aur-lo-svg-toggle", "M24 9v3.234a9 9 0 0 0-2.78 1.155l-2.29-2.29-2.83 2.83 2.283 2.283A9 9 0 0 0 17.236 19H14v4h3.234a9 9 0 0 0 1.155 2.78l-2.29 2.29 2.83 2.83 2.283-2.283A9 9 0 0 0 24 29.764V33h4v-3.234a9 9 0 0 0 2.78-1.155l2.29 2.29 2.83-2.83-2.283-2.283A9 9 0 0 0 34.764 23H38v-4h-3.234a9 9 0 0 0-1.155-2.78l2.29-2.29-2.83-2.83-2.283 2.283A9 9 0 0 0 28 12.236V9h-4zm2.914 3.057c.063.006.126.015.19.023a9 9 0 0 0-.19-.023zM26 15a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6zm-8.92 4.896a9 9 0 0 0-.023.19c.006-.063.015-.126.023-.19zm17.863 2.018c-.006.063-.015.126-.023.19a9 9 0 0 0 .023-.19zM24.896 29.92a9 9 0 0 0 .19.023c-.063-.006-.126-.015-.19-.023z", "opacity:0.85;fill:#ffffff;stroke:none;")
      ]),
      buttonScale: 0.75,
      activate() {
        openPrefsButton.toggle = !openPrefsButton.toggle;
        prefsChangeTrigger = "button";
        
        onPrefsWinChange();
        ui.prefs.draggable = true;
        
        if (openPrefsButton.toggle) {
          epTrackerMode.active = false;
        }
      },
      toggleState: false
    });
    
    var prefsChangeTrigger = null;
    function onPrefsWinChange() {
      if (prefsChangeTrigger) {
        if (openPrefsButton.toggle) {
          ui.prefs.visible = true;
          lotab.selected = true;
        } else {
          ui.prefs.visible = false;
          lotab.selected = false;
        }
        
        prefsChangeTrigger = null;
      } else {
        if (ui.prefs.visible && lotab.selected) {
          openPrefsButton.toggle = true;
        } else {
          openPrefsButton.toggle = false;
        }
      }
    }
    
    ui.prefs.addStateListener("visible", onPrefsWinChange);
    lotab.addStateListener("selected", onPrefsWinChange);
  }
  
  // Add back button
  extraOptionsMode.addButton({
    button: "BACK",
    activate() {
      actbar.mode = null;
      // extraOptionsMode.setState("active", false, true);
    }
  });

  // Add close button
  actbar.addButton({
    title: "Close Lights Out",
    button: jSh.svg(null, 52, 42, [
      jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
      jSh.path(".aur-lo-svg-toggle", "M26 9c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.5 2.53c-3.538 1.693-6 5.3-6 9.47 0 5.78 4.72 10.5 10.5 10.5S36.5 26.78 36.5 21c0-4.17-2.462-7.777-6-9.47V15c1.82 1.365 3 3.535 3 6 0 4.16-3.34 7.5-7.5 7.5s-7.5-3.34-7.5-7.5c0-2.465 1.18-4.635 3-6v-3.47z", "opacity:0.85;fill:#ffffff;stroke:none;")
    ]),
    buttonScale: 0.75,
    activate() {
      main.enabled = false;
      actbar.visible = false;
    }
  });
  
  return buttons;
}
