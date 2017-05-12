// Lights Out UI Library
AUR_NAME = "Lights Out";
AUR_DESC = "Lights Out Base Library";
AUR_VERSION = [0, 1, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
// AUR_INTERFACE = "auto";
AUR_RUN_AT = "doc-end";

// Get dependencies
var aj = AUR.import("ajaxify");
var sett = AUR.import("aur-settings");

var losett = AUR.import("./base/settings");
var Overlay = AUR.import("./base/ui/overlay");
var modes = AUR.import("./ui/modes");
var buttons = AUR.import("./ui/buttons");

var aurtab = AUR.import("./base/aur-tab");
var mptab = AUR.import("./ui/tabs/mirror-priority");

var trackerModeUI = AUR.import("./ui/modes/ep-tracker.js");
var infoCaptionModeUI = AUR.import("./ui/modes/info-caption.js");
var scaleMoveModeUI = AUR.import("./ui/modes/scale-move.js");
var shadeLevelModeUI = AUR.import("./ui/modes/shading-level.js");
var fullscreenUI = AUR.import("./ui/modes/fullscreen.js");
var mirrorPriorityUI = AUR.import("./ui/modes/mirror-priority.js");

// Lights Out options constructor
function Options() {
  lces.types.component.call(this);
  
  var getPlayer            = null;
  var getEpisodeLinks      = null;
  var getEpisodeInfo       = null;
  var getTrackerData       = null;

  var infoCaption          = true;

  var scaleMove            = true;
  var scaleMoveConfig      = true;
  var scaleMoveConfigUI    = null;

  var shadingLevelUI       = true;
  var shadingLevelConfig   = true;
  var shadingLevelConfigUI = null;

  var generalConfigUI      = null;

  var episodeTracker       = true;
  var fullscreen           = true;
  var mirrorPriority       = true;
  var userModName          = null;
  var aurTab               = true;

  var defVideoWidth        = 100;
  var defVideoHeight       = 100;
  
  // Type utils
  function onlyBoolean(value) {
    if (typeof value === "boolean") {
      return true;
    } else {
      throw new TypeError("LightsOut: Options." + this.name + " needs to be a boolean");
    }
  }
  
  function onlyObject(value) {
    if (jSh.type(value) === "object") {
      return true;
    } else {
      throw new TypeError("LightsOut: Options." + this.name + " needs to be a object");
    }
  }
  
  function onlyFunction(value) {
    if (typeof value === "function") {
      return true;
    } else {
      throw new TypeError("LightsOut: Options." + this.name + " needs to be a function");
    }
  }
  
  function onlyPercent(value) {
    var num = jSh.numProp(value, null);
    
    if (num === null || num > 100 || num < 0) {
      throw new TypeError("LightsOut: Options." + this.name + " needs to be a number from 0 to 100");
    }
    
    return true;
  }
  
  // Conditions
  this.setState("getPlayer", getPlayer);
  this.addStateCondition("getPlayer", onlyFunction);
  
  this.setState("getEpisodeLinks", getEpisodeLinks);
  this.addStateCondition("getEpisodeLinks", onlyFunction);
  
  this.setState("infoCaption", infoCaption);
  this.addStateCondition("infoCaption", onlyBoolean);
  
  this.setState("getEpisodeInfo", getEpisodeInfo);
  this.addStateCondition("getEpisodeInfo", onlyFunction);
  
  this.setState("scaleMove", scaleMove);
  this.addStateCondition("scaleMove", onlyBoolean);
  
  this.setState("scaleMoveConfig", scaleMoveConfig);
  this.addStateCondition("scaleMoveConfig", onlyBoolean);
  
  this.setState("scaleMoveConfigUI", scaleMoveConfigUI);
  this.addStateCondition("scaleMoveConfigUI", onlyObject);
  
  this.setState("shadingLevelUI", shadingLevelUI);
  this.addStateCondition("shadingLevelUI", onlyBoolean);
  
  this.setState("shadingLevelConfig", shadingLevelConfig);
  this.addStateCondition("shadingLevelConfig", onlyBoolean);
  
  this.setState("shadingLevelConfigUI", shadingLevelConfigUI);
  this.addStateCondition("shadingLevelConfigUI", onlyObject);
  
  this.setState("generalConfigUI", generalConfigUI);
  this.addStateCondition("generalConfigUI", onlyObject);
  
  this.setState("episodeTracker", episodeTracker);
  this.addStateCondition("episodeTracker", onlyBoolean);
  
  this.setState("getTrackerData", getTrackerData);
  this.addStateCondition("getTrackerData", onlyFunction);
  
  this.setState("fullscreen", fullscreen);
  this.addStateCondition("fullscreen", onlyBoolean);
  
  this.setState("mirrorPriority", mirrorPriority);
  this.addStateCondition("mirrorPriority", onlyBoolean);
  
  this.setState("aurTab", aurTab);
  this.addStateCondition("aurTab", onlyBoolean);
  
  this.setState("userModName", userModName);
  this.addStateCondition("userModName", function(name) {
    if (typeof name === "string") {
      var exists = AUR.modProbe.exists(name);
      
      if (exists) {
        return true;
      } else {
        throw new ReferenceError("LightsOut: Options.userModName \"" + name + "\" module doesn't exist");
      }
    } else {
      throw new TypeError("LightsOut: Options.userModName needs to be a string name of an existing AUR module");
    }
  });
  
  this.setState("defVideoWidth", defVideoWidth);
  this.addStateCondition("defVideoWidth", onlyPercent);
  
  this.setState("defVideoHeight", defVideoHeight);
  this.addStateCondition("defVideoHeight", onlyPercent);
}

jSh.inherit(Options, lces.types.component);

Options.prototype.check = function() {
  // Final conclusions, disable things that require other required things
  if (!this.getPlayer) {
    throw new Error("LightsOut: Options.getPlayer callback is required, aborting");
  }
  
  if (this.infoCaption && !this.getEpisodeInfo) {
    this.infoCaption = false;
    console.warn("LightsOut: Options.infoCaption requires Options.getEpisodeInfo callback, disabling");
  }
  
  if (this.episodeTracker && !this.getTrackerData) {
    this.episodeTracker = false;
    console.warn("LightsOut: Options.episodeTracker requires Options.getTrackerData callback, disabling");
  }
  
  if (this.episodeTracker && !this.getEpisodeInfo) {
    this.episodeTracker = false;
    console.warn("LightsOut: Options.episodeTracker requires Options.getEpisodeInfo callback, disabling");
  }
}

// Lights Out's only instance is stored here
var oneInstance = null;

// Lights Out abstract interface constructor
reg.interface = function LightsOutFullInstance(optionsArg) {
  // Make sure there were no previous instances
  if (oneInstance) {
    if (this instanceof LightsOutFullInstance)
      console.warn("LightsOut: A Lights Out instance is already running...");
    
    return oneInstance;
  }
  
  if (jSh.type(optionsArg) !== "object")
    throw new Error("LightsOut: Missing options object");
  
  // Make sure we're running an instance
  if (!(this instanceof LightsOutFullInstance))
    return new LightsOutFullInstance(optionsArg);
  
  // Set instance
  oneInstance = this;
  
  // Initiate LCES component
  lces.types.group.call(this);
  var that = this;
  
  var options = this.options = new Options();
  
  // Apply options
  jSh.extendObj(options, optionsArg);
  options.check();
  
  // =====================================================
  //   Options were supplied correctly, now start up UI
  // =====================================================
  
  // Start settings
  // losett(); // TODO: Check this, maybe it _should_ be called here and not in the subfile
  
  // Make AUR Lights Out user config tab
  var lotab = aurtab(options);
  
  // Make overlay
  var loinst = new Overlay(lotab, options);
  
  // Prepare document
  jSh(document);
  
  // Get episode details and episode links
  if (options.getEpisodeInfo || options.getEpisodeLinks) {
    aj.onEvent("filter", /./, function(e) {
      var dom = e.dom;
      
      if (options.getEpisodeInfo) {
        var newDetails = options.getEpisodeInfo(dom, e);
        
        if (newDetails) {
          loinst.episodeDetails = newDetails;
        } else {
          loinst.episodeDetails = null;
        }
      }
      
      if (options.getEpisodeLinks) {
        loinst._metadata.episodelinks = options.getEpisodeLinks(dom, e) || {};
        loinst.triggerEvent("episodelinks", {});
      }
    });
    
    // First time try to get the episode links
    if (options.getEpisodeLinks) {
      setTimeout(function() {
        loinst._metadata.episodelinks = options.getEpisodeLinks(jSh(document), { route: location.pathname + "" }) || {};
        loinst.triggerEvent("episodelinks", {});
      }, 10);
    }
    
    // First time try to get the episode info
    if (options.getEpisodeInfo) {
      var episodeDetails = options.getEpisodeInfo(jSh(document), { route: location.pathname + "" });
      
      if (episodeDetails) {
        loinst.episodeDetails = episodeDetails;
      }
    }
  }
  
  // Make modes
  var lomodes = this.modes = modes(loinst, options);
  
  // Make actionbar buttons
  var lobuttons = buttons(this, loinst, lomodes, lotab, options);
  
  // Make each mode's UI
  
  // Make tracker
  if (options.episodeTracker) {
    trackerModeUI(loinst, lomodes.epTrackerMode, lomodes.infoCaptionMode, options);
  }
  
  // Make info caption
  if (options.infoCaption) {
    infoCaptionModeUI(loinst, lomodes.infoCaptionMode, lomodes.epTrackerMode, options);
  }
  
  // Make scale move
  if (options.scaleMove) {
    scaleMoveModeUI(loinst, lomodes.scalingMoveMode, lobuttons, options);
  }
  
  // Make shading level
  if (options.shadingLevelUI) {
    shadeLevelModeUI(loinst, lomodes.shadingMode, options);
  }
  
  // Make fullscreen events
  if (options.fullscreen) {
    fullscreenUI(loinst, lomodes.fullscreenMode);
  }
  
  // Make mirrorPriority
  if (options.mirrorPriority) {
    var loMPTab = mptab(loinst, options);
    mirrorPriorityUI(loinst, lomodes.mirrorPriorityMode, loMPTab);
  }
  
  // Link `mounted` state with loinst/overlay
  this.setState("mounted", false);
  this.addMember(loinst);
  
  // Add properties
  this.main = loinst;
  var player = null;
  
  // Get the player
  aj.onEvent("load", /./, function(e) {
    player = options.getPlayer(document);
    
    if (player) {
      if (loinst.enabled) {
        loinst.player = player;
      }
      
      // Enable LO if autostart is on
      if (sett.get("lightsout.autostart") && player) {
        loinst.player = player;
        loinst.enabled = true;
        
        loinst.actionBar.visible = true;
      }
    } else {
      loinst.player = null;
      loinst.enabled = false;
    }
  });
  
  player = options.getPlayer(document);
  
  if (player) {
    var called = false;
    
    loinst.addStateCondition("enabled", function TempCallback() {
      if (!called) {
        loinst.player = player;
        called = true;
      }
      
      return true;
    });
    
    if (sett.get("lightsout.autostart"))
      loinst.enabled = true;
  }
  
  // Determine if settings need to be wiped
  var latestRevision = 6;
  
  if (sett.get("lightsout.version.rev") < latestRevision) {
    sett.resetDefault("lightsout");
    
    sett.set("lightsout.version.rev", latestRevision);
  }
};

jSh.inherit(reg.interface, lces.types.group);
