// Lights Out UI Library
AUR_NAME = "Lights Out UI Library";
AUR_DESC = "Lights Out UI Library";
AUR_VERSION = [0, 1, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";
AUR_RUN_AT = "doc-end";

var page = AUR.import("aur-page");
var aj = AUR.import("ajaxify");
var lo = AUR.import("lightsout-base");
var details = AUR.import("aur-details");
var style = AUR.import("aur-styles");
var ui = AUR.import("aur-ui");
var sett = AUR.import("aur-settings");

// Start core LO instance
var main     = new lo.Instance();
var actbar   = main.actionBar;
var modepane = main.modePane;
var tracker  = main.tracker;

var epTrackerInitiated = false;

// dom-element: Lights Out start button
var LOStartButton = jSh.c("a", {
  sel: ".aur-lo-init-button",
  text: "Lights Out",
  prop: {
    href: "javascript:void 0;",
    title: "Watch without distractions"
  }
});

var LOEpisodeStatusButton = jSh.c("a", {
  sel: ".aur-lo-status-unseen",
  text: "unseen",
  prop: {
    href: "javascript:void 0;",
    title: "Show viewing history"
  }
});

LOStartButton.addEventListener("click", function() {
  main.player    = jSh("#pembed iframe")[0];
  main.enabled   = true;
  actbar.visible = true;
  
  // For episode tracker's close button
  epTrackerInitiated = false;
});

LOEpisodeStatusButton.addEventListener("click", function() {
  main.player    = jSh("#pembed iframe")[0];
  main.enabled   = true;
  actbar.visible = true;
  
  setTimeout(function() {
    epTrackerMode.active = true;
  }, 250);
  
  // For episode tracker's close button
  epTrackerInitiated = true;
});

sett.on("lightsout.showEpisodeStatus", function(e) {
  if (e.value) {
    LOEpisodeStatusButton.classList.remove("aur-lo-hidden");
  } else {
    LOEpisodeStatusButton.classList.add("aur-lo-hidden");
  }
});

// To hide the loading player button thingy
main.addStateListener("player", function(player) {
  if (player) {
    var loadingContainer = jSh("#embed_holder");
    var loadingPlayer = jSh("#embed_holder_loading");
    
    if (loadingPlayer) {
      loadingPlayer.style.display = "none";
      loadingContainer.style.background = "#000";
    }
  }
});

main.addStateListener("enabled", function(enabled) {
  if (!enabled) {
    var loadingContainer = jSh("#embed_holder");
    var loadingPlayer = jSh("#embed_holder_loading");
    
    if (loadingPlayer) {
      loadingPlayer.style.display = "block";
      loadingContainer.style.background = "#000 url(/images/35.gif) 50% 50% no-repeat";
    }
  }
});

// Add Lights Out button
function addLOStartBtn(doc) {
  if (doc.jSh("#pembed"))
    doc.jSh("#watch-list").appendChild([LOStartButton, jSh.t(" "), LOEpisodeStatusButton]);
}

if (jSh("#watch-list"))
  addLOStartBtn(jSh(document));

var oldEpisodeDetails = null;
function updateLOEpisodeDetails(e) {
  var oldEpisode;
  var autotrack = sett.get("lightsout.autotrack");
  
  if (main.episodeDetails)
    oldEpisode = main.episodeDetails.episode;
  
  main.episodeDetails = {
    animeUnique: e.route.match(/(?:^|\.io)\/+([^]+)-episode-[\d\.\-]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/)[1],
    animeTitle: details.anime.title,
    episode: details.anime.episode,
    episodeTitle: details.anime.episodeTitle
  };
  
  console.log(main.episodeDetails.animeUnique);
  console.log(main.episodeDetails.episode);
  
  // Load episode state from user settings
  tracker.loadAnimeDataCache();
  
  // Update "seen/unseen" tag
  var curEpState = tracker.getEpisodeState(main.episodeDetails.episode);
  
  if (curEpState === null || curEpState === -1) {
    LOEpisodeStatusButton.classList.add("aur-lo-status-unseen");
    LOEpisodeStatusButton.classList.remove("aur-lo-status-seen");
    
    LOEpisodeStatusButton.textContent = "unseen";
    
    if (autotrack && epTrackerLoadedCards && tracker.animeData && tracker.auid === main.episodeDetails.animeUnique) {
      var index = tracker.animeData.index[main.episodeDetails.episode];
      renderEpTrackerCardsProgress([index], [0]);
    }
  } else if (curEpState === 100) {
    LOEpisodeStatusButton.classList.add("aur-lo-status-seen");
    LOEpisodeStatusButton.classList.remove("aur-lo-status-unseen");
    
    LOEpisodeStatusButton.textContent = "seen";
  } else {
    LOEpisodeStatusButton.classList.add("aur-lo-status-seen");
    LOEpisodeStatusButton.classList.remove("aur-lo-status-unseen");
    
    LOEpisodeStatusButton.textContent = "watching";
  }
  
  // Update tracker UI
  if (main.episodeDetails.animeUnique === epTrackerLoadedAnime) {
    if (oldEpisode) {
      var oldIndex  = tracker.animeData.index[oldEpisode];
      var curIndex  = tracker.animeData.index[main.episodeDetails.episode];
      var oldCard   = epTrackerCardsMap[oldIndex];
      var curCard   = epTrackerCardsMap[curIndex];
      var oldPHCard = epTrackerCardPHMap[oldIndex];
      var newPHCard = epTrackerCardPHMap[curIndex];
      
      if (oldCard) oldCard.classList.remove("aur-lo-current");
      if (curCard) curCard.classList.add("aur-lo-current");
      
      if (oldPHCard) oldPHCard.classList.remove("aur-lo-current");
      if (newPHCard) newPHCard.classList.add("aur-lo-current");
      
      epTrackerSelectCard(curIndex);
    }
  } else if (typeof epTrackerLoadedCards === "boolean")
    epTrackerLoadedCards = false;
  
  if (autotrack) {
    if (oldEpisodeDetails && oldEpisodeDetails.animeUnique === main.episodeDetails.animeUnique) {
      tracker.setEpisodeState([oldEpisodeDetails.episode], null, [100]);
      
      if (epTrackerLoadedCards && tracker.animeData && tracker.auid === main.episodeDetails.animeUnique) {
        var index = tracker.animeData.index[oldEpisodeDetails.episode];
        renderEpTrackerCardsProgress([index], [100]);
      }
    } else if (curEpState === null) {
      tracker.setEpisodeState([main.episodeDetails.episode], null, [0]);
    }
  }
}

// AJAXify event
aj.onEvent("trigger", /./, function(e) {
  nextEpBtn.disabled = true;
  prevEpBtn.disabled = true;
  
  // Save this quickly
  oldEpisodeDetails = main.episodeDetails;
});

aj.onEvent("merge", /./, function(e) {
  var dom = e.domNew;
  
  if (page.isEpisode && dom.jSh("#pembed")) {
    addLOStartBtn(dom);
    toggleEpNavigationButtons(dom);
    
    updateLOEpisodeDetails(e);
  } else {
    main.enabled = false;
    
    // Clear old details to disable comparison
    oldEpisodeDetails = null;
  }
});

aj.onEvent("load", /./, function(e) {
  var player = jSh("#pembed iframe")[0];
  
  if (page.isEpisode && player) {
    nextEpBtn.disabled = false;
    prevEpBtn.disabled = false;
    
    player.css({
      background: "#000"
    });
    
    if (main.enabled) {
      main.player = player;
    }
    
    // Enable LO if autostart is on
    if (sett.get("lightsout.autostart")) {
      main.player = player;
      main.enabled = true;
      
      actbar.visible = true;
    }
  }
});

if (page.isEpisode && jSh("#pembed")) {
  updateLOEpisodeDetails({route: location.toString()});
  
  setTimeout(function() {
    if (sett.get("lightsout.autostart")) {
      main.player  = jSh("#pembed iframe")[0];
      main.enabled = true;
      
      actbar.visible = true;
    }
  }, 0);
}

// Add modes
var shadingMode      = main.addMode("shading-level");
var extraOptionsMode = main.addMode("extra-options");
var nextEpisodeMode  = main.addMode("next-ep");
var prevEpisodeMode  = main.addMode("prev-ep");
var epTrackerMode    = main.addMode("ep-tracker");
var infoCaptionMode  = main.addMode("info-caption");
var scalingMoveMode  = main.addMode("scale-move");

// Add buttons

// Add next episode button
var nextEpBtn = main.addButton({
  title: "Next episode",
  button: jSh.svg(null, 52, 42, [
    // Border
    jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
    // Arrow
    jSh.path(".aur-lo-svg-toggle", "M25.984 9.484a1.5 1.5 0 0 0-1.045 2.577L33.88 21l-8.94 8.94a1.5 1.5 0 1 0 2.12 2.12L38.12 21 27.06 9.94a1.5 1.5 0 0 0-1.076-.456zM18.5 18a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z", "opacity:0.85;fill:#ffffff;stroke:none;")
  ]),
  buttonScale: 0.75,
  modeAction: nextEpisodeMode,
  activate() {
    actbar.mode = null;
  }
});

// Add prev episode button
var prevEpBtn = main.addButton({
  title: "Previous episode",
  button: jSh.svg(null, 52, 42, [
    // Border
    jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
    // Arrow
    jSh.path(".aur-lo-svg-toggle", "M26.016 9.484a1.5 1.5 0 0 1 1.045 2.577L18.12 21l8.94 8.94a1.5 1.5 0 1 1-2.12 2.12L13.88 21 24.94 9.94a1.5 1.5 0 0 1 1.076-.456zM33.5 18a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z", "opacity:0.85;fill:#ffffff;stroke:none;")
  ]),
  buttonScale: 0.75,
  modeAction: prevEpisodeMode,
  activate() {
    actbar.mode = null;
  }
});

// Add ep navigation anchors
var nextEpBtnAnchor = jSh.c("a", ".aur-lo-ep-nav-anchor");
var prevEpBtnAnchor = jSh.c("a", ".aur-lo-ep-nav-anchor");

// On sett change
sett.on("lightsout.confirmEpisodeNav", function(e) {
  if (e.value) {
    nextEpBtn.buttonType = "mode";
    prevEpBtn.buttonType = "mode";
    
    // Hide anchors
    [
      nextEpBtnAnchor,
      prevEpBtnAnchor
    ].forEach(a => (a.style.display = "none"));
  } else {
    nextEpBtn.buttonType = "simple";
    prevEpBtn.buttonType = "simple";
    
    // Hide anchors
    [
      nextEpBtnAnchor,
      prevEpBtnAnchor
    ].forEach(a => (a.style.display = "block"));
  }
}, true);

nextEpBtn.buttonDOM.appendChild(nextEpBtnAnchor);
prevEpBtn.buttonDOM.appendChild(prevEpBtnAnchor);

function toggleEpNavigationButtons(doc) {
  var episodeNav = doc.jSh(".video-meta-1")[0].jSh(".orange");
  var next       = null;
  var mid        = false;
  var prev       = null;
  
  for (let i=0,l=episodeNav.length; i<l; i++) {
    var anchor = episodeNav[i];
    
    if (/all\s+episodes/i.test(anchor.textContent))
      mid = true;
    else {
      if (mid)
        next = anchor.getAttribute("href");
      else
        prev = anchor.getAttribute("href");
    }
  }
  
  nextEpBtn.visible = !!next;
  prevEpBtn.visible = !!prev;
  
  // Assign new
  nextEpBtnAnchors.forEach(a => (a.href = next));
  prevEpBtnAnchors.forEach(a => (a.href = prev));
}

// Add confirm buttons
var nextEpConfirmBtn = nextEpisodeMode.addButton({
  title: "Go to next episode",
  button: "NEXT",
  activate() {
    actbar.mode = null;
  }
});

nextEpisodeMode.addButton({
  button: "CANCEL",
  activate() {
    actbar.mode = null;
  }
});

var prevEpConfirmBtn = prevEpisodeMode.addButton({
  title: "Go to previous episode",
  button: "PREV",
  activate() {
    actbar.mode = null;
  }
});

prevEpisodeMode.addButton({
  button: "CANCEL",
  activate() {
    actbar.mode = null;
  }
});

// Add ep navigation anchors
var nextEpBtnAnchorConfirm = jSh.c("a", ".aur-lo-ep-nav-anchor");
var prevEpBtnAnchorConfirm = jSh.c("a", ".aur-lo-ep-nav-anchor");

var nextEpBtnAnchors = [
  nextEpBtnAnchor,
  nextEpBtnAnchorConfirm
];

var prevEpBtnAnchors = [
  prevEpBtnAnchor,
  prevEpBtnAnchorConfirm
];

nextEpConfirmBtn.buttonDOM.appendChild(nextEpBtnAnchorConfirm);
prevEpConfirmBtn.buttonDOM.appendChild(prevEpBtnAnchorConfirm);

// Toggle nav buttons
if (page.isEpisode && jSh("#pembed"))
  setTimeout(function() {
    toggleEpNavigationButtons(jSh(document));
  }, 10);

// // Add episodes view/tracker button
actbar.addButton({
  title: "Episode list/tracker",
  button: jSh.svg(null, 52, 42, [
    // Border
    jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
    // 1st/Play
    jSh.path(".aur-lo-svg-toggle", "M10 14c-1.662 0-3 1.338-3 3v8c0 1.662 1.338 3 3 3h8c1.662 0 3-1.338 3-3v-8c0-1.662-1.338-3-3-3h-8zm1.658 2.563L16.592 21l-4.934 4.438v-8.875z", "opacity:0.85;fill:#ffffff;stroke:none;"),
    // 2nd
    jSh.path(".aur-lo-svg-toggle", "M22 14c-.403 0-.786.082-1.137.225.7.72 1.137 1.698 1.137 2.775v8c0 1.077-.437 2.054-1.137 2.775.35.143.734.225 1.137.225h8c1.662 0 3-1.338 3-3v-8c0-1.662-1.338-3-3-3h-8zm3.273 2.426h1.522c1.134 0 1.7.603 1.7 1.81v2.07c0 1.208-.566 1.81-1.7 1.81h-1.11c-.075 0-.138.03-.193.085-.046.056-.068.12-.068.193v1.466h2.963v1.578h-4.72v-3.196c0-1.207.568-1.81 1.702-1.81h1.097c.073 0 .132-.03.178-.084.054-.055.082-.12.082-.192v-1.96c0-.074-.028-.14-.082-.194-.046-.055-.105-.082-.178-.082h-.81c-.074 0-.137.027-.192.082-.046.055-.07.12-.07.193v.7h-1.823v-.66c0-1.206.567-1.81 1.7-1.81z", "opacity:0.75;fill:#ffffff;stroke:none;"),
    // 3rd
    jSh.path(".aur-lo-svg-toggle", "M34 14c-.403 0-.786.082-1.137.225.7.72 1.137 1.698 1.137 2.775v8c0 1.077-.437 2.054-1.137 2.775.35.143.734.225 1.137.225h8c1.662 0 3-1.338 3-3v-8c0-1.662-1.338-3-3-3h-8zm3.273 2.426h1.454c1.134 0 1.7.603 1.7 1.81v1.18c0 .713-.187 1.206-.562 1.48.43.302.645.82.645 1.55v1.318c0 1.207-.567 1.81-1.7 1.81h-1.62c-1.133 0-1.7-.603-1.7-1.81v-.727h1.715v.81c0 .072.023.137.068.192.055.054.12.08.192.08h1.084c.072 0 .13-.026.177-.08.054-.056.082-.12.082-.194v-1.893c0-.073-.03-.136-.083-.19-.046-.056-.105-.083-.178-.083h-1.413v-1.483h1.33c.073 0 .132-.027.178-.082.054-.055.082-.118.082-.19v-1.73c0-.073-.028-.138-.082-.193-.046-.055-.105-.082-.178-.082h-.92c-.073 0-.137.027-.192.082-.045.055-.068.12-.068.193v.877h-1.715v-.836c0-1.207.567-1.81 1.7-1.81z", "opacity:0.65;fill:#ffffff;stroke:none;")
  ]),
  buttonScale: 0.75,
  modeAction: epTrackerMode,
  activate() {
    // Do some kinda magic crap here
  }
});

// More options button
main.addButton({
  title: "More options",
  button: jSh.svg(null, 52, 42, [
    // Border
    jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
    // Arrow
    jSh.path(".aur-lo-svg-toggle", "M18 18c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm8 0c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm8 0c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z", "opacity:0.85;fill:#ffffff;stroke:none;")
  ]),
  buttonScale: 0.75,
  modeAction: extraOptionsMode
});

// Add scrollbar button
var sbarBtn = extraOptionsMode.addButton({
  title: "Disable scrollbars",
  button: jSh.svg(null, 52, 42, [
    // Diagonal Pattern
    jSh.path(null, "M11.293 6L6 11.293v2.828L14.12 6h-2.827zm5.656 0L6 16.95v2.827L19.777 6H16.95zm5.655 0L6 22.605v2.83L25.434 6h-2.83zm5.66 0L6 28.262v2.828L31.092 6h-2.828zm5.655 0L6.04 33.88c.11.723.518 1.34 1.106 1.72L36.748 6H33.92zm5.656 0l-30 30h2.828l30-30h-2.828zM8.46 6.004c-1.353.022-2.434 1.103-2.456 2.455L8.46 6.003zm36.38.39L15.232 36h2.83l27.9-27.898c-.116-.72-.532-1.334-1.122-1.71zM46 10.888L20.89 36h2.83L46 13.717V10.89zm0 5.655L26.547 36h2.828L46 19.375v-2.83zm0 5.658L32.203 36h2.828L46 25.033v-2.83zm0 5.658L37.86 36h2.827L46 30.69v-2.83zm-.002 5.658l-2.48 2.48c1.37-.01 2.47-1.11 2.48-2.48z", "opacity:0.25;fill:#ffffff;stroke:none;"),
    // Border
    jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41H11v-3H8.5C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4h35C45.993 4 48 6.007 48 8.5v2.484h3V8.5C51 4.345 47.655 1 43.5 1h-35zM48 31.016V33.5c0 2.493-2.007 4.5-4.5 4.5h-2.484v3H43.5c4.155 0 7.5-3.345 7.5-7.5v-2.484h-3z", "opacity:0.5;fill:#ffffff;stroke:none;"),
    // Scrollbars
    jSh.path(".aur-lo-svg-toggle", "M48 13v16h3V13h-3zM13 38v3h26v-3H13z", "opacity:0.85;fill:#ffffff;stroke:none;")
  ]),
  buttonScale: 0.75,
  activate() {
    main.scrollbars = !main.scrollbars;
  },
  toggleState: !main.scrollbars
});

main.addStateListener("scrollbars", function(sbars) {
  sbarBtn.toggle = !sbars;
});

// Add shading mode button
var shadeLevelBtn = extraOptionsMode.addButton({
  title: "Darkness shade level",
  modeAction: shadingMode,
  button: jSh.svg(null, 52, 42, [
    jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
    jSh.path(".aur-lo-svg-toggle", "M11 17c-1.108 0-2 .892-2 2v4c0 1.108.892 2 2 2h13v-2H11.5c-.277 0-.5-.223-.5-.5v-3c0-.277.223-.5.5-.5H24v-2H11zm27 0v2h2.5c.277 0 .5.223.5.5v3c0 .277-.223.5-.5.5H38v2h3c1.108 0 2-.892 2-2v-4c0-1.108-.892-2-2-2h-3z", "opacity:0.85;fill:#ffffff;stroke:none;"),
    jSh.path(".aur-lo-svg-toggle", "M28 16c-1.108 0-2 .892-2 2v6c0 1.108.892 2 2 2h6c1.108 0 2-.892 2-2v-6c0-1.108-.892-2-2-2h-6zm2 3h2c.554 0 1 .446 1 1v2c0 .554-.446 1-1 1h-2c-.554 0-1-.446-1-1v-2c0-.554.446-1 1-1z", "opacity:0.85;fill:#ffffff;stroke:none;")
  ]),
  buttonScale: 0.75
});

// Keep ActionBar bar visible
shadingMode.addStateListener("active", function(active) {
  if (active) {
    main.actionBar.autohide = false;
    main.actionBar.visible  = true;
  } else {
    main.actionBar.autohide = true;
  }
});

shadingMode.addButton({
  title: "No darkness",
  button: "0%",
  activate() {
    main.shadeLevel = 0;
    actbar.mode = null;
  }
});

shadingMode.addButton({
  title: "Half darkness",
  button: "50%",
  activate() {
    main.shadeLevel = 0.5;
    actbar.mode = null;
  }
});

shadingMode.addButton({
  title: "Full darkness",
  button: "100%",
  activate() {
    main.shadeLevel = 1;
    actbar.mode = null;
  }
});

shadingMode.addButton({
  button: "DONE",
  activate() {
    actbar.mode = null;
  }
});

// Make move-scaling button
var scaleMoveBtn = extraOptionsMode.addButton({
  title: "Move/scale video",
  modeAction: scalingMoveMode,
  button: jSh.svg(null, 52, 42, [
    jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
    jSh.path(".aur-lo-svg-toggle", "M13 8c-2.753 0-5 2.247-5 5v2.715c0 2.753 2.247 5 5 5h7c2.753 0 5-2.247 5-5V13c0-2.753-2.247-5-5-5h-7zm14 0v2h6.047c1.68 0 3 1.32 3 3v6h2v-6c0-2.753-2.247-5-5-5H27zm-14 2h7c1.68 0 3 1.32 3 3v2.715c0 1.68-1.32 3-3 3h-7c-1.68 0-3-1.32-3-3V13c0-1.68 1.32-3 3-3zm24 11l-3 3h2v2.27a2 2 0 0 1 1-.27 2 2 0 0 1 1 .27V24h2l-3-3zM8 23v1c0 2.753 2.247 5 5 5h15v-2H13c-1.68 0-3-1.32-3-3v-1H8zm25 2l-3 3 3 3v-2h2.27a2 2 0 0 1-.27-1 2 2 0 0 1 .27-1H33v-2zm8 0v2h-2.27a2 2 0 0 1 .27 1 2 2 0 0 1-.27 1H41v2l3-3-3-3zm-3 4.73a2 2 0 0 1-1 .27 2 2 0 0 1-1-.27V32h-2l3 3 3-3h-2v-2.27z", "opacity:0.85;fill:#ffffff;stroke:none;")
  ]),
  buttonScale: 0.75
});

main.addStateListener("playerTempDimensions", function(tempDimensions) {
  scaleMoveBtn.disabled  = tempDimensions;
  shadeLevelBtn.disabled = tempDimensions;
});

var scaleMoveMoveBtn = scalingMoveMode.addButton({
  title: "Show moving widget",
  button: "MOVE",
  toggleState: true,
  activate() {
    scaleMoveMoveBtn.toggle = !scaleMoveMoveBtn.toggle;
  }
});

var scaleMoveScaleBtn = scalingMoveMode.addButton({
  title: "Show resizing widgets",
  button: "SCALE",
  toggleState: true,
  activate() {
    scaleMoveScaleBtn.toggle = !scaleMoveScaleBtn.toggle;
  }
});

var scaleMoveScaleGuidesBtn = scalingMoveMode.addButton({
  title: "Show resizing guides",
  button: "GUIDES",
  toggleState: false,
  activate() {
    scaleMoveScaleGuidesBtn.toggle = !scaleMoveScaleGuidesBtn.toggle;
  }
});

function toggleScaleGuideRects(toggle) {
  var rectGuides = main.rectScaleGuides;
  var method     = toggle ? "remove" : "add";
  
  for (let i=rectGuides.length-1; i>-1; i--) {
    rectGuides[i].mainBody.classList[method]("aur-lo-scalemove-disabled");
  }
}

scaleMoveScaleBtn.addStateListener("toggle", function(toggle) {
  if (scaleMoveScaleGuidesBtn.toggle) {
    toggleScaleGuideRects(toggle);
  }
  
  scaleMoveScaleGuidesBtn.disabled = !toggle;
});

scaleMoveScaleGuidesBtn.addStateListener("toggle", function(toggle) {
  if (scaleMoveScaleBtn.toggle) {
    toggleScaleGuideRects(toggle);
  }
});

scalingMoveMode.addButton({
  button: "DONE",
  activate() {
    actbar.mode = null;
  }
});

// Add prefs button
var openPrefsButton = extraOptionsMode.addButton({
  title: "Lights Out Preferences",
  button: jSh.svg(null, 52, 42, [
    jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
    jSh.path(".aur-lo-svg-toggle", "M24 9v3.234a9 9 0 0 0-2.78 1.155l-2.29-2.29-2.83 2.83 2.283 2.283A9 9 0 0 0 17.236 19H14v4h3.234a9 9 0 0 0 1.155 2.78l-2.29 2.29 2.83 2.83 2.283-2.283A9 9 0 0 0 24 29.764V33h4v-3.234a9 9 0 0 0 2.78-1.155l2.29 2.29 2.83-2.83-2.283-2.283A9 9 0 0 0 34.764 23H38v-4h-3.234a9 9 0 0 0-1.155-2.78l2.29-2.29-2.83-2.83-2.283 2.283A9 9 0 0 0 28 12.236V9h-4zm2.914 3.057c.063.006.126.015.19.023a9 9 0 0 0-.19-.023zM26 15a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6zm-8.92 4.896a9 9 0 0 0-.023.19c.006-.063.015-.126.023-.19zm17.863 2.018c-.006.063-.015.126-.023.19a9 9 0 0 0 .023-.19zM24.896 29.92a9 9 0 0 0 .19.023c-.063-.006-.126-.015-.19-.023z", "opacity:0.85;fill:#ffffff;stroke:none;")
  ]),
  buttonScale: 0.75,
  activate() {
    openPrefsButton.toggle = !openPrefsButton.toggle;
    prefsChangeTrigger = "button";
    
    onPrefsWinChange();
    ui.prefs.draggable = true;
    
    if (openPrefsButton.toggle) {
      epTrackerMode.active = false;
    }
  },
  toggleState: false
});

var prefsChangeTrigger = null;
function onPrefsWinChange() {
  if (prefsChangeTrigger) {
    if (openPrefsButton.toggle) {
      ui.prefs.visible = true;
      lo.tab.selected = true;
    } else {
      ui.prefs.visible = false;
      lo.tab.selected = false;
    }
    
    prefsChangeTrigger = null;
  } else {
    if (ui.prefs.visible && lo.tab.selected) {
      openPrefsButton.toggle = true;
    } else {
      openPrefsButton.toggle = false;
    }
  }
}

ui.prefs.addStateListener("visible", onPrefsWinChange);
lo.tab.addStateListener("selected", onPrefsWinChange);

// Add back button
extraOptionsMode.addButton({
  button: "BACK",
  activate() {
    actbar.mode = null;
    // extraOptionsMode.setState("active", false, true);
  }
});

// Add close button
actbar.addButton({
  title: "Close Lights Out",
  button: jSh.svg(null, 52, 42, [
    jSh.path(null, "M8.5 1C4.345 1 1 4.345 1 8.5v25C1 37.655 4.345 41 8.5 41h35c4.155 0 7.5-3.345 7.5-7.5v-25C51 4.345 47.655 1 43.5 1h-35zm0 3h35C45.993 4 48 6.007 48 8.5v25c0 2.493-2.007 4.5-4.5 4.5h-35C6.007 38 4 35.993 4 33.5v-25C4 6.007 6.007 4 8.5 4z", "opacity:0.5;fill:#ffffff;stroke:none;"),
    jSh.path(".aur-lo-svg-toggle", "M26 9c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.5 2.53c-3.538 1.693-6 5.3-6 9.47 0 5.78 4.72 10.5 10.5 10.5S36.5 26.78 36.5 21c0-4.17-2.462-7.777-6-9.47V15c1.82 1.365 3 3.535 3 6 0 4.16-3.34 7.5-7.5 7.5s-7.5-3.34-7.5-7.5c0-2.465 1.18-4.635 3-6v-3.47z", "opacity:0.85;fill:#ffffff;stroke:none;")
  ]),
  buttonScale: 0.75,
  activate() {
    main.enabled = false;
    actbar.visible = false;
  }
});

// -----------------------
//       TRACKER MODE
// -----------------------

var epTrackerWidth           = 70;
var epTrackerCardWidth       = 160;
var epTrackerCardHeight      = 170;
var epTrackerCardCapHeight   = 65; // % percentage
var epTrackerCardInnerRadius = 3;
var epTrackerMaxDistance     = 400; // In pixels

epTrackerMode.mainBody.classList.add("aur-lo-episode-tracker-main");
epTrackerMode.mainBody.css({
  width: epTrackerWidth + "%",
  height: "100%"
});

var epTrackerTitle       = jSh.d(".aur-lo-eptracker-title", main.episodeDetails ? main.episodeDetails.animeTitle + " Episodes" : "No title", [
  jSh.d(".aur-lo-tip", "Tip: Shift-click or Ctrl-click for bulk actions")
]);
var epTrackerInput       = jSh.d(".aur-lo-eptracker-input.aur-ui-root");
var epTrackerInputEp     = jSh.d(".aur-lo-episode-caption", main.episodeDetails ? "Episode " + main.episodeDetails.episode : "");
var epTrackerCards       = jSh.d(".aur-lo-eptracker-cards-wrap.aur-ui-root");
var epTrackerCardsScroll = jSh.d(".aur-lo-eptracker-cards-scroll.aur-ui-root", null, [
  epTrackerCards
]);

epTrackerMode.mainBody.appendChild([
  epTrackerTitle,
  epTrackerInput,
  epTrackerCardsScroll
]);

// Add scrollbar
var epTrackerCardsWidget = jSh.extendObj(lces.new(), {
  element: epTrackerCards,
  scrollbarContent: epTrackerCards
});

lcScrollBars.call(epTrackerCardsWidget, undf, undf, false);

// Add mousewheel event for scrolbar
epTrackerCardsWidget.lcesScrollbar.parent  = epTrackerCardsScroll;
epTrackerCardsWidget.lcesScrollbar.visible = true;

// Update cards when scrolled
var epTrackerUpdateCardsTimeout  = null;
var epTrackerDefaultRefreshRate  = 50;
var epTrackerDefaultRefreshDelay = true;
var epTrackerOldScroll           = 0;
epTrackerCardsWidget.lcesScrollbar.on("lcesscroll", function(e) {
  clearTimeout(epTrackerUpdateCardsTimeout);
  var scrollDiff = Math.abs(epTrackerOldScroll - e.scroll);
  epTrackerOldScroll = e.scroll;
  
  if (!epTrackerDefaultRefreshDelay || scrollDiff < 1500) {
    addEpTrackerGroupCards();
  } else {
    epTrackerUpdateCardsTimeout = setTimeout(addEpTrackerGroupCards, epTrackerDefaultRefreshRate);
  }
});

sett.on("lightsout.trackerScrollRefresh", function(e) {
  epTrackerDefaultRefreshRate = e.value;
});

sett.on("lightsout.trackerScrollRefreshDelay", function(e) {
  epTrackerDefaultRefreshDelay = e.value;
});

// Update scrollbars when window resizes
var epTrackerUpdateScrollbarTimeout = null;
window.addEventListener("resize", function() {
  clearTimeout(epTrackerUpdateScrollbarTimeout);
  epTrackerUpdateScrollbarTimeout = setTimeout(function() {
    epTrackerCardsWidget.lcesScrollbar.update();
  }, 650);
});

// Update episode caption
main.addStateListener("episodeDetails", function(details) {
  epTrackerInputEp.textContent = "Episode " + details.episode;
});

// Episode cards selected model
var epTrackerCardsModel     = [];
var epTrackerCardGroupIndex = [];
var epTrackerCardGroupsMap  = [];
var epTrackerCardsMap       = [];
var epTrackerCardPHMap      = []; // Card placeholders
var epTrackerCardsBarMap    = []; // Progress bar
var epTrackerCardsCapMap    = []; // Progress caption

// Add close button
epTrackerTitle.appendChild(jSh.d({
  sel: ".aur-lo-eptracker-close",
  child: jSh.svg(null, 30, 30, [
    jSh.path(null, "M8.625 7.22L7.22 8.624 13.593 15 7.22 21.375l1.405 1.406L15 16.407l6.375 6.375 1.406-1.405L16.407 15l6.375-6.375-1.405-1.406L15 13.593 8.625 7.22z")
  ]),
  prop: {
    title: "Close Episode List/Tracker"
  },
  events: {
    click() {
      if (epTrackerInitiated) {
        main.enabled = false;
      } else {
        epTrackerMode.active = false;
      }
    }
  }
}));

// Add input buttons...
epTrackerInput.appendChild([
  epTrackerInputEp,
  
  jSh.c("button", {
    text: "Select all",
    events: {
      click() {
        console.time("aur-lo-compare");
        var changed  = [];
        var newState = [];
        var newModel = [];
        
        for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
          if (!epTrackerCardsModel[i]) {
            changed.push(i);
            newState.push(true);
          }
          
          newModel.push(true);
        }
        console.timeEnd("aur-lo-compare");
        
        renderEpTrackerCards(changed, newState);
        epTrackerCardsModel = newModel;
      }
    }
  }),
  
  jSh.c("button", {
    text: "Deselect all",
    events: {
      click() {
        epTrackerDeselectCards();
      }
    }
  }),
  
  jSh.d(".aur-lo-eptracker-input-separator"),
  
  jSh.c("button", {
    text: "Set ",
    child: jSh.c("b", null, "Seen"),
    events: {
      click() {
        var changed  = [];
        var newState = [];
        
        for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
          if (epTrackerCardsModel[i]) {
            changed.push(i);
            newState.push(100);
          }
        }
        
        renderEpTrackerCardsProgress(changed, newState);
        tracker.setEpisodeState(null, changed, newState);
      }
    }
  }),
  
  jSh.c("button", {
    text: "Set ",
    child: jSh.c("b", null, "Unseen"),
    events: {
      click() {
        var changed  = [];
        var newState = [];
        
        for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
          if (epTrackerCardsModel[i]) {
            changed.push(i);
            newState.push(-1);
          }
        }
        
        renderEpTrackerCardsProgress(changed, newState);
        tracker.setEpisodeState(null, changed, newState);
      }
    }
  }),
  
  jSh.d(".aur-lo-eptracker-input-separator"),
  
  jSh.c("button", {
    text: "Scroll to current",
    events: {
      click() {
        if (epTrackerLoadedCards) {
          var current = main.episodeDetails.episode;
          var index   = tracker.animeData.index[current];
          
          var card   = epTrackerCardsMap[index];
          var cardPH = epTrackerCardPHMap[index];
          
          if (card) {
            epTrackerCardsWidget.lcesScrollbar.scrollTo(card);
          } else {
            epTrackerCardsWidget.lcesScrollbar.scrollTo(cardPH);
          }
        }
      }
    }
  })
]);

// Click events for card wrap
var epTrackerLastCard = 0;
epTrackerCards.addEventListener("mousedown", function(e) {
  var target = e.target;
  var shift  = e.shiftKey;
  var ctrl   = e.ctrlKey;
  var cardID = null;
  var card;
  var voidAction;
  
  // Check if clicked a card
  while (target !== this) {
    // Cancel for links/Watch episode buttons
    if (target.tagName === "A") {
      voidAction = true;
      break;
    }
    
    if ((cardID = target.getAttribute("data-ep-card-index")) !== null) {
      card = target;
      
      break;
    }
    
    target = target.parentNode;
  }
  
  if (voidAction) {
    return;
  }
  // Simply deselect everything
  else if (card === undefined) {
    epTrackerDeselectCards();
  }
  // Complex selection ensues
  else if (card && cardID !== null) {
    e.preventDefault();
    
    cardID = parseInt(cardID);
    var changed  = [];
    var newState = [];
    var newModel = [];
    
    // Select this one episode
    if (!ctrl && !shift) {
      epTrackerSelectCard(cardID);
    }
    // Shift key pressed...
    else if (shift) {
      var start     = Math.min(epTrackerLastCard, cardID) - 1;
      var end       = Math.max(epTrackerLastCard, cardID) + 1; // Removed/added 1 for simple comparison operator
      var lastState = epTrackerCardsModel[epTrackerLastCard];
      var negLState = !lastState;
      
      console.time("aur-lo-compare");
      for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
        let state = epTrackerCardsModel[i];
        
        if (i > start && i < end)
          state = lastState;
        else
          state = false;
        
        if (state !== epTrackerCardsModel[i]) {
          changed.push(i);
          newState.push(state);
        }
        
        newModel.push(state);
      }
      console.timeEnd("aur-lo-compare");
      
      renderEpTrackerCards(changed, newState);
      epTrackerCardsModel = newModel;
    }
    // Ctrl key pressed
    else {
      var newCardState = !epTrackerCardsModel[cardID];
      epTrackerCardsModel[cardID] = newCardState;
      
      renderEpTrackerCards([cardID], [newCardState]);
      epTrackerLastCard = cardID;
    }
  }
});

function epTrackerDeselectCards() {
  console.time("aur-lo-compare");
  var changed  = [];
  var newState = [];
  var newModel = [];
  
  for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
    if (epTrackerCardsModel[i]) {
      changed.push(i);
      newState.push(false);
    }
    
    newModel.push(false);
  }
  console.timeEnd("aur-lo-compare");
  
  renderEpTrackerCards(changed, newState);
  epTrackerCardsModel = newModel;
}

function epTrackerSelectCard(index) {
  var changed  = [];
  var newState = [];
  var newModel = [];
  
  console.time("aur-lo-compare");
  for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
    let state = false;
    
    if (i === index)
      state = true;
    
    if (state !== epTrackerCardsModel[i]) {
      changed.push(i);
      newState.push(state);
    }
    
    newModel.push(state);
  }
  console.timeEnd("aur-lo-compare");
  
  renderEpTrackerCards(changed, newState);
  epTrackerCardsModel = newModel;
  epTrackerLastCard   = index;
}

function renderEpTrackerCards(indexes, newStates) {
  console.time("aur-lo-render");
  for (let i=indexes.length-1; i>-1; i--) {
    let index  = indexes[i];
    let card   = epTrackerCardsMap[index];
    let phCard = epTrackerCardPHMap[index];
    let state  = newStates[i];
    
    if (state) {
      phCard.classList.add("aur-lo-selected");
      
      if (card)
        card.classList.add("aur-lo-selected");
    } else {
      phCard.classList.remove("aur-lo-selected");
      
      if (card)
        card.classList.remove("aur-lo-selected");
    }
  }
  console.timeEnd("aur-lo-render");
}

function renderEpTrackerCardsProgress(indexes, newStates) {
  tracker.setEpisodeState(null, indexes, newStates);
  
  console.time("aur-lo-render");
  for (let i=indexes.length-1; i>-1; i--) {
    let bar   = epTrackerCardsBarMap[indexes[i]];
    let cap   = epTrackerCardsCapMap[indexes[i]];
    let state = newStates[i];
    
    if (bar && cap) {
      // Unseen
      if (state === -1) {
        bar.style.width = "0%";
        cap.textContent = "Unseen";
        cap.classList.remove("aur-lo-hilite");
      }
      // Finished
      else if (state === 100) {
        bar.style.width = "100%";
        cap.textContent = "Seen";
        cap.classList.add("aur-lo-hilite");
      }
      // Watching
      else {
        bar.style.width = "100%";
        cap.textContent = "Watching";
        cap.classList.remove("aur-lo-hilite");
      }
    }
  }
  console.timeEnd("aur-lo-render");
}

function addEpTrackerCardGroups() {
  // Clear any previous groups
  epTrackerCardGroupIndex  = [];
  epTrackerCardGroupsMap   = [];
  epTrackerCardsMap        = [];
  epTrackerCardPHMap       = [];
  epTrackerCardsBarMap     = [];
  epTrackerCardsCapMap     = [];
  epTrackerCardsModel      = [];
  
  var episodes     = tracker.animeData.episode;
  var curEpisode   = main.episodeDetails.episode;
  var episodeCount = tracker.animeData.episode.length;
  var groupCount   = Math.ceil(episodeCount / 20);
  var frag         = jSh.docFrag();
  
  for (let i=0; i<groupCount; i++) {
    let placeholderCount = Math.min(episodeCount - i * 20, 20);
    
    let group = jSh.d(".aur-lo-eptracker-card-render-group", null, null, {
      "data-rendered": "0",
      "data-card-count": placeholderCount
    });
    
    // Add placeholders
    for (let j=0; j<placeholderCount; j++) {
      let curEpIndex = i * 20 + j;
      let curCardEps = episodes[curEpIndex];
      let epSelected = curCardEps === curEpisode;
      
      let card = jSh.d(".aur-lo-eptracker-card-placeholder" + (epSelected ? ".aur-lo-selected.aur-lo-current" : ""), null, null, {
        "data-ep-num": curCardEps
      });
      
      if (epSelected)
        epTrackerLastCard = curEpIndex;
      
      group.appendChild(card);
      epTrackerCardPHMap.push(card);
      epTrackerCardsMap.push(null);
      epTrackerCardsBarMap.push(null);
      epTrackerCardsCapMap.push(null);
      epTrackerCardsModel.push(epSelected);
    }
    
    // Add group
    frag.appendChild(group);
    epTrackerCardGroupIndex.push(i * 20);
    epTrackerCardGroupsMap.push(group);
  }
  
  // Add all render groups
  epTrackerCards.appendChild(frag);
  
  // Update scrolbars
  setTimeout(function() {
    epTrackerCardsWidget.lcesScrollbar.update();
    
    setTimeout(function() {
      var curCard = epTrackerCardPHMap[tracker.animeData.index[main.episodeDetails.episode]];
      epTrackerCardsWidget.lcesScrollbar.scrollTo(curCard);
      
      // Add the cards
      epTrackerUpdateCardsTimeout = setTimeout(function() {
        addEpTrackerGroupCards();
      }, 10);
    }, 10);
  }, 10);
}

function addEpTrackerGroupCards() {
  var mainRect = epTrackerCards.getBoundingClientRect();
  
  // All render-required stuff
  var data            = tracker.animeData;
  var frag            = jSh.docFrag();
  var curEpisode      = main.episodeDetails.episode;
  var curAnime        = main.episodeDetails.animeUnique;
  var optimizeEnabled = sett.get("lightsout.trackerOptimizedScroll");
  
  var episode = data.episode;
  var title   = data.title;
  var watched = data.watched;
  
  for (let i=epTrackerCardGroupsMap.length-1; i>-1; i--) {
    let group    = epTrackerCardGroupsMap[i];
    let gRect    = optimizeEnabled ? group.getBoundingClientRect() : null; // Don't waste redrawing if you're not gonna use it
    let start    = epTrackerCardGroupIndex[i];
    let count    = parseInt(group.getAttribute("data-card-count"), 10);
    let rendered = group.getAttribute("data-rendered") === "1";
    let render   = false;
    
    if (optimizeEnabled) {
      // The group is above the cardview
      if (gRect.bottom < mainRect.top) {
        render = mainRect.top - gRect.bottom <= epTrackerMaxDistance;
      }
      // The group is under the cardview
      else if (gRect.top > mainRect.bottom) {
        render = gRect.top - mainRect.bottom <= epTrackerMaxDistance;
      }
      // The group is _in_ the cardview
      else {
        render = true;
      }
    } else {
      render = true;
    }
    
    if (render !== rendered) {
      // Render cards
      if (render) {
        setTimeout(function() {
          group.innerHTML = "";
          var frag = jSh.docFrag();
          
          for (let j=0; j<count; j++) {
            let index = start + j;
            
            let epWatched      = watched[index];
            let epNumber       = episode[index];
            let epSelected     = epTrackerCardsModel[index];
            let epLarge        = epNumber.length > 3;
            let cardStatusText = epWatched === 100 ? "seen" : epWatched >= 0 ? "watching" : "unseen";
            
            let cardBar = jSh.d(".aur-lo-eptracker-card-ep-stats-progress-bar", null, null, {
              style: "width: " + Math.max(epWatched, 0) + "%;"
            });
            
            let cardStatus = jSh.d(".aur-lo-eptracker-card-ep-stats-status" + (epWatched === 100 ? ".aur-lo-hilite" : ""), cardStatusText);
            
            let card = jSh.d(".aur-lo-eptracker-card-wrap" + (epSelected ? ".aur-lo-selected" : "") + (epNumber === curEpisode ? ".aur-lo-current" : ""), null, [
              jSh.d(".aur-lo-eptracker-card-inner", null, [
                // Episode number
                jSh.d(".aur-lo-eptracker-card-ep-number", null, [
                  jSh.d(".aur-lo-eptracker-card-ep-number-inner" + (epLarge ? ".aur-lo-small-letters" : ""), episode[index]),
                  
                  jSh.d(".aur-lo-eptracker-card-ep-number-watch-ep-wrap", null, [
                    jSh.c("a", {
                      sel: ".aur-lo-eptracker-card-ep-number-watch-ep",
                      prop: {
                        href: "/" + curAnime + "-episode-" + epNumber + "-english-subbed/"
                      }
                    })
                  ])
                ]),
                
                // Episode stats
                jSh.d(".aur-lo-eptracker-card-ep-stats-wrap", null, [
                  jSh.d(".aur-lo-eptracker-card-ep-stats", null, [
                    jSh.d(".aur-lo-eptracker-card-ep-stats-progress", null, [
                      cardBar
                    ]),
                    
                    jSh.d(".aur-lo-eptracker-card-ep-stats-status-wrap", null, [
                      cardStatus
                    ])
                  ])
                ])
              ])
            ], {
              "data-ep-card-index": index
            });
            
            frag.appendChild(card);
            
            epTrackerCardsMap[index] = card;
            epTrackerCardsBarMap[index] = cardBar;
            epTrackerCardsCapMap[index] = cardStatus;
          }
          
          group.appendChild(frag);
        }, 0);
      } else {
        setTimeout(function() {
          group.innerHTML = "";
          var frag = jSh.docFrag();
          
          for (let j=0; j<count; j++) {
            let index      = start + j;
            let epSelected = epTrackerCardsModel[index];
            let epNumber   = episode[index];
            let card       = epTrackerCardPHMap[index];
            
            frag.appendChild(card);
            epTrackerCardsMap[index] = null;
            epTrackerCardsBarMap[index] = null;
            epTrackerCardsCapMap[index] = null;
          }
          
          group.appendChild(frag)
        }, 0);
      }
    }
    
    group.setAttribute("data-rendered", Number(render));
  }
}

main.addStateListener("episodeDetails", function(details) {
  epTrackerTitle.childNodes[0].nodeValue = details.animeTitle + " Episodes";
});

var epTrackerOldShadeLevel = main.shadeLevel;
var epTrackerLoadedCards   = false;
var epTrackerLoadedAnime   = null;

// Add episode cards when animedata is loaded
tracker.on("animedata", function() {
  addEpTrackerCardGroups();
  console.log("ANIMEDATA - WTF");
});

epTrackerMode.addStateListener("active", function(active) {
  if (active) {
    epTrackerOldShadeLevel = main.shadeLevel;
    main.shadeLevel = main.shadeLevel > 0.9 ? main.shadeLevel : 0.9;
    main.playerTempDimensions = true;
    main.playerAnimated = true;
    
    // Move player
    main.playerScale = {
      x: 100 - epTrackerWidth,
      y: 100
    };
    
    main.playerPos = {
      x: 100,
      y: 0
    };
    
    // Hide caption since it's most likely in the way
    infoCaptionMode.active = false;
    ui.prefs.visible = false;
    
    // Load cards
    if (!epTrackerLoadedCards) {
      tracker.loadAnimeData();
      epTrackerLoadedCards = true;
      epTrackerLoadedAnime = main.episodeDetails.animeUnique;
      epTrackerCards.innerHTML = "";
    }
    
    // Update cards-wrap position
    setTimeout(function() {
      epTrackerCardsScroll.style.top = epTrackerInput.getBoundingClientRect().bottom + "px";
    }, 350);
  } else {
    if (main.enabled) {
      main.playerAnimated = true;
      main.shadeLevel = epTrackerOldShadeLevel;
      epTrackerInitiated = false;
    }
    
    main.playerTempDimensions = false;
    
  }
});

main.addStateListener("enabled", function(enabled) {
  if (!enabled)
    epTrackerMode.active = false;
  
  console.log("STATEOBJ", this);
});

// -----------------------
//       SHADING MODE
// -----------------------

// Add Shading Mode UI
var shadingTextInput = lces.new("numberfield");

shadingTextInput.min = 0;
shadingTextInput.max = 100;
shadingTextInput.value = 0;

var shadeBarWidth = 500;
var shadeBarScrubberWidth = 100;
var shadeBarMaxScrubDist = shadeBarWidth - shadeBarScrubberWidth;

// dom-element: Shade Bar
var shadingBarWrap = jSh.d(".aur-lo-shade-bar", null, [
  jSh.d(".aur-lo-shade-bar-trough", null, [
    jSh.d(".aur-lo-shade-bar-scrubber"),
    jSh.d(".aur-lo-shade-bar-start", "0%"),
    jSh.d(".aur-lo-shade-bar-end", "100%")
  ]),
  
  jSh.d(".aur-lo-shade-bar-text-input", null, [
    shadingTextInput.element
  ])
]);

var shadingBarTrough   = shadingBarWrap.jSh(".aur-lo-shade-bar-trough")[0];
var shadingBarScrubber = shadingBarWrap.jSh(".aur-lo-shade-bar-scrubber")[0];

shadingBarTrough.addEventListener("mousedown", function(e) {
  var target = e.target;
  
  // Prevent default browser behaviour
  e.preventDefault();
  
  // Client Rects
  var troughClientRect   = this.getBoundingClientRect();
  var scrubberClientRect = shadingBarScrubber.getBoundingClientRect();
  
  if (target === this || /aur-lo-shade-bar-(start|end)/.test(target.className)) {
    shadingScrubberUpdateShade(e.clientX - (troughClientRect.left + 1) - (shadeBarScrubberWidth / 2));
    window.addEventListener("mousemove", shadingScrubberMMove);
    window.addEventListener("mouseup", shadingScrubberMUp);
    
    shadeBarMScrubOffset = e.clientX;
    shadeBarOldScrubDist = shadeBarScrubDist;
  } else {
    window.addEventListener("mousemove", shadingScrubberMMove);
    window.addEventListener("mouseup", shadingScrubberMUp);
    
    shadeBarMScrubOffset = e.clientX;
    shadeBarOldScrubDist = shadeBarScrubDist;
  }
});

// dom-event: mousemove
var shadeBarOldScrubDist = 0;
var shadeBarScrubDist    = 0;
var shadeBarMScrubOffset = 0;
function shadingScrubberMMove(e) {
  e.preventDefault();
  
  shadingScrubberUpdateShade((e.clientX - shadeBarMScrubOffset) + shadeBarOldScrubDist);
}

// dom-event: mouseup
function shadingScrubberMUp() {
  window.removeEventListener("mousemove", shadingScrubberMMove);
  window.removeEventListener("mouseup", shadingScrubberMUp);
}

function shadingScrubberUpdateShade(distance) {
  var shadeLevel  = Math.max(Math.min(distance / shadeBarMaxScrubDist, 1), 0);
  main.shadeLevel = Math.round(shadeLevel * 100) / 100;
}

var shadeBarTimeout = null;
main.addStateListener("shadeLevel", function(shadeLevel) {
  clearTimeout(shadeBarTimeout);
  
  shadeBarScrubDist = jSh.numOp(shadeLevel * shadeBarMaxScrubDist, 0);
  
  // Update scrubber
  shadeBarTimeout = setTimeout(function() {
    shadingBarScrubber.style.transform = `translate(${ shadeBarScrubDist }px, 0px)`;
  }, 1);
  
  // Update text input
  shadingTextInput.value = parseInt(shadeLevel * 100);
});

shadingTextInput.addStateListener("value", function(value) {
  main.shadeLevel = parseInt(value) / 100;
});

shadingMode.mainBody.appendChild(shadingBarWrap);

// -----------------------
//  ANIME/EP CAPTION MODE
// -----------------------

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
    if (active) {
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

// -----------------------
//    SCALING/MOVE MODE
// -----------------------

// RectScaleGuide(LightsOutOverlay loInstance, number scale)
//
// scale: 0 - 100
function RectScaleGuide(loInstance, scale) {
  var that = this;
  
  loInstance.rectScaleGuides.push(this);
  
  // dom-element: Main rectangle
  var clickBoxes = [
    jSh.d(".aur-lo-scale-rect-guide-cbox.aur-lo-scale-right.aur-lo-scale-top.aur-lo-scale-h"),
    jSh.d(".aur-lo-scale-rect-guide-cbox.aur-lo-scale-right.aur-lo-scale-bottom.aur-lo-scale-v"),
    jSh.d(".aur-lo-scale-rect-guide-cbox.aur-lo-scale-left.aur-lo-scale-top.aur-lo-scale-v"),
    jSh.d(".aur-lo-scale-rect-guide-cbox.aur-lo-scale-left.aur-lo-scale-bottom.aur-lo-scale-h"),
  ];
  
  var mainBody = jSh.d(".aur-lo-scale-rect-guide.aur-lo-scalemove-disabled", null, clickBoxes);
  
  this.mainBody   = mainBody;
  this.scale      = scale;
  this.clickBoxes = {
    t: clickBoxes[0], // Top
    r: clickBoxes[1], // Right
    l: clickBoxes[2], // Left
    b: clickBoxes[3]  // Bottom
  };
  
  loInstance.addStateListener("playerAnimated", function(animated) {
    if (animated) {
      mainBody.classList.add("aur-lo-rect-animated");
    } else {
      mainBody.classList.remove("aur-lo-rect-animated");
    }
  });
  
  // Apply width/height to clickboxes
  var CSSScale         = scale + "%";
  var clickBoxesMapped = this.clickBoxes;
  
  clickBoxesMapped.t.style.width = CSSScale;
  clickBoxesMapped.r.style.height = CSSScale;
  clickBoxesMapped.l.style.height = CSSScale;
  clickBoxesMapped.b.style.width = CSSScale;
  
  // Add caption
  clickBoxesMapped.r.setAttribute("data-rect-scale", CSSScale);
  
  // Dimension properties
  this.maxTranslate = 100 - scale;
  
  this.x = 0;
  this.y = 0;
  
  // Events
  function onRectClick() {
    loInstance.playerAnimated = true;
    
    loInstance.playerPos = {
      x: jSh.numOp(that.x / (100 - scale), 0) * 100,
      y: jSh.numOp(that.y / (100 - scale), 0) * 100
    };
    
    loInstance.playerScale = {
      x: scale,
      y: scale
    };
  }
  
  clickBoxes.forEach(cb => {
    cb.addEventListener("click", onRectClick);
  });
}

function PlayerPosHandle(loInstance) {
  var buttonTray = jSh.d(".aur-lo-pos-handle-button-tray");
  var mainBody   = jSh.d(".aur-lo-pos-handle", null, buttonTray);
  
  this.mainBody = mainBody;
  loInstance.playerPosHandle = this;
  
  // Add buttons
  buttonTray.appendChild([
    jSh.c("button", {
      sel: ".aur-lo-pos-handle-button",
      text: "Center",
      events: {
        click() {
          main.playerAnimated = true;
          
          loInstance.playerPos = {
            x: 50,
            y: 50
          };
        }
      }
    }),
    
    jSh.c("button", {
      sel: ".aur-lo-pos-handle-button",
      text: "Save",
      events: {
        click() {
          actbar.mode = null;
        }
      }
    }),
    
    jSh.c("button", {
      sel: ".aur-lo-pos-handle-button",
      text: "Reset",
      events: {
        click() {
          loInstance.playerDimReset();
        }
      }
    }),
    
    jSh.c("button", {
      sel: ".aur-lo-pos-handle-button",
      text: "Disable",
      events: {
        click() {
          loInstance.playerFixed = false;
          actbar.mode = null;
        }
      }
    }),
  ]);
  
  // Pretty animations
  main.addStateListener("playerAnimated", function(animated) {
    if (animated) {
      mainBody.classList.add("aur-lo-pos-handle-animated");
    } else {
      mainBody.classList.remove("aur-lo-pos-handle-animated");
    }
  });
  
  scaleMoveMoveBtn.addStateListener("toggle", function(toggle) {
    mainBody.classList[toggle ? "remove" : "add"]("aur-lo-scalemove-disabled");
  });
  
  var clientX = 0;
  var clientY = 0;
  var posX    = 0;
  var posY    = 0;
  var maxX    = 0;
  var maxY    = 0;
  var maxXP   = 0;
  var maxYP   = 0;
  
  function onMouseMove(e) {
    var distX = e.clientX - clientX;
    var distY = e.clientY - clientY;
    
    loInstance.playerPos = {
      x: Math.min(Math.max(posX + (jSh.numOp(distX / maxX, 0) * 100), 0), 100),
      y: Math.min(Math.max(posY + (jSh.numOp(distY / maxY, 0) * 100), 0), 100)
    };
  }
  
  mainBody.addEventListener("mousedown", function(e) {
    if (!scaleMoveMoveBtn.toggle)
      return false;
    
    var target      = e.target;
    var playerPos   = loInstance.playerPos;
    var playerScale = loInstance.playerScale;
    
    // Make sure not clicking on a button
    if (target.tagName === "BUTTON")
      return false;
    
    clientX = e.clientX;
    clientY = e.clientY;
    posX    = playerPos.x;
    posY    = playerPos.y;
    maxX    = innerWidth * (1 - (playerScale.x / 100));
    maxY    = innerHeight * (1 - (playerScale.y / 100));
    
    // Show mouse grabbing thingy
    scalingMoveMode.mainBody.classList.add("aur-lo-grabbing");
    
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", function onMUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMUp);
      
      // Enough mouse grabbing thingy
      scalingMoveMode.mainBody.classList.remove("aur-lo-grabbing");
    });
  });
}

function ScalingCorners(loInstance) {
  loInstance.playerScalingCorners = this;
  
  var perCornerTransformFactor = {
    nw: {
      x: 1,
      y: 1,
      w: 0,
      h: 0
    },
    
    ne: {
      x: 0,
      y: 1,
      w: 1,
      h: 0
    },
    
    sw: {
      x: 1,
      y: 0,
      w: 0,
      h: 1
    },
    
    se: {
      x: 0,
      y: 0,
      w: 1,
      h: 1
    }
  };
  
  // Make DOM elements
  var mainBody   = jSh.d(".aur-lo-scaling-corners-wrap");
  var domCorners = {
    nw: jSh.d(".aur-lo-scaling-corner.aur-lo-scaling-corner-left.aur-lo-scaling-corner-top"),
    ne: jSh.d(".aur-lo-scaling-corner.aur-lo-scaling-corner-right.aur-lo-scaling-corner-top"),
    sw: jSh.d(".aur-lo-scaling-corner.aur-lo-scaling-corner-left.aur-lo-scaling-corner-bottom"),
    se: jSh.d(".aur-lo-scaling-corner.aur-lo-scaling-corner-right.aur-lo-scaling-corner-bottom")
  };
  
  // CSS for pointer hover
  domCorners.nw.style.cursor = "nw-resize";
  domCorners.ne.style.cursor = "ne-resize";
  domCorners.sw.style.cursor = "sw-resize";
  domCorners.se.style.cursor = "se-resize";
  
  // Make array for easier handling
  var domCornersArray = ["ne", "nw", "sw", "se"].map(corner => {
    var dom = domCorners[corner];
    dom.setAttribute("data-lo-scaling-corner", corner);
    
    return dom;
  });
  
  mainBody.appendChild(domCornersArray);
  
  this.domCorners = domCorners;
  this.mainBody   = mainBody;
  
  // Events
  
  // Setting vars
  var playerMaxWidthPx  = 450;
  var playerMaxHeightPx = 220;
  
  // Transform vars
  var corner  = null;
  var clientX = null;
  var clientY = null;
  
  var playerXPx         = null;
  var playerYPX         = null;
  var playerXMaxPx      = null;
  var playerYMaxPX      = null;
  var playerWidthPx     = null;
  var playerHeightPx    = null;
  var playerWidthMaxPx  = null;
  var playerHeightMaxPx = null;
  var innerWidthPx      = null;
  var innerHeightPx     = null;
  
  // Stateful vars
  var posHandle   = null;
  var scaleGuides = null;
  
  function onCornerMMove(e) {
    e.preventDefault();
    
    var xDiff = e.clientX - clientX;
    var yDiff = e.clientY - clientY;
    
    var newWidthPx;
    var newHeightPx;
    var newPosXPx;
    var newPosYPx;
    
    var newWidth;
    var newHeight;
    
    // Scaling contraints
    if (corner.w) {
      newWidthPx = Math.max(playerWidthPx + xDiff, playerMaxWidthPx);
    } else {
      newWidthPx = Math.max(playerWidthPx - xDiff, playerMaxWidthPx);
    }
    
    if (corner.h) {
      newHeightPx = Math.max(playerHeightPx + yDiff, playerMaxHeightPx);
    } else {
      newHeightPx = Math.max(playerHeightPx - yDiff, playerMaxHeightPx);
    }
    
    // Translation contraints
    if (corner.x) {
      newPosXPx = Math.min(playerXPx + xDiff, playerXMaxPx);
    } else {
      newPosXPx = playerXPx;
    }
    
    if (corner.y) {
      newPosYPx = Math.min(playerYPx + yDiff, playerYMaxPX);
    } else {
      newPosYPx = playerYPx;
    }
    
    if (corner.x)
      newWidth = Math.min(playerWidthMaxPx, newWidthPx, innerWidthPx - newPosXPx) / innerWidthPx;
    else
      newWidth = Math.min(newWidthPx, innerWidthPx - newPosXPx) / innerWidthPx;
    
    if (corner.y)
      newHeight = Math.min(playerHeightMaxPx, newHeightPx, innerHeightPx - newPosYPx) / innerHeightPx;
    else
      newHeight = Math.min(newHeightPx, innerHeightPx - newPosYPx) / innerHeightPx;
    
    loInstance.playerScale = {
      x: newWidth * 100,
      y: newHeight * 100
    };
    
    loInstance.playerPos = {
      x: Math.max(jSh.numOp(newPosXPx / Math.max(innerWidthPx - newWidthPx, Math.max(newPosXPx, 0)), 0) * 100, 0),
      y: Math.max(jSh.numOp(newPosYPx / Math.max(innerHeightPx - newHeightPx, Math.max(newPosYPx, 0)), 0) * 100, 0)
    };
  }
  
  function onCornerMDown(e) {
    e.preventDefault();
    cornerScaling = true;
    
    var target = e.target;
    corner = perCornerTransformFactor[target.getAttribute("data-lo-scaling-corner")];
    
    var playerPos   = loInstance.playerPos;
    var playerScale = loInstance.playerScale;
    
    // Setup some important vars
    clientX = e.clientX;
    clientY = e.clientY;
    
    innerWidthPx      = innerWidth;
    innerHeightPx     = innerHeight;
    playerWidthPx     = (playerScale.x / 100) * innerWidthPx;
    playerHeightPx    = (playerScale.y / 100) * innerHeightPx;
    playerXPx         = (innerWidthPx - playerWidthPx) * (playerPos.x / 100);
    playerYPx         = (innerHeightPx - playerHeightPx) * (playerPos.y / 100);
    playerWidthMaxPx  = playerXPx + playerWidthPx;
    playerHeightMaxPx = playerYPx + playerHeightPx;
    playerXMaxPx      = innerWidthPx - (innerWidthPx - (playerXPx + playerWidthPx) + playerMaxWidthPx);
    playerYMaxPX      = innerHeightPx - (innerHeightPx - (playerYPx + playerHeightPx) + playerMaxHeightPx);
    
    // Hide annoying shit
    posHandle   = scaleMoveMoveBtn.toggle;
    scaleGuides = scaleMoveScaleBtn.toggle;
    
    scaleMoveMoveBtn.toggle  = false;
    scaleMoveScaleBtn.toggle = false;
    
    window.addEventListener("mousemove", onCornerMMove);
    window.addEventListener("mouseup", function onMUp() {
      window.removeEventListener("mousemove", onCornerMMove);
      window.removeEventListener("mouseup", onMUp);
      
      // Reveal annoying shit
      scaleMoveMoveBtn.toggle  = posHandle;
      scaleMoveScaleBtn.toggle = scaleGuides;
      
      // Change stuff now
      cornerScaling = false;
    });
  }
  
  // Add event to corners
  mainBody.addEventListener("mousedown", onCornerMDown);
  
  // Hide corners when scaling disabled
  var cornerScaling = false;
  scaleMoveScaleBtn.addStateListener("toggle", function(toggle) {
    if (!cornerScaling) {
      if (toggle)
        mainBody.classList.remove("aur-lo-scalecorners-disabled");
      else
        mainBody.classList.add("aur-lo-scalecorners-disabled");
    }
  });
  
  loInstance.addStateListener("playerAnimated", function(animated) {
    if (animated) {
      mainBody.classList.add("aur-lo-corners-animated");
    } else {
      mainBody.classList.remove("aur-lo-corners-animated");
    }
  });
}

// Make stuff
main.rectScaleGuides = [];

function onDimensionsChange() {
  var playerPos       = main.playerPos;
  var playerScale     = main.playerScale;
  var rectScaleGuides = main.rectScaleGuides;
  
  if (!(playerPos && playerScale))
    return false;
  
  var playerCenterX = (playerPos.x * ((100 - playerScale.x) / 100)) + (playerScale.x / 2);
  var playerCenterY = (playerPos.y * ((100 - playerScale.y) / 100)) + (playerScale.y / 2);
  var playerScaleX  = playerScale.x;
  var playerScaleY  = playerScale.y;
  
  var captionRight  = playerPos.x <= 50;
  
  for (let i=0,l=rectScaleGuides.length; i<l; i++) {
    let rect      = rectScaleGuides[i];
    var rectBoxes = rect.clickBoxes;
    let rectScale = rect.scale;
    let halfScale = (rectScale / 2);
    let mainBody  = rect.mainBody;
    
    let x = 50 + ((1 - jSh.numOp(Math.max(rectScale - playerScaleX, 0) / (100 - playerScaleX), 1)) * (playerCenterX - 50)) - halfScale;
    rect.x = Math.max(Math.min(x, rect.maxTranslate), 0);
    
    let y = 50 + ((1 - jSh.numOp(Math.max(rectScale - playerScaleY, 0) / (100 - playerScaleY), 1)) * (playerCenterY - 50)) - halfScale;
    rect.y = Math.max(Math.min(y, rect.maxTranslate), 0);
    
    rectBoxes.t.style.left = rect.x + "%";
    rectBoxes.t.style.top  = rect.y + "%";
    
    rectBoxes.r.style.left = (rect.x + rectScale) + "%";
    rectBoxes.r.style.top  = rect.y + "%";
    
    rectBoxes.b.style.left = rect.x + "%";
    rectBoxes.b.style.top  = (rect.y + rectScale) + "%";
    
    rectBoxes.l.style.left = rect.x + "%";
    rectBoxes.l.style.top  = rect.y + "%";
    
    // Update caption placement
    if (captionRight) {
      rectBoxes.l.removeAttribute("data-rect-scale");
      rectBoxes.r.setAttribute("data-rect-scale", rectScale + "%");
    } else {
      rectBoxes.r.removeAttribute("data-rect-scale");
      rectBoxes.l.setAttribute("data-rect-scale", rectScale + "%");
    }
  }
  
  var playerPosHandle = main.playerPosHandle;
  if (playerPosHandle) {
    var posMainBody = playerPosHandle.mainBody;
    
    if (playerScaleX === 100)
      posMainBody.style.left = "0%";
    else
      posMainBody.style.left = (playerCenterX - (playerScale.x / 2)) + "%";
    
    if (playerScaleY === 100)
      posMainBody.style.top = "0%";
    else
      posMainBody.style.top = (playerCenterY - (playerScale.y / 2)) + "%";
    
    posMainBody.style.width  = playerScaleX + "%";
    posMainBody.style.height = playerScaleY + "%";
  }
  
  var playerScalingCorners = main.playerScalingCorners;
  if (playerScalingCorners) {
    var domCorners = playerScalingCorners.domCorners;
    
    var cNW = domCorners.nw;
    var cNE = domCorners.ne;
    var cSW = domCorners.sw;
    var cSE = domCorners.se;
    
    var cornerLeft   = (playerCenterX - (playerScale.x / 2)) + "%";
    var cornerRight  = (parseFloat(cornerLeft) + playerScale.x) + "%";
    var cornerTop    = (playerCenterY - (playerScale.y / 2)) + "%";
    var cornerBottom = (parseFloat(cornerTop) + playerScale.y) + "%";
    
    cNW.style.left = cornerLeft;
    cNW.style.top = cornerTop;
    
    cNE.style.left = cornerRight;
    cNE.style.top = cornerTop;
    
    cSW.style.left = cornerLeft;
    cSW.style.top = cornerBottom;
    
    cSE.style.left = cornerRight;
    cSE.style.top = cornerBottom;
  }
}

main.addStateListener("playerPos", onDimensionsChange);
main.addStateListener("playerScale", onDimensionsChange);

// Make guides and gang
scalingMoveMode.mainBody.appendChild([
  new PlayerPosHandle(main).mainBody,
  
  new RectScaleGuide(main, 100).mainBody,
  new RectScaleGuide(main, 90).mainBody,
  new RectScaleGuide(main, 75).mainBody,
  new RectScaleGuide(main, 50).mainBody,
  
  new ScalingCorners(main).mainBody
]);

scalingMoveMode.mainBody.classList.add("aur-lo-scalemove-mode");
scalingMoveMode.mainBody.css({
  width: "100%",
  height: "100%",
  bottom: "100%"
});

var smPrefsVisible   = ui.prefs.visible;
var smShadeLevel     = main.shadeLevel;
var smShadeClickThru = main.shadeClickThru;
scalingMoveMode.addStateListener("active", function(active) {
  if (active) {
    main.playerFixed = true;
    
    smPrefsVisible   = ui.prefs.visible;
    smShadeLevel     = main.shadeLevel;
    smShadeClickThru = main.shadeClickThru;
    
    ui.prefs.visible    = false;
    main.shadeLevel     = Math.max(0.85, smShadeLevel);
    main.shadeClickThru = false;
    
    main.player.style.outline = "1px solid rgba(255, 255, 255, 0.75)";
  } else {
    ui.prefs.visible    = smPrefsVisible;
    main.shadeLevel     = smShadeLevel;
    main.shadeClickThru = smShadeClickThru;
    
    main.player.style.outline = "0px";
  }
});

// Init everything
main.mounted = true;
// main.shadeLevel = 0.25;
// actbar.autohide = false;

// Make styles
var defShadeHeight = "80px";
var defShadeBG     = "rgba(0, 0, 0, 0.75)";
var defShadeBorder = "1px solid rgba(255, 255, 255, 0.75)";
var defShadeBorderLight = "1px solid rgba(255, 255, 255, 0.25)";

var shadeBarTextInputWidth  = 100;
var shadeBarTextInputOffset = 20;

var scalingCornerSize      = 60;
var scalingCornerPadding   = 30;
var scalingCornerLineWidth = 2;
var scalingCornerColor     = "";

// For pretty fonts
style.import("https://fonts.googleapis.com/css?family=Roboto:300");

style.styleBlock(`
  #watch-list > a.aur-lo-init-button {
    position: relative;
    padding-left: 27px !important;
    overflow: hidden;
  }
  
  #watch-list a.aur-lo-hidden {
    display: none !important;
  }
  
  #watch-list a.aur-lo-status-seen,
  #watch-list a.aur-lo-status-unseen {
    color: #ddd !important;
  }
  
  #watch-list a.aur-lo-status-seen {
    background: #2e586e !important;
  }
  
  #watch-list a.aur-lo-status-unseen {
    background: #526836 !important;
  }
  
  .aur-lo-init-button::before {
    content: "";
    position: absolute;
    display: block;
    top: 0px;
    left: 0px;
    width: 22px;
    height: 100%;
    
    background: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Cpath%20d%3D%22M8.518%204.94l-.065.048L3%209.055h14L11.482%204.94H8.518zM9%209.77v2.605c-.594.348-1%20.987-1%201.72%200%201.1.9%202%202%202s2-.9%202-2c0-.733-.406-1.372-1-1.72V9.772H9z%22%20style%3D%22opacity%3A1%3Bfill%3A%2320bfff%3Bstroke%3Anone%3B%22%2F%3E%3C%2Fsvg%3E') no-repeat;
    background-color: rgba(41, 44, 48, 0.75);
    background-position: 50% 50%;
    
    opacity: 0.85;
    transition: opacity 150ms ease-out, background-color 150ms ease-out;
  }
  
  .aur-lo-init-button:hover::before {
    opacity: 1;
    background-color: rgba(32, 191, 255, 0.25);
  }
  
  .aur-lo-shade-bar {
    position: absolute;
    left: 0px;
    right: ${ shadeBarTextInputOffset + shadeBarTextInputWidth + 2 }px;
    margin: 0px auto;
    bottom: 100px;
    width: ${ shadeBarWidth + 2 }px;
  }
  
  .aur-lo-shade-bar-trough .aur-lo-shade-bar-scrubber {
    position: absolute;
    top: 0px;
    left: 0px;
    height: ${ defShadeHeight };
    width: ${ shadeBarScrubberWidth }px;
    background: #fff;
    opacity: 0.75;
  }
  
  .aur-lo-shade-bar-trough,
  .aur-lo-shade-bar-text-input {
    display: inline-block;
    vertical-align: top;
  }
  
  .aur-lo-shade-bar-trough {
    position: relative;
    width: ${ shadeBarWidth }px;
    height: ${ defShadeHeight };
    margin-right: ${ shadeBarTextInputOffset }px;
    
    background: ${ defShadeBG };
    border: ${ defShadeBorder };
  }
  
  .aur-lo-shade-bar-trough .aur-lo-shade-bar-start,
  .aur-lo-shade-bar-trough .aur-lo-shade-bar-end {
    position: absolute;
    top: 0px;
    bottom: 0px;
    
    color: rgba(255, 255, 255, 0.25);
    font-size: 16px;
    font-family: Arial;
    text-align: center;
    line-height: ${ defShadeHeight };
    // opacity: 0.25;
    text-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5);
    
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
  }
  
  .aur-lo-shade-bar-trough .aur-lo-shade-bar-start {
    left: 25px;
  }
  
  .aur-lo-shade-bar-trough .aur-lo-shade-bar-end {
    right: 25px;
  }
  
  .aur-lo-shade-bar-text-input {
    position: absolute;
    bottom: 0px;
    left: 100%;
    margin-left: ${ shadeBarTextInputOffset }px;
  }
  
  .aur-lo-shade-bar-text-input input.lces.lces-numberfield {
    width: ${ shadeBarTextInputWidth }px !important;
    height: ${ defShadeHeight };
    box-sizing: border-box;
    border-radius: 0px;
    
    font-size: 27px;
    font-weight: normal;
    color: rgba(255, 255, 255, 0.75);
    line-height: 80px;
    text-align: center;
    background: ${ defShadeBG };
    border: ${ defShadeBorder };
  }
  
  // Next/prev episode buttons
  .aur-lo-actbar-button .aur-lo-ep-nav-anchor {
    position: absolute;
    z-index: 10;
    display: block;
    left: 0px;
    top: 0px;
    right: 0px;
    bottom: 0px;
  }
  
  // MOVING/SCALING MODE UI
  
  .aur-lo-modepane-view.aur-lo-scalemove-mode {
    transform: translate(0px, 0px) !important;
  }
  
  .aur-lo-modepane-view.aur-lo-scalemove-mode.aur-lo-grabbing {
    cursor: grabbing;
    cursor: -webkit-grabbing;
  }
  
  .aur-lo-modepane-view.aur-lo-scalemove-mode.aur-lo-grabbing * {
    cursor: grabbing;
    cursor: -webkit-grabbing;
  }
  
  .aur-lo-pos-handle {
    position: absolute;
    // z-index: 1000000000;
    background: #000;
    opacity: 0.65;
    cursor: grab;
    cursor: -webkit-grab;
  }
  
  // Pretty animations
  .aur-lo-pos-handle.aur-lo-pos-handle-animated {
    transition: left 250ms cubic-bezier(.33,.04,.14,.99), top 250ms cubic-bezier(.33,.04,.14,.99), width 250ms cubic-bezier(.33,.04,.14,.99), height 250ms cubic-bezier(.33,.04,.14,.99);
  }
  
  // Arrow logo-icon thing
  .aur-lo-pos-handle::before {
    content: "";
    position: absolute;
    display: block;
    left: 0px;
    right: 0px;
    bottom: 0px;
    top: 0px;
    margin: auto auto;
    width: 205px;
    height: 205px;
    
    transform: scale(0.75, 0.75);
    background: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22205%22%20height%3D%22205%22%3E%3Cpath%20d%3D%22M115%2080.87V52.5h25L102.5%2015%2065%2052.5h25v28.393M80.87%2090H52.5V65L15%20102.5%2052.5%20140v-25h28.393m43.238%200h28.37v25l37.5-37.5L152.5%2065v25h-28.394zM90%20124.13v28.37H65l37.5%2037.5%2037.5-37.5h-25v-28.393z%22%20style%3D%22opacity%3A0.5%3Bfill%3A%23ffffff%3Bstroke%3Anone%3B%22%2F%3E%3C%2Fsvg%3E') no-repeat;
  }
  
  .aur-lo-pos-handle.aur-lo-scalemove-disabled {
    cursor: default !important;
  }
  
  .aur-lo-pos-handle *,
  .aur-lo-pos-handle::before {
    opacity: 1;
    transition: opacity 150ms ease-out;
  }
  
  .aur-lo-pos-handle.aur-lo-scalemove-disabled *,
  .aur-lo-pos-handle.aur-lo-scalemove-disabled::before {
    pointer-events: none !important;
    opacity: 0 !important;
  }
  
  // Pos handle buttons
  .aur-lo-pos-handle .aur-lo-pos-handle-button-tray {
    position: absolute;
    bottom: 20%;
    left: 0px;
    right: 0px;
    
    text-align: center;
  }
  
  .aur-lo-pos-handle .aur-lo-pos-handle-button-tray .aur-lo-pos-handle-button {
    display: inline-block;
    border-radius: 5px;
    padding: 7px 10px;
    margin: 0px 10px;
    
    color: rgba(255, 255, 255, 0.85);
    background: rgba(0, 0, 0, 0.55);
    font-size: 18px;
    border: 1px solid rgba(255, 255, 255, 0.75);
    transition: border-color 150ms ease-out, background 150ms ease-out;
    cursor: pointer;
  }
  
  .aur-lo-pos-handle .aur-lo-pos-handle-button-tray .aur-lo-pos-handle-button:hover {
    border-color: #20BFFF;
    background: rgba(0, 0, 0, 0.85);
  }
  
  .aur-lo-scale-rect-guide {
    // Nothing here...
  }
  
  .aur-lo-scale-rect-guide-cbox {
    position: fixed;
    // z-index: 10000000000;
    
    opacity: 0.5;
    transition: opacity 150ms ease-out;
    cursor: pointer;
  }
  
  .aur-lo-scale-rect-guide:hover .aur-lo-scale-rect-guide-cbox {
    opacity: 1;
  }
  
  .aur-lo-scale-rect-guide.aur-lo-rect-animated .aur-lo-scale-rect-guide-cbox {
    transition: opacity 150ms ease-out, left 250ms cubic-bezier(.33,.04,.14,.99), top 250ms cubic-bezier(.33,.04,.14,.99);
  }
  
  .aur-lo-scale-rect-guide.aur-lo-scalemove-disabled .aur-lo-scale-rect-guide-cbox {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  
  .aur-lo-scale-rect-guide-cbox::before {
    content: "";
    position: absolute;
    background: #20BFFF;
  }
  
  .aur-lo-scale-h {
    // height: 8px;
    height: 16px;
    padding: 0px 7px;
  }
  
  .aur-lo-scale-v {
    width: 16px;
    padding: 7px 0px;
  }
  
  .aur-lo-scale-h.aur-lo-scale-top {
    margin-top: -7px;
    margin-left: -7px;
  }
  
  .aur-lo-scale-h.aur-lo-scale-bottom {
    margin-top: -9px;
    margin-left: -7px;
  }
  
  .aur-lo-scale-v.aur-lo-scale-left {
    margin-top: -7px;
    margin-left: -7px;
  }
  
  .aur-lo-scale-v.aur-lo-scale-right {
    margin-top: -7px;
    margin-left: -9px;
  }
  
  .aur-lo-scale-h::before {
    margin: 0px 9px;
    right: 0px;
    left: 0px;
    top: 7px;
    height: 2px;
  }
  
  .aur-lo-scale-v::before {
    margin: 7px 0px;
    top: 0px;
    bottom: 0px;
    left: 7px;
    width: 2px;
  }
  
  // Clickboxes Captions
  .aur-lo-scale-v::after {
    content: attr(data-rect-scale);
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 13px;
    height: 20px;
    margin: auto 0px;
    
    color: #20BFFF;
    font-size: 16px;
    font-weight: bold;
    line-height: 20px;
    text-align: right;
  }
  
  .aur-lo-scale-v.aur-lo-scale-left::after {
    right: auto;
    left: 13px;
  }
  
  // CORNER RESIZING
  
  // Animated stuff
  .aur-lo-scaling-corners-wrap.aur-lo-corners-animated .aur-lo-scaling-corner {
    transition: opacity 150ms ease-out, left 250ms cubic-bezier(.33,.04,.14,.99), top 250ms cubic-bezier(.33,.04,.14,.99);
  }
  
  .aur-lo-scaling-corners-wrap.aur-lo-scalecorners-disabled .aur-lo-scaling-corner {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  
  .aur-lo-scaling-corner {
    position: absolute;
    width: ${ scalingCornerSize }px;
    height: ${ scalingCornerSize }px;
    transition: opacity 150ms ease-out;
  }
  
  .aur-lo-scaling-corner::before,
  .aur-lo-scaling-corner::after {
    content: "";
    position: absolute;
    background: #FF5F20;
  }
  
  .aur-lo-scaling-corner.aur-lo-scaling-corner-left {
    margin-left: -${ scalingCornerPadding }px;
    padding-left: ${ scalingCornerPadding }px;
  }
  
  .aur-lo-scaling-corner.aur-lo-scaling-corner-right {
    margin-left: -${ scalingCornerSize }px;
    padding-right: ${ scalingCornerPadding }px;
  }
  
  .aur-lo-scaling-corner.aur-lo-scaling-corner-top {
    margin-top: -${ scalingCornerPadding }px;
    padding-top: ${ scalingCornerPadding }px;
  }
  
  .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom {
    margin-top: -${ scalingCornerSize }px;
    padding-bottom: ${ scalingCornerPadding }px;
  }
  
  .aur-lo-scaling-corner.aur-lo-scaling-corner-left::before,
  .aur-lo-scaling-corner.aur-lo-scaling-corner-left::after {
    left: ${ scalingCornerPadding }px;
  }
  
  .aur-lo-scaling-corner.aur-lo-scaling-corner-top::before,
  .aur-lo-scaling-corner.aur-lo-scaling-corner-top::after {
    top: ${ scalingCornerPadding }px;
  }
  
  .aur-lo-scaling-corner.aur-lo-scaling-corner-right::before,
  .aur-lo-scaling-corner.aur-lo-scaling-corner-right::after {
    right: ${ scalingCornerPadding }px;
  }
  
  .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom::before,
  .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom::after {
    bottom: ${ scalingCornerPadding }px;
  }
  
  .aur-lo-scaling-corner.aur-lo-scaling-corner-top::before,
  .aur-lo-scaling-corner.aur-lo-scaling-corner-top::after {
    top: ${ scalingCornerPadding }px;
  }
  
  // Top left-right corner
  .aur-lo-scaling-corner.aur-lo-scaling-corner-top.aur-lo-scaling-corner-left::before,
  .aur-lo-scaling-corner.aur-lo-scaling-corner-top.aur-lo-scaling-corner-right::before {
    width: ${ scalingCornerLineWidth }px;
    bottom: 0px;
  }
  
  // Bottom left-right corners
  .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom.aur-lo-scaling-corner-left::before,
  .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom.aur-lo-scaling-corner-right::before {
    width: ${ scalingCornerLineWidth }px;
    top: 0px;
  }
  
  // Left top-bottom corners
  .aur-lo-scaling-corner.aur-lo-scaling-corner-top.aur-lo-scaling-corner-left::after,
  .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom.aur-lo-scaling-corner-left::after {
    height: ${ scalingCornerLineWidth }px;
    right: 0px;
  }
  
  // Right top-bottom corners
  .aur-lo-scaling-corner.aur-lo-scaling-corner-top.aur-lo-scaling-corner-right::after,
  .aur-lo-scaling-corner.aur-lo-scaling-corner-bottom.aur-lo-scaling-corner-right::after {
    height: ${ scalingCornerLineWidth }px;
    left: 0px;
  }
  
  // ANIME/EP CAPTIONS
  
  .aur-lo-info-caption-wrap {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    padding: 25px 20px 45px;
    
    text-align: left;
    color: #eee;
    background: linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 75%);
  }
  
  .aur-lo-info-caption-wrap .aur-lo-anime-title {
    font-family: Roboto;
    font-size: 26px;
    margin: 0px 0px 10px;
    opacity: 0.65;
  }
  
  .aur-lo-info-caption-wrap .aur-lo-episode-number {
    font-family: Roboto;
    font-size: 36px;
    margin: 0px 0px 10px;
  }
  
  .aur-lo-info-caption-wrap .aur-lo-episode-number span {
    color: #20BFFF;
  }
  
  .aur-lo-info-caption-wrap .aur-lo-episode-title {
    font-size: 22px;
    font-style: italic;
    margin: 0px 0px 0px;
    opacity: 0.75;
  }
  
  // EPISODE TRACKER
  
  .aur-lo-episode-tracker-main {
    box-sizing: border-box;
    border-right: ${ defShadeBorderLight };
    
    text-align: left;
  }
  
  .aur-lo-eptracker-title {
    position: relative;
    padding: 25px 15px;
    padding-bottom: 35px;
    margin: 0px;
    margin-bottom: 0px;
    
    line-height: 30px;
    font-family: Roboto, Arial;
    font-size: 25px;
    font-weight: normal;
    color: rgba(255, 255, 255, 0.75);
  }
  
  // Close tracker button
  .aur-lo-eptracker-title .aur-lo-eptracker-close {
    position: absolute;
    width: 30px;
    height: 30px;
    top: 0px;
    bottom: 0px;
    right: 25px;
    margin: auto 0px;
    
    opacity: 0.5;
    cursor: pointer;
  }
  
  .aur-lo-eptracker-title .aur-lo-eptracker-close:hover {
    opacity: 0.75;
  }
  
  .aur-lo-eptracker-title .aur-lo-eptracker-close svg path {
    fill: #fff;
  }
  
  // Bulk actions tip
  .aur-lo-eptracker-title .aur-lo-tip {
    position: absolute;
    left: 15px;
    bottom: 20px;
    height: 15px;
    
    line-height: 15px;
    font-size: 12px;
    font-family: Arial;
    font-style: italic;
    color: #fff;
    opacity: 0.4;
  }
  
  .aur-lo-eptracker-input {
    position: relative;
    height: 50px;
    padding: 0px 5px;
    margin-left: 1px;
    margin-bottom: 10px;
    overflow: hidden;
    
    font-size: 0px;
    line-height: 50px;
    border-top: ${ defShadeBorderLight };
    border-bottom: ${ defShadeBorderLight };
    text-align: right;
  }
  
  .aur-lo-eptracker-input-separator {
    display: inline-block;
    vertical-align: middle;
    margin: 0px 5px;
    width: 0px;
    height: 100%;
    border-left: ${ defShadeBorderLight };
    opacity: 0.65;
  }
  
  .aur-lo-eptracker-input button {
    vertical-align: middle;
    margin: 0px 5px;
    padding: 5px 10px;
    border-radius: 3px;
    border: ${ defShadeBorderLight };
    
    font-family: Arial;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.75);
    background: rgba(255, 255, 255, 0.05);
    
    transition: color 150ms ease-out, background 150ms ease-out;
    cursor: pointer;
  }
  
  .aur-lo-eptracker-input button:hover {
    color: rgba(255, 255, 255, 1);
    background: rgba(255, 255, 255, 0.15);
  }
  
  .aur-lo-eptracker-input .aur-lo-episode-caption {
    position: absolute;
    top: 0px;
    left: 15px;
    
    font-size: 18px;
    line-height: 50px;
    color: rgba(255, 255, 255, 0.5);
  }
  
  // TRACKER CARD GROUPS
  .aur-lo-eptracker-card-render-group {
    display: inline;
  }
  
  // TRACKER CARDS
  
  .aur-lo-eptracker-cards-scroll {
    position: absolute;
    top: 132px;
    left: 0px;
    right: 0px;
    bottom: 0px;
  }
  
  .aur-lo-eptracker-cards-wrap {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    padding: 15px;
    
    text-align: left;
  }
  
  .aur-lo-eptracker-card-placeholder {
    display: inline-block;
    overflow: hidden;
    margin: 15px;
    width: ${ epTrackerCardWidth }px;
    height: ${ epTrackerCardHeight }px;
    
    border-radius: 10px;
    background: #0D0D0D;
    border: 2px solid #0D0D0D;
  }
  
  .aur-lo-eptracker-card-placeholder.aur-lo-selected {
    border-color: #20BFFF;
  }
  
  .aur-lo-eptracker-card-placeholder::before {
    content: attr(data-ep-num);
    display: block;
    margin: 35px 0px 0px 8px;
    
    font-size: 67px;
    font-family: "Trebuchet MS";
    color: rgba(255, 255, 255, 0.6);
  }
  
  .aur-lo-eptracker-card-placeholder.aur-lo-current::before {
    color: #20BFFF;
  }
  
  .aur-lo-eptracker-card-wrap {
    position: relative;
    display: inline-block;
    margin: 15px 15px;
    width: ${ epTrackerCardWidth }px;
    height: ${ epTrackerCardHeight }px;
    
    border-radius: 10px;
    border: 2px solid #2E2E2E;
    
    overflow: hidden;
    cursor: pointer;
  }
  
  .aur-lo-eptracker-card-wrap.aur-lo-selected {
    // border-color: #ddd;
    border-color: #20BFFF;
  }
  
  .aur-lo-eptracker-card-inner {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    width: ${ epTrackerCardWidth }px;
    height: ${ epTrackerCardHeight }px;
    
    border-radius: 0px;
    border: 0px solid #2E2E2E;
    background: #2E2E2E;
    
    overflow: hidden;
  }
  
  .aur-lo-eptracker-card-ep-number {
    position: relative;
    height: ${ epTrackerCardCapHeight }%;
    width: 100%;
    
    // background: rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.65);
    border-top-left-radius: ${ epTrackerCardInnerRadius }px;
    border-top-right-radius: ${ epTrackerCardInnerRadius }px;
  }
  
  .aur-lo-eptracker-card-ep-number-inner {
    position: absolute;
    left: 8px;
    bottom: -2px;
    
    font-size: 67px;
    font-family: "Trebuchet MS";
    color: rgba(255, 255, 255, 0.6);
  }
  
  .aur-lo-eptracker-card-ep-number-inner.aur-lo-small-letters {
    left: 9px;
    bottom: 3px;
    font-size: 37px;
  }
  
  .aur-lo-eptracker-card-wrap.aur-lo-current .aur-lo-eptracker-card-ep-number-inner {
    color: #20BFFF;
  }
  
  .aur-lo-eptracker-card-ep-stats-wrap {
    position: relative;
    height: ${ 100 - epTrackerCardCapHeight }%;
    width: 100%;
  }
  
  .aur-lo-eptracker-card-ep-stats {
    position: absolute;
    right: 0px;
    bottom: 0px;
    left: 0px;
    top: 2px;
    
    // background: rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.85);
    border-bottom-left-radius: ${ epTrackerCardInnerRadius }px;
    border-bottom-right-radius: ${ epTrackerCardInnerRadius }px;
  }
  
  .aur-lo-eptracker-card-ep-stats-progress {
    width: 100%;
    height: 5px;
    
    background: #808080;
    opacity: 0.5;
  }
  
  .aur-lo-eptracker-card-wrap:hover .aur-lo-eptracker-card-ep-stats-progress,
  .aur-lo-eptracker-card-wrap.aur-lo-selected .aur-lo-eptracker-card-ep-stats-progress {
    opacity: 1;
  }
  
  .aur-lo-eptracker-card-ep-stats-progress-bar {
    height: 100%;
    width: 28%;
    
    background: #20BFFF;
  }
  
  .aur-lo-eptracker-card-ep-stats-status-wrap {
    position: absolute;
    top: 50%;
    left: 0px;
    right: 0px;
    margin-top: 2px;
    
    text-align: center;
  }
  
  .aur-lo-eptracker-card-ep-stats-status {
    display: inline-block;
    // left: 50%;
    
    transform: translate(0px, -50%);
    text-transform: uppercase;
    font-size: 15px;
    letter-spacing: 0.1em;
    // font-weight: bold;
    // color: rgba(255, 255, 255, 0.45);
    color: #fff;
    opacity: 0.45;
  }
  
  .aur-lo-eptracker-card-wrap.aur-lo-selected .aur-lo-eptracker-card-ep-stats-status {
    // color: #20BFFF;
    // color: rgba(255, 255, 255, 0.65); // TODO: Check this
    opacity: 0.65;
  }
  
  .aur-lo-eptracker-card-ep-stats-status.aur-lo-hilite {
    color: #20BFFF;
  }
  
  .aur-lo-eptracker-card-ep-number-watch-ep-wrap {
    position: absolute;
    top: 17px;
    left: 0px;
    right: 0px;
    
    font-size: 1px;
    text-align: center;
  }
  
  .aur-ui-root .aur-lo-eptracker-card-ep-number-watch-ep {
    position: relative;
    z-index: 50;
    display: inline-block;
    // left: 50%;
    padding: 10px 7px;
    
    border-radius: 4px;
    background: #404040;
    color: #eee !important;
    font-size: 11.5em;
    
    box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.5);
    opacity: 0;
    transform: translate(0px, -5px);
    transition: opacity 150ms cubic-bezier(.33,.04,.14,.99), transform 150ms cubic-bezier(.33,.04,.14,.99);
  }
  
  .aur-lo-eptracker-card-wrap:hover .aur-lo-eptracker-card-ep-number-watch-ep {
    opacity: 0.75;
    transform: translate(0px, 0px);
  }
  
  .aur-lo-eptracker-card-wrap:hover .aur-lo-eptracker-card-ep-number-watch-ep:hover {
    opacity: 1;
  }
  
  .aur-lo-eptracker-card-ep-number-watch-ep::before {
    content: "WATCH EPISODE";
  }
  
  // TRACKER SCROLLBAR
  .aur-lo-eptracker-cards-scroll.aur-ui-root .lces-scrollbar-trough {
    width: 13px;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0.75;
  }
  
  .aur-lo-eptracker-cards-scroll.aur-ui-root .lces-scrollbar-trough:hover,
  .aur-ui-root .lces-scrollbar-trough.active {
    width: 13px;
    opacity: 1;
  }
  
  .aur-lo-eptracker-cards-scroll.aur-ui-root .lces-scrollbar {
    background: #545659;
  }
`);
