// aur-page test for different page types
AUR_NAME = "AUR Page";
AUR_DESC = "Anime Ultima Page Type Module";
AUR_VERSION = [0, 2, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)", "Samu (TDN)"];
AUR_RESTART = true;
AUR_RUN_AT = "doc-start";

var liveData = AUR.import("aur-live-data");
var aj       = AUR.import("ajaxify");

var pageBank = liveData.dataBank();
var url = document.location.toString();

pageBank.addData({
  isAU() {
    return /^https?:\/\/(www\.)?animeultima\.io(\/+[^]*(\?[^#]*)?(#[^]*)?)?$/.test(url);
  },
  
  isHome() {
    return /^https?:\/\/(www\.)?animeultima\.io(?:\/+(?:index\.php\?(?!(?:m=)))?(\?[^#]*)?)?(#[^]*)?$/.test(url);
  },
  
  isLogin() {
    return /^https?:\/\/(www\.)?animeultima\.io\/+login\/+(\?[^#]*)?(#[^]*)?$/.test(url);
  },
  
  isRegister() {
    return /^https?:\/\/(www\.)?animeultima\.io\/+register\/+(\?[^#]*)?(#[^]*)?$/.test(url);
  },
  
  isEpisode() {
    return /^https?:\/\/(www\.)?animeultima\.io\/+[^]+-episode-[\d\.\-]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/.test(url);
  },
  
  isChannel() {
    return /^https?:\/\/(www\.)?animeultima\.io\/+(?:watch\/+[^]+-english-subbed-dubbed-online)(?:\/+(\?[^#]*)?)?(#[^]*)?$/.test(url);
  },
  
  isChannelFav() {
    return /^https?:\/\/(www\.)?animeultima\.io\/+(?:watch\/+[^]+-english-subbed-dubbed-online)\/+favorites\/?(#[^]*)?$/.test(url);
  },
  
  isSearch() {
    return /^https?:\/\/(www\.)?animeultima\.io\/+search.html(?:\?searchquery=?[^]*)?(#[^]*)?$/.test(url);
  },
  
  isList() {
    return /^https?:\/\/(www\.)?animeultima\.io\/+watch-anime(?:-movies)?(\/+(\?[^#]*)?)?(#[^]*)?$/.test(url);
  },
  
  isUserChannel() {
    return /^https?:\/\/(www\.)?animeultima\.io\/+users\/+[^]+\/+/.test(url);
  },
  
  isForum() {
    return /^https?:\/\/(www\.)?animeultima\.io\/+forums\/+[^]+/.test(url);
  }
});

var pbExport = pageBank.exportBank();

// Methods
jSh.constProp(pbExport, "addPage", function(page, regex) {
  if (!(page && typeof page === "string" && regex instanceof RegExp))
    return false;
  
  pageBank.addProp(page, function() {
    return regex.test(url);
  });
  
  pbExport.update();
});

jSh.constProp(pbExport, "update", function() {
  pageBank.update()
});

// AJAX'ify update
aj.onEvent("filter", /[^]/, function(e) {
  url = "http://www.animeultima.io" + e.route;
  pbExport.update();
});

// External AUR module interface
reg.interface = pbExport;
