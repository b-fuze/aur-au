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

// Events for linking
//
// calendarload: Fired when the calendar is loaded and set
reg.addEvent("calendarload");

function remove(e) {
  e.parentNode.removeChild(e);
  
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

// Mainpage
if (page.isHome) {
  remove(jSh("#hp-ads"));
  
  if (jSh("#new-anime-season")) {
    remove(jSh("#new-anime-season").previousElementSibling);
    remove(jSh("#new-anime-season"));
  }
  
  // Fix broken episode zero links on mainpage
  jSh("#new-episodes").jSh(".generic-video-item").forEach(function(thumb) {
    var a = thumb.jSh("a")[0];
    
    a.href = (a.href + "").trim().replace(/-episode-0-english-(subbed|dubbed|raw)\/$/, "-episode-00-english-$1/");
  });
  
  var popularEps = [jSh("#main-content-hp").jSh("h3")[0], jSh("#main-content-hp").jSh(".section")[0]];
  var epsTracker = [jSh("#main-content-hp").jSh("h2")[0], jSh("#main-content-hp").jSh(".centered")[0]];
  
  // Setting bound fixes
  sett.on("refactor.rmPopularEps", function(e) {
    var toggle = !e.value ? "block" : "none";
    
    popularEps.forEach(function(e) {
      if (e)
        e.style.display = toggle;
    });
  });
  
  // Remove the country flag
  sett.on("refactor.rmUserFlag", function(e) {
    rmFlagStyles.enabled = e.value;
  });
  
  var rmFlagStyles = style.styleBlock(style.important(`
    #top-menu span.ddtitle img.flag {
      display: none;
    }
  `), false);
  
  // Check if the user's logged in
  if (detail.user.name)
    sett.on("refactor.rmTracker", function(e) {
      var toggle = !e.value ? "block" : "none";
      
      epsTracker.forEach(function(e) {
        if (e)
          e.style.display = toggle;
      });
    });
  
  // Add calendar fix
  var calReq = new lcRequest({
    method: "GET",
    uri: "/ajax.php?method=newrelease_calendarview",
    success: function() {
      var parent    = jSh(".nr-top")[0];
      var tableWrap = jSh.d(".aur-calendar-wrap");
      var table     = jSh((new DOMParser()).parseFromString(this.responseText, "text/html")).jSh("table")[0];
      var epsPage   = jSh("#new-episodes");
      
      // Append table DOM to wrapper div
      tableWrap.appendChild(table);
      
      epsPage.parentNode.insertBefore(tableWrap, epsPage);
      tableWrap.style.display = "none";
      
      var tabs = [
        jSh(".nr-toggle-view")[0],
        jSh(".nr-toggle-view")[1]
      ];
      
      var tabPages = [
        epsPage,
        tableWrap
      ];
      
      var visibleGroup = lces.new("group");
      visibleGroup.setState("calVisible", false);
      
      parent.addEventListener("click", function(e) {
        var target    = e.target || e.srcElement; // Not even supporting old stuff, I think I'm wasting chars
        var targetInd = tabs.indexOf(target);
        
        if (targetInd !== -1 && !target.classList.contains("nr-toggle-view-active")) {
          target.classList.add("nr-toggle-view-active");
          tabs.forEach((tab, i) => i !== targetInd && tab.classList.remove("nr-toggle-view-active"));
          
          tabPages[targetInd].style.display = "block";
          tabPages.forEach((tp, i) => {
            if (i !== targetInd) {
              tp.style.display = "none";
              visibleGroup.calVisible = tp !== tableWrap;
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
          
          visibleGroup.addMember(ev);
          return ev;
        }
      });
    }
  });
  
  calReq.send();
}

if (page.isChannel) {
  cleanText(jSh("h1")[0], /Watch or Download "([^]+)" English Subbed\/Dubbed Online/i, "$1");
  cleanText(jSh("h2")[0], /[^]+/, "Synopsis");
  
  if (jSh("#watch-latest-episode")) {
    var link  = jSh("#watch-latest-episode").getChild(0);
    var epNum = jSh("#latest-episode-ongoing").getChild(1);
    
    remove(jSh("#watch-latest-episode"));
    
    // Wrap <a> element around episode number
    jSh("#latest-episode-ongoing").insertBefore(link, epNum);
    link.innerHTML = "";
    link.appendChild(epNum);
  }
  remove(jSh(".anime-desc")[0].jSh("p")[1]);
  
  if (jSh(".anime-pic")[0])
    remove(jSh(".anime-pic")[0]);
  
  var genres = jSh("#anime-table-info").getChild(0).getChild(4).getChild(1);
  
  if (genres)
    genres.innerHTML = jSh.filterHTML(genres.textContent);
  
  var rss = jSh("#anime-table-info").getChild(0).getChild(-1).getChild(1);
  
  remove(rss.jSh("img")[0]);
  rss.classList.add("aur-rss-fix");
  
  // Tabs container
  var tabCont = jSh("#main-content").jSh(".inline-top")[0];
  
  // Remove reviews tab
  remove(tabCont.getChild(1));
  
  // Separate episodes tab
  var detailSect  = jSh("#main-content > .nr-content > .section")[0];
  var episodeSect = jSh("#main-content > .nr-content > .section")[1];
  
  var detailsTab = tabCont.getChild(0);
  var episodeTab = jSh.c("a", {
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
  
  // Disable initially
  toggleEpisodeTab(2);
  
  sett.on("refactor.channelEpisodeTab", function(e) {
    if (e.value) {
      toggleEpisodeTab(1);
    } else {
      toggleEpisodeTab(2);
    }
  });
}

if (page.isEpisode) {
  if (detail.anime.episodeAvailable) {
    remove(jSh("#fb-like"));
    remove(jSh(".fornoobs")[0]);
    
    // Fix bug in aur-themify
    var episodeLinks = jSh(".nextepisode")[0].children;
    
    if (episodeLinks.length < 3 && /all/i.test(episodeLinks[0].textContent))
      jSh(".nextepisode")[0].insertBefore(
        jSh.c("a", {prop: {href: ""}, text: ih("&nbsp;"), className: ".aur-refactor"}),
        jSh(".nextepisode")[0].getChild(0)
      );
    
    // Remove the stupid arrows from the links if themify loads
    AUR.onLoaded("aur-themify", function() {
      jSh.toArr(jSh(".nextepisode")[0].children).forEach(function(e) {
        e.textContent = e.textContent.replace(/«|»/g, "");
      });
    });
    
    // Fix episode details
    if (jSh(".uploader-info")[0]) {
      var strong = jSh(".uploader-info")[0].jSh("strong").slice(0, 3);
      
      strong.forEach(e => e.textContent = e.textContent.replace(":", ""));
    }
    
    // Fix reporting pane
    var report = jSh("#report-form");
    report.getChild(-1).appendChild(jSh.c("input", {
      sel: ".button-link",
      attr: {
        type: "button",
        value: "Close",
        onclick: `$("#report-form").slideUp("slow");`
      }
    }));
  }
}

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
