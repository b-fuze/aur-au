AUR_NAME = "Thumbnail Fixes";
AUR_DESC = "Fixes the broken thumbnails on the main page and episode mirrors";
AUR_VERSION = 0.1;
AUR_AUTHORS = ["TDN (Samu)"];
AUR_RESTART = true;
AUR_INTERFACE = "auto";


var page = AUR.import("aur-page");
var aurdb = AUR.import("aur-db");


reg.on("moddisable", revert);
reg.on("modenable", ini);



function getThumbsForMainPage(videoItemsBox){
  if( !videoItemsBox instanceof Element || videoItemsBox.classList.contains("aurMended") )
    return;

  videoItemsBox.classList.add("aurMended");

  var videoItems = videoItemsBox.querySelectorAll(".generic-video-item");

  for (var i = videoItems.length - 1; i >= 0; i--) {
    var videoItem = videoItems[i];

    if( videoItem.querySelectorAll(".title").length ){
      var link = videoItem.querySelector(".thumb > a"); //episode.jSh(".thumb > a");
      if( db(link.href) )
        functionNameC(db(link.href), videoItem, "Cache");
      else
        functionNameA(link.href, videoItem);

    }else{
      var link = document.querySelector("#pembed iframe").src;
      if( db(document.location.href) )
        functionNameC(db(document.location.href), videoItem);
      else
        functionNameB(link, videoItem, "Cache");
    }

  }

}

function functionNameA(url, videoItem){

  var req = new lcRequest({
    method: "GET",
    uri: url,
    success: function(){

      var match = this.response.match(/pembed.+<iframe.+src="([A-Za-z0-9_:/.?=;\-&~#[\]@!$'()*+,%\/]+)".+iframe>/);
      if ( match && match[1])
        url = match[1];

      functionNameB(url, videoItem);

    }
  });

    req.send();
}


function functionNameB(url, videoItem){

  var thumbnailUrl;

  if( /auengine\.com/.test(url) ){

    var videoId = url.match(/file=(\w+)&?/);
    if( videoId && videoId[1] )
      thumbnailUrl = "http://thumbs.auengine.com/" + videoId[1] + "_b.png";

    functionNameC(thumbnailUrl, videoItem , "AUEngine");

  }else if( /mp4upload\.com/.test(url) ){

    videoId = url.match(/embed-(.+)-/);
    if( videoId && videoId[1] ){
      var url = "http://www.mp4upload.com/" + videoId[1];
      var regex = new RegExp('src="(http://www\\d*\\.mp4upload\\.com/\\w/\\d+/'+videoId[1]+'_t\\.jpg)"');

      AUR.request({
        method: "GET",
        uri: url,
        success: function(){
          var match = this.response.match(regex);
          if( match && match[1] )
            functionNameC(match[1], videoItem, "MP4Upload");
        }
      })

    }

  }

}


function functionNameC(thumbnailUrl, videoItem, s){

  var anchor = videoItem.querySelector(".thumb a");
  if( anchor )
    var url = anchor.href;
  else
    var url = document.location.href;

  db(url, thumbnailUrl);

  console.log(s);
  var bgImg = videoItem.querySelector(".thumb .bg-image");

  if( !thumbnailUrl )
    thumbnailUrl = "http://static.cdn.animeultima.tv/images/blank.gif";

  var newBgImg = document.createElement("span");
  newBgImg.setAttribute("style", "position: absolute; top: 1px; left: 1px; width: 150px; height: 100px; background-size: 150px 100px;");
  newBgImg.style.backgroundImage = "url(" + thumbnailUrl + ")";
  newBgImg.className = "newThumbnail";

  bgImg.parentElement.appendChild(newBgImg);
  bgImg.style.display = "none";

  if( !s )
    s = "Unknown";
  var sourceTest = document.createElement("span");
  sourceTest.className = "thumbnailSource";
  sourceTest.innerText = s;
  sourceTest.setAttribute("style", "background: black;font-size: 10px;color: #b1b1b1;position: absolute;bottom: 3px;left: 3px;z-index: 300;padding: 2px;")
  bgImg.parentElement.appendChild(sourceTest);

}


function revert(){
  
  var oldThumbnail = document.getElementsByClassName("bg-image");
  var newThumbnail = document.getElementsByClassName("newThumbnail");
  var sources = document.getElementsByClassName("thumbnailSource");
  var videoItemsBox = document.getElementsByClassName("aurMended");

  for (var i = videoItemsBox.length - 1; i >= 0; i--) {
    videoItemsBox[i].classList.remove("aurMended");
  }
  for (var i = oldThumbnail.length - 1; i >= 0; i--) {
    oldThumbnail[i].removeAttribute("style");
  }
  for (var i = sources.length - 1; i >= 0; i--) {
    sources[i].parentElement.removeChild(sources[i]);
  }
  for (var i = newThumbnail.length - 1; i >= 0; i--) {
    newThumbnail[i].parentElement.removeChild(newThumbnail[i]);
  }
}


function db(title, imgUrl){
  var dbObj = aurdb.getDB("thumbnail-cache");

  if( !dbObj )
    dbObj = {};

  if( dbObj[title] !== undefined && imgUrl === undefined ){
    
    return dbObj[title];
  
  }else if( imgUrl !== undefined ){
    
    dbObj[title] = imgUrl;
    aurdb.setDB("thumbnail-cache", dbObj);
  
  }
}


function ini(){
  if(page.isHome)
    getThumbsForMainPage(document.getElementById("new-episodes"));
  else if (page.isEpisode)
    getThumbsForMainPage(document.getElementById("related-videos"));  
}

ini();