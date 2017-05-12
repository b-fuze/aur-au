// Actionbar-button.js

var ModePaneMode;

AUR.onLoaded("./modepane-mode", function() {
  ModePaneMode = AUR.import("./modepane-mode");
});

function determineActionButton(src) {
  if (src instanceof SVGElement) {
    src.classList.add("aur-lo-actbar-button-content");
    return src;
  } else if (typeof src === "string" && src.trim())
    return jSh.d(".aur-lo-actbar-button-content.aur-lo-actbar-button-text", src.trim());
  else
    return jSh.d(".aur-lo-actbar-button-content.aur-lo-actbar-button-text", "ACTBTN");
}

// ActionBar Button Constructor
function ActionBarButton(options) {
  lces.types.component.call(this);
  var that = this;
  
  options = jSh.type(options) === "object" ? options : {};
  
  // Set options initially
  this.modeAction = options.modeAction instanceof ModePaneMode ? options.modeAction : null;
  this.activate   = typeof options.activate === "function" ? options.activate : null;
  this.loInstance = null;
  
  // Assign "mainButton"
  if (this.modeAction)
    this.modeAction.mainButton = this;
  
  // Create elements
  var innerButtonDOM  = determineActionButton(options.button);
  var innerButtonWrap = jSh.d(".aur-lo-actbar-button-inner-wrap", null, innerButtonDOM);
  var headerLogo      = innerButtonDOM.cloneNode(true);
  var buttonDOM       = jSh.d(".aur-lo-actbar-button.aur-lo-actbar-button-input", null, innerButtonWrap);
  
  this.buttonDOM = buttonDOM;
  
  // LCES States
  this.setState("buttonType", this.modeAction ? "mode" : "simple");
  this.setState("visible", true);
  this.setState("disabled", false);
  this.setState("toggle", false);
  this.setState("visualToggle", false);
  this.setState("buttonScale", 1);
  this.setState("title", null);
  
  // ---- State Conditions ----
  
  this.addStateCondition("buttonType", function(type) {
    if (type === "mode" || type === "simple" || type === null)
      return true;
    else
      return false;
  });
  
  this.addStateCondition("buttonScale", function(scale) {
    this.proposedValue = Math.max(Math.min(jSh.numOp(scale, 1), 1), 0);
    return true;
  });
  
  // ---- Event listeners ----
  
  // pseudo-event: modeaction
  var onClickChangeMode = () => {
    this.modeAction.active = !this.modeAction.active;
  }
  
  if (this.modeAction)
    buttonDOM.addEventListener("click", onClickChangeMode);
  else if (this.activate)
    buttonDOM.addEventListener("click", this.activate);
  
  // lces-state: type
  var oldButtonType = this.buttonType;
  this.addStateListener("buttonType", function(type) {
    if (type === "mode") {
      buttonDOM.removeEventListener("click", that.activate);
      
      if (that.modeAction)
        buttonDOM.addEventListener("click", onClickChangeMode);
    } else if (type === "simple") {
      buttonDOM.removeEventListener("click", onClickChangeMode);
      
      if (that.activate)
        buttonDOM.addEventListener("click", that.activate);
    } else {
      
      if (that.activate)
        buttonDOM.removeEventListener("click", that.activate);
      if (onClickChangeMode)
        buttonDOM.removeEventListener("click", onClickChangeMode);
    }
  });
  
  if (jSh.strOp(options.title, "").trim()) {
    var buttonTitleTimeout = null;
    buttonDOM.addEventListener("mouseover", () => {
      clearTimeout(buttonTitleTimeout);
      
      this.loInstance.actionBar.explainButton(this);
    });
    
    buttonDOM.addEventListener("mouseout", () => {
      clearTimeout(buttonTitleTimeout);
      
      buttonTitleTimeout = setTimeout(() => {
        this.loInstance.actionBar.unexplainButton(this.bID);
      }, 125);
    });
  }
  
  // lces-state: disabled
  this.addStateListener("disabled", (disabled) => {
    if (disabled) {
      oldButtonType   = this.buttonType;
      this.buttonType = null;
      
      buttonDOM.classList.add("aur-lo-actbar-button-disabled");
    } else {
      this.buttonType = oldButtonType;
      
      buttonDOM.classList.remove("aur-lo-actbar-button-disabled");
    }
  });
  
  // lces-state: toggle
  if (typeof options.toggleState === "boolean") {
    // Do nothing here???
  } else {
    if (this.modeAction)
      this.modeAction.addStateListener("active", (active) => {
        this.visualToggle = active;
      });
  }
  
  this.addStateListener("toggle", (toggle) => {
    this.visualToggle = !!toggle;
  });
  
  // lces-state: visualToggle
  this.addStateListener("visualToggle", (visualToggle) => {
    if (visualToggle) {
      this.buttonDOM.classList.add("aur-lo-actbar-button-active");
    } else {
      this.buttonDOM.classList.remove("aur-lo-actbar-button-active");
    }
  });
  
  // lces-state: visible
  this.addStateListener("visible", (visible) => {
    if (visible) {
      this.loInstance.actionBar.showButton(this);
      
      // this.loInstance.actionBar.updateHeight();
    } else {
      this.loInstance.actionBar.hideButton(this);
      
      // this.loInstance.actionBar.updateHeight();
      // this.buttonDOM.style.position = "relative";
      //
      // this.buttonDOM.classList.add("aur-lo-actbar-button-hidden");
    }
  });
  
  // lces-state: buttonScale
  this.addStateListener("buttonScale", (scale) => {
    innerButtonWrap.css({
      transform: "scale(" + scale + ")"
    });
  });
  
  // lces-state: title
  this.addStateListener("title", (title) => {
    if (title && typeof title === "string" && title.trim()) {
      buttonDOM.title = title;
    } else {
      buttonDOM.removeAttribute("title");
    }
  });
  
  // Apply some (possible) options
  this.buttonScale = options.buttonScale;
  
  if (typeof options.toggleState === "boolean")
    this.toggle = options.toggleState;
  
  if (options.title)
    this.title = options.title;
  
  if (typeof options.toggleState === "boolean")
    this.toggle = options.toggleState;
}

jSh.inherit(ActionBarButton, lces.types.component);

reg.interface = ActionBarButton;
