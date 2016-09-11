// AUR AU LO Player Messaging API
AUR_NAME = "AUR LO Style Fixes";
AUR_DESC = "AUR LO Style Fixes";
AUR_VERSION = [0, 1, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";

var style = AUR.import("aur-styles");

style.styleBlock(style.important(`
  #overlay, #overlay2 {
    display: none;
  }
`));
