// Ep-tracker.js

var aj = AUR.import("ajaxify");
var sett = AUR.import("aur-settings");
var ui = AUR.import("aur-ui");
var styleDefs;

AUR.onLoaded("/styles/style-defs", function() {
  styleDefs = AUR.import("/styles/style-defs");
});

reg.interface = function InitLightsOutEpTracker(main, epTrackerMode, infoCaptionMode, options) {
  var tracker = main.tracker;
  
  var epTrackerWidth           = styleDefs.epTrackerWidth;
  var epTrackerCardWidth       = styleDefs.epTrackerCardWidth;
  var epTrackerCardHeight      = styleDefs.epTrackerCardHeight;
  var epTrackerCardCapHeight   = styleDefs.epTrackerCardCapHeight; // % percentage
  var epTrackerCardInnerRadius = styleDefs.epTrackerCardInnerRadius;
  var epTrackerMaxDistance     = styleDefs.epTrackerMaxDistance; // In pixels

  epTrackerMode.mainBody.classList.add("aur-lo-episode-tracker-main");
  epTrackerMode.mainBody.css({
    width: epTrackerWidth + "%",
    height: "100%"
  });

  var epTrackerTitle       = jSh.d(".aur-lo-eptracker-title", main.episodeDetails ? main.episodeDetails.animeTitle + " Episodes" : "No title", [
    jSh.d(".aur-lo-tip", "Tip: Shift-click or Ctrl-click for bulk actions")
  ]);
  var epTrackerInput       = jSh.d(".aur-lo-eptracker-input.aur-ui-root");
  var epTrackerInputEp     = jSh.d(".aur-lo-episode-caption", main.episodeDetails ? "Episode " + main.episodeDetails.episode : "");
  var epTrackerCards       = jSh.d(".aur-lo-eptracker-cards-wrap.aur-ui-root");
  var epTrackerCardsScroll = jSh.d(".aur-lo-eptracker-cards-scroll.aur-ui-root", null, [
    epTrackerCards
  ]);

  epTrackerMode.mainBody.appendChild([
    epTrackerTitle,
    epTrackerInput,
    epTrackerCardsScroll
  ]);

  // Add scrollbar
  var epTrackerCardsWidget = jSh.extendObj(lces.new(), {
    element: epTrackerCards,
    scrollbarContent: epTrackerCards
  });

  lcScrollBars.call(epTrackerCardsWidget, undf, undf, false);

  // Add mousewheel event for scrolbar
  epTrackerCardsWidget.lcesScrollbar.parent  = epTrackerCardsScroll;
  epTrackerCardsWidget.lcesScrollbar.visible = true;

  // Update cards when scrolled
  var epTrackerUpdateCardsTimeout  = null;
  var epTrackerDefaultRefreshRate  = 50;
  var epTrackerDefaultRefreshDelay = true;
  var epTrackerOldScroll           = 0;
  epTrackerCardsWidget.lcesScrollbar.on("lcesscroll", function(e) {
    clearTimeout(epTrackerUpdateCardsTimeout);
    var scrollDiff = Math.abs(epTrackerOldScroll - e.scroll);
    epTrackerOldScroll = e.scroll;
    
    if (!epTrackerDefaultRefreshDelay || scrollDiff < 1500) {
      addEpTrackerGroupCards();
    } else {
      epTrackerUpdateCardsTimeout = setTimeout(addEpTrackerGroupCards, epTrackerDefaultRefreshRate);
    }
  });

  sett.on("lightsout.trackerScrollRefresh", function(e) {
    epTrackerDefaultRefreshRate = e.value;
  });

  sett.on("lightsout.trackerScrollRefreshDelay", function(e) {
    epTrackerDefaultRefreshDelay = e.value;
  });

  // Update scrollbars when window resizes
  var epTrackerUpdateScrollbarTimeout = null;
  window.addEventListener("resize", function() {
    clearTimeout(epTrackerUpdateScrollbarTimeout);
    epTrackerUpdateScrollbarTimeout = setTimeout(function() {
      epTrackerCardsWidget.lcesScrollbar.update();
    }, 650);
  });
  
  // Episode cards selected model
  var epTrackerCardsModel     = [];
  var epTrackerCardGroupIndex = [];
  var epTrackerCardGroupsMap  = [];
  var epTrackerCardsMap       = [];
  var epTrackerCardPHMap      = []; // Card placeholders
  var epTrackerCardsBarMap    = []; // Progress bar
  var epTrackerCardsCapMap    = []; // Progress caption

  // Add close button
  epTrackerTitle.appendChild(jSh.d({
    sel: ".aur-lo-eptracker-close",
    child: jSh.svg(null, 30, 30, [
      jSh.path(null, "M8.625 7.22L7.22 8.624 13.593 15 7.22 21.375l1.405 1.406L15 16.407l6.375 6.375 1.406-1.405L16.407 15l6.375-6.375-1.405-1.406L15 13.593 8.625 7.22z")
    ]),
    prop: {
      title: "Close Episode List/Tracker"
    },
    events: {
      click() {
        if (main.epTrackerInitiated) {
          main.enabled = false;
        } else {
          epTrackerMode.active = false;
        }
      }
    }
  }));

  // Add input buttons...
  epTrackerInput.appendChild([
    epTrackerInputEp,
    
    jSh.c("button", {
      text: "Select all",
      events: {
        click() {
          console.time("aur-lo-compare");
          var changed  = [];
          var newState = [];
          var newModel = [];
          
          for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
            if (!epTrackerCardsModel[i]) {
              changed.push(i);
              newState.push(true);
            }
            
            newModel.push(true);
          }
          console.timeEnd("aur-lo-compare");
          
          renderEpTrackerCards(changed, newState);
          epTrackerCardsModel = newModel;
        }
      }
    }),
    
    jSh.c("button", {
      text: "Deselect all",
      events: {
        click() {
          epTrackerDeselectCards();
        }
      }
    }),
    
    jSh.d(".aur-lo-eptracker-input-separator"),
    
    jSh.c("button", {
      text: "Set ",
      child: jSh.c("b", null, "Seen"),
      events: {
        click() {
          var changed  = [];
          var newState = [];
          
          for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
            if (epTrackerCardsModel[i]) {
              changed.push(i);
              newState.push(100);
            }
          }
          
          renderEpTrackerCardsProgress(changed, newState);
          tracker.setEpisodeState(null, changed, newState);
        }
      }
    }),
    
    jSh.c("button", {
      text: "Set ",
      child: jSh.c("b", null, "Unseen"),
      events: {
        click() {
          var changed  = [];
          var newState = [];
          
          for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
            if (epTrackerCardsModel[i]) {
              changed.push(i);
              newState.push(-1);
            }
          }
          
          renderEpTrackerCardsProgress(changed, newState);
          tracker.setEpisodeState(null, changed, newState);
        }
      }
    }),
    
    jSh.d(".aur-lo-eptracker-input-separator"),
    
    jSh.c("button", {
      text: "Scroll to current",
      events: {
        click() {
          if (epTrackerLoadedCards) {
            var current = main.episodeDetails.episode;
            var index   = tracker.animeData.index[current];
            
            var card   = epTrackerCardsMap[index];
            var cardPH = epTrackerCardPHMap[index];
            
            if (card) {
              epTrackerCardsWidget.lcesScrollbar.scrollTo(card);
            } else {
              epTrackerCardsWidget.lcesScrollbar.scrollTo(cardPH);
            }
          }
        }
      }
    })
  ]);

  // Click events for card wrap
  var epTrackerLastCard = 0;
  epTrackerCards.addEventListener("mousedown", function(e) {
    var target = e.target;
    var shift  = e.shiftKey;
    var ctrl   = e.ctrlKey;
    var cardID = null;
    var card;
    var voidAction;
    
    // Check if clicked a card
    while (target !== this) {
      // Cancel for links/Watch episode buttons
      if (target.tagName === "A") {
        voidAction = true;
        break;
      }
      
      if ((cardID = target.getAttribute("data-ep-card-index")) !== null) {
        card = target;
        
        break;
      }
      
      target = target.parentNode;
    }
    
    if (voidAction) {
      return;
    }
    // Simply deselect everything
    else if (card === undefined) {
      epTrackerDeselectCards();
    }
    // Complex selection ensues
    else if (card && cardID !== null) {
      e.preventDefault();
      
      cardID = parseInt(cardID);
      var changed  = [];
      var newState = [];
      var newModel = [];
      
      // Select this one episode
      if (!ctrl && !shift) {
        epTrackerSelectCard(cardID);
      }
      // Shift key pressed...
      else if (shift) {
        var start     = Math.min(epTrackerLastCard, cardID) - 1;
        var end       = Math.max(epTrackerLastCard, cardID) + 1; // Removed/added 1 for simple comparison operator
        var lastState = epTrackerCardsModel[epTrackerLastCard];
        var negLState = !lastState;
        
        console.time("aur-lo-compare");
        for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
          let state = epTrackerCardsModel[i];
          
          if (i > start && i < end)
            state = lastState;
          else
            state = false;
          
          if (state !== epTrackerCardsModel[i]) {
            changed.push(i);
            newState.push(state);
          }
          
          newModel.push(state);
        }
        console.timeEnd("aur-lo-compare");
        
        renderEpTrackerCards(changed, newState);
        epTrackerCardsModel = newModel;
      }
      // Ctrl key pressed
      else {
        var newCardState = !epTrackerCardsModel[cardID];
        epTrackerCardsModel[cardID] = newCardState;
        
        renderEpTrackerCards([cardID], [newCardState]);
        epTrackerLastCard = cardID;
      }
    }
  });

  function epTrackerDeselectCards() {
    console.time("aur-lo-compare");
    var changed  = [];
    var newState = [];
    var newModel = [];
    
    for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
      if (epTrackerCardsModel[i]) {
        changed.push(i);
        newState.push(false);
      }
      
      newModel.push(false);
    }
    console.timeEnd("aur-lo-compare");
    
    renderEpTrackerCards(changed, newState);
    epTrackerCardsModel = newModel;
  }

  function epTrackerSelectCard(index) {
    var changed  = [];
    var newState = [];
    var newModel = [];
    
    console.time("aur-lo-compare");
    for (var i=0,l=epTrackerCardsModel.length; i<l; i++) {
      let state = false;
      
      if (i === index)
        state = true;
      
      if (state !== epTrackerCardsModel[i]) {
        changed.push(i);
        newState.push(state);
      }
      
      newModel.push(state);
    }
    console.timeEnd("aur-lo-compare");
    
    renderEpTrackerCards(changed, newState);
    epTrackerCardsModel = newModel;
    epTrackerLastCard   = index;
  }

  function renderEpTrackerCards(indexes, newStates) {
    console.time("aur-lo-render");
    for (let i=indexes.length-1; i>-1; i--) {
      let index  = indexes[i];
      let card   = epTrackerCardsMap[index];
      let phCard = epTrackerCardPHMap[index];
      let state  = newStates[i];
      
      if (state) {
        phCard.classList.add("aur-lo-selected");
        
        if (card)
          card.classList.add("aur-lo-selected");
      } else {
        phCard.classList.remove("aur-lo-selected");
        
        if (card)
          card.classList.remove("aur-lo-selected");
      }
    }
    console.timeEnd("aur-lo-render");
  }

  function renderEpTrackerCardsProgress(indexes, newStates) {
    tracker.setEpisodeState(null, indexes, newStates);
    
    console.time("aur-lo-render");
    for (let i=indexes.length-1; i>-1; i--) {
      let bar   = epTrackerCardsBarMap[indexes[i]];
      let cap   = epTrackerCardsCapMap[indexes[i]];
      let state = newStates[i];
      
      if (bar && cap) {
        // Unseen
        if (state === -1) {
          bar.style.width = "0%";
          cap.textContent = "Unseen";
          cap.classList.remove("aur-lo-hilite");
        }
        // Finished
        else if (state === 100) {
          bar.style.width = "100%";
          cap.textContent = "Seen";
          cap.classList.add("aur-lo-hilite");
        }
        // Watching
        else {
          bar.style.width = "100%";
          cap.textContent = "Watching";
          cap.classList.remove("aur-lo-hilite");
        }
      }
    }
    console.timeEnd("aur-lo-render");
  }

  function addEpTrackerCardGroups() {
    // Clear any previous groups
    epTrackerCardGroupIndex  = [];
    epTrackerCardGroupsMap   = [];
    epTrackerCardsMap        = [];
    epTrackerCardPHMap       = [];
    epTrackerCardsBarMap     = [];
    epTrackerCardsCapMap     = [];
    epTrackerCardsModel      = [];
    
    var episodes     = tracker.animeData.episode;
    var curEpisode   = main.episodeDetails.episode;
    var episodeCount = tracker.animeData.episode.length;
    var groupCount   = Math.ceil(episodeCount / 20);
    var frag         = jSh.docFrag();
    
    for (let i=0; i<groupCount; i++) {
      let placeholderCount = Math.min(episodeCount - i * 20, 20);
      
      let group = jSh.d(".aur-lo-eptracker-card-render-group", null, null, {
        "data-rendered": "0",
        "data-card-count": placeholderCount
      });
      
      // Add placeholders
      for (let j=0; j<placeholderCount; j++) {
        let curEpIndex = i * 20 + j;
        let curCardEps = episodes[curEpIndex];
        let epSelected = curCardEps === curEpisode;
        
        let card = jSh.d(".aur-lo-eptracker-card-placeholder" + (epSelected ? ".aur-lo-selected.aur-lo-current" : ""), null, null, {
          "data-ep-num": curCardEps
        });
        
        if (epSelected)
          epTrackerLastCard = curEpIndex;
        
        group.appendChild(card);
        epTrackerCardPHMap.push(card);
        epTrackerCardsMap.push(null);
        epTrackerCardsBarMap.push(null);
        epTrackerCardsCapMap.push(null);
        epTrackerCardsModel.push(epSelected);
      }
      
      // Add group
      frag.appendChild(group);
      epTrackerCardGroupIndex.push(i * 20);
      epTrackerCardGroupsMap.push(group);
    }
    
    // Add all render groups
    epTrackerCards.appendChild(frag);
    
    // Update scrolbars
    setTimeout(function() {
      epTrackerCardsWidget.lcesScrollbar.update();
      
      setTimeout(function() {
        var curCard = epTrackerCardPHMap[tracker.animeData.index[main.episodeDetails.episode]];
        epTrackerCardsWidget.lcesScrollbar.scrollTo(curCard);
        
        // Add the cards
        epTrackerUpdateCardsTimeout = setTimeout(function() {
          addEpTrackerGroupCards();
        }, 10);
      }, 10);
    }, 10);
  }

  function addEpTrackerGroupCards() {
    var mainRect = epTrackerCards.getBoundingClientRect();
    
    // All render-required stuff
    var data            = tracker.animeData;
    var frag            = jSh.docFrag();
    var curEpisode      = main.episodeDetails.episode;
    var curAnime        = main.episodeDetails.animeUnique;
    var optimizeEnabled = sett.get("lightsout.trackerOptimizedScroll");
    
    var episode = data.episode;
    var title   = data.title;
    var watched = data.watched;
    var url     = data.url || [];
    
    for (let i=epTrackerCardGroupsMap.length-1; i>-1; i--) {
      let group    = epTrackerCardGroupsMap[i];
      let gRect    = optimizeEnabled ? group.getBoundingClientRect() : null; // Don't waste redrawing if you're not gonna use it
      let start    = epTrackerCardGroupIndex[i];
      let count    = parseInt(group.getAttribute("data-card-count"), 10);
      let rendered = group.getAttribute("data-rendered") === "1";
      let render   = false;
      
      if (optimizeEnabled) {
        // The group is above the cardview
        if (gRect.bottom < mainRect.top) {
          render = mainRect.top - gRect.bottom <= epTrackerMaxDistance;
        }
        // The group is under the cardview
        else if (gRect.top > mainRect.bottom) {
          render = gRect.top - mainRect.bottom <= epTrackerMaxDistance;
        }
        // The group is _in_ the cardview
        else {
          render = true;
        }
      } else {
        render = true;
      }
      
      if (render !== rendered) {
        // Render cards
        if (render) {
          setTimeout(function() {
            group.innerHTML = "";
            var frag = jSh.docFrag();
            
            for (let j=0; j<count; j++) {
              let index = start + j;
              
              let epWatched      = watched[index];
              let epNumber       = episode[index];
              let epSelected     = epTrackerCardsModel[index];
              let epLarge        = epNumber.length > 3;
              let cardStatusText = epWatched === 100 ? "seen" : epWatched >= 0 ? "watching" : "unseen";
              
              let cardBar = jSh.d(".aur-lo-eptracker-card-ep-stats-progress-bar", null, null, {
                style: "width: " + Math.max(epWatched, 0) + "%;"
              });
              
              let cardStatus = jSh.d(".aur-lo-eptracker-card-ep-stats-status" + (epWatched === 100 ? ".aur-lo-hilite" : ""), cardStatusText);
              
              let card = jSh.d(".aur-lo-eptracker-card-wrap" + (epSelected ? ".aur-lo-selected" : "") + (epNumber === curEpisode ? ".aur-lo-current" : ""), null, [
                jSh.d(".aur-lo-eptracker-card-inner", null, [
                  // Episode number
                  jSh.d(".aur-lo-eptracker-card-ep-number", null, [
                    jSh.d(".aur-lo-eptracker-card-ep-number-inner" + (epLarge ? ".aur-lo-small-letters" : ""), episode[index]),
                    
                    jSh.d(".aur-lo-eptracker-card-ep-number-watch-ep-wrap", null, [
                      jSh.c("a", {
                        sel: ".aur-lo-eptracker-card-ep-number-watch-ep",
                        prop: {
                          href: url[index] || "/" + curAnime + "-episode-" + epNumber + "-english-subbed/" // TODO: REMOVE BIAS
                        }
                      })
                    ])
                  ]),
                  
                  // Episode stats
                  jSh.d(".aur-lo-eptracker-card-ep-stats-wrap", null, [
                    jSh.d(".aur-lo-eptracker-card-ep-stats", null, [
                      jSh.d(".aur-lo-eptracker-card-ep-stats-progress", null, [
                        cardBar
                      ]),
                      
                      jSh.d(".aur-lo-eptracker-card-ep-stats-status-wrap", null, [
                        cardStatus
                      ])
                    ])
                  ])
                ])
              ], {
                "data-ep-card-index": index
              });
              
              frag.appendChild(card);
              
              epTrackerCardsMap[index] = card;
              epTrackerCardsBarMap[index] = cardBar;
              epTrackerCardsCapMap[index] = cardStatus;
            }
            
            group.appendChild(frag);
          }, 0);
        } else {
          setTimeout(function() {
            group.innerHTML = "";
            var frag = jSh.docFrag();
            
            for (let j=0; j<count; j++) {
              let index      = start + j;
              let epSelected = epTrackerCardsModel[index];
              let epNumber   = episode[index];
              let card       = epTrackerCardPHMap[index];
              
              frag.appendChild(card);
              epTrackerCardsMap[index] = null;
              epTrackerCardsBarMap[index] = null;
              epTrackerCardsCapMap[index] = null;
            }
            
            group.appendChild(frag)
          }, 0);
        }
      }
      
      group.setAttribute("data-rendered", Number(render));
    }
  }

  var epTrackerOldShadeLevel = main.shadeLevel;
  var epTrackerLoadedCards   = false;
  var epTrackerLoadedAnime   = null;

  // Add episode cards when animedata is loaded
  tracker.on("animedata", function() {
    if (main.episodeDetails) {
      epTrackerCardsScroll.classList.remove("aur-lo-eptracker-loading");
      
      addEpTrackerCardGroups();
      console.log("ANIMEDATA - WTF");
    }
  });

  epTrackerMode.addStateListener("active", function(active) {
    if (active) {
      epTrackerOldShadeLevel = main.shadeLevel;
      main.shadeLevel = main.shadeLevel > 0.9 ? main.shadeLevel : 0.9;
      main.playerTempDimensions = true;
      main.playerAnimated = true;
      
      // Move player
      main.playerScale = {
        x: 100 - epTrackerWidth,
        y: 100
      };
      
      main.playerPos = {
        x: 100,
        y: 0
      };
      
      // Hide caption since it's most likely in the way
      infoCaptionMode.active = false;
      ui.prefs.visible = false;
      
      if (main.episodeDetails.animeUnique !== epTrackerLoadedAnime && typeof epTrackerLoadedCards === "boolean") {
        epTrackerLoadedCards = false;
      }
      
      // Load cards
      if (!epTrackerLoadedCards) {
        tracker.loadAnimeData();
        epTrackerLoadedCards = true;
        epTrackerLoadedAnime = main.episodeDetails.animeUnique;
        epTrackerCards.innerHTML = "";
        epTrackerCardsScroll.classList.add("aur-lo-eptracker-loading");
      }
      
      // Update cards-wrap position
      setTimeout(function() {
        epTrackerCardsScroll.style.top = epTrackerInput.getBoundingClientRect().bottom + "px";
      }, 350);
    } else {
      if (main.enabled) {
        main.playerAnimated = true;
        main.shadeLevel = epTrackerOldShadeLevel;
        main.epTrackerInitiated = false;
      }
      
      main.playerTempDimensions = false;
    }
  });
  
  // Update tracker for new series
  var oldEpisodeDetails = null;
  main.addStateListener("episodeDetails", function(details) {
    if (details) {
      epTrackerTitle.childNodes[0].nodeValue = details.animeTitle + " Episodes";
      epTrackerInputEp.textContent = "Episode " + details.episode;
      
      if (tracker.animeData) {
        var autotrack  = sett.get("lightsout.autotrack");
        var curEpState = tracker.getEpisodeState(main.episodeDetails.episode);
        
        if (curEpState === null || curEpState === -1) {
          var index = tracker.animeData.index[main.episodeDetails.episode];
          renderEpTrackerCardsProgress([index], [0]);
        }
        
        if (autotrack) {
          if (oldEpisodeDetails && oldEpisodeDetails.animeUnique === details.animeUnique) {
            var oldIndex = tracker.animeData.index[oldEpisodeDetails.episode];
            var curIndex = tracker.animeData.index[details.episode];
            
            // Only track previous episodes
            if (oldIndex < curIndex) {
              tracker.setEpisodeState([oldEpisodeDetails.episode], null, [100]);
              
              if (epTrackerLoadedCards && tracker.animeData && tracker.auid === main.episodeDetails.animeUnique) {
                renderEpTrackerCardsProgress([oldIndex], [100]);
              }
            }
          } else if (curEpState === null) {
            tracker.setEpisodeState([main.episodeDetails.episode], null, [0]);
          }
        }
        
        // Update tracker UI
        if (oldEpisodeDetails && oldEpisodeDetails.animeUnique === main.episodeDetails.animeUnique) {
          var oldEpisode = oldEpisodeDetails.episode;
          
          if (oldEpisode) {
            var oldIndex  = tracker.animeData.index[oldEpisode];
            var curIndex  = tracker.animeData.index[details.episode];
            var oldCard   = epTrackerCardsMap[oldIndex];
            var curCard   = epTrackerCardsMap[curIndex];
            var oldPHCard = epTrackerCardPHMap[oldIndex];
            var newPHCard = epTrackerCardPHMap[curIndex];
            
            if (oldCard) oldCard.classList.remove("aur-lo-current");
            if (curCard) curCard.classList.add("aur-lo-current");
            
            if (oldPHCard) oldPHCard.classList.remove("aur-lo-current");
            if (newPHCard) newPHCard.classList.add("aur-lo-current");
            
            epTrackerSelectCard(curIndex);
          }
        }
      }
    }
  });
  
  // AJAXify event
  aj.onEvent("trigger", /./, function(e) {
    // Save this quickly
    oldEpisodeDetails = main.episodeDetails;
  });
  
  aj.onEvent("merge", /./, function(e) {
    if (!main.player) {
      // Clear old details to disable comparison
      oldEpisodeDetails = null;
    }
  });
  
  main.addStateListener("enabled", function(enabled) {
    if (!enabled)
      epTrackerMode.active = false;
    
    console.log("STATEOBJ", this);
  });
}
