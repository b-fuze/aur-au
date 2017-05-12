// Lights Out UI Library
AUR_NAME = "AU Lights Out";
AUR_DESC = "Add Lights Out to AnimeUltima";
AUR_VERSION = [0, 1, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
// AUR_INTERFACE = "auto";
AUR_RUN_AT = "doc-end";

var page = AUR.import("aur-page");
var sett = AUR.import("aur-settings");
var style = AUR.import("aur-styles");
var details = AUR.import("aur-details");
var LightsOut = AUR.import("lightsout");

function StartLightsOut() {
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

  // Startup LightsOut
  var loInst = new LightsOut({
    userModName: "au-lightsout",
    episodeTracker: true,
    generalConfigUI: reg.ui,
    scaleMove: true,
    
    getPlayer(doc) {
      var player = doc.jSh("#pembed iframe")[0];
      
      if (page.isEpisode && player) {
        player.css({
          background: "#000"
        });
      } else {
        player = null;
      }
      
      return player;
    },
    
    getEpisodeInfo(doc, e) {
      if (page.isEpisode) {
        addLOStartBtn(doc);
        
        // Return details
        return {
          animeUnique: e.route.match(/(?:^|\.io)\/+([^]+)-episode-[\d\.\-]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/)[1],
          animeTitle: details.anime.title,
          episode: details.anime.episode,
          episodeTitle: details.anime.episodeTitle
        };
      } else {
        return null;
      }
    },
    
    getEpisodeLinks(doc) {
      var episodeNav = doc.jSh(".video-meta-1")[0];
      var next       = null;
      var mid        = false;
      var prev       = null;
      
      if (episodeNav) {
        episodeNav = episodeNav.jSh(".orange");
      } else {
        return false;
      }
      
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
      
      return {
        next: next,
        prev: prev
      };
    },
    
    getTrackerData: function(done) {
      var animeUnique = location.pathname.match(/(?:^|\.io)\/+([^]+)-episode-[\d\.\-]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/)[1];
      var req = new lcRequest({
        uri: "/watch/" + animeUnique + "-english-subbed-dubbed-online/",
        success() {
          var index      = {};
          var episodeArr = [];
          var titleArr   = [];
          
          var dom  = new DOMParser().parseFromString(this.responseText, "text/html");
          var rows = jSh(dom).jSh("#animetable tr").slice(1);
          var invalidTitle = /^Episode\s+\d+/i;
          
          for (let i=0,l=rows.length; i<l; i++) {
            var row       = rows[i];
            var episode   = row.getChild(0).textContent.trim();
            var title     = row.getChild(1).textContent.trim();
            var available = !row.getChild(3).getAttribute("colspan");
            
            if (available) {
              index[episode] = i;
              episodeArr.push(episode);
              titleArr.push(invalidTitle.test(title) ? null : title);
            }
          }
          
          done({
            index: index,
            episode: episodeArr,
            title: titleArr
          });
        }
      });
      
      req.send();
    }
    // Nothing here :|
  });

  var main   = loInst.main;
  var actbar = main.actionBar;

  // Sync up enabled state
  reg.on("moddisable", function() {
    main.triggerEvent("moddisable", {});
    
    LOStartButton.classList.add("aur-lo-hidden");
    LOEpisodeStatusButton.classList.add("aur-lo-hidden");
  });

  reg.on("modenable", function() {
    main.triggerEvent("modenable", {});
    
    LOStartButton.classList.remove("aur-lo-hidden");
    LOEpisodeStatusButton.classList.remove("aur-lo-hidden");
  });

  LOStartButton.addEventListener("click", function() {
    main.player    = jSh("#pembed iframe")[0];
    main.enabled   = true;
    actbar.visible = true;
    
    // For episode tracker's close button
    main.epTrackerInitiated = false;
  });

  LOEpisodeStatusButton.addEventListener("click", function() {
    main.player    = jSh("#pembed iframe")[0];
    main.enabled   = true;
    actbar.visible = true;
    
    setTimeout(function() {
      loInst.modes.epTrackerMode.active = true;
    }, 250);
    
    // For episode tracker's close button
    main.epTrackerInitiated = true;
  });

  // Add Lights Out button
  function addLOStartBtn(doc) {
    if (doc.jSh("#pembed")) {
      doc.jSh("#watch-list").appendChild([LOStartButton, jSh.t(" "), LOEpisodeStatusButton]);
    }
  }

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

  // Some styles
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
  `);

  // Mount Lights Out
  loInst.mounted = true;
}

AUR.on("load", function() {
  setTimeout(function() {
    StartLightsOut();
  }, 10);
});
