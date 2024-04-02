import {Injectable} from "@angular/core";
import {IMFXHtmlPlayerComponent} from "../imfx.html.player";
import {AbstractPlayerProvider} from "./abstract.player.provider";
import {TimecodeProvider} from "./timecode.provider";
import {ItemTypes} from "../item.types";
import {PosterProvider} from "./poster.provider";
import {TimecodeControlsProvider} from "./timecode.controls.provider";
import {VideoJSCurrentTimeProvider} from "./videojs.current.time.provider";

@Injectable()
export class LiveProvider extends AbstractPlayerProvider
{
  private play;
  private pause;
  private duration;
  private seek = true;
  private currentSongIndex = 0;
  private val = 0;
  private offset = 0;
  private songs = [];
  private continuousPosterInterval;
  
  constructor(private vjsCurrentTimeProvider: VideoJSCurrentTimeProvider,
              private timeCodeControlsProvider: TimecodeControlsProvider,
              private posterProvider: PosterProvider){
    super();
  }
  
  initLive() {
    let providerRef = this;
    this.currentSongIndex = 0;
    this.val = 0;
    this.offset = 0;
    this.duration = 0;
    this.duration = this.componentRef.player.currentTime();
    this.componentRef.type = ItemTypes.AUDIO;
    /* UNCOMMENT FOR SHOW DEFAULT AUDIO POSTER EVERYTIME
     this.componentRef.file.ThumbUrl = null;
     this.componentRef.file.THUMBID = -1; */
    this.posterProvider.setPoster();
    this.componentRef.type = ItemTypes.MEDIA;
    this.componentRef.player.duration = function(seconds) {
      if (seconds) {
        seconds = providerRef.duration;
      }
      return providerRef.componentRef.player.constructor.__super__.duration.call(this, seconds);
    };
    
    this.componentRef.player.currentTime = function(seconds) {
      if (seconds) {
        providerRef.componentRef.player.constructor.__super__.currentTime.call(this, seconds - providerRef.offset);
      } else {
        return providerRef.componentRef.player.constructor.__super__.currentTime.apply(this, arguments) + providerRef.offset;
      }
    };
    
    this.componentRef.player.stopImage = function() {
      var playerRef = this;
      clearInterval(providerRef.continuousPosterInterval);
      this.poster("");
      $(".imfx-big-play-btn").show();
      // restore event
      var btn = $(".vjs-play-pause-button");
      btn.off("mouseup")
    }
    this.componentRef.player.playImage = function() {
      var playerRef = this;
      var frameInterval = 1000/25;
      playerRef.stopImage();
      playerRef.pause();
      playerRef.poster("./assets/img/dpsinvert.png");
      $(".imfx-big-play-btn").hide();
      var btn = $(".vjs-play-pause-button");
      providerRef.continuousPosterInterval = setInterval(function() {
        if (btn.hasClass("vjs-paused")) {
          return
        }
        $(".vjs-poster").show();
        var sec = providerRef.offset + frameInterval/1000;
        providerRef.offset = sec;
        playerRef.controlBar.children()[0].children()[0].update();
        let end = providerRef.getSongTime(true);
        if (sec >= end) {
          playerRef.stopImage();
          if (providerRef.songs.length > 0 && providerRef.currentSongIndex < providerRef.songs.length - 1) {
            providerRef.currentSongIndex++;
            providerRef.componentRef.player.src(providerRef.songs[providerRef.currentSongIndex].url);
            providerRef.componentRef.player.on("canplaythrough", () => {
              providerRef.componentRef.player.play();
            });
          } else {
            providerRef.currentSongIndex = 0;
            providerRef.componentRef.player.src(providerRef.songs[providerRef.currentSongIndex].url);
          }
        }
      },frameInterval);
      setTimeout(() => {playerRef.trigger("play");}, 50);
      // add event
      
      btn.on("mouseup",function(){
        playerRef.trigger( btn.hasClass("vjs-playing") ? "pause" : "play");
      })
    }
    
    
    for(var i = 0; i < this.componentRef.src.length; i++) {
      let _tmp = {};
      if((!this.componentRef.src[i]["src"] || this.componentRef.src[i]["src"].length == 0 ) && !this.componentRef.src[i]["restricted"]) {
        continue;
      }
      _tmp["url"] = this.componentRef.src[i]["src"];
      if(this.componentRef.src[i]["restricted"]) {
        _tmp["restricted"] = true;
      }
      if(this.componentRef.src[i]["seconds"] && this.componentRef.src[i]["seconds"] != 0) {
        _tmp["duration"] = this.componentRef.src[i]["seconds"];
      }
      this.songs.push(_tmp)
    }
    if(this.songs.length > 0) {
      this.duration = 0;
      for(var i =0; i < this.songs.length; i++) {
        if(!this.songs[i]["duration"] && i < this.songs.length - 1 ) {
          this.songs = [];
          console.log("incorrect playlist");
          break;
        }
        if(this.songs[i]["duration"]) {
          this.duration += this.songs[i]["duration"];
        }
      }
      if(this.songs.length > 0) {
        this.componentRef.player.src(this.songs[this.currentSongIndex].url);
        this.setDuration(this.duration);
      }
    }
    this.updateChunkSeparators();
    if(this.songs.length > 0)
    {
      setTimeout(() => {
        this.componentRef.player.on("timeupdate", () => {
          let curtime = providerRef.componentRef.player.currentTime();
          if (curtime >= providerRef.componentRef.player.duration()) {
            providerRef.duration = curtime;
            providerRef.setDuration(curtime);
            providerRef.timeCodeControlsProvider.updateTimecode(false, true);
          }
        });
        this.componentRef.player.on("ended", function () {
          if (providerRef.songs.length > 0 && providerRef.currentSongIndex < providerRef.songs.length - 1) {
            providerRef.currentSongIndex++;
            providerRef.offset = providerRef.getSongTime();
            if(providerRef.songs[providerRef.currentSongIndex].restricted && providerRef.songs[providerRef.currentSongIndex].url.length == 0) {
              providerRef.componentRef.player.currentTime(0);
              providerRef.componentRef.player.src("");
              providerRef.componentRef.player.playImage();
            }
            else {
              providerRef.componentRef.player.src(providerRef.songs[providerRef.currentSongIndex].url);
              providerRef.componentRef.player.on("canplaythrough", () => {
                providerRef.componentRef.player.play();
              });
            }
          }
          else if (providerRef.songs.length > 0) {
            providerRef.currentSongIndex = 0;
            providerRef.offset = providerRef.getSongTime();
            if(providerRef.songs[providerRef.currentSongIndex].restricted  && providerRef.songs[providerRef.currentSongIndex].url.length == 0) {
              providerRef.componentRef.player.currentTime(0);
              providerRef.componentRef.player.playImage();
            }
            else {
              providerRef.componentRef.player.src(providerRef.songs[providerRef.currentSongIndex].url);
            }
          }
        });
        $(this.componentRef.player.controlBar.progressControl.el_).on("mousedown", () => {
          if (providerRef.seek) {
            providerRef.onChangeRange();
          }
        });
        this.componentRef.player.on("seeking", (e) => {
          providerRef.seek = false;
        });
        this.componentRef.player.on("seeked", (e) => {
          providerRef.seek = true;
        });
      });
    }
  }
  
  getSongTime(getEndTime = false) {
    var offset = 0;
    if(getEndTime) {
      for(var i = 0; i <= this.currentSongIndex; i++) {
        if(this.songs[i]["duration"]) {
          offset += this.songs[i]["duration"];
        }
      }
    }
    else {
      for(var i = 0; i < this.currentSongIndex; i++) {
        if(this.songs[i]["duration"]) {
          offset += this.songs[i]["duration"];
        }
      }
    }
    return offset;
  }
  
  updateChunkSeparators() {
    if(this.songs.length > 0) {
      this.duration = 0;
      $('.js-separators').remove();
      for(var i =0; i < this.songs.length; i++) {
        if(this.songs[i]["duration"]) {
          this.duration += this.songs[i]["duration"];
          $(this.componentRef.player.controlBar.progressControl.seekBar.el_).append('<div class="vjs-segment-position js-separators" style="left: ' + this.duration/this.componentRef.player.duration()*100 + '%"></div>');
          if(this.songs[i]["restricted"]) {
            $(this.componentRef.player.controlBar.progressControl.seekBar.el_).append('<div class="vjs-segment-position js-separators" style="left: ' + (this.duration - this.songs[i]["duration"])/this.componentRef.player.duration()*100 + '%; width:' + this.songs[i]["duration"]/this.componentRef.player.duration()*100+ '%"></div>')
          }
        }
      }
    }
  }
  
  onChangeRange(outsideVal = null) {
    let playFlag = $(".vjs-play-pause-button").hasClass("vjs-paused") ? true : $(".vjs-play-pause-button").hasClass("vjs-playing") ? false : true;
    console.log(playFlag);
    if(outsideVal != null) {
      this.val = outsideVal;
    } else {
      this.val = this.vjsCurrentTimeProvider.getTimelineTime();
    }
    let offset = 0;
    var index = 0;
    for(var i = 0; i < this.songs.length; i++) {
      if(this.val > offset) {
        index = i;
        if(this.songs[i]["duration"]) {
          offset += this.songs[i]["duration"];
        }
      }
    }
    if(index != this.currentSongIndex) {
      this.currentSongIndex = index;
      this.offset = this.getSongTime();
      if(this.songs[this.currentSongIndex].restricted && this.songs[this.currentSongIndex].url.length == 0) {
        this.componentRef.player.currentTime(0);
        this.componentRef.player.src("");
        this.offset = this.val;
        this.componentRef.player.playImage();
      } else {
        this.componentRef.player.stopImage();
        this.componentRef.player.src(this.songs[this.currentSongIndex].url);
        this.componentRef.player.currentTime(this.val);
        this.componentRef.player.on("canplaythrough", ()=> {
          if(!playFlag) {
            this.componentRef.player.play();
          }
          else {
            this.componentRef.player.pause();
          }
          this.componentRef.type = ItemTypes.AUDIO;
          this.posterProvider.setPoster();
          this.componentRef.type = ItemTypes.MEDIA;
        });
      }
    } else {
      if(this.songs[this.currentSongIndex].restricted && this.songs[this.currentSongIndex].url.length == 0) {
        this.componentRef.player.currentTime(0);
        this.componentRef.player.src("");
        this.offset = this.val;
        this.componentRef.player.trigger("play");
      } else {
        this.offset = this.getSongTime();
        if (outsideVal != null) {
          this.componentRef.player.currentTime(this.val);
          if(playFlag) {
            this.componentRef.player.pause();
          } else {
            this.componentRef.player.play();
          }
        }
      }
    }
    if (this.componentRef.player.currentTime() >= this.duration) {
      this.duration = this.componentRef.player.currentTime();
      this.setDuration(this.duration);
    }
  }
  
  setDuration(duration) {
    this.componentRef.player.duration(duration);
    this.updateChunkSeparators();
  }
}
