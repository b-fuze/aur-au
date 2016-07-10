// AUR AU Mirror Fixes
AUR_NAME = "Search Suggestions";
AUR_DESC = "Shows search suggestions when you type in the search bar.";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";

var sett  = AUR.import("aur-settings");
var style = AUR.import("aur-styles");
var ui    = AUR.import("aur-ui");
var aurdb = AUR.import("aur-db");
var dbname = "search-suggest-entry-db";

// Make settings
sett.setDefault("searchSuggest", {
  maxResults: sett.Setting("Maximum search results", "number", 6)
});

// Add settings to ui
reg.ui.prop({
  link: "searchSuggest.maxResults",
  min: 2,
  max: 15
});

var modEnabled = true;
var tmpEntries = aurdb.getDB(dbname);
var entries    = null;
var selEntries = 0;
var selEntry   = -1;
var active     = false; // True if user is active searching
var container = jSh.d(".aur-search-suggest-wrap", null, [
  jSh.d(".aur-ss-head"),
  jSh.d(".aur-ss-entries", null, [
    jSh.d(".aur-ss-result.ss-loading")
  ]),
  jSh.d(".aur-ss-footer")
]);

var failedResult = jSh.d(".aur-ss-result.ss-not-found", "No anime found");

// Select concerned elements (form, search input) on page
var form = jSh("#search");
var sInput = form.jSh("input")[0];
var resultWrap = lces.new("widget", container.jSh(".aur-ss-entries")[0]);

// Append the result div to the page
form.appendChild(container);
sInput.setAttribute("autocomplete", "off");

// Create simple modal for results
var ssModal = lces.new();
ssModal.setState("visible", false);
ssModal.addStateListener("visible", function(visible) {
  if (visible) {
    container.classList.add("visible");
  } else {
    container.classList.remove("visible");
  }
});

// Filtering utils
function getEntries() {
  var urls = [
    "/watch-anime/",
    "/watch-anime-movies/"
  ];
  
  urls.forEach(function(url) {
    var req = new lcRequest({
      uri: url,
      success() {
        var parser = new DOMParser();
        var list = jSh(parser.parseFromString(this.responseText, "text/html"))
                  .jSh("#animelist")
                  .jSh("a[href]")
                  .map(a => {
                    var link = a.href.trim();
                    var title = a.textContent.trim().replace(/\s+/, " ");
                    
                    return [
                      title,
                      link,
                      title.toLowerCase(),
                      // Summarized link for display:
                      "..." + link.match(/https?:\/\/(?:www\.)?animeultima\.io(\/[^]+)/)[1]
                    ];
                  });
        
        // Check if first entry dump isn't loaded
        if (!entries)
          entries = list;
        // Entries loaded, start filtering
        else {
          entries = entries.concat(list);
          aurdb.setDB(dbname, entries);
          
          filter();
        }
      }
    });
    
    req.send();
  });
}

var gotEntries = false;
function filter() {
  ssModal.visible = true;
  
  // Check if entries loaded
  if (!gotEntries) {
    gotEntries = true;
    getEntries();
  }
    
  if (!tmpEntries && !entries)
    return false;
  
  var query = sInput.value.trim();
  if (!query) {
    ssModal.visible = false;
    return;
  }
  
  resultWrap.remove(resultWrap.children);
  var result     = filterEntries(query).slice(0, sett.get("searchSuggest.maxResults"));
  selEntries = result.length;
  selEntry   = -1;
  
  if (!result.length) {
    resultWrap.append(failedResult);
    
    return;
  }
  
  var frag = jSh.docFrag();
  for (var i=0,l=result.length; i<l; i++) {
    var res = result[i];
    
    frag.appendChild(jSh.c("a", {
      sel: ".aur-ss-result",
      text: res[0],
      child: jSh.c("span", ".ss-url-prev", res[3]),
      attr: {
        "data-aur-ss-link": res[1]
      },
      prop: {
        href: res[1],
        title: res[0] + "\n\n" + res[1]
      }
    }));
  }
  
  resultWrap.appendChild(frag);
}

// Sanitize
function regexSanitize(str) {
  var match = /([\[\]()\-\.{}+*^$!?\\])/g;
  
  return str.replace(match, "\\$1");
}

function filterEntries(query) {
  console.log("Querying");
  
  var queryRaw = query.trim().toLowerCase().replace(/\s+/, " ");
  query = regexSanitize(queryRaw);
  var nomatch = (entries || tmpEntries).slice();
  var match = [];
  
  // Regex's
  var beginWordMatch = new RegExp("^" + query + "\\b");
  var beginMatch = new RegExp("^" + query);
  var wordMatch = new RegExp("\\b" + query + "\\b");
  
  // For matching exactly
  for (var i=nomatch.length-1; i>-1; i--) {
    var anime = nomatch[i];
    
    if (anime[2] === queryRaw) {
      match.push(anime);
      nomatch.splice(i, 1);
    }
  }
  
  // For matching the beginning word(s)
  for (var i=nomatch.length-1; i>-1; i--) {
    var anime = nomatch[i];
    
    if (beginWordMatch.test(anime[2])) {
      match.push(anime);
      nomatch.splice(i, 1);
    }
  }
  
  // For matching the beginning
  for (var i=nomatch.length-1; i>-1; i--) {
    var anime = nomatch[i];
    
    if (beginMatch.test(anime[2])) {
      match.push(anime);
      nomatch.splice(i, 1);
    }
  }
  
  // For matching the word(s)
  for (var i=nomatch.length-1; i>-1; i--) {
    var anime = nomatch[i];
    
    if (wordMatch.test(anime[2])) {
      match.push(anime);
      nomatch.splice(i, 1);
    }
  }
  
  // For just matching the word(s)
  for (var i=nomatch.length-1; i>-1; i--) {
    var anime = nomatch[i];
    
    if (anime[2].indexOf(queryRaw) !== -1) {
      match.push(anime);
      nomatch.splice(i, 1);
    }
  }
  
  // For random word matching
  var titleWords = queryRaw.split(" ");
  arrayLoop:
  for (var i=nomatch.length-1; i>-1; i--) {
    var anime = nomatch[i];
    var aTitleSubstr = anime[2];
    var matchedRW = true;
    
    animeLoop:
    for (var j=0,l=titleWords.length; j<l; j++) {
      var wordIndex = aTitleSubstr.indexOf(titleWords[j]);
      
      if (wordIndex === -1) {
        matchedRW = false;
        break animeLoop;
      } else {
        aTitleSubstr = aTitleSubstr.substr(wordIndex);
      }
    }
    
    if (matchedRW) {
      match.push(anime);
      nomatch.splice(i, 1);
    }
  }
  
  return match;
}

// Timeout for unexcessive reponse
var filterTimeout = null;

// Events
function focusSearch() {
  active = true;
  
  if (!modEnabled)
    return;
  
  var value = this.value.trim();
  
  if (!value) {
    active = false;
    ssModal.visible = false;
    
    return;
  }
  
  if (!filterTimeout)
    filter();
  else {
    clearTimeout(filterTimeout);
    setTimeout(function() {
      filter();
    }, 150);
  }
}

sInput.addEventListener("input", focusSearch);
sInput.addEventListener("focus", focusSearch);

sInput.addEventListener("blur", function() {
  active = false;
  ssModal.visible = false;
});

// Up/Down arrow keys
sInput.addEventListener("keydown", function(e) {
  var dir = {
    "38": -1,
    "40": 1
  };
  
  if (e.keyCode === 38 || e.keyCode === 40) {
    e.preventDefault();
    
    var cur  = selEntry === -1 ? null : resultWrap.jSh(selEntry);
    selEntry = Math.min(selEntries - 1, Math.max(-1, dir[e.keyCode] + selEntry));
    var next = selEntry === -1 ? null : resultWrap.jSh(selEntry);
    
    if (cur)
      cur.classList.remove("selected-res");
    
    if (next)
      next.classList.add("selected-res");
  }
  
  if (e.keyCode === 13 && selEntry !== -1) {
    var cur  = resultWrap.jSh(selEntry);
    
    if (cur) {
      e.preventDefault();
      
      ssModal.visible = false;
      document.location = cur.getAttribute("data-aur-ss-link");
    }
  }
});

// Results container user events
function focusField() {
  sInput.focus();
}

container.addEventListener("mousedown", focusField);
container.addEventListener("mousemove", focusField);
container.addEventListener("mouseup", focusField);

reg.on("moddisable", function() {
  modEnabled = false;
  
  ssModal.visible = false;
});

reg.on("modenable", function() {
  modEnabled = true;
  
  if (active)
    ssModal.visible = true;
});

// Styling
style.styleBlock(`
  .aur-search-suggest-wrap {
    position: absolute;
    top: 100%;
    left: -9999999999%;
    margin: 10px 0px 0px;
    box-sizing: border-box;
    width: 288px;
    color: #C2C5CC;
    
    font-size: 14px;
    line-height: 26px;
    border: 1px solid #30343A;
    border-radius: 3px;
    background: #1E2024;
    box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    
    opacity: 0;
    transform: translateY(-10px);
    transition: left 0ms linear 250ms, transform 250ms cubic-bezier(.31,.26,.1,.92), opacity 250ms cubic-bezier(.31,.26,.1,.92);
  }
  
  .aur-search-suggest-wrap.visible {
    opacity: 1;
    transform: translateY(0px);
    left: 0px;
    transition: left 0ms linear 0ms, transform 250ms cubic-bezier(.31,.26,.1,.92), opacity 250ms cubic-bezier(.31,.26,.1,.92);
  }
  
  .aur-search-suggest-wrap .aur-ss-entries .aur-ss-result {
    display: block;
    position: relative;
    padding: 5px 10px;
    font-size: font-size: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    box-sizing: border-box;
    
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    
    transition: background 150ms ease-out, color 150ms ease-out;
  }
  
  .aur-search-suggest-wrap .aur-ss-entries .aur-ss-result:last-child {
    border: 0px;
  }
  
  .aur-search-suggest-wrap .aur-ss-entries .aur-ss-result.selected-res,
  .aur-search-suggest-wrap .aur-ss-entries .aur-ss-result:not(.ss-not-found):not(.ss-loading):hover {
    color: #CDD9F2;
    background: #282B30;
    cursor: pointer;
  }
  
  .aur-search-suggest-wrap .aur-ss-entries .aur-ss-result.ss-not-found {
    text-align: center;
    color: #E6395A;
  }
  
  .aur-search-suggest-wrap .aur-ss-entries .aur-ss-result.ss-loading {
    position: relative;
    height: 36px;
  }
  
  // Prevent wasting processing power on animating an invisible thing
  .aur-search-suggest-wrap.visible .aur-ss-entries .aur-ss-result.ss-loading::after {
    content: "";
  }
  
  .aur-search-suggest-wrap .aur-ss-entries .aur-ss-result.ss-loading::after {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    margin: auto auto;
    width: 24px;
    height: 24px;
    
    background: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpath%20d%3D%22M3.67%2016.54C5.286%2019.49%208.415%2021.5%2012%2021.5c5.23%200%209.5-4.27%209.5-9.5S17.23%202.5%2012%202.5c-3.535%200-6.626%201.957-8.262%204.838.27-.433.743-.7%201.254-.705%201.075-.012%201.813%201.076%201.404%202.07C7.522%206.783%209.6%205.5%2012%205.5c3.608%200%206.5%202.892%206.5%206.5s-2.892%206.5-6.5%206.5c-2.392%200-4.463-1.277-5.592-3.186.672%201.753-1.835%202.9-2.722%201.247z%22%20opacity%3D%22.2%22%20fill%3D%22%23000%22%2F%3E%3Cpath%20d%3D%22M4.992%206.633a1.5%201.5%200%200%200-1.306.797C2.928%208.807%202.5%2010.373%202.5%2012v.002c.002%201.624.43%203.185%201.186%204.56a1.5%201.5%200%201%200%202.628-1.447C5.79%2014.162%205.502%2013.098%205.5%2012v-.002c0-1.1.29-2.168.814-3.123a1.5%201.5%200%200%200-1.322-2.242z%22%20fill%3D%22%23fff%22%2F%3E%3C%2Fsvg%3E') no-repeat;
    
    animation-duration: 1s;
    animation-name: aur-ss-spinner;
    animation-iteration-count: infinite;
    animation-timing-function: cubic-bezier(.31,.26,.26,.8);
  }
  
  @keyframes aur-ss-spinner {
    0% {
      transform: rotate(90deg);
    }
    
    100% {
      transform: rotate(450deg);
    }
  }
  
  .aur-search-suggest-wrap .aur-ss-entries .aur-ss-result .ss-url-prev {
    display: block;
    padding: 0px 1px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    
    opacity: 0.45;
    font-size: 0.7em;
    font-style: italic;
    line-height: 12px;
  }
  
  .aur-search-suggest-wrap .aur-ss-head,
  .aur-search-suggest-wrap .aur-ss-footer {
    height: 5px;
    background: #1A1B1F;
  }
  
  .aur-search-suggest-wrap .aur-ss-head {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .aur-search-suggest-wrap .aur-ss-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
`);
