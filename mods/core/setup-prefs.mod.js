AUR.onLoaded("aur-ui", "aur-ui-prefs", "aur-settings", "aur-styles", function() {
  var ui = AUR.import("aur-ui");
  var prefs = ui.prefs;
  
  // Add to nav
  if (jSh("#left-nav")) {
    var AUREntry = jSh.c("li", {
      child: jSh.c("span", ".ddtitle", "AUR"),
      attr: {
        style: "cursor: pointer;"
      }
    });
    
    // dom-event: Open AUR prefs window
    AUREntry.addEventListener("click", function() {
      prefs.visible = !prefs.visible;
    });
    
    // lces-state: visible
    prefs.window.addStateListener("visible", function makeDraggable(visible) {
      if (visible) {
        prefs.window.removeStateListener("visible", makeDraggable);
        
        prefs.centered = false;
        prefs.draggable = true;
      }
    });
    
    // Add to top nav on AU
    jSh("#left-nav").insertBefore(AUREntry, jSh("#left-nav").getChild(0));
  }
});
