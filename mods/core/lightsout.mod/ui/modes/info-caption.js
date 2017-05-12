// Info-caption.js

var style = AUR.import("aur-styles");

reg.interface = function InitLightsOutInfoCaption(main, infoCaptionMode, epTrackerMode, options) {
  infoCaptionMode.mainBody.css({
    height: "100%",
    pointerEvents: "none",
    transform: "translate(0px, 0px)"
  });

  infoCaptionMode.mainBody.classList.add("aur-lo-modepane-view-info-caption");

  style.styleBlock(`
    .aur-lo-modepane-view.aur-lo-modepane-view-info-caption.aur-lo-animated {
      transition: opacity 450ms ease-out, left 0ms linear 460ms;
    }
    
    .aur-lo-modepane-view.aur-lo-modepane-view-info-caption.aur-lo-active.aur-lo-animated {
      transition: opacity 450ms ease-out, left 0ms linear 0ms !important;
    }
  `);

  function InfoCaption(loInstance) {
    var animeTitle = jSh.d(".aur-lo-anime-title");
    var epNumber   = jSh.c("span");
    var epTitle    = jSh.d(".aur-lo-episode-title");
    var mainBody   = jSh.d(".aur-lo-info-caption-wrap", null, [
      animeTitle,
      jSh.d(".aur-lo-episode-number", "Episode ", epNumber),
      epTitle
    ]);
    
    this.mainBody = mainBody;
    
    function updateCaptions(details) {
      clearTimeout(visibleTimeout);
      
      if (!details)
        return;
      
      animeTitle.textContent = details.animeTitle;
      epNumber.textContent   = details.episode;
      epTitle.textContent    = details.episodeTitle || "";
      
      if (loInstance.enabled) {
        if (!infoCaptionMode.active)
          infoCaptionMode.active = true;
        else
          visibleTimeout = setTimeout(function() {
            infoCaptionMode.active = false;
          }, 3500);
      }
    }
    
    loInstance.addStateListener("episodeDetails", updateCaptions);
    
    infoCaptionMode.addStateCondition("active", function(active) {
      if (active && options.episodeTracker) {
        // Prevent info caption from showing if episode tracker is active
        return !epTrackerMode.active;
      } else {
        return true;
      }
    });
    
    var visibleTimeout = null;
    infoCaptionMode.addStateListener("active", function(active) {
      clearTimeout(visibleTimeout);
      
      if (active) {
        visibleTimeout = setTimeout(function() {
          infoCaptionMode.active = false;
        }, 3500);
      }
    });
    
    loInstance.addStateListener("enabled", function(enabled) {
      if (enabled) {
        setTimeout(function() {
          infoCaptionMode.active = true;
        }, 500);
      }
    });
    
    // A little initation
    updateCaptions(loInstance.episodeDetails);
  }

  infoCaptionMode.mainBody.appendChild(new InfoCaption(main).mainBody);
}
