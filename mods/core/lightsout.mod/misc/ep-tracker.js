// Tracker.js

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
  this.addEvent("animedataloading");
  
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
    
    // Notify people that "we ready"
    that.triggerEvent("animedataloading", {});
    
    this.options.getTrackerData(function(data) {
      var oldData     = that.animeData;
      var dataEpisode = data.episode;
      var dataTitle   = data.title;
      var dataWatched = data.watched = [];
      
      // Brief rest between two for loops
      setTimeout(function() {
        if (oldData) {
          var oldDataIndex   = oldData.index;
          var oldDataWatched = oldData.watched;
          
          for (var i=0,l=dataEpisode.length; i<l; i++) {
            var episode       = dataEpisode[i];
            var oldStateIndex = oldDataIndex[episode];
            
            dataWatched.push(oldStateIndex === undefined ? -1 : oldDataWatched[oldStateIndex]);
          }
        } else {
          for (var i=0,l=dataEpisode.length; i<l; i++) {
            dataWatched.push(-1);
          }
        }
        
        var savedData = {
          index: data.index,
          watched: data.watched,
          episode: [],
          title: []
        };
        
        that.animeData = data;
        db.setDB(that.aDBName, savedData);
        
        // Notify people that "we ready"
        that.triggerEvent("animedata", {});
      }, 0);
    });
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

reg.interface = LightsOutTracker;
