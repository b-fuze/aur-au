// AUR Refactor Module
AUR_NAME = "Refactor";
AUR_DESC = "Fixes many broken aspects of AU pages";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;
AUR_INTERFACE = "auto";

var regs   = reg;
var page   = AUR.import("aur-page");
var detail = AUR.import("aur-details");
var style  = AUR.import("aur-styles");
var sett   = AUR.import("aur-settings");
var mtog   = AUR.import("mod-toggle", reg);
var aj     = AUR.import("ajaxify");

// Add jSh methods to document
jSh(document);

// Events for linking
//
// calendarload: Fired when the calendar is loaded and set
reg.addEvent("calendarload");

function remove(e) {
  AUR.sandbox(function() {
    e.parentNode.removeChild(e);
  }, true);
  
  return e;
}

function cleanText(e, regex, repl) {
  e.textContent = e.textContent.trim().replace(regex, repl);
}

// Remove games from nav
var nav = jSh("#left-nav").jSh(".ddtitle");
nav.every(e => !(e.textContent.trim().toLowerCase() === "games" && ((e.parentNode.style.display = "none") || true)));

// Add settings
sett.setDefault("refactor", {
  rmPopularEps: sett.Setting("Remove Popular Episodes", "boolean", false),
  rmTracker: sett.Setting("Remove Episode Tracker", "boolean", false),
  rmUserFlag: sett.Setting("Remove Country Flag", "boolean", false),
  hideChatango: sett.Setting("Hide Chatango", "boolean", true),
  channelEpisodeTab: sett.Setting("Split episodes and details", "boolean", false)
});

// Set up toggle tracker
mtog.setting("refactor.rmPopularEps", false);
mtog.setting("refactor.rmTracker", false);
mtog.setting("refactor.rmUserFlag", false);
mtog.setting("refactor.hideChatango", false);
mtog.setting("refactor.channelEpisodeTab", false);

reg.ui.prop({
  link: "refactor.rmPopularEps"
});

reg.ui.prop({
  link: "refactor.rmTracker"
});

reg.ui.prop({
  link: "refactor.rmUserFlag"
});

reg.ui.prop({
  link: "refactor.hideChatango"
});

reg.ui.prop({
  link: "refactor.channelEpisodeTab"
});

// Hide chatango chat
var hideChatango = `
  #right-content-hp > div.centered > div.side-box {
    display: none;
  }
`;

var chatango = style.styleBlock(style.important(hideChatango), sett.get("refactor.hideChatango"));

sett.on("refactor.hideChatango", function(e) {
  chatango.enabled = e.value;
});

// HOME PAGE FIXES

var popularEps = [];
var epsTracker = [];
var calCached  = null;
var calRequest = {abort(){}};

var calVisibleGroup = lces.new("group");
calVisibleGroup.setState("calVisible", false);

function fixHome(doc, ajEvt) {
  var jShd = jSh.bind(doc);
  
  remove(jShd("#hp-ads"));
  
  if (jShd("#new-anime-season")) {
    remove(jShd("#new-anime-season").previousElementSibling);
    remove(jShd("#new-anime-season"));
  }
  
  // Fix broken episode zero links on mainpage
  jShd("#new-episodes").jSh(".generic-video-item").forEach(function(thumb) {
    var a = thumb.jSh("a")[0];
    
    a.setAttribute("href", a.getAttribute("href").trim().replace(/-episode-0-english-(subbed|dubbed|raw)\/$/, "-episode-00-english-$1/"));
  });
  
  popularEps = [jShd("#main-content-hp").jSh("h3")[0], jShd("#main-content-hp").jSh(".section")[0]];
  
  if (jShd("#main-content-hp"))
    epsTracker = [jShd("#main-content-hp").jSh("h2")[0], jShd("#main-content-hp").jSh(".centered")[0]];
  else
    epsTracker = [];
  
  if (doc !== document) {
    rmPopularEps({value: sett.get("refactor.rmPopularEps")});
    rmTracker({value: sett.get("refactor.rmTracker")});
  }
  
  // Calendar FIX
  
  var calParent    = jShd(".nr-top")[0];
  var calTableWrap = jSh.d(".aur-calendar-wrap");
  var calEpsPage   = jShd("#new-episodes");
  
  var calTabs = [
    jShd(".nr-toggle-view")[0],
    jShd(".nr-toggle-view")[1]
  ];
  
  calRequest.abort();
  function fixCalendar(calSource) {
    var table = jSh((new DOMParser()).parseFromString(calSource, "text/html")).jSh("table")[0];
    
    // Append table DOM to wrapper div
    calTableWrap.appendChild(table);
    calEpsPage.parentNode.insertBefore(calTableWrap, calEpsPage);
    calTableWrap.style.display = "none";
    
    var tabPages = [
      calEpsPage,
      calTableWrap
    ];
    
    calParent.addEventListener("click", function(e) {
      var target    = e.target || e.srcElement; // Not even supporting old stuff, I think I'm wasting chars
      var targetInd = calTabs.indexOf(target);
      
      if (targetInd !== -1 && !target.classList.contains("nr-toggle-view-active")) {
        target.classList.add("nr-toggle-view-active");
        calTabs.forEach((tab, i) => i !== targetInd && tab.classList.remove("nr-toggle-view-active"));
        
        tabPages[targetInd].style.display = "block";
        tabPages.forEach((tp, i) => {
          if (i !== targetInd) {
            tp.style.display = "none";
            calVisibleGroup.calVisible = tp !== calTableWrap;
          }
        });
      }
    });
    
    // Broadcast completion
    regs.triggerEvent("calendarload", {
      calendar: table,
      visible: function() {
        var ev = lces.new();
        ev.setState("calVisible", false);
        
        calVisibleGroup.addMember(ev);
        return ev;
      }
    });
  }
  
  if (ajEvt.cache && calCached) {
    fixCalendar(calCached);
  } else {
    // Add calendar fix
    calRequest = new lcRequest({
      method: "GET",
      uri: "/ajax.php?method=newrelease_calendarview",
      success: function() {
        calCached = this.responseText;
        fixCalendar(calCached);
      }
    });
    
    calRequest.send();
  }
}

// Setting bound fixes
function rmPopularEps(e) {
  var toggle = !e.value ? "block" : "none";
  
  popularEps.forEach(function(e) {
    if (e)
      e.style.display = toggle;
  });
}

function rmTracker(e) {
  var toggle = !e.value ? "block" : "none";
  
  epsTracker.forEach(function(e) {
    if (e)
      e.style.display = toggle;
  });
}

sett.on("refactor.rmPopularEps", rmPopularEps);
sett.on("refactor.rmTracker", rmTracker);

// Mainpage
if (page.isHome) {
  fixHome(document, {});
}

aj.onEvent("filter", /^\/+(\?[^#]*)?(#[^]*)?$|^\/+index\.php\??(?!(?:m))/, function(e) {
  fixHome(e.dom, e);
});

// CHANNEL PAGE FIXES

var detailsTab  = jSh.d();
var episodeTab  = jSh.d();
var detailSect  = jSh.d();
var episodeSect = jSh.d();

function toggleEpisodeTab(toggle) {
  var det, ep, dtab, eptab;
  
  // Show details
  if (toggle === 0) {
    det   = "block";
    ep    = "none";
    dtab  = "add";
    eptab = "remove";
  }
  // Show episodes
  else if (toggle === 1) {
    det   = "none";
    ep    = "block";
    dtab  = "remove";
    eptab = "add";
  }
  
  // Disable
  if (toggle === 2) {
    det   = "block";
    ep    = "block";
    dtab  = "add";
    eptab = "remove";
    
    episodeTab.style.display = "none";
  } else {
    episodeTab.style.display = "inline";
  }
  
  // Apply changes
  detailSect.style.display  = det;
  episodeSect.style.display = ep;
  detailsTab.classList[dtab]("nr-toggle-view-active");
  episodeTab.classList[eptab]("nr-toggle-view-active");
}

sett.on("refactor.channelEpisodeTab", function(e) {
  if (e.value) {
    toggleEpisodeTab(1);
  } else {
    toggleEpisodeTab(2);
  }
});

function fixChannel(doc) {
  var jShd = jSh.bind(doc);
  
  cleanText(jShd("h1")[0], /Watch or Download "([^]+)" English Subbed\/Dubbed Online/i, "$1");
  cleanText(jShd("h2")[0], /[^]+/, "Synopsis");
  
  if (jShd("#watch-latest-episode")) {
    var link  = jShd("#watch-latest-episode").getChild(0);
    var epNum = jShd("#latest-episode-ongoing").getChild(1);
    
    remove(jShd("#watch-latest-episode"));
    
    // Wrap <a> element around episode number
    jShd("#latest-episode-ongoing").insertBefore(link, epNum);
    link.innerHTML = "";
    link.appendChild(epNum);
  }
  remove(jShd(".anime-desc")[0].jSh("p")[1]);
  
  if (jShd(".anime-pic")[0])
    remove(jShd(".anime-pic")[0]);
  
  var genres = jShd("#anime-table-info").getChild(0).getChild(4).getChild(1);
  
  if (genres)
    genres.innerHTML = jSh.filterHTML(genres.textContent);
  
  var rss = jShd("#anime-table-info").getChild(0).getChild(-1).getChild(1);
  
  remove(rss.jSh("img")[0]);
  rss.classList.add("aur-rss-fix");
  
  // Tabs container
  var tabCont = jShd("#main-content").jSh(".inline-top")[0];
  
  // Remove reviews tab
  remove(tabCont.getChild(1));
  
  // Separate episodes tab
  detailSect  = jShd("#main-content > .nr-content > .section")[0];
  episodeSect = jShd("#main-content > .nr-content > .section")[1];
  
  detailsTab = tabCont.getChild(0);
  episodeTab = jSh.c("a", {
    sel: ".nr-toggle-view",
    text: "Episodes",
    prop: {
      href: "javascript:void 0;"
    }
  });
  
  detailsTab.href = "javascript:void 0;";
  detailsTab.addEventListener("click", function() {
    toggleEpisodeTab(0);
  });
  
  episodeTab.addEventListener("click", function() {
    toggleEpisodeTab(1);
  });
  
  // Add episode tab
  tabCont.insertBefore(episodeTab, tabCont.getChild(0));
  
  // Disable initially
  if (!sett.get("refactor.channelEpisodeTab"))
    toggleEpisodeTab(2);
  else
    toggleEpisodeTab(1);
}

if (page.isChannel) {
  fixChannel(document);
}

aj.onEvent("filter", /^\/+watch\/+[^\/\s]+\//i, function(e) {
  fixChannel(e.dom);
});

// EPISODE PAGE REFACTORING

function fixEpisodePage(doc, ajaxify) {
  var jShd = jSh.bind(doc);
  
  if (jShd("#pembed")) {
    remove(jShd("#fb-like"));
    remove(jShd(".fornoobs")[0]);
    
    // Fix bug in aur-themify
    var episodeLinks = jShd(".nextepisode")[0].children;
    
    if (episodeLinks.length < 3 && /all/i.test(episodeLinks[0].textContent))
      jShd(".nextepisode")[0].insertBefore(
        jSh.c("a", {prop: {href: ""}, text: ih("&nbsp;"), className: ".aur-refactor"}),
        jShd(".nextepisode")[0].getChild(0)
      );
    
    // Remove the stupid arrows from the links if themify loads
    AUR.onLoaded("aur-themify", function() {
      jSh.toArr(jShd(".nextepisode")[0].children).forEach(function(e) {
        e.textContent = e.textContent.replace(/«|»/g, "");
      });
    });
    
    // Fix episode details
    if (jShd(".uploader-info")[0]) {
      var strong = jShd(".uploader-info")[0].jSh("strong").slice(0, 3);
      
      strong.forEach(e => e.textContent = e.textContent.replace(":", ""));
    }
    
    // Fix reporting pane
    var report = jShd("#report-form");
    report.getChild(-1).appendChild(jSh.c("input", {
      sel: ".button-link",
      attr: {
        type: "button",
        value: "Close",
        onclick: `$("#report-form").slideUp("slow");`
      }
    }));
    
    if (ajaxify)
      jShd(".report-button")[0].setAttribute("onclick", `$("#report-form").slideDown("slow");`);
  }
}

if (page.isEpisode) {
  fixEpisodePage(document);
}

aj.onEvent("filter", /\/+[^]+-episode-[\d\.]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/, function(e) {
  fixEpisodePage(e.dom, true);
});

// SEARCH PAGE FIXES

if (page.isSearch) {
  var searchTitle = remove(jSh("#main-content").getChild(0)).textContent.trim();
  var searchMsg   = jSh("#main-content").getChild(0);
  
  if (searchMsg.classList.contains("notice")) {
    var resultCount = searchMsg.textContent.trim().match(/^I\s+found\s+(\d+)\s+results/i)[1];
    
    searchMsg.textContent = resultCount + " s" + searchTitle.substr(1);
  } else if (searchMsg.textContent.indexOf("No results found") !== -1) {
    searchMsg.innerHTML = searchMsg.innerHTML.trim().replace(/^(No\s+results\s+found)(\.)/i, "$1 for " + jSh.filterHTML(searchTitle.match(/^Search\s+results\s+for\s+([^]+)/)[1]) + ".");
  }
}

if (page.isLogin) {
  // Remove notice
  jSh("#main-content > .notice")[0].classList.add("aur-refactor-removed");
  
  // Shorten remember
  var remember = jSh('label[for="remember"]')[0];
  remember.textContent = "Remember me?";
  
  // Add register button
  var loginBtn = jSh('input[value="Login"]')[0];
  var registerBtn = jSh.c("input", {
    prop: {
      type: "button",
      value: "Register"
    },
    events: {
      click() {
        document.location = "http://www.animeultima.io/register/";
      }
    }
  });
  
  loginBtn.parentNode.insertBefore(registerBtn, loginBtn.nextElementSibling);
}

if (page.isLogin || page.isRegister) {
  // Enlarge header
  var header = jSh("#main-content > h1")[0];
  header.css({
    width: page.isLogin ? "322px" : "203px",
    textAlign: "center",
    fontSize: "25px",
    margin: "40px auto 40px",
    padding: "0px 40px 15px",
    borderBottom: "1px solid #33373D"
  });
}

if (page.isList) {
  // Make anchors clickable
  var anchors = jSh("#animelist a[name]");
  
  for (var i=0,l=anchors.length; i<l; i++) {
    var anch = anchors[i];
    anch.href = "#" + anch.getAttribute("name");
  }
}

if (page.isHome || page.isChannel || page.isEpisode || page.isLogin || page.isRegister || page.isList) {
  // Remove useless menu entry
  remove(jSh("#left-nav").jSh("ul")[0].getChild(4));
  
  // Remove useless anime entries
  var airingAnime   = jSh("#ongoing-anime").jSh("li");
  var culpritTitles = /test|Re:[^]Hamatora/i;
  
  for (var i=0,l=airingAnime.length; i<l; i++) {
    var li = airingAnime[i];
    
    if (culpritTitles.test(li.getChild(0).textContent.trim()))
      remove(li);
  }
}

if (!page.isForum) {
  var rmFlagStyles = style.styleBlock(style.important(`
    #top-menu span.ddtitle img.flag {
      display: none;
    }
  `), false);
  
  // Remove the country flag
  sett.on("refactor.rmUserFlag", function(e) {
    rmFlagStyles.enabled = e.value;
  });
}

if (jSh("#hot-shows")) {
  jSh("#hot-shows").getChild(0).textContent = "Hot Anime This Season";
}

var activeStyles = style.styleBlock(`
  .aur-refactor-removed {
    display: none !important;
  }
`);

reg.on("moddisable", function() {
  activeStyles.enabled = false;
});

reg.on("modenable", function() {
  activeStyles.enabled = true;
});
