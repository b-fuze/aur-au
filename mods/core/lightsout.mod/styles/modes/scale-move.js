// Scale-move.js - Styles

var style = AUR.import("aur-styles");

style.styleBlock(`
  // MOVING/SCALING MODE UI
  
  .aur-lo-modepane-view.aur-lo-scalemove-mode {
    transform: translate(0px, 0px) !important;
  }
  
  .aur-lo-modepane-view.aur-lo-scalemove-mode.aur-lo-grabbing {
    cursor: grabbing;
    cursor: -webkit-grabbing;
  }
  
  .aur-lo-modepane-view.aur-lo-scalemove-mode.aur-lo-grabbing * {
    cursor: grabbing;
    cursor: -webkit-grabbing;
  }
  
  .aur-lo-pos-handle {
    position: absolute;
    // z-index: 1000000000;
    background: #000;
    opacity: 0.65;
    cursor: grab;
    cursor: -webkit-grab;
  }
  
  // Pretty animations
  .aur-lo-pos-handle.aur-lo-pos-handle-animated {
    transition: left 250ms cubic-bezier(.33,.04,.14,.99), top 250ms cubic-bezier(.33,.04,.14,.99), width 250ms cubic-bezier(.33,.04,.14,.99), height 250ms cubic-bezier(.33,.04,.14,.99);
  }
  
  // Arrow logo-icon thing
  .aur-lo-pos-handle::before {
    content: "";
    position: absolute;
    display: block;
    left: 0px;
    right: 0px;
    bottom: 0px;
    top: 0px;
    margin: auto auto;
    width: 205px;
    height: 205px;
    
    transform: scale(0.75, 0.75);
    background: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22205%22%20height%3D%22205%22%3E%3Cpath%20d%3D%22M115%2080.87V52.5h25L102.5%2015%2065%2052.5h25v28.393M80.87%2090H52.5V65L15%20102.5%2052.5%20140v-25h28.393m43.238%200h28.37v25l37.5-37.5L152.5%2065v25h-28.394zM90%20124.13v28.37H65l37.5%2037.5%2037.5-37.5h-25v-28.393z%22%20style%3D%22opacity%3A0.5%3Bfill%3A%23ffffff%3Bstroke%3Anone%3B%22%2F%3E%3C%2Fsvg%3E') no-repeat;
  }
  
  .aur-lo-pos-handle.aur-lo-scalemove-disabled {
    cursor: default !important;
  }
  
  .aur-lo-pos-handle *,
  .aur-lo-pos-handle::before {
    opacity: 1;
    transition: opacity 150ms ease-out;
  }
  
  .aur-lo-pos-handle.aur-lo-scalemove-disabled *,
  .aur-lo-pos-handle.aur-lo-scalemove-disabled::before {
    pointer-events: none !important;
    opacity: 0 !important;
  }
  
  // Pos handle buttons
  .aur-lo-pos-handle .aur-lo-pos-handle-button-tray {
    position: absolute;
    bottom: 20%;
    left: 0px;
    right: 0px;
    
    text-align: center;
  }
  
  .aur-lo-pos-handle .aur-lo-pos-handle-button-tray .aur-lo-pos-handle-button {
    display: inline-block;
    border-radius: 5px;
    padding: 7px 10px;
    margin: 0px 10px;
    
    color: rgba(255, 255, 255, 0.85);
    background: rgba(0, 0, 0, 0.55);
    font-size: 18px;
    border: 1px solid rgba(255, 255, 255, 0.75);
    transition: border-color 150ms ease-out, background 150ms ease-out;
    cursor: pointer;
  }
  
  .aur-lo-pos-handle .aur-lo-pos-handle-button-tray .aur-lo-pos-handle-button:hover {
    border-color: #20BFFF;
    background: rgba(0, 0, 0, 0.85);
  }
`);
