import {
    AfterViewInit,
    ChangeDetectorRef,
    Component, ComponentRef, ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    NgZone
} from '@angular/core';
import * as Hls from '../../modules/controls/simple.preview.player/plugins/hls.min'
import * as $ from 'jquery';
import { ConfidenceMonitoringService } from './services/confidence.monitoring.service';
import { IMFXModalComponent } from '../../modules/imfx-modal/imfx-modal';
import { PagesModalComponent } from './comps/pages.modal/pages.modal';
import { IMFXModalEvent } from '../../modules/imfx-modal/types';
import { IMFXModalProvider } from '../../modules/imfx-modal/proivders/provider';
import { lazyModules } from '../../app.routes';
import { Location } from '@angular/common';
import { NotificationService } from '../../modules/notification/services/notification.service';
import { takeUntil } from 'rxjs/operators';
import { SettingsGroupsService } from '../../services/system.config/settings.groups.service';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { HelperProvider } from '../../modules/controls/html.player/providers/helper.provider';

@Component({
    selector: 'confidence-monitoring',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    host: {
        '(window:resize)': 'onResize()',
    },
    providers: [
        ConfidenceMonitoringService,
        HelperProvider
    ],
    encapsulation: ViewEncapsulation.None
})

export class ConfidenceMonitoringComponent implements AfterViewInit, OnDestroy, OnInit {
    @ViewChild('playerOverlay', {static: false}) private playerOverlay: ElementRef;
    @ViewChild('ConfidenceMonitoring', {static: false}) private confidenceMonitoring: ElementRef;
    private players = [];
    private inited = false;
    private videoArray = []; // two-level array of players for template
    private screen_w = 0;
    private screen_h = 0;
    private destroyed$: Subject<any> = new Subject();
    private audio_bar_w = 30;
    private srcsUpdateInterval;
    private srcsUpdateIntervalTime = 15000 // 10 sec;
    private pageDevicesIds = [];

    constructor(public location: Location,
                protected notificationRef: NotificationService,
                protected modalProvider: IMFXModalProvider,
                private settingsGroupsService: SettingsGroupsService,
                private cdr: ChangeDetectorRef,
                private service: ConfidenceMonitoringService,
                private helperProvider: HelperProvider,
                private zone: NgZone) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.settingsGroupsService.getSettingsUserById('confidenceFeedSettings').pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            if (res && res.length > 0) {
                if (res[0].DATA) {
                    const pages = JSON.parse(res[0].DATA);
                    if (pages != null && pages.length !== 0) {
                        this.showPagesModal(pages);
                    } else {
                        this.notificationRef.notifyShow(2, 'Confidence monitoring settings not set');
                    }
                }
            }
        });

        $('.confidence-monitoring-wrapper').bind('contextmenu', function (e) {
            e.preventDefault();
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.clearUpdateSrcsInterval();
        this.cleanPlayers();
    }

    /**
     * modal to select page to display videos
     */
    showPagesModal(pages) {
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.confidence_monitoring_pages_modal, PagesModalComponent, {
            title: 'confidence-monitoring.select_page_modal',
            size: 'sm',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {
            pageNumbers: pages.map(page => {
                return page.pageName
            })
        });
        modal.load().then((cr: ComponentRef<PagesModalComponent>) => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    this.pageDevicesIds = pages[e.state.pageNumber].devices;
                    this.service.getVideoUrls(this.pageDevicesIds).subscribe(res => {
                        // res = [res[0]];
                        if (res.length == 0) {
                            this.notificationRef.notifyShow(2, 'There are no videos to show');
                            return;
                        }
                        // ---test data---
                        // res.push({
                        //     // ProxyUrl: 'http://192.168.90.39/SanMedia/MX161833/line2-F1%20to%20F2.mp4',
                        //     ProxyUrl: 'http://192.168.90.39/tempupload/1e8c27cd-05ce-4eca-a0af-7af2ae268716/27536.mp4',
                        //     Title: 'Title',
                        //     DeviceId: 123,
                        //     AspectRatio: "4:3"
                        // });
                        // res.push({
                        //     ProxyUrl: 'http://192.168.90.39/proxy_testing/Senate HLS/2nd richard send - Senate LiveCapture HLS three 5 minute chunks last chunk open aka live/WebTeam 15m 3chk At 5m Each/Z0697536/Z0697536.m3u8',
                        //     Title: 'Title2',
                        //     DeviceId: 321,
                        //     AspectRatio: "16:9"
                        // });
                        // res.push({
                        //     ProxyUrl: 'http://192.168.90.39/SanMedia/Proxy/Z0700272/Z0700272.m3u8',
                        //     Title: 'Title3',
                        //     DeviceId: 456,
                        //     AspectRatio: "16:9"
                        // });
                        // res.push({
                        //     ProxyUrl: 'http://192.168.90.39/proxy_testing/fred24.wav',
                        //     Title: 'Title4',
                        //     DeviceId: 654,
                        //     AspectRatio: "16:9"
                        // });
                        this.players = res.map((el, ind) => {
                            return {
                                url: el.ProxyUrl,
                                deviceId: this.pageDevicesIds[ind],
                                title: el.Title,
                                aspect: {
                                    w: el.AspectRatio.split(':')[0],
                                    h: el.AspectRatio.split(':')[1]
                                },
                                type: (this.helperProvider.checkFileType('wav', el.ProxyUrl) ||
                                    this.helperProvider.checkFileType('ogg', el.ProxyUrl) ||
                                    this.helperProvider.checkFileType('mp3', el.ProxyUrl)) ? 'audio' : 'video',
                                dom: null,
                                mediaPlayer: null,
                                isPlaying: false,
                                source: null,
                                canvasCtx: null,
                                bufferLengthAltL: null,
                                bufferLengthAltR: null,
                                gainNode: null,
                                drawVisual: null,
                                analyser1: null,
                                analyser2: null
                            }
                        });
                        this.buildLayout(this.players);
                        this.players.forEach((pl, i) => {
                            pl.dom = $('#video_' + i);
                        });
                        this.players.forEach((pl, i) => {
                            this.buildEventListeners(this.players[i], this.players[i].url, i, false, true);
                        });

                        setTimeout(() => {
                            this.players.forEach((player, i) => {
                                this.createSoundBar(player, i);
                            });
                            this.onResize();
                            this.inited = true;
                        }, 1000);

                        this.setUpdateSrcsInterval();
                    });
                }
                if (e.name === 'hide') {
                    // modal.hide();
                    this.location.back();
                }
            });
        });
    }

    /**
     * build EventListeners for video
     */
    buildEventListeners(player, src, idx, isLive, withPlay = false) {
        const self = this;
        var idx = idx;
        if (src && src.indexOf('.m3u8') > -1 && Hls.isSupported()) {
            const hlsMedia = new Hls({
                debug: false,
                // startPosition: 0,
                autoStartLoad: false
            });

            hlsMedia.loadSource(src);
            hlsMedia.attachMedia($(player.dom)[0]);
            if (/*(idx == 0 || idx == 1 || (isLive && idx == self.srcs.length - 1)) && */!player.loadStarted) {
                player.loadStarted = true;
                hlsMedia.startLoad();
            }
            player.mediaPlayer = hlsMedia;
            // player.dom.get(0).muted = true;
        }

        $(player.dom).on('ended', () => {
            console.log('The video has ended');
            player.isPlaying = false;
        });

        this.loadingFlags[idx] = false;
        $(player.dom).on('waiting', () => {
            // console.log('waiting ' + idx);
            self.loadingFlags[idx] = true;
            self.cdr.detectChanges();
        });
        $(player.dom).on('canplaythrough', () => {
            // console.log('canplaythrough ' + idx);
            self.loadingFlags[idx] = false;
            self.cdr.detectChanges();
        });

        // hlsMedia && hlsMedia.on(Hls.Events.BUFFER_APPENDED, (event, data) => {
        //     this.drawBuffering(this.currentIndex);
        // });
        // hlsMedia && hlsMedia.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        //     if (!self.isLive) return;
        //     let levelDuration = data.details.totalduration + data.details.fragments[0].start;
        //     self.srcs[idx].d[1] = levelDuration;
        //     self.totalDuration = 0;
        //     let hasZeroDur = false;
        //     for (var i = 0; i < self.players.length; i++) {
        //         if (self.srcs[i].d[1] <= 0) {
        //             hasZeroDur = true;
        //         }
        //         if (idx !== i) {
        //             self.totalDuration += self.srcs[i].d[1];
        //         } else {
        //             self.totalDuration += levelDuration;
        //         }
        //         $(self.players[i].dom).attr("totalDuration", self.totalDuration);
        //     }
        //
        //     if (!hasZeroDur && this.firstPlayerReadyEvent) {
        //         this.firstPlayerReadyEvent = false;
        //         $(this.timelineSeek.nativeElement).attr("max", this.totalDuration);
        //         this.clipsProvider.playerReady.next(true);
        //         $(this.players[0].dom).css("z-index", "1");
        //         this.playerReady.next(true);
        //     }
        // });
        if ($(player.dom)[0]) {
            this._buildEventListeners($(player.dom)[0], idx);
        }
        this.debugArr.push(true);
    }

    // (click)="debug(i,j,src)"
    private debugArr = [];

    private debug(i,j,src){
        const index = i*3 + j;
        const pl = this.players[index].dom.get(0)
        if (!pl) {
            return;
        }
        console.log('player: '+ index, 'state: '+ this.players[index].dom.get(0).readyState);
        // this.debugArr[index] = !this.debugArr[index];
    }

    private _buildEventListeners(video, idx) {
        const self = this;
        const _w = window as any;
        _w.debugTMD = true;

        video.addEventListener("progress", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx, 'state: ' + video.readyState, 'progress handler, tc: ' + new Date().getTime().toString());
        }, false);

        video.addEventListener("abort", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'abort handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("canplay", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'canplay handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("canplaythrough", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'canplaythrough handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("canplaythrough", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'canplaythrough handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("durationchange", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'durationchange handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("emptied", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'emptied handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("ended", (event) => {
            _w .debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'ended handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("error", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'error handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("loadeddata", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'loadeddata handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("loadedmetadata", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'loadedmetadata handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("loadstart", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'loadstart handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("pause", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'pause handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("play", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'play handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("playing", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'playing handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("ratechange", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'ratechange handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("seeked", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'seeked handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("seeking", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'seeking handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("stalled", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'stalled handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("suspend", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'suspend handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("timeupdate", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'timeupdate handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("volumechange", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'volumechange handler, tc: ' + new Date().getTime().toString());
        }, false);
        video.addEventListener("waiting", (event) => {
            _w.debugTMD && this.debugArr[idx] && console.log('player: '+ idx , 'state: ' + video.readyState, 'waiting handler, tc: ' + new Date().getTime().toString());
        }, false);

    }

    loadingFlags = [];

    isVisibleLoading(i, j) {
        const index = (this.videoArray.length > 1)
            ? (i * this.videoArray[0].src.length + j)
            : j;
        return this.loadingFlags[index] && this.players[index].url;
    }

    /**
     * update interval - update video src, find new records for existing players
     */
    setUpdateSrcsInterval() {
        this.zone.runOutsideAngular(() => {
            this.clearUpdateSrcsInterval();
            const self = this;
            this.srcsUpdateInterval = setInterval(function () {
                const deviceIds = [];
                self.players.forEach(pl => {
                    // if (!pl.isPlaying || pl.dom.get(0).readyState == 0) {
                    // if (!pl.isPlaying) {
                    deviceIds.push(pl.deviceId);
                    // }
                });
                if (deviceIds.length == 0) { // nothing to update - all players play
                    console.log('Nothing to update - all players play')
                    return;
                }
                self.service.getVideoUrls(deviceIds).subscribe(res => {
                    deviceIds.forEach((device, ind) => {
                        const oldSrc = self.players.filter(pl => {
                            return pl.deviceId === device;
                        })[0];
                        const newSrc = res.filter(src => {
                            return src.DeviceId === device;
                        })[0];
                        if (oldSrc && newSrc &&
                            newSrc.ProxyUrl !== null &&
                            newSrc.ProxyUrl !== '' &&
                            (!oldSrc.isPlaying ||
                                !self.isMatchManifest(oldSrc.url, newSrc.ProxyUrl) &&
                                oldSrc.url !== newSrc.ProxyUrl)) {
                            if (oldSrc.url !== '' && oldSrc.url !== null) { // rebuild video tag, if something has played before
                                self.updatePlayerUrl(device, newSrc, true);
                            } else {
                                self.updatePlayerUrl(device, newSrc, false);
                            }
                            console.log('Get new URL. Update player', ind);
                        } else {
                            console.log('No new URL')
                        }
                    })
                });
            }, this.srcsUpdateIntervalTime);
        });
    }

    isMatchManifest(oldUrl, newUrl) {
        if (!oldUrl || !newUrl) {
            return false;
        }

        if (!oldUrl.includes('.m3u8') || !newUrl.includes('.m3u8')) {
            return false;
        }

        const oldInd = oldUrl.indexOf('.m3u8');
        const newInd = newUrl.indexOf('.m3u8');

        if (oldUrl.substr(0, oldInd + 5) === newUrl.substr(0, newInd + 5)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * update one player when get new Url
     */
    updatePlayerUrl(deviceId, newSrc, withPlayerRebuild: boolean = false) {
        const self = this;
        this.players.forEach((pl, ind) => {
            if (pl.deviceId == deviceId) {
                pl.url = newSrc.ProxyUrl;
                pl.title = newSrc.Title;
                pl.aspect = {
                    w: newSrc.AspectRatio.split(':')[0],
                    h: newSrc.AspectRatio.split(':')[1]
                };
                pl.type = (this.helperProvider.checkFileType('wav', newSrc.ProxyUrl) ||
                    this.helperProvider.checkFileType('ogg', newSrc.ProxyUrl) ||
                    this.helperProvider.checkFileType('mp3', newSrc.ProxyUrl)) ? 'audio' : 'video';
                pl.isPlaying = false;
                pl.source = null;
                pl.canvasCtx = null;
                pl.bufferLengthAltL = null;
                pl.bufferLengthAltR = null;
                pl.gainNode = null;
                pl.drawVisual = null;
                pl.analyser1 = null;
                pl.analyser2 = null;

                if (withPlayerRebuild) { // case: <video> has src befor and will have new src. This is hack for Chrome, because Chrome can't recreate createMediaElementSource on the same video tag
                    const oldPl = {
                        dom: pl.dom,
                        mediaPlayer: pl.mediaPlayer,
                        audioCtx: pl.audioCtx
                    };
                    pl.mediaPlayer = null;
                    pl.audioCtx = null;
                    pl.loadStarted = false;

                    $('#video_wrapper_' + ind).width($(oldPl.dom).width());
                    $('#video_wrapper_' + ind + '>video:not(:last-child)').remove(); // exclude excess video tags
                    $('#video_wrapper_' + ind + '>video').removeClass('absolute');
                    // $('#video_wrapper_' + ind + '>video').removeClass('absolute-priority');

                    const video = '<video preload="metadata" class="demo-video" playsinline="playsinline" srcindex="' + ind + '" src="' + pl.url + '" id="video_' + ind + '" class="demo-video ' + (pl.type == 'audio' ? 'audio-player' : '') + '"></video>';
                    pl.dom = $(video);

                    $('#video_wrapper_' + ind).append(pl.dom);
                    $(pl.dom).addClass('absolute');
                    $(pl.dom).addClass('left-outdoor');

                    this.buildEventListeners(pl, pl.url, ind, false, true);
                    self.onResize();

                    self.concatPlayers(oldPl, pl, ind);
                } else {
                    if (pl.mediaPlayer) {
                        pl.mediaPlayer.destroy();
                    }
                    pl.mediaPlayer = null;

                    if (pl.audioCtx) {
                        pl.audioCtx.close();
                    }
                    pl.audioCtx = null;

                    this.videoArray.forEach(row => {
                        for (let i = 0; i < row.src.length; i++) {
                            if (row.src[i].deviceId == pl.deviceId) {
                                row.src[i].title = pl.title;
                                row.src[i].type = pl.type;
                                row.src[i].url = pl.url;
                            }
                        }
                        ;
                    });
                    this.cdr.detectChanges();
                    pl.dom = $('#video_' + ind);
                    this.buildEventListeners(pl, pl.url, ind, false, true);
                    this.createSoundBar(pl, ind);
                    this.onResize();
                }
            }
        });
    }

    concatPlayers(oldPl, pl, ind) {
        const self = this;

        const canplaythrough_listener = function (e) {
            console.log('remove player');

            pl.dom.get(0).play().then(() => {
                setTimeout(() => {
                    pl.dom.get(0).currentTime = oldPl.dom.get(0).currentTime;
                    const canplaythrough_listener2 = function (e) {
                        setTimeout(() => {
                            $(pl.dom).removeClass('left-outdoor');
                            oldPl.dom.remove();
                            setTimeout(() => {
                                $(pl.dom).removeClass('absolute');
                                if (oldPl.mediaPlayer) {
                                    oldPl.mediaPlayer.destroy();
                                }

                                if (oldPl.audioCtx) {
                                    oldPl.audioCtx.close();
                                }
                            }, 1000);
                        });
                        pl.dom.off('canplaythrough', canplaythrough_listener2);
                    };
                    pl.dom.on('canplaythrough', canplaythrough_listener2);
                }, 5000);
            });

            self.createSoundBar(pl, ind);
            pl.dom.off('canplaythrough', canplaythrough_listener);
        };
        pl.dom.on('canplaythrough', canplaythrough_listener);
    }

    /**
     * clear interval for updating srcs (urls)
     */
    clearUpdateSrcsInterval() {
        if (this.srcsUpdateInterval) {
            clearInterval(this.srcsUpdateInterval);
            delete this.srcsUpdateInterval;
        }
    }

    /**
     * show/hide player loader
     */
    toggleLoaderOnPlayers(show) {
        if (show) {
            $(this.playerOverlay.nativeElement).show();
        } else {
            $(this.playerOverlay.nativeElement).hide();
        }
    }

    /**
     * player play/pause // for develop
     */
    togglePause(ind) {
        const self = this;
        if (this.players[ind].isPlaying) {
            this.players[ind].dom.get(0).pause();
            this.players[ind].isPlaying = false;
            this.players[ind].audioCtx.suspend().then(function () {
                console.log('Resume context');
            });
        } else {
            this.players[ind].dom.get(0).play();
            this.players[ind].isPlaying = true;
            this.players[ind].audioCtx.resume().then(function () {
                self.vizvisualizationAudio(self.players[ind]);
                console.log('Suspend context');
            });
        }
    }

    stopAllPlayers() {
        this.players.forEach((pl, i) => {
            pl.dom.get(0).pause();
            pl.isPlaying = false;
            pl.audioCtx.suspend().then(function () {
                console.log('Resume context');
            });
        })
    }

    startAllPlayers() {
        const self = this;
        this.players.forEach((pl, i) => {
            pl.dom.get(0).play();
            pl.isPlaying = true;
            pl.audioCtx.resume().then(function () {
                self.vizvisualizationAudio(pl);
                console.log('Suspend context');
            });
        })
    }

    /**
     * init vertical audio bars for all players
     */
    initAudioBars() {
        this.players.forEach((player, i) => {
            this.createSoundBar(player, i);
        });
        this.inited = true;
    }

    /**
     * create vertical audio bars for single player
     */
    createSoundBar(player, i) {
        if (!player.dom.get(0))
            return;
        player.dom.get(0).play();
        player.isPlaying = true;
        // -------------------------------
        const canvas = $('#canvas_' + i)[0];
        player.canvasCtx = (canvas as any).getContext('2d');
        const h = player.dom.height();

        player.canvasCtx.canvas.setAttribute('height', h + '');
        player.canvasCtx.canvas.style.height = h + 'px';
        player.canvas_height = h;
        player.canvas_width = (canvas as any).width;
        // -------------------------------
        player.audioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        if (player.source == undefined || player.source == null) {
            player.source = player.audioCtx.createMediaElementSource(player.dom.get(0));
            player.splitter = player.audioCtx.createChannelSplitter(2),
                player.analyser1 = player.audioCtx.createAnalyser();
            player.analyser2 = player.audioCtx.createAnalyser();
            player.analyser1.smoothingTimeConstant = 0.85;
            player.analyser2.smoothingTimeConstant = 0.85;

            player.gainNode = player.audioCtx.createGain();

            player.source.connect(player.splitter);
            player.splitter.connect(player.analyser1, 0, 0);
            player.splitter.connect(player.analyser2, 1, 0);

            player.analyser1.connect(player.gainNode);
            player.analyser2.connect(player.gainNode);

            player.gainNode.connect(player.audioCtx.destination);

            player.analyser1.fftSize = 256;
            player.analyser2.fftSize = 256;
            player.gainNode.gain.value = 0;
        }
        this.vizvisualizationAudio(player);
    }

    /**
     * audio bar visualization - draw on canvas
     */
    vizvisualizationAudio(player) {
        player.bufferLengthAltL = player.analyser1.frequencyBinCount;
        player.bufferLengthAltR = player.analyser2.frequencyBinCount;
        const dataArrayAltL = new Uint8Array(player.bufferLengthAltL);
        const dataArrayAltR = new Uint8Array(player.bufferLengthAltR);

        player.canvasCtx.clearRect(0, 0, player.canvas_width, player.canvas_height);
        const self = this;

        const drawAlt = function () {
            if (player.isPlaying) {
                player.drawVisual = requestAnimationFrame(drawAlt);

                player.analyser1.getByteFrequencyData(dataArrayAltL);
                player.analyser2.getByteFrequencyData(dataArrayAltR);

                player.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                player.canvasCtx.fillRect(0, 0, player.canvas_width, player.canvas_height);

                const barWidth = 10;
                let barHeight;
                const x = 0;

                for (let i = 0; i < player.bufferLengthAltL; i++) {
                    barHeight = dataArrayAltL[i] / 2;

                    player.canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',255,0)';
                    const y = barHeight * 100 / 256;
                    const x = player.canvas_height * y / 100;
                    player.canvasCtx.fillRect(0, player.canvas_height - x / 2, barWidth, x);
                }
                for (let i = 0; i < player.bufferLengthAltR; i++) {
                    barHeight = dataArrayAltR[i] / 2;

                    player.canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',255,0)';
                    const y = barHeight * 100 / 256;
                    const x = player.canvas_height * y / 100;
                    player.canvasCtx.fillRect(barWidth + 3, player.canvas_height - x / 2, barWidth, x);
                }
            }
        };

        drawAlt();
    }

    iteratePlayers(source, players, i, ind) {
        for (let j = 0; j < source; j++) {
            this.videoArray[i].src.push({
                url: players[ind].url,
                title: players[ind].title,
                ind,
                width: 100 / source,
                height: players[ind].aspect.h * (100 / source) / players[ind].aspect.w,
                type: players[ind].type,
                deviceId: players[ind].deviceId
            });
            ind++;
        }
        return ind;
    }

    /**
     * build dynamic layout for players
     */
    buildLayout(players) {
        const videoCount = players.length;
        this.screen_w = this.confidenceMonitoring.nativeElement.offsetWidth;
        this.screen_h = this.confidenceMonitoring.nativeElement.offsetHeight;

        const acpect = { // default aspect for screen
            h: 9,
            w: 16
        }

        while (this.screen_w > acpect.w * this.screen_h / acpect.h) {
            this.screen_w -= 20;
        }

        const S = this.screen_w * this.screen_h / videoCount;
        const w_max = 4 * Math.sqrt(S) / 3;
        const cols = Math.ceil(this.screen_w / w_max);

        const rows = Math.ceil(videoCount / cols);
        const last_row = videoCount % cols;

        this.videoArray = [];
        let ind = 0;
        for (let i = 0; i < rows; i++) {
            if (ind <= videoCount) {
                this.videoArray.push({
                    src: [],
                    row_h: 100 / rows
                });
                if (i === rows - 1 && last_row !== 0) { // last row
                    ind = this.iteratePlayers(last_row, players, i, ind);
                } else {
                    ind = this.iteratePlayers(cols, players, i, ind);
                }
            }
        }
        this.cdr.detectChanges();
    }

    /**
     * window resize event
     */
    onResize() {
        const db = _.debounce(() => {
            this.players.forEach((pl, i) => {
                if (pl.dom.length == 0)
                    return;

                const player_wrapper_height = pl.dom.parent().parent().height();
                const player_wrapper_width = pl.dom.parent().parent().width() - this.audio_bar_w;
                let pl_height = player_wrapper_height;
                let pl_width = player_wrapper_width;

                const new_pl_height = (player_wrapper_width * pl.aspect.h) / pl.aspect.w;
                if (new_pl_height > player_wrapper_height) {
                    const new_pl_width = (player_wrapper_height * pl.aspect.w) / pl.aspect.h;
                    pl_width = new_pl_width;
                } else {
                    pl_height = new_pl_height;
                }
                pl.dom.height(pl_height);
                pl.dom.width(pl_width);
                if (pl.canvasCtx) {
                    pl.canvasCtx.canvas.setAttribute('height', pl_height);
                    pl.canvasCtx.canvas.style.height = pl_height + 'px';
                    pl.canvas_height = pl_height;
                    pl.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                    pl.canvasCtx.fillRect(0, 0, pl.canvas_width, pl.canvas_height);
                }
            });
        }, 400);
        return db();
    }

    /**
     * destroy all players
     */
    cleanPlayers() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i]) {
                // $(this.players[i].dom).off('timeupdate');
                // $(this.players[i].dom).off('FRAG_BUFFERED');
                // $(this.players[i].dom).off('FRAG_LOADED');
                // $(this.players[i].dom).off('FRAG_LOADING');
                // $(this.players[i].dom).off('LEVEL_LOADING');
                //
                // $(this.players[i].dom).off('onwaiting');
                // $(this.players[i].dom).off('canplay');
                // $(this.players[i].dom).off('loadeddata');
                // $(this.players[i].dom).off('abort');
                // $(this.players[i].dom).off('pause');
                this.players[i].dom.get(0) && this.players[i].dom.get(0).pause();
                if (this.players[i].mediaPlayer)
                    this.players[i].mediaPlayer.destroy();
                this.players[i].dom.remove();
            }
        }
        this.players = [];
    }
}
