/**
 * Created by initr on 20.10.2016.
 */
import {
    Component, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output,
    EventEmitter, Inject, HostListener, NgZone, OnInit, AfterViewInit, OnChanges, OnDestroy, ViewChild, ElementRef
} from '@angular/core'
import {DetailService} from "../../search/detail/services/detail.service";
import * as $ from "jquery";
import {ItemTypes} from "./item.types";
import {TMDTimecode, TimeCodeFormat} from "../../../utils/tmd.timecode";
import {ClipsProvider} from "./providers/clips.provider";
import "style-loader!jquery-ui-bundle/jquery-ui.min.css";
import "style-loader!jquery-ui-bundle/jquery-ui.structure.min.css";
import "style-loader!jquery-ui-bundle/jquery-ui.theme.min.css";
import "../timecode/libs/jquery.maskedinput.js";
import "jquery-ui-bundle/jquery-ui.min.js";
import {VideoJSCurrentTimeProvider} from "./providers/videojs.current.time.provider";
import {PluginsProvider} from "./providers/plugins.provider";
import {FormatProvider} from "./providers/format.provider";
import {SubtitlesProvider} from "./providers/subtitles.provider";
import {SubControlBarProvider} from "./providers/sub.control.bar.provider";
import {IMFXHtmlPlayerInterface} from "./imfx.html.player.interface";
import {ThumbnailsProvider} from "./providers/thumbnails.provider";
import {MarkersProvider} from "./providers/markers.provider";
import {TimecodeControlsProvider} from "./providers/timecode.controls.provider";
import {PosterProvider} from "./providers/poster.provider";
import {WaveformProvider} from "./providers/waveform.provider";
import {SmoothStreamingProvider} from "./providers/smooth.streaming.provider";
import {TextTracksProvider} from "./providers/text.tracks.provider";
import {ResizeProvider} from "./providers/resize.provider";
import {HelperProvider} from "./providers/helper.provider";
import {EventsHandlerProvider} from "./providers/events.handler.provider";
import {TimecodeProvider} from "./providers/timecode.provider";
import {AbstractPlayerProvider} from "./providers/abstract.player.provider";
import {ErrorProvider} from "./providers/error.provider";
import {LiveProvider} from "./providers/live.provider";
import {RestrictedContentProvider} from "./providers/restricted.content.provider";
import {FocusProvider} from "./providers/focus.provider";
import {HotkeysProvider} from "./providers/hotkeys.provider";
import {SegmentsProvider} from "./providers/segments.provider";
import {AudioSynchProvider} from "./providers/audio.synch.provider";
import {MediaDetailMediaVideoResponse} from "../../../models/media/detail/mediavideo/media.detail.mediavideo.response";
import {HTMLPlayerService} from "./services/html.player.service";
import {PlayerConstants} from "./constants/constants";
import { SettingsGroupsService } from '../../../services/system.config/settings.groups.service';
import {Subscription} from "rxjs/Rx";
import {PlaybackSliderProvider} from "./providers/playback.slider.provider";
import {LanguagesProvider} from "./providers/languages.provider";
import { take, takeUntil } from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {ServerGroupStorageService} from "../../../services/storage/server.group.storage.service";
import { ClipboardProvider } from '../../../providers/common/clipboard.provider';
import { NotificationService } from '../../notification/services/notification.service';
import {HttpResponse} from "@angular/common/http";
import {UploadResponseModel} from "../../upload/types";
import {TranslateService} from "@ngx-translate/core";
import { NativeNavigatorProvider } from 'app/providers/common/native.navigator.provider';
import 'style-loader!videojs-vr/dist/videojs-vr.css';
import { SoundPitcher } from "./plugins/sound.pitcher.js";
import { StatusPlayerProvider } from './providers/status.player.provider';
@Component({
    selector: 'html-player',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        './styles/clipping.buttons.scss',
        './styles/videojs.thumbnails.scss',
        './styles/dist/video-js.min.css',
        './styles/player.progressbar.scss',
        './styles/big.play.button.scss',
        './styles/volume.menu.button.scss',
        './styles/playback.slider.scss',
        './styles/audio.subtitles.button.scss',
        './styles/fullscreen.button.scss',
        './styles/cinema.mode.button.scss',
        './styles/repeat.button.scss',
        './styles/overlay.button.scss',
        './styles/videojs.timecode.scss',
        './styles/aspect.ratio.button.scss',
        './styles/copy.timecode.button.scss',
        './styles/relatet.audio.volume.slider.scss',
        './styles/videojs.disable.video.button.scss',
        './styles/pitch.scss'
    ],
    providers: [
        HTMLPlayerService,
        DetailService,
        ClipsProvider,
        PosterProvider,
        VideoJSCurrentTimeProvider,
        FormatProvider,
        SubtitlesProvider,
        SubControlBarProvider,
        ThumbnailsProvider,
        SmoothStreamingProvider,
        EventsHandlerProvider,
        TextTracksProvider,
        WaveformProvider,
        ResizeProvider,
        MarkersProvider,
        HelperProvider,
        TimecodeControlsProvider,
        PluginsProvider,
        TimecodeProvider,
        ErrorProvider,
        FocusProvider,
        HotkeysProvider,
        LiveProvider,
        RestrictedContentProvider,
        SegmentsProvider,
        AudioSynchProvider,
        SettingsGroupsService,
        PlaybackSliderProvider,
        ServerGroupStorageService,
        LanguagesProvider
    ],
    host: {
        '(document:click)': 'focusProvider.onClick($event)',
        // '(window:keydown)': 'hotkeysProvider.onKeyDown($event)' //now defined in ngAfterViewInit !
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class IMFXHtmlPlayerComponent implements IMFXHtmlPlayerInterface, OnInit, AfterViewInit, OnChanges, OnDestroy {
    player: any;
    audioPlayer: any;
    frameRate: number;
    videojs: any;
    currentTimecodeEl: Element;
    durationTimecodeEl: Element;
    videoDetails: any;
    eom: any;
    timecodeUpdateInterval: any;
    isPlayerDataLoaded: boolean = false;

    public internalId = new Date().getTime() + '';

    @ViewChild('playerElement', {static: false}) public playerElement: ElementRef;
    @ViewChild('playerTimecodeElement', {static: false}) public playerTimecodeElement: ElementRef;
    @ViewChild('playerOpeningElement', {static: false}) public playerOpeningElement: ElementRef;
    @ViewChild('playerAudioTrakcElement', {static: false}) public playerAudioTrakcElement: ElementRef;
    @ViewChild('settingsModal', {static: false}) public settingsModal;
    @ViewChild('disableVideoWrap', {static: false}) public disableVideoWrap: ElementRef;

    @Input() som: any;
    @Input() src: string | Array<{ id: number; src: string; seconds: number }> = '';
    @Input() type: number;
    @Input() id: number;
    @Input() typeDetails: String;
    @Input() subtitles = [];
    @Input() file: any;
    @Input() clipBtns: boolean = false;
    @Input() disabledClipBtns: boolean = false;
    @Input() clipBtnsCallback: any = null;
    @Input() simpleMode: boolean = false;
    @Input() autoPlay: boolean = false;
    @Input() cinemaMode: Object = null;
    @Input() aspectRatio: string = null; // i.e. '16:9'
    @Input() isThumb: boolean = false;
    @Input() muted: boolean = false;
    @Input() simpleModeClass: boolean = true;
    @Input() ignoreSom: boolean = false;
    @Input() isLive: boolean = false;
    @Input() currentTime: number = 0;
    @Input() repeatMode: boolean = false;
    @Input() timecodeOverlayShowing: boolean = true; // show timecode on player
    @Input() externalDownload: boolean = false; // for external loading player (silverlight)
    @Input() usePresignedUrl: boolean = false;
    @Input() mediaInfoType: string = 'media';

    @Input() externalVideoDetails: Object = null;

    @Output() timecodeChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() percentChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() timedTextChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() setPlayerOnPause: EventEmitter<any> = new EventEmitter<any>();
    @Output() playerReady: EventEmitter<any> = new EventEmitter<any>();
    @Output() thumbnailUpdated: EventEmitter<any> = new EventEmitter<any>();
    @Output() playerError: EventEmitter<any> = new EventEmitter<any>();
    @Output() onAudioWaiting: EventEmitter<any> = new EventEmitter<any>();
    @Output() onAudioError: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUpdateAudioSrc: EventEmitter<any> = new EventEmitter<any>();
    @Output() clipAdded: EventEmitter<any> = new EventEmitter<any>();
    @Output() onInternalTrackPlaybackChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() onExternalTrackPlaybackChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() clipReplaced: EventEmitter<{
        oldClipId: any,
        newClip: any
    }> = new EventEmitter<{
        oldClipId: any,
        newClip: any
    }>();
    first = true;
    public firstPlayback = false;
    public manualPlayback = false;
    public isPlaying = false;
    public audioSrc: string | Array<{ id: number; src: string; seconds: number }> = '';
    public audioSrcLabel: string = '';
    public destroyed$: Subject<any> = new Subject();
    public playerEnabledInPopout: boolean = false;
    private onAudioPlaying = false;
    private onAudioPause = false;
    private offsetInSecForFramesSwitching = 0;
    private getVideoInfoSubscription: Subscription;
    private audioOnFrameForward: boolean = false;
    private isFullscreen: boolean = false; // added this parameter because player logic isn't correct when click Esc button

    constructor(private cdr: ChangeDetectorRef,
                protected detailService: DetailService,
                protected htmlPlayerService: HTMLPlayerService,
                protected settingsGroupsService: SettingsGroupsService,
                private serverGroupStorage: ServerGroupStorageService,
                private translate: TranslateService,
                @Inject(VideoJSCurrentTimeProvider) protected videojsCurrentTimeProvider: VideoJSCurrentTimeProvider,
                @Inject(FormatProvider) protected formatProvider: FormatProvider,
                @Inject(SubtitlesProvider) protected subtitlesProvider: SubtitlesProvider,
                @Inject(SubControlBarProvider) protected subControlBarProvider: SubControlBarProvider,
                @Inject(ThumbnailsProvider) protected thumbnailsProvider: ThumbnailsProvider,
                @Inject(SmoothStreamingProvider) protected smoothStreamingProvider: SmoothStreamingProvider,
                @Inject(PosterProvider) protected posterProvider: PosterProvider,
                @Inject(EventsHandlerProvider) protected eventsHandlerProvider: EventsHandlerProvider,
                @Inject(TextTracksProvider) protected textTracksProvider: TextTracksProvider,
                @Inject(WaveformProvider) protected waveformProvider: WaveformProvider,
                @Inject(ResizeProvider) protected resizeProvider: ResizeProvider,
                @Inject(MarkersProvider) protected markersProvider: MarkersProvider,
                @Inject(ClipsProvider) public clipsProvider: ClipsProvider,
                @Inject(HelperProvider) protected helperProvider: HelperProvider,
                @Inject(TimecodeControlsProvider) protected timecodeControlsProvider: TimecodeControlsProvider,
                @Inject(PluginsProvider) protected pluginsProvider: PluginsProvider,
                @Inject(ErrorProvider) protected errorProvider: ErrorProvider,
                @Inject(RestrictedContentProvider) protected restrictedContentProvider: RestrictedContentProvider,
                @Inject(FocusProvider) protected focusProvider: FocusProvider,
                @Inject(HotkeysProvider) protected hotkeysProvider: HotkeysProvider,
                @Inject(SegmentsProvider) protected segmentsProvider: SegmentsProvider,
                @Inject(AudioSynchProvider) public audioSynchProvider: AudioSynchProvider,
                @Inject(LiveProvider) protected liveProvider: LiveProvider,
                @Inject(ClipboardProvider) protected clipboardProvider: ClipboardProvider,
                @Inject(TimecodeProvider) protected timecodeProvider: TimecodeProvider,
                @Inject(NotificationService) protected notificationService: NotificationService,
                @Inject(PlaybackSliderProvider) protected playbackSliderProvider: PlaybackSliderProvider,
                @Inject(NativeNavigatorProvider) protected nativeNavigatorProvider: NativeNavigatorProvider,
                @Inject(StatusPlayerProvider) protected statusPlayerProvider: StatusPlayerProvider,
                @Inject(LanguagesProvider) protected languagesProvider: LanguagesProvider) {
        this.audioSynchProvider.comp = this;
        this.offsetInSecForFramesSwitching = nativeNavigatorProvider.isOpera()
            ? PlayerConstants.offsetInSecForFramesSwitchingOpera
            : PlayerConstants.offsetInSecForFramesSwitchingAllBrowsers;
    }

    // Angular life cycle hooks

    ngOnInit() {
        this.requirePlugins();
        this.videojs = (<any>window).videojs;

        // init our custom providers
        for (var k in this) {
            if (<any>this[k] instanceof AbstractPlayerProvider) {
                (<any>this[k]).setComponentRef(this);
            }
        }
        if (this.file && this.file.ID) {
            this.internalId = this.file.ID + '-' + new Date().getTime();
        }
        let self = this;
        this.serverGroupStorage.retrieve({global: ['htmlplayerhotkeys', 'audioOnFrameForward']}).subscribe((setups) => {
            if (setups && setups.global && setups.global.htmlplayerhotkeys) {
                self.hotkeysProvider.setHotkeys(JSON.parse(setups.global.htmlplayerhotkeys));
            }
            if (setups && setups.global && setups.global.audioOnFrameForward) {
                self.audioOnFrameForward = JSON.parse(setups.global.audioOnFrameForward);
            }
        });
        this.setPlayerOnPause.subscribe(res => {
            //px-5893 for quickly destroying htmlPlayer
            this.player && this.player.pause();
        });
        this.whenPlayerReady().then(() => {
           let error = this.player.error();
           this.player.error(error);
           this.resizeProvider.onResize();
        });
    }
    bindHotkeysCallBack() {
        let f = (event) => {
            this.hotkeysProvider.onKeyDown(event);
        };
        window.addEventListener('keydown', f, true); //options 'true' is necessarily

        this.destroyed$.subscribe(() => {
            window.removeEventListener('keydown', f);
        });
    }

    ngAfterViewInit() {
        this.bindHotkeysCallBack();
        new Promise((resolve, reject) => {
            resolve();
        }).then(
            () => {
                if(this.destroyed$.isStopped) {
                    return;
                }

                let self = this;
                (<any>window).imfxPlayer = this;
                this.viewInit();
                this.first = false;
            },
            (err) => {
                console.log(err);
            }
        );
        this.settingsGroupsService.getSettingsUserById('videoPlayerSettings', false).subscribe((res: any[]) => {
            if (res && res.length > 0) {
                this.videoPlayerSettings = JSON.parse(res[0].DATA);
            }
            this.statusPlayerProvider.onAfterViewInit.next();
        });

    }
    public videoPlayerSettings;

    ngOnChanges() {
        if (this.first) {
            return;
        }
        new Promise((resolve, reject) => {
            resolve();
        }).then(
            () => {
                if(this.destroyed$.isStopped) {
                    return;
                }
                if (this.player) {
                    this.refresh();
                } else {
                    this.viewInit();
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    audioPlayerOn = false;

    public playAudio() {
        if (this.audioPlayer.paused && !this.onAudioPlaying) {
            this.toggleAudioPlay(true);
        }
    }

    public pauseAudio() {
        if (!this.audioPlayer.paused && !this.onAudioPause) {
            this.toggleAudioPlay(false);
        }
    }


    private finalAudioAction;
    private isAudioToggleBlocked = false;
    private playAudioPromise: Promise<any>; //ZoneAwarePromise

    public toggleAudioPlay (playOn: boolean = false) {
        if  (this.isAudioToggleBlocked ||
            (this.finalAudioAction == playOn && this.isPlayerDataLoaded && !this.audioPlayer.paused ==  playOn)) {
            return;
        }

        this.finalAudioAction = playOn;

        if (playOn) {
            this.playAudioPromise = this.whenPlayerReady().then(() => {
                return this.audioPlayer.play();
            });

        } else {
            if (this.playAudioPromise
                && (this.playAudioPromise instanceof Promise)
                && (<any>this.playAudioPromise).hasOwnProperty('__zone_symbol__state')
                && !(<any>this.playAudioPromise).__zone_symbol__state) {
                this.isAudioToggleBlocked = true;
                this.playAudioPromise.then(() => {
                    !this.finalAudioAction && this.audioPlayer.pause();
                    this.isAudioToggleBlocked = false;
                }, () => {
                    this.isAudioToggleBlocked = false;
                })
            } else {
                this.audioPlayer.pause();
            }
        }
    }


    public updateAudioSrc(data) {
        this.pauseAudio();
        this.audioSrc = data ? data.src : null;
        this.audioSrcLabel =  data ? data.label : null;
        this.onAudioPlaying = false;
        this.onAudioPause = false;
        this.cdr.detectChanges();
        this.audioPlayer.load();
        this.toggleVisibleRelatedAudioPanel(!!this.audioSrc);

        this.toggleRelatedAudio(this.getSwitchStateRelatedAudio());
    }

    showAudioTrackOverlay(label?) {
        $(this.playerAudioTrakcElement.nativeElement).text(label);
        $(this.playerAudioTrakcElement.nativeElement).fadeIn();
        $(this.playerAudioTrakcElement.nativeElement).fadeOut(1200);
    }

    getSwitchStateRelatedAudio() {
        let switchEl = this.player.controlBar
            .getChildById('sub_bottom_control_bar')
            .getChildById('left_bottom_control_bar')
            .getChildById('related-audio-switch-wrapper')
            .getChildById('related-audio-switch')
            .el();
        return switchEl.checked;
    }

    public updateAudioVolume(vol)
    {
        if(this.audioPlayer) {
            this.audioPlayer.volume = vol;
        }
    }

    toggleRelatedAudio(isOn: boolean) {
        let flag = !!(isOn && this.audioSrc);

        this.audioPlayerOn = flag;
        this.player.muted(flag);
        this.disablePlaybackSlider(flag);
        isOn && this.showAudioTrackOverlay(this.audioSrcLabel);
        this.processInternalTrackChanges();
    }

    processInternalTrackChanges() {
        if(!this.getSwitchStateRelatedAudio() && this.audioSrc && this.audioSrc.length > 0 || !this.audioSrc) {
            var tracks = this.player.audioTracks();
            if(tracks.length == 0) {
                this.onInternalTrackPlaybackChange.emit(0);
            }
            for (var i = 0; i < tracks.length; i++) {
                if (tracks[i].enabled){
                    this.onInternalTrackPlaybackChange.emit(i);
                    return;
                }
            }
        }
        else if(this.getSwitchStateRelatedAudio() && this.audioSrc && this.audioSrc.length > 0) {
            this.onExternalTrackPlaybackChange.emit();
        }
    }

    public toggleVisibleRelatedAudioPanel(isOn:boolean) {
        isOn && this.audioSrc
            ? $('#sub_bottom_control_bar').show()
            : $('#sub_bottom_control_bar').hide();

        this.resizeProvider.onResize();
    }

    public disablePlaybackSlider(disabled: boolean) {
        let controlBar = this.player.controlBar.getChildById('sub_control_bar');
        let slider = controlBar.getChildById('center_control_bar').getChildById('playback-slider-box');
        if (!slider) return;
        if (disabled) {
            slider.addClass('disabled');
            this.player.playbackSlider();
            this.player.playbackRate(1);
        } else {
            slider.removeClass('disabled');
        }
    }

    private soundPitcher = null;

    resumeAudioContext() {
        if(this.soundPitcher && this.soundPitcher.lib.context.state == 'suspended') {
            this.soundPitcher.lib.context.resume();
        }
    }

    initPitchRatio(player) {
        const self = this;
        const videoEl = player.el().querySelector('video');
        this.soundPitcher = new SoundPitcher(videoEl);
    }

    onPitchChanged($event) {
        this.soundPitcher.setPitchOffset($event);
    }

    //binding worklet processor
    bindCustomProcessor(player) {
        const self = this;
        const workletFileName = require('file-loader!./plugins/custom-processor.js');
        player.audioCtx = new ((<any>window).AudioContext || (<any>window).webkitAudioContext)();
        player.mElSource = player.audioCtx.createMediaElementSource(player.el().querySelector('video'));

        player.audioCtx.audioWorklet.addModule(workletFileName)
            .then(() => {
                const bypasser = new AudioWorkletNode(player.audioCtx, 'custom-processor');
                player.mElSource.connect(bypasser);
                bypasser.connect(player.audioCtx.destination);

            }).catch(() => {
            console.warn('Error load pitcher by ' + workletFileName);
        });
    }

    // public toggleVisibleRelatedAudioPanel(isOn:boolean) {
    //
    // }

    ngOnDestroy() {
        this.destroyPlayer();
        this.destroyed$.next();
        this.destroyed$.complete();
        //--clear in put vals in storage
        let st = this.clipboardProvider.pasteLocal();
        if (!st) { return; }
        delete st.inTc;
        delete st.outTc;
        this.clipboardProvider.copyLocal(st);
        //---end
    };


    private requirePlugins() {

        delete (<any>window).videojs;

        let c = require.cache;
        let b;

        // b = require.resolve('video.js/dist/video.js');
        // delete c[b];
        // require('video.js/dist/video.js');
        b = require.resolve('./overrides/video.js');
        delete c[b];
        require('./overrides/video.js');

        (<any>window).videojs = c[b].exports;

        b = require.resolve('./overrides/videojs-vr.js');
        delete c[b];
        require('./overrides/videojs-vr.js');

        if( !(this.isLive && this.type == ItemTypes.MEDIA) )
        {
            b = require.resolve('dashjs/dist/dash.all.min.js');
            delete c[b];
            require('dashjs/dist/dash.all.min.js');

            b = require.resolve('videojs-contrib-dash/dist/videojs-dash.js');
            delete c[b];
            require('videojs-contrib-dash/dist/videojs-dash.js');

            b = require.resolve('./overrides/videojs-http-streaming.js');
            delete c[b];
            require('./overrides/videojs-http-streaming.js');
        }
        b = require.resolve('./plugins/videojs.markers');
        delete c[b];
        require('./plugins/videojs.markers');
        b = require.resolve('videojs-markers/dist/videojs.markers.css');
        delete c[b];
        require('videojs-markers/dist/videojs.markers.css');
        b = require.resolve('./plugins/videojs-framebyframe');
        delete c[b];
        require('./plugins/videojs-framebyframe');
        if (!this.isLive && this.typeDetails == 'clip-editor') { // this is for including segment plugin only in Clip Editor
            b = require.resolve('./plugins/videojs.segment.js');
            delete c[b];
            require('./plugins/videojs.segment.js');
        }
        b = require.resolve('./plugins/videojs.thumbnails');
        delete c[b];
        require('./plugins/videojs.thumbnails');
        b = require.resolve('./plugins/videojs.wavesurfer');
        delete c[b];
        require('./plugins/videojs.wavesurfer');
        b = require.resolve('./plugins/videojs.clippingButtons');
        delete c[b];
        require('./plugins/videojs.clippingButtons');
        b = require.resolve('./plugins/videojs.big.play.button');
        delete c[b];
        require('./plugins/videojs.big.play.button');
        b = require.resolve('./plugins/videojs.play.button');
        delete c[b];
        require('./plugins/videojs.play.button');
        b = require.resolve('./plugins/videojs.volume.menu.button');
        delete c[b];
        require('./plugins/videojs.volume.menu.button');
        b = require.resolve('./plugins/videojs.playback.slider.js');
        delete c[b];
        require('./plugins/videojs.playback.slider.js');
        b = require.resolve('./plugins/videojs.timecode.control.js');
        delete c[b];
        require('./plugins/videojs.timecode.control.js');
        b = require.resolve('./plugins/videojs.fullscreen.button.js');
        delete c[b];
        require('./plugins/videojs.fullscreen.button.js');
        b = require.resolve('./plugins/videojs.subtitles.button.js');
        delete c[b];
        require('./plugins/videojs.set.thumbnail.button.js');
        b = require.resolve('./plugins/videojs.set.thumbnail.button.js');
        delete c[b];
        require('./plugins/videojs.subtitles.button.js');
        b = require.resolve('./plugins/videojs.audio.button.js');
        delete c[b];
        require('./plugins/videojs.audio.button.js');
        b = require.resolve('./plugins/videojs.cinema.mode.button.js');
        delete c[b];
        require('./plugins/videojs.cinema.mode.button.js');
        b = require.resolve('./plugins/videojs.repeat.button.js');
        delete c[b];
        require('./plugins/videojs.repeat.button.js');
        b = require.resolve('./plugins/videojs.overlay.button.js');
        delete c[b];
        require('./plugins/videojs.overlay.button.js');
        b = require.resolve('./plugins/videojs.player.settings.button.js');
        delete c[b];
        require('./plugins/videojs.player.settings.button.js');
        b = require.resolve('./plugins/videojs.aspect.ratio.button.js');
        delete c[b];
        require('./plugins/videojs.aspect.ratio.button.js');
        b = require.resolve('./plugins/videojs.copy.timecode.button.js');
        delete c[b];
        require('./plugins/videojs.copy.timecode.button.js');
        b = require.resolve('./plugins/videojs.related.audio.volume.slider.js');
        delete c[b];
        require('./plugins/videojs.related.audio.volume.slider.js');
        require('./plugins/videojs.disable.video.button.js');
        b = require.resolve('./plugins/videojs.disable.video.button.js');
        delete c[b];
        b = require.resolve('./plugins/videojs.pitch.menu.button.js');
        delete c[b];
        require('./plugins/videojs.pitch.menu.button.js');
        b = require.resolve('./plugins/videojs.quality.menu.button.js');
        delete c[b];
        require('./plugins/videojs.quality.menu.button.js');
        this.languagesProvider.addLanguage((<any>window).videojs);
    }

    private getObsGetVideoInfo(): Observable<MediaDetailMediaVideoResponse> {
        const comp = this;
        return this.detailService.getVideoInfo(comp.id, {
            smudge: comp.type == ItemTypes.MEDIA,
            waveform: comp.type == ItemTypes.AUDIO,
        }, this.mediaInfoType).pipe(takeUntil(comp.destroyed$));
    }

    private parseAspectRatio() {
        const ar = this.aspectRatio.split(':');

        if (ar.length == 2) {
            return {
                w: ar[0],
                h: ar[1]
            };
        } else {
            console.warn('incorrect aspectratio format');
            return null;
        }
    }

    private viewInit() {
        let self = this;
        (!this.isLive) && $(this.playerOpeningElement.nativeElement).show();
        if (this.restrictedContentProvider.isRestricted()) {
            this.restrictedContentProvider.clearSource()
        }
        // moved from ngOnChanges
        this.timecodeControlsProvider.clearTimecodeUpdateInterval();
        this.timecodeControlsProvider.resetInit();
        // --------
        let componentRef = this;

        if (!$('[data-imfx-id=' + 'imfx-video-' + this.internalId + ']')[0]) {
            return;
        }
        delete this.videojs.players['imfx-video-' + this.internalId];
        componentRef.onAudioWaiting.subscribe((wait)=>{
            if(self.player) {
                var relatedSlider = $("#related_volume_slider");
                if(wait) {
                    if(relatedSlider.length > 0) {
                        $($(relatedSlider[0]).parent()[0]).find(".buffering-loader").remove();
                        $(relatedSlider[0]).parent().append("<div class='buffering-loader'><div class='spinner'></div> Buffering</div>");
                    }
                    // if(self.manualPlayback && self.isPlaying)
                    //     self.player.pause();
                }
                else {
                    // if(self.manualPlayback && !self.isPlaying)
                    //     self.player.play();
                    if(relatedSlider.length > 0)
                        $($(relatedSlider[0]).parent()[0]).find(".buffering-loader").remove();
                }
            }
        });
        this.audioPlayer = $('[data-imfx-id=' + 'imfx-audio-' + this.internalId + ']')[0];

        $(this.audioPlayer).on('playing', function () {
            // console.log('audio play');
            componentRef.onAudioPlaying = true;
            componentRef.onAudioPause = false;
        });

        $(this.audioPlayer).on('pause', function () {
            // console.log('audio pause');
            componentRef.onAudioPlaying = false;
            componentRef.onAudioPause = true;
        });
        $(this.audioPlayer).on('waiting', function () {
            //console.log('audio waiting');
            if (componentRef.onAudioPlaying !== false && componentRef.onAudioPause !== true) {
                componentRef.onAudioWaiting.emit(true);
            }
            componentRef.onAudioPlaying = false;
            componentRef.onAudioPause = true;
        });
        $(this.audioPlayer).on('error', function (e) {
            componentRef.pauseAudio();
            componentRef.onAudioPlaying = false;
            componentRef.onAudioPause = false;
            if (!!componentRef.audioSrc) {
                let message = componentRef.audioSynchProvider.getErrorMessage((<any>e).target.error.code);
                componentRef.onAudioError.emit(message);
            }
            componentRef.onAudioWaiting.emit(false);
        });

        $(this.audioPlayer).on('canplay', function () {
            //console.log('audio canplay');
            componentRef.onAudioWaiting.emit(false);
        });

        $(this.audioPlayer).on('loadstart', function () {
            //console.log('audio loadstart!');
            componentRef.onAudioWaiting.emit(true);
        });

        $(this.audioPlayer).on('loadeddata', function () {
            //console.log('audio loadeddata!');
            if (componentRef.isPlaying) {
                componentRef.audioPlayer.play();
            }
        });
        // $(this.audioPlayer).on('progress', function() {
        //     console.log('audio progress!');
        // });

        let plugins = this.pluginsProvider.getPlugins({
            clipBtns: this.clipBtns,
            cinemaMode: this.cinemaMode,
            disabledClipBtns: this.disabledClipBtns,
            clipBtnsCallback: this.clipBtnsCallback
        });
        this.videojsCurrentTimeProvider.init();
        componentRef.isPlayerDataLoaded = false;
        if (this.isThumb) {
            if (!Boolean(componentRef.videoDetails)) {
                this.getVideoInfoSubscription = this.getObsGetVideoInfo().subscribe(
                    (resp: MediaDetailMediaVideoResponse) => {
                        componentRef.videoDetails = resp;
                    })
            }
        }
        if (this.simpleMode) { // if simple player mode
            if (this.usePresignedUrl) {
                this.htmlPlayerService.getPresignedUrl(componentRef.id)
                    .pipe(takeUntil(self.destroyed$))
                    .subscribe((res:any) => {
                    (<any>this).src = res;
                    this.playerInit(componentRef, plugins);
                });
            } else if (this.usePresignedUrl === null || this.usePresignedUrl === undefined) { // this is for Consumer search preview (small) player
                this.getVideoInfoSubscription = this.getObsGetVideoInfo().subscribe(
                    (resp: MediaDetailMediaVideoResponse) => {
                        componentRef.videoDetails = resp;
                        if ((<any>this).src instanceof Array) {
                            (<any>this).src[0].src = resp.ProxyUrl;
                        } else {
                            (<any>this).src = resp.ProxyUrl;
                        }
                        this.playerInit(componentRef, plugins);
                    }, (error) => {
                        this.playerInit(componentRef, plugins);
                    });
            } else if (!this.aspectRatio) {
                this.getVideoInfoSubscription = this.getObsGetVideoInfo().subscribe(
                    (resp: MediaDetailMediaVideoResponse) => {
                        componentRef.videoDetails = resp;
                        if (resp.AspectRatio && !this.aspectRatio) {
                            this.aspectRatio = resp.AspectRatio;
                        }
                        this.playerInit(componentRef, plugins);
                    }, (error) => {
                        this.playerInit(componentRef, plugins);
                    });
            } else {
                this.playerInit(componentRef, plugins);
            }
        }
        if (!this.simpleMode) {  // if need to init full player options
            if (this.externalVideoDetails) { // for demo player page
                componentRef.videoDetails = this.externalVideoDetails;
                if ((<any>this).src instanceof Array) {
                    (<any>this).src[0].src = (<any>this.externalVideoDetails).ProxyUrl;
                } else {
                    (<any>this).src = (<any>this.externalVideoDetails).ProxyUrl;
                }
                this.playerInit(componentRef, plugins);
            } else {
                this.getVideoInfoSubscription = this.getObsGetVideoInfo().subscribe(
                    (resp: MediaDetailMediaVideoResponse) => {
                        componentRef.videoDetails = resp;
                        if ((<any>this).src instanceof Array) {
                            (<any>this).src[0].src = resp.ProxyUrl;
                        } else {
                            (<any>this).src = resp.ProxyUrl;
                        }
                        if (resp.AspectRatio && !this.aspectRatio) {
                            this.aspectRatio = resp.AspectRatio;
                        }
                        this.playerInit(componentRef, plugins);
                    }, (error) => {
                        this.playerInit(componentRef, plugins);
                    });
            }
        }
        this.settingsModal && this.settingsModal.hideSettingsWindow()
    };

    samePlayer = true; //observe similar chunks players
    public playerInit(componentRef, plugins) {
        this.samePlayer = false;
        if ( !($("#imfx-video-" + this.internalId).length) ) {
            return;
        }
        this.isFullscreen = false;
        let lang = localStorage.getItem('tmd.base.settings.lang');
        if (lang) {
            lang = lang.replace(/\"/g, '').split('-')[0];
        } else {
            lang = "en";
        }
        this.player = this.videojs("imfx-video-" + this.internalId, {
            html5: {
                // nativeCaptions: false,
                dash: {
                    // setFastSwitchEnabled: true,
                    setTrackSwitchModeFor: ['audio', 'alwaysReplace'],
                    setTextDefaultEnabled : false
                },
                hls: {
                    withCredentials: true,
                    overrideNative: true,
                    allowSeeksWithinUnsafeLiveWindow: true,
                    smoothQualityChange: true
                },
                nativeVideoTracks: false,
                nativeAudioTracks: false
            },
            controlBar: {
                liveDisplay: false,
                currentTimeDisplay: false,
                timeDivider: false,
                durationDisplay: false,
                remainingTimeDisplay: false,
                volumeMenuButton: false,
                volumePanel: false,
                pitchMenuButton: false,
                playToggle: false,
                fullscreenToggle: false,
                setThumbnailButton: true,
                audioTrackButton: false,
                captionsButton: false,
                subtitles: false,
                chaptersButton: false,
                descriptionsButton: false,
                subsCapsButton: false,
                customControlSpacer: false,
                playbackRateMenuButton: false,
                disableVideoButton: true
            },
            inactivityTimeout: 0,
            controls: true,
            autoplay: this.autoPlay,
            preload: this.simpleMode ? 'none' : 'auto',
            muted: this.muted,
            bigPlayButton: false,
            poster: this.simpleMode ? '' : this.posterProvider.getPosterUrl(),
            textTrackSettings: true,
            loop: this.repeatMode,
            resizeManager: true,
            errorDisplay: true,
            language: lang,
            plugins: plugins,
            userActions: {
                doubleClick: !this.simpleMode
            }
        }, function () {
            componentRef.subControlBarProvider.initSubControlBar();
            componentRef.formatProvider.handleVideoFormat();
            if (!componentRef.simpleMode && componentRef.subtitles) {
                componentRef.subtitlesProvider.initSubtitles();
            }
            this.currentTime(componentRef.currentTime);
            // for hide big play button after progress click
            componentRef.player.controlBar.progressControl.one('mouseup', function () {
                componentRef.player.addClass('vjs-has-started');
            });
            componentRef.player.cinemaMode = componentRef.cinemaMode;
            if (!componentRef.simpleMode) { // set focus on player
                componentRef.focusProvider.isFocused = true;
                componentRef.cdr.detectChanges();
            }
            componentRef.whenPlayerReady().then(() => {
                componentRef.setStylesForLoader();
            });
        });

        if (this.restrictedContentProvider.isRestricted()) {
            componentRef.restrictedContentProvider.showRestrictedPoster();
            return;
        }

        this.errorProvider.handleEmptySrc();
        this.eventsHandlerProvider.init();
        this.simpleMode || this.markersProvider.init();

        this.player.componentContext = this;
        if (this.isLive && this.type == ItemTypes.AUDIO) {
            this.liveProvider.initLive();
        }

        this.videojs.Html5DashJS && this.videojs.Html5DashJS.hook('beforeinitialize', function(player, mediaPlayer) {
            mediaPlayer.off('error');
            mediaPlayer.on('error', function(error){
                player.error(error.error)
            });
            // // Log MediaPlayer messages through video.js
            // var rememberSearch = '';                             // for px-3014
            // mediaPlayer.extend("RequestModifier", (player) => {
            //         return {
            //             modifyRequestHeader: xhr => {
            //                 // do xhr.setRequestHeader type stuff here ...
            //                 debugger
            //                 xhr.withCredentials = true;
            //                 return xhr;
            //             },
            //             modifyRequestURL: url => {
            //                 // modify url as you need - add querystring etc ...
            //                 debugger
            //                 var parser = document.createElement('a');
            //                 parser.href = url;
            //                 if (!parser.search) {
            //                     url = url + rememberSearch;
            //                 } else {
            //                     rememberSearch = parser.search;
            //                 }
            //                 return url;
            //             }
            //         };
            //     },
            //     true
            // );
        });

        //replace overlays within player wrapper for correct layout
        this.player.el().append(this.playerOpeningElement.nativeElement);
        this.player.el().append(this.disableVideoWrap.nativeElement);

        //set custom(@input) aspect ratio
        if (this.aspectRatio){
            this.player.customAspect = this.parseAspectRatio();
        }

        this.initPitchRatio(this.player);
    }

    public addAudioWaveformImage(audioWaveformImage) {
        if (this.type == ItemTypes.AUDIO) {
            let container = $('[data-imfx-id=' + 'imfx-video-' + this.internalId + ']')[0];
            $('<div class="imfx-audio-wave"' +
                'style="position: absolute; width: 100%; background: url(' + audioWaveformImage.Url + '); background-size: 100% 100%; background-repeat: no-repeat;' +
                '"></div>').insertAfter($(container).find('.vjs-poster'));
        }
    }

    public toggleAudioIcon(show: boolean) {
        if (this.type == ItemTypes.AUDIO) {
            if ($('[data-imfx-id=' + 'imfx-video-' + this.internalId + ']')[0]) {
                let container = $('[data-imfx-id=' + 'imfx-video-' + this.internalId + ']')[0];
                if ($(container).find('.imfx-audio-icon')[0]) {
                    if (show && !$($(container).find('.imfx-audio-icon')[0]).is(":visible")) {
                        $($(container).find('.imfx-audio-icon')[0]).show();
                        this.cdr.detectChanges();
                    }
                    else if (!show && $($(container).find('.imfx-audio-icon')[0]).is(":visible")) {
                        $($(container).find('.imfx-audio-icon')[0]).hide();
                        this.cdr.detectChanges();
                    }
                }
                else if (show) {
                    $('<div class="imfx-audio-icon"><i class="icons-volume-high icon volume-high"></i></div>').insertAfter($(container).find('.vjs-poster'));
                    this.cdr.detectChanges();
                    this.resizeProvider.resizePlayerChildByClass('imfx-audio-icon');
                }
            }

        }
    }

    // Implementation of public methods declared in IMFXHtmlPlayerInterface

    public setTimecode(tc: string) {
        if (!this.isPlayerDataLoaded) {
            return;
        }

        this.player.posterImage.hide();
        let timecodeFormat = TimeCodeFormat[this.videoDetails.TimecodeFormat];
        let time = TMDTimecode.fromString(tc, timecodeFormat).substract(TMDTimecode.fromFrames(this.som, timecodeFormat)).toSeconds();
        if (this.isLive && this.type == ItemTypes.AUDIO) {
            this.liveProvider.onChangeRange(time);
        } else {
            this.player.currentTime(time);
        }
    }

    public setTimecodeFrames(frame: number) {
        if (!this.isPlayerDataLoaded) {
            return;
        }

        this.player.posterImage.hide();
        let timecodeFormat = TimeCodeFormat[this.videoDetails.TimecodeFormat];
        let time = TMDTimecode.fromFrames(frame, timecodeFormat).substract(TMDTimecode.fromFrames(this.som, timecodeFormat)).toSeconds();
        if (this.isLive && this.type == ItemTypes.AUDIO) {
            this.liveProvider.onChangeRange(time);
        } else {
            this.player.currentTime(time);
        }
    }

    public setTimecodeMs(ms: number) {
        if (!this.isPlayerDataLoaded) {
            return;
        }

        this.player.posterImage.hide();
        let timecodeFormat = TimeCodeFormat[this.videoDetails.TimecodeFormat];
        let time = TMDTimecode.fromMillisecondsOld(ms, timecodeFormat).toSeconds();
        if (this.isLive && this.type == ItemTypes.AUDIO) {
            this.liveProvider.onChangeRange(time);
        } else {
            this.player.currentTime(time);
        }
    }

    public setPercent(percent: number) {
        this.player.posterImage.hide();
        this.player.currentTime(this.player.duration() * percent);
    }

    public setMarkers(o: any): Promise<any> {
        return this.whenPlayerReady().then(() => {
            this.markersProvider.setMarkers(o);
        });
    };

    // clear markers from player
    public clearMarkers(clearPoints: 0) {
        return this.whenPlayerReady().then(() => {
            this.clipsProvider.clear(clearPoints);
        });
    };
    // set clip buttons state on player
    public selectClipStateBtns(withGoInOut = false) {
        return this.whenPlayerReady().then(() => {
            this.clipsProvider.selectClipState(withGoInOut);
        });
    };
    public clearClipBntsState() {
        this.clipsProvider.clearState();
    };

    public disableAllMarkersButtons() {
        this.clipsProvider.disableAllMarkersButtons();
    };

    public setDisablesStatusSomEomBtns(isDisabled) {
        this.clipsProvider.setDisablesStatusSomEomBtns(isDisabled);
    };

    public resetReplaceIdx() {
        this.clipsProvider.resetReplaceIdx();
    };

    public setTimedText(url) {
        let scBar = this.player.controlBar.getChildById ? this.player.controlBar.getChildById("sub_control_bar") : null;
        if (scBar) {
            // if (this.player.componentContext.helperProvider.isSmoothStreaming(this.player.src())) { // is smooth
            let _index = -1;
            this.file.Subtitles.forEach(function (el, ind) {
                if (el.Url == url) {
                    _index = ind;
                }
            });
            scBar.getChildById('right_control_bar').getChildById('subtitleControl').setCurrentTimedTextByIndex(_index);
            // } else {
            //     scBar.getChildById('right_control_bar').getChildById('subtitleControl').setCurrentTimedTextByUrl(url);
            // }
        }
    }

    public setTimedTextById(id) {
        let scBar = this.player.controlBar.getChildById ? this.player.controlBar.getChildById("sub_control_bar") : null;
        if (scBar) {
            // if (this.player.componentContext.helperProvider.isSmoothStreaming(this.player.src())) { // is smooth
            let _index = -1;
            this.file.Subtitles.forEach(function (el, ind) {
                if (el.Id == id) {
                    _index = ind;
                }
            });
            scBar.getChildById('right_control_bar').getChildById('subtitleControl').setCurrentTimedTextByIndex(_index);
        }
    }

    public setAudioTrackByIndex(index) {
        let scBar = this.player.controlBar.getChildById ? this.player.controlBar.getChildById("sub_control_bar") : null;
        if (scBar) {
            scBar.getChildById('right_control_bar').getChildById('audioTracksControl').setCurrentAudioByIndex(index);
        }
    }
    public getInOutTimecodesFromPlayer(replace?: boolean) {
        if (this.isPlayerDataLoaded) {
            this.clipsProvider.getInOutPoint(replace);
        } else {
            !replace && this.clipAdded.emit({}); // if player don't ready -> add empty clip
        }
    }
    public addClipFromPlayer(replace?: boolean) {
        return this.whenPlayerReady().then(() => {
            this.clipsProvider.add(replace);
        });
    }

    private destroyPlayer() {
        this.timecodeControlsProvider.clearTimecodeUpdateInterval();
        if (this.player && this.player.el_) {
            this.player.muted(true);
            this.player.pause();
            this.player.surfer && this.player.surfer.pause();
            this.player.dispose();
            delete this.videojs.players['imfx-video-' + this.internalId]
            this.isPlaying = false;
            this.getVideoInfoSubscription && this.getVideoInfoSubscription.unsubscribe();
            //--clear in put vals in storage
            let st = this.clipboardProvider.pasteLocal();
            if (!st) { return; }
            delete st.inTc;
            delete st.outTc;
            this.clipboardProvider.copyLocal(st);
            //---end
        }
    }

    public refresh() {
        this.requirePlugins();
        let cinemaMode = this.player.cinemaMode;
        this.getVideoInfoSubscription && this.getVideoInfoSubscription.unsubscribe();
        this.timecodeControlsProvider.clearTimecodeUpdateInterval();
        if(this.player.player_) {
            this.player.dispose();
        }
        this.waveformProvider.destroy();
        if($('#vjs-wrapper-' + this.internalId).find('video').length == 0) {
            $('#vjs-wrapper-' + this.internalId).prepend('<video id="imfx-video-' + this.internalId + '" data-imfx-id="imfx-video-' + this.internalId + '" class="video-js vjs-default-skin vjs-big-play-centered">' +
                '    <p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>' +
                '  </video>')
        }
        this.isPlaying = false;
        this.viewInit();
        this.player.cinemaMode = cinemaMode;
    }

    public refreshDemoPlayer(videoDetails) {
        this.externalVideoDetails = videoDetails;
        this.refresh();
    }

    public getTvStandart() {
        return this.file.TV_STD;
    }

    public getCurrentTimecodeString () {
        let tcStr;

        tcStr = this.timecodeProvider.getTimecodeString(
            this.player.currentTime(),
            TimeCodeFormat[this.videoDetails.TimecodeFormat],
            this.som);

        return tcStr;
    }

    handleClickPlayerMenuButton(source) {
        let btns = this.player.controlBar.getChildById("sub_control_bar").getChildById("right_control_bar").children();
        btns.forEach(el => {
            if (PlayerConstants.menuPopupButtons.indexOf(el.id()) >= 0 && el.id() != source) {
                el.hideMenu();
            }
        });
    }

    private finalAction;
    private isToggleBlocked = false;
    private playPromise: Promise<any>; //ZoneAwarePromise

    public togglePlay (playOn: boolean = false) {
        if  (this.isToggleBlocked ||
            (this.finalAction == playOn && this.isPlayerDataLoaded && !this.player.paused() ==  playOn)) {
            return;
        }

        this.finalAction = playOn;

        if (playOn) {
            this.playPromise = this.whenPlayerReady().then(() => {
                return this.player.play();
            });

        } else {
            if (this.playPromise
                && (this.playPromise instanceof Promise)
                && (<any>this.playPromise).hasOwnProperty('__zone_symbol__state')
                && !(<any>this.playPromise).__zone_symbol__state) {
                this.isToggleBlocked = true;
                this.playPromise.then(() => {
                    !this.finalAction && this.player.pause();
                    this.isToggleBlocked = false;
                }, () => {
                    this.isToggleBlocked = false;
                })
            } else {
                this.player.pause();
            }
        }
    }


    public whenPlayerReady() {
        return new Promise((resolve, reject) => {
            if (this.isPlayerDataLoaded) {
                resolve();
            } else {
                this.playerReady
                    .pipe(
                        take(1),
                        takeUntil(this.destroyed$)
                    ).subscribe((data) => {
                        resolve();
                    });
            }
        });
    }
    public hideElem() {
        this.playerEnabledInPopout = true;
        this.player.pause();
        $(this.player.el().parentElement).hide();
        $(this.player.el()).parents('html-player').find('#not-available').show();
    }
    public showElem() {
        this.playerEnabledInPopout = false;
        $(this.player.el().parentElement).show();
        $(this.player.el()).parents('html-player').find('#not-available').hide();
    }
    private setStylesForLoader() {
        $(this.player.el()).find('.vjs-loading-spinner').removeClass('vjs-loading-spinner').addClass('vjs-loading-spinner-wrapper');
        $(this.player.el()).find('.vjs-loading-spinner-wrapper .vjs-control-text').removeClass('vjs-control-text').addClass('vjs-loading-spinner');
        $(this.player.el()).find('.vjs-loading-spinner').text('');
    }

    saveThumbnail(type : 'version' | 'media' | 'title', targetId, data) {
        this.htmlPlayerService.saveAsNewThumbnail(type, targetId, data).subscribe((resp: HttpResponse<UploadResponseModel>) => {
            this.thumbnailUpdated.emit({
                result: resp.body,
                type: type
            });
            this.notificationService.notifyShow(1, this.translate.instant('player.thumbnail.t_success'), true);
        }, (err) => {
            this.notificationService.notifyShow(2, this.translate.instant('player.thumbnail.t_wrong'), true);
        });
    }
}
