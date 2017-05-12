// Modepan.js

var ModePaneMode;

AUR.onLoaded("./modepane-mode", function() {
  ModePaneMode = AUR.import("./modepane-mode");
});

function ModePane(overlay) {
  lces.types.component.call(this);
  
  // Create elements
  var mainBody   = jSh.d(".aur-lo-modepane.visible.aur-lo-disabled");
  var innerModes = jSh.d(".aur-lo-modepane-modes");
  
  mainBody.appendChild(innerModes);
  
  this.innerModes = innerModes;
  this.registeredModes = [];
  
  // LCES States
  this.setState("visible", true);
  this.setState("mounted", false);
  
  // Events
  
  // lces-state: visible
  this.addStateListener("visible", (visible) => {
    if (visible) {
      mainBody.classList.add("visible");
    } else {
      mainBody.classList.remove("visible");
    }
  });
  
  // lces-state: mounted
  this.addStateListener("mounted", (mounted) => {
    if (mounted)
      document.body.appendChild(mainBody);
    else if (mainBody.parentNode)
      document.body.removeChild(mainBody);
  });
  
  // lces-state: enabled
  this.addStateListener("enabled", (enabled) => {
    if (enabled) {
      mainBody.classList.remove("aur-lo-disabled");
    } else {
      mainBody.classList.add("aur-lo-disabled");
    }
  });
}

jSh.inherit(ModePane, lces.types.component);

jSh.extendObj(ModePane.prototype, {
  addMode(mode) {
    var regModes = this.registeredModes;
    var index    = regModes.indexOf(mode);
    
    if (mode instanceof ModePaneMode && index === -1) {
      regModes.push(mode);
      mode.pane = this;
      
      this.innerModes.appendChild(mode.mainBody);
    }
  }
});

reg.interface = ModePane;
