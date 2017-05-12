// Fullscreen.js

var sett = AUR.import("aur-settings");

reg.interface = function StartFullscreen(main, fullscreenMode) {
  var doc  = document;
  var body = doc.body;
  
  var fullscreenElement;
  var fullscreenEvent;
  var goFullscreen   = body.requestFullscreen || body.webkitRequestFullScreen || body.mozRequestFullScreen;
  var exitFullscreen = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen;
  
  goFullscreen = goFullscreen.bind(body);
  exitFullscreen = exitFullscreen.bind(doc);
  
  if (body.requestFullscreen) {
    fullscreenElement = "fullscreenElement";
    fullscreenEvent = "fullscreenchange";
  } else if (body.webkitRequestFullScreen) {
    fullscreenElement = "webkitFullscreenElement";
    fullscreenEvent = "webkitfullscreenchange";
  } else if (body.mozRequestFullScreen) {
    fullscreenElement = "mozFullScreenElement";
    fullscreenEvent = "mozfullscreenchange";
  }
  
  fullscreenMode.addStateListener("active", function(active) {
    if (active) {
      goFullscreen();
      
      setTimeout(function() {
        if (!document[fullscreenElement])
          fullscreenMode.active = false;
      }, 1000);
    } else {
      exitFullscreen();
    }
  });
  
  main.addStateListener("enabled", function(enabled) {
    if (enabled) {
      fullscreenMode.active = sett.get("lightsout.fullscreen");
    } else {
      fullscreenMode.active = false;
    }
  });
  
  doc.addEventListener(fullscreenEvent, function() {
    if (document[fullscreenElement] === body) {
      fullscreenMode.active = true;
    } else {
      fullscreenMode.active = false;
    }
  });
}
