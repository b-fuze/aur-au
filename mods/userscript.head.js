// ==UserScript==
// @name         AUR System
// @namespace    aur
// @version      1
// @description  AnimeUltima enRadiant Enhancement System
// @author       AU Programming Team
// @contributor  Mike32 (b-fuze) & TDN (Samu)
// @homepage     http://www.animeultima.io/forums/f118/welcome-au-programming-section-51711/
// @run-at       document-start
// @include      /^https?://([a-z\d]+\.)?animeultima.io(/+(?:index.php|login|register|search.html[^]*|watch-anime(?:-movies)?|watch/+[^]+-english-subbed-dubbed-online(?:/+favorites)?|[^]+-episode-[\d\.]+(?:-(?:english-[sd]ubbed|raw)(?:-video-mirror-\d+-[^]+)?)?)(?:/+)?|/+)?(\?[^#]*)?(#[^]*)?$/
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// ==/UserScript==

// From http://stackoverflow.com/questions/1997661/unique-object-identifier-in-javascript#answer-1997811
(function() {
  if ( typeof Object.id == "undefined" ) {
    var id = 0;
    
    Object.id = function(o) {
      if ( typeof o.__uniqueid == "undefined" ) {
        Object.defineProperty(o, "__uniqueid", {
          value: ++id,
          enumerable: false,
          // This could go either way, depending on your
          // interpretation of what an "id" is
          writable: false
        });
      }
      
      return o.__uniqueid;
    };
  }
})();
