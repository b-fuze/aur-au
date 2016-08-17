// New cleaner anime details module
AUR_NAME = "AUR Details";
AUR_DESC = "Anime Ultima Details Module";
AUR_VERSION = [0, 2, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;
AUR_INTERFACE = "auto";

var page     = {};
var liveData = AUR.import("aur-live-data");

AUR.onLoaded("aur-page", function() {
  page = AUR.import("aur-page");
});

var userBank  = liveData.dataBank();
var animeBank = liveData.dataBank();

// User live data
userBank.addData({
  name() {
    var name = jSh("#left-nav").getChild(-2).getChild(0).textContent.trim();
    
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
    if (page.isEpisode) {
      return jSh("#header-left").jSh("b")[0].textContent.trim().split(/\s*Episode\s*\d+/)[0];
    } else if (page.isChannel) {
      return jSh("#header-left").jSh("b")[0].textContent.trim();
    } else
      return null;
  },
  
  episode() {
    if (page.isEpisode) {
      return jSh("#epid").value;
    } else
      return null;
  },
  
  episodeTitle() {
    if (page.isEpisode && jSh("#pembed")) {
      var h1 = jSh("#main-content").jSh("h1")[0];
      
      if (h1.nextElementSibling && h1.nextElementSibling.tagName === "P") {
        var title = h1.nextElementSibling.textContent.trim().substr(1);
        return title.substr(0, title.length - 1);
      } else
        return "";
    } else
      return null;
  },
  
  channel() {
    if (page.isEpisode)
      return jSh("#chid").value;
    else if (page.isChannel)
      return jSh("#anime-table-info").jSh("tr")[0].getChild(1).textContent.trim();
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
    if (page.isEpisode && jSh("#pembed"))
      return jSh(".uploader-info")[0].textContent.match(/video\s+site:\s*([a-z\.\-_\d]+)\s*language:/i)[1];
    else
      return null;
  },
  
  mirrorURL() {
    if (page.isEpisode && jSh("#pembed")) {
      var pembed = jSh("#pembed");
      
      var embed  = pembed.jSh("embed")[0];
      var iframe = pembed.jSh("iframe")[0];
      
      return (embed || iframe || {src: null}).src;
    } else
      return null;
  },
  
  episodeAvailable() {
    if (page.isEpisode)
      return !!jSh("#pembed");
    else
      return null;
  }
});

reg.interface = function() {
  this.user  = userBank.exportBank();
  this.anime = animeBank.exportBank();
  
  this._update = function() {
    userBank.update();
    animeBank.update();
  }
}
