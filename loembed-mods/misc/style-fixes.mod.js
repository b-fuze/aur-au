// AUR AU LO Player Messaging API
AUR_NAME = "AUR LO Style Fixes";
AUR_DESC = "AUR LO Style Fixes";
AUR_VERSION = [0, 1, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";

var style = AUR.import("aur-styles");

style.styleBlock(style.important(`
  body, html {
    margin: 0px;
    padding: 0px;
  }
  
  // Flash fixes
  div#player_code_wrapper {
    height: 100% !important;
  }
  
  // HTML5 Fixes
  #overlay, #overlay2 {
    display: none;
  }
  
  span#player_code_controlbar.jwcontrolbar {
    max-width: none;
  }
  
  div#player_code.jwplayer {
    height: 100%;
  }
`));
