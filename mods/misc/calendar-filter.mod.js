// AUR Refactor Module
AUR_NAME = "Calendar Filter";
AUR_DESC = "Adds a filter feature to the overly condensed calendar.";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;

var sett  = AUR.import("aur-settings");
var style = AUR.import("aur-styles");
var modEnabled = true;

sett.setDefault("calendarFilter", {
  fadeFactor: sett.Setting("Non-matching opacity", "number", 35)
});

// Add option
reg.ui.prop({
  link: "calendarFilter.fadeFactor",
  slider: true,
  min: 0,
  max: 100,
  suffix: "%"
});

AUR.onLoaded("aur-refactor", function() {
  var refactor = AUR.import("aur-refactor");
  
  refactor.on("calendarload", function(e) {
    var visbileEvt = e.visible();
    var cal = e.calendar;
    var calWrap = cal.parentNode;
    
    var input = lces.new("textfield");
    var inputWrap = jSh.d(".aur-cal-filter-wrap");
    var clearBtn = jSh.d(".aur-cal-filter-clear", undf, [
      jSh.svg(undf, 30, 30, [
        jSh.path(undf, "M8.625 7.22L7.22 8.624 13.593 15 7.22 21.375l1.405 1.406L15 16.407l6.375 6.375 1.406-1.405L16.407 15l6.375-6.375-1.405-1.406L15 13.593 8.625 7.22z")
      ])
    ], {
      title: "Clear calendar filter"
    });
    
    // Append to page
    inputWrap.appendChild(input.element);
    inputWrap.appendChild(clearBtn);
    calWrap.insertBefore(inputWrap, cal);
    
    input.element.placeholder = "Filter titles, or #Nth Episode";
    
    // Filtering
    var cells = cal.jSh(".calt1").concat(cal.jSh(".calt2"));
    var episodeSearch = /^#\d+(?:\.\d+)?$/;
    
    function filter() {
      var value = input.value;
      var episodeNum = false;
      
      if (episodeSearch.test(value)) {
        value = value.substr(1).replace(".", "\\.");
        episodeNum = new RegExp("\\bepisode\\s+" + value + "(?:[^\\d]|$)", "i");
      }
      
      value = value.trim().toLowerCase();
      
      if (!value) {
        cal.classList.remove("aur-filtering");
      } else {
        cal.classList.add("aur-filtering");
        
        for (var i=0,l=cells.length; i<l; i++) {
          var cell = cells[i];
          var name = cell.textContent.toLowerCase();
          
          if (episodeNum && episodeNum.test(name) || !episodeNum && name.indexOf(value) !== -1) {
            cell.classList.add("aur-filter-selected");
          } else {
            cell.classList.remove("aur-filter-selected");
          }
        }
      }
    }
    
    // Events
    visbileEvt.addStateListener("calVisible", function(visible) {
      if (visible && modEnabled)
        input.focus();
    });
    
    input.addEventListener("input", function() {
      filter();
    });
    
    clearBtn.on("click", function() {
      input.value = "";
      filter();
    });
    
    // Module disabled
    reg.on("moddisable", function() {
      modEnabled = false;
      disabledStyles.enabled = true;
    });
    
    reg.on("modenable", function() {
      modEnabled = true;
      disabledStyles.enabled = false;
    });
  });
});

style.styleBlock(`
  // Table cells styling
  .aur-calendar-wrap table .calt1, .aur-calendar-wrap table .calt2,
  .aur-calendar-wrap table.aur-filtering .calt1.aur-filter-selected,
  .aur-calendar-wrap table.aur-filtering .calt2.aur-filter-selected {
    opacity: 1;
    // outline: 2px solid rgba(255, 0, 50, 0);
    transition: opacity 250ms ease, outline 250ms ease;
  }
  
  .aur-calendar-wrap table.aur-filtering .calt1.aur-filter-selected,
  .aur-calendar-wrap table.aur-filtering .calt2.aur-filter-selected {
    // outline: 2px solid rgba(255, 0, 50, 0.5);
  }
  
  // Filter styles
  .aur-cal-filter-wrap {
    position: relative;
    display: block;
    margin: 0px 0px 10px;
  }
  
  .aur-cal-filter-wrap input.lces {
    display: block;
    border-radius: 0px;
    border: 0px;
    
    background: #131417;
    color: #B0B8BF;
    
    box-sizing: border-box;
    height: 40px;
    width: 100%;
    padding: 0px 10px;
    line-height: 40px;
    font-size: 20px;
  }
  
  .aur-cal-filter-wrap input.lces::-webkit-input-placeholder {
    color: #2B2F33;
  }
  .aur-cal-filter-wrap input.lces:-moz-placeholder { /* Firefox 18- */
    color: #2B2F33;
  }
  .aur-cal-filter-wrap input.lces::-moz-placeholder {  /* Firefox 19+ */
    color: #2B2F33;
  }
  
  .aur-cal-filter-wrap .aur-cal-filter-clear {
    position: absolute;
    width: 30px;
    height: 30px;
    right: 10px;
    top: 0px;
    bottom: 0px;
    margin: auto 0px;
    
    transform-origin: 100% 50%;
    transform: scale(0.85);
    opacity: 0.5;
    transition: opacity 150ms ease;
    cursor: pointer;
  }
  
  .aur-cal-filter-wrap .aur-cal-filter-clear:hover {
    opacity: 1;
  }
  
  .aur-cal-filter-wrap .aur-cal-filter-clear svg path {
    fill: #B0B8BF;
  }
`);

var fadeFactor = style.styleBlock("");
function setFadeFactor(factor) {
  fadeFactor.src = `.aur-calendar-wrap table.aur-filtering .calt1, .aur-calendar-wrap table.aur-filtering .calt2 {
    opacity: ${factor / 100};
  }`;
}

// Set initial opacity: 0.35
setFadeFactor(35);

// Change factor on event
sett.on("calendarFilter.fadeFactor", function(e) {
  setFadeFactor(e.value);
});

var disabledStyles = style.styleBlock(style.important(`
  .aur-calendar-wrap table.aur-filtering .calt1, .aur-calendar-wrap table.aur-filtering .calt2 {
    opacity: 1;
  }
  
  .aur-cal-filter-wrap {
    display: none;
  }
`), false);
