// Style-defs.js

var style = AUR.import("aur-styles");

// For pretty fonts
style.import("https://fonts.googleapis.com/css?family=Roboto:300");

// Style definitions
reg.interface = {
  defZInd: "1000000",
  defMntAnim: "500ms ease-out",

  defBG: "rgba(0, 0, 0, 0.75)",
  defCol: "rgba(255, 255, 255, 0.5)",
  defColLight: "rgba(255, 255, 255, 0.2)",
  defColLighter: "rgba(255, 255, 255, 0.075)",
  defColNone: "rgba(255, 255, 255, 0)",

  defABCapOff: "50px",
  defABRad: "6px",
  defABAnim: "250ms cubic-bezier(.33,.04,.14,.99)",
  defABAnimSemiSlow: "325ms cubic-bezier(.33,.04,.14,.99)",
  defABAnimSlow: "400ms cubic-bezier(.33,.04,.14,.99)",
  defABBtnWidth: "90%",

  // Actionbar Button
  defABBtnToggle: "#20BFFF",
  defABBtnTextToggle: "rgba(32, 191, 255, 0.9)",

  defVisibleAnim: "350ms cubic-bezier(.31,.26,.1,.92)",
  defVisibleAnimSlow: "500ms cubic-bezier(.31,.26,.1,.92)",
  
  // Mode styles (lo-testing.mod.js)
  defShadeBG: "rgba(0, 0, 0, 0.75)",
  defShadeBorder: "1px solid rgba(255, 255, 255, 0.75)",
  defShadeBorderLight: "1px solid rgba(255, 255, 255, 0.25)",

  shadeBarTextInputWidth: 100,
  shadeBarTextInputOffset: 20,

  scalingCornerSize: 60,
  scalingCornerPadding: 30,
  scalingCornerLineWidth: 2,
  scalingCornerColor: "",
  
  // Episode tracker
  epTrackerWidth: 70,
  epTrackerCardWidth: 160,
  epTrackerCardHeight: 170,
  epTrackerCardCapHeight: 65, // % percentage
  epTrackerCardInnerRadius: 3,
  epTrackerMaxDistance: 400 // In pixels
};
