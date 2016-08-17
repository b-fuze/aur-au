// Test staff tools
AUR_NAME = "StaffTools Fixes";
AUR_DESC = "Various stafftool fixes";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;
AUR_RUN_AT = "doc-start";

var page  = AUR.import("aur-page");
var aj    = AUR.import("ajaxify");
var style = AUR.import("aur-styles");

// Add more pages to match
page.addPage("isStaffCP", /^https?:\/\/(www\.)?animeultima\.io\/+staff-control\.html(\?[^#]*)?(#[^]*)?$/);

function fixStaffTools() {
  var report = jSh(".report-video")[0].jSh(".report-button")[0];
  var staffTools = jSh(".staff-tools")[0];
  var staffToolsBtn = jSh.c("span", {
    sel: ".staff-tools-toggle",
    text: " Staff Tools"
  });
  
  // Append to page
  report.parentNode.classList.add("staff-tools-available");
  report.parentNode.insertBefore(
    staffToolsBtn,
    report.nextElementSibling
  );
  
  // Create LCES focused events and handlers
  var staffFocus = lces.new("widget", staffToolsBtn);
  staffFocus.setState("focused", false);
  lces.focus.addMember(staffFocus);
  
  staffTools.component = staffFocus;
  staffFocus.addStateListener("focused", function(focused) {
    if (focused)
      staffTools.classList.add("st-visible");
    else
      staffTools.classList.remove("st-visible");
  });
  
  // Clean up some punctuation and ugly : colons
  staffTools.jSh("b")[0].textContent = "Staff Tools";
  staffTools.jSh("a")[0].textContent = "Delete Mirror";
}

window.addEventListener("DOMContentLoaded", function() {
  if (page.isEpisode && jSh(".staff-tools")[0]) {
    alert("FIXING");
    fixStaffTools();
  }
});

// Fix video staff tools
aj.onEvent("load", /\/+[^]+-episode-[\d\.]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/, function() {
  if (page.isEpisode && jSh(".staff-tools")[0]) {
    fixStaffTools();
  }
});

// Exclude the long pages from AJAX'ify
aj.excl(/^\/index\.php\?m=/);

// Fix stafftools in CP
style.styleBlock(style.important(`
  #main-content {
    float: none;
  }
  
  table.stats {
    border-spacing: 2px;
    border: 0px;
  }
  
  table.stats td.head {
    background: #131417;
  }
  
  table.stats td.head + td {
    background: #222429;
  }
  
  // Long tables
  table#forum tr:hover {
    background: #282B30;
  }
  
  table#forum td.head {
    color: inherit;
    background: #131417;
  }
  
  table#forum {
    background: #1A1B1F;
    border-color: #282B30;
  }
`));
