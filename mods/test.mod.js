// AUR LO Tests
AUR_NAME = "Test";
AUR_DESC = "Test mod";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";

var aj   = AUR.import("ajaxify");
var page = AUR.import("aur-page");
var ui   = AUR.import("aur-ui");

var testnotifi = ui.notifi.neutral("TEST LO CONN STATUS: {#connStatus}", null, "TC", false);
var tryConn    = null;
var connection = false;
var connCount  = 0;

testnotifi.connStatus = "DOWN";
testnotifi.addButton("Connect to lopc", function() {
  if (tryConn)
    tryConn();
});

testnotifi.addButton("Toggle", function() {
  if (connection) {
    connection.toggle();
  }
});

function Connection(embedFrame, connID, origin) {
  this.frame  = embedFrame;
  this.connID = connID;
  this.origin = origin;
  
  // Playing
  this.playing = false;
}

jSh.extendObj(Connection.prototype, {
  play() {
    this.dispatch("play");
  },
  
  pause() {
    this.dispatch("pause");
  },
  
  toggle() {
    if (this.playing)
      this.pause();
    else
      this.play();
  },
  
  dispatch(cmd, data) {
    this.frame.postMessage({
      cmd: cmd,
      data: data
    }, this.origin);
  }
});

function inspectIFrame(doc) {
  var iframe     = jSh(doc).jSh("#pembed > iframe")[0];
  var embedFrame = iframe.contentWindow;
  var postOrigin = /auengine\.com\//.test(iframe.src) ? "http://www.auengine.com" :
                  (/mp4upload\.com\//.test(iframe.src) ? "http://mp4upload.com" : "http://videonest.net");
  
  tryConn = function() {
    embedFrame.postMessage({
      cmd: "connect",
      data: ++connCount
    }, postOrigin);
  }
  
  testnotifi.visible = true;
}

window.addEventListener("message", function(evt) {
  var origin = evt.origin || evt.originalEvent.origin;
  var data   = evt.data;
  
  if (origin !== "http://www.auengine.com" &&
      origin !== "http://mp4upload.com" &&
      origin !== "http://videonest.net")
    return false;
  
  switch (data.msg) {
    case "init-conn":
      testnotifi.connStatus = "ACTIVE:" + (data.data.ptype + "").toUpperCase();
      
      connection = new Connection(evt.source, data.data.conn, origin);
    break;
    case "ready":
      if (connection)
        connection.ready = true;
    break;
    case "play":
      if (connection)
        connection.playing = true;
    break;
    case "pause":
      if (connection)
        connection.playing = false;
    break;
  }
});

if (page.isEpisode) {
  inspectIFrame(document);
}

aj.onEvent("load", /\/+[^]+-episode-[\d\.]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/, function(e) {
  inspectIFrame(document);
});

aj.onEvent("load", null, function() {
  testnotifi.connStatus = "DOWN";
  connection = null;
  
  if (page.isEpisode)
    testnotifi.visible = true;
  else {
    tryConn = null;
    testnotifi.visible = false;
  }
});
