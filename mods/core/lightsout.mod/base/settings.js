// Settings.js

var sett = AUR.import("aur-settings");

reg.interface = function() {
  sett.setDefault("lightsout", {
    // General
    autostart: sett.Setting("Autostart Lights Out", "boolean", false),
    clickShadeCloses: sett.Setting("Clicking darkness closes Lights Out", "boolean", false),
    
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
    fullscreen: sett.Setting("Fullscreen by default", "boolean", true),
    scaleGuideSizes: sett.Setting("Scale guide sizes (min 20%)", "string", "50%, 75%, 90%"),
    
    shadeBar: {
      height: sett.Setting("Shading bar height (pixels)", "number", 80),
      width: sett.Setting("Shading bar width (pixels)", "number", 500),
      scrubberWidth: sett.Setting("Shading bar scrubber width (pixels)", "number", 100)
    },
    
    mirrorPriority: {
      enabled: sett.Setting("Mirror Priority", "boolean", false),
      
      uploaderFactor: sett.Setting("Uploader Factor", "boolean", true),
      mirrorFactor: sett.Setting("Mirror Factor", "boolean", true),
      
      uploaderFactorOrder: sett.Setting("Uploader Factor Ordering", "number", 0),
      mirrorFactorOrder: sett.Setting("Mirror Factor Ordering", "boolean", 1),
    },
    
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
    origPlayerHeight: sett.Setting("Player height (in percentage)", "number", 100),
    
    version: {
      rev: sett.Setting("Lights Out revision number, to determine if settings should be wiped", "number", 0)
    }
  });
}

// Initialize the settings
reg.interface();
