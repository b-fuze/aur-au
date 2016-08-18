// New cleaner anime details module
AUR_NAME = "AUR Details";
AUR_DESC = "Anime Ultima Details Module";
AUR_VERSION = [0, 2, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;
AUR_INTERFACE = "auto";

var page     = {};
var liveData = AUR.import("aur-live-data");
var aj       = AUR.import("ajaxify");

AUR.onLoaded("aur-page", function() {
  page = AUR.import("aur-page");
});

var userBank  = liveData.dataBank();
var animeBank = liveData.dataBank();
var jShd      = jSh;

// User live data
userBank.addData({
  name() {
    var name = jShd("#left-nav").getChild(-2).getChild(0).textContent.trim();
    
    if (name.toLowerCase() !== "account")
      return name;
    else
      return null;
  },
  
  id() {
    return null;
  }
});

// Anime related live data
animeBank.addData({
  title() {
    if (jShd("#pembed")) {
      return jShd("#header-left").jSh("b")[0].textContent.trim().split(/\s*Episode\s*\d+/)[0];
    } else if (jShd("#animetable")) {
      return jShd("#header-left").jSh("b")[0].textContent.trim();
    } else
      return null;
  },
  
  episode() {
    if (jShd("#pembed")) {
      return jShd("#epid").value;
    } else
      return null;
  },
  
  episodeTitle() {
    if (jShd("#pembed")) {
      var h1 = jShd("#main-content").jSh("h1")[0];
      
      if (h1.nextElementSibling && h1.nextElementSibling.tagName === "P") {
        var title = h1.nextElementSibling.textContent.trim().substr(1);
        return title.substr(0, title.length - 1);
      } else
        return "";
    } else
      return null;
  },
  
  channel() {
    if (jShd("#pembed"))
      return jShd("#chid").value;
    else if (page.isChannel)
      return jShd("#anime-table-info").jSh("tr")[0].getChild(1).textContent.trim();
    else
      return null;
  },
  
  videoId() { // TODO: Fix
    // if (page.isEpisode)
    //   return jSh("#videoid").value;
    // else
      return null;
  },
  
  mirror() {
    if (jShd("#pembed"))
      return jShd(".uploader-info")[0].textContent.match(/video\s+site:\s*([a-z\.\-_\d]+)\s*language:/i)[1];
    else
      return null;
  },
  
  mirrorURL() {
    if (jShd("#pembed")) {
      var pembed = jShd("#pembed");
      
      var embed  = pembed.jSh("embed")[0];
      var iframe = pembed.jSh("iframe")[0];
      
      return (embed || iframe || {src: null}).src;
    } else
      return null;
  },
  
  episodeAvailable() {
    if (jShd("#pembed"))
      return !!jShd("#pembed");
    else
      return null;
  }
});

reg.interface = function() {
  this.user  = userBank.exportBank();
  this.anime = animeBank.exportBank();
  
  this._update = _update;
}

function _update() {
  userBank.update();
  animeBank.update();
}

// AJAX'ify update
aj.onEvent("filter", /[^]/, function(e) {
  jShd = jSh.bind(e.dom);
  _update();
  jShd = jSh;
});
