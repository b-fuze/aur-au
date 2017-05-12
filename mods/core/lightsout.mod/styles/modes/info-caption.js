// Info-caption.js - Styles

var style = AUR.import("aur-styles");
  
style.styleBlock(`
  // ANIME/EP CAPTIONS
  .aur-lo-info-caption-wrap {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    padding: 25px 20px 45px;
    
    text-align: left;
    color: #eee;
    background: linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 75%);
  }
  
  .aur-lo-info-caption-wrap .aur-lo-anime-title {
    font-family: Roboto;
    font-size: 26px;
    margin: 0px 0px 10px;
    opacity: 0.65;
  }
  
  .aur-lo-info-caption-wrap .aur-lo-episode-number {
    font-family: Roboto;
    font-size: 36px;
    margin: 0px 0px 10px;
  }
  
  .aur-lo-info-caption-wrap .aur-lo-episode-number span {
    color: #20BFFF;
  }
  
  .aur-lo-info-caption-wrap .aur-lo-episode-title {
    font-size: 22px;
    font-style: italic;
    margin: 0px 0px 0px;
    opacity: 0.75;
  }
`);
