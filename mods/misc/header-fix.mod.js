// Fix AU header issues
AUR_NAME = "Header Fixes";
AUR_DESC = "Fixes search bar, logo, and adjustments the tagline";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_RUN_AT = "doc-start";

var regs  = reg;
var page  = AUR.import("aur-page");
var style = AUR.import("aur-styles");
var sett  = AUR.import("aur-settings");
var mtog  = AUR.import("mod-toggle", reg);

sett.setDefault("headerFix", {
  fixLogo: sett.Setting("Fix AU logo", "boolean", true),
  rmGames: sett.Setting("Remove Games Menu", "boolean", true),
  rmDlAnime: sett.Setting("Remove Download Anime Menu Entry", "boolean", true)
});

// Set up toggle tracker
mtog.setting("headerFix.fixLogo", false);
mtog.setting("headerFix.rmGames", false);
mtog.setting("headerFix.rmDlAnime", false);

// Add settigns to the UI
AUR.onLoaded("aur-ui-prefs", "aur-ui", function() {
  reg.ui.prop({
    link: "headerFix.fixLogo"
  });
  
  reg.ui.prop({
    link: "headerFix.rmGames"
  });
  
  reg.ui.prop({
    link: "headerFix.rmDlAnime"
  });
});

var observer = new MutationObserver(function(mutations) {
  var search = jSh("#search");
  
  if (search && search.getChild(0)) {
    observer.disconnect();
    swapLogo();
  }
});

observer.observe(document, {
  childList: true,
  subtree: true
});

var swapLogo = (function swapLogo() {
  // Fix search bar
  var sbar = jSh("#search").getChild(0);
  
  sbar.onclick     = null;
  sbar.value       = "";
  sbar.placeholder = "Search anime...";
  
  // Fix logo
  var logoContainer = jSh("#header-left").jSh("a")[0];
  var logoSVG       = jSh.svg(undf, 220, 27, [
    jSh.path(undf, "M45.625.28l-3.188.032v3.843h3.188V.282zm149.188.032V4.22H198V.31h-3.188zM45.625 8.406l-3.188.03V27.19h3.188V8.405zm149.188 0v18.781H198V8.407h-3.188zM1.97 8.436v3.22h11.31c.34 0 .533.225.533.563v11.217c0 .338-.194.563-.532.563H3.97c-.34 0-.533-.225-.533-.563v-3.5c0-.337.194-.562.532-.562h8.56v-3.188H3.97c-2.056 0-3.75 1.696-3.75 3.75v3.5c0 2.055 1.694 3.75 3.75 3.75h9.31c2.056 0 3.75-1.695 3.75-3.75V12.22c0-2.056-1.694-3.783-3.75-3.783H1.97zm19.436.002v18.75h3.188V11.624h10.28c.338 0 .563.225.563.563v15h3.188v-15c0-2.055-1.695-3.75-3.75-3.75h-13.47zm28.438 0v18.75h3.187V11.624H59v15.563h3.188V11.624h5.718c.338 0 .563.225.563.563v15h3.186v-15c0-2.055-1.695-3.75-3.75-3.75H49.844zm29.562 0c-2.055 0-3.75 1.695-3.75 3.75V23.25c0 2.055 1.695 3.75 3.75 3.75h11.72v-3.188h-11.72c-.337 0-.562-.225-.562-.562V12.187c0-.337.225-.562.562-.562h9.438c.337 0 .562.225.562.563v3.5c0 .337-.225.562-.562.562h-8.656v3.188h8.656c2.055 0 3.75-1.696 3.75-3.75v-3.5c0-2.055-1.695-3.75-3.75-3.75h-9.438zm126.625 0c-2.054 0-3.75 1.726-3.75 3.78V23.44c0 2.054 1.696 3.75 3.75 3.75h9.314c2.055 0 3.75-1.696 3.75-3.75V12.218c0-2.054-1.695-3.78-3.75-3.78h-9.313zm0 3.218h9.314c.337 0 .53.225.53.563V23.436c0 .338-.193.563-.53.563h-9.313c-.336 0-.53-.225-.53-.563V12.22c0-.34.194-.564.53-.564zM187.28 23.28v3.907h3.19v-3.906h-3.19z", "fill: #0072b4;"),
    jSh.path(undf, "M167.5 8.437v3.22h11.313c.337 0 .53.224.53.562v11.217c0 .338-.193.563-.53.563H169.5c-.337 0-.53-.225-.53-.563v-3.5c0-.337.193-.562.53-.562h8.563v-3.188H169.5c-2.055 0-3.75 1.696-3.75 3.75v3.5c0 2.055 1.695 3.75 3.75 3.75h9.313c2.054 0 3.75-1.695 3.75-3.75V12.22c0-2.056-1.696-3.783-3.75-3.783H167.5zm-27.25 0v18.75h3.188V11.625h5.968v15.562h3.188V11.625h5.75c.337 0 .562.225.562.562v15h3.188v-15c0-2.054-1.695-3.75-3.75-3.75H140.25zm-44.125 0v15c0 2.055 1.695 3.75 3.75 3.75h9.28c2.056 0 3.75-1.695 3.75-3.75v-15h-3.186v15c0 .338-.226.563-.564.563h-9.28c-.338 0-.563-.225-.563-.563v-15h-3.188zm36.813-.03v18.78h3.187V8.407h-3.188zm0-8.095V4.22h3.187V.31h-3.188zm-5.094-.03l-3.188.03v8.094h-1.53v3.188h1.53v15.593h3.188V11.594h3.094l-.032-3.188h-3.062V.28zm-7.563 0l-3.186.03v26.875h3.187V.28z", "fill: #bf0600;")
  ]);
  
  logoContainer.appendChild(logoSVG);
  
  // Adjust is on searchpage
  if (page.isSearch)
    logoSVG.style.setProperty("bottom", "-10px", "important");
  
  // Remove nav games entry
  var logoImg = jSh("#header-left").jSh("img")[0];
  var nav     = jSh("#left-nav").jSh(".ddtitle");
  var navGames;
  var navDlAnime;
  
  // Search for the games entry
  nav.every(e => !(e.textContent.trim().toLowerCase() === "games" && ((navGames = e.parentNode) || true)));
  nav.every(e => {
    var nextSibling = e.nextElementSibling;
    
    if (nextSibling && /Download\s+Anime/i.test(nextSibling.textContent)) {
      navDlAnime = jSh(nextSibling).getChild(1);
      return false;
    }
    
    return true;
  });
  
  sett.on("headerFix.fixLogo", function(e) {
    if (e.value) {
      logoImg.style.opacity = 0;
      logoSVG.style.display = "block";
    } else {
      logoImg.style.opacity = 1;
      logoSVG.style.display = "none";
    }
  }, true);
  
  if (navGames)
    sett.on("headerFix.rmGames", function(e) {
      if (e.value) {
        navGames.style.display = "none";
      } else {
        navGames.style.display = "list-item";
      }
    }, true);
  
  if (navDlAnime)
    sett.on("headerFix.rmDlAnime", function(e) {
      if (e.value) {
        navDlAnime.style.display = "none";
      } else {
        navDlAnime.style.display = "list-item";
      }
    });
  
  // Fix tagline if it's too long
  if (page.isEpisode) {
    var tagline  = jSh("#header-left").jSh(".tagline")[0].getChild(0);
    var tagTitle = tagline.textContent;
    
    if (tagTitle.length > 30) {
      tagline.textContent = tagTitle.substr(0, 14).trim() + "..." + tagTitle.substr(-14).trim();
      tagline.title = tagTitle;
    }
  }
  
  // Styling for logo fix
  style.styleBlock(style.important(`
    #header-left > a > img {
      // opacity: 0;
    }
    
    #header-left > a > svg {
      position: absolute;
      left: 0px;
      bottom: 3px;
    }
    
    #header-left > a {
      position: relative;
    }
  `));
});
