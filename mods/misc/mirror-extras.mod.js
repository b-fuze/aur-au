// AUR AU Mirror Fixes
AUR_NAME = "Mirror Extras";
AUR_DESC = "Fixes fullscreen problems, and adds download button and mirror list display features to AU.";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];

AUR_RESTART = false;
AUR_INTERFACE = "auto";
AUR_USERSCRIPT_CLAUSE = [
  "@grant GM_download",
  "@connect auengine.com",
  "@connect mp4upload.com",
  "@connect videonest.net"
];

var details = AUR.import("aur-details");
var page    = AUR.import("aur-page");
var sett    = AUR.import("aur-settings");
var style   = AUR.import("aur-styles");
var ui      = AUR.import("aur-ui");
var mtog    = AUR.import("mod-toggle", reg);
var aj      = AUR.import("ajaxify");
var modEnabled = true;

// Supported download mirrors
var supportedDLMirrors = [
  "auengine",
  "mp4upload",
  "videonest"
];

// Add settings
sett.setDefault("mirrorExtras", {
  showDownload: sett.Setting("Show download button", "boolean", true),
  listView: sett.Setting("Display mirrors as a list", "boolean", false)
});

// Set up toggle tracker
mtog.setting("mirrorExtras.showDownload", false);
mtog.setting("mirrorExtras.listView", false);

// Add UI buttons

// Get General tab
var genTab = ui.prefs.getTab("general");
var mirrorGroup = genTab.groupProp(null, 12, {
  title: "Episode Mirrors"
});

mirrorGroup.prop({
  link: "mirrorExtras.showDownload"
});

mirrorGroup.prop({
  link: "mirrorExtras.listView"
});

// Add little tip
mirrorGroup.textProp(null, 12, {
  data: "[qoute][12px]Download by [b]Right Clicking the button > Save As.[/b] [break][/break] Works with AUEngine, MP4Upload, and VideoNest. You don't need to play VideoNest videos anymore to download them.[/size][/quote]",
  dynText: true
});

// Create DL button and it's tray
var dlButton = jSh.c("a", {
  sel: ".aur-disabled-ctrl",
  prop: {
    download: details.anime.title + " - " + details.anime.episode + ".mp4",
    title: "Right click > Save (Link) As"
  },
  child: jSh.c("button", {
    sel: ".aur-mirror-dl",
    text: "Download episode"
  })
});
var utilTray = jSh.d(".aur-mirror-util-tray.lces-themify.aur-ui-root", undf, dlButton);

function mirrorFixes(doc) {
  var jShd = jSh.bind(doc);
  
  // Fix allowfullscreen problem
  var video = jShd("#pembed").jSh("iframe")[0];
  if (video)
    video.setAttribute("allowfullscreen", "true");
  
  // Check if a supported mirror
  if (supportedDLMirrors.indexOf(details.anime.mirror.toLowerCase()) !== -1 && video) {
    var dlLink = null;
    
    // Append DL button and tray to page
    jShd(".uploader-info")[0].appendChild(utilTray);
    
    var getLink = {
      auengine(page) {
        AUR.request({
          uri: page,
          success: function() {
            dlButton.href = this.responseText.match(/var\s+video_link\s+=\s+'(http:\/\/s\d+\.auengine\.com\/[a-z\d\-_\/]+\/[a-z\d\-_]+\.mp4)'/i)[1];
            dlButton.classList.remove("aur-disabled-ctrl");
          }
        });
      },
      mp4upload(page) {
        AUR.request({
          uri: page,
          success: function() {
            dlButton.href = this.responseText.match(/\{\s+"file"\s*:\s*"(https?:\/\/[^"]+\/video\.mp4)",/i)[1];
            dlButton.classList.remove("aur-disabled-ctrl");
          }
        });
      },
      videonest(page) {
        console.log(page);
        AUR.request({
          uri: page,
          success: function() {
            dlButton.href = this.responseText.match(/\.setup\(\{\s*file:\s*"([^\"]+)"\s*,/i)[1];
            
            // var [p0, p1, p2, p3, p4] = this.responseText.match(/eval\(function\(\w(?:,\w)+\)\{[^]+;return\s+p\}\('((?:[^](?!(?:[^\\](?='))))+[^]{2})',(\d+),(\d+),'((?:[^](?!(?:[^\\](?='))))+[^]{2})'\.split\('\|'\)/);
            // dlButton.href = (function(p, a, c, k) {
            //   while (c--)
            //       if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
            //   return p
            // })(p1, parseInt(p2), parseInt(p3), p4.split('|')).match(/file:\s*"([^"]+)"/i)[1];
            
            dlButton.classList.remove("aur-disabled-ctrl");
          }
        });
      }
    };
    
    // Load episode
    getLink[details.anime.mirror.toLowerCase()](
      video.getAttribute("src")
    );
  }
  
  // Add list display
  mirrorBlk = jShd("#related-videos");
  onListView(sett.get("mirrorExtras.listView"));
}

var mirrorBlk = jSh.d();
var listDisplayClass = "aur-mirror-list";

// List style CSS
var mirrorListStyles = style.styleBlock(`
  #related-videos.aur-mirror-list {
    font-size: 0px;
  }
  
  #related-videos.aur-mirror-list .generic-video-item {
    float: none;
    width: auto;
    
    position: relative;
    display: block;
    padding: 4px 10px 0px 130px;
    margin: 0px 2px 0px 0px;
    box-sizing: border-box;
    height: 80px;
    
    text-align: left;
    font-size: 17px;
    background: #282B30;
    // background: #3E424A;
    box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.25);
    text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
    
    transition: background 150ms ease-out;
  }
  
  #related-videos.aur-mirror-list .generic-video-item a[href*="/users/"] {
    position: relative;
    z-index: 100;
  }
  
  #related-videos.aur-mirror-list .generic-video-item:hover {
    background: #33373D;
  }
  
  #related-videos.aur-mirror-list .generic-video-item * {
    text-shadow: none;
  }
  
  #related-videos.aur-mirror-list .generic-video-item .time {
    position: absolute;
    left: 130px;
    bottom: 10px;
  }
  
  #related-videos.aur-mirror-list .generic-video-item .thumb {
    position: static;
    display: block;
    margin: 0px 0px 0px 0px;
    width: 0px;
    height: 0px;
    
    border: 0px;
  }
  
  #related-videos.aur-mirror-list .generic-video-item .thumb a:first-child::after {
    content: "";
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    z-index: 50;
  }
  
  #related-videos.aur-mirror-list .generic-video-item .thumb .bg-image,
  #related-videos.aur-mirror-list .generic-video-item .thumb .border,
  #related-videos.aur-mirror-list .generic-video-item .thumb .play {
    background-size: 100% 100%;
    top: 0px;
    left: 0px;
    width: 120px;
    height: 80px;
  }
  
  .generic-video-item div.thumb span.now-playing {
    background: transparent;
  }
  
  #related-videos.aur-mirror-list .generic-video-item .thumb .video-subbed,
  #related-videos.aur-mirror-list .generic-video-item .thumb .video-dubbed {
    position: absolute;
    left: auto;
    right: -2px;
    top: 0px;
    width: 2px;
    height: 100%;
    padding: 0px;
    
    font-size: 0px;
    color: transparent;
  }
  
  #related-videos.aur-mirror-list .generic-video-item .thumb .video-subbed::before,
  #related-videos.aur-mirror-list .generic-video-item .thumb .video-dubbed::before {
    content: "";
    position: absolute;
    display: block;
    right: 12px;
    bottom: 10px;
    font-size: 11px;
    font-weight: bold;
  }
  
  #related-videos.aur-mirror-list .generic-video-item .thumb .video-subbed::before {
    content: "SUBBED";
    color: #0066ff;
  }
  
  #related-videos.aur-mirror-list .generic-video-item .thumb .video-dubbed::before {
    content: "DUBBED";
    color: #8707ac;
  }
  
  #related-videos.aur-mirror-list .generic-video-item .thumb .trusted {
    left: auto;
    right: 10px;
    top: 10px;
    bottom: auto;
  }
`, false);

// Check if on an episode page
if (page.isEpisode) {
  mirrorFixes(document);
}

aj.onEvent("filter", /\/+[^]+-episode-[\d\.]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/, function(e) {
  mirrorFixes(e.dom);
});

// User toggled events
function onListView(e) {
  if (e.value) {
    mirrorBlk.classList.add(listDisplayClass);
    mirrorListStyles.disabled = false;
  } else {
    mirrorBlk.classList.remove(listDisplayClass);
    mirrorListStyles.disabled = true;
  }
}

sett.on("mirrorExtras.listView", onListView);

var disabledDlButton = style.styleBlock(style.important(`
  .aur-mirror-util-tray {
    display: none;
  }
`), false);

sett.on("mirrorExtras.showDownload", function(e) {
  disabledDlButton.enabled = !e.value;
});

reg.on("moddisable", function(e) {
  mirrorGroup.visible = false;
});

reg.on("modenable", function(e) {
  mirrorGroup.visible = true;
});
