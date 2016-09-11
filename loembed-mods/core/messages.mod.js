// AUR AU LO Player Messaging API
AUR_NAME = "AUR LO Message Definitions";
AUR_DESC = "AUR LO Message Definitions";
AUR_VERSION = [0, 1, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";

// ISOLATED FUNCTION
function LOGetFlowConnection(video) {
  var lopc = new LOPlayerConnection(video);
  
  lopc.type = "fp";
  lopc.playing = video.playing;
  
  video.onResume = () => {
    if (!this.playbackStateChange) {
      lopc.playing = true;
      this.triggerEvent("play");
    }
  };
  
  return lopc;
}

function LOGetJWConnection(video) {
  console.log("LO VIDEO", video);
  var lopc = new LOPlayerConnection(video);
  
  lopc.type = "jw";
  lopc.playing = video.getState() === "playing";
  
  video.onPlay = () => {
    if (!this.playbackStateChange) {
      lopc.playing = true;
      lopc.triggerEvent("play");
    }
  };
  
  video.setControls(false);
  return lopc;
}

function EmbedConnect() {
  var s = jSh.d(null, "HEY");
  var m = jSh.d();
  s.css({
    position: "absolute",
    zIndex: "10000000",
    right: "10px",
    bottom: "10px",
    fontSize: "30px",
    color: "red"
  });
  
  s.appendChild(m);
  document.body.appendChild(s);
  
  var LOPC = function LOPlayerConnection(video) {
    this.curTime  = 0;
    this.duration = null;
    this.events   = {};
    this.ready    = false;
    this.playing  = true;
    this.type     = null;
    this.video    = video;
    
    // States
    this.playbackStateChange = false;
    
    // Add events
    this.addEvent("ready");
    this.addEvent("play");
    this.addEvent("pause");
    
    this.on("ready", () => {
      this.sendMessage("ready", 1);
    });
    
    this.on("play", function() {
      this.playbackStateChange = true;
      video.play();
      this.playbackStateChange = false;
    });
    
    this.on("pause", function() {
      this.playbackStateChange = true;
      video.pause();
      this.playbackStateChange = false;
    });
    
    // Video bindings
    video.onReady = () => {
      this.triggerEvent("ready", 1);
    };
    
    video.onPause = () => {
      if (!this.playbackStateChange) {
        this.playing = false;
        this.triggerEvent("pause", 1);
      }
    };
    
    // Connections bindings
  }
  
  // Add methods to LOPC prototype
  jSh.extendObj(LOPC.prototype, {
    addEvent(evt) {
      this.events[evt] = [];
    },
    
    on(evt, cb) {
      var evtCallbackArr = this.events[evt];
      
      if (!evtCallbackArr || evtCallbackArr.indexOf(cb) !== -1)
        return null;
      
      evtCallbackArr.push(cb);
      return true;
    },
    
    removeListener(evt, cb) {
      var evtCallbackArr = this.events[evt];
      var cbIndex        = evtCallbackArr ? evtCallbackArr.indexOf(cb) : -1;
      
      if (!evtCallbackArr || cbIndex === -1)
        return null;
      
      evtCallbackArr.splice(cbIndex, 1);
      return cb;
    },
    
    triggerEvent(evt, data) {
      var listeners = this.events[evt];
      
      if (jSh.type(listeners) === "array") {
        for (var i=0,l=listeners.length; i<l; i++) {
          var listener = listeners[i];
          
          if (typeof listener === "function") {
            try {
              listener(data);
            } catch (e) {}
          }
        }
      }
    },
    
    sendMessage
  });
  
  window.LOPlayerConnection = LOPC;
  var lopcInst = null;
  var loconn   = null;
  
  if (typeof flowplayer === "function") {
    lopcInst = LOGetFlowConnection(flowplayer());
    m.textContent += " FP DETECTED";
  } else if (typeof jwplayer === "function") {
    lopcInst = LOGetJWConnection(jwplayer(0));
    m.textContent += " JW DETECTED";
  }
  
  window.addEventListener("message", onLOMessage, false);
  
  function onLOMessage(evt) {
    var origin = evt.origin || evt.originalEvent.origin;
    var data   = evt.data;
    
    if (origin !== "http://www.animeultima.io")
      return false;
    
    switch (data.cmd) {
      case "connect":
        loconn = {
          frame: evt.source,
          origin: origin,
          connID: data.data
        };
        
        m.textContent += "GOT CONN: " + data.data + " " + origin + " ";
        
        sendMessage("init-conn", {
          ptype: lopcInst.type,
          conn: loconn.connID
        });
      break;
      case "play":
        if (lopcInst) {
          lopcInst.triggerEvent("play");
        }
      break;
      case "pause":
        if (lopcInst) {
          lopcInst.triggerEvent("pause");
        }
      break;
    }
  }
  
  function sendMessage(msg, data) {
    if (loconn)
      loconn.frame.postMessage({
        msg: msg,
        data: data,
        connID: loconn.connID
      }, loconn.origin);
  }
}
// /ISOLATED FUNCTION

// Add base jSh
document.head.appendChild(jSh.c("script", {
  prop: {
    type: "text/javascript"
  },
  child: jSh.t(
    `function getGlobal() {
      return this;
    }

    if (!getGlobal().lces)
      lces = {rc: [], onlyjSh: true, global: getGlobal()};
    else
      lces.global = getGlobal();` +
    "(" + lces.rc[0].toString() + ")(); "
  )
}));

// Add app main logic functions
document.head.appendChild(jSh.c("script", {
  prop: {
    type: "text/javascript"
  },
  child: jSh.t(
    LOGetFlowConnection.toString() +
    LOGetJWConnection.toString() +
    EmbedConnect.toString() + " window.addEventListener(\"load\", () => { EmbedConnect(); });"
  )
}));
