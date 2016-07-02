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
    
    AUREntry.addEventListener("click", function() {
      prefs.visible = !prefs.visible;
      prefs.centered = false;
      prefs.draggable = true;
    });
    
    jSh("#left-nav").insertBefore(AUREntry, jSh("#left-nav").getChild(0));
  }
});
