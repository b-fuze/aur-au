// AU AJAX'ify module source
AUR_NAME = "AU AJAX'ify";
AUR_DESC = "Speeds up AU by transforming it into a modern AJAX site with no page reloads. Uses the AUR AJAX'ify module.";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
// AUR_DEFAULT_DISABLED = true; // It's not buggy anymore

// Start
var aj = AUR.import("ajaxify");
aj.enabled = true;

// General events
aj.onEvent("filter", null, function(e) {
  var dom = e.dom;
  var scripts = dom.jSh("script").concat(dom.jSh("iframe")).concat(dom.jSh("embed"));
  
  for (var i=0,l=scripts.length; i<l; i++) {
    var script = scripts[i];
    
    if (!script.AURPreserve)
      script.parentNode.removeChild(script);
  }
});

aj.onEvent("clear", null, function(e) {
  var dom = e.dom;
  var newMC = jSh.d();
  var oldMC = dom.jSh("#main-content") || dom.jSh("#main-content-hp");
  var newID = (e.domNew.jSh("#main-content") || e.domNew.jSh("#main-content-hp")).getAttribute("id");
  
  oldMC.parentNode.insertBefore(newMC, oldMC);
  oldMC.parentNode.removeChild(oldMC);
  
  newMC.id = newID;
});

aj.onEvent("merge", null, function(e) {
  // Merge content
  var domOld = e.domOld;
  var domNew = e.domNew;
  var cleanMC = domOld.jSh("#main-content") || domOld.jSh("#main-content-hp");
  var newMC = domNew.jSh("#main-content") || domNew.jSh("#main-content-hp");
  var titleOld = domOld.jSh("title")[0];
  var titleNew = domNew.jSh("title")[0];
  var taglineOld = domOld.jSh(".tagline")[0];
  var taglineNew = domNew.jSh(".tagline")[0];
  var newThreadsOld = domOld.jSh("#newthread");
  var newThreadsNew = domNew.jSh("#newthread");
  var oldDDTitle = domOld.jSh("#left-nav").getChild(-2).getChild(0);
  var newDDTitle = domNew.jSh("#left-nav").getChild(-2).getChild(0);
  
  cleanMC.appendChild(jSh.toArr(newMC.childNodes));
  
  // Merge title
  titleOld.removeChild(jSh.toArr(titleOld.childNodes));
  titleOld.appendChild(jSh.toArr(titleNew.childNodes));
  
  // Update tagline
  taglineOld.parentNode.insertBefore(taglineNew, taglineOld);
  taglineOld.parentNode.removeChild(taglineOld);
  
  // Add default tagline
  if (!taglineNew.textContent.trim())
    taglineNew.textContent = "Watch Streaming Anime Online Free - English Subbed & Dubbed Episodes";
  
  newThreadsOld.removeChild(jSh.toArr(newThreadsOld.childNodes));
  newThreadsOld.appendChild(jSh.toArr(newThreadsNew.childNodes));
  
  // Get new messages, if any
  oldDDTitle.removeChild(jSh.toArr(oldDDTitle.childNodes));
  oldDDTitle.appendChild(jSh.toArr(newDDTitle.childNodes));
});

// Exclude forums from AJAX'ify processing
aj.excl(/^\/forums\//);
aj.excl(/^\/tracker\//);
aj.excl(/^\/ajax\.php/);

// Episode page event
aj.onEvent("filter", /\/+[^]+-episode-[\d\.]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/, function(e) {
  var vidIframe = e.dom.jSh("#pembed").jSh("iframe")[0] || e.dom.jSh("#pembed").jSh("embed")[0];
  
  if (vidIframe)
    vidIframe.AURPreserve = true;
});

// Make search through AJAX
var search = jSh("#search");

function onSearch(e) {
  // Stop redirection
  e.preventDefault();
  var input = this.jSh("input")[0];
  
  // Load the results via AJAX
  aj.go("/search.html?searchquery=" + encodeURIComponent(input.value));
}

if (search) {
  search.addEventListener("submit", onSearch);
}

reg.on("moddisable", function(e) {
  aj.enabled = false;
  
  if (search)
    search.removeEventListener("submit", onSearch);
});

reg.on("modenable", function(e) {
  aj.enabled = true;
  
  if (search)
    search.addEventListener("submit", onSearch);
});
