// Lights Out core library
AUR_NAME = "Lights Out Libraries";
AUR_DESC = "Lights Out Core Libraries";
AUR_VERSION = [0, 1, 0];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";
AUR_RUN_AT = "doc-end";

// Imports
var sett = AUR.import("aur-settings");
var style = AUR.import("aur-styles");
var aj = AUR.import("ajaxify");
var page;

AUR.onLoaded("aur-page", function() {
  page = AUR.import("aur-page");
});

// -----------------------
//      LIGHTS OUT UI
// -----------------------

// For uniquely idenfiying LO Instances
var LOInstanceCount = 0;

// LO Instance Constructor
function LightsOutOverlay() {
  lces.type().call(this);
  
  // Elements
  var darkOverlay = jSh.d(".aur-lo-overlay-main");
  
  // Properties
  jSh.constProp(this, "loID", ++LOInstanceCount);
  
  // LCES States
  this.setState("active", false);
  this.setState("mounted", false);
  
  // Sub-components
  this.actionBar = new ActionBar(this);
  this.modePane  = new ModePane(this);
  
  // Events
  this.addStateListener("mounted", (mounted) => {
    mounted = !!mounted;
    
    if (mounted) {
      
    } else {
      
    }
    
    // Propagate to sub-ui components
    this.actionBar.mounted = mounted;
    this.modePane.mounted = mounted;
  });
}

jSh.inherit(LightsOutOverlay, lces.type());

// LO ActionBar sizing Style Template
var LOActBarSizeStyle = `
  .aur-lo-actionbar--ACTBAR_ID,
  .aur-lo-actionbar--ACTBAR_ID .aur-lo-actbar-wrap {
    width: ACTBAR_SIZEpx;
  }
  
  .aur-lo-actionbar--ACTBAR_ID .aur-lo-actbar-button {
    width: ACTBAR_SIZEpx;
    height: ACTBAR_SIZEpx;
  }
`;

// LO ActionBar Constructor
function ActionBar(overlay) {
  lces.type().call(this);
  
  var mainBody      = jSh.d(".aur-lo-actionbar.aur-lo-actionbar--" + overlay.loID);
  var innerWrapMain = jSh.d(".aur-lo-actbar-wrap.aur-lo-actbar-wrap-main");
  var innerWrapMode = jSh.d(".aur-lo-actbar-wrap.aur-lo-actbar-wrap-mode");
  var mainLogo      = jSh.d(".aur-lo-actbar-button.aur-lo-actbar-button-logo");
  var mainButtons   = jSh.d(".aur-lo-actbar-buttons-main");
  var sizeStyle     = jSh.c("style", {
    prop: {
      type: "text/css"
    },
    child: jSh.t("/* Placeholder CSS Sizing */")
  });
  
  mainBody.appendChild(sizeStyle);
  innerWrapMain.appendChild(mainLogo);
  innerWrapMain.appendChild(mainButtons);
  
  // Properties
  this.mainBody = mainBody;
  this.mainButtons = mainButtons;
  jSh.constProp(this, "actbarID", overlay.loID);
  
  // Properties
  this.setState("size", 80);
  this.setState("visible", false);
  this.setState("mounted", false);
  
  this.buttons = [];
  
  // Events
  this.addStateListener("size", (size) => {
    size = jSh.numProp(size, 80);
    
    sizeStyle.removeChild(sizeStyle.childNodes[0]);
    sizeStyle.appendChild(jSh.t(
      LOActBarSizeStyle.replace(/ACTBAR_ID/g, this.actbarID)
                       .replace(/ACTBAR_SIZE/g, size)
    ));
    
    this.stateStatus = size;
  });
  
  // Initial setup
  this.setState("size", 80, true);
}

jSh.inherit(ActionBar, lces.type());

jSh.extendObj(ActionBar.prototype, {
  addButton(options) {
    var button = new ActionBarAction(options);
    
    this.buttons.push(button);
    this.mainButtons.appendChild(button.buttonDOM);
  }
});

// ActionBar Button
function determineActionButton(src) {
  if (src instanceof SVGElement)
    return src;
  else if (typeof src === "string" && src.trim())
    return jSh.d(".aur-lo-actbar-button-text", src.trim());
  else
    return jSh.d(".aur-lo-actbar-button-text", "ACTBTN");
}

// ActionBar Button Constructor
function ActionBarButton(options) {
  lces.type().call(this);
  
  options = jSh.type(options) === "object" ? options : {};
  
  // Set options initially
  this.modeAction = jSh.strOp(options.modeAction, null);
  this.buttonDOM  = jSh.d(".aur-lo-actbar-button", null, determineActionButton(options.button));
  
  // LCES States
  this.setState("visible", true);
  
  // Event listeners
  this.addStateListener("visible", (visible) => {
    if (visible) {
      this.buttonDOM.classList.remove(".aur-lo-actbar-button-hidden");
    } else {
      this.buttonDOM.classList.add(".aur-lo-actbar-button-hidden");
    }
  });
}

jSh.inherit(ActionBarAction, lces.type());

// LO ModePane Constructor
function ModePane(overlay) {
  lces.type().call(this);
  
  // LCES States
  this.setState("visible", false);
  this.setState("mounted", false);
  
  // Events
  this.addStateListener("visible", (visible) => {
    if (visible) {
      
    } else {
      
    }
  });
}

jSh.inherit(ModePane, lces.type());

jSh.extendObj(ModePane.prototype, {
  
});

function ModePaneMode() {
  
}

// LO ModePane Page Constructor
function ModePaneView() {
  lces.type().call(this);
  
  
}

jSh.inherit(ModePaneView, lces.type());

jSh.extendObj(ModePaneView.prototype, {
  
});

// Interface
reg.interface = {
  instance: new LightsOutOverlay()
};
