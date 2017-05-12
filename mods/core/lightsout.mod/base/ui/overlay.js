// Overlay.js

var ActionBar;
var ModePane;
var ModePaneMode;
var Tracker;
var styleDefs;

// A style definition
var defABAnim;

AUR.onLoaded("./actionbar", "./modepane", "/misc/ep-tracker", "./modepane-mode", "/styles/style-defs", function() {
  ActionBar = AUR.import("./actionbar");
  ModePane = AUR.import("./modepane");
  ModePaneMode = AUR.import("./modepane-mode");
  Tracker = AUR.import("/misc/ep-tracker");
  styleDefs = AUR.import("/styles/style-defs");
  
  // Get styleDefs
  defABAnim = parseInt(styleDefs.defABAnim, 10);
});

// For uniquely identifying LO Instances
var LOInstanceCount = 0;

// LO Instance Constructor
function LightsOutOverlay(lotab, options) {
  lces.types.component.call(this);
  var that = this;
  
  // Utils
  function onlyBoolean(val) {
   this.proposedValue = !!val;
   return true;
  }
  
  function onlyDimension(val) {
    // Check if valid value, otherwise transform to null
    this.proposedValue = jSh.numOp(parseInt(val, 10), null) === null ? null : val;
    return true;
  }
  
  var gotOriginalPlayerAttr;
  var playerAttributes;
  var playerPosition;
  
  function getOriginalPlayerDimensions(player) {
    playerAttributes = player.getAttribute("width") ? {
      width: player.getAttribute("width")
    } : null;
    
    if (player.getAttribute("height")) {
      playerAttributes = playerAttributes ? jSh.extendObj(playerAttributes, {
        height: player.getAttribute("height")
      }) : {
        height: player.getAttribute("height")
      };
    }
    
    playerPosition = getComputedStyle(player)["position"];
    gotOriginalPlayerAttr = true;
    
    console.log("ATTRIBUTES", playerAttributes);
  }
  
  // Player util functions
  var raisingPlayerTimeout = null;
  function raisePlayer() {
    var player = that.player;
    
    if (!gotOriginalPlayerAttr) {
      getOriginalPlayerDimensions(player);
    }
    
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
      
      if (playerAttributes) {
        player.setAttribute("style", player.getAttribute("style").replace(/(width|height):\s*\d+([a-z%]+)?\s*(!?[a-z]+)?;?/g, ""))
        
        player.css({
          position: playerPosition
        });
        
        if (playerAttributes.width) {
          player.setAttribute("width", playerAttributes.width);
        }
        
        if (playerAttributes.height) {
          player.setAttribute("height", playerAttributes.height);
        }
      }
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
  this.setState("player", null);
  
  if (options.episodeTracker)
    this.tracker = new Tracker(this);
  
  // Events
  this.addStateCondition("enabled", onlyBoolean);
  this.addStateCondition("mounted", onlyBoolean);
  
  // Prevent from enabling if LO's invoking module is disabled
  this.addStateCondition("enabled", function(enabled) {
    if (enabled && that._metadata.isModDisabled) {
      return false;
    }
    
    return true;
  });
  
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
        raisingPlayerTimeout = setTimeout(lowerPlayer, defABAnim, 10);
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
  
  if (options.episodeTracker) {
    // lces-state: episodeDetails
    this.addStateListener("episodeDetails", (details) => {
      if (details) {
        this.tracker.options = options;
        this.tracker.auid = details.animeUnique;
        this.tracker.loadAnimeDataCache();
        
        console.log("AUID", details.animeUnique);
      }
    });
  }
  
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
        raisingPlayerTimeout = setTimeout(lowerPlayer, defABAnim);
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
      if (!gotOriginalPlayerAttr) {
        getOriginalPlayerDimensions(player);
      }
      
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
        x: options.defVideoWidth,
        y: options.defVideoHeight
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
  
  // Easy access to sub-components methods, convenience method
  this.addButton = this.actionBar.addButton.bind(this.actionBar);
  
  // Add events
  this.addEvent("moddisable");
  this.addEvent("modenable");
  this.addEvent("episodelinks");
  this.addEvent("videopage");
  
  this._metadata = {
    episodelinks: null,
    isModDisabled: false
  };
  
  this.on("moddisable", function() {
    lotab.hidden = true;
    
    that._metadata.isModDisabled = true;
    that.enabled = false;
  });
  
  this.on("modenable", function() {
    lotab.hidden = false;
    
    that._metadata.isModDisabled = false;
  });
  
  // Properties
  this.epTrackerInitiated = false;
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

reg.interface = LightsOutOverlay;
