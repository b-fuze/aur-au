// Player.js - Styles

var style = AUR.import("aur-styles");

AUR.onLoaded("../style-defs", function() {
  var styleDefs = AUR.import("../style-defs");
  var defABAnim = styleDefs.defABAnim;
  
  style.styleBlock(`
    .aur-lo-player-animated {
      transition: left ${ defABAnim }, top ${ defABAnim }, width ${ defABAnim }, height ${ defABAnim };
    }
  `);
});
