// Modes.js

reg.interface = function(main, options) {
  var modes = {};
  
  // Add modes
  if (options.shadingLevelUI) {
    modes.shadingMode = main.addMode("shading-level");
  }
  
  if (options.getEpisodeLinks) {
    modes.nextEpisodeMode = main.addMode("next-ep");
    modes.prevEpisodeMode = main.addMode("prev-ep");
  }
  
  if (options.getEpisodeInfo) {
    if (options.getTrackerData) {
      modes.epTrackerMode = main.addMode("ep-tracker");
    }
    
    modes.infoCaptionMode = main.addMode("info-caption");
  }
  
  if (options.scaleMove) {
    modes.scalingMoveMode = main.addMode("scale-move");
  }
  
  if (options.fullscreen) {
    modes.fullscreenMode = main.addMode("fullscreen");
  }
  
  if (modes.mirrorPriority) {
    modes.mirrorPriorityMode = main.addMode("mirror-priority");
  }
  
  modes.extraOptionsMode = main.addMode("extra-options");
  
  return modes;
}
