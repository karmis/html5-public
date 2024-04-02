import {
    Component, ViewChild, Input, ViewEncapsulation, ElementRef, ChangeDetectorRef
} from '@angular/core';

require('./plugins/html5slider');

import * as Hls from "./plugins/hls.min"

@Component({
  selector: 'simple-preview-player',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None
})

export class SimplePreviewPlayerComponent {

    constructor(private cdr: ChangeDetectorRef) {

    }

    @Input("srcs") public srcs: Array<any> = [
        // {s:'http://localhost:3000/assets/mock-data/1.1.Course Overview.mp4',d:[10, 30]},
        // {s:'http://localhost:3000/assets/mock-data/4 - UV.mp4',d:[35, 55]},
        // {s:'http://localhost:3000/assets/mock-data/1.1.Course Overview.mp4',d:[30, 60]},
        // {s:'http://localhost:3000/assets/mock-data/4 - UV.mp4',d:[55, 85]}
    ];
    @ViewChild('previewPlayerWrapper', {static: false}) private previewPlayerWrapper: ElementRef;
    @ViewChild('timelineArea', {static: false}) private timelineArea: ElementRef;
    @ViewChild('timelineFill', {static: false}) private timelineFill: ElementRef;
    @ViewChild('timelineSeek', {static: false}) private timelineSeek: ElementRef;
    @ViewChild('playerOverlay', {static: false}) private playerOverlay: ElementRef;
    private players = [];
    private currentIndex = 0;
    private currentTime = 0;
    private totalDuration = 0;
    private readyCounter = 0;
    private seek = false;
    private lastDurationPersent = 0;

    public cleanPlayers() {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i]) {
                if (this.players[i].type == 1) {
                    this.players[i].mediaPlayer.pause();
                    this.players[i].dom.remove();
                }
                else {
                    this.players[i].dom.get(0).pause();
                    this.players[i].dom.remove();
                }
            }
        }
        this.players = [];
        this.currentIndex = 0;
        this.currentTime = 0;
        this.totalDuration = 0;
        this.readyCounter = 0;
        this.seek = false;
        $(this.timelineSeek.nativeElement).val(0);
        $(this.timelineSeek.nativeElement).attr("value", 0);
        $(this.timelineFill.nativeElement).attr("style", "width:" + 0 + "%");
        $(".tl-file-buf").remove();
        $(".tl-file-end").remove();
    }

    smoothStreamingPlayerInstance: any;

    public updatePlayer() {
        this.cleanPlayers();
        let self = this;
        let hasMediaPlayer = require('../simple.preview.player/plugins/hasplayer.min.js');
        //this.srcs = [
            // {
            //     s: 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest',
            //     d: [60, 80]
            // },
            // {s: 'http://localhost:3000/assets/mock-data/1.1.Course Overview.mp4', d: [30, 60]},
            // {
            //     s: 'http://yt-dash-mse-test.commondatastorage.googleapis.com/media/car-20120827-manifest.mpd',
            //     d: [10, 40]
            // },
            // {s: 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8', d: [10, 40]},
            // {s: 'http://localhost:3000/assets/mock-data/4 - UV.mp4', d: [55, 85]}
        //];

        for (var i = 0; i < this.srcs.length; i++) {
            this.srcs[i].s = encodeURI(this.srcs[i].s.trim());
            var newPlayer = {
                dom: $('<video muted preload playsinline="playsinline" srcindex="' + i + '" src="' + this.srcs[i].s + '#t=' + this.srcs[i].d[0] + ',' + this.srcs[i].d[1] + '"></video>'),
                type: this.srcs[i].s.indexOf("ism/Manifest") > -1 || this.srcs[i].s.indexOf(".mpd") > -1 ? 1 : 0,
                mediaPlayer: null
            };
            this.players.push(newPlayer);
            this.totalDuration += this.srcs[i].d[1] - this.srcs[i].d[0];
            $(this.previewPlayerWrapper.nativeElement).append(this.players[i].dom);
            if (i == 0) {
                $(this.players[i].dom).attr("style", "z-index: 1");
            }
            else {
                $(this.players[i].dom).attr("style", "z-index: -1");
            }
            this.buildEventListeners(this.players[i], this.srcs[i], hasMediaPlayer, true);
        }
        $(this.timelineSeek.nativeElement).attr("max", this.totalDuration);
        $(this.timelineSeek.nativeElement).val(0);
        $(this.timelineSeek.nativeElement).attr("value", 0);
        var prevDuration = 0;
        for (var i = 0; i < this.srcs.length; i++) {
            if (i < this.srcs.length - 1) {
                var buf = $('<div class="tl-file-buf" id="buffered-amount-' + i + '" style="left:' + prevDuration + '%"></div>');
                $(this.timelineArea.nativeElement).append(buf);
                var left = prevDuration + (this.srcs[i].d[1] - this.srcs[i].d[0]) / this.totalDuration * 100;
                prevDuration = left;
                var sep = $('<div class="tl-file-end" style="left:' + left + '%"></div>');
                $(this.timelineArea.nativeElement).append(sep);
            }
        }

        if (this.players[0].type == 1) {
            this.players[0].mediaPlayer.seek(this.srcs[0].d[0]);
        }
        else {
            this.players[0].dom.get(0).currentTime = this.srcs[0].d[0];
        }
    }

    buildEventListeners(player, src, hasMediaPlayer, withPlay = false) {
        let self = this;
        if (player.type == 1) {
            console.log("DEFAULT");
            this.smoothStreamingPlayerInstance = new hasMediaPlayer(new hasMediaPlayer.di.Context());
            this.smoothStreamingPlayerInstance.init($(player.dom)[0]);
            this.smoothStreamingPlayerInstance.setAutoPlay(false);// if autoplay == false, player will not load metadata and will not show duration and first frame
            this.smoothStreamingPlayerInstance.setParams({
                "ManifestLoader.RetryAttempts": 0,
                "ManifestLoader.RetryInterval": 0,
                "backoffSeekToEnd": 0
            });

            this.smoothStreamingPlayerInstance.eventBus.addEventListener("error", (err) => {
                if (err.data) {
                    console.log(err);
                }
            })
            player.mediaPlayer = this.smoothStreamingPlayerInstance;
            player.mediaPlayer.addEventListener("timeupdate", (e) => {
                self.togglePlayer();
                self.toggleLoaderOnPlayers(false);
            });

            player.mediaPlayer.addEventListener('state_changed', (event) => {
                if (event.detail.state == "playing") {
                    self.toggleLoaderOnPlayers(false);
                }
                else if (event.detail.state == "buffering") {
                    self.toggleLoaderOnPlayers(true);
                }
            });
            player.mediaPlayer.addEventListener('loadstart', (event) => {
                if(self.firstPlay && src.s.indexOf(".mpd") ) {
                    self.toggleLoaderOnPlayers(false);
                }
                else {
                    self.toggleLoaderOnPlayers(true);
                }
            });

            player.mediaPlayer.addEventListener('canplay', (event) => {
                self.toggleLoaderOnPlayers(false);
                self.updateSubsList();
                if(self.firstPlay) {
                    self.play(false);
                }
            });

            this.smoothStreamingPlayerInstance.load({
                url: src.s
            });
        }
        else {
            console.log("HLS");
            if (src.s.indexOf(".m3u8") > -1 && Hls.isSupported()) {
                var hlsMedia = new Hls();
                hlsMedia.loadSource(src.s);
                hlsMedia.attachMedia($(player.dom)[0]);
            }
            $(player.dom).on('timeupdate', (e) => {
                self.togglePlayer();
                self.toggleLoaderOnPlayers(false);
            })

            $(player.dom).on('FRAG_BUFFERED', (event) => {
                self.toggleLoaderOnPlayers(false);
            });
            $(player.dom).on('FRAG_LOADED', (event) => {
                self.toggleLoaderOnPlayers(true);
            });
            $(player.dom).on('FRAG_LOADING', (event) => {
                self.toggleLoaderOnPlayers(true);
            });
            $(player.dom).on('LEVEL_LOADING', (event) => {
                self.toggleLoaderOnPlayers(true);
            });

            $(player.dom).on('onwaiting', (event) => {
                self.toggleLoaderOnPlayers(true);
            });

            $(player.dom).on('canplay', (event) => {
                self.toggleLoaderOnPlayers(false);
                self.updateSubsList();
            });
        }
    }

    toggleLoaderOnPlayers(show) {
        if (show) {
            $(this.playerOverlay.nativeElement).show();
        }
        else {
            $(this.playerOverlay.nativeElement).hide();
        }
    }

    processTime() {
        if (this.players[this.currentIndex]) {
            var curDuration = 0;
            var curDurationPercent = 0;
            for (var i = 0; i <= this.currentIndex; i++) {
                if (i < this.currentIndex) {
                    var leftPercent = curDurationPercent + (this.srcs[i].d[1] - this.srcs[i].d[0]) / this.totalDuration * 100;
                    var d = curDuration + (this.srcs[i].d[1] - this.srcs[i].d[0]);
                }
                else {
                    if (this.players[this.currentIndex].type == 1) {
                        var leftPercent = curDurationPercent + (this.players[this.currentIndex].mediaPlayer.getPosition() - this.srcs[i].d[0] ) / this.totalDuration * 100;
                        var d = curDuration + (this.players[this.currentIndex].mediaPlayer.getPosition() - this.srcs[i].d[0] );
                    }
                    else {
                        var leftPercent = curDurationPercent + (this.players[this.currentIndex].dom.get(0).currentTime - this.srcs[i].d[0] ) / this.totalDuration * 100;
                        var d = curDuration + (this.players[this.currentIndex].dom.get(0).currentTime - this.srcs[i].d[0] );
                    }
                }
                curDurationPercent = (leftPercent < 100) ? leftPercent : 100;
                curDuration = d;
            }
            if (!this.seek) {
                $(this.timelineSeek.nativeElement).val(curDuration);
                $(this.timelineSeek.nativeElement).attr("value", curDuration);
            }
            $(this.timelineFill.nativeElement).attr("style", "width:" + curDurationPercent + "%");
            this.lastDurationPersent = curDurationPercent;
        }
    }

    togglePlayer() {
        if (this.players[this.currentIndex] && this.players[this.currentIndex].type == 1 && this.players[this.currentIndex].mediaPlayer.getPosition() >= this.srcs[this.currentIndex].d[1]) {
            $(this.players[this.currentIndex].dom).attr("style", "z-index: -1");
            this.players[this.currentIndex].mediaPlayer.setMute(false);
            this.pause();
            if (this.currentIndex < this.srcs.length - 1) {
                this.currentIndex++;
                if (this.players[this.currentIndex].type == 1) {
                    this.players[this.currentIndex].mediaPlayer.seek(this.srcs[this.currentIndex].d[0]);
                }
                else {
                    this.players[this.currentIndex].dom.get(0).currentTime = this.srcs[this.currentIndex].d[0];
                }
                this.play(true);
            }
        }
        else if (this.players[this.currentIndex] && this.players[this.currentIndex].dom.get(0).currentTime >= this.srcs[this.currentIndex].d[1]) {
            $(this.players[this.currentIndex].dom).attr("style", "z-index: -1");
            this.players[this.currentIndex].dom.get(0).muted = true;
            this.pause();
            if (this.currentIndex < this.srcs.length - 1) {
                this.currentIndex++;
                this.players[this.currentIndex].dom.get(0).currentTime = this.srcs[this.currentIndex].d[0];
                this.play(true);
            }
        }
        this.processTime();
    }

    freezeChange(e) {
        this.seek = true;
    }

    onClickRange(e) {
        this.toggleLoaderOnPlayers(true);
        this.currentTime = $(this.timelineSeek.nativeElement).val();
        var dur = 0;
        for (var i = 0; i < this.srcs.length; i++) {
            var d = dur + (this.srcs[i].d[1] - this.srcs[i].d[0]);
            if (d >= this.currentTime && this.currentTime >= dur) {
                if (this.currentIndex == i) {
                    if (this.players[this.currentIndex].type == 1) {
                        this.players[this.currentIndex].mediaPlayer.seek(this.srcs[i].d[0] + (this.currentTime - dur));
                        this.players[this.currentIndex].mediaPlayer.play();
                    }
                    else {
                        this.players[this.currentIndex].dom.get(0).currentTime = this.srcs[i].d[0] + (this.currentTime - dur);
                    }
                }
                else {
                    if (this.players[this.currentIndex].type == 1) {
                        this.players[this.currentIndex].mediaPlayer.setMute(true);
                        this.players[this.currentIndex].mediaPlayer.pause();
                    }
                    else {
                        this.players[this.currentIndex].dom.get(0).muted = true;
                        this.players[this.currentIndex].dom.get(0).pause();
                    }

                    $(this.players[this.currentIndex].dom).attr("style", "z-index: -1");
                    this.currentIndex = i;
                    this.updateSubsList();
                    if (this.players[this.currentIndex].type == 1) {
                        this.players[this.currentIndex].mediaPlayer.seek(this.srcs[i].d[0] + (this.currentTime - dur));
                        this.players[this.currentIndex].mediaPlayer.setMute(false);
                        this.players[this.currentIndex].mediaPlayer.play();
                    }
                    else {
                        this.players[this.currentIndex].dom.get(0).currentTime = this.srcs[i].d[0] + (this.currentTime - dur);
                        this.players[this.currentIndex].dom.get(0).muted = false;
                        this.players[this.currentIndex].dom.get(0).play();
                    }

                    $(this.players[this.currentIndex].dom).attr("style", "z-index: 1");
                }
                break;
            }
            dur = d;
        }
        this.seek = false;
    }

    private firstPlay = true;


    private subsShowed = false;
    private tracksList = [];
    toggleSubsList() {
        this.subsShowed = !this.subsShowed;
    }
    updateSubsList() {
        this.tracksList = [];
        //if (this.players[this.currentIndex].type == 1) {

        //}
        //else {
            for (var i = 0; i < this.players.length; i++) {
                this.tracksList.push([]);
                for (var j = 0; j < this.players[i].dom.get(0).textTracks.length; j++) {
                    this.tracksList[i].push(this.players[i].dom.get(0).textTracks[j]);
                }
            }
            debugger;
        //}
    }
    setSubs(lang) {
        this.subsShowed = false;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].type == 1) {
                this.players[i].mediaPlayer.enableSubtitles(true);
            }
            else {
                for (var j = 0; j < this.players[i].dom.get(0).textTracks.length; j++) {
                    if (this.players[i].dom.get(0).textTracks[j].language == lang) {
                        if(this.players[i].dom.get(0).textTracks[j].mode == 'showing') {
                            this.tracksList[i][j].mode =  'hidden';
                            this.players[i].dom.get(0).textTracks[j].mode = 'hidden';
                        }
                        else {
                            this.tracksList[i][j].mode =  'hidden';
                            this.players[i].dom.get(0).textTracks[j].mode = 'showing';
                        }

                    }
                    else {
                        this.tracksList[i][j].mode =  'hidden';
                        this.players[i].dom.get(0).textTracks[j].mode = 'hidden';
                    }
                }
            }
        }
    }
    private playbackRate = 1;
    speed(positive) {
        var update = true;
        if(positive) {
            this.playbackRate += 0.5;
            if(this.playbackRate > 2) {
                this.playbackRate = 2;
                update = false;
            }
        }
        else {
            this.playbackRate -= 0.5;
            if(this.playbackRate < 0.5) {
                this.playbackRate = 0.5;
                update = false;
            }
        }
        if(update)
            for (var i = 0; i < this.players.length; i++) {
                if (this.players[i].type == 1) {
                    this.players[i].mediaPlayer.setTrickModeSpeed(this.playbackRate);
                }
                else {
                    this.players[i].dom.get(0).playbackRate = this.playbackRate;
                }
            }
    }

    play(fromToggle = false) {
        this.toggleLoaderOnPlayers(true);
        if (!fromToggle) {
            if (this.lastDurationPersent < 100) {
                $(this.players[this.currentIndex].dom).attr("style", "z-index: 1");
                if (this.players[this.currentIndex].type == 1) {
                    if (this.firstPlay) {
                        this.firstPlay = false;
                        this.players[this.currentIndex].mediaPlayer.seek(this.srcs[this.currentIndex].d[0]);
                    }

                    this.players[this.currentIndex].mediaPlayer.setMute(false);
                    this.players[this.currentIndex].mediaPlayer.play();
                }
                else {
                    if (this.firstPlay) {
                        this.firstPlay = false;
                        this.players[this.currentIndex].dom.get(0).currentTime = this.srcs[this.currentIndex].d[0];
                    }

                    this.players[this.currentIndex].dom.get(0).muted = false;
                    this.players[this.currentIndex].dom.get(0).play();
                }

            } else {
                this.restart();
            }
        }
        else {
            if (this.players[this.currentIndex].type == 1) {
                this.players[this.currentIndex].mediaPlayer.seek(this.srcs[this.currentIndex].d[0]);
                this.players[this.currentIndex].mediaPlayer.setMute(false);
                this.players[this.currentIndex].mediaPlayer.play();
            }
            else {
                this.players[this.currentIndex].dom.get(0).currentTime = this.srcs[this.currentIndex].d[0];
                this.players[this.currentIndex].dom.get(0).muted = false;
                this.players[this.currentIndex].dom.get(0).play();
            }
            $(this.players[this.currentIndex].dom).attr("style", "z-index: 1");
        }
    }

    pause() {
        if (this.players[this.currentIndex].type == 1) {
            this.players[this.currentIndex].mediaPlayer.pause();
        }
        else {
            this.players[this.currentIndex].dom.get(0).pause();
        }
    }

    restart() {
        if (this.players[this.currentIndex].type == 1) {
            this.players[this.currentIndex].mediaPlayer.setMute(true);
            this.players[this.currentIndex].mediaPlayer.pause();
        }
        else {
            this.players[this.currentIndex].dom.get(0).muted = true;
            this.players[this.currentIndex].dom.get(0).pause();
        }

        $(this.players[this.currentIndex].dom).attr("style", "z-index: -1");
        this.currentIndex = 0;
        this.updateSubsList();
        if (this.players[this.currentIndex].type == 1) {
            this.players[this.currentIndex].mediaPlayer.seek(this.srcs[this.currentIndex].d[0]);
            this.players[this.currentIndex].mediaPlayer.setMute(false);
            this.players[this.currentIndex].mediaPlayer.play();
        }
        else {
            this.players[this.currentIndex].dom.get(0).currentTime = this.srcs[this.currentIndex].d[0];
            this.players[this.currentIndex].dom.get(0).muted = false;
            this.players[this.currentIndex].dom.get(0).play();
        }

        $(this.players[this.currentIndex].dom).attr("style", "z-index: 1");
    }
}
