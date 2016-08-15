AUR_NAME = "Thumbnail Fixes";
AUR_DESC = "Fixes the broken thumbnails on the main page and episode mirrors";
AUR_VERSION = 0.1;
AUR_AUTHORS = ["TDN (Samu)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";
AUR_USERSCRIPT_CLAUSE = [
  "@connect mp4upload.com"
];


var page = AUR.import("aur-page");
var aurdb = AUR.import("aur-db").getNS("thumbnail-fixes");


var btnProp = reg.ui.buttonProp(null, 12).addButton("Clear Cache", function() {
  aurdb.clearDB("thumbnail-cache");
});


reg.on("moddisable", revert);
reg.on("modenable", ini);



function getThumbsForMainPage(videoItemsBox, force) {
  if ((!videoItemsBox instanceof Element || videoItemsBox.classList.contains("aurMended")) && !force)
    return;

  if (force)
    console.log("FORCED");

  videoItemsBox.classList.add("aurMended");

  var videoItems = videoItemsBox.querySelectorAll(".generic-video-item");

  if (!videoItems.length)
    return;

  if (videoItems[0].querySelector(".title")) { //if main page

    for (var i = videoItems.length - 1; i >= 0; i--) {
      var videoItem = videoItems[i];

      var link = videoItem.querySelector(".thumb > a");

      if (db( getTitle(link.href) )) //if in database
        functionNameC(db( getTitle(link.href) ), videoItem);
      else //if not in db
        functionNameA(link.href, videoItem);

    }

  } else { //if episode page
    var iframe = document.querySelector("#pembed iframe");
    if (iframe)
        var link = iframe.src;

    if (db( getTitle(document.location.href) )) //if in db
      functionNameC(db( getTitle(document.location.href) ), videoItems);
    else //if not in db
      functionNameB(link, videoItems);
  }


}

function functionNameA(url, videoItem) {

  var req = new lcRequest({
    method: "GET",
    uri: url,
    success: function(){

      var match = this.response.match(/pembed.+<iframe.+src="([A-Za-z0-9_:/.?=;\-&~#[\]@!$'()*+,%\/]+)".+iframe>/);
      if (match && match[1]) {
        url = match[1];
        functionNameB(url, videoItem);
      } else {
        functionNameC(null, videoItem);
      }

    }
  });

    req.send();
}


function functionNameB(url, videoItems) {

  var thumbnailUrl;

  if (/auengine\.com/.test(url)) {

    var videoId = url.match(/file=(\w+)&?/);
    if (videoId && videoId[1])
      thumbnailUrl = "http://thumbs.auengine.com/" + videoId[1] + "_b.png";

    functionNameC(thumbnailUrl, videoItems);

  } else if (/mp4upload\.com/.test(url)) {

    videoId = url.match(/embed-(.+)-/);
    if (videoId && videoId[1]) {
      var url = "http://www.mp4upload.com/" + videoId[1];
      var regex = new RegExp('src="(http://www\\d*\\.mp4upload\\.com/\\w/\\d+/'+videoId[1]+'_t\\.jpg)"');

      AUR.request({
        method: "GET",
        uri: url,
        success: function(){
          var match = this.response.match(regex);
          if (match && match[1])
            functionNameC(match[1], videoItems);
        }
      })

    }

  } else {
    console.log("Mirror not supported");
  }
}


function functionNameC(thumbnailUrl, videoItems) {

  if (!videoItems.length && videoItems.length !== 0) {
    videoItems = [videoItems];
  }
  
  for(var i = 0; i < videoItems.length; i++){
    videoItem = videoItems[i];
    var anchor = videoItem.querySelector(".thumb a");
    if (anchor)
      var url = anchor.href;
    else
      var url = document.location.href;

    if (thumbnailUrl)
      db(getTitle(url), thumbnailUrl); //save thumbnail in db
    else
      thumbnailUrl = "http://i.imgur.com/PVtbs2M.png";
    
    var bgImg = videoItem.querySelector(".thumb .bg-image");
    var newBgImg = document.createElement("span");
    newBgImg.setAttribute("style", "position: absolute; top: 1px; left: 1px; width: 150px; height: 100px; background-size: 150px 100px;");
    newBgImg.style.backgroundImage = "url(" + thumbnailUrl + ")";
    newBgImg.className = "newThumbnail";

    bgImg.parentElement.appendChild(newBgImg);
    bgImg.style.display = "none";

    // if (!s)
    //   s = "Unknown";
    // var sourceTest = document.createElement("span");
    // sourceTest.className = "thumbnailSource";
    // sourceTest.innerText = s;
    // sourceTest.setAttribute("style", "background: black;font-size: 10px;color: #b1b1b1;position: absolute;bottom: 3px;left: 3px;z-index: 300;padding: 2px;")
    // bgImg.parentElement.appendChild(sourceTest);
  }

}


function revert() {
  
  var oldThumbnail = document.getElementsByClassName("bg-image");
  var newThumbnail = document.getElementsByClassName("newThumbnail");
  // var sources = document.getElementsByClassName("thumbnailSource");
  var videoItemsBox = document.getElementsByClassName("aurMended");

  for (var i = videoItemsBox.length - 1; i >= 0; i--) {
    videoItemsBox[i].classList.remove("aurMended");
  }
  for (var i = oldThumbnail.length - 1; i >= 0; i--) {
    oldThumbnail[i].removeAttribute("style");
  }
  // for (var i = sources.length - 1; i >= 0; i--) {
    // sources[i].parentElement.removeChild(sources[i]);
  // }
  for (var i = newThumbnail.length - 1; i >= 0; i--) {
    newThumbnail[i].parentElement.removeChild(newThumbnail[i]);
  }


}


function db(title, imgUrl) {
  var dbObj = aurdb.getDB("thumbnail-cache");

  if (!dbObj)
    dbObj = {};

  if (dbObj[title] !== undefined && imgUrl === undefined) {
    
    return dbObj[title];
  
  } else if (imgUrl !== undefined) {
    
    dbObj[title] = imgUrl;
    aurdb.setDB("thumbnail-cache", dbObj);
  
  }
}


function getTitle(url) {
  return url.replace(/^https?:\/\/(?:www\.)?animeultima\.io\/+([^]+-episode-[\d\.]+)(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(?:#[^]+)?$/, "$1");
}


function ini() {
  
  if (page.isHome) {
  
    var newEpisodes = document.getElementById("new-episodes");
    var popularEpisodes = document.querySelector("#main-content-hp > div.section");
    
    if (newEpisodes)
      getThumbsForMainPage(newEpisodes);
    if (popularEpisodes)
      getThumbsForMainPage(popularEpisodes);
  
  } else if (page.isEpisode) {
  
    var relatedVideos = document.getElementById("related-videos");
    if (relatedVideos)
      getThumbsForMainPage(relatedVideos);  
  
  }
}

ini();