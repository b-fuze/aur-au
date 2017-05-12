// aur-tab.js
// Makes the AUR Lights Out tab interface

var ui = AUR.import("aur-ui");

reg.interface = function(options) {
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
  
  if (options.episodeTracker)
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
  
  if (options.mirrorPriority) {
    // Add Mirror Priority option
    loSettUIGen.textProp(null, 6, {
      data: "Mirror priority"
    });
    
    loSettUIGen.buttonProp(null, 4, {
      fill: true
    }).addButton("Change priority", function() {
      // Open the configure thingy here...
      var tab = ui.prefs.getTab("lightsout-mirror-priority");
      tab.selected = true;
    });
    
    loSettUIGen.toggleProp(null, 2, {
      align: "right",
      link: "lightsout.mirrorPriority.enabled"
    });
    // End: Add Mirror Priority
  }
  
  if (options.getEpisodeInfo)
    loSettUINav.prop({
      link: "lightsout.confirmEpisodeNav",
      width: 7,
      align: "right"
    });
  
  if (options.episodeTracker) {
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
  }
  
  if (options.fullscreen) {
    loSettUIUI.prop({
      link: "lightsout.fullscreen",
      width: 7,
      align: "right"
    });
  }
  
  // Remove tab, invisible in the beginning
  // LOTab.hidden = true; FIXME: What is this for?
  
  // Check if tab should always be hidden
  if (!options.aurTab) {
    LOTab.hidden = true;
    
    LOTab.addStateCondition("hidden", function(visible) {
      // Prevent any future changes
      return false;
    });
  }
  
  return LOTab;
}
