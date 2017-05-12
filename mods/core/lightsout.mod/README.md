# Lights Out

Lights Out is an AUR module that attempts to concentrate all the multimedia
functions a user usually cares about, namely:

 * The video player
 * Fullscreen
 * Ease of inter-episode navigation
 * Episode tracking
 * Video size/placement
 * Darkening of all other unrelated/distracting content on the page to fully
   enjoy the medium
 * Etc...

All in one place, easily accessible, and one click away (e.g. navigating to *any*
other episode without leaving fullscreen)

## How to use it

You simply make a `misc` AUR module of any name, say `my-lightsout.mod.js`,
and import Lights Out like so:

```js
var LightsOut = AUR.import("lightsout");

AUR.on("load", function() {
  var lo = new LightsOut({
    getPlayer(doc) {
      return doc.jSh("#some-iframe"); // <iframe> containing the video player
    }
  });

  // If `getPlayer` returns an <iframe>, then the following line will activate
  // Lights Out, else `lo.enabled` will still evaluate to false
  lo.enabled = true;
});
```

`AUR.on("load", ...)` is required so Lights Out can initialize properly.

And there you have it! Lights Out should be working with the minimal features
enabled, background darkening, and video resizing/positioning. If you want to
configure Lights Out even further you should consult the [API.md](API.md) for a
comprehensive documentation of the `options` argument for Lights Out.

## Options object example

The flags are listed as their default values.

```js
var options = {
  // Flags
  infoCaption: true,
  scaleMove: true,
  shadingLevelUI: true,
  shadingLevelConfig: true,
  episodeTracker: true,
  aurTab: true,
  
  // Callbacks
  getPlayer() {},
  getEpisodeLinks() {},
  getEpisodeInfo() {},
  getTrackerData() {},
  
  // Properties
  shadingLevelConfigUI: null // AUR Module Register UI
};
```
