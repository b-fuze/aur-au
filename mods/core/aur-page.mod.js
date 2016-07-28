// aur-page test for different page types
AUR_NAME = "AUR Page";
AUR_DESC = "Anime Ultima Page Type Module";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;
AUR_INTERFACE = "auto";

var regs = reg;
var url  = document.location.toString();

regs.interface = {
  isAU:         /^https?:\/\/(www\.)?animeultima\.io(\/+[^]*(\?[^#]*)?(#[^]*)?)?$/.test(url),
  isHome:       /^https?:\/\/(www\.)?animeultima\.io(?:\/+(?:index.php)?(\?[^#]*)?)?(#[^]*)?$/.test(url),
  isLogin:      /^https?:\/\/(www\.)?animeultima\.io\/+login\/+(\?[^#]*)?(#[^]*)?$/.test(url),
  isRegister:   /^https?:\/\/(www\.)?animeultima\.io\/+register\/+(\?[^#]*)?(#[^]*)?$/.test(url),
  isEpisode:    /^https?:\/\/(www\.)?animeultima\.io\/+[^]+-episode-[\d\.]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/.test(url),
  isChannel:    /^https?:\/\/(www\.)?animeultima\.io\/+(?:watch\/+[^]+-english-subbed-dubbed-online)(?:\/+(\?[^#]*)?)?(#[^]*)?$/.test(url),
  isChannelFav: /^https?:\/\/(www\.)?animeultima\.io\/+(?:watch\/+[^]+-english-subbed-dubbed-online)\/+favorites\/?(#[^]*)?$/.test(url),
  isSearch:     /^https?:\/\/(www\.)?animeultima\.io\/+search.html(?:\?searchquery=?[^]*)?(#[^]*)?$/.test(url),
  isList:       /^https?:\/\/(www\.)?animeultima\.io\/+watch-anime(?:-movies)?(\/+(\?[^#]*)?)?(#[^]*)?$/.test(url),
  isUserChannel:/^https?:\/\/(www\.)?animeultima\.io\/+users\/+[^]+\/+/.test(url)
};
