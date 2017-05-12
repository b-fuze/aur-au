// Modepane-mode.js

var ActionBarButton;

AUR.onLoaded("./actionbar-button", function() {
  ActionBarButton = AUR.import("./actionbar-button");
});

function ModePaneMode(options, loInstance) {
  lces.types.component.call(this);
  
  // Active class: .aur-lo-active
  // Active class: .aur-lo-active
  var mainBody = jSh.d(".aur-lo-modepane-view.aur-lo-animated");
  
  // Make properties
  this.loInstance      = loInstance;
  this.name            = options.name;
  this.mainBody        = mainBody;
  this.buttonCount     = 0;
  this.buttons         = [];
  this.activeAutomatic = typeof options.activeAutomatic === "undefined"
                       ? true
                       : !!options.activeAutomatic;
  
  // LCES States
  this.setState("active", false);
  this.setState("animated", false);
  
  // Events
  
  // lces-state: active
  this.addStateListener("active", (active) => {
    if (active) {
      mainBody.classList.add("aur-lo-active");
      
      // Change bar mode
      if (this.buttons.length > 0)
        loInstance.actionBar.mode = this;
    } else {
      mainBody.classList.remove("aur-lo-active");
    }
  });
  
  // lces-state: animated
  this.addStateListener("animated", (animated) => {
    if (animated) {
      mainBody.classList.add("aur-lo-animated");
    } else {
      mainBody.classList.remove("aur-lo-animated");
    }
  });
}

jSh.inherit(ModePaneMode, lces.types.component);

jSh.extendObj(ModePaneMode.prototype, {
  addButton(options) {
    var button = new ActionBarButton(options);
    
    button.loInstance = this.loInstance;
    button.loMode     = this;
    button.bID        = this.name + "btn" + this.buttonCount++;
    
    this.buttons.push(button);
    return button;
  }
});

reg.interface = ModePaneMode;
