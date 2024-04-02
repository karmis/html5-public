import { ClipsProvider } from './clips.provider';
import { AbstractPlayerProvider } from './abstract.player.provider';
import { ItemTypes } from '../item.types';
import { Injectable } from '@angular/core';
import { HelperProvider } from './helper.provider';
import { TranslateService } from '@ngx-translate/core';
import { IMFXHtmlPlayerComponent } from '../imfx.html.player';
import { RestrictedContentProvider } from "./restricted.content.provider";
import { TimeCodeFormat, TMDTimecode } from "../../../../utils/tmd.timecode";
import {SecurityService} from "../../../../services/security/security.service";

@Injectable()
export class PluginsProvider extends AbstractPlayerProvider {

    constructor(private helperProvider: HelperProvider,
                private clipProvider: ClipsProvider,
                private securityService: SecurityService,
                private restrictedContentProvider: RestrictedContentProvider,
                private translate: TranslateService) {
        super();
    }

    public setComponentRef(ref: IMFXHtmlPlayerComponent) {
        super.setComponentRef(ref);
        this.clipProvider.moduleContext = this.componentRef;
    }

    public getPlugins(o: {
        clipBtns: boolean,
        cinemaMode: any,
        disabledClipBtns?: boolean,
        clipBtnsCallback?: any
    }) {
        if (this.componentRef.simpleMode && !this.componentRef.isLive || this.restrictedContentProvider.isRestricted())
            return {
                bigplaybutton: {
                    title: this.translate.instant('player.play')
                }
            };

        let plugins = this.getDefaultPluginsConfig();
        // if (this.componentRef.type == ItemTypes.AUDIO && this.helperProvider.doesBrowserSupportWebAudioAPI()) {
        //   plugins = Object.assign(plugins, {
        //     wavesurfer: this.getWavesurferConfig()
        //   });
        // }

        if (o.clipBtns) {
            plugins = Object.assign(plugins, {
                clippingbuttons: this.getClipsButtons(o.disabledClipBtns, o.clipBtnsCallback)
            });
        }
        if (o.cinemaMode) {
            plugins = Object.assign(plugins, {
                cinemamodebutton: Object.assign(o.cinemaMode, {
                    cinemaModeTitle: this.translate.instant('player.cinemamode'),
                    nonCinemaModeTitle: this.translate.instant('player.non_cinemamode')
                })
            });
        }
        return plugins;
    }

    private getDefaultPluginsConfig() {
        let tcCtrlsProvider = (<any>this.componentRef).timecodeControlsProvider;
        let tcProvider = tcCtrlsProvider.timecodeProvider;
        let plugins = {
            bigplaybutton: {
                title: this.translate.instant('player.play')
            },
            playbutton: {
                pauseTitle: this.translate.instant('player.pause'),
                playTitle: this.translate.instant('player.play')
            },
            volumemenubutton: {
                muteTitle: this.translate.instant('player.mute'),
                unmuteTitle: this.translate.instant('player.unmute')
            },
            timecodecontrol: {
                getFrameRate: () => {
                    return TMDTimecode.getFrameRate(TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat]).frameRate;
                }
            },
            // offset: {
            //     start: 0, // Start offset in seconds
            //     // end: 0,    //End offset in seconds
            //     // restart_beginning: false //Should the video go to the beginning when it ends
            // },
            playbackSlider: {
                // getFps: ()=>this.componentRef.frameRate,
                getFpsInSec: () => {
                    return tcProvider.getFrameToMillisecond(TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat]) / 1000;
                },
                getCurrentTimecodeInFrames: (time) => {
                    return tcProvider.getFramesFromTimecode(time || this.componentRef.player.currentTime(), TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat], this.componentRef.som);
                },
                setCurrentTimeFromFrames: (frames) => {
                    let ms = tcProvider.getMillisecondsFromFrames(frames, TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat], this.componentRef.som);
                    return ms / 1000;
                },
                makeBackwardFrame: () => {
                    tcCtrlsProvider.makeBackwardFrame();
                },
                makeForwardFrame: () => {
                    tcCtrlsProvider.makeForwardFrame();
                },
                getTimecodeFormat: () => {
                    return TMDTimecode.getFrameRate(TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat]).frameRate;
                },
                addfbfClass: 'fbf-smudge',
                stepsBack: [
                    {
                        icon: 'step-start',
                        text: this.translate.instant("player.start"),
                        step: "start"
                    },
                    {
                        icon: 'step-backward-1',
                        text: this.translate.instant("player.twenty_second_back"),
                        step: "second-backward"
                    },
                    {
                        icon: 'step-backward-2',
                        text: this.translate.instant("player.one_frame_back"),
                        step: -1
                    }
                ],
                stepsForward: [
                    {
                        icon: 'step-forward-2',
                        text: this.translate.instant("player.one_frame_forward"),
                        step: 1
                    },
                    {
                        icon: 'step-forward-1',
                        text: this.translate.instant("player.twenty_second_forward"),
                        step: "second-forward"
                    },
                    {
                        icon: 'step-end',
                        text: this.translate.instant("player.end"),
                        step: "end"
                    }
                ]
            },
            repeatbutton: {
                repeatTitle: this.translate.instant('player.repeat'),
            },
            fullscreenbutton: {
                fullscreenTitle: this.translate.instant('player.fullscreen'),
                nonFullscreenTitle: this.translate.instant('player.non_fullscreen')
            },
            setthumbnailbutton: (this.componentRef.type == ItemTypes.AUDIO &&
            (this.securityService.hasPermissionByName('set-media-thumb') ||
                this.securityService.hasPermissionByName('set-version-thumb') ||
                this.securityService.hasPermissionByName('set-series-thumb'))) ? false : {
                title: this.translate.instant('player.get_frame'),
                allowVersion: this.securityService.hasPermissionByName('set-version-thumb'),
                allowMedia: this.securityService.hasPermissionByName('set-media-thumb'),
                allowSeries: this.securityService.hasPermissionByName('set-series-thumb'),
            },
            audiotrackbutton: {
                title: this.translate.instant('player.audiotracks')
            },
            subtitlesbutton: {
                title: this.translate.instant('player.closed_captions'),
                titleCCOff: this.translate.instant('player.closed_captions_off')
            },
            overlaybutton: (this.componentRef.type == ItemTypes.AUDIO) ? false : {
                title: this.translate.instant('player.overlay')
            },
            aspectratiobutton: (this.componentRef.type == ItemTypes.AUDIO) ? false : {
                title: this.translate.instant('player.aspect')
            },
            playersettingsbutton: {
                settingsTitle: this.translate.instant('player.settings'),
            },
            copytimecodebutton: {
                title: this.translate.instant('player.copy_timecode'),
            },
            relatedaudiovolumeslider: {
                switchText: this.translate.instant('player.relatedAudio.switchText'),
                switchTitle: this.translate.instant('player.relatedAudio.switchTitle'),
                sliderText: this.translate.instant('player.relatedAudio.sliderText')
            },
            disablevideobutton: {
                title: this.translate.instant('player.disable_video_button'),
            },
            pitchmenubutton: {
                pitchTitle: this.translate.instant('player.pitch'),
            },
            vr: {
                projection: 'AUTO' // change it to '360' for 360° videos // https://yt.tmd.tv/issue/px-4239
            },
            qualitybutton: {},
            // hlsQualitySelector:{}
        };
        if (!this.componentRef.isLive && this.componentRef.typeDetails == 'clip-editor') {
            (<any>plugins).segment = {};
        }
        return plugins;
    }

    private getWavesurferConfig() {
        return {
            src: this.componentRef.src,
            msDisplayMax: 10,
            debug: false,
            waveColor: 'grey',
            progressColor: 'black',
            cursorColor: 'black',
            hideScrollbar: true
        }
    }

    private getClipsButtons(disabledBtns, callback?) {
        let btns = [
            {
                text: "Mark In",
                onClick: null,
                // onClick: this.clipProvider.setIn,
                id: "markin",
                disabled: disabledBtns || false
            },
            {
                text: "Mark Out",
                onClick: null,
                // onClick: this.clipProvider.setOut,
                id: "markout",
                disabled: disabledBtns || false
            },
            {
                text: "Mark Frame",
                onClick: null,
                // onClick: this.clipProvider.markframe,
                id: "markframe",
                disabled: disabledBtns || false
            },
            // {
            //   text: "Add",
            //   onClick: this.clipProvider.add,
            //   id: "addclip",
            //   disabled: disabledBtns || true
            // },
            // {
            //   text: "Replace",
            //   onClick: this.clipProvider.add,
            //   id: "replaceclip",
            //   disabled: disabledBtns || true
            // },
            {
                text: "Mark Segment",
                onClick: null,
                // onClick: this.clipProvider.markSegment,
                id: "marksegment",
                disabled: disabledBtns || true
            },
            {
                text: "Go To In",
                onClick: null,
                // onClick: this.clipProvider.goToIn,
                id: "gotoin",
                disabled: disabledBtns || true
            },
            {
                text: "Go To Out",
                onClick: null,
                // onClick: this.clipProvider.goToOut,
                id: "gotoout",
                disabled: disabledBtns || true
            },
            {
                text: "Clear",
                onClick: null,
                // onClick: this.clipProvider.clear,
                id: "clearclip",
                disabled: disabledBtns || false
            },
            {
                text: "Set Media SOM",
                onClick: null,
                // onClick: this.clipProvider.clear,
                id: "setsom",
                disabled: disabledBtns || false
            },
            {
                text: "Set Media EOM",
                onClick: null,
                // onClick: this.clipProvider.clear,
                id: "seteom",
                disabled: disabledBtns || false
            }
        ];
        callback && (btns = callback.call(this, btns));
        return {btns: btns};
    }

    private getEmptyClipsButtons() {
        let btns = [];
        return {btns: btns};
    }

    public refreshClipBtnsPlugin(setBtns: boolean) {
        let btns = this.getEmptyClipsButtons();
        if (setBtns) {
            btns = this.getClipsButtons(this.componentRef.disabledClipBtns, this.componentRef.clipBtnsCallback);
        }
        this.componentRef.player && this.componentRef.player.clippingbuttons(btns);
    }
}
