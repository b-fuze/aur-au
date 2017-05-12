// Version testing
AUR_NAME = "AUR AU Version";
AUR_DESC = "AUR AU build versioning module, will prompt to update when new updates are detected on aur-remote server.";
AUR_VERSION = [0, 2, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;
AUR_INTERFACE = "auto";
AUR_USERSCRIPT_CLAUSE = [
  "@connect remote-aursystem.rhcloud.com"
];

var ui = AUR.import("aur-ui");
var sett = AUR.import("aur-settings");
var aurPrefs = AUR.import("aur-ui-prefs");

// For builds that aren't on the aur-remote server
var AURAU_VERSION = [0, 1, 0];
var isDevBuild    = false;

// Current AUR version, replaced on AUR Remote server
var curVersion = [AURAU_VERSION];
var maxCheckDelay = 1000 * 60 * 5; // 5 minutes

// Check if it's a dev build
if (curVersion[0] instanceof Array) {
  curVersion = curVersion[0];
  isDevBuild = true;
}

var curVersionStr = curVersion.join(".");

function getTime() {
  return new Date().getTime();
}

sett.setDefault("aurVersion", {
  lastCheck: sett.Setting("Last update check", "number", 0), // Since UNIX epoch
  informUpdateVersion: sett.Setting("Last version that was used, to check if should compare current", "string", curVersionStr),
  informUpdate: sett.Setting("Notify when updates available", "boolean", true),
  checkForDev: sett.Setting("Check for development (unstable builds, use at your own risk) updates", "boolean", false),
  
  releaseNotes: sett.Setting("AUR Release Notes", "string", ""),
  releaseNotesVersion: sett.Setting("AUR Release Notes build version", "string", curVersionStr)
});

var newVersionNotifi = ui.notifi.info("New AUR version ({#newVersion}) available, [b][https://remote-aursystem.rhcloud.com/get/latest/aur.user.js]click here to update[/anchor-blank][/b]", null, "TC");

newVersionNotifi.addButton("Later", function() {
  sett.set("aurVersion.lastCheck", getTime());
  
  newVersionNotifi.visible = false;
});

newVersionNotifi.addButton("Don't notify again", function() {
  sett.set("aurVersion.informUpdateVersion", curVersionStr);
  sett.set("aurVersion.informUpdate", false);
  
  newVersionNotifi.visible = false;
});

// Timer to check for latest versions
function checkTimer() {
  var curTime = getTime();
  
  if (curTime - sett.get("aurVersion.lastCheck") >= maxCheckDelay) {
    sett.set("aurVersion.lastCheck", curTime);
    
    AUR.request({
      method: "GET",
      uri: "https://remote-aursystem.rhcloud.com/info/latest",
      success: function() {
        if (isDevBuild)
          return false; // Don't update dev builds
        
        var canNotifyUser = true;
        var isUpdate      = false;
        
        // Check that the setting was disabled in this version
        if (sett.get("aurVersion.informUpdateVersion") ===  curVersionStr) {
          canNotifyUser = sett.get("aurVersion.informUpdate");
        }
        
        var fixRelease      = this.response.split(".").slice(0, 3).join(".");
        var curFixRelease   = curVersion.slice(0, 3).join(".");
        var releaseNumRegex = /^\s*(?:[\d]+\.)+[\d]+\s*$/;
        
        if (sett.get("aurVersion.checkForDev")) {
          if (this.response !== curVersionStr)
            isUpdate = true;
        } else {
          if (fixRelease !== curFixRelease)
            isUpdate = true;
        }
        
        if (isUpdate && canNotifyUser && releaseNumRegex.test(this.response)) {
          newVersionNotifi.newVersion = this.response;
          newVersionNotifi.visible = true;
        }
      }
    });
  }
  
  setTimeout(checkTimer, 7000);
}

setTimeout(checkTimer, 10);

// About AUR tab
var AURTab = ui.prefs.getGroup("aur-prefs-modules").registerTab("about-aur", "About AUR");

var tabHeaderGroup = AURTab.groupProp(null, 12);

tabHeaderGroup.main.css({
  marginTop: "0px",
  textAlign: "center"
});

var imgSrc = "https://i.imgur.com/JHWi4tE.png";
var AURImage = jSh.c("img", {
  prop: {
    src: ""
  }
});

tabHeaderGroup.main.appendChild(AURImage);

AURTab.addStateListener("selected", function setImage(selected) {
  if (selected) {
    AURImage.src = imgSrc;
    
    AURImage.addEventListener("load", function() {
      AURTab.scrollbar.update();
    });
    
    AURTab.removeStateListener("selected", setImage);
  }
});

AURTab.prop({
  link: "aurVersion.informUpdate",
  width: 8,
  align: "right"
});

var tabAboutGroup = AURTab.groupProp(null, 12, {
  title: "About AUR " + (isDevBuild ? AURAU_VERSION.slice(0, 2).join(".") + ".x" : curVersionStr)
});

tabAboutGroup.main.css({
  marginTop: "10px"
});

var aboutText = tabAboutGroup.textProp(null, 12, {
  data:
`AUR ([b]A[/b]nime[b]U[/b]ltima en[b]R[/b]adiant) is a joint effort by two AnimeUltima Programming Team members, [http://www.animeultima.io/forums/members/mike32/][b][#D9D9D9]Mike32 (b-fuze)[/color][/b][/anchor-blank]
 and [www.animeultima.io/forums/members/tdn/][b][#D9D9D9]TDN (Samu)[/color][/b][/anchor-blank] to make AU great again! [break][/break]AUR is fundamentally a big collection of [javascript:void 0;][b][#D9D9D9]{#aurModules}[/color][/b][/anchor], each of which
 can be enabled/disabled/tweaked at your own leisure. Each AUR module targets a specific broken and/or lacking feature of AU and aims to improve and/or extend it to make AU a better experience. [break][/break]AUR is not merely a dark theme (which can be disabled),
 via the [javascript:void 0;][b][#D9D9D9]{#aurSearchSuggest}[/color][/b][/anchor] module you can easily search AU's anime database, the [javascript:void 0;][b][#D9D9D9]{#aurThumbnailFixes}[/color][/b][/anchor] module brings back our beloved thumbnails, or [javascript:void 0;][b][#D9D9D9]{#aurRefactor}[/color][/b][/anchor] module that fixes many weird things, and much, much, more. [break][/break]We hope you enjoy the extensive work that
 is AUR, if you have any issues you can consult Mike or TDN.`,
  dynText: true
});

var moduleTab = ui.prefs.getTab("modules");

aboutText.aurModules = "modules";
aboutText.aurSearchSuggest = "Search Suggest";
aboutText.aurThumbnailFixes = "Thumbnail Fixes";
aboutText.aurRefactor = "Refactor";

aboutText.main.jSh(".aurModules").forEach(a => {
  a.addEventListener("click", function() {
    moduleTab.selected = true;
  });
});

aboutText.main.jSh(".aurSearchSuggest")[0].addEventListener("click", function() {
  aurPrefs.focusModule("search-suggest");
});

aboutText.main.jSh(".aurThumbnailFixes")[0].addEventListener("click", function() {
  aurPrefs.focusModule("thumbnail-fixes");
});

aboutText.main.jSh(".aurRefactor")[0].addEventListener("click", function() {
  aurPrefs.focusModule("aur-refactor");
});
