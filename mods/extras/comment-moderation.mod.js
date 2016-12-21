// remove all inline styles and use classes/ids
// use appropriate varilable/function names
AUR_INTERFACE = "auto";
AUR_NAME = "Comment Moderator Tools";
AUR_DESC = "Tools for managing comments, like bulk deleting comments.";
AUR_VERSION = [0, 1, 0];
AUR_AUTHORS = ["Samu (TDN)", "Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_RUN_AT = "doc-end";

var style = AUR.import("aur-styles");
var ui    = AUR.import("aur-ui");
var page  = AUR.import("aur-page");
var aj    = AUR.import("ajaxify");
var sett  = AUR.import("aur-settings");

var deletedNotifi  = ui.notifi.info("[b]{#count}[/b] comments deleted", 3500, "TC");
var selHiddenDivs  = [];
var hiddenDivModel = lces.new("group");
hiddenDivModel.setState("deleting", false); // To sync `deleting` state between all hiddenDivs
hiddenDivModel.setState("commentCount", 0);
hiddenDivModel.setState("modEnabled", true);

// Bulk select color thingy
sett.setDefault("commentAdmin", {
  bulkSelectColor: sett.Setting("Bulk selection color", "string", "#008000")
});

reg.ui.prop({
  link: "commentAdmin.bulkSelectColor",
  align: "right",
  color: true
});

var colorStyle = style.styleBlock(``);

sett.on("commentAdmin.bulkSelectColor", function(e) {
  colorStyle.src = `
    .aur-bulkdel-hidden {
      background: ${ e.value };
    }
  `;
}, true);

// LCES Template Constructors
var HiddenDiv = lces.template({
  render: jSh.m.if("modEnabled", null, [
    jSh.m.if("deleting", null, [
      jSh.dm({
        sel: ".aur-bulkdel-hidden",
        prop: {
          // Make sure these states are created
          props: "{#deleted} {#selected} {#deleting} {#modEnabled}"
        },
        events: {
          click() {
            var ctx = this.lces.ctx;
            
            // Toggle if this comment's selected
            ctx.selected = !ctx.selected;
          },
          
          mousedown(e) {
            e.preventDefault();
          }
        }
      })
    ])
  ]),
  
  init: function(hiddenDiv, ctx) {
    // Add this model to hiddenDivModel group
    hiddenDivModel.addMember(ctx);
    var hiddenDivMain = null;
    var hiddenDivComment = null;
    
    ctx.addStateListener("selected", function(selected) {
      if (selected) {
        hiddenDivComment = jSh(hiddenDiv.parentNode);
        hiddenDivMain = hiddenDivComment.jSh(".aur-bulkdel-hidden")[0];
        hiddenDivMain.classList.add("aur-bulkdel-visible");
        
        ctx.commentId = hiddenDiv.parentNode.jSh(".like-comment")[0].rel;
        selHiddenDivs.push(ctx);
      } else {
        hiddenDivMain.classList.remove("aur-bulkdel-visible");
        var index = selHiddenDivs.indexOf(ctx);
        
        if (index !== -1)
          selHiddenDivs.splice(index, 1);
      }
      
      hiddenDivModel.commentCount = selHiddenDivs.length;
    });
    
    ctx.addStateListener("deleted", function(deleted) {
      if (deleted) {
        hiddenDivComment.classList.add("aur-comment-deleted");
      }
    });
    
    ctx.addStateListener("deleting", function(deleting) {
      if (!deleting)
        ctx.selected = false;
    });
  }
});

var DeleteMain = lces.template({
  render: jSh.m.if("modEnabled", null, [
    jSh.dm({
      class: ".aur-ui-root.aur-bulkdelete-main.lces-themify",
      child: [
        
        // Hide this button if you're deleting
        jSh.m.if("!deleting", null, [
          // Button: Bulk Delete
          jSh.cm("button", {
            sel: ".aur-init-bulkdel",
            text: "Bulk Delete",
            events: {
              click() {
                this.lces.ctx.deleting = true;
              }
            }
          }),
        ]),
        
        // Show these buttons if you're deleting
        jSh.m.if("deleting", null, [
          // Button: Delete N comments
          jSh.cm("button", {
            sel: ".aur-act-bulkdel-confirm",
            text: "Delete {#commentCount} comment(s)",
            events: {
              click() {
                var ctx = this.lces.ctx;
                
                if (!ctx.commentCount) {
                  ctx.deleting = false;
                  return;
                }
                
                ctx.deleteComments();
              }
            }
          }),
          
          // Button: Cancel Bulk Delete
          jSh.cm("button", {
            sel: ".aur-act-bulkdel-cancel",
            text: "Cancel Bulk Delete",
            events: {
              click() {
                this.lces.ctx.deleting = false;
              }
            }
          })
        ])
      ],
      prop: {
        // Make sure `deleting` state is created
        deleting: "{#deleting} {#modEnabled}"
      }
    }),
  ]),
 
  init: function(newElement, ctx) {
    hiddenDivModel.addMember(ctx);
   
    ctx.deleteComments = function deleteComments() {
      // Do magic with selectedComments...
      // console.log("Sakujo!", selectedComments);
      var finishedRequests = 0;
      
      function done() {
        finishedRequests++;
        
        if (finishedRequests === selHiddenDivs.length) {
          // cleanUp();
          selHiddenDivs = [];
          hiddenDivModel.deleting = false;
          ctx.commentCount = 0;
          
          deletedNotifi.count = finishedRequests;
          deletedNotifi.visible = true;
        }
      }
      
      for (var i=0; i<selHiddenDivs.length; i++) {
        var comment = selHiddenDivs[i];
        
        var id = comment.commentId;
        comment.deleted = true;
        
        var req = new lcRequest({
          method: "GET",
          uri: "/ajax.php",
          query: {
            method: "deletevideocomment",
            commentid: id
          },
          success: done
        });
        
        req.send();
      }
      
      // www.animeultima.io/ajax.php?method=deletevideocomment&commentid=
    }
    
    ctx.addStateListener("deleting", function(deleting) {
      // Show/Hide hidden divs
      hiddenDivModel.deleting = deleting;
    });
  }
});

var bulkDeleteButtons = new DeleteMain({
  modEnabled: true,
  commentCount: 0 // This becomes the initial state for the `ctx`
});

function InitBulkDelete() {
  // Add deleting buttons
  selHiddenDivs = [];
  var commentContainer = jSh("#comment-container");
  
  commentContainer.parentNode.insertBefore(bulkDeleteButtons, commentContainer);
  
  // Add occluding boxes to click on comments
  var commentItems = jSh(".comment-item");
  
  for (var i=0; i<commentItems.length; i++) {
    commentItems[i].insertBefore(new HiddenDiv({
      modEnabled: true,
      deleting: false,
      selected: false,
      deleted: false
    }), commentItems[i].children[0]);
  }
}

if (page.isEpisode) {
  InitBulkDelete();
}

aj.onEvent("load", /./, function(e) {
  if (page.isEpisode) {
    InitBulkDelete();
    
    bulkDeleteButtons.LCESInvisible(false);
  }
});

reg.on("moddisable", function() {
  hiddenDivModel.modEnabled = false;
});

reg.on("modenable", function() {
  hiddenDivModel.modEnabled = true;
});

style.styleBlock(`
.aur-comment-deleted {
  display: none !important;
}

.aur-bulkdel-hidden {
  position: absolute;
  z-index: 1000;
  left: -5px;
  top: 0px;
  width: 100%;
  height: 100%;
  padding-left: 5px;
  
  opacity: 0;
  transition: opacity 150ms ease-out;
}

.aur-bulkdel-hidden::before {
  content: "DELETE";
  position: absolute;
  top: 50%;
  left: 0px;
  right: 0px;
  
  color: #fff;
  font-family: Arial, Verdana, Sans;
  font-weight: bold;
  font-size: 20px;
  // text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.35);
  text-align: center;
  letter-spacing: 2px;
  
  transform: translateY(-50%);
  cursor: default;
  opacity: 0;
}

.aur-bulkdel-hidden:hover {
  opacity: 0.15;
}

.aur-bulkdel-visible {
  opacity: 0.5 !important;
}

.aur-bulkdel-visible::before {
  opacity: 1;
}

.aur-cm-no-clicks {
  pointer-events: none;
}
`);
