// Lights Out Misc library
AUR_NAME = "Lights Out Misc Library";
AUR_DESC = "Lights Out Miscellaneous Components Library";
AUR_VERSION = [0, 1, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";
AUR_RUN_AT = "doc-end";

var db = AUR.import("aur-db").getNS("lightsout-tracker");
var sett = AUR.import("aur-settings");

function LightsOutTracker() {
  lces.types.component.call(this);
  var that = this;
  
  // Anime Unique ID
  this.setState("auid", null);
  this.setState("animeData", null);
  this.aDBName = null;
  
  // For when finished loading animedata from the server
  this.addEvent("animedata");
  
  // Events
  
  this.addStateListener("auid", (auid) => {
    this.aDBName = "a-" + auid;
    this.animeData = null;
  });
}

jSh.inherit(LightsOutTracker, lces.types.component);

jSh.extendObj(LightsOutTracker.prototype, {
  loadAnimeDataCache() {
    var adb = db.getDB(this.aDBName);
    
    if (adb) {
      this.animeData = adb;
    } else {
      this.animeData = null;
    }
  },
  
  loadAnimeData() {
    var that = this;
    
    var req = new lcRequest({
      uri: "/watch/" + this.auid + "-english-subbed-dubbed-online/",
      success() {
        var dom  = new DOMParser().parseFromString(this.responseText, "text/html");
        var rows = jSh(dom).jSh("#animetable tr").slice(1);
        var data = {
          index: {},
          episode: [],
          title: [],
          watched: []
        };
        
        var oldData     = that.animeData;
        var dataIndex   = data.index;
        var dataEpisode = data.episode;
        var dataTitle   = data.title;
        var dataWatched = data.watched;
        
        var invalidTitle = /^Episode\s+\d+/i;
        
        for (let i=0,l=rows.length; i<l; i++) {
          var row     = rows[i];
          var episode = row.getChild(0).textContent.trim();
          var title   = row.getChild(1).textContent.trim();
          var available = !row.getChild(3).getAttribute("colspan");
          
          if (available) {
            dataIndex[episode] = i;
            dataEpisode.push(episode);
            dataTitle.push(invalidTitle.test(title) ? null : title);
            
            // Retrieve the older state if it exists
            if (oldData) {
              var oldStateIndex = oldData.index[episode];
              
              dataWatched.push(oldStateIndex === undefined ? -1 : oldData.watched[oldStateIndex]);
            } else {
              dataWatched.push(-1);
            }
          }
        }
        
        that.animeData = data;
        db.setDB(that.aDBName, data);
        
        // Notify people that "we ready"
        that.triggerEvent("animedata", {});
      }
    });
    
    req.send();
  },
  
  getEpisodeState(episode) {
    var animeData = this.animeData;
    
    if (!animeData)
      return null;
    
    return animeData.watched[animeData.index[episode]];
  },
  
  setEpisodeState(epArray, indexArray, newStateArray) {
    if (!this.animeData) {
      this.animeData = {
        index: {},
        episode: [],
        title: [],
        watched: []
      };
      
      var animeData = this.animeData;
      
      var index   = animeData.index;
      var episode = animeData.episode;
      var watched = animeData.watched;
      
      for (let i=0; i<epArray.length; i++) {
        let epNum = epArray[i];
        
        index[epNum] = i;
        episode.push(epNum);
        watched.push(newStateArray[i]);
      }
      
      db.setDB(this.aDBName, animeData);
    } else {
      var animeData = this.animeData;
      var watched   = animeData.watched;
      var index     = animeData.index;
      
      if (indexArray) {
        for (let i=0,l=indexArray.length; i<l; i++) {
          watched[indexArray[i]] = newStateArray[i];
        }
      } else {
        for (let i=0,l=epArray.length; i<l; i++) {
          watched[animeData.index[epArray[i]]] = newStateArray[i];
        }
      }
      
      db.setDB(this.aDBName, animeData);
    }
  }
});

function LightsOutMirrorPriority() {
  var mirrors = ["mp4upload", "auengine", "videonest", "yourupload", "dailymotion", "veevr", "uploadc", "videoweed", "novamov"];
  var chooseDubbed = false;
}

function LightsOutPlayerController() {
  
}

// The module interface
reg.interface = {
  Tracker: LightsOutTracker
};
