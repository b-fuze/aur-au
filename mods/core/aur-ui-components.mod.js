AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_DESC = "UI component stuff";
AUR_INTERFACE = "auto";

var ui = AUR.import("aur-ui");

reg.interface = {
  navBtn: function(group, options) {
    if (!group)
      return null;
    
    options = jSh.type(options) === "object" ? options : {};
    options.align = ["left", "right"].indexOf(options.align) === -1 ? "left" : options.align;
    var callback = typeof options.callback === "function" ? options.callback : null;
    
    var prop = group.emptyProp();
    var fmadNavBtn = lces.new("widget", prop.main);
    prop.widget = fmadNavBtn;
    
    var style = {
      position: "fixed",
      bottom: "0px",
      width: "auto",
      padding: "15px",
      paddingBottom: "7px",
      paddingTop: "7px",
      textAlign: "left"
    };
    
    if (options.align === "left") {
      style.paddingLeft = "6px";
      style.paddingRight = "7px";
      style.borderTopRightRadius = "3px";
      style.left = "0px";
      fmadNavBtn.classList.add("fmad-settings-back");
    } else {
      style.paddingRight = "6px";
      style.paddingLeft = "7px";
      style.borderTopLeftRadius = "3px";
      style.right = "0px";
      fmadNavBtn.classList.add("fmad-settings-button-right");
    }
    
    if (!callback) {
      style.userSelect = "none";
      style.mozUserSelect = "none";
      style.webkitUserSelect = "none";
    }
    
    function alignText(text) {
      var left = options.align === "left" ? " " : "";
      var right = left ? "" : " ";
      
      return left + text + right;
    }
    
    fmadNavBtn.style = style;
    fmadNavBtn.classList.add("fmad-settings-button");
    
    if (callback)
      var icon = jSh.svg(".sett-back", 30, 30, [
        jSh.path(undf, "M22.03 15H9.384", "stroke-linecap: square;"),
        jSh.path(undf, "M14 22.188L7.97 15 14 7.812")
      ]);
    else
      var icon = jSh.t("");
    
    var text = jSh.c("span", undf, jSh.strOp(alignText(options.text), alignText("Back")))
    
    if (options.align === "left") {
      fmadNavBtn.appendChild(icon, text);
    } else {
      fmadNavBtn.appendChild(text, icon);
    }
    
    if (callback)
      fmadNavBtn.addEventListener("click", options.callback);
    else {
      fmadNavBtn.classList.add("static");
    }
    return prop;
  },
  
  confirm: function(options) {
    options = jSh.type(options) === "object" ? options : null;
    
    if (!options)
      return false;
    
    pCurDl.message = options.text || "That you want to close?";
    
    if (jSh.type(options.yes) === "function")
      promptYes = options.yes;
    else
      promptYes = null;
    
    if (jSh.type(options.no) === "function")
      promptNo = options.no;
    else
      promptNo = null;
    
    prompt.visible = true;
  }
};

// Setup prompt window
var promptYes = null;
var promptNo = null;
var prompt;
var pCurDl;

AUR.on("load", function() {
  prompt = ui.registerWin("fmad-gen-prompt", "Confirm - AUR", {
    tabsVisible: false,
    draggable: false,
    centered: true,
    width: 420
  });

  var pTab = prompt.registerTab("are-you-sure", "Quit?");
  pTab.selected = true;
  pCurDl = pTab.textProp(null, 12, {
    data: "{#message}",
    align: "center",
    select: false,
    dynText: true
  });

  pCurDl.message = "";

  var pButtons = pTab.buttonProp(null, 12, {
    fill: true
  });

  var pCancel = pButtons.addButton("No", function() {
    prompt.visible = false;
    
    if (promptNo)
      promptNo();
  });

  pButtons.addButton("Yes", function() {
    prompt.visible = false;
    
    if (promptYes)
      promptYes();
  });

  prompt.addStateListener("visible", function() {
    prompt.draggable = false;
    prompt.centered = true;
    prompt.centered = false;
    prompt.draggable = true;
    
    pCancel.element.focus();
    
    setTimeout(function() {
      pTab.scrollbar.visible = false;
    }, 10);
  });
});
