// Actionbar.js

var ActionBarButton;
var ModePane;
var ModePaneMode;
var styleDefs;

// A style definition
var defABAnim;

AUR.onLoaded("./actionbar-button", "./modepane", "./modepane-mode", "/styles/style-defs", function() {
  ActionBarButton = AUR.import("./actionbar-button");
  ModePane = AUR.import("./modepane");
  ModePaneMode = AUR.import("./modepane-mode");
  styleDefs = AUR.import("/styles/style-defs");
  
  // Get styleDefs
  defABAnim = parseInt(styleDefs.defABAnim, 10);
});

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
  
  .aur-lo-actbar-buttontitles--ACTBAR_ID .aur-lo-actbar-button-title {
    margin-right: ACTBAR_SIZEpx;
  }
`;

// LO ActionBar Constructor
function ActionBar(overlay) {
  lces.types.component.call(this);
  var that = this;
  
  // dom-elements: Action Bar UI components
  var mainButtonTitles = jSh.d(".aur-lo-actbar-button-titles.aur-lo-actbar-buttontitles--" + overlay.loID);
  var mainCapture      = jSh.d(".aur-lo-actionbar-capture.aur-lo-actionbar--" + overlay.loID + ".aur-lo-disabled");
  var mainBody         = jSh.d(".aur-lo-actionbar.aur-lo-actionbar--" + overlay.loID + ".aur-lo-disabled");
  var mainBodyProxy    = jSh.d(".aur-lo-actionbar-proxy.aur-lo-actionbar--" + overlay.loID);
  var innerWrapMain    = jSh.d(".aur-lo-actbar-wrap.aur-lo-actbar-wrap-main.aur-lo-visible");
  var innerWrapMode    = jSh.d(".aur-lo-actbar-wrap.aur-lo-actbar-wrap-mode");
  var mainLogo         = jSh.d(".aur-lo-actbar-button.aur-lo-actbar-button-logo", null, null, {title: "Lights Out Logo"});
  var mainButtons      = jSh.d(".aur-lo-actbar-buttons-main");
  var sizeStyle        = jSh.c("style", {
    prop: {
      type: "text/css"
    },
    child: jSh.t("/* Placeholder CSS Sizing */")
  });
  
  mainBody.appendChild(sizeStyle);
  mainBody.appendChild(mainBodyProxy);
  mainBodyProxy.appendChild(innerWrapMain);
  mainBodyProxy.appendChild(innerWrapMode);
  innerWrapMain.appendChild(mainLogo);
  innerWrapMain.appendChild(mainButtons);
  
  // Add sexy Lights Out logo
  mainLogo.appendChild(jSh.svg(".aur-lo-actbar-button-content", 80, 80, [
    jSh.path(null, "M34.2 20.085h11.6l20.124 15.008H14.076z", "fill:none;stroke:#ffffff;stroke-width:2;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"),
    jSh.path(null, "M40 39.057v14.885", "fill:none;stroke:#ffffff;stroke-width:2;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"),
    jSh.path(null, "M42.987 56.928A2.987 2.987 0 0 1 40 59.915a2.987 2.987 0 0 1-2.987-2.987A2.987 2.987 0 0 1 40 53.942a2.987 2.987 0 0 1 2.987 2.986z", "fill:none;stroke:#ffffff;stroke-width:2;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1")
  ]));
  
  // Properties
  this.loInstance       = overlay;
  this.mainBody         = mainBody;
  this.mainButtons      = mainButtons;
  this.mainButtonTitles = mainButtonTitles;
  jSh.constProp(this, "actbarID", overlay.loID);
  
  this.changingButtonsTimeout = null;
  this.changingButtons        = null;
  // ^ = {
  //   time: getTime(),
  //   hide: [],
  //   show: []
  // };
  
  // Properties
  this.setState("size", 80);
  this.setState("visible", false);
  this.setState("autohide", true);
  this.setState("mounted", false);
  this.setState("enabled", false);
  this.setState("mode", null);
  
  this.buttonCount = 0;
  this.buttons = [];
  this.buttonTitles = [
    // "btn01" | "modebtn02": {
    //    button: ActionBarButton Instance,
    //    title: "Button Title",
    //    visibleTimeout: JS Timeout ID
    // }
  ];
  
  // Events
  function showActionBar() {
    clearTimeout(hideActBarTimeout);
    clearTimeout(that.__demoActbarTimeout);
    
    that.visible = true;
  }
  
  var hideActBarTimeout = null;
  function hideActionBar() {
    if (that.autohide)
      hideActBarTimeout = setTimeout(function() {
        that.visible = false;
      }, 500);
  }
  
  mainCapture.addEventListener("mouseover", showActionBar);
  mainBody.addEventListener("mouseover", showActionBar);
  mainCapture.addEventListener("mouseout", hideActionBar);
  mainBody.addEventListener("mouseout", hideActionBar);
  
  // EVENT LISTENERS
  
  // Prevent from enabling if LO's invoking module is disabled
  this.addStateCondition("visible", function(visible) {
    if (visible && overlay._metadata.isModDisabled) {
      return false;
    }
    
    return true;
  });
  
  // lces-state: visible
  this.addStateListener("visible", (visible) => {
    if (visible) {
      mainBody.classList.add("aur-lo-visible");
    } else {
      mainBody.classList.remove("aur-lo-visible");
      
      // Remove all titles
      this.clearButtonTitles();
    }
  });
  
  function updateHeight() {
    var rect = (that.mode ? innerWrapMode : innerWrapMain).getBoundingClientRect();
    mainBody.style.height = (rect.bottom - rect.top) + "px";
  }
  
  // Add updateHeight method
  this.updateHeight = updateHeight;
  
  // lces-state: size
  this.addStateListener("size", function(size) {
    size = jSh.numOp(size, 80);
    
    sizeStyle.removeChild(sizeStyle.childNodes[0]);
    sizeStyle.appendChild(jSh.t(
      LOActBarSizeStyle.replace(/ACTBAR_ID/g, that.actbarID)
                       .replace(/ACTBAR_SIZE/g, size)
    ));
    
    this.stateStatus = size;
  });
  
  // lces-state: mounted
  var docBody = document.body;
  this.addStateListener("mounted", (mounted) => {
    if (mounted) {
      docBody.appendChild(mainCapture);
      docBody.appendChild(mainBody);
      docBody.appendChild(mainButtonTitles);
      
      setTimeout(function() {
        updateHeight();
      }, 0);
    } else {
      if (mainCapture.parentNode)
        docBody.removeChild(mainCapture);
      if (mainBody.parentNode)
        docBody.removeChild(mainBody);
      if (mainButtonTitles.parentNode)
        docBody.removeChild(mainButtonTitles);
    }
  });
  
  // lces-state: enabled
  this.addStateListener("enabled", (enabled) => {
    if (enabled) {
      mainCapture.classList.remove("aur-lo-disabled");
      mainBody.classList.remove("aur-lo-disabled");
      
      // Short preview of the bar
      this.demoActionBar();
    } else {
      mainCapture.classList.add("aur-lo-disabled");
      mainBody.classList.add("aur-lo-disabled");
    }
  });
  
  // lces-state: mode
  // Stupid animation crap here
  this.addStateListener("mode", function(mode) {
    // Deactivate old mode
    if (this.oldStateStatus && this.oldStateStatus.activeAutomatic)
      this.oldStateStatus.active = false;
    
    // Assert if valid mode or valid null
    if (mode && !(mode instanceof ModePaneMode))
      return false;
    
    // Remove button titles
    that.clearButtonTitles();
    
    if (mode) {
      var modeButtons = mode.buttons;
      
      if (modeButtons.length > 0) {
        var oldInnerWrapMode = innerWrapMode;
            innerWrapMode    = jSh.d(".aur-lo-actbar-wrap.aur-lo-actbar-wrap-mode");
        
        // Add new mode button container
        mainBodyProxy.appendChild(innerWrapMode);
        
        // Remove any buttons
        // innerWrapMode.removeChild(jSh.toArr(innerWrapMode.childNodes));
        
        // Add new mode buttons
        
        // Add top button "logo"
        if (mode.mainButton instanceof ActionBarButton) {
          var logoBtnCopy = mode.mainButton.buttonDOM.cloneNode(true);
          logoBtnCopy.classList.remove("aur-lo-actbar-button-input");
          logoBtnCopy.classList.add("aur-lo-actbar-button-active");
          
          innerWrapMode.appendChild(logoBtnCopy);
        }
        
        // Add the other buttons
        for (let i=0,l=modeButtons.length; i<l; i++) {
          innerWrapMode.appendChild(modeButtons[i].buttonDOM);
        }
        
        // Start height animation
        updateHeight();
        
        // Give the old one a flashy exit
        if (oldInnerWrapMode && oldInnerWrapMode.childNodes.length && this.oldStateStatus) {
          oldInnerWrapMode.classList.add("aur-lo-slideout");
          oldInnerWrapMode.classList.remove("aur-lo-visible");
          
          // Remove when animation is over
          setTimeout(function() {
            mainBodyProxy.removeChild(oldInnerWrapMode);
          }, defABAnim + 10);
        } else {
          // Just remove immediately
          mainBodyProxy.removeChild(oldInnerWrapMode);
        }
        
        // Start animation
        innerWrapMain.classList.remove("aur-lo-default");
        
        innerWrapMain.classList.add("aur-lo-slideout");
        innerWrapMain.classList.remove("aur-lo-visible");
        
        innerWrapMode.classList.add("aur-lo-visible");
        innerWrapMode.classList.remove("aur-lo-slideout");
        
        setTimeout(function() {
          innerWrapMain.classList.remove("aur-lo-slideout");
          innerWrapMain.classList.add("aur-lo-default");
        }, defABAnim + 10);
      }
    } else {
      // Start height animation
      updateHeight();
      
      // Start animation
      innerWrapMain.classList.remove("aur-lo-default");
      innerWrapMode.classList.remove("aur-lo-default");
      
      innerWrapMain.classList.add("aur-lo-visible");
      innerWrapMain.classList.remove("aur-lo-slideout");
      
      innerWrapMode.classList.add("aur-lo-slideout");
      innerWrapMode.classList.remove("aur-lo-visible");
      
      setTimeout(function() {
        innerWrapMode.classList.remove("aur-lo-slideout");
        innerWrapMode.classList.add("aur-lo-default");
      }, defABAnim + 10);
    }
  });
  
  // lces-state: autohide
  this.addStateListener("autohide", (autohide) => {
    if (autohide) {
      clearTimeout(hideActBarTimeout);
      
      hideActionBar();
    } else {
      clearTimeout(hideActBarTimeout);
      
      that.visible = true;
    }
  });
  
  // Prevent lingering modes from keeping the actionbar open
  overlay.addStateListener("enabled", (enabled) => {
    if (!enabled) {
      this.mode = null;
    }
  });
  
  // Initial setup
  this.setState("size", 80, true);
  this.updateHeight = updateHeight;
}

jSh.inherit(ActionBar, lces.types.component);

jSh.extendObj(ActionBar.prototype, {
  demoActionBar() {
    this.visible = true;
    
    this.__demoActbarTimeout = setTimeout(() => {
      this.visible = false;
    }, 6250);
  },
  
  addButton(options) {
    var button = new ActionBarButton(options);
    
    this.buttons.push(button);
    this.mainButtons.appendChild(button.buttonDOM);
    
    // Update height
    setTimeout(() => {
      this.updateHeight();
    }, 0);
    
    // Add actbar reference
    button.loInstance = this.loInstance;
    button.bID = "btn" + this.buttonCount++;
    
    return button;
  },
  
  hideButton(button) {
    var changingButtons = this.changingButtons;
    
    if (!this.changingButtons) {
      this.changingButtons = {
        hide: [button],
        show: []
      };
      
      this.changingButtonsTimeout = setTimeout(this.animateChangingButtons.bind(this), 0);
    } else {
      changingButtons.hide.push(button);
    }
  },
  
  showButton(button) {
    var changingButtons = this.changingButtons;
    
    if (!this.changingButtons) {
      this.changingButtons = {
        hide: [],
        show: [button]
      };
      
      this.changingButtonsTimeout = setTimeout(this.animateChangingButtons.bind(this), 0);
    } else {
      changingButtons.show.push(button);
    }
  },
  
  animateChangingButtons() {
    var changingButtons  = this.changingButtons;
    this.changingButtons = null;
    
    // Reveal/hide all buttons
    var hide = changingButtons.hide;
    var show = changingButtons.show;
    
    // Set to end size
    for (let i=0,l=hide.length; i<l; i++) {
      let btn = hide[i];
      
      btn.buttonDOM.style.position = "absolute";
    }
    
    for (let i=0,l=show.length; i<l; i++) {
      let btn = show[i];
      
      btn.buttonDOM.classList.add("aur-lo-actbar-button-disable-anim");
      btn.buttonDOM.classList.remove("aur-lo-actbar-button-hidden");
    }
    
    // Update height with all buttons
    this.updateHeight();
    
    // Bring them back to animation size
    for (let i=0,l=hide.length; i<l; i++) {
      let btn = hide[i];
      
      btn.buttonDOM.style.position = "relative";
      btn.buttonDOM.classList.add("aur-lo-actbar-button-hidden");
    }
    
    for (let i=0,l=show.length; i<l; i++) {
      let btn = show[i];
      
      btn.buttonDOM.classList.add("aur-lo-actbar-button-hidden");
      
      setTimeout(() => {
        btn.buttonDOM.classList.remove("aur-lo-actbar-button-disable-anim");
        
        setTimeout(() => {
          btn.buttonDOM.classList.remove("aur-lo-actbar-button-hidden");
        }, 1);
      }, 15);
    }
  },
  
  explainButton(button) {
    var title = this.buttonTitles[button.bID];
    var titleDOM;
    
    if (title) {
      titleDOM = this.mainButtonTitles.jSh(".aur-lo-btntitle--" + button.bID)[0];
      
      clearTimeout(title.visibleTimeout);
    } else {
      titleDOM = jSh.d(".aur-lo-actbar-button-title.aur-lo-btntitle--" + button.bID, null, jSh.c("span", {text: button.title}));
      title    = {
        button: button,
        title: button.title,
        visibleTimeout: null
      };
      
      this.buttonTitles[button.bID] = title;
      this.mainButtonTitles.appendChild(titleDOM);
    }
    
    var btnCRect  = button.buttonDOM.getBoundingClientRect();
    var wrapCRect = this.mainButtonTitles.getBoundingClientRect();
    
    titleDOM.classList.add("aur-lo-visible");
    titleDOM.css({
      top: ((btnCRect.top - wrapCRect.top) + ((btnCRect.bottom - btnCRect.top) / 2)) + "px"
    });
  },
  
  unexplainButton(button) {
    var title = this.buttonTitles[button];
    
    if (title) {
      var titleDOM = this.mainButtonTitles.jSh(".aur-lo-btntitle--" + button)[0];
      
      clearTimeout(title.visibleTimeout);
      titleDOM.classList.remove("aur-lo-visible");
      
      title.visibleTimeout = setTimeout((dom, bID) => {
        this.buttonTitles[bID] = undefined;
        this.mainButtonTitles.removeChild(dom);
      }, 360, titleDOM, button);
    }
  },
  
  // Remove all titles
  clearButtonTitles(button) {
    Object.getOwnPropertyNames(this.buttonTitles).forEach(title => this.unexplainButton(title));
  }
});

reg.interface = ActionBar;
