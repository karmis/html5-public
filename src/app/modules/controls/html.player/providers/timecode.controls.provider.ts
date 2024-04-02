import {TimeCodeFormat, TMDTimecode} from "../../../../utils/tmd.timecode";
import {ItemTypes} from "../item.types";
import {Injectable, NgZone} from "@angular/core";
import {TimecodeProvider} from "./timecode.provider";
import {HelperProvider} from "./helper.provider";
import {AbstractPlayerProvider} from "./abstract.player.provider";

@Injectable()
export class TimecodeControlsProvider  extends AbstractPlayerProvider {

    timecodeUpdateInterval;

    currentTimecodeEl: Element;
    durationTimecodeEl: Element;

    private alreadyInited: boolean = false;

    constructor(private timecodeProvider: TimecodeProvider,
                private helperProvider: HelperProvider,
                private zone: NgZone) {
        super();
    }

    private startTimecodeUpdate() {
        let providerRef = this;
        this.zone.runOutsideAngular(() => {
            this.clearTimecodeUpdateInterval();
            this.timecodeUpdateInterval = (<any>window).timecodeUpdateInterval = setInterval(function () {
                providerRef.updateTimecode();
                // }, 1000 / (providerRef.componentRef.frameRate || 30) );
            }, providerRef.timecodeProvider.getFrameToMillisecond(TimeCodeFormat[providerRef.componentRef.videoDetails.TimecodeFormat]) + (<any>providerRef.componentRef).offsetInSecForFramesSwitching);
        });
    }

    public resetInit() {
        this.alreadyInited = false;
    }

    public initTimecodeEvents() {
        if (this.alreadyInited) {
            return;
        }
        this.alreadyInited = true;
        const providerRef = this;
        this.updateTimecode();
        delete this.currentTimecodeEl;
        delete this.durationTimecodeEl;
        this.clearTimecodeUpdateInterval();

        setTimeout(() => {
            this.componentRef.player.on("play", () => {
                providerRef.startTimecodeUpdate();
                if (providerRef.componentRef.videoDetails.AudioWaveform) {  // if audio had wafe form from REST then hide audio icon when play
                    providerRef.componentRef.toggleAudioIcon(false);
                } else {
                    providerRef.componentRef.toggleAudioIcon(true);
                }
            });
            this.componentRef.player.on("timeupdate", () => {
                if (providerRef.componentRef.videoDetails.AudioWaveform) {  // if audio had wafe form from REST then hide audio icon when play
                    providerRef.componentRef.toggleAudioIcon(false);
                } else {
                    providerRef.componentRef.toggleAudioIcon(true);
                }
                if (!providerRef.timecodeUpdateInterval) {
                    providerRef.startTimecodeUpdate();
                }
            });
            this.componentRef.player.on("pause", () => {
                this.clearTimecodeUpdateInterval();
                if (providerRef.componentRef.videoDetails.AudioWaveform) {  // if audio had wafe form from REST then hide audio icon when play
                    providerRef.componentRef.toggleAudioIcon(true);
                }
                if(providerRef.componentRef.typeDetails !== 'clip-editor') { // no need this in chunck clip editor
                    providerRef.componentRef.player.currentTime(providerRef.componentRef.player.currentTime()); // hack for sync timecodes from video and timecode comp
                }
            });
            this.componentRef.player.on("seeking", (e) => {
                $(providerRef.componentRef.player.el()).find('.vjs-loading-spinner').removeClass('show-loader');
                setTimeout((e) => {// delay for loader
                    $(providerRef.componentRef.player.el()).find('.vjs-loading-spinner').addClass('show-loader');
                }, 600);
                providerRef.updateTimecode();
            });
            this.componentRef.player.on("seeked", (e) => {
                $(providerRef.componentRef.player.el()).find('.vjs-loading-spinner').removeClass('show-loader');
                providerRef.updateTimecode();
                providerRef.componentRef.player.posterImage.hide();
                if (providerRef.componentRef.player.waveform && providerRef.componentRef.type == ItemTypes.AUDIO && providerRef.helperProvider.doesBrowserSupportWebAudioAPI()) {
                    providerRef.componentRef.player.waveform.surfer.backend.seekTo(providerRef.componentRef.player.currentTime());
                    providerRef.componentRef.player.waveform.surfer.backend.play();
                    providerRef.componentRef.player.waveform.surfer.backend.setVolume(0);
                    providerRef.componentRef.player.trigger("play");
                    providerRef.componentRef.player.waveform.surfer.drawer.progress(providerRef.componentRef.player.waveform.surfer.backend.getPlayedPercents());
                }
            });
        });
    }

    updateTimecode(emitChange: boolean = true, durationUpdate: boolean = false, needSetDurationFromEvent: boolean = false) {
        if (!($("video").length || $("audio").length )) {
            return;
        }
        this.currentTimecodeEl = this.currentTimecodeEl || $(this.componentRef.playerElement.nativeElement).find(".currentTimecode")[0];
        let needSetDuration = !this.durationTimecodeEl || needSetDurationFromEvent;
        this.durationTimecodeEl = this.durationTimecodeEl || $(this.componentRef.playerElement.nativeElement).find(".durationTimecode")[0];
        if (durationUpdate) {
            if (this.componentRef.type == ItemTypes.MEDIA || ( this.componentRef.type == ItemTypes.AUDIO && this.componentRef.getTvStandart() && this.componentRef.videoDetails.TimecodeFormat )) {
                this.durationTimecodeEl.innerHTML = this.timecodeProvider.getTimecodeString(this.componentRef.player.currentTime(), TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat], this.componentRef.som);
            } else if (this.componentRef.type == ItemTypes.AUDIO && (!this.componentRef.getTvStandart() || !this.componentRef.videoDetails.TimecodeFormat)) {
                this.durationTimecodeEl.innerHTML = this.timecodeProvider.getAudioTimeString(this.componentRef.player.currentTime(), this.componentRef.som);
            } else {
                this.durationTimecodeEl.innerHTML = this.timecodeProvider.getTimeString(this.componentRef.player.currentTime());
            }
        }
        if (this.componentRef.type == ItemTypes.MEDIA || ( this.componentRef.type == ItemTypes.AUDIO && this.componentRef.getTvStandart() && this.componentRef.videoDetails.TimecodeFormat )) {
            let tcStr = this.timecodeProvider.getTimecodeString(this.componentRef.player.currentTime(), TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat], this.componentRef.som);
            if (this.currentTimecodeEl) {
                let scBar = this.componentRef.player.controlBar.getChildById ? this.componentRef.player.controlBar.getChildById("sub_control_bar") : null;
                if (scBar && scBar.getChildById("left_control_bar")) {
                    scBar.getChildById("left_control_bar").getChildById('timeControl').setCurrentTime(tcStr);
                }
            }
            // if (this.componentRef.timecodeOverlayShowing) {
            this.componentRef.playerTimecodeElement.nativeElement.innerText = tcStr;
            // }

            if ((needSetDuration || this.componentRef.player.duration() === Infinity) && this.durationTimecodeEl) {
                if (this.componentRef.player.duration() === Infinity) {
                    var time = this.componentRef.player.liveTracker.liveCurrentTime();//this.componentRef.player.tech(true).hls ? this.componentRef.player.tech(true).hls.stats.mediaTransferDuration : 0;//
                    if($(this.durationTimecodeEl).parent().find('.live-icon').length == 0) {
                        $(this.durationTimecodeEl).parent().append('<i class="live-icon"></i>');
                    }
                } else {
                    var time = this.componentRef.player.duration();
                }
                this.durationTimecodeEl.innerHTML = this.componentRef.player.duration() === Infinity ?
                                            this.timecodeProvider.getTimecodeString(time, TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat], this.componentRef.som) + ' LIVE' :
                                            this.timecodeProvider.getTimecodeString(time, TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat], this.componentRef.som);
                (<any>window).liveDuration = time;
                this.updateMarkersForLiveVideo(time);

            }
            else if(this.durationTimecodeEl && this.componentRef.player.duration() !== Infinity && $(this.durationTimecodeEl).parent().find('.live-icon').length > 0) {
                $(this.durationTimecodeEl).parent().find('.live-icon').remove();
            }
        } else if (this.componentRef.type == ItemTypes.AUDIO && (!this.componentRef.getTvStandart() || !this.componentRef.videoDetails.TimecodeFormat)) { // if no timecode format
            if (this.currentTimecodeEl) {
                let scBar = this.componentRef.player.controlBar.getChildById ? this.componentRef.player.controlBar.getChildById("sub_control_bar") : null;
                if (scBar && scBar.getChildById("left_control_bar")) {
                    scBar.getChildById("left_control_bar").getChildById('timeControl').setCurrentTime(this.timecodeProvider.getAudioTimeString(this.componentRef.player.currentTime(), this.componentRef.som));
                }
            }
            if (needSetDuration && this.durationTimecodeEl) {
                this.durationTimecodeEl.innerHTML = this.timecodeProvider.getAudioTimeString(this.componentRef.player.duration(), this.componentRef.som);
            }
        } else {
            if (this.currentTimecodeEl) {
                let scBar = this.componentRef.player.controlBar.getChildById ? this.componentRef.player.controlBar.getChildById("sub_control_bar") : null;
                if (scBar && scBar.getChildById("left_control_bar")) {
                    scBar.getChildById("left_control_bar").getChildById('timeControl').setCurrentTime(this.timecodeProvider.getTimeString(this.componentRef.player.currentTime()));
                }
            }
            if (needSetDuration && this.durationTimecodeEl) {
                this.durationTimecodeEl.innerHTML = this.timecodeProvider.getTimeString(this.componentRef.player.duration());
            }
        }
        if (this.componentRef.audioSrc) {
            if(this.componentRef.audioPlayerOn) {
                if (this.componentRef.isPlaying) {
                    this.componentRef.playAudio();
                    if (!this.componentRef.player.muted()) {
                        this.componentRef.player.muted(true);
                    }
                    if (this.componentRef.audioPlayer &&
                        (this.componentRef.audioPlayer.currentTime + 1 < this.componentRef.player.currentTime() ||
                            this.componentRef.audioPlayer.currentTime - 1 > this.componentRef.player.currentTime())) {
                        this.componentRef.audioPlayer.currentTime = this.componentRef.player.currentTime();
                    }
                }
                else {
                    if (this.componentRef.audioPlayer) {
                        this.componentRef.pauseAudio();
                        if (this.componentRef.audioPlayer.currentTime != this.componentRef.player.currentTime()) {
                            this.componentRef.audioPlayer.currentTime = this.componentRef.player.currentTime();
                        }
                    }
                }
            } else {
                if (this.componentRef.audioPlayer) {
                    this.componentRef.pauseAudio();
                }
            }
        }
    };


    public clearTimecodeUpdateInterval() {
        clearInterval(this.timecodeUpdateInterval);
        clearInterval((<any>window).timecodeUpdateInterval);
        delete this.timecodeUpdateInterval;
    }

    public makeBackwardFrame() {
        if (this.componentRef.player.currentTime() <= 0) {
            return;
        }

        let frames = this.timecodeProvider.getFramesFromTimecode(
            this.componentRef.player.currentTime(),
            TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat],
            this.componentRef.som
        );
        frames--;

        const newTime = this.timecodeProvider.getMillisecondsFromFrames(
            frames,
            TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat],
            this.componentRef.som
        );

        this.componentRef.player.currentTime(newTime/1000);
    }

    public makeForwardFrame() {
        if (this.componentRef.player.remainingTime() <= 0) {
            return;
        }

        let frames = this.timecodeProvider.getFramesFromTimecode(
            this.componentRef.player.currentTime(),
            TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat],
            this.componentRef.som
        );
        frames++;

        const newTime = this.timecodeProvider.getMillisecondsFromFrames(
            frames,
            TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat],
            this.componentRef.som
        );

        if(this.componentRef.player.componentContext.audioOnFrameForward) {
            this.forAudioOnFrameForward(event, newTime);
        } else {
            this.componentRef.player.currentTime(newTime/1000);
        }
    }

    // #px-5115 freezes on AudioOnFrameForward mode.
    cbForAudioOnFrameForward = null;
    forAudioOnFrameForward(event, newTime) {
        const f = (event) => {
            const player = this.componentRef.player;
            const timecodeFormat = TMDTimecode.getFrameRate(TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat]).frameRate;
            const oneFrameInSeconds = 1 / timecodeFormat;
            const currentTime = player.currentTime();
            // player.playbackRate(0.1);
            const frameForwardTime = newTime / 1000;

            if(this.componentRef.player && this.componentRef.player.frameForwardInterval) {
                clearInterval(this.componentRef.player.frameForwardInterval);
                this.componentRef.togglePlay(false);
            }

            this.componentRef.togglePlay(true);

            this.componentRef.player.frameForwardInterval = setInterval(() => {
                if(this.componentRef.player.currentTime() >= frameForwardTime ) {
                    clearInterval(this.componentRef.player.frameForwardInterval);
                    this.componentRef.player.frameForwardInterval = null;
                    this.componentRef.togglePlay(false);
                    console.log('stop_fireEventListener', newTime);
                    // _this.player.playbackRate(1);
                }
                window.removeEventListener('keyup', f, true);
            }, oneFrameInSeconds);
        };

        if(this.cbForAudioOnFrameForward instanceof Function) {
            window.removeEventListener('keyup', this.cbForAudioOnFrameForward, true);
            this.cbForAudioOnFrameForward = null;
            this.componentRef.player.currentTime(newTime/1000);
        }

        this.cbForAudioOnFrameForward = f;
        if(event.type == 'keydown') {
            window.addEventListener('keyup', this.cbForAudioOnFrameForward, true); //options 'true' is necessarily
        } else if (event.type == 'click') {
            f(null);
        }
    }

    updateMarkersForLiveVideo(duration) {
        let markInTime = 0;
        let leftOffset = 0;

        const $markIn = $('.vjs-marker.in-marker')
        if ($markIn.length) {
           markInTime = $markIn.data('marker-time');
           leftOffset = markInTime / duration * 100;
           $markIn.css({
               'left': leftOffset + '%'
           })
        }

        const $markOut = $('.vjs-marker.out-marker')
        if ($markOut.length) {
            markInTime = $markOut.data('marker-time');
            leftOffset = markInTime / duration * 100;
            $markOut.css({
               'left': leftOffset + '%'
           })
        }

        const $markEom = $('.vjs-marker.eom')
        if ($markEom.length) {
            markInTime = $markEom.data('marker-time');
            leftOffset = markInTime / duration * 100;
            $markEom.css({
               'left': leftOffset + '%'
           })
        }
        const $markSom = $('.vjs-marker.som')
        if ($markSom.length) {
            markInTime = $markSom.data('marker-time');
            leftOffset = markInTime / duration * 100;
            $markSom.css({
               'left': leftOffset + '%'
           })
        }
    }
}
