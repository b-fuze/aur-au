// Lights Out core library
AUR_NAME = "Lights Out Base Library";
AUR_DESC = "Lights Out Base Library";
AUR_VERSION = [0, 1, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";
AUR_RUN_AT = "doc-end";

// Imports
var ui = AUR.import("aur-ui");
var sett = AUR.import("aur-settings");
var style = AUR.import("aur-styles");
var aj = AUR.import("ajaxify");
var lomisc;

AUR.onLoaded("lightsout-misc", function() {
  // Lightsout Tracker & LOPC
  lomisc = AUR.import("lightsout-misc");
});

// -----------------------
//        UTILITIES
// -----------------------

function getTime() {
  return new Date().getTime();
}

// -----------------------
//   LIGHTS OUT SETTINGS
// -----------------------

sett.setDefault("lightsout", {
  // General
  autostart: sett.Setting("Autostart Lights Out", "boolean", false),
  clickShadeCloses: sett.Setting("Clicking darkness closes Lights Out", "boolean", false),
  mirrorPriority: sett.Setting("Mirror Priority", "boolean", false),
  
  // Tracker
  autotrack: sett.Setting("Autotrack episode history", "boolean", true),
  showEpisodeStatus: sett.Setting("Show episode status", "boolean", true),
  trackerOptimizedScroll: sett.Setting("Episode tracker optimized scrolling", "boolean", true),
  trackerScrollRefreshDelay: sett.Setting("Episode tracker scroll update delay", "boolean", true),
  trackerScrollRefresh: sett.Setting("Episode tracker scroll update delay duration (ms)", "number", 50),
  
  // UI stuff
  clickThroughSemiAlpha: sett.Setting("Click through ", "boolean", false),
  disableScrollbars: sett.Setting("Hide scrollbars", "boolean", false),
  confirmEpisodeNav: sett.Setting("Confirm prev/next episode", "boolean", false),
  shadeLevel: sett.Setting("Darkness level", "number", 0.95),
  
  // Player dimensions
  playerFixed: sett.Setting("Player fixed dimensions", "boolean", true),
  playerDimSet: sett.Setting("Whether player dimensions were set already", "boolean", false),
  
  playerX: sett.Setting("Player X offset (in percentage)", "number", 0),
  playerY: sett.Setting("Player Y offset (in percentage)", "number", 0),
  playerWidth: sett.Setting("Player width (in percentage)", "number", 100),
  playerHeight: sett.Setting("Player height (in percentage)", "number", 100),
  
  origPlayerX: sett.Setting("Player X offset (in percentage)", "number", 0),
  origPlayerY: sett.Setting("Player Y offset (in percentage)", "number", 0),
  origPlayerWidth: sett.Setting("Player width (in percentage)", "number", 100),
  origPlayerHeight: sett.Setting("Player height (in percentage)", "number", 100)
});

// Make Lights Out tab
var LOTab = ui.prefs.registerTab("lightsout-sett", "Lights Out");

// Lights Out Settings UI
var loSettUIGen = LOTab.groupProp(null, 12, {
  title: "General"
});

var loSettUINav = LOTab.groupProp(null, 12, {
  title: "Navigation"
});

var loSettUIUI = LOTab.groupProp(null, 12, {
  title: "User Interface"
});

var loSettUIPerf = LOTab.groupProp(null, 12, {
  title: "Performance"
});

loSettUIGen.prop({
  link: "lightsout.autostart",
  width: 7,
  align: "right"
});

loSettUIGen.prop({
  link: "lightsout.autotrack",
  width: 7,
  align: "right"
});

loSettUIGen.prop({
  link: "lightsout.clickShadeCloses",
  width: 7,
  align: "right"
});

// Add Mirror Priority option
loSettUIGen.textProp(null, 6, {
  data: "Mirror priority"
});

loSettUIGen.buttonProp(null, 4, {
  fill: true
}).addButton("Change priority", function() {
  // Open the configure thingy here...
});

loSettUIGen.toggleProp(null, 2, {
  align: "right",
  link: "Mirror priority"
});
// End: Add Mirror Priority

loSettUINav.prop({
  link: "lightsout.confirmEpisodeNav",
  width: 7,
  align: "right"
});

loSettUIUI.prop({
  link: "lightsout.showEpisodeStatus",
  width: 7,
  align: "right"
});

loSettUIPerf.prop({
  link: "lightsout.trackerOptimizedScroll",
  width: 7,
  align: "right"
});

var loTrackerRefreshDelay = loSettUIPerf.prop({
  link: "lightsout.trackerScrollRefreshDelay",
  width: 7,
  align: "right"
});

var loTrackerRefresh = loSettUIPerf.prop({
  link: "lightsout.trackerScrollRefresh",
  width: 9,
  align: "right",
  min: 1,
  max: 1000,
  integer: true
});

sett.on("lightsout.trackerOptimizedScroll", function(e) {
  if (e.value) {
    if (sett.get("lightsout.trackerScrollRefreshDelay")) {
      loTrackerRefresh.disabled = false;
    } else {
      loTrackerRefresh.disabled = true;
    }
    
    loTrackerRefreshDelay.disabled = false;
  } else {
    loTrackerRefreshDelay.disabled = true;
    loTrackerRefresh.disabled = true;
  }
});

sett.on("lightsout.trackerScrollRefreshDelay", function(e) {
  if (!sett.get("lightsout.trackerOptimizedScroll")) {
    loTrackerRefresh.disabled = false;
    return false;
  }
  
  loTrackerRefresh.disabled = !e.value;
});

// Remove tab, invisible in the beginning
LOTab.visible = false;

// -----------------------
//   LIGHTS OUT UI MODEL
// -----------------------

// For uniquely idenfiying LO Instances
var LOInstanceCount = 0;

// LO Instance Constructor
function LightsOutOverlay() {
  lces.types.component.call(this);
  var that = this;
  
  // Utils
  function onlyBoolean(val) {
   this.proposedValue = !!val;
   return true;
  }
  
  function onlyDimension(val) {
    // Check if valid value, otherwise transform to null
    this.proposedValue = jSh.numOp(parseInt(val), null) === null ? null : val;
    return true;
  }
  
  // Player util functions
  var raisingPlayerTimeout = null;
  function raisePlayer() {
    var player = that.player;
    
    if (player) {
      player.css({
        position: that.playerFixed ? "fixed" : "relative",
        zIndex: 1000000
      });
    }
  }
  
  function lowerPlayer() {
    var player = that.player;
    
    if (player) {
      player.css({
        position: "static",
        zIndex: 0
      });
    }
  }
  
  // Elements
  var darkOverlay = jSh.d(".aur-lo-overlay-main.aur-lo-active-anim.aur-lo-disabled");
  
  // For unenabled state
  darkOverlay.css({
    opacity: 0,
    pointerEvents: "none"
  });
  
  // Properties
  jSh.constProp(this, "loID", ++LOInstanceCount);
  
  // LCES States
  this.setState("enabled", false);
  this.setState("mounted", false);
  
  this.setState("shadeLevel", 0);
  this.setState("shadeAnimate", false);
  this.setState("shadeClickThru", true);
  this.setState("shadeClickThruOnChange", true);
  
  this.setState("scrollbars", true);
  this.setState("scrollbarX", true);
  this.setState("scrollbarY", true);
  
  this.setState("episodeDetails", null);
  this.setState("playerPos", {x: 0, y: 0});
  this.setState("playerScale", {x: 100, y: 100});
  this.setState("playerFixed", false);
  this.setState("playerTempDimensions", false);
  this.setState("playerAnimated", false);
  
  // PLAYER DIMENSION EXAMPLES:
  // this.playerPos = {
  //   x: 0 - 100, // Percentage of difference between `innerwidth` and player width
  //   y: 0 - 100
  // }
  
  // this.playerScale = {
  //   x: 0 - 100, // Percentage of `innerwidth`
  //   y: 0 - 100
  // }
  
  // EPISODE DETAILS EXAMPLE:
  // this.episodeDetails = {
  //   animeTitle: "Ooyasan was Shinsuki!",
  //   animeUnique: "Ooyasan-wa-Shishunki", // Unique part of anime name in URL
  //   episode: "5",                        // String because of the odd episodes like 5.5 and 5-6
  //   episodeIndex: 5,                     // Index on the channel page. Zero indexed.
  //   episodeTitle: ""                     // Episode title, if any
  // }
  
  // Sub-components
  this.actionBar = new ActionBar(this);
  this.modePane  = new ModePane(this);
  this.tracker   = new lomisc.Tracker(this);
  this.setState("player", null);
  
  // Events
  this.addStateCondition("enabled", onlyBoolean);
  this.addStateCondition("mounted", onlyBoolean);
  
  // For shade click event
  function closeLO() {
    that.enabled = false;
  }
  
  // lces-state: enabled
  var oldShadeLevel = 0;
  this.addStateListener("enabled", (enabled) => {
    clearTimeout(raisingPlayerTimeout);
    
    if (enabled) {
      if (!this.mounted)
        this.mounted = true;
      
      this.actionBar.enabled = true;
      this.modePane.enabled  = true;
      
      this.scrollbars = sett.get("lightsout.disableScrollbars");
      this.shadeLevel = sett.get("lightsout.shadeLevel");
      
      // Raise player
      if (this.player) {
        raisingPlayerTimeout = setTimeout(raisePlayer, 0);
        
        this.playerFixed = sett.get("lightsout.playerFixed");
        if (this.playerFixed)
          updatePlayerDimensions();
      }
    } else {
      this.actionBar.enabled = false;
      this.modePane.enabled  = false;
      
      this.shadeLevel     = 0;
      this.shadeClickThru = true;
      this.scrollbars     = true;
      this.playerFixed    = false;
      
      if (this.player)
        raisingPlayerTimeout = setTimeout(lowerPlayer, parseInt(defABAnim));
    }
  });
  
  // sett: clickShadeCloses
  sett.on("lightsout.clickShadeCloses", function(e) {
    if (e.value)
      darkOverlay.addEventListener("click", closeLO);
    else
      darkOverlay.removeEventListener("click", closeLO);
  });
  
  // lces-state: mounted
  this.addStateListener("mounted", (mounted) => {
    if (mounted) {
      if (jSh("#lces-windowcontainer"))
        document.body.insertBefore(darkOverlay, jSh("#lces-windowcontainer"));
      else
        document.body.appendChild(darkOverlay);
    } else if (darkOverlay.parentNode) {
      document.body.removeChild(darkOverlay);
    }
    
    // Propagate to sub-ui components
    this.modePane.mounted = mounted;
    this.actionBar.mounted = mounted;
  });
  
  var docBodyStyle = document.body.style;
  
  // lces-cond: shadeLevel
  this.addStateCondition("shadeLevel", function(shadeLvl) {
    if (typeof shadeLvl !== "number")
      return false;
    else {
      // Limit to 0-1 range
      this.proposedValue = Math.min(Math.max(shadeLvl, 0), 1);
      return true;
    }
  });
  
  // lces-state: shadeLevel
  var updateShadeLevelTimeout = null;
  this.addStateListener("shadeLevel", (shadeLevel) => {
    if (this.enabled) {
      oldShadeLevel = shadeLevel;
      
      clearTimeout(updateShadeLevelTimeout);
      updateShadeLevelTimeout = setTimeout(function() {
        sett.set("lightsout.shadeLevel", shadeLevel);
      }, 200);
    }
    
    if (this.shadeClickThruOnChange)
      this.shadeClickThru = shadeLevel < 0.5;
    else
      this.shadeClickThru = true;
  
    darkOverlay.css({
      opacity: shadeLevel
    });
  });
  
  // lces-state: shadeAnimate
  this.addStateListener("shadeAnimate", (shadeAnim) => {
    darkOverlay.css({
      transition: shadeAnim ? `opacity ${ defABAnimSlow }, background ${ defABAnimSlow }` : "none"
    });
  });
  
  // lces-state: shadeClickThru
  this.addStateListener("shadeClickThru", (shadeClickThru) => {
    darkOverlay.css({
      pointerEvents: shadeClickThru ? "none" : "auto"
    });
  });
  
  // Coerce all values passed into booleans
  this.addStateCondition("scrollbars", onlyBoolean);
  this.addStateCondition("scrollbarX", onlyBoolean);
  this.addStateCondition("scrollbarY", onlyBoolean);
  
  // lces-state: scrollbars
  this.addStateListener("scrollbars", (sbars) => {
    if (this.enabled)
      sett.set("lightsout.disableScrollbars", sbars);
    
    this.scrollbarX = sbars;
    this.scrollbarY = sbars;
  });
  
  // lces-state: scrollbarX
  this.addStateListener("scrollbarX", (sbar) => {
    if (sbar)
      docBodyStyle.overflowX = "auto";
    else
      docBodyStyle.overflowX = "hidden";
  });
  
  // lces-state: scrollbarY
  this.addStateListener("scrollbarY", (sbar) => {
    if (sbar)
      docBodyStyle.overflowY = "auto";
    else
      docBodyStyle.overflowY = "hidden";
  });
  
  // lces-state: episodeDetails
  this.addStateListener("episodeDetails", (details) => {
    if (details) {
      this.tracker.auid = details.animeUnique;
      this.tracker.loadAnimeDataCache();
    }
  });
  
  // When new player is assigned
  this.addStateListener("player", (player) => {
    clearTimeout(raisingPlayerTimeout);
    
    if (player) {
      if (!gotScaleMoveSettings) {
        gettingSettings = true;
        
        this.playerPos = {
          x: sett.get("lightsout.playerX"),
          y: sett.get("lightsout.playerY")
        };
        
        this.playerScale = {
          x: sett.get("lightsout.playerWidth"),
          y: sett.get("lightsout.playerHeight")
        };
        
        gettingSettings = false;
        gotScaleMoveSettings = true;
      }
      
      if (this.enabled) {
        raisingPlayerTimeout = setTimeout(raisePlayer, 0);
        
        if (this.playerFixed)
          updatePlayerDimensions();
      } else
        raisingPlayerTimeout = setTimeout(lowerPlayer, parseInt(defABAnim));
    }
  });
  
  var updatePlayerDimensionTimeout = null;
  function updatePlayerDimensions() {
    clearTimeout(updatePlayerDimensionTimeout);
    
    if (!that.playerFixed)
      return false;
    
    var player      = that.player;
    var playerPos   = that.playerPos;
    var playerScale = that.playerScale;
    
    if (player && !player.aurLODimensionFixes) {
      player.removeAttribute("width");
      player.removeAttribute("height");
      
      player.style.position = "fixed";
      player.aurLODimensionFixes = true;
    }
    
    if (player && playerPos && playerScale) {
      player.css({
        left: (playerPos.x * ((100 - playerScale.x) / 100)) + "%",
        
        top: (playerPos.y * ((100 - playerScale.y) / 100)) + "%",
        
        width: playerScale.x + "%",
        height: playerScale.y + "%"
      });
      
      
      if (!gettingSettings && !that.playerTempDimensions) {
        updatePlayerDimensionTimeout = setTimeout(function() {
          console.log("SET SETTINGS ", playerScale);
          
          sett.set("lightsout.playerX", playerPos.x);
          sett.set("lightsout.playerY", playerPos.y);
          sett.set("lightsout.playerWidth", playerScale.x);
          sett.set("lightsout.playerHeight", playerScale.y);
          
          console.log("GET SETTINGS ", playerScale);
        }, 500);
      }
    }
  }
  
  var playerDimSet         = false;
  var gotScaleMoveSettings = false;
  var gettingSettings      = false;
  
  this.addStateListener("playerPos", updatePlayerDimensions);
  this.addStateListener("playerScale", updatePlayerDimensions);
  this.addStateListener("playerFixed", (fixed) => {
    var player = this.player;
    
    if (!sett.get("lightsout.playerDimSet") && player) {
      var playerCRect = player.getBoundingClientRect();
      var playerWidth = playerCRect.right - playerCRect.left;
      var playerHeight = playerCRect.bottom - playerCRect.top;
      
      var maxX = 1 - (playerWidth / innerWidth);
      var maxY = 1 - (playerHeight / innerHeight);
      
      gettingSettings = true;
      
      this.playerPos = {
        x: (playerCRect.left / (innerWidth * maxX)) * 100,
        y: (playerCRect.top / (innerHeight * maxY)) * 100
      };
      
      this.playerScale = {
        x: (playerWidth / innerWidth) * 100,
        y: (playerHeight / innerHeight) * 100
      };
      
      gettingSettings = false;
      
      // Set stuffs
      sett.set("lightsout.playerX", this.playerPos.x);
      sett.set("lightsout.playerY", this.playerPos.y);
      sett.set("lightsout.playerWidth", this.playerScale.x);
      sett.set("lightsout.playerHeight", this.playerScale.y);
      
      sett.set("lightsout.origPlayerX", this.playerPos.x);
      sett.set("lightsout.origPlayerY", this.playerPos.y);
      sett.set("lightsout.origPlayerWidth", this.playerScale.x);
      sett.set("lightsout.origPlayerHeight", this.playerScale.y);
      
      sett.set("lightsout.playerDimSet", true);
      
      // Set default width/height now
      this.playerScale = {
        x: 90,
        y: 90
      };
      
      this.playerPos = {
        x: 50,
        y: 50
      };
    }
    
    if (this.enabled)
      sett.set("lightsout.playerFixed", fixed);
    
    if (fixed) {
      if (player)
        updatePlayerDimensions();
    } else {
      player.aurLODimensionFixes = false;
      
      player.css({
        position: "relative",
        width: "650px",
        height: "370px",
        left: "0px",
        top: "0px"
      });
    }
  });
  
  sett.on("lightsout.playerFixed", function(e) {
    that.playerFixed = e.value;
  });
  
  var oldPlayerPos   = this.playerPos;
  var oldPlayerScale = this.playerScale;
  this.addStateListener("playerTempDimensions", (tempDimensions) => {
    if (tempDimensions) {
      oldPlayerPos   = this.playerPos;
      oldPlayerScale = this.playerScale;
    } else {
      this.playerPos   = oldPlayerPos;
      this.playerScale = oldPlayerScale;
    }
  });
  
  this.addStateListener("playerAnimated", (animated) => {
    if (!this.player)
      return false;
    
    if (animated) {
      this.player.classList.add("aur-lo-player-animated");
      
      setTimeout(() => {
        this.playerAnimated = false;
      }, 250);
    } else {
      this.player.classList.remove("aur-lo-player-animated");
    }
  });
  
  // Easy access to methods from Sub-components
  this.addButton = this.actionBar.addButton.bind(this.actionBar);
}

jSh.inherit(LightsOutOverlay, lces.types.component);

jSh.extendObj(LightsOutOverlay.prototype, {
  // LOInstance.Mode(String name | Object options)
  //
  // options: {
  //   name: "mode-name", // STRING
  //   activeAutomatic: false | true // BOOLEAN
  // }
  addMode(options) {
    var name;
    var opt;
    
    if (jSh.type(options) === "object") {
      name = options.name;
      opt  = options;
    } else {
      name = options;
      opt  = {
        name: name
      };
    }
    
    // If the name isn't provided, exit without making the Mode TODO: Should we error here instead?
    if (typeof name !== "string" || !name.trim())
      return false;
    
    // Make mode
    var mode = new ModePaneMode(opt, this);
    this.modePane.addMode(mode);
    
    return mode;
  },
  
  playerDimReset() {
    this.playerFixed = false;
    sett.set("lightsout.playerDimSet", false);
    this.playerFixed = true;
  }
});

// LO ActionBar sizing Style Template
var LOActBarSizeStyle = `
  .aur-lo-actionbar--ACTBAR_ID,
  .aur-lo-actionbar--ACTBAR_ID .aur-lo-actbar-wrap {
    width: ACTBAR_SIZEpx;
  }
  
  .aur-lo-actionbar--ACTBAR_ID .aur-lo-actbar-button {
    width: ACTBAR_SIZEpx;
    height: ACTBAR_SIZEpx;
  }
  
  .aur-lo-actbar-buttontitles--ACTBAR_ID .aur-lo-actbar-button-title {
    margin-right: ACTBAR_SIZEpx;
  }
`;

// LO ActionBar Constructor
function ActionBar(overlay) {
  lces.types.component.call(this);
  var that = this;
  
  // dom-elements: Action Bar UI components
  var mainButtonTitles = jSh.d(".aur-lo-actbar-button-titles.aur-lo-actbar-buttontitles--" + overlay.loID);
  var mainCapture      = jSh.d(".aur-lo-actionbar-capture.aur-lo-actionbar--" + overlay.loID + ".aur-lo-disabled");
  var mainBody         = jSh.d(".aur-lo-actionbar.aur-lo-actionbar--" + overlay.loID + ".aur-lo-disabled");
  var mainBodyProxy    = jSh.d(".aur-lo-actionbar-proxy.aur-lo-actionbar--" + overlay.loID);
  var innerWrapMain    = jSh.d(".aur-lo-actbar-wrap.aur-lo-actbar-wrap-main.aur-lo-visible");
  var innerWrapMode    = jSh.d(".aur-lo-actbar-wrap.aur-lo-actbar-wrap-mode");
  var mainLogo         = jSh.d(".aur-lo-actbar-button.aur-lo-actbar-button-logo", null, null, {title: "Lights Out Logo"});
  var mainButtons      = jSh.d(".aur-lo-actbar-buttons-main");
  var sizeStyle        = jSh.c("style", {
    prop: {
      type: "text/css"
    },
    child: jSh.t("/* Placeholder CSS Sizing */")
  });
  
  mainBody.appendChild(sizeStyle);
  mainBody.appendChild(mainBodyProxy);
  mainBodyProxy.appendChild(innerWrapMain);
  mainBodyProxy.appendChild(innerWrapMode);
  innerWrapMain.appendChild(mainLogo);
  innerWrapMain.appendChild(mainButtons);
  
  // Add sexy Lights Out logo
  mainLogo.appendChild(jSh.svg(".aur-lo-actbar-button-content", 80, 80, [
    jSh.path(null, "M34.2 20.085h11.6l20.124 15.008H14.076z", "fill:none;stroke:#ffffff;stroke-width:2;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"),
    jSh.path(null, "M40 39.057v14.885", "fill:none;stroke:#ffffff;stroke-width:2;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"),
    jSh.path(null, "M42.987 56.928A2.987 2.987 0 0 1 40 59.915a2.987 2.987 0 0 1-2.987-2.987A2.987 2.987 0 0 1 40 53.942a2.987 2.987 0 0 1 2.987 2.986z", "fill:none;stroke:#ffffff;stroke-width:2;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1")
  ]));
  
  // Properties
  this.loInstance       = overlay;
  this.mainBody         = mainBody;
  this.mainButtons      = mainButtons;
  this.mainButtonTitles = mainButtonTitles;
  jSh.constProp(this, "actbarID", overlay.loID);
  
  this.changingButtonsTimeout = null;
  this.changingButtons        = null;
  // ^ = {
  //   time: getTime(),
  //   hide: [],
  //   show: []
  // };
  
  // Properties
  this.setState("size", 80);
  this.setState("visible", false);
  this.setState("autohide", true);
  this.setState("mounted", false);
  this.setState("enabled", false);
  this.setState("mode", null);
  
  this.buttonCount = 0;
  this.buttons = [];
  this.buttonTitles = [
    // "btn01" | "modebtn02": {
    //    button: ActionBarButton Instance,
    //    title: "Button Title",
    //    visibleTimeout: JS Timeout ID
    // }
  ];
  
  // Events
  function showActionBar() {
    clearTimeout(hideActBarTimeout);
    clearTimeout(that.__demoActbarTimeout);
    
    that.visible = true;
  }
  
  var hideActBarTimeout = null;
  function hideActionBar() {
    if (that.autohide)
      hideActBarTimeout = setTimeout(function() {
        that.visible = false;
      }, 500);
  }
  
  mainCapture.addEventListener("mouseover", showActionBar);
  mainBody.addEventListener("mouseover", showActionBar);
  mainCapture.addEventListener("mouseout", hideActionBar);
  mainBody.addEventListener("mouseout", hideActionBar);
  
  // EVENT LISTENERS
  
  // lces-state: visible
  this.addStateListener("visible", (visible) => {
    if (visible) {
      mainBody.classList.add("aur-lo-visible");
    } else {
      mainBody.classList.remove("aur-lo-visible");
      
      // Remove all titles
      this.clearButtonTitles();
    }
  });
  
  function updateHeight() {
    var rect = (that.mode ? innerWrapMode : innerWrapMain).getBoundingClientRect();
    mainBody.style.height = (rect.bottom - rect.top) + "px";
  }
  
  // Add updateHeight method
  this.updateHeight = updateHeight;
  
  // lces-state: size
  this.addStateListener("size", function(size) {
    size = jSh.numOp(size, 80);
    
    sizeStyle.removeChild(sizeStyle.childNodes[0]);
    sizeStyle.appendChild(jSh.t(
      LOActBarSizeStyle.replace(/ACTBAR_ID/g, that.actbarID)
                       .replace(/ACTBAR_SIZE/g, size)
    ));
    
    this.stateStatus = size;
  });
  
  // lces-state: mounted
  var docBody = document.body;
  this.addStateListener("mounted", (mounted) => {
    if (mounted) {
      docBody.appendChild(mainCapture);
      docBody.appendChild(mainBody);
      docBody.appendChild(mainButtonTitles);
      
      setTimeout(function() {
        updateHeight();
      }, 0);
    } else {
      if (mainCapture.parentNode)
        docBody.removeChild(mainCapture);
      if (mainBody.parentNode)
        docBody.removeChild(mainBody);
      if (mainButtonTitles.parentNode)
        docBody.removeChild(mainButtonTitles);
    }
  });
  
  // lces-state: enabled
  this.addStateListener("enabled", (enabled) => {
    if (enabled) {
      mainCapture.classList.remove("aur-lo-disabled");
      mainBody.classList.remove("aur-lo-disabled");
      
      // Short preview of the bar
      this.demoActionBar();
    } else {
      mainCapture.classList.add("aur-lo-disabled");
      mainBody.classList.add("aur-lo-disabled");
    }
  });
  
  // lces-state: mode
  // Stupid animation crap here
  this.addStateListener("mode", function(mode) {
    // Deactivate old mode
    if (this.oldStateStatus && this.oldStateStatus.activeAutomatic)
      this.oldStateStatus.active = false;
    
    // Assert if valid mode or valid null
    if (mode && !(mode instanceof ModePaneMode))
      return false;
    
    // Remove button titles
    that.clearButtonTitles();
    
    if (mode) {
      var modeButtons = mode.buttons;
      
      if (modeButtons.length > 0) {
        var oldInnerWrapMode = innerWrapMode;
            innerWrapMode    = jSh.d(".aur-lo-actbar-wrap.aur-lo-actbar-wrap-mode");
        
        // Add new mode button container
        mainBodyProxy.appendChild(innerWrapMode);
        
        // Remove any buttons
        // innerWrapMode.removeChild(jSh.toArr(innerWrapMode.childNodes));
        
        // Add new mode buttons
        
        // Add top button "logo"
        if (mode.mainButton instanceof ActionBarButton) {
          var logoBtnCopy = mode.mainButton.buttonDOM.cloneNode(true);
          logoBtnCopy.classList.remove("aur-lo-actbar-button-input");
          logoBtnCopy.classList.add("aur-lo-actbar-button-active");
          
          innerWrapMode.appendChild(logoBtnCopy);
        }
        
        // Add the other buttons
        for (let i=0,l=modeButtons.length; i<l; i++) {
          innerWrapMode.appendChild(modeButtons[i].buttonDOM);
        }
        
        // Start height animation
        updateHeight();
        
        // Give the old one a flashy exit
        if (oldInnerWrapMode && oldInnerWrapMode.childNodes.length && this.oldStateStatus) {
          oldInnerWrapMode.classList.add("aur-lo-slideout");
          oldInnerWrapMode.classList.remove("aur-lo-visible");
          
          // Remove when animation is over
          setTimeout(function() {
            mainBodyProxy.removeChild(oldInnerWrapMode);
          }, parseInt(defABAnim) + 10);
        } else {
          // Just remove immediately
          mainBodyProxy.removeChild(oldInnerWrapMode);
        }
        
        // Start animation
        innerWrapMain.classList.remove("aur-lo-default");
        
        innerWrapMain.classList.add("aur-lo-slideout");
        innerWrapMain.classList.remove("aur-lo-visible");
        
        innerWrapMode.classList.add("aur-lo-visible");
        innerWrapMode.classList.remove("aur-lo-slideout");
        
        setTimeout(function() {
          innerWrapMain.classList.remove("aur-lo-slideout");
          innerWrapMain.classList.add("aur-lo-default");
        }, parseInt(defABAnim) + 10);
      }
    } else {
      // Start height animation
      updateHeight();
      
      // Start animation
      innerWrapMain.classList.remove("aur-lo-default");
      innerWrapMode.classList.remove("aur-lo-default");
      
      innerWrapMain.classList.add("aur-lo-visible");
      innerWrapMain.classList.remove("aur-lo-slideout");
      
      innerWrapMode.classList.add("aur-lo-slideout");
      innerWrapMode.classList.remove("aur-lo-visible");
      
      setTimeout(function() {
        innerWrapMode.classList.remove("aur-lo-slideout");
        innerWrapMode.classList.add("aur-lo-default");
      }, parseInt(defABAnim) + 10);
    }
  });
  
  // lces-state: autohide
  this.addStateListener("autohide", (autohide) => {
    if (autohide) {
      clearTimeout(hideActBarTimeout);
      
      hideActionBar();
    } else {
      clearTimeout(hideActBarTimeout);
      
      that.visible = true;
    }
  });
  
  // Initial setup
  this.setState("size", 80, true);
  this.updateHeight = updateHeight;
}

jSh.inherit(ActionBar, lces.types.component);

jSh.extendObj(ActionBar.prototype, {
  demoActionBar() {
    this.visible = true;
    
    this.__demoActbarTimeout = setTimeout(() => {
      this.visible = false;
    }, 3250);
  },
  
  addButton(options) {
    var button = new ActionBarButton(options);
    
    this.buttons.push(button);
    this.mainButtons.appendChild(button.buttonDOM);
    
    // Update height
    setTimeout(() => {
      this.updateHeight();
    }, 0);
    
    // Add actbar reference
    button.loInstance = this.loInstance;
    button.bID = "btn" + this.buttonCount++;
    
    return button;
  },
  
  hideButton(button) {
    var changingButtons = this.changingButtons;
    
    if (!this.changingButtons) {
      this.changingButtons = {
        hide: [button],
        show: []
      };
      
      this.changingButtonsTimeout = setTimeout(this.animateChangingButtons.bind(this), 0);
    } else {
      changingButtons.hide.push(button);
    }
  },
  
  showButton(button) {
    var changingButtons = this.changingButtons;
    
    if (!this.changingButtons) {
      this.changingButtons = {
        hide: [],
        show: [button]
      };
      
      this.changingButtonsTimeout = setTimeout(this.animateChangingButtons.bind(this), 0);
    } else {
      changingButtons.show.push(button);
    }
  },
  
  animateChangingButtons() {
    var changingButtons  = this.changingButtons;
    this.changingButtons = null;
    
    // Reveal/hide all buttons
    var hide = changingButtons.hide;
    var show = changingButtons.show;
    
    // Set to end size
    for (let i=0,l=hide.length; i<l; i++) {
      let btn = hide[i];
      
      btn.buttonDOM.style.position = "absolute";
    }
    
    for (let i=0,l=show.length; i<l; i++) {
      let btn = show[i];
      
      btn.buttonDOM.classList.add("aur-lo-actbar-button-disable-anim");
      btn.buttonDOM.classList.remove("aur-lo-actbar-button-hidden");
    }
    
    // Update height with all buttons
    this.updateHeight();
    
    // Bring them back to animation size
    for (let i=0,l=hide.length; i<l; i++) {
      let btn = hide[i];
      
      btn.buttonDOM.style.position = "relative";
      btn.buttonDOM.classList.add("aur-lo-actbar-button-hidden");
    }
    
    for (let i=0,l=show.length; i<l; i++) {
      let btn = show[i];
      
      btn.buttonDOM.classList.add("aur-lo-actbar-button-hidden");
      
      setTimeout(() => {
        btn.buttonDOM.classList.remove("aur-lo-actbar-button-disable-anim");
        
        setTimeout(() => {
          btn.buttonDOM.classList.remove("aur-lo-actbar-button-hidden");
        }, 1);
      }, 15);
    }
  },
  
  explainButton(button) {
    var title = this.buttonTitles[button.bID];
    var titleDOM;
    
    if (title) {
      titleDOM = this.mainButtonTitles.jSh(".aur-lo-btntitle--" + button.bID)[0];
      
      clearTimeout(title.visibleTimeout);
    } else {
      titleDOM = jSh.d(".aur-lo-actbar-button-title.aur-lo-btntitle--" + button.bID, null, jSh.c("span", {text: button.title}));
      title    = {
        button: button,
        title: button.title,
        visibleTimeout: null
      };
      
      this.buttonTitles[button.bID] = title;
      this.mainButtonTitles.appendChild(titleDOM);
    }
    
    var btnCRect  = button.buttonDOM.getBoundingClientRect();
    var wrapCRect = this.mainButtonTitles.getBoundingClientRect();
    
    titleDOM.classList.add("aur-lo-visible");
    titleDOM.css({
      top: ((btnCRect.top - wrapCRect.top) + ((btnCRect.bottom - btnCRect.top) / 2)) + "px"
    });
  },
  
  unexplainButton(button) {
    var title = this.buttonTitles[button];
    
    if (title) {
      var titleDOM = this.mainButtonTitles.jSh(".aur-lo-btntitle--" + button)[0];
      
      clearTimeout(title.visibleTimeout);
      titleDOM.classList.remove("aur-lo-visible");
      
      title.visibleTimeout = setTimeout((dom, bID) => {
        this.buttonTitles[bID] = undefined;
        this.mainButtonTitles.removeChild(dom);
      }, 360, titleDOM, button);
    }
  },
  
  // Remove all titles
  clearButtonTitles(button) {
    Object.getOwnPropertyNames(this.buttonTitles).forEach(title => this.unexplainButton(title));
  }
});

// ActionBar Button
function determineActionButton(src) {
  if (src instanceof SVGElement) {
    src.classList.add("aur-lo-actbar-button-content");
    return src;
  } else if (typeof src === "string" && src.trim())
    return jSh.d(".aur-lo-actbar-button-content.aur-lo-actbar-button-text", src.trim());
  else
    return jSh.d(".aur-lo-actbar-button-content.aur-lo-actbar-button-text", "ACTBTN");
}

// ActionBar Button Constructor
function ActionBarButton(options) {
  lces.types.component.call(this);
  var that = this;
  
  options = jSh.type(options) === "object" ? options : {};
  
  // Set options initially
  this.modeAction = options.modeAction instanceof ModePaneMode ? options.modeAction : null;
  this.activate   = typeof options.activate === "function" ? options.activate : null;
  this.loInstance = null;
  
  // Assign "mainButton"
  if (this.modeAction)
    this.modeAction.mainButton = this;
  
  // Create elements
  var innerButtonDOM  = determineActionButton(options.button);
  var innerButtonWrap = jSh.d(".aur-lo-actbar-button-inner-wrap", null, innerButtonDOM);
  var headerLogo      = innerButtonDOM.cloneNode(true);
  var buttonDOM       = jSh.d(".aur-lo-actbar-button.aur-lo-actbar-button-input", null, innerButtonWrap);
  
  this.buttonDOM = buttonDOM;
  
  // LCES States
  this.setState("buttonType", this.modeAction ? "mode" : "simple");
  this.setState("visible", true);
  this.setState("disabled", false);
  this.setState("toggle", false);
  this.setState("visualToggle", false);
  this.setState("buttonScale", 1);
  this.setState("title", null);
  
  // ---- State Conditions ----
  
  this.addStateCondition("buttonType", function(type) {
    if (type === "mode" || type === "simple" || type === null)
      return true;
    else
      return false;
  });
  
  this.addStateCondition("buttonScale", function(scale) {
    this.proposedValue = Math.max(Math.min(jSh.numOp(scale, 1), 1), 0);
    return true;
  });
  
  // ---- Event listeners ----
  
  // pseudo-event: modeaction
  var onClickChangeMode = () => {
    this.modeAction.active = !this.modeAction.active;
  }
  
  if (this.modeAction)
    buttonDOM.addEventListener("click", onClickChangeMode);
  else if (this.activate)
    buttonDOM.addEventListener("click", this.activate);
  
  // lces-state: type
  var oldButtonType = this.buttonType;
  this.addStateListener("buttonType", function(type) {
    if (type === "mode") {
      buttonDOM.removeEventListener("click", that.activate);
      
      if (that.modeAction)
        buttonDOM.addEventListener("click", onClickChangeMode);
    } else if (type === "simple") {
      buttonDOM.removeEventListener("click", onClickChangeMode);
      
      if (that.activate)
        buttonDOM.addEventListener("click", that.activate);
    } else {
      
      if (that.activate)
        buttonDOM.removeEventListener("click", that.activate);
      if (onClickChangeMode)
        buttonDOM.removeEventListener("click", onClickChangeMode);
    }
  });
  
  if (jSh.strOp(options.title, "").trim()) {
    var buttonTitleTimeout = null;
    buttonDOM.addEventListener("mouseover", () => {
      clearTimeout(buttonTitleTimeout);
      
      this.loInstance.actionBar.explainButton(this);
    });
    
    buttonDOM.addEventListener("mouseout", () => {
      clearTimeout(buttonTitleTimeout);
      
      buttonTitleTimeout = setTimeout(() => {
        this.loInstance.actionBar.unexplainButton(this.bID);
      }, 125);
    });
  }
  
  // lces-state: disabled
  this.addStateListener("disabled", (disabled) => {
    if (disabled) {
      oldButtonType   = this.buttonType;
      this.buttonType = null;
      
      buttonDOM.classList.add("aur-lo-actbar-button-disabled");
    } else {
      this.buttonType = oldButtonType;
      
      buttonDOM.classList.remove("aur-lo-actbar-button-disabled");
    }
  });
  
  // lces-state: toggle
  if (typeof options.toggleState === "boolean") {
    // Do nothing here???
  } else {
    if (this.modeAction)
      this.modeAction.addStateListener("active", (active) => {
        this.visualToggle = active;
      });
  }
  
  this.addStateListener("toggle", (toggle) => {
    this.visualToggle = !!toggle;
  });
  
  // lces-state: visualToggle
  this.addStateListener("visualToggle", (visualToggle) => {
    if (visualToggle) {
      this.buttonDOM.classList.add("aur-lo-actbar-button-active");
    } else {
      this.buttonDOM.classList.remove("aur-lo-actbar-button-active");
    }
  });
  
  // lces-state: visible
  this.addStateListener("visible", (visible) => {
    if (visible) {
      this.loInstance.actionBar.showButton(this);
      
      // this.loInstance.actionBar.updateHeight();
    } else {
      this.loInstance.actionBar.hideButton(this);
      
      // this.loInstance.actionBar.updateHeight();
      // this.buttonDOM.style.position = "relative";
      //
      // this.buttonDOM.classList.add("aur-lo-actbar-button-hidden");
    }
  });
  
  // lces-state: buttonScale
  this.addStateListener("buttonScale", (scale) => {
    innerButtonWrap.css({
      transform: "scale(" + scale + ")"
    });
  });
  
  // lces-state: title
  this.addStateListener("title", (title) => {
    if (title && typeof title === "string" && title.trim()) {
      buttonDOM.title = title;
    } else {
      buttonDOM.removeAttribute("title");
    }
  });
  
  // Apply some (possible) options
  this.buttonScale = options.buttonScale;
  
  if (typeof options.toggleState === "boolean")
    this.toggle = options.toggleState;
  
  if (options.title)
    this.title = options.title;
  
  if (typeof options.toggleState === "boolean")
    this.toggle = options.toggleState;
}

jSh.inherit(ActionBarButton, lces.types.component);

// LO ModePane Constructor
function ModePane(overlay) {
  lces.types.component.call(this);
  
  // Create elements
  var mainBody   = jSh.d(".aur-lo-modepane.visible.aur-lo-disabled");
  var innerModes = jSh.d(".aur-lo-modepane-modes");
  
  mainBody.appendChild(innerModes);
  
  this.innerModes = innerModes;
  this.registeredModes = [];
  
  // LCES States
  this.setState("visible", true);
  this.setState("mounted", false);
  
  // Events
  
  // lces-state: visible
  this.addStateListener("visible", (visible) => {
    if (visible) {
      mainBody.classList.add("visible");
    } else {
      mainBody.classList.remove("visible");
    }
  });
  
  // lces-state: mounted
  this.addStateListener("mounted", (mounted) => {
    if (mounted)
      document.body.appendChild(mainBody);
    else if (mainBody.parentNode)
      document.body.removeChild(mainBody);
  });
  
  // lces-state: enabled
  this.addStateListener("enabled", (enabled) => {
    if (enabled) {
      mainBody.classList.remove("aur-lo-disabled");
    } else {
      mainBody.classList.add("aur-lo-disabled");
    }
  });
}

jSh.inherit(ModePane, lces.types.component);

jSh.extendObj(ModePane.prototype, {
  addMode(mode) {
    var regModes = this.registeredModes;
    var index    = regModes.indexOf(mode);
    
    if (mode instanceof ModePaneMode && index === -1) {
      regModes.push(mode);
      mode.pane = this;
      
      this.innerModes.appendChild(mode.mainBody);
    }
  }
});

// LO ModePane Mode Abstract Constructor
function ModePaneMode(options, loInstance) {
  lces.types.component.call(this);
  
  // Active class: .aur-lo-active
  // Active class: .aur-lo-active
  var mainBody = jSh.d(".aur-lo-modepane-view.aur-lo-animated");
  
  // Make properties
  this.loInstance      = loInstance;
  this.name            = options.name;
  this.mainBody        = mainBody;
  this.buttonCount     = 0;
  this.buttons         = [];
  this.activeAutomatic = typeof options.activeAutomatic === "undefined"
                       ? true
                       : !!options.activeAutomatic;
  
  // LCES States
  this.setState("active", false);
  this.setState("animated", false);
  
  // Events
  
  // lces-state: active
  this.addStateListener("active", (active) => {
    if (active) {
      mainBody.classList.add("aur-lo-active");
      
      // Change bar mode
      if (this.buttons.length > 0)
        loInstance.actionBar.mode = this;
    } else {
      mainBody.classList.remove("aur-lo-active");
    }
  });
  
  // lces-state: animated
  this.addStateListener("animated", (animated) => {
    if (animated) {
      mainBody.classList.add("aur-lo-animated");
    } else {
      mainBody.classList.remove("aur-lo-animated");
    }
  });
}

jSh.inherit(ModePaneMode, lces.types.component);

jSh.extendObj(ModePaneMode.prototype, {
  addButton(options) {
    var button = new ActionBarButton(options);
    
    button.loInstance = this.loInstance;
    button.loMode     = this;
    button.bID        = this.name + "btn" + this.buttonCount++;
    
    this.buttons.push(button);
    return button;
  }
});

// Interface
reg.interface = {
  Instance: LightsOutOverlay,
  tab: LOTab
};

// Styles
var defZInd = "1000000";
var defMntAnim = "500ms ease-out";

var defBG  = "rgba(0, 0, 0, 0.75)";
var defCol = "rgba(255, 255, 255, 0.5)";
var defColLight = "rgba(255, 255, 255, 0.2)";
var defColLighter = "rgba(255, 255, 255, 0.075)";
var defColNone = "rgba(255, 255, 255, 0)";

var defABCapOff = "50px";
var defABRad = "6px";
var defABAnim = "250ms cubic-bezier(.33,.04,.14,.99)";
var defABAnimSemiSlow = "325ms cubic-bezier(.33,.04,.14,.99)";
var defABAnimSlow = "400ms cubic-bezier(.33,.04,.14,.99)";
var defABBtnWidth = "90%";

// Actionbar Button
var defABBtnToggle = "#20BFFF";
var defABBtnTextToggle = "rgba(32, 191, 255, 0.9)";

var defVisibleAnim = "350ms cubic-bezier(.31,.26,.1,.92)";
var defVisibleAnimSlow = "500ms cubic-bezier(.31,.26,.1,.92)";

style.styleBlock(`
  // ----------------
  //    LO Overlay
  // ----------------
  
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
  
  // ----------------
  //    Action Bar
  // ----------------
  
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
  
  // ----------------
  //     Mode Pane
  // ----------------
  
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
  
  // ----------------
  //      PLAYER
  // ----------------
  
  .aur-lo-player-animated {
    transition: left ${ defABAnim }, top ${ defABAnim }, width ${ defABAnim }, height ${ defABAnim };
  }
`);
