import {
  Component, ViewEncapsulation, Input, ViewChild, OnInit, AfterViewInit, OnChanges, OnDestroy, ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import * as $ from 'jquery';
import {ConfigService} from "../../../services/config/config.service";

require('./plugins/html5slider');

@Component({
    selector: 'imfx-live-player',
    templateUrl: "tpl/index.html",
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class LivePlayerComponent implements OnInit, OnChanges {
  
    @Input() apiSrc: any;
    private container;
    private play;
    private pause;
    private mute;
    private muted;
    private current;
    private durationContainer;
    private song: HTMLAudioElement;
    private duration;
    private liveIcon;
    private seek = true;
    private readyAfterSeek = true;
    private currentSongIndex = 0;
    private songs = [
      {url:"http://www.noiseaddicts.com/samples_1w72b820/4357.mp3", duration: 220},
      {url:"http://www.noiseaddicts.com/samples_1w72b820/4355.mp3", duration: 165}
      // {url:"https://www.dropbox.com/s/h4r3ryi5hkda2dy/Jingle_Lose_01.mp3?dl=1", duration: 3},
      // {url:"https://www.dropbox.com/s/0vzkjq143m805uo/Jingle_Lose_00.mp3?dl=1", duration: 6},
      // {url:"https://www.dropbox.com/s/u5mrz6jp7vk54pc/Jingle_Win_01.mp3?dl=1", duration: 3},
      // {url:"http://localhost:54014/api/media/play?f=03_MISTER_BEEP-Chromospheric_Flares.mp3"}
    ]
  
  constructor(private cdr: ChangeDetectorRef) {
    }
  ngOnInit() {
    let self = this;
    setTimeout(() => {
      self.viewInit();
      self.cdr.markForCheck();
    });
  }
  
  ngOnChanges() {
    let self = this;
    setTimeout(() => {
      self.viewInit();
      self.cdr.markForCheck();
    })
  }
  
  getApi() {
    return ConfigService.getAppApiUrl();
  }

  viewInit() {
      this.liveIcon = $('.live-label');
      this.container = $('.live-container');
      this.play = $('#live-play');
      this.pause = $('#live-pause');
      this.mute = $('#live-mute');
      this.muted = $('#live-muted');
      this.current = $('#live-current');
      this.durationContainer = $('#live-duration');
      this.song = <HTMLAudioElement>$('#mainPlayer')[0];
      this.duration = parseInt(this.song.currentTime.toString(), 10);
      
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
      }
      
      let self = this;
  
    this.song.addEventListener('timeupdate', function () {
        if(!self.readyAfterSeek) {
          return;
        }
        let curtime = parseInt(self.song.currentTime.toString(), 10);
        let offset = self.getSongTime();

        if (offset + curtime >= self.duration) {
          self.duration = offset + curtime;
          $("#live-seek").attr("max", self.duration);
          self.setDuration(self.durationContainer, self.duration);
        }
  
        let val:number = (parseInt($('#live-seek').val(), 10) - parseInt($('#live-seek').attr('min'), 10)) / (parseInt($('#live-seek').attr('max'), 10) - parseInt($('#live-seek').attr('min'), 10));
        var resCSS = '';
        let os = 0;
        for(var i = 0; i < self.songs.length; i++) {
          if(self.songs[i]["duration"]) {
            let _tmp:number = (os - parseInt($('#live-seek').attr('min'), 10)) / (parseInt($('#live-seek').attr('max'), 10) - parseInt($('#live-seek').attr('min'), 10));
            if(resCSS.length == 0) {
              resCSS += ',';
            }
            resCSS += 'color-stop(' + _tmp + ', yellow), color-stop(' + _tmp + 0.005 + ', yellow)';
          }
        }
        $('#live-seek').css('background-image',
          '-webkit-gradient(linear, left top, right top, '
          + 'color-stop(' + val + ', #2A8CEA), '
          + 'color-stop(' + val + ', transparent)'
          + resCSS
          + ')'
        );
        if(self.seek) {
          $("#live-seek").val(offset + curtime);
          $("#live-seek").attr("value", offset + curtime);
          self.setCurrent(self.current, offset + curtime);
        }
      });
  
      this.song.addEventListener("ended", function(){
        if(!self.seek) {
          return;
        }
        if(self.currentSongIndex < self.songs.length - 1) {
          self.currentSongIndex++;
          self.song.src = self.songs[self.currentSongIndex].url;
          self.song.play();
        } else {
          self.liveIcon.addClass("ended");
          self.pause.hide();
          self.play.show();
        }
      });
  
      $('#live-seek').on("mousedown", ()=> {
        this.seek = false;
      });
      $('#live-seek').on("mouseup", ()=> {
        this.seek = true;
      });
    }
    
    getSongTime() {
      var offset = 0;
      for(var i = 0; i < this.currentSongIndex; i++) {
        if(this.songs[i]["duration"]) {
          offset += this.songs[i]["duration"];
        }
      }
      return offset;
    }

  clickMute($event, elem) {
    $event.preventDefault();
    this.song.volume = 0;
    this.mute.hide();
    this.muted.show();
  }
  clickUnMute($event, elem) {
    $event.preventDefault();
    this.song.volume = 1;
    this.muted.hide();
    this.mute.show();
  }
  clickPause($event, elem) {
    $event.preventDefault();
    this.song.pause();
    this.pause.hide();
    this.play.show();
  }
  clickPlay($event, elem) {
    $event.preventDefault();
    if(this.songs.length == 0) {
      return
    }
    if(this.song.src != this.songs[this.currentSongIndex].url) {
      this.song.src = this.songs[this.currentSongIndex].url;
    }
    this.song.play();
    this.liveIcon.removeClass("ended");
    this.play.hide();
    this.pause.show();
    $('#live-seek').attr('max', this.duration);
    this.setDuration(this.durationContainer, this.duration);
  }
    val;
    offset;
  onChangeRange(elem) {
    this.val = $('#live-seek').val();
    let val:number = (parseInt($('#live-seek').val(), 10) - parseInt($('#live-seek').attr('min'), 10)) / (parseInt($('#live-seek').attr('max'), 10) - parseInt($('#live-seek').attr('min'), 10));
  
    $('#live-seek').css('background-image',
      '-webkit-gradient(linear, left top, right top, '
      + 'color-stop(' + val + ', #2A8CEA), '
      + 'color-stop(' + val + ', transparent)'
      + ')'
    );
    this.offset = 0;
    var index = 0;
    for(var i = 0; i < this.songs.length; i++) {
      if(this.val > this.offset) {
        index = i;
      }
      if(this.songs[i]["duration"]) {
        this.offset += this.songs[i]["duration"];
      }
    }
    if(index != this.currentSongIndex) {
      this.currentSongIndex = index;
      this.offset = this.getSongTime();
      this.song.src = this.songs[this.currentSongIndex].url;
      let self = this;
      this.readyAfterSeek = false;
      self.setCurrent(self.current, this.val);
      this.song.addEventListener('canplaythrough', function(){
        if(!self.readyAfterSeek) {
          self.readyAfterSeek = true;
          self.song.currentTime = self.val - self.offset;
          self.song.play();
          self.setCurrent(self.current, self.val);
        }
      }, false);
    } else {
      this.offset = this.getSongTime();
      this.song.currentTime = this.val - this.offset;
      let curtime = parseInt(this.song.currentTime.toString(), 10);
      this.setCurrent(this.current, curtime + this.offset);
    }
    if (this.song.currentTime + this.offset >= this.duration) {
      this.duration = this.song.currentTime;
      this.setDuration(this.durationContainer, this.duration);
      $('#live-seek').attr("max", this.duration);
    }
  }
    
  setDuration(durationContainer, duration) {
    durationContainer.html(this.formatTimecode(duration));
  }
  setCurrent(current, curtime) {
    current.html(this.formatTimecode(curtime));
  }
  
  formatTimecode(val) {
    let hours: string | number = Math.floor(val / 3600);
    hours = hours < 10 ? "0" + hours : hours;
    val %= 3600;
    let minutes: string | number = Math.floor(val / 60);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let seconds: string | number = val % 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }
}
