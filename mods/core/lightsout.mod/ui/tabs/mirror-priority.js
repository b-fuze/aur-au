// Mirror-priority.js - Tab

var ui = AUR.import("aur-ui");
var style = AUR.import("aur-styles");
var sett = AUR.import("aur-settings");

var UILiTpl2 = lces.template({render: jSh.dm(".aur-lo-mp-factor-item", "UP - I - lel")});
var UILiTpl1 = lces.template({render: jSh.dm(".aur-lo-mp-factor-item", "MI - I - dun")});
var UITpl = lces.template({
  render: jSh.dm(".aur-lo-mirror-priority-ui-wrap", null, [
    jSh.m.if("uploaderFactor", null, [
      jSh.dm(".aur-lo-mirror-priority-column.aur-lo-mirror-priority-uploaders", null, [
        jSh.dm(".aur-lo-mp-factor-inner-wrap", null, [
          // Factor header
          jSh.dm(".aur-lo-mp-factor-header", null, [
            jSh.cm("span", null, null, [
              jSh.tm("UPLOADERS")
            ])
          ]),
          
          // Factor list
          jSh.dm(".aur-lo-mp-factor-list", null, [
            UILiTpl2,
            UILiTpl2,
            UILiTpl2
          ])
        ])
      ], {
        dynClass: {
          "uploaderFactor && !mirrorFactor":
            ".aur-lo-mirror-priority-single-col",
          
          "uploaderFactorOrder > mirrorFactorOrder && mirrorFactor && uploaderFactor":
            ".aur-lo-mirror-priority-first-col",
          
          "uploaderFactorOrder < mirrorFactorOrder && mirrorFactor && uploaderFactor":
            ".aur-lo-mirror-priority-second-col"
        }
      })
    ]), // endif: uploaderFactor
    
    jSh.m.if("uploaderFactor && mirrorFactor", null, [
      jSh.dm(".aur-lo-mirror-priority-separator", null, [
        jSh.dm(".aur-lo-mp-switch-factors", null, [
          jSh.tm("<>")
        ])
      ], null, null, {
        click: function() {
          var sortingModel = this.lces.ctx;
          
          console.time("swap-speed");
          sortingModel.states["uploaderFactorOrder"].stateStatus = sortingModel.uploaderFactorOrder === 0 ? 1 : 0;
          sortingModel.mirrorFactorOrder = sortingModel.mirrorFactorOrder === 0 ? 1 : 0;
          console.timeEnd("swap-speed");
        }
      })
    ]), // endif: uploaderFactor && mirrorFactor
    
    jSh.m.if("mirrorFactor", null, [
      jSh.dm(".aur-lo-mirror-priority-column.aur-lo-mirror-priority-mirrors", null, [
        jSh.dm(".aur-lo-mp-factor-inner-wrap", null, [
          // Factor header
          jSh.dm(".aur-lo-mp-factor-header", null, [
            jSh.cm("span", null, null, [
              jSh.tm("MIRRORS")
            ])
          ]),
          
          // Factor list
          jSh.dm(".aur-lo-mp-factor-list", null, [
            UILiTpl1,
            UILiTpl1,
            UILiTpl1
          ])
        ])
      ], {
        dynClass: {
          "!uploaderFactor && mirrorFactor":
            ".aur-lo-mirror-priority-single-col",
            
          "uploaderFactorOrder > mirrorFactorOrder && mirrorFactor && uploaderFactor":
            ".aur-lo-mirror-priority-second-col",
            
          "uploaderFactorOrder < mirrorFactorOrder && mirrorFactor && uploaderFactor":
            ".aur-lo-mirror-priority-first-col"
        }
      })
    ]), // if: mirrorFactor
    
    jSh.m.if("!uploaderFactor && !mirrorFactor", null, [
      jSh.dm(".aur-lo-mirror-priority-column.aur-lo-mirror-priority-single-col", null, [
        jSh.dm(".aur-lo-mp-factor-inner-wrap", null, [
          jSh.dm(".aur-lo-mp-factor-header.lc-centertext", "No factors available — Mirror Priority Disabled")
        ])
      ])
    ])
  ], null, {
    states: "{#uploaderFactor} {#mirrorFactor}"
  }),
  
  init: function(dom, ctx) {
    // Do something here?
  }
});

function UIModel() {
  lces.types.component.call(this);
  
  this.setState("uploaderFactor", sett.get("lightsout.mirrorPriority.uploaderFactor"));
  this.setState("mirrorFactor", sett.get("lightsout.mirrorPriority.mirrorFactor"));
  this.setState("uploaderFactorOrder", sett.get("lightsout.mirrorPriority.uploaderFactorOrder"));
  this.setState("mirrorFactorOrder", sett.get("lightsout.mirrorPriority.mirrorFactorOrder"));
  
  // Bind to global settings
  sett.on("lightsout.mirrorPriority.uploaderFactor", (e) => {
    this.uploaderFactor = e.value;
  });
  
  // Profile uploaderFactor
  this.profileState("uploaderFactor", "slow-uploader-profile");
  
  // Profile mirrorFactor
  this.profileState("mirrorFactor", "slow-mirror-profile");
  
  sett.on("lightsout.mirrorPriority.mirrorFactor", (e) => {
    this.mirrorFactor = e.value;
  });
}

jSh.inherit(UIModel, lces.types.component);

reg.interface = function(main, options) {
  // Make mirror priority tab
  var MPTab = ui.prefs.registerTab("lightsout-mirror-priority", "Mirror Priority");
  
  // Uploader UI group
  var uGroup = MPTab.groupProp(null, 6, {
    title: null,
    groupIsolate: false
  });
  
  // Mirror UI group
  var mGroup = MPTab.groupProp(null, 6, {
    title: null,
    groupIsolate: false
  });
  
  // Add uploader factor
  uGroup.prop({
    link: "lightsout.mirrorPriority.uploaderFactor",
    width: 7,
    align: "center"
  });
  
  // Add mirror factor
  mGroup.prop({
    link: "lightsout.mirrorPriority.mirrorFactor",
    width: 7,
    align: "center"
  });
  
  // Add sorting UI
  var sortingGroup = MPTab.groupProp(null, 12, {
    // title: "Priority Sorting"
  });
  
  var sortingUIWrap = sortingGroup.emptyProp(null, 12);
  var sortingModel  = new UIModel();
  var sortingInst   = new UITpl(sortingModel);
  
  sortingUIWrap.main.appendChild(sortingInst);
  
  // Hide tab when Lights Out is disabled
  main.on("moddisable", function() {
    MPTab.hidden = true;
    MPTab.selected = false;
  });
  
  main.on("modenable", function() {
    MPTab.hidden = false;
  });
  
  return MPTab;
}

var sepWidth = 50;

style.styleBlock(`
  .aur-lo-mirror-priority-ui-wrap {
    // Nothing?
  }
  
  .aur-lo-mirror-priority-column {
    position: relative;
    box-sizing: border-box;
    display: inline-block;
    width: 50%;
  }
  
  .aur-lo-mirror-priority-column.aur-lo-mirror-priority-first-col {
    padding: 0px ${ sepWidth / 2 }px 0px 5px;
  }
  
  .aur-lo-mirror-priority-column.aur-lo-mirror-priority-second-col {
    padding: 0px 5px 0px ${ sepWidth / 2 }px;
  }
  
  .aur-lo-mirror-priority-column.aur-lo-mirror-priority-uploaders.aur-lo-mirror-priority-second-col {
    left: 50%;
  }
  
  .aur-lo-mirror-priority-column.aur-lo-mirror-priority-mirrors.aur-lo-mirror-priority-first-col {
    right: 50%;
  }
  
  .aur-lo-mirror-priority-column.aur-lo-mirror-priority-single-col {
    padding: 0px 5px;
    width: 100%;
  }
  
  .aur-lo-mp-factor-inner-wrap {
    position: relative;
    width: 100%;
  }
  
  .aur-lo-mp-factor-inner-wrap .aur-lo-mp-factor-header {
    width: 100%;
    height: 40px;
    padding: 0px 5px;
    box-sizing: border-box;
    margin: 0px 0px 5px;
    vertical-align: top;
    
    line-height: 40px;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.075);
  }
  
  .aur-lo-mp-factor-inner-wrap .aur-lo-mp-factor-item {
    width: 100%;
    height: 40px;
    padding: 5px;
    box-sizing: border-box;
    margin: 0px 0px 5px;
    
    opacity: 0.75;
    line-height: 40px;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.025);
    // border-bottom: 1px solid rgba(255, 255, 255, 0.075);
    cursor: move;
  }
  
  .aur-lo-mirror-priority-separator {
    position: relative;
    vertical-align: top;
    display: inline-block;
    width: 0px;
    height: 0px;
  }
  
  .aur-lo-mirror-priority-separator .aur-lo-mp-switch-factors {
    position: absolute;
    z-index: 10;
    // top: ${ -1 * sepWidth / 2 }px;
    top: -5px;
    left: ${ -1 * sepWidth / 2 }px;
    width: ${ sepWidth }px;
    height: ${ sepWidth }px;
    
    line-height: ${ sepWidth }px;
    text-align: center;
    font-family: mono;
    font-weight: bold;
    letter-spacing: 0em;
    cursor: pointer;
  }
  
  .aur-lo-mirror-priority-separator .aur-lo-mp-switch-factors::before {
    content: "";
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    margin: 5px;
    box-sizing: border-box;
    
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 3px;
  }
`);
